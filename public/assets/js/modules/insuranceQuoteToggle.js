// insuranceQuoteToggle.js

export function initializeInsuranceQuoteToggle() {
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
