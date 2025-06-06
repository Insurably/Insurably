import { fetchAllTrades } from "./supascaff.js";

document.addEventListener("DOMContentLoaded", function () {  
    // Helper: Wait for jQuery and bootstrap-datepicker to load.
    function waitForjQuery(callback, interval = 50, maxAttempts = 100) {
      let attempts = 0;
      const timer = setInterval(function() {
        if (window.jQuery && $.fn.datepicker) {
          clearInterval(timer);
          callback();
        }
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(timer);
          console.error("jQuery or bootstrap-datepicker didn't load in time");
        }
      }, interval);
    }
  
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
    function scrollToProgress() {
      const progressBar = document.getElementById('quoteProgressBar');
      if (progressBar) {
        scrollToElementWithOffset(progressBar, 30);
      } else {
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
      while (nextContainer && !nextContainer.classList.contains('question-container')) {
        nextContainer = nextContainer.nextElementSibling;
      }
      if (nextContainer) {
        scrollToElementWithOffset(nextContainer, 80);
      }
    }

    // ------------------------------------------------------------
    // TRADE SEARCH FUNCTIONALITY (NEWLY ADDED)
    // ------------------------------------------------------------
    async function initializeTradeSearch() {
      const tradeInput = document.getElementById("tradeInput");
      const tradeSuggestions = document.getElementById("tradeSuggestions");
      const tradeSelected = document.getElementById("tradeSelected");
      const tradeName = document.getElementById("tradeName");
      const changeTrade = document.getElementById("changeTrade");
  
      let trades = await fetchAllTrades(); // Fetch all trades with pagination
      let filteredTrades = []; // Store filtered trades
      let selectedIndex = -1; // Track active selection in dropdown
  
      // Function to filter and display suggestions
      tradeInput.addEventListener("input", function () {
          const query = this.value.toLowerCase();
          tradeSuggestions.innerHTML = "";
          selectedIndex = -1; // Reset selection index
  
          if (query.length < 2) {
              tradeSuggestions.classList.add("d-none");
              return;
          }
  
          // Rank matches: exact first, then partial matches
          filteredTrades = trades.filter(trade => trade.toLowerCase().includes(query));
          filteredTrades.sort((a, b) => {
              if (a.toLowerCase() === query) return -1;
              if (b.toLowerCase() === query) return 1;
              if (a.toLowerCase().startsWith(query) && !b.toLowerCase().startsWith(query)) return -1;
              if (!a.toLowerCase().startsWith(query) && b.toLowerCase().startsWith(query)) return 1;
              return 0;
          });
  
          if (filteredTrades.length > 0) {
              filteredTrades.forEach((trade, index) => {
                  const suggestionItem = document.createElement("button");
                  suggestionItem.classList.add("list-group-item", "list-group-item-action");
                  suggestionItem.textContent = trade;
                  suggestionItem.setAttribute("data-index", index);
  
                  // Clicking a suggestion manually selects it
                  suggestionItem.addEventListener("click", function () {
                      selectTrade(trade);
                  });
  
                  tradeSuggestions.appendChild(suggestionItem);
              });
  
              tradeSuggestions.classList.remove("d-none");
          } else {
              tradeSuggestions.classList.add("d-none");
          }
      });

  
      // Function to handle trade selection
      function selectTrade(trade) {
          tradeInput.value = "";
          tradeInput.setAttribute("disabled", "true");
          tradeInput.classList.add("d-none");
          tradeSuggestions.classList.add("d-none");
          tradeSelected.classList.remove("d-none");
          tradeName.textContent = trade;
  
          tradeInput.classList.remove("is-invalid");
          tradeInput.blur();
          document.activeElement.blur();
      }
  
      // Handle keyboard navigation in dropdown
      tradeInput.addEventListener("keydown", function (event) {
          const suggestionItems = tradeSuggestions.querySelectorAll(".list-group-item");
          if (suggestionItems.length === 0) return;
  
          if (event.key === "ArrowDown") {
              event.preventDefault();
              if (selectedIndex < suggestionItems.length - 1) {
                  selectedIndex++;
              }
          } else if (event.key === "ArrowUp") {
              event.preventDefault();
              if (selectedIndex > 0) {
                  selectedIndex--;
              }
          } else if (event.key === "Enter") {
              event.preventDefault();
              if (selectedIndex >= 0 && selectedIndex < filteredTrades.length) {
                  selectTrade(filteredTrades[selectedIndex]);
              }
          }
  
          // Highlight selected item
          suggestionItems.forEach((item, index) => {
              if (index === selectedIndex) {
                  item.classList.add("active");
              } else {
                  item.classList.remove("active");
              }
          });
      });
  
      // Automatically select the first result if the user clicks away (blur)
      tradeInput.addEventListener("blur", function () {
          setTimeout(() => {
              if (filteredTrades.length > 0 && tradeSelected.classList.contains("d-none")) {
                  selectTrade(filteredTrades[0]); // Auto-select first result
              }
          }, 200); // Delay allows clicks to register first
      });
  
      // Change trade functionality
      changeTrade.addEventListener("click", function (event) {
          event.preventDefault();
          tradeSelected.classList.add("d-none");
          tradeInput.classList.remove("d-none");
          tradeInput.removeAttribute("disabled");
          tradeInput.classList.remove("is-invalid");
          tradeInput.focus();
      });
  
      // Hide suggestions when clicking outside
      document.addEventListener("click", function (event) {
          if (!tradeInput.contains(event.target) && !tradeSuggestions.contains(event.target)) {
              tradeSuggestions.classList.add("d-none");
          }
      });
  }

  function initializeRemedialFieldToggle() {
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

  // ------------------------------------------------------------
  // INITIALIZE QUOTE BUTTON
  // ------------------------------------------------------------
  function initializeInsuranceQuoteToggle() {
  const passRadio  = document.getElementById('InsurancePass');
  const failRadio  = document.getElementById('InsuranceFail');
  const quoteDiv   = document.getElementById('InsuranceQuote');

  if (!passRadio || !failRadio || !quoteDiv) return;

  function toggle() {
    if (failRadio.checked) {
      quoteDiv.classList.remove('d-none');
    } else {
      quoteDiv.classList.add('d-none');
    }
  }

  passRadio.addEventListener('change', toggle);
  failRadio.addEventListener('change', toggle);
  toggle(); // run once on load
}

  
  
  // Call the function
  initializeTradeSearch();
  initializeRemedialFieldToggle();
  initializeInsuranceQuoteToggle();
  

    // ----------------------------------------
    // ADDRESS AUTOCOMPLETE FUNCTIONALITY
    // ----------------------------------------
    function initializeGoogleAutocomplete() {
      console.log("Google Places API initialized.");
  
      // Ensure Google API is loaded
      if (typeof google === "undefined" || !google.maps) {
          console.error("Google Maps API not loaded yet.");
          return;
      }
  
      // Define input field IDs
      const inputIds = ["homeAddress", "propertyAddress"];
  
      inputIds.forEach((id) => {
          const input = document.getElementById(id);
  
          if (!input) {
              console.error(`Autocomplete input field not found: ${id}`);
              return;
          }
  
          const autocomplete = new google.maps.places.Autocomplete(input, {
              types: ["address"], // Fetches full addresses instead of just areas
              componentRestrictions: { country: "UK" },
          });
  
          autocomplete.addListener("place_changed", function () {
              const place = autocomplete.getPlace();
  
              if (!place || !place.formatted_address) {
                  alert("Please select a valid address from the suggestions.");
                  return;
              }
  
              input.value = place.formatted_address; // Set the input value to the selected address
              console.log(`Selected address for ${id}:`, place.formatted_address);
          });
      });
  }  
  
  // Ensure script loads AFTER Google Maps API is fully available
  window.addEventListener("load", function () {
      if (typeof google !== "undefined" && google.maps) {
          initializeGoogleAutocomplete();
      } else {
          console.error("Google Maps API not loaded on page load.");
      }
  }); 
  
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

        // DD THIS POP-OVER INITIALIZER
  const popOpts = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
popOpts.forEach((el) => {
  new bootstrap.Popover(el, {
    container: 'body',
    boundary: 'viewport',
    placement: 'bottom',
    trigger: 'focus',
    popperConfig: (defaultBsPopperConfig) => ({
      // Start from Bootstrap’s default popperConfig…
      ...defaultBsPopperConfig,
      modifiers: [
        // copy over whatever modifiers Bootstrap already set
        ...defaultBsPopperConfig.modifiers,
        // then override the Flip‐modifier so it ONLY falls back to top/bottom
        {
          name: 'flip',
          options: {
            // no left/right: only try top or bottom
            fallbackPlacements: ['top', 'bottom']
          }
        }
      ]
    })
  });
});
      // INITIALIZATION OF GO TO
      new HSGoTo('.js-go-to');
  
      // INITIALIZATION OF DATE PICKER
      function initializeDatePickers() {
        // Now that jQuery is available, attach datepicker to all elements with the .datepicker class.
        $('.datepicker').datepicker({
          format: 'dd/mm/yyyy',
          autoclose: true,
          todayHighlight: true,
          startDate: new Date()
        });
      }
      // Use our helper to wait until jQuery and its datepicker plugin are loaded.
      waitForjQuery(initializeDatePickers);
  
      // INITIALIZATION OF SELECT
      HSCore.components.HSTomSelect.init('.js-select-trades');
  
      // INITIALIZATION OF STICKY BLOCKS
      new HSStickyBlock('.js-sticky-block', {
        targetSelector: (document.getElementById('header') &&
          document.getElementById('header').classList.contains('navbar-fixed'))
          ? '#header'
          : null
      });
  
      // INITIALIZATION OF THE STEP FORM
      setTimeout(() => {
  const stepForm = new HSStepForm('.js-step-form', {
  onNextStep: () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updateProgress, 750);
  },
  onPrevStep: () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updateProgress, 750);
  },
  finish: () => {
    console.log("Form finished, displaying success message.");

    // Hide all step cards
    document.querySelectorAll('#scaffCheckStepFormContent .card').forEach(card => {
      card.style.display = 'none';
    });

    // Hide progress indicators (corrected to avoid optional chaining on assignment)
    const sidebarProgress = document.querySelector('.col-lg-4.d-none.d-lg-block');
    if (sidebarProgress) {
      sidebarProgress.style.display = 'none';
    }

    const quoteProgress = document.getElementById("quoteStepFormProgress");
    if (quoteProgress) {
      quoteProgress.style.display = 'none';
    }

    const progressBar = document.querySelector('.progress');
    if (progressBar) {
      progressBar.style.display = 'none';
    }

    // Expand form container
    const formContainer = document.getElementById('formContainer');
    if (formContainer) {
      formContainer.classList.remove('col-lg-8');
      formContainer.classList.add('col-lg-12');
    }

    // Show success message
    const successMessage = document.getElementById("successMessageContent");
    if (successMessage) {
      successMessage.style.display = 'block';
    }

    // Scroll to top for visibility
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }
});

  setTimeout(updateProgress, 750);
}, 500);

  
      
  
      // ------------------------------------------------------------
      // SCROLL ON ANSWER BUTTON CLICKS (for each question)
      // ------------------------------------------------------------
      document.querySelectorAll('.question-container .answer-btn').forEach(button => {
  button.addEventListener('click', function () {
    // Get the corresponding radio button for this label
    const radioButton = document.getElementById(this.getAttribute('for'));

    // Only scroll to the next question if the clicked button's radio is NOT "Fail"
    if (radioButton && radioButton.value !== "Fail") {
      const currentContainer = this.closest('.question-container');
      if (currentContainer) {
        setTimeout(() => {
          scrollToNextQuestion(currentContainer);
        }, 300);
      }
    }
  });
});


  
      // ------------------------------------------------------------
      // PROGRESS BAR UPDATES
      // ------------------------------------------------------------
      function updateProgress() {
        console.log('updateProgress fired at', Date.now());
  const progressBar = document.getElementById('quoteProgressBar');
  const stepElements = document.querySelectorAll('#scaffCheckStepFormContent > div');
  let currentStepIndex = 0;
  const totalSteps = stepElements.length;

  stepElements.forEach((step, index) => {
    if (window.getComputedStyle(step).display !== 'none') {
      currentStepIndex = index + 1;
    }
  });

  let progressPercentage = Math.floor((currentStepIndex / totalSteps) * 100);
  if (progressPercentage > 100) progressPercentage = 100;

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
      setTimeout(updateProgress, 25);
    
    initializeTradeSearch();
    }
  
  function initializeRemedialFieldToggle() {
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

  const tg20YesRadio = document.getElementById("TG20ComplianceYes");
  const tg20NoRadio  = document.getElementById("TG20ComplianceNo");
  const tg20Wrapper  = document.getElementById("TG20HiddenQuestions");

  function toggleTG20Fields() {
    if (tg20NoRadio.checked) {
      // Show the wrapper and make inner radios required
      tg20Wrapper.classList.remove("d-none");
      tg20Wrapper.querySelectorAll("input[type='radio']").forEach(input => {
        input.setAttribute("required", "required");
      });
    } else {
      // Hide the wrapper, remove required, and clear any selections
      tg20Wrapper.classList.add("d-none");
      tg20Wrapper.querySelectorAll("input[type='radio']").forEach(input => {
        input.removeAttribute("required");
        input.checked = false;
      });
    }
  }

  // Watch for changes on TG20 radios:
  tg20YesRadio.addEventListener("change", toggleTG20Fields);
  tg20NoRadio.addEventListener("change", toggleTG20Fields);

  // Run once on load, in case “No” was pre‐selected:
  toggleTG20Fields();

  initializeRemedialFieldToggle();
});
  