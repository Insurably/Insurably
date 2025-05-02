document.addEventListener("DOMContentLoaded", function () {
    // Create Cookie Banner
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.innerHTML = `
        <div style="position: fixed; bottom: 0; left: 0; width: 100%; background: #222; color: white; padding: 15px; text-align: center; font-size: 14px; z-index: 1000;">
            <p>This website uses cookies to enhance your experience. Select your preferences below.</p>
            <button id="accept-all" style="background: #4CAF50; color: white; padding: 8px 12px; border: none;">Accept All</button>
            <button id="reject-all" style="background: #f44336; color: white; padding: 8px 12px; border: none;">Reject All</button>
            <button id="customize" style="background: #008CBA; color: white; padding: 8px 12px; border: none;">Customize</button>
        </div>
    `;
    document.body.appendChild(banner);

    // Create Cookie Preferences Modal
    const modal = document.createElement("div");
    modal.id = "cookie-modal";
    modal.style.display = "none";
    modal.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0,0,0,0.2); text-align: center; z-index: 1001;">
            <h3>Cookie Preferences</h3>
            <p>Select which cookies to enable:</p>
            <label><input type="checkbox" id="analytics"> Analytics Cookies</label><br>
            <label><input type="checkbox" id="marketing"> Marketing Cookies</label><br><br>
            <button id="save-preferences" style="background: #4CAF50; color: white; padding: 8px 12px; border: none;">Save Preferences</button>
            <button id="close-modal" style="background: #777; color: white; padding: 8px 12px; border: none; margin-left: 10px;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Show cookie banner if no consent is stored
    if (!localStorage.getItem("cookieConsent")) {
        banner.style.display = "block";
    } else {
        applyConsent();
    }

    // Accept all cookies
    document.getElementById("accept-all").addEventListener("click", function () {
        localStorage.setItem("cookieConsent", JSON.stringify(["all"]));
        applyConsent();
        banner.style.display = "none";
    });

    // Reject all cookies
    document.getElementById("reject-all").addEventListener("click", function () {
        localStorage.setItem("cookieConsent", "none");
        banner.style.display = "none";
    });

    // Open Cookie Preferences Modal
    document.getElementById("customize").addEventListener("click", function () {
        modal.style.display = "block";
        loadPreferences();
    });

    // Close Cookie Preferences Modal
    document.getElementById("close-modal").addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Save preferences
    document.getElementById("save-preferences").addEventListener("click", function () {
        let consentSettings = [];
        if (document.getElementById("analytics").checked) consentSettings.push("analytics");
        if (document.getElementById("marketing").checked) consentSettings.push("marketing");
        localStorage.setItem("cookieConsent", JSON.stringify(consentSettings));
        modal.style.display = "none";
        banner.style.display = "none";
        applyConsent();
    });

    // Allow "Manage Cookies" links to reopen the settings modal
    document.querySelectorAll(".manage-cookies").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            modal.style.display = "block";
            loadPreferences();
        });
    });
});

// Apply cookie preferences
function applyConsent() {
    let consent = JSON.parse(localStorage.getItem("cookieConsent"));

    if (consent.includes("all") || (Array.isArray(consent) && consent.includes("analytics"))) {
        loadAnalytics();
    }
    if (consent.includes("all") || (Array.isArray(consent) && consent.includes("marketing"))) {
        loadMarketing();
    }
}

// Load user preferences into the modal
function loadPreferences() {
    const consent = JSON.parse(localStorage.getItem("cookieConsent"));
    document.getElementById("analytics").checked = consent === "all" || (Array.isArray(consent) && consent.includes("analytics"));
    document.getElementById("marketing").checked = consent === "all" || (Array.isArray(consent) && consent.includes("marketing"));
}

// Load analytics script after consent
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

// Load marketing scripts after consent
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

// Reset Cookies (Used when clicking "Manage Cookies")
function resetCookies() {
    localStorage.removeItem("cookieConsent");
    location.reload();
}
