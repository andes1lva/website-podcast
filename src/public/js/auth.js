const express = require('express');
const bcrypt = require('bcryptjs');
const { addUser, findUserByEmail } = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const address = String(req.body.address || '').trim();
    const password = String(req.body.password || '');

    if (!username || !email || !address || !password) {
      return res.status(400).json({
        error: 'Preencha todos os campos obrigatórios.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 8 caracteres.',
      });
    }

    const usuarioExistente = await findUserByEmail(email);

    if (usuarioExistente) {
      return res.status(409).json({
        error: 'Este e-mail já está cadastrado no sistema.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await addUser({
      username,
      email,
      passwordHash,
      address,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: usuario,
    });
  } catch (error) {
    // Código PostgreSQL 23505: valor duplicado em coluna UNIQUE, como email.
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Este e-mail já está cadastrado no sistema.',
      });
    }

    console.error('[ERRO NO CADASTRO]', {
      code: error.code,
      message: error.message,
    });

    return res.status(500).json({
      error: 'Erro interno ao cadastrar usuário.',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios.',
      });
    }

    const usuario = await findUserByEmail(email);

    if (!usuario) {
      return res.status(401).json({
        error: 'E-mail ou senha incorretos.',
      });
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);

    if (!senhaValida) {
      return res.status(401).json({
        error: 'E-mail ou senha incorretos.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        address: usuario.address,
        role: usuario.role,
      },
    });
  } catch (error) {
    console.error('[ERRO NO LOGIN]', {
      code: error.code,
      message: error.message,
    });

    return res.status(500).json({
      error: 'Erro interno ao fazer login.',
    });
  }
});

module.exports = router;
