// api/listar-favoritos.js
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
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Falta el token de sesión' });
    }

    const resultadoCompradores = await query('SELECT * FROM compradores WHERE activo = true');
    const comprador = verificarSesion(sessionToken, resultadoCompradores.rows);

    if (!comprador) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    const favoritos = await query(
      'SELECT dia, fecha_guardado FROM favoritos WHERE email = $1 ORDER BY dia ASC',
      [comprador.email]
    );

    return res.status(200).json({ favoritos: favoritos.rows });
  } catch (error) {
    console.error('Error en listar-favoritos:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
