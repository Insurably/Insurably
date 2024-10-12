document.addEventListener("DOMContentLoaded", function () {
    // INITIALIZATION OF BOOTSTRAP VALIDATION
    HSBsValidation.init('.js-validate', {
        onSubmit: data => {
            data.event.preventDefault();
            alert('Submitted');
        }
    });

    // INITIALIZATION OF BOOTSTRAP DROPDOWN
    HSBsDropdown.init();
});
