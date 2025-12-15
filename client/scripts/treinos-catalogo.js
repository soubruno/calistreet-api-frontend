/**
 * Redireciona para a tela de Criar/Atualizar Treino no modo de edição.
 */
function viewTreino(treinoId) {
    if (!treinoId) {
        console.error('ID do treino não informado.');
        return;
    }

    window.location.href = `treino-form.html?id=${treinoId}`;
}

/**
 * Cria dinamicamente um card de treino.
 */
function criarTreinoCard(treino) {
    const article = document.createElement('article');
    article.classList.add('treino-card');

    article.innerHTML = `
        <div class="treino-icon">
            <i class="fas fa-dumbbell"></i>
        </div>

        <div class="treino-info">
            <h3 class="treino-nome">${treino.nome}</h3>
            <p class="treino-meta">
                ${(treino.itens?.length || 0)} Exercícios | Nível ${treino.nivel}
            </p>
        </div>

        <div class="treino-actions">
            <button
                class="btn btn-primary btn-small"
                onclick="viewTreino('${treino.id}')">
                Editar
            </button>

            <button
                class="btn btn-icon btn-excluir"
                onclick="excluirTreino('${treino.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;

    return article;
}

/**
 * Renderiza a lista de treinos.
 */
function renderTreinos(treinos) {
    const lista = document.querySelector('.treinos-list');
    lista.innerHTML = '';

    if (!treinos || treinos.length === 0) {
        lista.innerHTML = `
            <p style="color:#aaa; margin-top: 20px;">
                Nenhum treino encontrado.
            </p>
        `;
        return;
    }

    treinos.forEach(treino => {
        lista.appendChild(criarTreinoCard(treino));
    });
}

/**
 * Exclui um treino.
 */
async function excluirTreino(treinoId) {
    if (!confirm('Deseja realmente excluir este treino?')) return;

    try {
        await fetchAuthenticated(`/treinos/${treinoId}`, 'DELETE');
        alert('Treino excluído com sucesso!');
        carregarMeusTreinos();
    } catch (error) {
        console.error('Erro ao excluir treino:', error);
        alert(error.message || 'Erro ao excluir treino.');
    }
}

/**
 * Lê os filtros da tela "Meus Treinos".
 */
function obterFiltrosMeusTreinos() {
    const nome = document.getElementById('filterNome')?.value?.trim();
    const nivel = document.getElementById('filterNivel')?.value;
    const dataCriacao = document.getElementById('filterData')?.value;

    const filtros = {};

    if (nome) filtros.nome = nome;
    if (nivel) filtros.nivel = nivel;
    if (dataCriacao) filtros.dataCriacao = dataCriacao;

    return filtros;
}

/**
 * Carrega os treinos do usuário aplicando filtros.
 */
async function carregarMeusTreinos() {
    try {
        const filtros = obterFiltrosMeusTreinos();
        const queryString = new URLSearchParams(filtros).toString();

        const endpoint = queryString
            ? `/treinos/meus?${queryString}`
            : `/treinos/meus`;

        const response = await fetchAuthenticated(endpoint);

        // Backend retorna ARRAY direto
        const treinos = Array.isArray(response) ? response : [];

        document.querySelector('.intro-title').textContent =
            `Meus Treinos (${treinos.length})`;

        renderTreinos(treinos);

    } catch (error) {
        console.error('Erro ao carregar treinos:', error);
        alert(error.message || 'Erro ao carregar treinos.');
    }
}

/**
 * Inicialização da página.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    carregarMeusTreinos();

    document
        .getElementById('applyFilters')
        ?.addEventListener('click', carregarMeusTreinos);

    document
        .getElementById('filterNome')
        ?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') carregarMeusTreinos();
        });
});
