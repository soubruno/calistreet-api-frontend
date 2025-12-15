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


window.fetchAuthenticated = fetchAuthenticated;