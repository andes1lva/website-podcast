//const { application } = require("express");
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const buttonRegister = document.getElementById('buttonRegister');
    const redirectAccountGoogle = document.getElementById('redirectAccountGoogle');
    const buttonBacktoLogin = document.getElementById('buttonBacktoLogin');
    const logInValidation = document.getElementById('logInValidation');

    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    if (buttonBacktoLogin) {
        buttonBacktoLogin.onclick = function() {
            window.location.href = 'login.html';
        }
    }

    if (buttonRegister) {
        buttonRegister.onclick = function() {
            window.location.href = 'login.html';
        }  
    }

    if (redirectAccountGoogle) {
        redirectAccountGoogle.onclick = function() {
            window.location.href = 'https://accounts.google.com/login';
        }
    }


   
});

async function handleRegistration(event) {
    event.preventDefault();

    const formData = getFormData();
    if (!isFormValid(formData)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    try {
        const response = await sendRegistrationRequest(formData);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao registrar usuário.');
        }

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        handleRegistrationSuccess();
    } catch (error) {
        handleRegistrationError(error);
    }
}

function getFormData() {
    return {
        user_name: document.getElementById('registration_form_user_name').value,
        password: document.getElementById('registration_form_password').value,
        confirm_password: document.getElementById('registration_form_confirm_password').value,
        email: document.getElementById('registration_form_email').value,
        address: document.getElementById('registration_form_address').value
    };
}

function isFormValid(formData) {
    const { user_name, password, confirm_password, email, address } = formData;
    return user_name && password && confirm_password && email && address && password === confirm_password;
}



async function sendRegistrationRequest(formData) {
    try {
        const response = await fetch('http://localhost:3000/register', { // Certifique-se de que a URL está correta
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    return response;
    } catch (error) {
        console.error("Error after send a solicitation of register", error);
        throw new Error("Error after send solicitation of register");
    }
}


async function loginAuthenticatedUser() {
    try {
        const response = await fetch('/login',{
        method: 'POST',
        body: JSON.stringify({id: 'id_user', password: 'password' }),
        headers: {
            'Content-type': 'application/json'
        },
    });

    const data = await response.json();

    if(data.redirectURL) {
        window.location.href = data.redirectURL;
    }else{
        console.log(data.message);
    }
    } catch (error) {
        console.error("User not authenticated", error);
        throw new("User not authenticated");
    }
    loginAuthenticatedUser();

} 




function handleRegistrationSuccess() {
    alert('Usuário registrado com sucesso!');
    document.getElementById('registration-form').reset();
}

function handleRegistrationError(error) {
    console.error('Erro durante o registro:', error);
    alert('Ocorreu um erro durante o registro. Por favor, tente novamente.');
}
