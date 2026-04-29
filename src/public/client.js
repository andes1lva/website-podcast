document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE REGISTRO ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            UI.clearError();
            UI.toggleLoading(true, 'btnRegister');

           // ... dentro do registerForm.addEventListener
                const data = {
                    username: document.getElementById('username').value,
                    cpf: document.getElementById('cpf').value, // ADICIONE ESTA LINHA
                    password: document.getElementById('password').value,
                    confirm_password: document.getElementById('confirm_password').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value || null
                };

            // Validações Rápidas
            if (data.password !== data.confirm_password) {
                UI.showError('As senhas não coincidem');
                return UI.toggleLoading(false, 'btnRegister');
            }

            try {
                const res = await AuthService.register(data);
                if (!res.ok) throw new Error(res.data.error);
                
                alert(res.data.message);
                window.location.href = '/login';
            } catch (err) {
                UI.showError(err.message);
            } finally {
                UI.toggleLoading(false, 'btnRegister');
            }
        });
    }

    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            UI.clearError();
            UI.toggleLoading(true);

            const credentials = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const res = await AuthService.login(credentials);
                if (!res.ok) throw new Error(res.data.error);

                localStorage.setItem('jwt', res.data.token);
                window.location.href = res.data.redirectURL;
            } catch (err) {
                UI.showError(err.message);
            } finally {
                UI.toggleLoading(false);
            }
        });
    }

    // --- LÓGICA DO MENU / DASHBOARD ---
    const podcastContainer = document.getElementById('podcasts');
    if (podcastContainer) {
        const loadDashboard = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return window.location.href = '/login';

            try {
                const response = await AuthService.fetchMenu(token);
                if (!response.ok) throw new Error('Acesso negado');
                
                podcastContainer.innerHTML = '<p>Lista de podcasts carregada com sucesso!</p>';
            } catch (err) {
                podcastContainer.innerHTML = `<p class="text-red-600">${err.message}</p>`;
            }
        };
        loadDashboard();
    }

    // Logout Global
    document.getElementById('logout')?.addEventListener('click', () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
    });
});