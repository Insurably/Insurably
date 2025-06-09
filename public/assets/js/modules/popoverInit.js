// popoverInit.js

export function initializePopovers() {
  // Checks for Bootstrap and relevant elements
  if (!window.bootstrap) {
    console.error("Bootstrap not loaded.");
    return;
  }
  const popoverElements = document.querySelectorAll('[data-bs-toggle="popover"]');
  popoverElements.forEach(el => {
    new bootstrap.Popover(el, {
      container: 'body',
      boundary: 'viewport',
      placement: 'bottom',
      trigger: 'focus'
    });
  });
}
