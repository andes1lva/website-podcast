const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const bcrypt = require("bcrypt");
const path = require("path"); // Importe o módulo 'path' para trabalhar com caminhos de arquivo
const axios = require("axios");
const bodyParser = require('body-parser');
const {generateToken, authenticateToken} = require('./auth');
const routes = require('./routes');

app.use(bodyParser.json());
app.use('/',routes);

app.use(express.json());
app.use(
	cors({
		methods: ["GET", "POST"],
		origin: ["http://localhost:5500", "http://127.0.0.1:5500"], // Adicione a origem permitida aqui
	})
);


app.use(express.static(path.join(__dirname, "src"))); // Servir arquivos estáticos da pasta 'src/view'
app.use(express.static(path.join(__dirname, 'client/build'))); // Servir arquivos estáticos do react
app.use(express.urlencoded({ extended: true }));


const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "postgres",
	password: "A1b2c3d4e5",
	port: 5432,
});


// Rota principal para servir o arquivo HTML de registro
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "src/view/registrationform.html"));
});

app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "src/view/login.html"));
});

app.get("/menu", (req, res) => {
	res.sendFile(path.join(__dirname, "src/view/menu.html"));
});



let videoStack = [];
app.post("/add-video", (req, res) => {
	const {videoUrl, adminToken} = req.body;
	
	// Verifica se o token de administrador é válido
	if(adminToken !== "admin-secret-token") {
		return res.status(403).send({message: 'Permission Negade'});
	}

	videoStack.push(videoUrl); //faz um push e adiciona vídeo da URL à pilha

	res.status(201).send({message: 'Vídeo added successfully' });
});

app.get("/videos", (req, res) =>{
	res.send(videoStack);
});




// Rota para lidar com o envio do formulário de registro
app.post("/register", async (req, res) => {
	const { user_name, password, confirm_password, email, address } = req.body;

	if (password !== confirm_password) {
		return res.status(400).json({ error: "Password do not match." });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const client = await pool.connect();
		const sqlInsertQuery =
			"INSERT INTO USR_USER (USERNAME, PASSWORD, CONFIRM_PASSWORD, EMAIL, ADDRESS) VALUES ($1, $2, $3, $4, $5)";
		const values = [user_name, password, confirm_password, email, address];
		await client.query(sqlInsertQuery, values);
		client.release();

		res.status(200).json({ message: "Usuário registrado com sucesso!" });
	} catch (error) {
		console.error("Erro ao inserir usuário:", error);
		res
			.status(500)
			.json({ error: "Ocorreu um erro ao processar sua solicitação." });
	}
});


app.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		res.status(200).json({
			message: "User authenticated successfully!",
			redirectURL: "http://localhost:5500/src/view/menu.html",
		});
	


	} catch (error) {
		console.error("Error trying to authenticate user", error);
		res.status(500).json({ error: "Server error" });
	}
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Algo deu errado!" });
});


// Função para conectar-se ao PostgreSQL e executar uma consulta
async function connectAndQuery() {
	try {
		const client = await pool.connect();
		console.log("Conectado ao PostgreSQL");

		const sqlQuery = "SELECT * FROM USR_USER";
		const { rows } = await client.query(sqlQuery);
		console.log("Resultados da consulta:");
		console.table(rows);
		client.release();
	} catch (error) {
		console.error("Erro ao conectar ou executar consulta:", error);
	}
}



app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

//criar validação de Login baseado no ID do usuário,
//estrutura para verificar no banco de o login e a senha informada é válida

// Chamar a função para conectar-se ao PostgreSQL e executar a consulta
// connectAndQuery();
