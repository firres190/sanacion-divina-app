// api/login.js
const crypto = require('crypto');
const { query } = require('./_db');

const CONTRASENA_ACCESO = process.env.CONTRASENA_ACCESO || 'SANACION2026';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    if (password.trim().toUpperCase() !== CONTRASENA_ACCESO) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const result = await query(
      'SELECT * FROM compradores WHERE email = $1 AND activo = true',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No encontramos una compra con ese correo. Revisa que sea el mismo que usaste en Hotmart.' });
    }

    const comprador = result.rows[0];

    if (!comprador.fecha_inicio_novena) {
      await query(
        'UPDATE compradores SET fecha_inicio_novena = NOW(), dia_actual = 1 WHERE id = $1',
        [comprador.id]
      );
      comprador.fecha_inicio_novena = new Date();
      comprador.dia_actual = 1;
    }

    const diaDesbloqueado = calcularDiaDesbloqueado(comprador.fecha_inicio_novena);

    const sessionToken = crypto
      .createHash('sha256')
      .update(`${comprador.email}-${comprador.id}-${process.env.SESSION_SECRET}`)
      .digest('hex');

    return res.status(200).json({
      success: true,
      sessionToken,
      email: comprador.email,
      santoId: comprador.santo_id,
      diaDesbloqueado,
      diasCompletados: comprador.dias_completados || [],
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};

function calcularDiaDesbloqueado(fechaInicio) {
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
  const diaDesbloqueado = Math.min(diffDias + 1, 9);
  return Math.max(diaDesbloqueado, 1);
}
