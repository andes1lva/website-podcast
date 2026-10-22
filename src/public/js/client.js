// Configuração dinâmica da URL do Back-end com base no domínio do Front-end
const API_URL = 'https://webpodcast-staging.onrender.com';
const AuthService = {
    async register(data) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        let serverResponseData = {};

        try {
            serverResponseData = text ? JSON.parse(text) : {};

        } catch (e) {
            console.error("Resposta do servidor não é um JSON válido:", text);
            serverResponseData = { error: "Erro na resposta do servidor." };
        }

        return { ok: response.ok, data: serverResponseData };

    },

    async login(credentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const text = await response.text();
        let serverResponseData = {};

        try {
            serverResponseData = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error("Resposta do servidor não é um JSON válido:", text);
            serverResponseData = { error: "Erro na resposta do servidor." };
        }

        return { ok: response.ok, data: serverResponseData };
    },

    async fetchMenu(token) {
        return await fetch(`${API_URL}/menu`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};

const UI = {
    showError: (message) => {
        const errEl = document.getElementById('error');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.remove('hidden');
        }
    },
    clearError: () => {
        document.getElementById('error')?.classList.add('hidden');
    },
    toggleLoading: (isLoading, btnId) => {
        const btn = document.getElementById(btnId);
        const loader = document.getElementById('loading');
        if (btn) btn.disabled = isLoading;
        if (loader) isLoading ? loader.classList.remove('hidden') : loader.classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username')?.value;
            const email = document.getElementById('email')?.value;
            const address = document.getElementById('address')?.value;
            const password = document.getElementById('password')?.value;

            if (!username || !email || !address || !password) {
                console.error('[ERRO] Preencha todos os campos obrigatórios.');
                UI.showError('Por favor, preencha todos os campos.');
                return;
            }


            UI.clearError();
            UI.toggleLoading(true, 'btnRegister');

            const data = {
                username: username,
                email: email,
                address: address,
                password: password,
            };

            try {
                const res = await AuthService.register(data);

                if (!res.ok) throw new Error(res.data.error || 'Erro no cadastro');

                alert('Cadastro realizado com sucesso!');
                window.location.href = '/login.html';
            } catch (err) {
                UI.showError(err.message);
                console.error('[CLIENTE] Detalhes do Erro:', err);
            } finally {
                UI.toggleLoading(false, 'btnRegister');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login_email')?.value;
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                alert('E-mail ou senha incorretos!!');
                return;
            }

            if (email.trim() !== "" && password.trim() !== "") {
                alert('Aguarde... entrando no portalcast');
                await sleep(3000);
                window.location.href = '/dashboard.html';
            }


            try {
                const res = await AuthService.login({ email, password });

                if (res.ok) {
                    localStorage.setItem('jwt', res.data.token);
                    window.location.href = '/dashboard.html';
                } else {
                    alert('Erro: ' + res.data.error);
                }
            } catch (err) {
                console.error('Erro na autenticação do usuário:', err);
            }
        });
    }

    document.getElementById('logout')?.addEventListener('click', () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
    });
});
