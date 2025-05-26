const querystring = require('querystring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const { pool } = require('../config/db');
const { registerSchema, loginSchema } = require('../utils/validator');
const { logger } = require('../utils/logger');
const errorHandler = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'As_Esferas_Do_Dragao';

module.exports = async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`); // Corrigido para usar URL

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Método não permitido' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => { body += chunk.toString(); });
  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      data = querystring.parse(body);
    }
    logger.info(`[AUTH] Dados recebidos: ${JSON.stringify(data)}`);

    try {
      if (pathname === '/signup') {
        const { error } = registerSchema.validate(data);
        if (error) {
          throw new Error(error.details[0].message); // Lança erro com mensagem
        }

        const { username, password, confirm_password, email, address } = data;
        if (password !== confirm_password) {
          throw new Error('As senhas não coincidem');
        }

        const sanitizedUsername = sanitizeHtml(username);
        const sanitizedAddress = address ? sanitizeHtml(address) : null;

        const [existingUser] = await pool.query(
          'SELECT id FROM Users WHERE username = ? OR email = ?',
          [sanitizedUsername, email]
        );
        if (existingUser.length > 0) {
          throw new Error('Usuário ou email já registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          'INSERT INTO Users (username, password, email, address) VALUES (?, ?, ?, ?)',
          [sanitizedUsername, hashedPassword, email, sanitizedAddress]
        );

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Registro bem-sucedido!' }));
      } else if (pathname === '/login') {
        const { error } = loginSchema.validate(data);
        if (error) {
          throw new Error(error.details[0].message);
        }

        const { email, password } = data;
        const [users] = await pool.query(
          'SELECT id, username, password, is_active FROM Users WHERE email = ?',
          [email]
        );
        if (users.length === 0) {
          throw new Error('Email ou senha inválidos');
        }

        const user = users[0];
        if (!user.is_active) {
          throw new Error('Conta desativada');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error('Email ou senha inválidos');
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Login bem-sucedido!', token, redirectURL: '/dashboard' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
      }
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' }); // Status 400 para erros de validação
      res.end(JSON.stringify({ error: error.message })); // Garante que sempre retorne JSON
    }
  });
};