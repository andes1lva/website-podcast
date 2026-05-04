const AuthService = {
    async register(userData) {
        // 1. Verifique se a URL começa com /auth
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        // 2. CORREÇÃO: Leia o texto APENAS UMA VEZ
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
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(credentials)
        });

        const text = await response.text();
        const serverResponseData = text ? JSON.parse(text) : {};

        // REMOVIDO: await response.json() que causava erro de leitura dupla
        return { ok: response.ok, data: serverResponseData };
    },


    async fetchMenu ( token) {
        return await fetch('/menu',{
            headers: {'Authorization': `Bearer ${token}` 
        }
    });
   }
};


/**
 * 2. CAMADA DE INTERFACE (UI)
 * Centraliza a manipulação do HTML para evitar repetição de código.
 */
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
    // Localize o formulário primeiro
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');


    console.log('[CLIENTE] Sistema iniciado e DOM carregado.');

// --- LÓGICA DE REGISTRO (Sincronizada com seu HTML) ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Captura apenas o que existe no seu formulário
        const usernameEl = document.getElementById('username');
        const emailEl = document.getElementById('email');
        const addressEl = document.getElementById('address');
        const passwordEl = document.getElementById('password');

        // 2. Validação de segurança (Anti-Null)
        if (!usernameEl || !emailEl || !addressEl || !passwordEl) {
            console.error('[ERRO] Verifique se os IDs no HTML mudaram.');
            return;
        }

        UI.clearError();
        // O ID do botão no seu HTML é btnRegister, então aqui está correto
        UI.toggleLoading(true, 'btnRegister');

        const  cpfEl = document.getElementById('cpf');
        const data = {
            username: usernameEl.value,
            email: emailEl.value,
            address: addressEl.value,
            password: passwordEl.value
        };

        try {
            // Chama o serviço de registro passando apenas esses 4 campos
            const res = await AuthService.register(data);
            
            if (!res.ok) throw new Error(res.data.error || 'Erro no cadastro');
            
            alert('Cadastro realizado com sucesso!');
            window.location.href = '/login';
       } catch (err) {
            UI.showError(err.message);
            console.error('[CLIENTE] Detalhes do Erro:', err); 
        } finally { // <--- Garanta que a chave do catch esteja fechada antes do finally
            UI.toggleLoading(false, 'btnRegister');
        }
    });
}
   // Exemplo de como deve estar no client.js

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login_email').value;
        const password = document.getElementById('password').value;

        try {
            // CORRETO: Aponta para a rota de API, não para o arquivo .html
            const response = await fetch('/auth/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                // Se o login funcionar, salvamos o token e redirecionamos via JS
                localStorage.setItem('jwt', result.token);
                window.location.href = '/dashboard'; // O servidor entregará o dashboard.html
            } else {
                alert('Erro: ' + result.error);
            }
        } catch (err) {
            console.error('Erro na autenticação:', err);
        }
    });
}


// --- LOGOUT ---
    document.getElementById('logout')?.addEventListener('click', () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
    });
});
