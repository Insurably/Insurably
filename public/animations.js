document.addEventListener("DOMContentLoaded", function () {
    // INITIALIZATION OF AOS (Animate on Scroll)
    AOS.init({
        duration: 650,
        once: true
    });

    // INITIALIZATION OF TYPED.JS
    HSCore.components.HSTyped.init('.js-typedjs');
});
