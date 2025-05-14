document.querySelector('.search-icon').addEventListener('click', function () {
    const searchInput = document.querySelector('.search-input');
    searchInput.classList.toggle('active');
    if (searchInput.classList.contains('active')) {
        searchInput.focus();
    }
});

document.querySelector('.search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        this.classList.remove('active');
    }
});

document.addEventListener('click', function (e) {
    const searchContainer = document.querySelector('.search-container');
    if (!searchContainer.contains(e.target)) {
        document.querySelector('.search-input').classList.remove('active');
    }
});

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