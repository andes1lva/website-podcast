const express = require('express');
const router = express.Router();
const { findUserByEmail } = require('../config/db'); 

// Configuração lógica de tempo (Exemplo: 30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000; 

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);

        if (!user || user.password !== password) { 
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Retornamos o tempo de expiração para o front-end monitorar
        const expiresAt = Date.now() + SESSION_TIMEOUT;

        return res.status(200).json({ 
            success: true, 
            expiresAt, // Timestamp de quando a sessão expira
            user: { id: user.id, username: user.username }
        });

    } catch (error) {
        console.error('[LOGIN ERROR]:', error.message);
        return res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;