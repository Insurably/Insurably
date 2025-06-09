// stepForm.js
import { initializeRemedialFieldToggle } from './remedialFieldToggle.js';

export function initializeStepForm(updateProgress) {
  setTimeout(() => {
    const stepForm = new HSStepForm('.js-step-form', {
      onNextStep: () => {
        console.log('onNextStep function is running!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(updateProgress, 750);

        const currentStep = document.querySelector('.step-panel:not(.d-none)');
        console.log("Current step found:", currentStep);

        const questionContainers = currentStep.querySelectorAll('.question-container');
        console.log("Question containers in this step:", questionContainers);

        let isValid = true;
        let firstInvalid = null;

        questionContainers.forEach((container, i) => {
          const inputs = container.querySelectorAll('input, select, textarea');
          let containerValid = true;

          // Log the question and its inputs
          console.log(`Question ${i + 1}:`, container, "Inputs:", inputs);

          inputs.forEach(input => {
            if (!input.checkValidity()) {
              containerValid = false;
              if (!firstInvalid) firstInvalid = input;
              console.log("INVALID INPUT FOUND:", input);
            }
          });

          // Remove previous error states
          container.classList.remove('is-invalid');
          const label = container.querySelector('label.form-label');
          if (label) label.classList.remove('text-danger');
          const existingError = container.querySelector('.invalid-feedback');
          if (existingError) existingError.remove();

          // If not valid, show the error
          if (!containerValid) {
            console.log("ADDING is-invalid TO CONTAINER:", container);
            container.classList.add('is-invalid');
            if (label) label.classList.add('text-danger');
            const error = document.createElement('div');
            error.className = 'invalid-feedback d-block';
            error.textContent = 'This question is required.';
            container.appendChild(error);
            isValid = false;
          }
        });

        // ---- Remedial Toggle: re-initialize after validation and DOM updates ----
        initializeRemedialFieldToggle();

        if (!isValid && firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus({ preventScroll: true });
          console.log("Blocked from going to next step because of invalid field.");
          return false; // Block progression!
        }

        console.log("All questions valid. Proceeding.");

        // Init signature pad if needed
        if (document.getElementById("signatureCanvas") || document.getElementById("openSignatureModal")) {
          if (typeof window.initializeSignaturePad === 'function') {
            window.initializeSignaturePad();
          }
        }

        // Remedial toggle may be needed on next step as well!
        setTimeout(() => {
          initializeRemedialFieldToggle();
        }, 100);

        return true;
      },

      onPrevStep: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(updateProgress, 750);
        // Re-initialize remedial toggles for previous step
        setTimeout(() => {
          initializeRemedialFieldToggle();
        }, 100);
      },

      finish: () => {
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

    // Initial remedial toggle on first load (first step)
    setTimeout(() => {
      initializeRemedialFieldToggle();
    }, 100);
  }, 500);
}
