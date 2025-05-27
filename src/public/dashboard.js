document.addEventListener('DOMContentLoaded', () => {
  // Funções auxiliares para exibir mensagens de erro e loading
  const showError = (el, msg) => {
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = '#ff0000'; // Vermelho para erro
  };

  const showLoading = (el) => {
    el.textContent = 'Carregando...';
    el.style.display = 'block';
    el.style.color = '#007bff'; // Azul para loading
  };

  const hideLoading = (el) => {
    el.style.display = 'none';
  };

  // Sidebar Toggle
  const sidebarToggle = document.querySelector('#sidebarToggle');
  const sidebarPanel = document.querySelector('#sidebarPanel');
  if (sidebarToggle && sidebarPanel) {
    sidebarToggle.addEventListener('click', () => {
      sidebarPanel.classList.toggle('active');
    });
  }

  // Busca
  const searchIcon = document.querySelector('.search-icon');
  const searchInput = document.querySelector('.search-input');
  if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', () => {
      searchInput.classList.toggle('active');
      if (searchInput.classList.contains('active')) {
        searchInput.focus();
      }
    });
  }

  // Filtros de Podcasts (aplicável em podcasts.html)
  const filterButtons = document.querySelectorAll('.filters button');
  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.podcast-card').forEach(card => {
          const tags = card.getAttribute('data-tags') || '';
          card.style.display = filter === 'all' || tags.includes(filter) ? 'block' : 'none';
        });
      });
    });
  }

  // Carregar Transcrição (aplicável em podcasts.html)
  const transcriptDetails = document.querySelectorAll('.podcast-card details');
  transcriptDetails.forEach(detail => {
    detail.addEventListener('toggle', (e) => {
      const transcriptDiv = e.target.querySelector('.transcript');
      if (detail.open && !transcriptDiv.dataset.loaded) {
        showLoading(transcriptDiv);
        const transcriptUrl = e.target.parentElement.dataset.transcriptUrl;
        if (transcriptUrl) {
          fetch(transcriptUrl)
            .then(response => response.text())
            .then(text => {
              transcriptDiv.textContent = text;
              transcriptDiv.dataset.loaded = 'true';
              hideLoading(transcriptDiv);
            })
            .catch(err => {
              showError(transcriptDiv, 'Erro ao carregar transcrição.');
              console.error('Erro ao carregar transcrição:', err);
            });
        } else {
          showError(transcriptDiv, 'Transcrição não disponível.');
        }
      }
    });
  });

  // Logout (assumindo autenticação JWT)
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Sair';
  logoutBtn.className = 'btn btn-danger mt-3';
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  });

  const nav = document.querySelector('.navbar-nav');
  if (nav) {
    nav.appendChild(logoutBtn);
  }
});