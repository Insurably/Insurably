document.addEventListener("DOMContentLoaded", function () {
    // Create Cookie Banner
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.innerHTML = `
        <p>This website uses cookies to enhance your experience. Select your preferences below.</p>
        <button id="accept-all">Accept All</button>
        <button id="reject-all">Reject All</button>
        <button id="customize">Customize</button>
    `;
    document.body.appendChild(banner);

    // Create Cookie Preferences Modal
    const modal = document.createElement("div");
    modal.id = "cookie-modal";
    modal.innerHTML = `
        <p>Select which cookies to enable:</p>
        <label><input type="checkbox" id="analytics"> Analytics Cookies</label><br>
        <label><input type="checkbox" id="marketing"> Marketing Cookies</label><br><br>
        <button id="save-preferences">Save Preferences</button>
    `;
    document.body.appendChild(modal);

    // Check if consent is already given
    if (!localStorage.getItem("cookieConsent")) {
        banner.style.display = "block";
    } else {
        applyConsent();
    }

    // Button Event Listeners
    document.getElementById("accept-all").addEventListener("click", function () {
        localStorage.setItem("cookieConsent", "all");
        applyConsent();
        banner.style.display = "none";
    });

    document.getElementById("reject-all").addEventListener("click", function () {
        localStorage.setItem("cookieConsent", "none");
        banner.style.display = "none";
    });

    document.getElementById("customize").addEventListener("click", function () {
        modal.style.display = "block";
    });

    document.getElementById("save-preferences").addEventListener("click", function () {
        let consentSettings = [];
        if (document.getElementById("analytics").checked) consentSettings.push("analytics");
        if (document.getElementById("marketing").checked) consentSettings.push("marketing");
        localStorage.setItem("cookieConsent", JSON.stringify(consentSettings));
        modal.style.display = "none";
        banner.style.display = "none";
        applyConsent();
    });
});

function applyConsent() {
    const consent = JSON.parse(localStorage.getItem("cookieConsent"));

    if (consent === "all" || (Array.isArray(consent) && consent.includes("analytics"))) {
        loadAnalytics();
    }
    if (consent === "all" || (Array.isArray(consent) && consent.includes("marketing"))) {
        loadMarketing();
    }
}

function loadAnalytics() {
    let script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID";
    script.async = true;
    document.head.appendChild(script);

    script.onload = function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag("js", new Date());
        gtag("config", "YOUR_GA_ID");
    };
}

function loadMarketing() {
    let script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = function () {
        fbq('init', 'YOUR_FB_PIXEL_ID');
        fbq('track', 'PageView');
    };
}

function resetCookies() {
    localStorage.removeItem("cookieConsent");
    location.reload();
}
