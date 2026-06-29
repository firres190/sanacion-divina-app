// api/listar-entradas-diario.js
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

    const entradas = await query(
      'SELECT id, contenido, fecha_creacion FROM entradas_diario WHERE email = $1 ORDER BY fecha_creacion DESC',
      [comprador.email]
    );

    return res.status(200).json({ entradas: entradas.rows });
  } catch (error) {
    console.error('Error en listar-entradas-diario:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
