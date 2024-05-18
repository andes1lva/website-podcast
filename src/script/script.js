document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');

    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
});

async function handleRegistration(event) {
    event.preventDefault();

    // Verificar se o formulário foi preenchido corretamente
    if (!isFormValid()) {
        // Se o formulário não estiver válido, exibir uma mensagem de erro e não enviar a requisição
        alert('Por favor, preencha todos os campos do formulário corretamente.');
        return;
    }

    const userName = document.getElementById('registration_form_user_name').value;
    const password = document.getElementById('registration_form_password').value;
    const confirmPassword = document.getElementById('registration_form_confirm_password').value;
    const email = document.getElementById('registration_form_email').value;
    const address = document.getElementById('registration_form_address').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_name: userName,
                password: password,
                confirm_password: confirmPassword,
                email: email,
                address: address
            })
        });

        if (response.ok) {
            handleRegistrationSuccess();
        } else {
            throw new Error('Erro ao registrar usuário.');
        }
    } catch (error) {
        handleRegistrationError(error);
    }
}

function isFormValid() {
    // Verificar se todos os campos obrigatórios do formulário foram preenchidos
    const userName = document.getElementById('registration_form_user_name').value;
    const password = document.getElementById('registration_form_password').value;
    const confirmPassword = document.getElementById('registration_form_confirm_password').value;
    const email = document.getElementById('registration_form_email').value;
    const address = document.getElementById('registration_form_address').value;

    return userName && password && confirmPassword && email && address;
}

function handleRegistrationSuccess() {
    alert('Usuário registrado com sucesso!');
    document.getElementById('registration-form').reset();
}

function handleRegistrationError(error) {
    console.error('Erro durante o registro:', error);
    alert('Ocorreu um erro durante o registro. Por favor, tente novamente.');
}
