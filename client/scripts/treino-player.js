document.addEventListener('DOMContentLoaded', async () => {
    const timerDisplay = document.getElementById('timer-display');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercent = document.getElementById('progress-percent');
    const exerciseListContainer = document.querySelector('.exercise-list');

    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    let isRunning = false;
    let seconds = 0;
    let timerInterval;
    let treinoAtual = null;
    let checkboxes = [];
    let inicioTreino = null; // Guarda o momento do início do treino

    // --- Cronômetro ---
    function updateTimer() {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${h}:${m}:${s}`;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            inicioTreino = inicioTreino || new Date(); // define apenas se ainda não estiver definido
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            stopBtn.classList.remove('hidden');
            timerInterval = setInterval(updateTimer, 1000);
            console.log("Treino iniciado em", inicioTreino.toISOString());
        }
    }

    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            clearInterval(timerInterval);
        }
    }

    async function stopTreino() {
        pauseTimer();
        stopBtn.classList.add('hidden');

        const agora = new Date();

        const resultadosExercicios = treinoAtual.itens.map((item, index) => ({
            exercicioId: item.exercicioId,
            ordem: index + 1, // ✅ obrigatório
            seriesFeitas: Number(item.series) || 0,
            repeticoesFeitas: String(item.repeticoes ?? '') // ✅ STRING
        }));

        const payload = {
            treinoId: treinoAtual.id,
            dataInicio: inicioTreino.toISOString(),
            dataFim: agora.toISOString(),
            duracaoSegundos: seconds,
            status: "CONCLUIDO",
            resultadosExercicios
        };

        console.log("Payload FINAL enviado:", payload);

        try {
            await fetchAuthenticated('/progresso', 'POST', payload);
            alert('Treino concluído e salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar treino:', error);
            alert('Erro ao salvar treino.');
        }

        seconds = 0;
        inicioTreino = null;
        timerDisplay.textContent = '00:00:00';
        window.location.href = 'dashboard.html';
    }

    playPauseBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
    stopBtn.addEventListener('click', stopTreino);

    // --- Progress Bar ---
    function updateProgress() {
        const completedCount = checkboxes.filter(cb => cb.checked).length;
        const percent = checkboxes.length > 0 ? (completedCount / checkboxes.length) * 100 : 0;
        progressBarFill.style.width = `${percent}%`;
        progressPercent.textContent = `${Math.round(percent)}%`;
    }

    // --- Exercícios ---
    function initExerciseInteractions() {
        checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));
        const toggleButtons = document.querySelectorAll('.btn-toggle-details');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const details = btn.closest('.exercise-item').querySelector('.item-details');
                details.classList.toggle('hidden');
                btn.classList.toggle('rotated');
            });
        });
        updateProgress();
    }

    function renderizarExercicios(exercicios) {
        exerciseListContainer.querySelectorAll('.exercise-item').forEach(el => el.remove());

        exercicios.forEach((ex, index) => {
            const article = document.createElement('article');
            article.className = 'exercise-item';

            const grupoMuscular = ex.grupoMuscular?.join(', ') || 'Não informado';
            const series = ex.series || '-';
            const repeticoes = ex.repeticoes || '-';
            const instrucoes = ex.instrucoes || 'Sem instruções.';
            const videoLink = ex.video ? `<a href="${ex.video}" target="_blank">Ver vídeo de execução</a>` : '';

            article.innerHTML = `
                <div class="item-header">
                    <div class="item-info">
                        <p class="exercise-title">${index + 1}. ${ex.nome}</p>
                        <p class="exercise-meta">${series} séries x ${repeticoes} repetições</p>
                    </div>
                    <div class="item-controls">
                        <button class="btn btn-toggle-details"><i class="fas fa-chevron-down"></i></button>
                        <input type="checkbox" class="exercise-checkbox" data-weight="${ex.peso || 1}">
                    </div>
                </div>
                <div class="item-details hidden">
                    <p><strong>Grupo Muscular:</strong> ${grupoMuscular}</p>
                    <p><strong>Instruções:</strong> ${instrucoes}</p>
                    ${videoLink}
                </div>
            `;
            exerciseListContainer.appendChild(article);
        });

        checkboxes = Array.from(document.querySelectorAll('.exercise-checkbox'));
        initExerciseInteractions();
    }

    // --- Helpers ---
    function getTreinoIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function carregarTreino() {
        const treinoId = getTreinoIdFromURL();
        if (!treinoId) return;

        try {
            treinoAtual = await getTreinoDetalhe(treinoId);
            console.log('Treino carregado:', treinoAtual);

            const welcomeTitle = document.querySelector('.welcome-title');
            if (welcomeTitle) welcomeTitle.textContent = treinoAtual.nome;

            // Mapear cada item do treino usando diretamente item.exercicio
            const exerciciosDetalhados = treinoAtual.itens.map(item => {
                const ex = item.exercicio || {};
                return {
                    nome: ex.nome || 'Exercício desconhecido',
                    grupoMuscular: ex.grupoMuscular ? [ex.grupoMuscular] : [],
                    instrucoes: ex.instrucoes || 'Sem instruções.',
                    video: ex.videoUrl || '',
                    series: item.series,
                    repeticoes: item.repeticoes,
                    peso: item.peso || 1
                };
            });

            renderizarExercicios(exerciciosDetalhados);
        } catch (error) {
            console.error('Erro ao carregar treino:', error);
        }
    }

    // --- Inicialização ---
    await carregarTreino();
});
