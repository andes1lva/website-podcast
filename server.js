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

const publicPath = path.join(__dirname, 'src', 'public');

// --- MIDDLEWARES ---

//  Ele vai ler a variável FRONTEND_URL criado no Render
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 2. TRADUTORES DE DADOS (Evitam o erro "undefined")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(publicPath));

app.use((req, res, next) => {
    logger.info(`[SERVER] ${req.method} ${req.url}`);
    next();
});

// --- ROTAS ---
app.get('/', (req, res) => res.sendFile(path.join(publicPath, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(publicPath, 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(publicPath, 'dashboard.html')));

app.use('/auth', authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`[SERVER] Servidor rodando em http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
    logger.error(`[SERVER] Erro crítico (Promise): ${err.message}`);
});
