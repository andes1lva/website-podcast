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
                      cpf VARCHAR(14) NOT NULL UNIQUE, -- Faltava este campo aqui!
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


// Dentro do seu db.js

/**
 * Insere um novo usuário com os campos atualizados
 */
async function addUser(userData) {
  const { username, cpf, email, password, address } = userData;
  
  // A query agora inclui o campo cpf
  const sql = `
    INSERT INTO Users (username, cpf, email, password, address) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  try {
    // O pool gerencia a abertura e fechamento da conexão automaticamente
    const [result] = await pool.query(sql, [username, cpf, email, password, address]);
    
    logger.info(`[DB] Sucesso: Usuário ${username} (CPF: ${cpf}) inserido. ID: ${result.insertId}`);
    return result;
  } catch (error) {
    // Tratamento de erros específicos (ex: CPF ou Email duplicado)
    if (error.code === 'ER_DUP_ENTRY') {
        logger.warn(`[DB] Tentativa de cadastro duplicado: ${error.message}`);
        throw new Error('Usuário ou CPF já cadastrado.');
    }
    
    logger.error(`[DB] Erro na inserção: ${error.message}`);
    throw error;
  }
}

module.exports = { pool, addUser };





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