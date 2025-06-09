export function scrollToElementWithOffset(element, offset = 80) {
  const elementRect = element.getBoundingClientRect();
  const offsetPosition = elementRect.top + window.pageYOffset - offset;
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
}

export function scrollToProgress() {
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

export function scrollToNextQuestion(currentContainer) {
  let nextContainer = currentContainer.nextElementSibling;
  while (nextContainer && !nextContainer.classList.contains('question-container')) {
    nextContainer = nextContainer.nextElementSibling;
  }
  if (nextContainer) {
    scrollToElementWithOffset(nextContainer, 80);
  }
}
