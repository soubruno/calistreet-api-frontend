document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const requiredInputs = form.querySelectorAll('.input-required'); 
    const errorMessageDiv = document.getElementById('errorMessage');
    
    // URL base da sua API (Ajustar se a porta 3000 não for a correta)
    const API_BASE_URL = 'http://localhost:3000'; 

    function isValidEmail(email) {
        // Regex simples para verificar a presença de @ e .
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    
    // Tornando a função de submit assíncrona
    form.addEventListener('submit', async function(event) {
        
        event.preventDefault(); 
        
        let validationFailed = false;
        errorMessageDiv.classList.add('hidden');
        
        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');

        // --- VALIDAÇÃO DE CAMPO VAZIO E ERRO VISUAL ---
        requiredInputs.forEach(input => {
            input.classList.remove('input-error'); 
            if (input.value.trim() === '') {
                input.classList.add('input-error');
                validationFailed = true;
            } 
        });
        
        // --- VALIDAÇÃO DE FORMATO DE E-MAIL ---
        if (!validationFailed && !isValidEmail(emailInput.value.trim())) {
            emailInput.classList.add('input-error');
            validationFailed = true;
        }

        // --- INTERRUPÇÃO: ERRO DE VALIDAÇÃO DE FRONT-END ---
        if (validationFailed) {
            errorMessageDiv.textContent = "Verifique se todos os campos estão preenchidos e o e-mail está correto.";
            errorMessageDiv.classList.remove('hidden');
            return; 
        }

        // --- CONEXÃO COM A API (Fetch) ---
        
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            // Limpa o estado de erro visual nos inputs antes de processar a resposta
            requiredInputs.forEach(input => input.classList.remove('input-error'));

            // Resposta de SUCESSO (200 OK)
            if (response.ok) {
                const data = await response.json();
                console.log("SUCESSO DE LOGIN. OBJETO RECEBIDO:", data);

                let tokenValue = data.accessToken;
                
                if (!tokenValue) {
                    // Tenta o fallback para o padrão mais comum, mas foca no 'accessToken'
                    tokenValue = data.access_token || data.token;
                }

                // Se encontrou o token, prossiga.
                if (tokenValue) {
                    localStorage.setItem('accessToken', tokenValue);
                    window.location.href = 'dashboard.html'; 
                } else {
                    console.error("TOKEN NÃO ENCONTRADO. Chaves tentadas: accessToken, access_token, token.");
                    throw new Error("Token de autenticação não encontrado na resposta da API. Formato inesperado.");
                }
                
            } else {
                // 2. FALHA ESPERADA (401 Unauthorized / 403 Forbidden)
                
                let errorMessage = "Erro de rede ou servidor. Tente novamente.";
                
                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Login/senha inválidos. Tente novamente!";
                } else if (response.status === 400) {
                     errorMessage = "Dados inválidos. Verifique seu e-mail.";
                }

                errorMessageDiv.textContent = errorMessage;
                errorMessageDiv.classList.remove('hidden');
                
                // Aplica borda vermelha
                requiredInputs.forEach(input => input.classList.add('input-error'));
                
                // IMPORTANTE: Não lance (throw) um erro, apenas retorne
                return; 
            }

        } catch (error) {
            // Este bloco deve ser APENAS para erros de rede, JSON parsing ou token não encontrado.
            console.error('Erro na requisição de login:', error);
            errorMessageDiv.textContent = "Não foi possível conectar ao servidor ou houve um erro de processamento.";
            errorMessageDiv.classList.remove('hidden');
            requiredInputs.forEach(input => input.classList.add('input-error'));
        }
    });
});