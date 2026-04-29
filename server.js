const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { logger } = require('./src/utils/logger');
const { addUser } = require('./src/config/db'); // Sua lógica de DB
const authRoutes = require('./src/routes/auth'); // Suas rotas de autenticação
const errorHandler = require('./src/middleware/errorHandler');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// --- MIDDLEWARES ---

// 1. Permite requisições de outras origens (CORS)
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
}));

// 2. Transforma o corpo das requisições (POST) em JSON automaticamente
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Serve arquivos estáticos (CSS, JS do cliente, Imagens) da pasta 'public'
// Isso substitui toda aquela lógica manual de mimeTypes
app.use(express.static(path.join(__dirname, 'public')));

// 4. Logger de requisições
app.use((req, res, next) => {
    logger.info(`[SERVER] ${req.method} ${req.url}`);
    next();
});

// --- ROTAS DE PÁGINAS (HTML) ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Exemplo de rota protegida (Dashboard)
app.get('/dashboard', (req, res) => {
    // Aqui você pode adicionar sua lógica de verificação de JWT posteriormente
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// --- ROTAS DE LÓGICA (API) ---

// Centraliza as rotas de POST (Login/Register) que você já tem
app.use('/auth', authRoutes);



// Rota direta de teste para inserção (opcional, se não quiser usar o arquivo routes)
// No server.js
app.post('/register', async (req, res) => {
    console.log('[SERVER] Recebi um POST em /register:', req.body); // Adicione esse log para testar!
    try {
        const result = await addUser(req.body);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('[SERVER] Erro ao cadastrar:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- TRATAMENTO DE ERROS ---

// Middleware de erro (deve ser o último a ser carregado)
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, () => {
    logger.info(`[SERVER] Servidor rodando em http://localhost:${PORT}`);
});

// Tratamento de falhas críticas
process.on('unhandledRejection', (err) => {
    logger.error(`[SERVER] Erro crítico (Promise): ${err.message}`);
});