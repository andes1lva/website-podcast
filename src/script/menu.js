console.log('script.js carregado em', new Date().toLocaleString());

// Função para verificar se um elemento existe
function checkElement(selector, name) {
    const element = document.querySelector(selector);
    if (!element) {
        console.error(`Elemento ${name} (${selector}) não encontrado no DOM`);
    } else {
        console.log(`Elemento ${name} (${selector}) encontrado`);
    }
    return element;
}

// Função para configurar o toggle da sidebar
function setupSidebarToggle() {
    const toggleButton = checkElement('#sidebarToggle', 'Botão de toggle da sidebar');
    const sidebarPanel = checkElement('#sidebarPanel', 'Painel da sidebar');

    if (toggleButton && sidebarPanel) {
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Sidebar toggle clicado');
            sidebarPanel.classList.toggle('active');
            console.log('Classe .active do #sidebarPanel:', sidebarPanel.classList.contains('active') ? 'adicionada' : 'removida');
        });
    }
}

// Função para configurar a busca
function setupSearch() {
    //verificação de existência de classes search-icon e search-input//
    const searchIcon = checkElement('.search-icon', 'Ícone de busca');
    const searchInput = checkElement('.search-input', 'Campo de busca');

    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Ícone de busca clicado');
            searchInput.classList.toggle('active');
            if (searchInput.classList.contains('active')) {
                searchInput.focus();
                console.log('Campo de busca ativado e focado');
            } else {
                console.log('Campo de busca desativado');
            }
        });

        document.addEventListener('click', function(event) {
            if (!event.target.closest('.search-container') && searchInput.classList.contains('active')) {
                console.log('Clique fora da busca');
                searchInput.classList.remove('active');
            }
        });
    }
}

// Função para configurar os filtros
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filters button');
    if (filterButtons.length === 0) {
        console.error('Nenhum botão de filtro encontrado (.filters button)');
        return;
    }
    console.log(`Encontrados ${filterButtons.length} botões de filtro`);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter').toLowerCase();
            console.log('Filtro clicado:', filter);

            const podcastCards = document.querySelectorAll('.podcast-card');
            if (podcastCards.length === 0) {
                console.error('Nenhum .podcast-card encontrado');
                return;
            }
            console.log(`Encontrados ${podcastCards.length} podcast cards`);

            podcastCards.forEach(card => {
                const tags = card.getAttribute('data-tags').toLowerCase().split(',');
                console.log(`Tags do card ${card.querySelector('h3').textContent}:`, tags);

                if (filter === 'all' || tags.includes(filter)) {
                    card.style.display = 'block';
                    console.log(`Card ${card.querySelector('h3').textContent} exibido`);
                } else {
                    card.style.display = 'none';
                    console.log(`Card ${card.querySelector('h3').textContent} escondido`);
                }
            });
        });
    });
}

console.log('transcript.js carregado em', new Date().toLocaleString());

// Função para validar videoId
function isValidYouTubeId(videoId) {
  return /^[A-Za-z0-9_-]{11}$/.test(videoId);
}

// Função para carregar transcrição de vídeo do YouTube
async function loadYouTubeTranscript(videoId, container) {
  console.log(`Iniciando carregamento da transcrição para o vídeo ${videoId}`);
  container.classList.add('loading');

  // Validar videoId
  if (!videoId || !isValidYouTubeId(videoId)) {
    console.error(`ID do vídeo inválido: ${videoId}`);
    container.textContent = 'ID do vídeo inválido.';
    container.classList.remove('loading');
    return;
  }

  const apiKey = 'AIzaSyDJhisJc1nIRttiF_O1HbIodRdfu_Mszy0'; // Substitua pela sua chave ativa
  try {
    // Buscar legendas disponíveis
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na requisição de legendas:', errorData);
      throw new Error(`Erro ${response.status}: ${response.statusText} - ${JSON.stringify(errorData.error || {})}`);
    }
    const data = await response.json();
    console.log('Resposta da API de legendas:', data);

    // Procurar legenda em português
    const captionTrack = data.items.find(
      item => item.snippet.language === 'en' || item.snippet.language === 'en'
    );
    if (!captionTrack) {
    console.warn(`Nenhuma legenda em português encontrada para o vídeo ${videoId}. Tentando inglês...`);
    captionTrack = data.items.find(item => item.snippet.language === 'en');
    // ...
}

    // Buscar o conteúdo da transcrição
    const captionId = captionTrack.id;
    const transcriptResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${encodeURIComponent(videoId)}?E96YS8IQSHs=${encodeURIComponent(apiKey)}`
    );
    if (!transcriptResponse.ok) {
      const errorData = await transcriptResponse.json().catch(() => ({}));
      console.error('Erro ao buscar transcrição:', errorData);
      throw new Error(`Erro ${transcriptResponse.status}: ${transcriptResponse.statusText} - ${JSON.stringify(errorData.error || {})}`);
    }
    const transcriptText = await transcriptResponse.text();

    // Processar SRT para remover carimbos de tempo
    const cleanTranscript = transcriptText
      .split('\n')
      .filter(line => !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2},\d{3} -->/) && line.trim() !== '')
      .join(' ');
    console.log(`Transcrição processada para o vídeo ${videoId}:`, cleanTranscript);
    container.textContent = cleanTranscript;
  } catch (error) {
    console.error(`Erro ao carregar transcrição para o vídeo ${videoId}:`, error);
    let errorMessage = 'Erro ao carregar transcrição. Tente novamente.';
    if (error.message.includes('403')) {
      errorMessage = 'Acesso negado. Verifique a chave da API ou as restrições.';
    } else if (error.message.includes('400')) {
      errorMessage = 'Requisição inválida. Verifique o ID do vídeo ou a configuração da API.';
    }
    container.textContent = errorMessage;
  } finally {
    container.classList.remove('loading');
  }
}

// Função para carregar transcrição de áudio local
async function loadAudioTranscript(transcriptUrl, container) {
  console.log(`Iniciando carregamento da transcrição para ${transcriptUrl}`);
  container.classList.add('loading');
  try {
    const response = await fetch(transcriptUrl);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const transcriptText = await response.text();
    console.log(`Transcrição carregada de ${transcriptUrl}:`, transcriptText);
    container.textContent = transcriptText;
  } catch (error) {
    console.error(`Erro ao carregar transcrição de ${transcriptUrl}:`, error);
    container.textContent = 'Erro ao carregar transcrição. Verifique se o arquivo existe.';
  } finally {
    container.classList.remove('loading');
  }
}

// Inicializar transcrições
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando transcrições...');
  const podcastCards = document.querySelectorAll('.podcast-card');
  console.log(`Encontrados ${podcastCards.length} cards de podcast`);

  podcastCards.forEach(card => {
    const videoId = card.getAttribute('data-video-id');
    const transcriptUrl = card.getAttribute('data-transcript-url');
    const transcriptContainer = card.querySelector('.transcript');

    if (!transcriptContainer) {
      console.error('Elemento .transcript não encontrado no card:', card);
      return;
    }

    const details = card.querySelector('details');
    if (!details) {
      console.error('Elemento <details> não encontrado no card:', card);
      return;
    }

    details.addEventListener('toggle', () => {
      if (details.open && !transcriptContainer.textContent) {
        console.log('Details aberto, carregando transcrição...');
        if (videoId) {
          loadYouTubeTranscript(videoId, transcriptContainer);
        } else if (transcriptUrl) {
          loadAudioTranscript(transcriptUrl, transcriptContainer);
        } else {
          console.warn('Nenhum videoId ou transcriptUrl encontrado no card:', card);
          transcriptContainer.textContent = 'Transcrição não configurada.';
        }
      }
    });
  });
});

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado. Inicializando funcionalidades...');
    setupSidebarToggle();
    setupSearch();
    setupFilters();
});

