let exerciciosSelecionados = [];

const exerciseGrid = document.querySelector('.exercise-grid');
const groupFilters = document.querySelectorAll('.btn-filter-group');
const subgroupFiltersContainer = document.getElementById('subgroup-filters');

const modal = document.getElementById('exerciseModal');
const closeBtn = document.querySelector('.close-modal');

// 🔎 Filtros da barra
const inputNome = document.getElementById('filterNome');
const inputEquipamentos = document.getElementById('filterEquipamentos');
const btnApplyFilters = document.getElementById('applyFilters');

// ------------------------------
// Estado global de filtros
// ------------------------------
let filtroAtual = {
    grupoMuscular: 'SUPERIOR',
    subgrupoMuscular: null,
    nome: null,
    equipamentos: null,
    page: 1,
    limit: 15
};

// ------------------------------
// 1. Renderização
// ------------------------------
function renderExerciseCard(exercicio) {
    const isSelected = exerciciosSelecionados.some(
        item => item.exercicioId === exercicio.id
    );

    const selectedClass = isSelected ? 'btn-icon-selected' : '';
    const iconClass = isSelected
        ? 'fas fa-check-circle'
        : 'fas fa-plus-circle';

    return `
        <article class="exercise-card" data-exercicio-id="${exercicio.id}">
            <div class="card-image-placeholder">
                <i class="fas fa-dumbbell"></i>
            </div>

            <div class="card-content" onclick="openExerciseModal(this.closest('.exercise-card'))">
                <h3 class="card-title">${exercicio.nome}</h3>
                <p class="card-description">
                    Grupo: ${exercicio.grupoMuscular}
                    | Equip.: ${exercicio.equipamentosNecessarios || 'Nenhum'}
                </p>
            </div>

            <button
                class="btn btn-icon btn-add-to-treino ${selectedClass}"
                type="button"
                data-exercicio-id="${exercicio.id}">
                <i class="${iconClass}"></i>
            </button>
        </article>
    `;
}

function renderExercises(exercicios) {
    exerciseGrid.innerHTML = '';

    if (!exercicios || exercicios.length === 0) {
        exerciseGrid.innerHTML = `
            <p class="intro-subtitle" style="text-align:center;">
                Nenhum exercício encontrado para os filtros atuais.
            </p>
        `;
        return;
    }

    exercicios.forEach(exercicio => {
        exerciseGrid.innerHTML += renderExerciseCard(exercicio);
    });
}

// ------------------------------
// 2. Busca no backend
// ------------------------------
async function fetchExercises() {
    try {
        const query = { ...filtroAtual };

        // Remove filtros vazios
        Object.keys(query).forEach(key => {
            if (query[key] === null || query[key] === '') {
                delete query[key];
            }
        });

        const response = await getCatalogoExercicios(query);

        const exercicios =
            response?.data ||
            response?.items ||
            response ||
            [];

        renderExercises(exercicios);

        console.log('📦 Exercícios carregados:', exercicios);

    } catch (error) {
        console.error('❌ Erro ao carregar exercícios:', error);
        exerciseGrid.innerHTML = `
            <p class="intro-subtitle" style="color:red; text-align:center;">
                Erro ao carregar exercícios do servidor.
            </p>
        `;
    }
}

// ------------------------------
// 3. Filtros de Grupo
// ------------------------------
function handleGroupFilterClick(selectedGroup) {
    filtroAtual.grupoMuscular = selectedGroup;
    filtroAtual.subgrupoMuscular = null;
    filtroAtual.page = 1;

    groupFilters.forEach(btn =>
        btn.classList.remove('active-blue')
    );

    document
        .querySelector(`.btn-filter-group[data-group="${selectedGroup}"]`)
        .classList.add('active-blue');

    renderSubgroupFilters(selectedGroup);
}

function renderSubgroupFilters(selectedGroup) {
    subgroupFiltersContainer.innerHTML = '';

    const SUBGROUPS = {
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

    const subgroups = SUBGROUPS[selectedGroup] || [];

    subgroups.forEach((sub, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-filter-subgroup';
        btn.textContent = sub.label;
        btn.dataset.subgroup = sub.value;

        if (index === 0) {
            btn.classList.add('active-blue');
            filtroAtual.subgrupoMuscular = sub.value;
        }

        btn.addEventListener('click', () => {
            filtroAtual.subgrupoMuscular = sub.value;
            filtroAtual.page = 1;

            subgroupFiltersContainer
                .querySelectorAll('.btn-filter-subgroup')
                .forEach(b => b.classList.remove('active-blue'));

            btn.classList.add('active-blue');
            fetchExercises();
        });

        subgroupFiltersContainer.appendChild(btn);
    });

    fetchExercises();
}

// ------------------------------
// 4. Barra de filtros (nome / equipamentos)
// ------------------------------
function aplicarFiltrosBarra() {
    filtroAtual.nome = inputNome?.value?.trim() || null;
    filtroAtual.equipamentos = inputEquipamentos?.value?.trim() || null;
    filtroAtual.page = 1;

    fetchExercises();
}

// ------------------------------
// 5. Seleção de exercícios
// ------------------------------
function handleAddToTreinoClick(event) {
    event.stopPropagation();

    const button = event.target.closest('.btn-add-to-treino');
    const exercicioId = button.dataset.exercicioId;

    const card = button.closest('.exercise-card');
    const nome = card.querySelector('.card-title').textContent;

    const index = exerciciosSelecionados.findIndex(
        item => item.exercicioId === exercicioId
    );

    if (index > -1) {
        exerciciosSelecionados.splice(index, 1);
        button.classList.remove('btn-icon-selected');
        button.querySelector('i').className = 'fas fa-plus-circle';
    } else {
        exerciciosSelecionados.push({
            exercicioId,
            nome,
            series: 3,
            repeticoes: 12,
            descansoSegundos: 60
        });
        button.classList.add('btn-icon-selected');
        button.querySelector('i').className = 'fas fa-check-circle';
    }

    updateFloatingSelectButton();
}

function updateFloatingSelectButton() {
    const btn = document.getElementById('btnConcluirSelecao');
    if (!btn) return;

    btn.textContent = `Concluir Seleção (${exerciciosSelecionados.length})`;
    btn.style.display =
        exerciciosSelecionados.length > 0 ? 'block' : 'none';
}

// ------------------------------
// 6. Inicialização
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    // Filtros de grupo
    groupFilters.forEach(btn => {
        btn.addEventListener('click', e => {
            handleGroupFilterClick(
                e.currentTarget.dataset.group
            );
        });
    });

    // Barra de filtros
    btnApplyFilters?.addEventListener('click', aplicarFiltrosBarra);

    inputNome?.addEventListener('keyup', e => {
        if (e.key === 'Enter') aplicarFiltrosBarra();
    });

    inputEquipamentos?.addEventListener('keyup', e => {
        if (e.key === 'Enter') aplicarFiltrosBarra();
    });

    // Grid
    exerciseGrid.addEventListener('click', e => {
        const btn = e.target.closest('.btn-add-to-treino');
        if (btn) handleAddToTreinoClick(e);
    });

    // Botão flutuante
    const btnConcluir = document.createElement('button');
    btnConcluir.id = 'btnConcluirSelecao';
    btnConcluir.className = 'btn btn-primary floating-btn';
    btnConcluir.textContent = 'Concluir Seleção (0)';
    btnConcluir.style.display = 'none';

    document.body.appendChild(btnConcluir);

    btnConcluir.addEventListener('click', () => {
        localStorage.setItem(
            'temp_exercicios_selecionados',
            JSON.stringify(exerciciosSelecionados)
        );
        window.location.href = 'treino-form.html';
    });

    updateFloatingSelectButton();

    // Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.classList.remove('menu-open');
    });

    window.openExerciseModal = function(card) {
        modal.dataset.exercicioId = card.dataset.exercicioId;
        document.getElementById('modal-title').textContent =
            card.querySelector('.card-title').textContent;

        modal.classList.remove('hidden');
        document.body.classList.add('menu-open');
    };

    // Inicial
    renderSubgroupFilters(filtroAtual.grupoMuscular);
});
