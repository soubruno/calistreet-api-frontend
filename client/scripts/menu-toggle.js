document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-icon-static'); 
    const sidebar = document.getElementById('sidebar');
    const closeMenu = document.getElementById('close-menu');

    if (menuToggle && sidebar && closeMenu) {
        
        function toggleMenu() {
            sidebar.classList.toggle('active');
            // Adiciona classe ao body para bloquear o scroll do fundo (melhor UX)
            document.body.classList.toggle('menu-open'); 
        }

        menuToggle.addEventListener('click', toggleMenu);
        closeMenu.addEventListener('click', toggleMenu);
    }
});