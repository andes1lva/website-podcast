const { logger } = require('../utils/logger.js');

// Função para tratar erros
module.exports = (error, res) => {
  logger.error(`[ERROR] Erro no servidor: ${error.message}`, { stack: error.stack });
  if (error.code === 'ER_DUP_ENTRY') {
    // Erro de duplicidade no banco
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
  } else {
    // Erro genérico
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
  }
};