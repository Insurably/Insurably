export function loadHeaderAndFooter(onHeaderLoaded, headerSelector = "header-placeholder", footerSelector = "footer-placeholder") {
  // Load Header
  fetch("header-toolbox.html")
    .then(response => response.text())
    .then(data => {
      const header = document.getElementById(headerSelector);
      if (header) header.innerHTML = data;
      if (typeof onHeaderLoaded === "function") onHeaderLoaded(); // <-- Callback here
    })
    .catch(error => console.error("Error loading header:", error));

  // Load Footer
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      const footer = document.getElementById(footerSelector);
      if (footer) footer.innerHTML = data;
    })
    .catch(error => console.error("Error loading footer:", error));
}
