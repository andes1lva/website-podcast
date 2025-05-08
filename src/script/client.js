document.addEventListener('DOMContentLoaded', () => {
  // Registro
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const error = document.getElementById('error');
      const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirm_password: document.getElementById('confirm_password').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value || null
      };

      console.log('Dados capturados do formulário:', data);

      if (data.password !== data.confirm_password) {
        console.log('Validação falhou: senhas não coincidem');
        error.textContent = 'As senhas não coincidem';
        error.classList.remove('hidden');
        return;
      }
      if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('Validação falhou: email inválido');
        error.textContent = 'Email inválido';
        error.classList.remove('hidden');
        return;
      }

      try {
        console.log('Enviando requisição POST para http://localhost:3000/register...');
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        console.log('Status da resposta:', response.status);
        const result = await response.json();
        console.log('Resposta do servidor:', result);
        if (!response.ok) {
          console.log('Erro na resposta:', result.error);
          throw new Error(result.error);
        }
        console.log('Registro bem-sucedido:', result.message);
        alert(result.message);
        window.location.href = '/login';
      } catch (err) {
        console.error('Erro no cliente:', err.message);
        error.textContent = err.message;
        error.classList.remove('hidden');
      }
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const error = document.getElementById('error');
      const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      console.log('Dados capturados do formulário:', data);

      if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log('Validação falhou: email inválido');
        error.textContent = 'Email inválido';
        error.classList.remove('hidden');
        return;
      }

      try {
        console.log('Enviando requisição POST para http://localhost:3000/login...');
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        console.log('Status da resposta:', response.status);
        const result = await response.json();
        console.log('Resposta do servidor:', result);
        if (!response.ok) {
          console.log('Erro na resposta:', result.error);
          throw new Error(result.error);
        }
        console.log('Login bem-sucedido:', result.message);
        localStorage.setItem('jwt', result.token);
        alert(result.message);
        window.location.href = result.redirectURL;
      } catch (err) {
        console.error('Erro no cliente:', err.message);
        error.textContent = err.message;
        error.classList.remove('hidden');
      }
    });
  }

  // Menu
  if (document.getElementById('podcasts')) {
    async function loadPodcasts() {
      const token = localStorage.getItem('jwt');
      console.log('Token para /menu:', token ? 'Token presente' : 'Sem token');
      if (!token) {
        console.log('Redirecionando para login: sem token');
        window.location.href = '/login';
        return;
      }

      try {
        console.log('Enviando requisição GET para http://localhost:3000/menu...');
        const response = await fetch('http://localhost:3000/menu', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Status da resposta:', response.status);
        if (!response.ok) {
          console.log('Erro na resposta: acesso negado');
          throw new Error('Acesso negado');
        }
        console.log('Menu carregado com sucesso');
        document.getElementById('podcasts').innerHTML = '<p>Lista de podcasts em breve!</p>';
      } catch (err) {
        console.error('Erro no cliente:', err.message);
        document.getElementById('podcasts').innerHTML = `<p class="text-red-600">${err.message}</p>`;
      }
    }

    loadPodcasts();

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
      console.log('Executando logout: removendo token');
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    });
  }
});