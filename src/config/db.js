// Importa o módulo pg (PostgreSQL) para interagir com o Supabase
const { Pool } = require('pg');
// Importa o logger para registrar eventos e erros
const { logger } = require('../utils/logger');

// Loga o início da configuração do banco
logger.info('[DB] Iniciando configuração do banco de dados...');

// Cria um pool de conexões PostgreSQL para gerenciar múltiplas conexões
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'helenaemaite1718staging',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.connect();
    logger.info('[DB] Conexão com PostgreSQL (Supabase) estabelecida com sucesso!');
    
    // No Supabase/Postgres o banco 'postgres' já vem criado por padrão, não precisamos de CREATE DATABASE ou USE.
    
    // Checa se a tabela 'users' já existe no schema público do Postgres
    const tableCheck = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      logger.warn('[DB] Tabela users não encontrada. Criando...');
      
      // Criação da tabela adaptada para a sintaxe do PostgreSQL
      await connection.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL, 
          address TEXT,
          role VARCHAR(50) DEFAULT 'user', 
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE
        )
      `);
      logger.info('[DB] Tabela users criada com sucesso.');
    } else {
      logger.info('[DB] Tabela users pronta.');
    }
  } catch (error) {
    logger.error(`[DB] Erro na configuração: ${error.message}`);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Função para inserir no Banco
const addUser = async (username, email, password, address) => {
  const validAddress =
    address && String(address).trim() !== ''
      ? String(address).trim()
      : null;

  const sql = `
    INSERT INTO public.users
      (username, email, password, address, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, address, role
  `;

  try {
    const result = await pool.query(sql, [
      username,
      email,
      password, // A rota deve passar o hash da senha, não a senha original.
      validAddress,
      'user',
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('[ERRO SQL NO CADASTRO]', {
      code: error.code,
      message: error.message,
      detail: error.detail,
    });
    throw error;
  }
};


// Função para consulta ao banco
const findUserByEmail = async (email) => {
  // No PostgreSQL mudamos o "?" por "\$1"
  const sql = `SELECT * FROM users WHERE email = \$1 LIMIT 1`;
 
  try {
    const result = await pool.query(sql, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.log("ERRO SQL NO LOGIN: ", err.message);
    throw err;
  }
};

// Inicialização automática
initializeDatabase().catch(error => {
  logger.error(`[DB] Falha crítica: ${error.message}`);
  process.exit(1);
});

module.exports = { 
    addUser, 
    pool,
    initializeDatabase,
    findUserByEmail
};
