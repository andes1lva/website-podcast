// Importa o módulo mysql2 com suporte a Promises para interagir com o MySQL
const mysql = require('mysql2/promise');
// Importa o logger para registrar eventos e erros
const { logger } = require('../utils/logger'); // Corrigido de './src/utils/logger'

// Loga o início da configuração do banco
logger.info('[DB] Iniciando configuração do banco de dados...');

// Cria um pool de conexões MySQL para gerenciar múltiplas conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Host do MySQL (padrão: localhost)
  user: process.env.DB_USER || 'root',       // Usuário do MySQL
  password: process.env.DB_PASSWORD || 'A1b2c3d4e5@', // Senha
  port: process.env.DB_PORT || 3306,        // Porta padrão do MySQL
  database: process.env.DB_NAME || 'webpodcast', // Nome do banco
  waitForConnections: true,                 // Aguarda conexões disponíveis
  connectionLimit: 10,                      // Máximo de conexões simultâneas
  queueLimit: 0                             // Sem limite na fila de conexões
});

// Loga as configurações do pool
logger.info('[DB] Pool de conexões criado. Configuração:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  let connection;
  try {
    // Obtém uma conexão do pool
    connection = await pool.getConnection();
    logger.info('[DB] Conexão com MySQL estabelecida com sucesso!');
   
    // Cria o banco de dados se não existir
    logger.info('[DB] Verificando existência do banco webpodcast...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    logger.info(`[DB] Banco ${process.env.DB_NAME} pronto para uso.`);

    // Verifica se a tabela Users existe
    logger.info('[DB] Verificando existência da tabela Users...');
    const [tables] = await connection.query(`SHOW TABLES LIKE 'Users'`);
    if (tables.length === 0) {
      logger.warn('[DB] Tabela Users não encontrada. Criando...');
      // Cria a tabela Users com os campos necessários
      // ... dentro de initializeDatabase, no bloco do CREATE TABLE:
                  await connection.query(`
                   CREATE TABLE IF NOT EXISTS Users (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  username VARCHAR(255) NOT NULL,
                  cpf VARCHAR(14) NOT NULL UNIQUE, 
                  email VARCHAR(255) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL, 
                  address TEXT,
                  role ENUM('user', 'admin', 'podcaster') DEFAULT 'user', 
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
    // Loga erros de conexão ou criação
    logger.error(`[DB] Erro ao conectar ou configurar o MySQL: ${error.message}`, { stack: error.stack });
    throw error;
  } finally {
    // Libera a conexão
    if (connection) {
      connection.release();
      logger.info('[DB] Conexão liberada.');
    }
  }
}


/**
 * Insere um novo usuário com os campos atualizados
*/
// Exemplo de como deve estar no seu src/config/db.js
const addUser = (username, email, address, password) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Users (username, cpf, email, password, address, role) VALUES (?, ?, ?, ?, ?)`;
          pool.query(sql, [username, CPF, email, password, address, role], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


// Executa a inicialização e sai se houver erro
initializeDatabase().catch(error => {
  logger.error(`[DB] Falha na inicialização do banco de dados: ${error.message}`);
  process.exit(1);
});

// Exporta o pool para uso em outros módulos
module.exports = {
  pool, 
  addUser
};