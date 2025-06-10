// remedialFieldToggle.js

export function initializeRemedialFieldToggle() {
  const failRadios = document.querySelectorAll('input[type="radio"][value="Fail"]');

  failRadios.forEach(failRadio => {
    const name = failRadio.getAttribute('name');
    const passRadio = document.querySelector(`input[type="radio"][name="${name}"][value="Pass"]`);
    // Assumes remedial container ID is like '[radio_name]Remedial', e.g., 'AncillaryEquipmentRemedial' for radio name 'AncillaryEquipment'
    const remedialId = name + 'Remedial';
    const remedialFieldContainer = document.getElementById(remedialId);

    // Select ALL relevant input fields and textareas within this specific remedial container
    const relevantInputs = remedialFieldContainer?.querySelectorAll('input, textarea');

    // Proceed only if the pass radio, container, and at least one relevant input/textarea are found
    if (passRadio && remedialFieldContainer && relevantInputs && relevantInputs.length > 0) {

      const toggleRemedialFieldsState = () => {
        if (failRadio.checked) {
          remedialFieldContainer.classList.remove('d-none'); // Show the container
          relevantInputs.forEach(input => {
            input.removeAttribute('disabled'); // Enable the input
            input.setAttribute('required', 'required'); // Ensure it's required when visible

            // Clear any lingering validation feedback when showing
            input.classList.remove('is-invalid');
            const questionContainer = input.closest('.question-container');
            if (questionContainer) {
                questionContainer.classList.remove('is-invalid');
                const label = questionContainer.querySelector('label.form-label');
                if (label) label.classList.remove('text-danger');
                const existingError = questionContainer.querySelector('.invalid-feedback');
                if (existingError) existingError.remove();
            }
          });
        } else if (passRadio.checked) {
          remedialFieldContainer.classList.add('d-none'); // Hide the container
          relevantInputs.forEach(input => {
            input.setAttribute('disabled', 'true'); // Disable the input (validation ignores disabled fields)
            input.removeAttribute('required'); // Remove required as it's disabled anyway
            input.value = ''; // Clear value when hiding (important for a clean state)

            // Clear any lingering validation errors immediately
            input.classList.remove('is-invalid');
            const questionContainer = input.closest('.question-container');
            if (questionContainer) {
                questionContainer.classList.remove('is-invalid');
                const label = questionContainer.querySelector('label.form-label');
                if (label) label.classList.remove('text-danger');
                const existingError = questionContainer.querySelector('.invalid-feedback');
                if (existingError) existingError.remove();
            }
          });
        }
      };

      // Set the initial state when the script loads
      toggleRemedialFieldsState();

      // Add event listeners for changes to the 'Pass' and 'Fail' radio buttons
      failRadio.addEventListener('change', toggleRemedialFieldsState);
      passRadio.addEventListener('change', toggleRemedialFieldsState);
    } else {
        // Optional: Log a warning if the elements expected by this toggle are not found
        // console.warn(`Remedial elements (container or inputs) not found for radio name: ${name}`);
    }
  });
}