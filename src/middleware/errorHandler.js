const { logger } = require('../utils/logger.js');

// Função para tratar erros (Parâmetro corrigido para 'error')
module.exports = (error, res) => {
  // Loga o erro usando a variável correta
  logger.error(`[ERROR] Erro no servidor: ${error.message}`, { stack: error.stack });

  // '23505' é o código do PostgreSQL para violação de chave única (Email ou Usuário já cadastrado)
  if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Nome de usuário ou email já registrado' }));
  } else {
    // Erro genérico ou falha interna de sintaxe SQL
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor', detalhe: error.message }));
  }
};
