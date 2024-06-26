document.addEventListener("DOMContentLoaded", () => {
	const registrationForm = document.getElementById("registration-form");
	const buttonRegister = document.getElementById("buttonRegister");
	const redirectAccountGoogle = document.getElementById(
		"redirectAccountGoogle"
	);
	const buttonBacktoLogin = document.getElementById("buttonBacktoLogin");
	const videoForm = document.getElementById("videoForm");
	const loginForm = document.getElementById("loginForm");


	if (loginForm) {
		loginForm.addEventListener("submit", function (event) {
			event.preventDefault();
			handleLogin();
		});
	}

	if(videoForm) {
		videoForm.addEventListener("submit", (event)=>{
		event.preventDefault();
		handleVideoRequest()
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

async function loginAuthenticatedUser(email, password,token) {
	try {
		const response = await axios.post("http://localhost:3000/login", {
			email,
			password
		});

		localStorage.setItem('token', token);
		console.log('User Authenticated sucessfully');
		const data = response.data;

		
		if (data.redirectURL) {
			console.log("Redirecionando para:", data.redirectURL);
			window.location.href = data.redirectURL;
		} else {
			console.log("Redirecionamento não configurado.");
		}
	} catch (error) {
		console.error(
			"Erro durante a solicitação de login:"//,//error.response.status,//error.response.data
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

//função para autenticar o Token nas inserções de vídeo em posso do usuário administrador
async function handleVideoRequest(videoUrl) {
	const token = localStorage.getItem('token');

	if(!token){
		console.error('Token not found. User not authenticated');
		return;
	}

	try {
		const response = await axios.get(videoUrl,{
			headers:{
				Authorization: `Bearer ${token}`
			}
		});

		const videoData = response.data;
		console.log(videoData);

	} catch (error) {
		console.error('Error to request the video:', error);
	}

}


document.getElementById("media-container").addEventListener('click', mediaURL);

function mediaURL(){
	const mediaURL = "https://www.youtube.com/embed/mB4_od2susc?si=dEaHlYmAOdxhFr8A";

	const iframe = document.createElement("iframe");
	iframe.src = mediaURL;
	iframe.width = "560";
	iframe.height = "315";
	iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
	iframe.allowFullscreen = true;


	const mediaContainer = document.getElementById("media-container");
	mediaContainer.innerHTML = '';
	mediaContainer.appendChild(iframe);
}


//function para verificar se o formulário de vídeo existe


	





//document.getElementById('loginForm').addEventListener('submit', function(event) {
//  event.preventDefault(); //block evento anterior
//handleLogin(event);
//loginAuthenticatedUser();

//});
