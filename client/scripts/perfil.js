document.addEventListener('DOMContentLoaded', async () => {
    // --- Auth guard ---
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const usuario = await fetchAuthenticated('/usuarios/me', 'GET');

        console.log('Usuário logado:', usuario);

        renderizarPerfil(usuario);
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Erro ao carregar dados do perfil.');
    }
});

/* ------------------------------------------------ */
/* Renderização do perfil */
/* ------------------------------------------------ */
function renderizarPerfil(usuario) {
    if (!usuario) return;

    // Nome
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = usuario.nome || 'Usuário';
    }

    // Membro desde
    const memberSinceEl = document.getElementById('member-since');
    if (memberSinceEl && usuario.createdAt) {
        const ano = new Date(usuario.createdAt).getFullYear();
        memberSinceEl.textContent = `Membro desde ${ano}`;
    }

    // Stats (podem vir nulos no backend)
    setText('user-peso', usuario.peso ? `${usuario.peso} kg` : 'Não informado');
    setText('user-altura', usuario.altura ? `${usuario.altura} cm` : 'Não informado');
    setText('user-objetivo', usuario.objetivo || 'Não informado');
    setText('user-equipamentos', usuario.equipamentos || 'Não informado');

    bindEditarPerfil();
}

/* ------------------------------------------------ */
/* Botão editar perfil */
/* ------------------------------------------------ */
function bindEditarPerfil() {
    const btnEdit = document.querySelector('.btn-edit-profile');
    if (!btnEdit) return;

    btnEdit.addEventListener('click', () => {
        alert('Tela de edição de perfil ainda será implementada.');
        // Futuro:
        // window.location.href = 'perfil-editar.html';
    });
}

/* ------------------------------------------------ */
/* Helper seguro */
/* ------------------------------------------------ */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}
