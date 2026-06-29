// api/actualizar-perfil.js
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
    const { sessionToken, nombre } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Falta el token de sesión' });
    }

    const resultado = await query('SELECT * FROM compradores WHERE activo = true');
    const comprador = verificarSesion(sessionToken, resultado.rows);

    if (!comprador) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    await query('UPDATE compradores SET nombre = $1 WHERE id = $2', [
      (nombre || '').trim().slice(0, 60),
      comprador.id
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en actualizar-perfil:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
