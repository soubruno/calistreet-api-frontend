document.addEventListener('DOMContentLoaded', () => {

    /**
     * Configura a lógica para seleção ÚNICA de botões (ex: Gênero, Local, Nível).
     * @param {string} buttonSelector - Seletor CSS dos botões (ex: '.gender-select').
     * @param {string} hiddenInputId - ID do input hidden que armazena o valor (ex: 'genero').
     */
    function setupSelection(buttonSelector, hiddenInputId) {
        
        const buttons = document.querySelectorAll(buttonSelector);
        const hiddenInput = document.getElementById(hiddenInputId);

        // Verifica se os elementos existem antes de configurar
        if (!buttons.length || !hiddenInput) return;

        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Impede o envio do formulário em alguns casos
                
                // 1. Remove a classe 'active-blue' de todos os botões no mesmo grupo
                buttons.forEach(btn => btn.classList.remove('active-blue'));
                
                // 2. Adiciona a classe 'active-blue' ao botão clicado
                button.classList.add('active-blue');
                
                // 3. Atualiza o valor do input hidden
                hiddenInput.value = button.getAttribute('data-value');
                console.log(`${hiddenInputId} setado para: ${hiddenInput.value}`);
            });
        });
    }

    /**
     * Configura a lógica para seleção MÚLTIPLA de botões (Equipamentos).
     */
    function setupMultiSelection() {
        const equipmentButtons = document.querySelectorAll('.select-equipment');
        const equipmentInput = document.getElementById('equipamentos');

        if (!equipmentButtons.length || !equipmentInput) return;

        equipmentButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); 
                
                // Alterna a classe de seleção
                button.classList.toggle('active-blue');
                
                // Recalcula todos os valores selecionados
                const selectedValues = Array.from(document.querySelectorAll('.select-equipment.active-blue'))
                    .map(btn => btn.getAttribute('data-value'));
                
                // Armazena os valores separados por vírgula no input hidden
                equipmentInput.value = selectedValues.join(',');
                console.log(`equipamentos (Múltiplo) setado para: ${equipmentInput.value}`);
            });
        });
    }

    // --- 1. CONFIGURAÇÃO DE SELEÇÃO ÚNICA (Reaproveitamento de código) ---

    // Onboarding 1: Gênero
    setupSelection('.gender-select', 'genero');
    
    // Onboarding 2: Nível de Treino
    setupSelection('.nivel-select', 'nivelamento');

    // Onboarding 3: Local de Treino
    setupSelection('.select-local', 'localTreino');

    // --- 2. CONFIGURAÇÃO DE SELEÇÃO MÚLTIPLA ---

    // Onboarding 3: Equipamentos
    setupMultiSelection(); 
});