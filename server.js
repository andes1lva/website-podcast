const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

// Carrega variáveis de ambiente
dotenv.config();

// Configurações
const PORT = parseInt(process.env.PORT, 10) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'As_Esferas_Do_Dragao';

logger.info('[SERVER] Configurando servidor...');
logger.info(`[SERVER] Porta: ${PORT}`);

// Verifica token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.error(`[SERVER] Erro ao verificar token: ${err.message}`);
    return null;
  }
};

// Cria servidor
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Configura cabeçalhos CORS e CSP
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://apis.google.com https://cdn.tailwindcss.com; style-src 'self' https://cdn.tailwindcss.com;");

  logger.info(`[SERVER] Requisição: ${req.method} ${pathname}`);

  // Lida com OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Lida com GET
  if (req.method === 'GET') {
    let filePath;
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css'
    };

    if (pathname === '/' || pathname === '/register') {
      filePath = path.join(__dirname, 'public', 'register.html');
    } else if (pathname === '/login') {
      filePath = path.join(__dirname, 'public', 'login.html');
    } else if (pathname === '/dashboard') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token || !verifyToken(token)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Acesso negado. Faça login.' }));
        return;
      }
      filePath = path.join(__dirname, 'public', 'dashboard.html');
    } else if (pathname === '/podcasts') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token || !verifyToken(token)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Acesso negado. Faça login.' }));
        return;
      }
      filePath = path.join(__dirname, 'public', 'podcasts.html');
    } else if (pathname === '/client.js' || pathname === '/dashboard.js') {
      filePath = path.join(__dirname, 'public', pathname.slice(1));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rota não encontrada' }));
      return;
    }

    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    } catch (err) {
      logger.error(`[SERVER] Erro ao servir arquivo ${filePath}: ${err.message}`);
      errorHandler(err, res);
    }
  } else {
    authRoutes(req, res);
  }
});

// Tratamento de erro ao iniciar servidor
server.on('error', (err) => {
  if (err.code === 'EACCES') {
    logger.error(`[SERVER] Permissão negada na porta ${PORT}. Tente outra porta.`);
  } else if (err.code === 'EADDRINUSE') {
    logger.error(`[SERVER] Porta ${PORT} em uso. Tente outra porta ou finalize o processo.`);
  } else {
    logger.error(`[SERVER] Erro no servidor: ${err.message}`);
  }
  process.exit(1);
});

server.listen(PORT, 'localhost', () => {
  logger.info(`[SERVER] Servidor rodando em http://localhost:${PORT}`);
});

// Tratamento de erros globais
process.on('uncaughtException', (err) => {
  logger.error(`[SERVER] Erro não capturado: ${err.message}`, { stack: err.stack });
});
process.on('unhandledRejection', (err) => {
  logger.error(`[SERVER] Promessa rejeitada: ${err.message}`, { stack: err.stack });
});