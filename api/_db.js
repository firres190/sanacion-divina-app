// api/_db.js
// Helper compartido para conexión a Neon Postgres (driver directo, no Data API)
const { Pool } = require('@neondatabase/serverless');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function query(text, params) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result;
}

module.exports = { query };
