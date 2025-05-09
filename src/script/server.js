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

const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'As_Esferas_Do_Dragão';

console.log('[SERVIDOR] Configurando servidor...');
console.log('[SERVIDOR] Porta definida:', PORT);

// Verificar token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.log('[SERVIDOR] Erro ao verificar token:', err.message);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  console.log(`[SERVIDOR] Requisição recebida: ${req.method} ${pathname} de ${req.headers.origin || 'origem desconhecida'}`);

  // Lidar com requisições OPTIONS (pré-voo CORS)
  if (req.method === 'OPTIONS') {
    console.log('[SERVIDOR] Requisição OPTIONS para:', pathname);
    res.writeHead(204);
    res.end();
    return;
  }

  // Servir arquivos estáticos (apenas GET)
  if (req.method === 'GET') {
    let filePath;
    if (pathname === '/' || pathname === '/register') {
      filePath = path.join(__dirname, 'view', 'register.html');
    } else if (pathname === '/login') {
      filePath = path.join(__dirname, 'view', 'login.html');
    } else if (pathname === '/menu') {
      const token = req.headers['authorization']?.split(' ')[1];
      console.log('[SERVIDOR] Verificando token para /menu:', token ? 'Token presente' : 'Sem token');
      if (!token || !verifyToken(token)) {
        console.log('[SERVIDOR] Acesso negado: token inválido ou ausente');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Acesso negado. Faça login.' }));
        return;
      }
      filePath = path.join(__dirname, 'view', 'menu.html');
    } else if (pathname === '/script/client.js') {
      filePath = path.join(__dirname, 'script', 'client.js');
      try {
        console.log('[SERVIDOR] Servindo client.js');
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content);
      } catch (err) {
        console.error('[SERVIDOR] Erro ao servir client.js:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
      }
      return;
    } else {
      console.log('[SERVIDOR] Rota não encontrada:', pathname);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Página não encontrada' }));
      return;
    }

    try {
      console.log('[SERVIDOR] Servindo arquivo:', filePath);
      const content = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (err) {
      console.error('[SERVIDOR] Erro ao servir arquivo:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
    }
  }

  // Processar formulários (apenas POST)
  else if (req.method === 'POST') {
    console.log('[SERVIDOR] Processando requisição POST para:', pathname);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      let data;
      try {
        // Tentar parsear como JSON
        data = JSON.parse(body);
        console.log('[SERVIDOR] Dados recebidos (JSON):', data);
      } catch {
        // Fallback para URL-encoded
        data = querystring.parse(body);
        console.log('[SERVIDOR] Dados recebidos (URL-encoded):', data);
      }

      try {
        // Registro
        if (pathname === '/register') {
          console.log('[SERVIDOR] Iniciando processo de registro...');
          const { error } = registerSchema.validate(data);
          if (error) {
            console.log('[SERVIDOR] Erro de validação:', error.details[0].message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.details[0].message }));
            return;
          }

          const { username, password, confirm_password, email, address } = data;
          if (password !== confirm_password) {
            console.log('[SERVIDOR] Erro: senhas não coincidem');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'As senhas não coincidem' }));
            return;
          }

          const sanitizedUsername = sanitizeHtml(username);
          const sanitizedAddress = address ? sanitizeHtml(address) : null;
          console.log('[SERVIDOR] Dados sanitizados:', { sanitizedUsername, email, sanitizedAddress });

          // Verificar unicidade
          console.log('[SERVIDOR] Verificando unicidade de username e email...');
          const [existingUser] = await pool.query(
            'SELECT id FROM Users WHERE username = ? OR email = ?',
            [sanitizedUsername, email]
          );
          console.log('[SERVIDOR] Resultado da verificação:', existingUser);
          if (existingUser.length > 0) {
            console.log('[SERVIDOR] Usuário ou email já registrado:', sanitizedUsername, email);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
            return;
          }

          // Hash da senha
          console.log('[SERVIDOR] Gerando hash da senha...');
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log('[SERVIDOR] Hash gerado com sucesso');

          // Inserir usuário
          console.log('[SERVIDOR] Executando INSERT no banco...');
          const sqlInsertQuery =
            'INSERT INTO Users (username, password, email, address) VALUES (?, ?, ?, ?)';
          const [result] = await pool.query(sqlInsertQuery, [sanitizedUsername, hashedPassword, email, sanitizedAddress]);
          console.log('[SERVIDOR] Usuário inserido com sucesso:', {
            username: sanitizedUsername,
            insertId: result.insertId
          });

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Usuário registrado com sucesso!' }));
        }

        // Login
        else if (pathname === '/login') {
          console.log('[SERVIDOR] Iniciando processo de login...');
          const { error } = loginSchema.validate(data);
          if (error) {
            console.log('[SERVIDOR] Erro de validação:', error.details[0].message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.details[0].message }));
            return;
          }

          const { email, password } = data;
          console.log('[SERVIDOR] Dados de login:', { email });

          console.log('[SERVIDOR] Buscando usuário...');
          const [users] = await pool.query(
            'SELECT id, username, password, is_active FROM Users WHERE email = ?',
            [email]
          );
          console.log('[SERVIDOR] Resultado da busca:', users);
          if (users.length === 0) {
            console.log('[SERVIDOR] Usuário não encontrado:', email);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
            return;
          }

          const user = users[0];
          if (!user.is_active) {
            console.log('[SERVIDOR] Conta desativada:', email);
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Conta desativada' }));
            return;
          }

          console.log('[SERVIDOR] Verificando senha...');
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            console.log('[SERVIDOR] Senha inválida:', email);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
            return;
          }

          console.log('[SERVIDOR] Gerando token JWT...');
          const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
          );
          console.log('[SERVIDOR] Token gerado com sucesso');

          console.log('[SERVIDOR] Login bem-sucedido:', user.username);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Usuário autenticado com sucesso!',
            token,
            userId: user.id,
            redirectURL: 'http://localhost:5500/src/view/menu.html'
          }));
        }

        else {
          console.log('[SERVIDOR] Rota POST não encontrada:', pathname);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Rota não encontrada' }));
        }
      } catch (error) {
        console.error('[SERVIDOR] Erro no servidor:', error.message);
        console.error('[SERVIDOR] Stack:', error.stack);
        if (error.code === 'ER_DUP_ENTRY') {
          console.log('[SERVIDOR] Erro de duplicata:', error.message);
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
    console.log('[SERVIDOR] Método não permitido:', req.method);
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Método não permitido' }));
  }
});

server.listen(PORT, () => {
  console.log(`[SERVIDOR] Servidor rodando na porta ${PORT}`);
});