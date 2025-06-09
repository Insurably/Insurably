// stickyBlock.js

export function initializeStickyBlocks() {
  new HSStickyBlock('.js-sticky-block', {
    targetSelector: (
      document.getElementById('header') &&
      document.getElementById('header').classList.contains('navbar-fixed')
    ) ? '#header' : null
  });
}
