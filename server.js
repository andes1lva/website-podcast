const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { logger } = require('./src/utils/logger');
const authRoutes = require('./src/routes/auth');
const errorHandler = require('./src/middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// --- CONFIGURAÇÃO DE CAMINHOS ---
// Define o caminho exato da pasta public dentro de src
const publicPath = path.join(__dirname, 'src', 'public');

// --- MIDDLEWARES ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${PORT}` }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(publicPath));

// Logger de requisições para Debug
app.use((req, res, next) => {
    logger.info(`[SERVER] ${req.method} ${req.url}`);
    next();
});

// --- ROTAS DE PÁGINAS (HTML) ---
app.get('/', (req, res) => res.sendFile(path.join(publicPath, 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(publicPath, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(publicPath, 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(publicPath, 'dashboard.html')));

// --- ROTAS DE API ---
// Todas as rotas dentro de authRoutes terão o prefixo /auth
app.use('/auth', authRoutes);

// --- TRATAMENTO DE ERROS ---
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`[SERVER] Servidor rodando em http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
    logger.error(`[SERVER] Erro crítico (Promise): ${err.message}`);
});

