const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Configure DATABASE_URL nas variáveis de ambiente do Render.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on('error', (error) => {
  console.error('[DB] Erro no pool:', error.message);
});

async function testarConexao() {
  await pool.query('SELECT 1');
  console.log('[DB] Conexão com PostgreSQL estabelecida.');
}

async function findUserByEmail(email) {
  const resultado = await pool.query(
    `SELECT id, username, email, password, address, role
     FROM public.users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  return resultado.rows[0] || null;
}

async function addUser({ username, email, passwordHash, address }) {
  const resultado = await pool.query(
    `INSERT INTO public.users
       (username, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, address, role`,
    [username, email, passwordHash, address || null, 'user']
  );

  return resultado.rows[0];
}

module.exports = {
  pool,
  testarConexao,
  findUserByEmail,
  addUser,
};
