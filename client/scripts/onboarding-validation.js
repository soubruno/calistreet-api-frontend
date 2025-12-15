document.addEventListener('DOMContentLoaded', () => {
    const form1 = document.getElementById('onboarding1Form');
    const form2 = document.getElementById('onboarding2Form');
    const form3 = document.getElementById('onboarding3Form');

    function setupFormValidation(formElement, nextUrl) {
        

        if (!formElement) return;

        const requiredElements = formElement.querySelectorAll('.input-required');

        formElement.addEventListener('submit', async function(event) {

            event.preventDefault();
            let allFieldsValid = true;

            requiredElements.forEach(element => {
                element.classList.remove('input-error');
                let value = element.value.trim();

                if (value === '') {
                    element.classList.add('input-error');
                    allFieldsValid = false;
                }
            });

            if (!allFieldsValid) {
                console.error(`Validação Front-end Falhou em ${formElement.id}. Preencha todos os campos.`);
                return;
            }

            // =============================
            // ETAPA FINAL - ENVIO PARA API
            // =============================
            if (formElement.id === 'onboarding3Form') {

                const rawData = {
                    peso: localStorage.getItem('onboarding_peso'),
                    altura: localStorage.getItem('onboarding_altura'),
                    dataNasc: localStorage.getItem('onboarding_dataNasc'),
                    genero: localStorage.getItem('onboarding_genero')
                };

                const updateProfileData = {};

                for (const key in rawData) {
                    const value = rawData[key];

                    if (value !== null && value !== '') {
                        if (key === 'peso' || key === 'altura') {
                            updateProfileData[key] = Number(value);
                        } else if (key === 'dataNasc') {
                            updateProfileData[key] = new Date(value).toISOString();
                        } else {
                            updateProfileData[key] = value;
                        }
                    }
                }

                console.log("Dados finais do Onboarding para API:", updateProfileData);

                try {
                    const ENDPOINT_PERFIL = '/usuarios/me';
                    console.log('TOKEN NO ONBOARDING:', localStorage.getItem('accessToken'));
                    debugger;
                    const data = await fetchAuthenticated(ENDPOINT_PERFIL, 'PUT', updateProfileData);

                    console.log("Response:", data);

                    // sucesso se chegou aqui
                    console.log("Dados do Onboarding salvos com sucesso!");

                    localStorage.removeItem('onboarding_peso');
                    localStorage.removeItem('onboarding_altura');
                    localStorage.removeItem('onboarding_dataNasc');
                    localStorage.removeItem('onboarding_genero');

                    window.location.href = nextUrl;
                    return;

                } catch (error) {
                    console.error("Falha ao salvar dados do Onboarding na API:", error);
                    alert("Erro ao finalizar o Onboarding. Tente novamente.");
                    return;
                }
            }

            // =======================================
            // ETAPAS INTERMEDIÁRIAS (SALVAR LOCAL)
            // =======================================
            const dataToStore = new FormData(formElement);
            for (let [key, value] of dataToStore.entries()) {
                localStorage.setItem(`onboarding_${key}`, value);
            }

            const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => {
                if (input.name) {
                    localStorage.setItem(`onboarding_${input.name}`, input.value);
                }
            });

            console.log(`Validação OK para ${formElement.id}. Dados armazenados localmente.`);
            window.location.href = nextUrl;
        });
    }

    setupFormValidation(form1, 'perfil-onboarding-2.html');
    setupFormValidation(form2, 'perfil-onboarding-3.html');
    setupFormValidation(form3, 'dashboard.html');
});
