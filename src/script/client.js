document.addEventListener('DOMContentLoaded', () => {
  // Registro
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[CLIENTE] Formulário de registro enviado');
      const error = document.getElementById('error');
      error.classList.add('hidden');

      const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirm_password: document.getElementById('confirm_password').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value || null
      };

      console.log('[CLIENTE] Dados capturados do formulário:', data);

      if (data.password !== data.confirm_password) {
        console.log('[CLIENTE] Validação falhou: senhas não coincidem');
        error.textContent = 'As senhas não coincidem';
        error.classList.remove('hidden');
        return;
      }
      if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('[CLIENTE] Validação falhou: email inválido');
        error.textContent = 'Email inválido';
        error.classList.remove('hidden');
        return;
      }

      try {
        console.log('[CLIENTE] Iniciando fetch para http://localhost:3000/register');
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        console.log('[CLIENTE] Resposta recebida, status:', response.status);
        const result = await response.json();
        console.log('[CLIENTE] Resposta do servidor:', result);
        if (!response.ok) {
          console.log('[CLIENTE] Erro na resposta:', result.error);
          throw new Error(result.error);
        }
        console.log('[CLIENTE] Registro bem-sucedido:', result.message);
        alert(result.message);
        window.location.href = 'login.html';
      } catch (err) {
        console.error('[CLIENTE] Erro no cliente:', err.message);
        error.textContent = 'Erro ao conectar ao servidor. Verifique se o servidor está rodando na porta 3000.';
        error.classList.remove('hidden');
      }
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[CLIENTE] Formulário de login enviado');
      const error = document.getElementById('error');
      error.classList.add('hidden');
      const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      console.log('[CLIENTE] Dados capturados do formulário:', data);

      if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('[CLIENTE] Validação falhou: email inválido');
        error.textContent = 'Email inválido';
        error.classList.remove('hidden');
        return;
      }

      try {
        console.log('[CLIENTE] Iniciando fetch para http://localhost:3000/login');
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        console.log('[CLIENTE] Resposta recebida, status:', response.status);
        const result = await response.json();
        console.log('[CLIENTE] Resposta do servidor:', result);
        if (!response.ok) {
          console.log('[CLIENTE] Erro na resposta:', result.error);
          throw new Error(result.error);
        }
        console.log('[CLIENTE] Login bem-sucedido:', result.message);
        localStorage.setItem('jwt', result.token);
        alert(result.message);
        window.location.href = result.redirectURL;
      } catch (err) {
        console.error('[CLIENTE] Erro no cliente:', err.message);
        error.textContent = 'Erro ao conectar ao servidor. Verifique se o servidor está rodando na porta 3001.';
        error.classList.remove('hidden');
      }
    });
  }

  // Menu
  if (document.getElementById('podcasts')) {
    async function loadPodcasts() {
      const token = localStorage.getItem('jwt');
      console.log('[CLIENTE] Token para /menu:', token ? 'Token presente' : 'Sem token');
      if (!token) {
        console.log('[CLIENTE] Redirecionando para login: sem token');
        window.location.href = 'login.html';
        return;
      }

      try {
        console.log('[CLIENTE] Iniciando fetch para http://localhost:3000/menu');
        const response = await fetch('http://localhost:3000/menu', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('[CLIENTE] Resposta recebida, status:', response.status);
        if (!response.ok) {
          console.log('[CLIENTE] Erro na resposta: acesso negado');
          throw new Error('Acesso negado');
        }
        console.log('[CLIENTE] Menu carregado com sucesso');
        document.getElementById('podcasts').innerHTML = '<p>Lista de podcasts em breve!</p>';
      } catch (err) {
        console.error('[CLIENTE] Erro no cliente:', err.message);
        document.getElementById('podcasts').innerHTML = `<p class="text-red-600">${err.message}</p>`;
      }
    }

    loadPodcasts();

    document.getElementById('logout')?.addEventListener('click', () => {
      console.log('[CLIENTE] Executando logout: removendo token');
      localStorage.removeItem('jwt');
      window.location.href = 'login.html';
    });

   
  }
});