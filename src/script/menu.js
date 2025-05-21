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

async function loadTranscript(videoId, container) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=AIzaSyDJhisJc1nIRttiF_O1HbIodRdfu_Mszy0`
    );
    const data = await response.json();
    const captionTrack = data.items.find(item => item.snippet.language === 'pt');
    if (!captionTrack) {
      container.textContent = 'Transcrição não disponível.';
      return;
    }
    const captionId = captionTrack.id;
    const transcriptResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=AIzaSyDJhisJc1nIRttiF_O1HbIodRdfu_Mszy0`
    );
    const transcriptText = await transcriptResponse.text();
    container.textContent = transcriptText;
  } catch (error) {
    console.error('Erro ao carregar transcrição:', error);
    container.textContent = 'Erro ao carregar transcrição.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const podcastCards = document.querySelectorAll('.podcast-card');
  podcastCards.forEach(card => {
    const videoId = card.getAttribute('data-video-id');
    const transcriptContainer = card.querySelector('.transcript');
    if (videoId && transcriptContainer) {
      card.querySelector('details').addEventListener('toggle', () => {
        if (card.querySelector('details').open && !transcriptContainer.textContent) {
          loadTranscript(videoId, transcriptContainer);
        }
      });
    }
  });
});

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado. Inicializando funcionalidades...');
    setupSidebarToggle();
    setupSearch();
    setupFilters();
});

