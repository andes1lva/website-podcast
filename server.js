const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/auth'); 
const errorHandler = require('./src/middleware/errorHandler');
const { logger } = require('./src/utils/logger');
const jwt = require('jsonwebtoken');

dotenv.config();

const PORT = process.env.PORT || 5500;
const JWT_SECRET = process.env.JWT_SECRET || 'As_Esferas_Do_Dragão';

logger.info('[SERVIDOR] Configurando servidor...');
logger.info(`[SERVIDOR] Porta definida: ${PORT}`);

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.error(`[SERVIDOR] Erro ao verificar token: ${err.message}`);
    return null;
  }
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://apis.google.com https://cdn.tailwindcss.com; style-src 'self' https://cdn.tailwindcss.com;");

  logger.info(`[SERVIDOR] Requisição recebida: ${req.method} ${pathname} de ${req.headers.origin || 'origem desconhecida'}`);

  if (req.method === 'OPTIONS') {
    logger.info(`[SERVIDOR] Requisição OPTIONS para: ${pathname}`);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    let filePath;
    if (pathname === '/' || pathname === '/register') {
      filePath = path.join(__dirname, 'src', 'view', 'register.html');
    } else if (pathname === '/login') {
      filePath = path.join(__dirname, 'src', 'view', 'login.html');
    } else if (pathname === '/menu') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token || !verifyToken(token)) {
        logger.warn('[SERVIDOR] Acesso negado a /menu: token inválido ou ausente');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Acesso negado. Faça login.' }));
        return;
      }
      filePath = path.join(__dirname, 'src', 'view', 'menu.html');
    } else if (pathname === '/script/client.js' || pathname === '/script/menu.js') {
      filePath = path.join(__dirname, 'src', 'script', pathname.split('/').pop());
      try {
        logger.info(`[SERVIDOR] Servindo ${pathname}`);
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content);
        return;
      } catch (err) {
        logger.error(`[SERVIDOR] Erro ao servir ${pathname}: ${err.message}`);
        errorHandler(err, res);
        return;
      }
    } else {
      logger.warn(`[SERVIDOR] Rota não encontrada: ${pathname}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Página não encontrada' }));
      return;
    }

    try {
      logger.info(`[SERVIDOR] Servindo arquivo: ${filePath}`);
      const content = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (err) {
      logger.error(`[SERVIDOR] Erro ao servir arquivo: ${err.message}`);
      errorHandler(err, res);
    }
  } else {
    authRoutes(req, res);
  }
});

server.listen(PORT, () => {
  logger.info(`[SERVIDOR] Servidor rodando na porta ${PORT}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`[SERVIDOR] Erro não capturado: ${err.message}`, { stack: err.stack });
});
process.on('unhandledRejection', (err) => {
  logger.error(`[SERVIDOR] Promessa rejeitada não tratada: ${err.message}`, { stack: err.stack });
});