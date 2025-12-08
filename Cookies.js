/**
 * Cookies.js
 * Manages Cookie Consent for Chirpss (GDPR/ePrivacy Compliance)
 * Loads Google Analytics (G-SV2022ERX5) only upon user consent.
 */

(function () {
    const CONSENT_KEY = 'chirpss_analytics_consent';
    const ANALYTICS_ID = 'G-SV2022ERX5';

    // --- 1. GA Placeholder Setup (Required for initial 'denied' state) ---

    // Define gtag placeholder function if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { dataLayer.push(arguments); };

    // Set default consent status to DENIED for analytics storage
    window.gtag('consent', 'default', {
        'analytics_storage': 'denied'
    });

    // Send the config hit with the denied status (required for IP anonymization/data modeling)
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID, { 'anonymize_ip': true });


    // --- 2. Core Functions ---

    /** Gets consent status from local storage (or null if not set) */
    function getConsentStatus() {
        return localStorage.getItem(CONSENT_KEY);
    }

    /** Sets the consent status and triggers necessary actions */
    function setConsentStatus(status) {
        // Status can be 'accepted' or 'declined'
        localStorage.setItem(CONSENT_KEY, status);
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.remove();
        }
        
        if (status === 'accepted') {
            // Update the GA consent status to 'granted'
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }
    
    /** Loads the Google Analytics script tag */
    function loadGAScriptTag() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
        
        // Use document.head if possible, fallback to document.body
        const target = document.head || document.body;
        if (target) {
             target.appendChild(script);
        }
    }


    // --- 3. Render Banner HTML ---

    function createBanner() {
        const bannerHtml = `
            <div id="cookie-banner" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background-color: #2A3C50; /* input-bg */
                color: #F5F1E6; /* soft-horizon */
                padding: 1rem;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            ">
                <div style="max-width: 900px; width: 100%;">
                    <p style="margin-bottom: 0.75rem;">
                        This site uses non-essential cookies for <span style="font-weight: 700; color: #FFC35B;">analytics and performance tracking</span> (Google Analytics) to improve your experience.
                        <a href="/cookies.html" style="color: #E87040; text-decoration: underline;">Learn more.</a>
                    </p>
                    <div style="display: flex; gap: 0.75rem; justify-content: center;">
                        <button id="accept-cookies" style="
                            background-color: #E87040; /* warm-dusk */
                            color: #1C2A39; /* deep-twilight */
                            font-weight: bold;
                            padding: 0.5rem 1rem;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        ">Accept All</button>
                        <button id="decline-cookies" style="
                            background-color: transparent;
                            color: #F5F1E6;
                            border: 1px solid #5A6F82; /* subtle-gray */
                            padding: 0.5rem 1rem;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        ">Decline</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHtml);

        // --- 4. Attach Listeners ---
        document.getElementById('accept-cookies').addEventListener('click', () => {
            setConsentStatus('accepted');
        });

        document.getElementById('decline-cookies').addEventListener('click', () => {
            setConsentStatus('declined');
        });
    }

    // --- 5. Initialization Logic ---

    // Load the GA script tag immediately to define the necessary functions/placeholders
    loadGAScriptTag();

    const status = getConsentStatus();

    if (status === 'accepted') {
        // User previously accepted, update consent (already granted by default placeholder logic)
        window.gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });
    } else if (status === 'declined') {
        // User previously declined, GA remains denied by default placeholder logic
        console.log("Analytics remains denied by user choice.");
    } else {
        // No choice made, show the banner
        document.addEventListener('DOMContentLoaded', createBanner);
    }
})();
