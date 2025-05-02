document.addEventListener("DOMContentLoaded", function () {
    // INITIALIZATION OF HEADER
    new HSHeader('#header').init();

    // INITIALIZATION OF MEGA MENU
    new HSMegaMenu('.js-mega-menu', {
        desktop: {
            position: 'left'
        }
    });

    // INITIALIZATION OF GO TO (Scroll-to-top Button)
    new HSGoTo('.js-go-to');
});
