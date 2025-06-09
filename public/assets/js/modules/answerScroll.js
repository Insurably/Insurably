// answerScroll.js

import { scrollToNextQuestion } from './scrollHelpers.js';

export function initializeAnswerButtonScroll() {
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
}
