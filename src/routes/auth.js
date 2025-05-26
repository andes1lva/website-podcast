const querystring = require('querystring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const { pool } = require('../config/db');
const { registerSchema, loginSchema } = require('../utils/validator');
const { logger } = require('../utils/logger');
const errorHandler = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'As_Esferas_Do_Dragão';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.error(`[AUTH] Erro ao verificar token: ${err.message}`);
    return null;
  }
}

module.exports = async (req, res) => {
  const { pathname } = require('url').parse(req.url, true);

  if (req.method !== 'POST') {
    logger.warn(`[AUTH] Método não permitido: ${req.method} ${pathname}`);
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Método não permitido' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body);
      logger.info(`[AUTH] Dados recebidos (JSON): ${JSON.stringify(data)}`);
    } catch {
      data = querystring.parse(body);
      logger.info(`[AUTH] Dados recebidos (URL-encoded): ${JSON.stringify(data)}`);
    }

    try {
      if (pathname === '/register') {
        logger.info('[AUTH] Iniciando processo de registro...');
        const { error } = registerSchema.validate(data);
        if (error) {
          logger.warn(`[AUTH] Erro de validação: ${error.details[0].message}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.details[0].message }));
          return;
        }

        const { username, password, confirm_password, email, address } = data;
        if (password !== confirm_password) {
          logger.warn('[AUTH] Erro: senhas não coincidem');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'As senhas não coincidem' }));
          return;
        }

        const sanitizedUsername = sanitizeHtml(username);
        const sanitizedAddress = address ? sanitizeHtml(address) : null;
        logger.info(`[AUTH] Dados sanitizados:`, { sanitizedUsername, email, sanitizedAddress });

        const [existingUser] = await pool.query(
          'SELECT id FROM Users WHERE username = ? OR email = ?',
          [sanitizedUsername, email]
        );
        if (existingUser.length > 0) {
          logger.warn(`[AUTH] Usuário ou email já registrado: ${sanitizedUsername}, ${email}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
          return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        logger.info('[AUTH] Hash da senha gerado com sucesso');

        const [result] = await pool.query(
          'INSERT INTO Users (username, password, email, address) VALUES (?, ?, ?, ?)',
          [sanitizedUsername, hashedPassword, email, sanitizedAddress]
        );
        logger.info(`[AUTH] Usuário inserido com sucesso: ${sanitizedUsername}, ID: ${result.insertId}`);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Usuário registrado com sucesso!' }));
      } else if (pathname === '/login') {
        logger.info('[AUTH] Iniciando processo de login...');
        const { error } = loginSchema.validate(data);
        if (error) {
          logger.warn(`[AUTH] Erro de validação: ${error.details[0].message}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.details[0].message }));
          return;
        }

        const { email, password } = data;
        const [users] = await pool.query(
          'SELECT id, username, password, is_active FROM Users WHERE email = ?',
          [email]
        );
        if (users.length === 0) {
          logger.warn(`[AUTH] Usuário não encontrado: ${email}`);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
          return;
        }

        const user = users[0];
        if (!user.is_active) {
          logger.warn(`[AUTH] Conta desativada: ${email}`);
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Conta desativada' }));
          return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          logger.warn(`[AUTH] Senha inválida: ${email}`);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
          return;
        }

        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        logger.info(`[AUTH] Token JWT gerado para ${user.username}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Usuário autenticado com sucesso!',
          token,
          userId: user.id,
          redirectURL: '/menu'
        }));
      } else {
        logger.warn(`[AUTH] Rota POST não encontrada: ${pathname}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
      }
    } catch (error) {
      logger.error(`[AUTH] Erro no servidor: ${error.message}`, { stack: error.stack });
      errorHandler(error, res);
    }
  });
};