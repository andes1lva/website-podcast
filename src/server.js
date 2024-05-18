const express = require('express');  // Importar o módulo pg para usar o cliente PostgreSQL
const { Pool } = require('pg');
const cors = require('cors');//configuração do CORS



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    methods:['GET','POST'],
    origin: ['http://localhost:5500'] //permitir apenas requisições deste cliente
}));



app.use(express.static('src/view'));


// Middleware para processar dados JSON e formulários URL-encoded
app.use(express.json());
app.use(express.urlencoded({extended: true}));





// Configurações de conexão com o PostgreSQL
const pool = new Pool({
    user: 'postgres',       // Por exemplo, 'postgres' ou outro usuário criado
    host: 'localhost',         // Host onde o PostgreSQL está sendo executado
    database: 'postgres',  // Nome do banco de dados que você deseja conectar
    password: 'A1b2c3d4e5',     // Senha do usuário do PostgreSQL
    port: 5432                 // Porta padrão do PostgreSQL (5432 por padrão)
});


// Rota principal para servir o arquivo HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/view/registrationform.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/view/login.html');
});




// Função para conectar-se ao PostgreSQL e executar uma consulta
async function connectAndQuery() {
    try {
        // Conectar ao banco de dados PostgreSQL
        const client = await pool.connect();
        console.log('Conectado ao PostgreSQL');


        // Executar uma consulta SQL
        const sqlQuery = 'SELECT * FROM USR_USER';
        const { rows } = await client.query(sqlQuery);
        console.log('Resultados da consulta:');// Exibir os resultados da consulta
        console.table(rows);
        client.release();// Liberar o cliente da conexão


    } catch (error) {
        console.error('Erro ao conectar ou executar consulta:', error);
    } finally {
        // Encerrar a pool de conexão com o PostgreSQL
        await pool.end();
        console.log('Conexão com o PostgreSQL encerrada');
    }
}

//rota para o acesso ao login
app.post('/login', function(req, res){
    res.send("Conectado");
});


//Rota para lidar com o envio do formulário
app.post('/register', async(req, res)=>{
    const{user_name, password, confirm_password, email, address} = req.body;
    try {
        //tentar conectar ao banco de dados postgres
        const client = await pool.connect();



       //Executar a inserção na tabela USR_USER
       const sqlInsertQuery = 'INSERT INTO USR_USER (USERNAME, PASSWORD, CONFIRM_PASSWORD, EMAIL, ADDRESS) VALUES ($1, $2, $3, $4, $5)';
       const values = [user_name, password, confirm_password, email, address];
       const result = await client.query(sqlInsertQuery, values);
       console.log('Inserção bem-sucedida:', result.rows); // Verifica o resultado da inserção


      /*
      function sqlAlterTable(){
        const sqlAlterQuery = "ALTER TABLE USR_USER VALUES ADD COLUMN USERNAME VARCHAR(60)"
        "ALTER TABLE password VARCHAR(30)",
        "ALTER TABLE confirm_password(30)",
        "ALTER TABLE email VARCHAR(60)",
        "ALTER TABLE address VARCHAR(100)";
             "ALTER TABLE USR_USER DROP COLUMN username, password, confirm_password, email, address "
             "ALTER TABLE USR_USER RENAME COLUMN username, email, address"
             "ALTER TABLE USR_USER ALTER COLUMN username, password, confirm_password, email, address"

       }
      
      
      */ 
      
       //await client.query(sqlAlterQuery); // aguarda o cliente realizar alteração 

        
      



        // Responder ao cliente com uma mensagem de sucesso
        res.status(200).send('Usuário registrado com sucesso!');
    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
        res.status(500).send('Ocorreu um erro ao processar sua solicitação.');
    }
});

client.release();// Liberar o cliente da conexão


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});



// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });


// Chamar a função para conectar-se ao PostgreSQL e executar a consulta
connectAndQuery();