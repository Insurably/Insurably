// remedialFieldToggle.js

export function initializeRemedialFieldToggle() {
  const disagreeRadios = document.querySelectorAll('input[type="radio"][value="Fail"]');
  disagreeRadios.forEach(failRadio => {
    const name = failRadio.getAttribute('name');
    const passRadio = document.querySelector(`input[type="radio"][name="${name}"][value="Pass"]`);
    const remedialId = name + 'Remedial';
    const remedialFieldContainer = document.getElementById(remedialId);
    const remedialInput = remedialFieldContainer?.querySelector('input');

    if (passRadio && remedialFieldContainer && remedialInput) {
      const toggleRemedialRequired = () => {
        if (failRadio.checked) {
          remedialFieldContainer.classList.remove('d-none');
          remedialInput.setAttribute('required', 'required');
        } else if (passRadio.checked) {
          remedialFieldContainer.classList.add('d-none');
          remedialInput.removeAttribute('required');
        }
      };

      toggleRemedialRequired();
      failRadio.addEventListener('change', toggleRemedialRequired);
      passRadio.addEventListener('change', toggleRemedialRequired);
    }
  });
}
