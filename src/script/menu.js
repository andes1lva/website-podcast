document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarPanel = document.getElementById('sidebarPanel');

    sidebarToggle.addEventListener('click', function () {
        sidebarPanel.classList.toggle('active');
    });

    // Fechar o painel ao clicar fora
    document.addEventListener('click', function (event) {
        if (!sidebarPanel.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebarPanel.classList.remove('active');
        }
    });
});