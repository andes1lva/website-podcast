require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'webpodcast',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testar conexão e tabela
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com MySQL estabelecida!');

    // Verificar se a tabela Users existe
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'Users'"
    );
    if (tables.length === 0) {
      console.error('Tabela Users não encontrada! Execute schema.sql.');
    } else {
      console.log('Tabela Users encontrada.');
    }

    connection.release();
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    console.error('Detalhes:', err);
  }
}
initializeDatabase();

module.exports = { pool };