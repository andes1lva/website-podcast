const mysql = require('mysql2/promise');
const { logger } = require('./src/utils/logger');

logger.info('[DB] Iniciando configuração do banco de dados...');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'A1b2c3d4e5@@@@@',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'webpodcast',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

logger.info('[DB] Pool de conexões criado. Configuração:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    logger.info('[DB] Conexão com MySQL estabelecida com sucesso!');

    // Criar banco de dados se não existir
    logger.info('[DB] Verificando existência do banco webpodcast...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    logger.info(`[DB] Banco ${process.env.DB_NAME} pronto para uso.`);

    // Criar tabela Users se não existir
    logger.info('[DB] Verificando existência da tabela Users...');
    const [tables] = await connection.query(`SHOW TABLES LIKE 'Users'`);
    if (tables.length === 0) {
      logger.warn('[DB] Tabela Users não encontrada. Criando...');
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
      logger.info('[DB] Tabela Users criada com sucesso.');
    } else {
      logger.info('[DB] Tabela Users encontrada no banco de dados.');
    }
  } catch (error) {
    logger.error(`[DB] Erro ao conectar ou configurar o MySQL: ${error.message}`, { stack: error.stack });
    throw error;
  } finally {
    if (connection) {
      connection.release();
      logger.info('[DB] Conexão liberada.');
    }
  }
}

// Inicializar o banco
initializeDatabase().catch(error => {
  logger.error(`[DB] Falha na inicialização do banco de dados: ${error.message}`);
  process.exit(1);
});

module.exports = { pool };