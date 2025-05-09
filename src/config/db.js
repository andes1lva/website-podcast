const mysql = require('mysql2/promise');

console.log('[DB] Iniciando configuração do banco de dados...');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'A1b2c3d4e5@',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('[DB] Pool de conexões criado. Configuração:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT
});

async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('[DB] Conexão com MySQL estabelecida com sucesso!');

    // Criar o banco se não existir
    console.log('[DB] Verificando existência do banco webpodcast...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS webpodcast`);
    await connection.query(`USE webpodcast`);
    console.log('[DB] Banco webpodcast pronto para uso.');

    // Verificar se a tabela Users existe
    console.log('[DB] Verificando existência da tabela Users...');
    const [tables] = await connection.query(`SHOW TABLES LIKE 'Users'`);

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
  } catch (error) {
    console.error('[DB] Erro ao conectar ou configurar o MySQL:', error.message);
    console.error('[DB] Stack:', error.stack);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('[DB] Conexão liberada.');
    }
  }
}

// Inicializar o banco
initializeDatabase().catch(error => {
  console.error('[DB] Falha na inicialização do banco de dados:', error.message);
  process.exit(1);
});

module.exports = { pool };