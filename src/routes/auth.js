const express = require('express');
const router = express.Router();
const { addUser } = require('../config/db'); 

// Rota: POST /auth/register
router.post('/register', async (req, res) => {
    try {
        // 1. Desestruturando os dados conforme sua nova tabela
        const { username, cpf, email, password, address } = req.body;

        // Validação básica de segurança
        if (!username || !cpf || !email || !password) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        // 2. Chamada da função com a nova ordem de parâmetros
        const result = await addUser(username, cpf, email, password, address);

        // 3. Resposta de sucesso (O JSON que o client.js espera)
        return res.status(201).json({ 
            success: true, 
            message: 'Usuário registrado com sucesso!',
            userId: result.insertId 
        });

    } catch (error) {
        console.error('[AUTH ERROR]:', error.message);
        return res.status(500).json({ error: error.message });
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

        if (!user || user.password !== password) { // Lembre-se de usar bcrypt.compare no futuro
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