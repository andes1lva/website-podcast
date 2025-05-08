const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/db');
const { registerSchema, loginSchema } = require('./utils/validator');
const sanitizeHtml = require('sanitize-html');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'As_Esferas_Do_Dragão';

// Verificar token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Servir arquivos estáticos
  if (req.method === 'GET') {
    let filePath;
    if (pathname === '/' || pathname === '/register') {
      filePath = path.join(__dirname, 'view', 'register.html');
    } else if (pathname === '/login') {
      filePath = path.join(__dirname, 'view', 'login.html');
    } else if (pathname === '/menu') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token || !verifyToken(token)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Acesso negado. Faça login.' }));
        return;
      }
      filePath = path.join(__dirname, 'view', 'menu.html');
    } else if (pathname === '/script/client.js') {
      filePath = path.join(__dirname, 'script', 'client.js');
      try {
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
      }
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Página não encontrada' }));
      return;
    }

    try {
      const content = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
    }
  }

  // Processar formulários
  else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      let data;
      try {
        // Tentar parsear como JSON
        data = JSON.parse(body);
        console.log('Dados recebidos (JSON):', data);
      } catch {
        // Fallback para URL-encoded
        data = querystring.parse(body);
        console.log('Dados recebidos (URL-encoded):', data);
      }

      try {
        // Registro
        if (pathname === '/register') {
          const { error } = registerSchema.validate(data);
          if (error) {
            console.log('Erro de validação:', error.details[0].message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.details[0].message }));
            return;
          }

          const { username, password, email, address } = data;
          const sanitizedUsername = sanitizeHtml(username);
          const sanitizedAddress = address ? sanitizeHtml(address) : null;

          console.log('Tentando inserir:', { sanitizedUsername, email, address });

          // Verificar unicidade
          const [existingUser] = await pool.query(
            'SELECT id FROM Users WHERE username = ? OR email = ?',
            [sanitizedUsername, email]
          );
          if (existingUser.length > 0) {
            console.log('Usuário ou email já existe');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
            return;
          }

          // Hash da senha
          const hashedPassword = await bcrypt.hash(password, 10);

          // Inserir usuário
          const sqlInsertQuery =
            'INSERT INTO Users (username, password, email, address) VALUES (?, ?, ?, ?)';
          await pool.query(sqlInsertQuery, [sanitizedUsername, hashedPassword, email, sanitizedAddress]);
          console.log('Usuário inserido com sucesso:', sanitizedUsername);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Usuário registrado com sucesso!' }));
        }

        // Login
        else if (pathname === '/login') {
          const { error } = loginSchema.validate(data);
          if (error) {
            console.log('Erro de validação:', error.details[0].message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.details[0].message }));
            return;
          }

          const { email, password } = data;
          console.log('Tentando login:', email);

          const [users] = await pool.query(
            'SELECT id, username, password, is_active FROM Users WHERE email = ?',
            [email]
          );
          if (users.length === 0) {
            console.log('Usuário não encontrado:', email);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
            return;
          }

          const user = users[0];
          if (!user.is_active) {
            console.log('Conta desativada:', email);
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Conta desativada' }));
            return;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            console.log('Senha inválida:', email);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
            return;
          }

          const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
          );

          console.log('Login bem-sucedido:', user.username);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Usuário autenticado com sucesso!',
            token,
            userId: user.id,
            redirectURL: 'http://localhost:5500/src/view/menu.html'
          }));
        }

        else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Rota não encontrada' }));
        }
      } catch (error) {
        console.error('Erro no servidor:', error.message);
        console.error('Stack:', error.stack);
        if (error.code === 'ER_DUP_ENTRY') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
        }
      }
    });
  }

  else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Método não permitido' }));
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});