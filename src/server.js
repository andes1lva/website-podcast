const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;






app.use(cors({
    methods: ['GET', 'POST'],
    origin: ['http://localhost:5500'] // Ajuste conforme necessário
}));

app.use(express.static('src/view'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'A1b2c3d4e5',
    port: 5432
});







// Rota principal para servir o arquivo HTML de registro
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/view/registrationform.html');
});

// Rota para servir o arquivo HTML de login
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/src/view/login.html'); // Certifique-se de que o caminho para o arquivo login.html está correto
});

app.get('/menu', (req, res) => {
    res.sendFile(__dirname + '/src/view/menu.html'); // Certifique-se de que o caminho para o arquivo login.html está correto
});






// Rota para lidar com o envio do formulário de registro
app.post('/register', async (req, res) => {
    const { user_name, password, confirm_password, email, address } = req.body;
    try {
        const client = await pool.connect();
        const sqlInsertQuery = 'INSERT INTO USR_USER (USERNAME, PASSWORD, CONFIRM_PASSWORD, EMAIL, ADDRESS) VALUES ($1, $2, $3, $4, $5)';
        const values = [user_name, password, confirm_password, email, address];
        await client.query(sqlInsertQuery, values);
        client.release();
        res.status(200).json({ message: 'Usuário registrado com sucesso!' });
        window.location.href = '\login';

    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao processar sua solicitação.' });
    }
});








app.get('/register', async(req, res) => {
  


});
    



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});









// Função para conectar-se ao PostgreSQL e executar uma consulta
async function connectAndQuery() {
    try {
        const client = await pool.connect();
        console.log('Conectado ao PostgreSQL');

        const sqlQuery = 'SELECT * FROM USR_USER';
        const { rows } = await client.query(sqlQuery);
        console.log('Resultados da consulta:');
        console.table(rows);
        client.release();
    } catch (error) {
        console.error('Erro ao conectar ou executar consulta:', error);
    }
}






//criar validação de Login baseado no ID do usuário, 
//estrutura para verificar no banco de o login e a senha informada é válida
app.post('/login', async(req, res)=>{
    const {id, password} = req.body;

    try {
        const {rows} = await pool.query('SELECT id, password FROM usr_user WHERE id = $1', [id]);

        if(rows.length === 1){
            if(rows[0].password === password){
                res.status(200).send("User Autenticated Sucessfully!");

            }else{
                res.status(401).send("Autentication Fail.");
            }

        }else{
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error('Error to try autenticate user', err)
        res.status(500).send('Error inside to server');
    }
});




// Chamar a função para conectar-se ao PostgreSQL e executar a consulta
connectAndQuery();
