// selectInit.js

export function initializeSelects() {
  if (window.HSCore && HSCore.components && HSCore.components.HSTomSelect) {
    HSCore.components.HSTomSelect.init('.js-select-trades');
  } else {
    console.error('HSCore or TomSelect not found.');
  }
}
