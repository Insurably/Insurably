import { fetchAllTrades } from "./supaquote.js";

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
  
  
  // Call the function
  initializeTradeSearch();
  

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
            let scrollTimeout;
            window.addEventListener('scroll', function scrollHandler() {
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                updateProgress();
                window.removeEventListener('scroll', scrollHandler);
              }, 100);
            });
          },
          onPrevStep: () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            let scrollTimeout;
            window.addEventListener('scroll', function scrollHandler() {
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                updateProgress();
                window.removeEventListener('scroll', scrollHandler);
              }, 100);
            });
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
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
            setTimeout(updateProgress, 500);
          }
        });
      });
  
      // ------------------------------------------------------------
      // SCROLL ON ANSWER BUTTON CLICKS (for each question)
      // ------------------------------------------------------------
      document.querySelectorAll('.question-container .answer-btn').forEach(button => {
        button.addEventListener('click', function () {
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
    
    initializeTradeSearch();
    }
  });
  