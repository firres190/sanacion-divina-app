// api/webhook-hotmart.js
const { query } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = req.body;

    const status = payload?.data?.purchase?.status;
    const email = payload?.data?.buyer?.email;
    const transactionId = payload?.data?.purchase?.transaction;

    if (status !== 'APPROVED' && status !== 'COMPLETE') {
      return res.status(200).json({ message: 'Evento recibido, sin acción (no aprobado aún)' });
    }

    if (!email) {
      return res.status(400).json({ error: 'No se recibió el correo del comprador' });
    }

    const existente = await query('SELECT id FROM compradores WHERE email = $1', [email.trim().toLowerCase()]);

    if (existente.rows.length > 0) {
      return res.status(200).json({ message: 'Comprador ya registrado previamente' });
    }

    await query(
      `INSERT INTO compradores (email, santo_id, hotmart_transaction)
       VALUES ($1, $2, $3)`,
      [email.trim().toLowerCase(), 'san-rafael', transactionId]
    );

    return res.status(200).json({ message: 'Comprador registrado correctamente' });
  } catch (error) {
    console.error('Error en webhook-hotmart:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
};
