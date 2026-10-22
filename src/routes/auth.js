const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sobe um nível para sair de routes/ e entrar em config/db
const { addUser, findUserByEmail } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';

// Cadastro de Utilizador
router.post('/register', async (req, res, next) => {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'E-mail inválido.',
      });
    }

    const usuarioExistente = await findUserByEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({
        error: 'Este e-mail já está cadastrado no sistema.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const novoUsuario = await addUser(
      username,
      email,
      passwordHash,
      address
    );

    return res.status(201).json({
      success: true,
      message: 'Utilizador cadastrado com sucesso!',
      user: novoUsuario,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Este e-mail já está cadastrado no sistema.',
      });
    }
    return next(error);
  }
});

// Login de Utilizador (Com emissão de Token JWT)
router.post('/login', async (req, res, next) => {
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

    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        role: usuario.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        address: usuario.address,
        role: usuario.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;