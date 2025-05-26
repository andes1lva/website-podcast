const { logger } = require('/src/utils/logger');

module.exports = (error, res) => {
  logger.error(`[ERROR] Erro no servidor: ${error.message}`, { stack: error.stack });
  if (error.code === 'ER_DUP_ENTRY') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
  } else {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
  }
};