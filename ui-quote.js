document.addEventListener("DOMContentLoaded", function () {  
  // Dynamically load Header
  fetch("header.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
      initializePageComponents();
    })
    .catch(error => console.error("Error loading header:", error));

  // Dynamically load Footer
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch(error => console.error("Error loading footer:", error));

  // ------------------------------------------------------------
  // HELPER FUNCTIONS
  // ------------------------------------------------------------

  // Scroll a given element into view with an offset (e.g. to account for a fixed header)
  function scrollToElementWithOffset(element, offset = 80) {
    const elementRect = element.getBoundingClientRect();
    const offsetPosition = elementRect.top + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }

  // Scroll so that the progress bar (or its container) is in view.
  // In our example we assume the progress bar has the id "quoteProgressBar".
  function scrollToProgress() {
    const progressBar = document.getElementById('quoteProgressBar');
    if (progressBar) {
      // Scroll so that the progress bar is near the top (adjust offset if needed)
      scrollToElementWithOffset(progressBar, 30);
    } else {
      // Fallback: scroll to the top of the step form.
      const stepForm = document.querySelector('.js-step-form');
      if (stepForm) {
        window.scrollTo({ top: stepForm.offsetTop, behavior: 'smooth' });
      }
    }
  }

  // Given the current question container element, find the next question container (if any)
  // and scroll it into view.
  function scrollToNextQuestion(currentContainer) {
    let nextContainer = currentContainer.nextElementSibling;
    // Look for the next sibling that has the class "question-container"
    while (nextContainer && !nextContainer.classList.contains('question-container')) {
      nextContainer = nextContainer.nextElementSibling;
    }
    if (nextContainer) {
      scrollToElementWithOffset(nextContainer, 80);
    }
  }

  // ------------------------------------------------------------
  // INITIALIZATION OF PAGE COMPONENTS & FORM BEHAVIOR
  // ------------------------------------------------------------

  function initializePageComponents() {
    // INITIALIZATION OF MEGA MENU
    new HSMegaMenu('.js-mega-menu', {
      desktop: { position: 'left' }
    });

    // INITIALIZATION OF SHOW ANIMATIONS
    new HSShowAnimation('.js-animation-link');

    // INITIALIZATION OF BOOTSTRAP DROPDOWN
    HSBsDropdown.init();

    // INITIALIZATION OF GO TO
    new HSGoTo('.js-go-to');

    // INITIALIZATION OF STICKY BLOCKS
    new HSStickyBlock('.js-sticky-block', {
      targetSelector: (document.getElementById('header') &&
        document.getElementById('header').classList.contains('navbar-fixed'))
        ? '#header'
        : null
    });

    // INITIALIZATION OF THE STEP FORM
    // (Allow a short delay so the step form is fully ready.)
    setTimeout(() => {
      const stepForm = new HSStepForm('.js-step-form', {
        onNextStep: () => {
          // When advancing to the next step (e.g. after answering the last question in a section),
          // scroll so that the progress bar is in view.
          scrollToProgress();
          setTimeout(updateProgress, 100); // Delay to let the transition complete.
        },
        onPrevStep: () => {
          scrollToProgress();
          setTimeout(updateProgress, 100);
        },
        finish: () => {
          console.log("Form finished, displaying success message.");

          // Hide all step cards
          document.querySelectorAll('#quoteStepFormContent .card').forEach(card => {
            card.style.display = 'none';
          });

          // Hide the left column with the step progress (Large Screens Only)
          const stepProgressColumn = document.querySelector('.col-lg-4.d-none.d-lg-block');
          if (stepProgressColumn) {
            stepProgressColumn.style.display = 'none';
          }

          // Hide the step index (progress list)
          const stepIndex = document.getElementById("quoteStepFormProgress");
          if (stepIndex) {
            stepIndex.style.display = 'none';
          }

          // Hide the progress bar (Small Screens) – removes any extra space
          const progressBarContainer = document.querySelector('.progress');
          if (progressBarContainer) {
            progressBarContainer.style.display = 'none';
          }

          // Ensure the form container takes the full width
          const formContainer = document.getElementById('formContainer');
          if (formContainer) {
            formContainer.classList.remove('col-lg-8');
            formContainer.classList.add('col-lg-12');
          }

          // Show the success message
          const successMessage = document.getElementById("successMessageContent");
          if (successMessage) {
            successMessage.style.display = 'block';
          } else {
            console.error("Success message content not found!");
          }

          // Finally, scroll to the very top so the progress bar comes into view.
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 300);
        }
      });

      setTimeout(updateProgress, 300); // Allow final delay for step detection.
    }, 500);

    // ------------------------------------------------------------
    // INSURANCE TYPE AUTO-ADVANCE (For Business, Landlord, Home)
    // ------------------------------------------------------------

    const insuranceRadios = document.querySelectorAll('input[name="insuranceType"]');
    insuranceRadios.forEach(function (radio) {
      radio.addEventListener('change', function (e) {
        // Update Step 2 question containers (hide all first)
        const businessQuestions = document.getElementById("BusinessQuestions");
        const landlordQuestions = document.getElementById("LandlordQuestions");
        const homeQuestions = document.getElementById("HomeQuestions");
        if (businessQuestions) businessQuestions.style.display = "none";
        if (landlordQuestions) landlordQuestions.style.display = "none";
        if (homeQuestions) homeQuestions.style.display = "none";

        // Show only the container corresponding to the selected type
        const selectedType = e.target.value;
        if (selectedType === "Business" && businessQuestions) {
          businessQuestions.style.display = "block";
        } else if (selectedType === "Landlord" && landlordQuestions) {
          landlordQuestions.style.display = "block";
        } else if (selectedType === "Home" && homeQuestions) {
          homeQuestions.style.display = "block";
        }

        // Update Step 3 question containers similarly
        const businessQuestions2 = document.getElementById("BusinessQuestions2");
        const landlordQuestions2 = document.getElementById("LandlordQuestions2");
        const homeQuestions2 = document.getElementById("HomeQuestions2");
        if (businessQuestions2) businessQuestions2.style.display = "none";
        if (landlordQuestions2) landlordQuestions2.style.display = "none";
        if (homeQuestions2) homeQuestions2.style.display = "none";

        if (selectedType === "Business" && businessQuestions2) {
          businessQuestions2.style.display = "block";
        } else if (selectedType === "Landlord" && landlordQuestions2) {
          landlordQuestions2.style.display = "block";
        } else if (selectedType === "Home" && homeQuestions2) {
          homeQuestions2.style.display = "block";
        }

        // Auto-advance to the next step by programmatically clicking the next button.
        const autoNextButton = document.getElementById('autoStepNext');
        if (autoNextButton) {
          autoNextButton.click();
          // After the step transition, scroll the newly visible step into view.
          setTimeout(() => {
            const stepElements = document.querySelectorAll('#quoteStepFormContent > div');
            let currentStepIndex = 0;
            stepElements.forEach((step, index) => {
              if (window.getComputedStyle(step).display !== 'none') {
                currentStepIndex = index;
              }
            });
            if (stepElements[currentStepIndex]) {
              stepElements[currentStepIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
          setTimeout(updateProgress, 500);
        }
      });
    });

    // ------------------------------------------------------------
    // SCROLL ON ANSWER BUTTON CLICKS (for each question)
    // ------------------------------------------------------------
    // (Make sure your HTML for each question wraps its content in an element
    // with the class "question-container" and that each answer button inside
    // has the class "answer-btn".)
    document.querySelectorAll('.question-container .answer-btn').forEach(button => {
      button.addEventListener('click', function () {
        // After a short delay (to allow UI updates) scroll the next question container into view.
        const currentContainer = this.closest('.question-container');
        if (currentContainer) {
          setTimeout(() => {
            scrollToNextQuestion(currentContainer);
          }, 300);
        }
      });
    });

    // ------------------------------------------------------------
    // PROGRESS BAR UPDATES
    // ------------------------------------------------------------
    function updateProgress(forcedValue = null) {
      const progressBar = document.getElementById('quoteProgressBar');
      let progressPercentage = 0;
      if (forcedValue !== null) {
        progressPercentage = forcedValue;
      } else {
        const stepElements = document.querySelectorAll('#quoteStepFormContent > div');
        let currentStepIndex = 0;
        stepElements.forEach((step, index) => {
          if (window.getComputedStyle(step).display !== 'none') {
            currentStepIndex = index + 1;
          }
        });
        if (currentStepIndex === 1) {
          progressPercentage = 33;
        } else if (currentStepIndex === 2) {
          progressPercentage = 75;
        } else if (currentStepIndex === 3) {
          progressPercentage = 95;
        }
      }

      // If the success message is showing, set progress to 100%
      const successMessage = document.getElementById("successMessageContent");
      if (successMessage && successMessage.style.display === "block") {
        progressPercentage = 100;
      }

      console.log(`Updating progress: ${progressPercentage}%`);
      if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
      }
    }

    // Ensure the progress bar is updated initially.
    setTimeout(updateProgress, 1000);
  }
});
