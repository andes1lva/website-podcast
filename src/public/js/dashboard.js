document.addEventListener('DOMContentLoaded', () => {
    const btnAbrir = document.getElementById('btnAbrirConteudo');
    const cardAcesso = document.getElementById('cardAcesso');
    let inatividadeTimeout;

    // 1. FUNÇÃO DE LOGOUT POR SEGURANÇA
    const finalizarSessao = () => {
        localStorage.removeItem('session_expires'); // Limpa dados sensíveis
        alert("Sessão finalizada por inatividade ou expiração.");
        window.location.href = 'login.html';
    };

    // 2. MONITOR DE INATIVIDADE (10 Minutos)
    const resetarCronometro = () => {
        clearTimeout(inatividadeTimeout);
        inatividadeTimeout = setTimeout(finalizarSessao, 600000); 
    };

    // Detecta qualquer movimento ou tecla
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => 
        window.addEventListener(evt, resetarCronometro)
    );
    resetarCronometro();

    // 3. VALIDAÇÃO AO CLICAR NO BOTÃO
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            const agora = Date.now();
            const expiraEm = localStorage.getItem('session_expires');

            // Verifica se o tempo do servidor já passou
            if (expiraEm && agora > parseInt(expiraEm)) {
                finalizarSessao();
                return;
            }

            // Simula carregamento de dados periciais
            btnAbrir.innerHTML = '<i class="fas fa-sync fa-spin"></i> Descriptografando...';
            btnAbrir.disabled = true;

            setTimeout(() => {
                cardAcesso.innerHTML = `
                    <h5 class="text-success font-weight-bold mb-3"><i class="fas fa-unlock"></i> Acesso Liberado</h5>
                    <div class="alert alert-dark bg-black border-secondary">
                        <p class="small mb-1"><strong>Arquivo:</strong> Analise_Forense_Redes.mp3</p>
                        <audio controls class="w-100 mt-2">
                            <source src="#" type="audio/mpeg">
                        </audio>
                    </div>
                    <button class="btn btn-sm btn-link text-muted" onclick="location.reload()">Bloquear Canal</button>
                `;
            }, 1200);
        });
    }

    // Controle do Player da Sidebar
    const playerPlay = document.getElementById('playerPlay');
    if (playerPlay) {
        playerPlay.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-play');
            icon.classList.toggle('fa-pause');
        });
    }
});