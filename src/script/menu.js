console.log('[MENU] menu.js carregado em', new Date().toLocaleString());

// Função para verificar se um elemento existe
const checkElement = (selector, name) => {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`[MENU] Elemento ${name} (${selector}) não encontrado no DOM`);
  } else {
    console.log(`[MENU] Elemento ${name} (${selector}) encontrado`);
  }
  return element;
};

// Função para mostrar feedback de erro
const showError = (message, errorElement) => {
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
};

// Função para gerenciar estado de carregamento
const showLoading = (loadingElement, targetElement) => {
  loadingElement.classList.remove('hidden');
  if (targetElement) targetElement.disabled = true;
};

const hideLoading = (loadingElement, targetElement) => {
  loadingElement.classList.add('hidden');
  if (targetElement) targetElement.disabled = false;
};

// Configurar toggle da sidebar
const setupSidebarToggle = () => {
  const toggleButton = checkElement('#sidebarToggle', 'Botão de toggle da sidebar');
  const sidebarPanel = checkElement('#sidebarPanel', 'Painel da sidebar');

  if (toggleButton && sidebarPanel) {
    toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[MENU] Sidebar toggle clicado');
      sidebarPanel.classList.toggle('active');
      console.log('[MENU] Classe .active do #sidebarPanel:', sidebarPanel.classList.contains('active') ? 'adicionada' : 'removida');
    });
  }
};

// Configurar busca
const setupSearch = () => {
  const searchIcon = checkElement('.search-icon', 'Ícone de busca');
  const searchInput = checkElement('.search-input', 'Campo de busca');

  if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[MENU] Ícone de busca clicado');
      searchInput.classList.toggle('active');
      if (searchInput.classList.contains('active')) {
        searchInput.focus();
        console.log('[MENU] Campo de busca ativado e focado');
      } else {
        console.log('[MENU] Campo de busca desativado');
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.search-container') && searchInput.classList.contains('active')) {
        console.log('[MENU] Clique fora da busca');
        searchInput.classList.remove('active');
      }
    });
  }
};

// Configurar filtros
const setupFilters = () => {
  const filterButtons = document.querySelectorAll('.filters button');
  if (filterButtons.length === 0) {
    console.error('[MENU] Nenhum botão de filtro encontrado (.filters button)');
    return;
  }
  console.log(`[MENU] Encontrados ${filterButtons.length} botões de filtro`);

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter').toLowerCase();
      console.log('[MENU] Filtro clicado:', filter);

      const podcastCards = document.querySelectorAll('.podcast-card');
      if (podcastCards.length === 0) {
        console.error('[MENU] Nenhum .podcast-card encontrado');
        return;
      }
      console.log(`[MENU] Encontrados ${podcastCards.length} podcast cards`);

      podcastCards.forEach(card => {
        const tags = card.getAttribute('data-tags')?.toLowerCase().split(',') || [];
        console.log(`[MENU] Tags do card ${card.querySelector('h3')?.textContent || 'desconhecido'}:`, tags);

        if (filter === 'all' || tags.includes(filter)) {
          card.style.display = 'block';
          console.log(`[MENU] Card ${card.querySelector('h3')?.textContent || 'desconhecido'} exibido`);
        } else {
          card.style.display = 'none';
          console.log(`[MENU] Card ${card.querySelector('h3')?.textContent || 'desconhecido'} escondido`);
        }
      });
    });
  });
};

// Validar ID do YouTube
const isValidYouTubeId = (videoId) => /^[A-Za-z0-9_-]{11}$/.test(videoId);

// Carregar transcrição do YouTube
const loadYouTubeTranscript = async (videoId, container, errorElement, loadingElement) => {
  console.log(`[TRANSCRIPT] Iniciando carregamento da transcrição para vídeo ${videoId}`);
  showLoading(loadingElement, container);

  if (!videoId || !isValidYouTubeId(videoId)) {
    console.error('[TRANSCRIPT] ID do vídeo inválido:', videoId);
    showError('ID do vídeo inválido.', errorElement);
    hideLoading(loadingElement, container);
    return;
  }

  if (!window.accessToken) {
    console.error('[TRANSCRIPT] Nenhum token de acesso disponível. Faça login com Google.');
    showError('Faça login com Google para acessar a transcrição.', errorElement);
    hideLoading(loadingElement, container);
    return;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${encodeURIComponent(videoId)}&key=${encodeURIComponent('AIzaSyDJhisJc1nIRttiF_O1HbIodRdfu_Mszy0')}`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[TRANSCRIPT] Erro na requisição de legendas:', errorData);
      throw new Error(`Erro ${response.status}: ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    console.log('[TRANSCRIPT] Resposta da API de legendas:', data);

    let captionTrack = data.items.find(item => item.snippet.language === 'pt') ||
                      data.items.find(item => item.snippet.language === 'en');
    if (!captionTrack) {
      console.warn(`[TRANSCRIPT] Nenhuma legenda em português ou inglês encontrada para vídeo ${videoId}`);
      showError('Nenhuma legenda disponível em português ou inglês.', errorElement);
      hideLoading(loadingElement, container);
      return;
    }

    const captionId = captionTrack.id;
    const transcriptResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${encodeURIComponent(captionId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.accessToken}`,
          'Accept': 'application/json'
        }
      }
    );
    if (!transcriptResponse.ok) {
      const errorData = await transcriptResponse.json().catch(() => ({}));
      console.error('[TRANSCRIPT] Erro ao buscar transcrição:', errorData);
      throw new Error(`Erro ${transcriptResponse.status}: ${errorData.error?.message || transcriptResponse.statusText}`);
    }
    const transcriptText = await transcriptResponse.text();

    const cleanTranscript = transcriptText
      .split('\n')
      .filter(line => !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2},\d{3} -->/) && line.trim())
      .join(' ');
    console.log(`[TRANSCRIPT] Transcrição processada para vídeo ${videoId}:`, cleanTranscript);
    container.textContent = cleanTranscript;
  } catch (error) {
    console.error(`[TRANSCRIPT] Erro ao carregar transcrição para vídeo ${videoId}:`, error);
    let errorMessage = 'Erro ao carregar transcrição. Tente novamente.';
    if (error.message.includes('403')) {
      errorMessage = 'Acesso negado. Verifique as permissões do token.';
    } else if (error.message.includes('401')) {
      errorMessage = 'Autenticação necessária. Faça login com Google.';
    } else if (error.message.includes('400')) {
      errorMessage = 'Requisição inválida. Verifique o ID do vídeo.';
    }
    showError(errorMessage, errorElement);
  } finally {
    hideLoading(loadingElement, container);
  }
};

// Inicializar Google Sign-In
const initGoogleSignIn = () => {
  gapi.load('auth2', () => {
    gapi.auth2.init({
      client_id: '410645476258-e647i57asbp21nd5jdtkqd5qg35civ93.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/youtube.readonly'
    }).then(() => {
      console.log('[MENU] Google Sign-In inicializado');
      const auth = gapi.auth2.getAuthInstance();
      if (auth.isSignedIn.get()) {
        console.log('[MENU] Usuário já autenticado');
        window.accessToken = auth.currentUser.get().getAuthResponse().access_token;
        console.log('[MENU] Token de acesso:', window.accessToken);
      } else {
        console.log('[MENU] Usuário não autenticado');
      }
    }).catch(error => {
      console.error('[MENU] Erro ao inicializar Google Sign-In:', error);
    });
  });
};

// Função para fazer login com Google
const signIn = () => {
  const auth = gapi.auth2.getAuthInstance();
  auth.signIn().then(() => {
    console.log('[MENU] Usuário autenticado com sucesso');
    window.accessToken = auth.currentUser.get().getAuthResponse().access_token;
    console.log('[MENU] Token de acesso:', window.accessToken);
  }).catch(error => {
    console.error('[MENU] Erro ao fazer login:', error);
  });
};

// Inicializar transcrições
const setupTranscripts = () => {
  const podcastCards = document.querySelectorAll('.podcast-card');
  console.log(`[MENU] Encontrados ${podcastCards.length} cards de podcast`);

  podcastCards.forEach(card => {
    const videoId = card.getAttribute('data-video-id');
    const transcriptContainer = card.querySelector('.transcript');
    const errorElement = card.querySelector('.error');
    const loadingElement = card.querySelector('.loading');

    if (!transcriptContainer || !errorElement || !loadingElement) {
      console.error('[MENU] Elementos .transcript, .error ou .loading não encontrados no card:', card);
      return;
    }

    const details = card.querySelector('details');
    if (!details) {
      console.error('[MENU] Elemento <details> não encontrado no card:', card);
      return;
    }

    details.addEventListener('toggle', () => {
      if (details.open && !transcriptContainer.textContent) {
        console.log('[MENU] Details aberto, carregando transcrição...');
        if (videoId) {
          loadYouTubeTranscript(videoId, transcriptContainer, errorElement, loadingElement);
        } else {
          console.warn('[MENU] Nenhum videoId encontrado no card:', card);
          showError('Transcrição não configurada.', errorElement);
        }
      }
    });
  });
};

// Inicializar funcionalidades
document.addEventListener('DOMContentLoaded', () => {
  console.log('[MENU] DOM carregado. Inicializando funcionalidades...');
  setupSidebarToggle();
  setupSearch();
  setupFilters();
  setupTranscripts();

  const loginButton = checkElement('#googleSignInButton', 'Botão de login com Google');
  if (loginButton) {
    loginButton.addEventListener('click', signIn);
  }

  // Carregar Google API e inicializar Sign-In
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.onload = initGoogleSignIn;
  document.head.appendChild(script);
});