document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const requiredInputs = form.querySelectorAll('.input-required'); 
    const API_BASE_URL = 'http://localhost:3000'; // Define a URL da API

    // Função auxiliar para fazer o login e obter o token
    async function performLoginAndGetToken(email, senha) {
        try {
            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });
            
            if (loginResponse.ok) {
                const data = await loginResponse.json();
                
                // Tenta extrair a chave correta (accessToken, conforme vimos)
                const token = data.accessToken || data.access_token || data.token;
                
                if (token) {
                    localStorage.setItem('accessToken', token);
                    return true; // Sucesso na obtenção do token
                }
            }
            return false; // Falha no login ou token não encontrado
        } catch (error) {
            console.error('Erro de rede durante o login pós-cadastro:', error);
            return false;
        }
    }
    
    // 1. Adiciona um ouvinte de evento para a submissão do formulário
    form.addEventListener('submit', async function(event) {
        
        event.preventDefault();         
        let allFieldsValid = true;

        // ... (Lógica de validação de campos vazios e aplicação de input-error - MANTIDA) ...
        
        if (!allFieldsValid) {
             console.error("Validação Front-end Falhou. Campos obrigatórios ausentes.");
             return;
        }

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();

        try {
            // --- PASSO 1: POST /usuarios (CADASTRO) ---
            const response = await fetch(`${API_BASE_URL}/usuarios`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            // Se o cadastro foi bem-sucedido (Status 201 Created)
            if (response.status === 201) {
                console.log("Cadastro OK. Tentando Login Automático...");
                
                // --- PASSO 2: AUTO-LOGIN para obter o JWT ---
                const loginSuccess = await performLoginAndGetToken(email, senha);
                
                if (loginSuccess) {
                    console.log("Auto-Login OK. Redirecionando para Onboarding 1.");
                    window.location.href = 'perfil-onboarding-1.html'; 
                } else {
                    alert("Cadastro realizado, mas falha ao iniciar sessão. Tente fazer Login manual.");
                    window.location.href = 'index.html'; // Redireciona para o login manual
                }
            } else {
                // ... (Tratamento de erros 409, 400, etc. - MANTIDO) ...
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
                
                let errorMessage = 'Erro ao criar conta. Verifique os dados.';
                if (response.status === 409) {
                    errorMessage = 'Este e-mail já está cadastrado.';
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }

                alert(errorMessage);
                console.error("Falha no cadastro:", response.status, errorData);
            }

        } catch (error) {
            console.error('Erro de rede durante o cadastro:', error);
            alert("Não foi possível conectar ao servidor para completar o cadastro.");
        }
    });
});