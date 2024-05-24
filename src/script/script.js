document.addEventListener("DOMContentLoaded", () => {
	const registrationForm = document.getElementById("registration-form");
	const buttonRegister = document.getElementById("buttonRegister");
	const redirectAccountGoogle = document.getElementById(
		"redirectAccountGoogle"
	);
	const buttonBacktoLogin = document.getElementById("buttonBacktoLogin");
	const loginForm = document.getElementById("loginForm");

	if (loginForm) {
		loginForm.addEventListener("submit", function (event) {
			event.preventDefault();
			handleLogin();
		});
	}

	if (registrationForm) {
		registrationForm.addEventListener("submit", handleRegistration);
	}

	if (buttonBacktoLogin) {
		buttonBacktoLogin.onclick = function () {
			window.location.href = "login.html";
		};
	}

	if (buttonRegister) {
		buttonRegister.onclick = function () {
			window.location.href = "login.html";
		};
	}

	if (redirectAccountGoogle) {
		redirectAccountGoogle.onclick = function () {
			window.location.href = "https://accounts.google.com/login";
		};
	}
});

async function handleLogin() {
	const email = document.getElementById("login_email").value;
	const password = document.getElementById("password").value;
	console.log(password);
	if (!email || !password) {
		console.log("Email or password not found");
		return;
	}

	try {
		await loginAuthenticatedUser(email, password);
		console.log(loginAuthenticatedUser);
	} catch (error) {
		console.error("Erro ao autenticar o usuário:", error);
		alert(
			"Ocorreu um erro ao autenticar o usuário. Por favor, tente novamente."
		);
	}
}

//const axiosAuthenticatedUserLoginData = require('axios');

async function loginAuthenticatedUser(email, password) {
	try {
		const response = await axios.post("http://localhost:3000/login", {
			email,
			password
		});

		const data = response.data;

		// if (!response.ok) {
		// 	const errorData = await response.json();
		// 	throw new Error(`HTTP error! status: ${response.status}`);
		// }
		// const data = await response.json();

		if (data.redirectURL) {
			console.log("Redirecionando para:", data.redirectURL);
			window.location.href = data.redirectURL;
		} else {
			console.log("Redirecionamento não configurado.");
		}
	} catch (error) {
		console.error(
			"Erro durante a solicitação de login:",
			error.response.status,
			error.response.data
		);
	}
}

async function handleRegistration(event) {
	event.preventDefault();

	const formData = getFormData();
	if (!isFormValid(formData)) {
		alert("Por favor, preencha todos os campos corretamente.");
		return;
	}

	try {
		const response = await sendRegistrationRequest(formData);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erro ao registrar usuário.");
		}

		const data = await response.json();
		console.log("Resposta do servidor:", data);

		handleRegistrationSuccess();
	} catch (error) {
		handleRegistrationError(error);
	}
}

function getFormData() {
	return {
		user_name: document.getElementById("registration_form_user_name").value,
		password: document.getElementById("registration_form_password").value,
		confirm_password: document.getElementById(
			"registration_form_confirm_password"
		).value,
		email: document.getElementById("registration_form_email").value,
		address: document.getElementById("registration_form_address").value,
	};
}

function isFormValid(formData) {
	const { user_name, password, confirm_password, email, address } = formData;
	return (
		user_name &&
		password &&
		confirm_password &&
		email &&
		address &&
		password === confirm_password
	);
}

async function sendRegistrationRequest(formData) {
	try {
		const response = await fetch("http://localhost:3000/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});
		return response;
	} catch (error) {
		console.error("Error after sending a registration request", error);
		throw new Error("Error after sending registration request");
	}
}

function handleRegistrationSuccess() {
	alert("Usuário registrado com sucesso!");
	document.getElementById("registration-form").reset();
}

function handleRegistrationError(error) {
	console.error("Erro durante o registro:", error);
	alert("Ocorreu um erro durante o registro. Por favor, tente novamente.");
}

//document.getElementById('loginForm').addEventListener('submit', function(event) {
//  event.preventDefault(); //block evento anterior
//handleLogin(event);
//loginAuthenticatedUser();

//});
