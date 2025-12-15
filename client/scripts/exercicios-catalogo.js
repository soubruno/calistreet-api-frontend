let exerciciosSelecionados = [];
const exerciseGrid = document.querySelector('.exercise-grid');
const groupFilters = document.querySelectorAll('.btn-filter-group');
const subgroupFiltersContainer = document.getElementById('subgroup-filters');
const modal = document.getElementById('exerciseModal');
const closeBtn = document.querySelector('.close-modal');

// Estado de Filtro
let filtroAtual = {
    grupoMuscular: 'SUPERIOR', // Filtro inicial
    subgrupoMuscular: null,
    page: 1,
    limit: 15
};

// --- 1. Funções de Renderização ---

function renderExerciseCard(exercicio) {
    const isSelected = exerciciosSelecionados.some(item => item.exercicioId === exercicio.id);
    const selectedClass = isSelected ? 'btn-icon-selected' : '';
    const iconClass = isSelected ? 'fas fa-check-circle' : 'fas fa-plus-circle';

    return `
        <article class="exercise-card" data-exercicio-id="${exercicio.id}">
            <div class="card-image-placeholder">
                <i class="fas fa-dumbbell"></i>
            </div>
            <div class="card-content" onclick="openExerciseModal(this.closest('.exercise-card'))">
                <h3 class="card-title">${exercicio.nome}</h3>
                <p class="card-description">
                    Grupo: ${exercicio.grupoMuscular} | Equip.: ${exercicio.equipamentosNecessarios || 'Nenhum'}
                </p>
            </div>
            <button class="btn btn-icon btn-add-to-treino ${selectedClass}" type="button" data-exercicio-id="${exercicio.id}">
                <i class="${iconClass}"></i>
            </button>
        </article>
    `;
}

function renderExercises(exercicios) {
    exerciseGrid.innerHTML = '';
    if (exercicios && exercicios.length > 0) {
        exercicios.forEach(exercicio => {
            exerciseGrid.innerHTML += renderExerciseCard(exercicio);
        });
    } else {
        exerciseGrid.innerHTML = '<p class="intro-subtitle" style="text-align: center;">Nenhum exercício encontrado para os filtros atuais.</p>';
    }
}

// --- 2. Lógica de Busca e Filtragem ---

async function fetchExercises() {
    try {
        const query = { ...filtroAtual };
        if (!query.subgrupoMuscular) delete query.subgrupoMuscular;

        const response = await getCatalogoExercicios(query);
        renderExercises(response.data);
        console.log("Exercícios carregados:", response.data);
    } catch (error) {
        console.error("Falha ao carregar catálogo - Detalhes:", error); 
        exerciseGrid.innerHTML = '<p class="intro-subtitle" style="color: red;">Erro ao carregar exercícios do servidor.</p>';
    }
}

function handleGroupFilterClick(selectedGroup) {
    filtroAtual.grupoMuscular = selectedGroup;
    filtroAtual.subgrupoMuscular = null;
    filtroAtual.page = 1;

    groupFilters.forEach(btn => btn.classList.remove('active-blue'));
    document.querySelector(`.btn-filter-group[data-group="${selectedGroup}"]`).classList.add('active-blue');

    renderSubgroupFilters(selectedGroup);
}

function renderSubgroupFilters(selectedGroup) {
    subgroupFiltersContainer.innerHTML = '';

    const SUBGROUPS_DATA = {
        SUPERIOR: [
            { label: 'Costas', value: 'COSTAS' },
            { label: 'Peito', value: 'PEITO' },
            { label: 'Ombro', value: 'OMBRO' },
            { label: 'Bíceps', value: 'BICEPS' },
            { label: 'Tríceps', value: 'TRICEPS' },
            { label: 'Antebraço', value: 'ANTEBRACO' },
        ],
        CORE: [
            { label: 'Abdômen', value: 'ABDOMEN' },
            { label: 'Lombar', value: 'LOMBAR' },
        ],
        INFERIOR: [
            { label: 'Quadríceps', value: 'QUADRICEPS' },
            { label: 'Posterior', value: 'POSTERIOR' },
            { label: 'Panturrilha', value: 'PANTURRILHA' },
        ],
    };

    const subgroups = SUBGROUPS_DATA[selectedGroup] || [];
    let firstSubgroupValue = null;

    subgroups.forEach((subgroup, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-filter-subgroup';
        btn.textContent = subgroup.label;
        btn.dataset.subgroup = subgroup.value;

        if (index === 0) {
            btn.classList.add('active-blue');
            firstSubgroupValue = subgroup.value;
        }

        btn.addEventListener('click', () => {
            filtroAtual.subgrupoMuscular = subgroup.value;
            filtroAtual.page = 1;

            subgroupFiltersContainer.querySelectorAll('.btn-filter-subgroup')
                .forEach(b => b.classList.remove('active-blue'));

            btn.classList.add('active-blue');
            fetchExercises();
        });

        subgroupFiltersContainer.appendChild(btn);
    });

    if (firstSubgroupValue) {
        filtroAtual.subgrupoMuscular = firstSubgroupValue;
        fetchExercises();
    }
}

// --- 3. Lógica de Adicionar/Remover e Salvar o Estado ---

function handleAddToTreinoClick(event) {
    event.stopPropagation();
    const button = event.target.closest('.btn-add-to-treino');
    const exercicioId = button.getAttribute('data-exercicio-id');
    const card = button.closest('.exercise-card');
    const nome = card.querySelector('.card-title').textContent;

    const novoItem = {
        exercicioId: exercicioId,
        nome: nome,
        series: 3,
        repeticoes: 12,
        descansoSegundos: Number(document.getElementById('descanso')?.value || 60),
    };

    const itemIndex = exerciciosSelecionados.findIndex(item => item.exercicioId === exercicioId);

    if (itemIndex > -1) {
        exerciciosSelecionados.splice(itemIndex, 1);
        button.classList.remove('btn-icon-selected');
        button.querySelector('i').className = 'fas fa-plus-circle';
    } else {
        exerciciosSelecionados.push(novoItem);
        button.classList.add('btn-icon-selected');
        button.querySelector('i').className = 'fas fa-check-circle';
    }

    updateFloatingSelectButton();
}

function updateFloatingSelectButton() {
    const btnSalvar = document.getElementById('btnConcluirSelecao');
    if (btnSalvar) {
        btnSalvar.textContent = `Concluir Seleção (${exerciciosSelecionados.length})`;
        btnSalvar.style.display = exerciciosSelecionados.length > 0 ? 'block' : 'none';
    }
}

// --- 4. Inicialização e Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    renderSubgroupFilters(filtroAtual.grupoMuscular);
    fetchExercises();

    groupFilters.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedGroup = e.currentTarget.getAttribute('data-group');
            handleGroupFilterClick(selectedGroup);
        });
    });

    exerciseGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-add-to-treino');
        if (button) handleAddToTreinoClick(e);
    });

    // Botão flutuante
    const btnConcluirSelecao = document.createElement('button');
    btnConcluirSelecao.id = 'btnConcluirSelecao';
    btnConcluirSelecao.className = 'btn btn-primary floating-btn'; 
    btnConcluirSelecao.textContent = 'Concluir Seleção (0)';
    document.body.appendChild(btnConcluirSelecao);

    btnConcluirSelecao.addEventListener('click', () => {
        localStorage.setItem('temp_exercicios_selecionados', JSON.stringify(exerciciosSelecionados));
        window.location.href = 'treino-form.html';
    });

    updateFloatingSelectButton();

    // Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.classList.remove('menu-open');
    });

    window.openExerciseModal = function(cardElement) {
        const title = cardElement.querySelector('.card-title').textContent;
        const exercicioId = cardElement.dataset.exercicioId;

        modal.dataset.exercicioId = exercicioId;
        document.getElementById('modal-title').textContent = title;

        modal.classList.remove('hidden');
        document.body.classList.add('menu-open'); 
    }

    // Botão "Adicionar ao Treino" no modal
    const modalAddButton = modal.querySelector('.btn-primary');
    modalAddButton.addEventListener('click', () => {
        const exercicioId = modal.dataset.exercicioId;
        const nome = modal.querySelector('#modal-title').textContent;

        const novoItem = {
            exercicioId: exercicioId,
            nome: nome,
            series: 3,
            repeticoes: 12,
            descansoSegundos: 60,
        };

        const itemIndex = exerciciosSelecionados.findIndex(item => item.exercicioId == exercicioId);

        if (itemIndex > -1) {
            exerciciosSelecionados.splice(itemIndex, 1);
            alert(`${nome} removido do treino.`);
        } else {
            exerciciosSelecionados.push(novoItem);
            alert(`${nome} adicionado ao treino.`);
        }

        updateFloatingSelectButton();
    });
});
