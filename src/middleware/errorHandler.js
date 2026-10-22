const { logger } = require('../utils/logger.js');

module.exports = (error, req, res, next) => {
  // Garante que temos uma mensagem de erro segura, mesmo se o erro vier vazio/undefined
  const errMessage = error ? (error.message || JSON.stringify(error)) : 'Erro desconhecido';
  const errCode = error ? error.code : 'UNKNOWN';
  const errStack = error ? error.stack : 'Sem stack trace';

  logger.error(`[ERROR] Erro no servidor: ${errMessage}`, { stack: errStack });

  if (errCode === '23505' || errCode === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'Nome de usuário ou email já registrado' });
  } 
  
  return res.status(500).json({ 
    error: 'Erro interno do servidor', 
    detalhe: errMessage 
  });
};