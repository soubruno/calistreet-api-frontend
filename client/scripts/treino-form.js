// ======================================================
// CONFIGURAÇÕES E ESTADO
// ======================================================
let diasAgendadosSelecionados = [];
let currentTreinoId = null; // ⚡ ID do treino sendo editado

const MAPA_DIAS = {
    segunda: 'SEGUNDA',
    terca: 'TERCA',
    quarta: 'QUARTA',
    quinta: 'QUINTA',
    sexta: 'SEXTA',
    sabado: 'SABADO',
    domingo: 'DOMINGO',
};

// ======================================================
// 1. SELEÇÃO DE DIAS
// ======================================================
function setupDaySelection() {
    const container = document.getElementById('diasAgendadosContainer');
    if (!container) return;

    container.querySelectorAll('.btn-day').forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.dataset.day;
            if (diasAgendadosSelecionados.includes(day)) {
                diasAgendadosSelecionados = diasAgendadosSelecionados.filter(d => d !== day);
                btn.classList.remove('selected');
            } else {
                diasAgendadosSelecionados.push(day);
                btn.classList.add('selected');
            }
            salvarEstadoFormulario();
        });
    });
}

// ======================================================
// 2. COLETA DE EXERCÍCIOS
// ======================================================
function coletarItensDeTreino() {
    const lista = document.getElementById('exercise-list-container');
    const itens = [];

    lista.querySelectorAll('.exercise-item-edit').forEach((item, index) => {
        const exercicioId = item.dataset.exercicioId;
        const series = item.querySelector('.series-input')?.value ?? 3;
        const repeticoes = item.querySelector('.reps-input')?.value ?? 12;
        const descanso = item.querySelector('.descanso-input')?.value ?? 60; // ⚡ por exercício

        if (exercicioId && series && repeticoes) {
            itens.push({
                exercicioId,
                ordem: index + 1,
                series: Number(series),
                repeticoes: Number(repeticoes),
                descansoSegundos: Number(descanso),
            });
        }
    });

    return itens;
}


// ======================================================
// 3. RENDERIZAÇÃO DE EXERCÍCIO
// ======================================================
function renderizarExercicios(itensDoTreino = [], itensTemporarios = []) {
    const lista = document.getElementById('exercise-list-container');
    if (!lista) return;

    console.log('Renderizando exercícios...');
    console.log('Itens do treino existente:', itensDoTreino);
    console.log('Itens temporários:', itensTemporarios);

    // Mescla sem duplicatas pelo exercicioId
    const itensMap = new Map();
    [...itensDoTreino, ...itensTemporarios].forEach(item => {
        itensMap.set(item.exercicioId, item);
    });

    lista.innerHTML = '';
    itensMap.forEach(item => {
        lista.innerHTML += renderExerciseItem(item);
    });

    console.log('Exercícios renderizados no DOM:', Array.from(lista.children).map(li => ({
        exercicioId: li.dataset.exercicioId,
        nome: li.querySelector('.exercise-title')?.textContent
    })));
}

function renderExerciseItem(item) {
    return `
        <article class="exercise-item-edit"
                 data-exercicio-id="${item.exercicioId}"
                 draggable="true">
            <div class="item-drag-handle" title="Arrastar para reordenar">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="item-info-edit">
                <p class="exercise-title">${item.nome || 'Exercício'}</p>
                <div class="exercise-details">
                    <span class="rep-label">Séries:</span> 
                    <input type="number" class="rep-input series-input" value="${item.series ?? 3}" min="1">
                    <span class="rep-label">Reps:</span> 
                    <input type="number" class="rep-input reps-input" value="${item.repeticoes ?? 12}" min="1">
                    <span class="rep-label">Descanso (s):</span>
                    <input type="number" class="rep-input descanso-input" value="${item.descansoSegundos ?? 60}" min="10">
                </div>
            </div>
            <div class="item-actions">
                <button type="button" class="btn btn-icon btn-view-details">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="btn btn-icon btn-remove">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </article>
    `;
}

// ======================================================
// 4. PERSISTÊNCIA DO FORMULÁRIO
// ======================================================
function salvarEstadoFormulario() {
    const estado = {
        nome: document.getElementById('nomeTreino')?.value,
        descricao: document.getElementById('descricaoTreino')?.value,
        nivel: document.getElementById('nivel')?.value,
        descanso: document.getElementById('descanso')?.value,
        dias: diasAgendadosSelecionados,
    };
    localStorage.setItem('treino_form_state', JSON.stringify(estado));
}

function restaurarEstadoFormulario() {
    const estado = localStorage.getItem('treino_form_state');
    if (!estado) return;

    const data = JSON.parse(estado);

    document.getElementById('nomeTreino').value = data.nome || '';
    document.getElementById('descricaoTreino').value = data.descricao || '';
    document.getElementById('nivel').value = data.nivel || '';
    document.getElementById('descanso').value = data.descanso || '';

    diasAgendadosSelecionados = data.dias || [];
    document.querySelectorAll('.btn-day').forEach(btn => {
        btn.classList.toggle('selected', diasAgendadosSelecionados.includes(btn.dataset.day));
    });
}

// ======================================================
// 5. CARREGAR TREINO EXISTENTE
// ======================================================
async function getTreinoById(treinoId) {
    try {
        const response = await fetchAuthenticated(`/treinos/${treinoId}`, 'GET');
        return response.data || response;
    } catch (err) {
        console.error('Erro ao buscar treino:', err);
        return null;
    }
}

async function carregarTreinoExistente(treinoId) {
    console.log('Carregando treino existente para ID:', treinoId);

    const treino = await getTreinoById(treinoId);
    if (!treino) {
        console.warn('Treino não encontrado ou erro na API');
        return [];
    }

    console.log('Treino recebido do backend:', treino);

    currentTreinoId = treinoId;

    document.getElementById('tituloTreino').textContent = 'Editar Treino';
    document.getElementById('nomeTreino').value = treino.nome || '';
    document.getElementById('descricaoTreino').value = treino.descricao || '';
    document.getElementById('nivel').value = treino.nivel || '';
    document.getElementById('descanso').value = treino.descansoSegundos ?? 60; // ⚡ garante valor padrão

    diasAgendadosSelecionados = (treino.diasAgendados || []).map(d => {
        const key = Object.keys(MAPA_DIAS).find(key => MAPA_DIAS[key] === d.toUpperCase());
        console.log(`Mapeando dia agendado backend: ${d} → ${key}`);
        return key;
    });

    document.querySelectorAll('.btn-day').forEach(btn => {
        btn.classList.toggle('selected', diasAgendadosSelecionados.includes(btn.dataset.day));
    });

    // Preparar exercícios existentes
    const treinoExistenteItens = (treino.itens || []).map((item, index) => {
        const exercicio = {
            exercicioId: item.exercicioId,
            series: item.series ?? 3,            // ⚡ valor padrão
            repeticoes: item.repeticoes ?? 12,   // ⚡ valor padrão
            nome: item.nome || item.exercicio?.nome || 'Exercício',
            descansoSegundos: item.descansoSegundos ?? 60 // ⚡ valor padrão
        };
        console.log(`Exercício carregado do treino [${index}]:`, exercicio);
        return exercicio;
    });

    return treinoExistenteItens;
}

// ======================================================
// 6. DOM READY
// ======================================================
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('treinoForm');
    const btnAddExercise = document.getElementById('btnAddExercise');

    setupDaySelection();

    const urlParams = new URLSearchParams(window.location.search);
    const treinoIdParam = urlParams.get('id');

    let treinoExistenteItens = [];

    // ⚡ Carrega treino existente
    if (treinoIdParam) {
        treinoExistenteItens = await carregarTreinoExistente(treinoIdParam);
        console.log('Exercícios existentes após carregar treino:', treinoExistenteItens);
    } else {
        document.getElementById('tituloTreino').textContent = 'Novo Treino';
        restaurarEstadoFormulario();
    }

    // Exercícios temporários do catálogo
    let itensTemporarios = [];
    const tempItens = localStorage.getItem('temp_exercicios_selecionados');
    if (tempItens) {
        const temp = JSON.parse(tempItens);
        console.log('Exercícios temporários do catálogo:', temp);

        // ⚡ Mescla com treino existente, evitando duplicatas
        const mapaExercicios = new Map();
        treinoExistenteItens.forEach(e => mapaExercicios.set(e.exercicioId, e));
        temp.forEach(e => mapaExercicios.set(e.exercicioId, e));

        // ⚡ Coloca todos em itensTemporarios e limpa treinoExistenteItens
        itensTemporarios = Array.from(mapaExercicios.values());
        treinoExistenteItens = [];

        localStorage.removeItem('temp_exercicios_selecionados');
    }

    // Renderiza todos os exercícios (mesclados)
    renderizarExercicios(treinoExistenteItens, itensTemporarios);

    // ---------------------------
    // Adicionar exercício
    // ---------------------------
    btnAddExercise?.addEventListener('click', () => {
        salvarEstadoFormulario();
        localStorage.setItem(
            'temp_exercicios_selecionados',
            JSON.stringify(coletarItensDeTreino())
        );
        window.location.href = 'exercicios-catalogo.html';
    });

    // ---------------------------
    // Submit
    // ---------------------------
    form?.addEventListener('submit', async e => {
        e.preventDefault();

        const itens = coletarItensDeTreino();
        if (!itens.length) {
            alert('Adicione ao menos um exercício');
            return;
        }

        const payload = {
            nome: document.getElementById('nomeTreino').value,
            descricao: document.getElementById('descricaoTreino').value,
            nivel: document.getElementById('nivel').value,
            diasAgendados: diasAgendadosSelecionados.map(d => MAPA_DIAS[d]),
            itens,
            isTemplate: false,
        };

        try {
            if (currentTreinoId) {
                await updateTreino(currentTreinoId, payload);
                alert('Treino atualizado com sucesso!');
            } else {
                await createTreino(payload);
                alert('Treino criado com sucesso!');
            }

            localStorage.removeItem('treino_form_state');
            window.location.href = 'meus-treinos.html';
        } catch (err) {
            console.error(err);
            alert(err.message || 'Erro ao salvar treino');
        }
    });

    // ---------------------------
    // Remover exercício
    // ---------------------------
    document.getElementById('exercise-list-container')
        .addEventListener('click', e => {
            const btnRemove = e.target.closest('.btn-remove');
            if (!btnRemove) return;
            btnRemove.closest('.exercise-item-edit').remove();
        });

    // ======================================================
    // Drag & Drop – Reordenar Exercícios
    // ======================================================
    let draggedItem = null;
    const list = document.getElementById('exercise-list-container');

    list.addEventListener('dragstart', e => {
        const item = e.target.closest('.exercise-item-edit');
        if (!item) return;
        draggedItem = item;
        item.classList.add('dragging');
    });

    list.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    });

    list.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);
        if (!afterElement) {
            list.appendChild(draggedItem);
        } else {
            list.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.exercise-item-edit:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});