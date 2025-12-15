const encontrarTreinoDoDia = (treinos) => {
    const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const hoje = new Date();
    const diaSemana = diasSemana[hoje.getDay()];

    console.log('Dia de hoje:', diaSemana);
    console.log('Treinos recebidos:', treinos);

    const treinoHoje = treinos.find(treino => {
        return treino.diasAgendados?.some(dia => dia.toUpperCase() === diaSemana);
    });

    console.log('Treino encontrado:', treinoHoje);
    return treinoHoje;
};


document.addEventListener('DOMContentLoaded', async () => {
    const treinoDoDiaCard = document.querySelector('.treino-do-dia');
    
    // 1. Ocultar por padrão
    if (treinoDoDiaCard) {
        treinoDoDiaCard.style.display = 'none';
    }

    try {
        const perfil = await getMeuPerfil();
        console.log('Perfil carregado:', perfil);

        const welcomeTitle = document.querySelector('.welcome-title');
        if (welcomeTitle && perfil.nome) {
            welcomeTitle.textContent = `Bem-vindo, ${perfil.nome}!`;
        }
        
        // --- INTEGRAÇÃO COM A API: Buscando treinos do usuário ---
        
        // 2. Busca a lista de treinos (usando o GET /treinos sem filtros de catálogo)
        const treinosResponse = await getMeusTreinos({});
        const treinos = Array.isArray(treinosResponse) ? treinosResponse : (treinosResponse.data || []);
        console.log('Treinos carregados:', treinos);
        
        // 3. Encontra o treino agendado para o dia de hoje
        const treinoReal = encontrarTreinoDoDia(treinos); 

        // 4. Se um treino for encontrado, exibe e atualiza o card
        if (treinoDoDiaCard && treinoReal) {
            treinoDoDiaCard.querySelector('h3').textContent = treinoReal.nome;
            const diasTexto = treinoReal.diasAgendados
                                        .map(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
                                        .join(', ');
            treinoDoDiaCard.querySelector('p').textContent = `Agendado: ${diasTexto}`;
            treinoDoDiaCard.style.display = 'flex';

            // Atualiza botão "Iniciar" para redirecionar com o ID do treino
            const iniciarBtn = treinoDoDiaCard.querySelector('button');
            if (iniciarBtn) {
                iniciarBtn.onclick = () => {
                    window.location.href = `treino-player.html?id=${treinoReal.id}`;
                };
            }
        }
        // Se treinoReal for null, o card permanece 'display: none'.

    } catch (error) {
        console.error("Falha ao carregar dados do dashboard:", error);
         // Oculta o card em caso de erro.
        if (treinoDoDiaCard) {
            treinoDoDiaCard.style.display = 'none';
        }
    }
    
});