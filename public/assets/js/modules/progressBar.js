// progressBar.js

export function updateProgress() {
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
