document.addEventListener('DOMContentLoaded', () => {
  const showError = (message, errorElement) => {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  };

  const showLoading = (loadingElement, submitBtn) => {
    loadingElement.classList.remove('hidden');
    submitBtn.disabled = true;
  };

  const hideLoading = (loadingElement, submitBtn) => {
    loadingElement.classList.add('hidden');
    submitBtn.disabled = false;
  };

  // Registro
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[CLIENTE] Formulário de registro enviado');
      const error = document.getElementById('error');
      const loading = document.getElementById('loading');
      const submitBtn = document.getElementById('submitBtn');
      error.classList.add('hidden');
      showLoading(loading, submitBtn);

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
        showError('As senhas não coincidem', error);
        hideLoading(loading, submitBtn);
        return;
      }
      if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('[CLIENTE] Validação falhou: email inválido');
        showError('Email inválido', error);
        hideLoading(loading, submitBtn);
        return;
      }

      try {
        console.log('[CLIENTE] Iniciando fetch para /register');
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        console.log('[CLIENTE] Resposta recebida, status:', response.status);
        const result = await response.json();
        if (!response.ok) {
          console.log('[CLIENTE] Erro na resposta:', result.error);
          throw new Error(result.error);
        }
        console.log('[CLIENTE] Registro bem-sucedido:', result.message);
        alert(result.message);
        window.location.href = '/login';
      } catch (err) {
        console.error('[CLIENTE] Erro no cliente:', err.message);
        showError(err.message || 'Erro ao conectar ao servidor', error);
      } finally {
        hideLoading(loading, submitBtn);
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
      const loading = document.getElementById('loading');
      const submitBtn = document.getElementById('submitBtn');
      error.classList.add('hidden');
      showLoading(loading, submitBtn);

      const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      console.log('[CLIENTE] Dados capturados do formulário:', data);

      if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('[CLIENTE] Validação falhou: email inválido');
        showError('Email inválido', error);
        hideLoading(loading, submitBtn);
        return;
      }

      try {
        console.log('[CLIENTE] Iniciando fetch para /login');
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        console.log('[CLIENTE] Resposta recebida, status:', response.status);
        const result = await response.json();
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
        showError(err.message || 'Erro ao conectar ao servidor', error);
      } finally {
        hideLoading(loading, submitBtn);
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
        window.location.href = '/login';
        return;
      }

      try {
        console.log('[CLIENTE] Iniciando fetch para /menu');
        const response = await fetch('/menu', {
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
      window.location.href = '/login';
    });
  }
});
