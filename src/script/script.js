document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.querySelector('#registration-form');

    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
});

async function handleRegistration(event) {
    event.preventDefault();

    const userName = document.querySelector('#registration_form_user_name').value;
    const password = document.querySelector('#registration_form_password').value;
    const confirmPassword = document.querySelector('#registration_form_confirm_password').value;
    const email = document.querySelector('#registration_form_email').value;
    const address = document.querySelector('#registration_form_address').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_name: userName, password, confirm_password: confirmPassword, email, address })
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

function handleRegistrationSuccess() {
    alert('Usuário registrado com sucesso!');
    document.querySelector('#registration-form').reset();
}

function handleRegistrationError(error) {
    console.error('Erro durante o registro:', error);
    alert('Ocorreu um erro durante o registro. Por favor, tente novamente.');
}