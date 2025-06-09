// datePickerInit.js

export function initializeDatePickers() {
  // Now that jQuery is available, attach datepicker to all elements with the .datepicker class.
  $('.datepicker').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true,
    todayHighlight: true,
    startDate: new Date()
  });
}

// Helper function to wait for jQuery and datepicker before running the initializer
export function waitForjQueryAndDatepicker(callback, interval = 50, maxAttempts = 100) {
  let attempts = 0;
  const timer = setInterval(function () {
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
