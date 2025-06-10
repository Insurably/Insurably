import { initializeRemedialFieldToggle } from './remedialFieldToggle.js';
import { initializeSignaturePad } from './signature-pad.js';

// Utility: Clear validation states for all .question-container in all active cards
function clearAllActiveCardValidation() {
  document.querySelectorAll('#scaffCheckStepFormContent .card.active .question-container').forEach(container => {
    container.classList.remove('is-invalid');
    const label = container.querySelector('label.form-label');
    if (label) label.classList.remove('text-danger');
    const existingError = container.querySelector('.invalid-feedback');
    if (existingError) existingError.remove();
  });
}

// Add live validation to question-containers
function attachLiveValidation(container) {
  const label = container.querySelector('label.form-label');
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    // Remove previous listeners if they exist
    input.removeEventListener('input', input._liveValidationHandler);
    input.removeEventListener('change', input._liveValidationHandler);
    input._liveValidationHandler = () => {
      if (input.checkValidity()) {
        container.classList.remove('is-invalid');
        if (label) label.classList.remove('text-danger');
        const err = container.querySelector('.invalid-feedback');
        if (err) err.remove();
      }
    };
    input.addEventListener('input', input._liveValidationHandler);
    input.addEventListener('change', input._liveValidationHandler);
  });
}

export function initializeStepForm(updateProgress) {
  setTimeout(() => {
    const stepForm = new HSStepForm('.js-step-form', {
      onNextStep: () => {
        // On successful validation and step progression:
        // - Clear validation errors from new step
        // - Add live validation listeners

        setTimeout(() => {
          clearAllActiveCardValidation();
          // Attach live validation for the next step
          const nextStep = document.querySelector('#scaffCheckStepFormContent .card.active');
          if (nextStep) {
            nextStep.querySelectorAll('.question-container').forEach(container => {
              attachLiveValidation(container);
            });
          }
        }, 10);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(updateProgress, 750);

        // Signature/remedial fields
        setTimeout(() => {
          initializeRemedialFieldToggle();
          if (
            document.getElementById("signatureCanvas") ||
            document.getElementById("openSignatureModal")
          ) {
            initializeSignaturePad();
          }
        }, 100);

        return true;
      },

      onPrevStep: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(updateProgress, 750);
        setTimeout(() => {
          clearAllActiveCardValidation();
          // Attach live validation for the previous step
          const prevStep = document.querySelector('#scaffCheckStepFormContent .card.active');
          if (prevStep) {
            prevStep.querySelectorAll('.question-container').forEach(container => {
              attachLiveValidation(container);
            });
          }
        }, 10);
      },

      finish: () => {
        // ... your finish code ...
        console.log("Form finished, displaying success message.");

        document.querySelectorAll('#scaffCheckStepFormContent .card').forEach(card => {
          card.style.display = 'none';
        });

        const sidebarProgress = document.querySelector('.col-lg-4.d-none.d-lg-block');
        if (sidebarProgress) sidebarProgress.style.display = 'none';

        const quoteProgress = document.getElementById("quoteStepFormProgress");
        if (quoteProgress) quoteProgress.style.display = 'none';

        const progressBar = document.querySelector('.progress');
        if (progressBar) progressBar.style.display = 'none';

        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
          formContainer.classList.remove('col-lg-8');
          formContainer.classList.add('col-lg-12');
        }

        const successMessage = document.getElementById("successMessageContent");
        if (successMessage) {
          successMessage.style.display = 'block';
        }

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }
    });

    setTimeout(updateProgress, 750);

    // On first load: clean and attach live validation to the first step
    setTimeout(() => {
      clearAllActiveCardValidation();
      const currentStep = document.querySelector('#scaffCheckStepFormContent .card.active');
      if (currentStep) {
        currentStep.querySelectorAll('.question-container').forEach(container => {
          attachLiveValidation(container);
        });
      }
      initializeRemedialFieldToggle();
    }, 100);

    // ------- THE MAGIC: VALIDATION BLOCKER -------
    // Validate current step before progressing!
    document.querySelectorAll('[data-hs-step-form-next-options]').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const currentStep = document.querySelector('#scaffCheckStepFormContent .card.active');
        let isValid = true;
        let firstInvalid = null;

        // Validate all .question-container in the current step
        currentStep.querySelectorAll('.question-container').forEach(container => {
          // Remove previous errors
          container.classList.remove('is-invalid');
          const label = container.querySelector('label.form-label');
          if (label) label.classList.remove('text-danger');
          const existingError = container.querySelector('.invalid-feedback');
          if (existingError) existingError.remove();

          // Validate each input in the question
          let containerValid = true;
          container.querySelectorAll('input, select, textarea').forEach(input => {
            if (!input.checkValidity()) {
              containerValid = false;
              if (!firstInvalid) firstInvalid = input;
            }
          });

          if (!containerValid) {
            container.classList.add('is-invalid');
            if (label) label.classList.add('text-danger');
            const error = document.createElement('div');
            error.className = 'invalid-feedback d-block';
            error.textContent = 'This question is required.';
            container.appendChild(error);
            isValid = false;
          }
        });

        if (!isValid && firstInvalid) {
          e.preventDefault(); // Block step navigation!
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus({ preventScroll: true });
          return false;
        }
        // If valid, allow HSStepForm to proceed as normal.
      });
    });

  }, 500);
}
