document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
});

async function handleRegistration(event) {
    event.preventDefault();

    const formData = getFormData();
    if (!isFormValid(formData)) {
        alert('Por favor, preencha todos os campos do formulário corretamente.');
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
    return Object.values(formData).every(value => value);
}

async function sendRegistrationRequest(formData) {
    return await fetch('http://localhost:3000/register', { // Certifique-se de que a URL está correta
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
}

function handleRegistrationSuccess() {
    alert('Usuário registrado com sucesso!');
    document.getElementById('registration-form').reset();
    window.location.href = '/login'; //redirecionamento para a página de login
}

function handleRegistrationError(error) {
    console.error('Erro durante o registro:', error);
    alert('Ocorreu um erro durante o registro. Por favor, tente novamente.');
}
