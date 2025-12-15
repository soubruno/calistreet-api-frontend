const API_BASE_URL = 'http://localhost:3000'; 

async function fetchAuthenticated(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
    };

    const config = { method, headers };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('accessToken');
        throw new Error('Sessão expirada.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Erro na requisição');
    }

    // ✅ Só tenta parsear JSON se houver conteúdo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }

    return null; // DELETE 204, etc.
}

//  Buscar perfil do usuário logado
async function getMeuPerfil() {
    return fetchAuthenticated('/usuarios/me', 'GET');
}

/**
 * Busca todos os treinos do usuário logado, usando filtros de paginação.
 * @param {object} query - Parâmetros de query (page, limit, etc.)
 * @returns {Promise<object>} Lista de treinos paginada.
 */
async function getMeusTreinos() {
  return fetchAuthenticated('/treinos/meus');
}

/**
 * Cria um novo plano de treino (POST /treinos).
 * @param {object} treinoData - Dados do treino (nome, nivel, itens, diasAgendados).
 * @returns {Promise<object>} Treino criado.
 */
async function createTreino(treinoData) {
    return fetchAuthenticated('/treinos', 'POST', treinoData);
}

/**
 * Atualiza completamente um plano de treino (PUT /treinos/:id).
 * @param {string} treinoId - ID do treino a ser atualizado.
 * @param {object} treinoData - Dados completos do treino.
 * @returns {Promise<object>} Treino atualizado.
 */
async function updateTreino(treinoId, treinoData) {
    return fetchAuthenticated(`/treinos/${treinoId}`, 'PUT', treinoData);
}

/**
 * Busca a estrutura detalhada de um treino (GET /treinos/:id).
 * @param {string} treinoId - ID do treino.
 * @returns {Promise<object>} Detalhes do treino.
 */
async function getTreinoDetalhe(treinoId) {
    return fetchAuthenticated(`/treinos/${treinoId}`, 'GET');
}

/**
 * Busca o catálogo de exercícios com filtros e paginação (GET /exercicios).
 * @param {object} query - Parâmetros de query (grupoMuscular, equipamentos, page, limit, etc.)
 * @returns {Promise<object>} Lista de exercícios paginada.
 */
async function getCatalogoExercicios(query = {}) {
    const queryString = new URLSearchParams(query).toString();
    const ENDPOINT = `/exercicios?${queryString}`;
    
    return fetchAuthenticated(ENDPOINT, 'GET');
}


window.fetchAuthenticated = fetchAuthenticated;
window.getMeuPerfil = getMeuPerfil;
window.getMeusTreinos = getMeusTreinos;
window.createTreino = createTreino;
window.updateTreino = updateTreino;
window.getTreinoDetalhe = getTreinoDetalhe;
window.getCatalogoExercicios = getCatalogoExercicios;