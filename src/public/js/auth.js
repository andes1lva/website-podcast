const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client'); 

const prisma = new PrismaClient();


router.post('/register', async (req, res, next) => {
    try {
        const { username, email, address, password } = req.body;

        // Validação preventiva
        if (!username || !email || !address || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }

        // 1. Chamada correta no plural alinhada ao banco
        const usuarioExiste = await prisma.users.findUnique({
            where: { email: email }
        });

        if (usuarioExiste) {
            return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Criação na tabela 'users' (plural) com chaves idênticas às colunas do Supabase
        const novoUsuario = await prisma.users.create({
            data: {
                username: username, // varchar
                email: email,       // varchar (NON-NULLABLE)
                address: address,   // text
                password: passwordHash // varchar
            }
        });

        console.log(`[BACKEND] Usuário criado com sucesso no Supabase! ID: ${novoUsuario.id}`);
        return res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        console.error("[ERRO NO PRISMA/SUPABASE]:", error);
        // Retorna o texto real da falha para o front-end conseguir capturar no Inspecionar
        return res.status(500).json({ error: `Erro no banco: ${error.message || error}` });
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        const usuario = await prisma.users.findUnique({
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
            token: 'mock-jwt-token-utilitário', // Substitua pelo seu JWT real se necessário
            user: { id: usuario.id, name: usuario.name, email: usuario.email }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
