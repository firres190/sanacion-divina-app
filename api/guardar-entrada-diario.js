// api/guardar-entrada-diario.js
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
    const { sessionToken, contenido } = req.body;

    if (!sessionToken || !contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'Falta el contenido de la entrada' });
    }

    const resultado = await query('SELECT * FROM compradores WHERE activo = true');
    const comprador = verificarSesion(sessionToken, resultado.rows);

    if (!comprador) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    const insertado = await query(
      'INSERT INTO entradas_diario (email, contenido) VALUES ($1, $2) RETURNING id, fecha_creacion',
      [comprador.email, contenido.trim()]
    );

    return res.status(200).json({
      success: true,
      id: insertado.rows[0].id,
      fechaCreacion: insertado.rows[0].fecha_creacion
    });
  } catch (error) {
    console.error('Error en guardar-entrada-diario:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
