// api/alternar-favorito.js
const crypto = require('crypto');
const { query } = require('./_db');

function verificarSesion(sessionToken, compradores) {
  return compradores.find((c) => {
    const tokenEsperado = crypto
      .createHash('sha256')
      .update(`${c.email}-${c.id}-${process.env.SESSION_SECRET}`)
      .digest('hex');
    return tokenEsperado === sessionToken;
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { sessionToken, dia } = req.body;

    if (!sessionToken || !dia) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const resultado = await query('SELECT * FROM compradores WHERE activo = true');
    const comprador = verificarSesion(sessionToken, resultado.rows);

    if (!comprador) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    const existente = await query(
      'SELECT id FROM favoritos WHERE email = $1 AND dia = $2',
      [comprador.email, dia]
    );

    let guardado;

    if (existente.rows.length > 0) {
      await query('DELETE FROM favoritos WHERE email = $1 AND dia = $2', [comprador.email, dia]);
      guardado = false;
    } else {
      await query('INSERT INTO favoritos (email, dia) VALUES ($1, $2)', [comprador.email, dia]);
      guardado = true;
    }

    return res.status(200).json({ success: true, guardado });
  } catch (error) {
    console.error('Error en alternar-favorito:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
