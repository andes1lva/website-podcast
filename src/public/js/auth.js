const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Biblioteca para criptografar senhas
const { PrismaClient } = require('@prisma/client'); // Conexão com o banco de dados

const prisma = new PrismaClient();


router.post('/register', async (req, res, next) => {
    try {
        const { username, email, address, password } = req.body;

        if (!username || !email || !address || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }

        const usuarioExiste = await prisma.user.findUnique({
            where: { email: email }
        });

        if (usuarioExiste) {
            return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const novoUsuario = await prisma.user.create({
            data: {
                name: username,
                address: address,
                password: passwordHash
            }
        });

        console.log(`[BACKEND] Novo usuário cadastrado ID: ${novoUsuario.id}`);

        return res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        const usuario = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!usuario) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const senhaValida = await bcrypt.compare(password, usuario.password);

        if (!senhaValida) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso!',
            user: { id: usuario.id, name: usuario.name, email: usuario.email }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
