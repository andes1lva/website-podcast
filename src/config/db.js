// Importa o módulo mysql2 com suporte a Promises para interagir com o MySQL
const mysql = require('mysql2/promise');
// Importa o logger para registrar eventos e erros
const { logger } = require('../utils/logger');

// Loga o início da configuração do banco
logger.info('[DB] Iniciando configuração do banco de dados...');

// Cria um pool de conexões MySQL para gerenciar múltiplas conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'A1b2c3d4e5@',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'webpodcast',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    logger.info('[DB] Conexão com MySQL estabelecida com sucesso!');
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    const [tables] = await connection.query(`SHOW TABLES LIKE 'Users'`);
    if (tables.length === 0) {
      logger.warn('[DB] Tabela Users não encontrada. Criando...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS Users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          cpf VARCHAR(14) UNIQUE,
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
      logger.info('[DB] Tabela Users pronta.');
    }
  } catch (error) {
    logger.error(`[DB] Erro na configuração: ${error.message}`);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}




//função para inserir no Banco
const addUser = async (username, cpf, email, password, address) => {
    // Tratamento preventivo: Garante que campos opcionais vazios sejam NULL no MySQL
    const validCpf = (cpf && cpf.trim() !== "") ? cpf : null;
    const validAddress = (address && address.trim() !== "") ? address : null;

    const sql = `INSERT INTO Users (username, cpf, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [username, validCpf, email, password, validAddress, 'user'];

    try {
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (err) {
        // Log detalhado para o terminal do VS Code para sua análise pericial
        console.error('[ERRO SQL NO BACKEND]:', {
            mensagem: err.message,
            codigo: err.code,
            sqlState: err.sqlState
        });
        throw err; 
    }
};


//Função para consulta ao banco
const findUserByEmail = async (email ) => {
  
  const sql = `SELECT * FROM Users WHERE email = ? LIMIT 1`;
 
  try {
    const [rows] = await pool.execute(sql, [email]);

    return rows.length > 0 ? rows[0] : null;

  }catch (err){
    console.log("ERRO SQL NO LOGIN: ", err.mensagem);
    throw err;
  }
}




// Inicialização automática
initializeDatabase().catch(error => {
  logger.error(`[DB] Falha crítica: ${error.message}`);
  process.exit(1);
});

// Exportação como objeto para que o require { addUser } funcione corretamente
module.exports = { 
    addUser, 
    pool,
    initializeDatabase,
    findUserByEmail
};