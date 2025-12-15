/**
 * Redireciona para a tela de Criar/Atualizar Treino no modo de edição,
 * passando o ID do treino via URL query parameter.
 * @param {string} treinoId - O ID único do treino a ser visualizado/editado.
 */
function viewTreino(treinoId) {
    if (!treinoId) {
        console.error("ID do treino não fornecido.");
        return;
    }

    console.log(`Visualizando treino ID: ${treinoId}`);
    window.location.href = `treino-form.html?id=${treinoId}`;
}

/**
 * Cria dinamicamente um card de treino.
 * @param {object} treino
 * @returns {HTMLElement}
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
                class="btn btn-primary btn-small btn-editar"
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
 * Renderiza a lista de treinos do usuário.
 * @param {Array} treinos
 */
function renderTreinos(treinos) {
    const lista = document.querySelector('.treinos-list');
    lista.innerHTML = '';

    if (!treinos || treinos.length === 0) {
        lista.innerHTML = `
            <p style="color:#aaa; margin-top: 20px;">
                Você ainda não criou nenhum treino.
            </p>
        `;
        return;
    }

    treinos.forEach(treino => {
        lista.appendChild(criarTreinoCard(treino));
    });
}

/**
 * Exclui um treino do usuário.
 * @param {string} treinoId
 */
async function excluirTreino(treinoId) {
    if (!confirm('Deseja realmente excluir este treino?')) return;

    try {
        await fetchAuthenticated(`/treinos/${treinoId}`, 'DELETE');
        alert('Treino excluído com sucesso!');
        location.reload();
    } catch (error) {
        console.error('Erro ao excluir treino:', error);
        alert('Erro ao excluir treino.');
    }
}

/**
 * Carregamento inicial da página "Meus Treinos"
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Segurança extra (auth-guard já faz isso, mas mantemos)
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    console.log("Página Meus Treinos carregada.");

    try {
        const response = await getMeusTreinos({ page: 1, limit: 10 });

        console.log("Treinos recebidos da API:", response);

        // 🔥 Normalização da resposta
        let treinos = [];

        if (Array.isArray(response)) {
            treinos = response;
        } else if (response.data && Array.isArray(response.data)) {
            treinos = response.data;
        } else if (response.items && Array.isArray(response.items)) {
            treinos = response.items;
        }

        document.querySelector('.intro-title').textContent =
            `Meus Treinos (${treinos.length})`;

        renderTreinos(treinos);

    } catch (error) {
        console.error("Erro ao carregar os treinos:", error);
    }
});
