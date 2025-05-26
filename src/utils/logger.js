// Importa o winston para logging
const winston = require('winston');

// Cria um logger com configurações específicas
const logger = winston.createLogger({
  level: 'info', // Nível mínimo de log (info, warn, error, etc.)
  format: winston.format.combine(
    winston.format.timestamp(), // Adiciona timestamp aos logs
    winston.format.json()       // Formata logs como JSON
  ),
  transports: [
    // Loga no console
    new winston.transports.Console(),
    // Loga erros em logs/error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Loga tudo em logs/combined.log
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Exporta o logger
module.exports = { logger };