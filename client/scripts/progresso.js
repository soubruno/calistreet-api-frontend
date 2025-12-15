document.addEventListener('DOMContentLoaded', async () => {
    // --- Auth guard ---
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    const treinosList = document.getElementById('treinos-list');
    const btnFiltrar = document.getElementById('btn-filtrar');

    // Carrega inicialmente sem filtros
    await carregarProgressos();

    // Clique no botão filtrar
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', async () => {
            await carregarProgressos();
        });
    }
});

/* ------------------------------------------------ */
/* Carrega progressos com filtros */
/* ------------------------------------------------ */
async function carregarProgressos() {
    const treinosList = document.getElementById('treinos-list');
    treinosList.innerHTML = '<p>Carregando...</p>';

    try {
        const query = montarQueryFiltros();
        const response = await fetchAuthenticated(`/progresso?${query}`, 'GET');

        console.log('Resposta da API /progresso:', response);

        const progressos = normalizarResposta(response);
        renderizarProgressos(progressos);
    } catch (error) {
        console.error('Erro ao carregar progresso:', error);
        treinosList.innerHTML = '<p>Erro ao carregar histórico de treinos.</p>';
    }
}

/* ------------------------------------------------ */
/* Monta query string a partir dos filtros */
/* ------------------------------------------------ */
function montarQueryFiltros() {
    const nome = document.getElementById('filtro-nome')?.value;
    const dataConclusao = document.getElementById('filtro-data-conclusao')?.value;
    const status = document.getElementById('filtro-status')?.value;

    const params = new URLSearchParams();

    if (nome) params.append('treinoNome', nome);

    if (dataConclusao) {
        params.append('dataMinima', `${dataConclusao}T00:00:00.000Z`);
        params.append('dataMaxima', `${dataConclusao}T23:59:59.999Z`);
    }

    if (status) params.append('status', status);

    return params.toString();
}

/* ------------------------------------------------ */
/* Normaliza o retorno da API */
/* ------------------------------------------------ */
function normalizarResposta(response) {
    if (Array.isArray(response)) return response;

    if (response?.rows && Array.isArray(response.rows)) {
        return response.rows;
    }

    if (response?.data && Array.isArray(response.data)) {
        return response.data;
    }

    if (response?.items && Array.isArray(response.items)) {
        return response.items;
    }

    console.warn('Formato inesperado da resposta:', response);
    return [];
}

/* ------------------------------------------------ */
/* Renderização dos cards de progresso */
/* ------------------------------------------------ */
function renderizarProgressos(progressos) {
    const treinosList = document.getElementById('treinos-list');
    treinosList.innerHTML = '';

    if (!progressos || progressos.length === 0) {
        treinosList.innerHTML = '<p>Nenhum treino encontrado.</p>';
        return;
    }

    progressos.forEach(progresso => {
        const nomeTreino =
            progresso.treinoModelo?.nome ||
            'Treino livre';

        const dataFim = progresso.dataFim
            ? new Date(progresso.dataFim)
            : null;

        const tempoRelativo = dataFim
            ? formatarTempoRelativo(dataFim)
            : 'data desconhecida';

        const card = document.createElement('article');
        card.className = 'treino-card';

        card.innerHTML = `
            <div class="treino-icon">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="treino-info">
                <h3 class="treino-nome">${nomeTreino}</h3>
                <p class="treino-meta">
                    Status: ${progresso.status}
                </p>
                <p class="treino-meta">
                    Concluído: ${tempoRelativo}
                </p>
            </div>
            <div class="treino-actions">
                <button 
                    class="btn btn-primary btn-small btn-visualizar"
                    data-id="${progresso.id}">
                    Visualizar
                </button>
            </div>
        `;

        treinosList.appendChild(card);
    });

    bindVisualizar();
}

/* ------------------------------------------------ */
/* Clique no botão Visualizar */
/* ------------------------------------------------ */
function bindVisualizar() {
    document.querySelectorAll('.btn-visualizar').forEach(button => {
        button.addEventListener('click', () => {
            const progressoId = button.dataset.id;
            window.location.href = `progresso-detalhes.html?id=${progressoId}`;
        });
    });
}

/* ------------------------------------------------ */
/* Utilitário: tempo relativo */
/* ------------------------------------------------ */
function formatarTempoRelativo(data) {
    const agora = new Date();
    const diffMs = agora - data;

    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;

    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;

    const diffDias = Math.floor(diffHoras / 24);
    return `há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
}
