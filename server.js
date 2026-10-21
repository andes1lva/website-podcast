const express = require('express');
const path = require('path');
const cors = require('cors');

const { testarConexao } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, 'public');

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(publicPath, 'register.html'));
});

app.use('/auth', authRoutes);

async function iniciarServidor() {
  try {
    await testarConexao();

    app.listen(PORT, () => {
      console.log(`[SERVER] Servidor iniciado na porta ${PORT}.`);
    });
  } catch (error) {
    console.error('[SERVER] Falha ao conectar ao banco:', error.message);
    process.exit(1);
  }
}

iniciarServidor();
