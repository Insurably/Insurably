import { loadHeaderAndFooter } from './assets/js/modules/headerFooterLoader.js';
import { initializeStepForm } from './assets/js/modules/stepForm.js';
import { initializeInsuranceQuoteToggle } from './assets/js/modules/insuranceQuoteToggle.js';
import { initializeAllPhotoPreviews } from './assets/js/modules/photoPreview.js';
import { initializeDatePickers, waitForjQueryAndDatepicker } from './assets/js/modules/datePickerInit.js';
import { initializeGoogleAutocomplete } from './assets/js/modules/addressAutocomplete.js';
import { initializeTG20Toggle } from './assets/js/modules/tg20Toggle.js';
import { updateProgress } from './assets/js/modules/progressBar.js';
import { initializePopovers } from './assets/js/modules/popoverInit.js';
import { initializeStickyBlocks } from './assets/js/modules/stickyBlock.js';
import { initializeSelects } from './assets/js/modules/selectInit.js';
import { initializeAnswerButtonScroll } from './assets/js/modules/answerScroll.js';
// (import others as you modularise)

document.addEventListener("DOMContentLoaded", function () {
  // Load header & footer, then run page initialisers
  loadHeaderAndFooter(initializePageComponents);

  // Optional: Bootstrap datepicker for a single field, before main init
  $(function () {
    $('#dateErected').datepicker({
      format: 'dd/mm/yyyy',
      autoclose: true,
      todayHighlight: true
    });
  });

  // Google Places Address Autocomplete
  window.addEventListener("load", function () {
    if (typeof google !== "undefined" && google.maps) {
      initializeGoogleAutocomplete();
    } else {
      console.error("Google Maps API not loaded on page load.");
    }
  });

  function initializePageComponents() {
    // Header-dependent UI inits
    if (window.HSMegaMenu) {
      new HSMegaMenu('.js-mega-menu', { desktop: { position: 'left' } });
    }

    // Main modular initialisers
    initializeStepForm(updateProgress);
    initializeInsuranceQuoteToggle();
    initializeAllPhotoPreviews();
    initializeTG20Toggle();
    initializePopovers();
    initializeStickyBlocks();
    initializeSelects();
    initializeAnswerButtonScroll();

    // Extra component initialisation (optional)
    if (window.HSShowAnimation) {
      new HSShowAnimation('.js-animation-link');
    }
    if (window.HSBsDropdown) {
      HSBsDropdown.init();
    }
    if (window.HSGoTo) {
      new HSGoTo('.js-go-to');
    }

    // Datepickers (wait for jQuery & plugin)
    waitForjQueryAndDatepicker(initializeDatePickers);

    // Initial progress bar update
    setTimeout(updateProgress, 25);

    // If you still want trade search, import and call here:
    // initializeTradeSearch(); // if/when needed
  }
});
