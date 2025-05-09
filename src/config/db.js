const mysql = require('mysql2/promise');

console.log('[DB] Iniciando configuração do banco de dados...');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'webpodcast',
  password: process.env.DB_PASSWORD || 'A1b2c3d4e5@',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('[DB] Pool de conexões criado. Configuração:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] Conexão com MySQL estabelecida com sucesso!');
    
    // Verificar se a tabela Users existe
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Users'
    `, [process.env.DB_NAME || 'webpodcast']);
    
    if (tables.length > 0) {
      console.log('[DB] Tabela Users encontrada no banco de dados.');
    } else {
      console.warn('[DB] Tabela Users não encontrada. Criando...');
      await connection.query(`
        CREATE TABLE Users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE
        )
      `);
      console.log('[DB] Tabela Users criada com sucesso.');
    }
    
    connection.release();
  } catch (error) {
    console.error('[DB] Erro ao conectar ao MySQL:', error.message);
    console.error('[DB] Stack:', error.stack);
    throw error;
  }
}

// Inicializar o banco
initializeDatabase().catch(error => {
  console.error('[DB] Falha na inicialização do banco de dados:', error.message);
  process.exit(1); // Encerra o processo se o banco não conectar
});

module.exports = { pool };