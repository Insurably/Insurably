// tg20Toggle.js

export function initializeTG20Toggle() {
  const tg20YesRadio = document.getElementById("TG20ComplianceYes");
  const tg20NoRadio  = document.getElementById("TG20ComplianceNo");
  const tg20Wrapper  = document.getElementById("TG20HiddenQuestions");

  if (!tg20YesRadio || !tg20NoRadio || !tg20Wrapper) return;

  function toggleTG20Fields() {
    if (tg20NoRadio.checked) {
      // Show the wrapper and make inner radios required
      tg20Wrapper.classList.remove("d-none");
      tg20Wrapper.querySelectorAll("input[type='radio']").forEach(input => {
        input.setAttribute("required", "required");
      });
    } else {
      // Hide the wrapper, remove required, and clear any selections
      tg20Wrapper.classList.add("d-none");
      tg20Wrapper.querySelectorAll("input[type='radio']").forEach(input => {
        input.removeAttribute("required");
        input.checked = false;
      });
    }
  }

  // Watch for changes on TG20 radios:
  tg20YesRadio.addEventListener("change", toggleTG20Fields);
  tg20NoRadio.addEventListener("change", toggleTG20Fields);

  // Run once on load, in case “No” was pre‐selected:
  toggleTG20Fields();
}
