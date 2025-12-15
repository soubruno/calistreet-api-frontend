document.addEventListener('DOMContentLoaded', () => {
    const isPublicRoute =
        window.location.pathname.includes('index.html') ||
        window.location.pathname.includes('cadastro.html');

    if (!isPublicRoute) {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.warn("Acesso negado: Token ausente.");
            window.location.href = 'index.html';
        }
    }
});