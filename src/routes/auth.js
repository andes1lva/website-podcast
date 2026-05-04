const express = require('express');
const router = express.Router();
const { addUser, findUserByEmail} = require('../config/db'); 

// Rota: POST /auth/register
router.post('/register', async (req, res) => {
    try {
        // 1. Extraímos os dados. O CPF já fica como null se não vier no body.
        const { username, email, password, address, cpf = null } = req.body;

        if (!username || !email || !password || !address) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }

        const result = await addUser(username, cpf, email, password, address);

        return res.status(201).json({ 
            success: true, 
            message: 'Usuário registrado com sucesso!',
            userId: result.insertId 
        });

    } catch (error) {
        // Isso vai imprimir o erro real no seu terminal do VS Code/Node
        console.error('[AUTH ERROR]:', error); 
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        // Aqui você chamaria uma função como findUserByEmail no seu db.js
        const user = await findUserByEmail(email);

        if (!user || user.password !== password) { 
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Login realizado com sucesso!',
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (error) {
        console.error('[LOGIN ERROR]:', error.message);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});


module.exports = router;