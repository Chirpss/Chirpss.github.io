/**
 * Cookies.js
 * Manages Cookie Consent for Chirpss (GDPR/ePrivacy Compliance)
 * Implements Google Consent Mode v2 for cookieless analytics.
 */

(function() {
    const CONSENT_KEY = 'chirpss_analytics_consent';
    const ANALYTICS_ID = 'G-SV2022ERX5';
    
    // --- 1. Initialize Google Consent Mode (The "Cookieless" Setup) ---
    // We must define these functions BEFORE loading the Google script.
    
    window.dataLayer = window.dataLayer || [];
    
    function gtag() { dataLayer.push(arguments); }
    
    // CRITICAL: Set default consent to 'denied'.
    // This tells Google: "Load the code so we can send pings, but DO NOT write cookies."
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied' // This stops the _ga cookie
    });
    
    // --- 2. Load the Google Analytics Script ---
    // We load it now so it can send anonymous pings (cookieless) immediately.
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
    document.head.appendChild(script);
    
    // Initialize GA
    gtag('js', new Date());
    gtag('config', ANALYTICS_ID, { 'anonymize_ip': true });
    
    
    // --- 3. Consent Management Logic ---
    
    function getConsentStatus() {
        return localStorage.getItem(CONSENT_KEY);
    }
    
    function setConsentStatus(status) {
        localStorage.setItem(CONSENT_KEY, status);
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();
        
        if (status === 'accepted') {
            // User said YES: Update consent to 'granted'.
            // Google will now start writing cookies for better tracking.
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        // If 'declined', we do nothing. The default was already 'denied', 
        // so it stays in "Cookieless Ping Mode".
    }
    
    // --- 4. Render the Banner ---
    
    function createBanner() {
        // Prevent duplicate banners
        if (document.getElementById('cookie-banner')) return;
        
        const bannerHtml = `
            <div id="cookie-banner" style="
                position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
                background-color: #2A3C50; color: #F5F1E6;
                padding: 1rem; box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
                font-family: 'Inter', sans-serif; font-size: 0.9rem;
                display: flex; flex-direction: column; align-items: center; text-align: center;
            ">
                <div style="max-width: 900px; width: 100%;">
                    <p style="margin-bottom: 0.75rem;">
                        We use cookies to improve the gaming experience. 
                        Without consent, we use basic cookieless analytics.
                        <a href="/cookies.html" style="color: #E87040; text-decoration: underline;">Learn more.</a>
                    </p>
                    <div style="display: flex; gap: 0.75rem; justify-content: center;">
                        <button id="accept-cookies" style="
                            background-color: #E87040; color: #1C2A39; font-weight: bold;
                            padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; border: none;
                        ">Accept All</button>
                        <button id="decline-cookies" style="
                            background-color: transparent; color: #F5F1E6;
                            border: 1px solid #5A6F82; padding: 0.5rem 1rem;
                            border-radius: 0.5rem; cursor: pointer;
                        ">Decline</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', bannerHtml);
        
        document.getElementById('accept-cookies').addEventListener('click', () => setConsentStatus('accepted'));
        document.getElementById('decline-cookies').addEventListener('click', () => setConsentStatus('declined'));
    }
    
    // --- 5. Run Check ---
    
    const status = getConsentStatus();
    
    if (status === 'accepted') {
        // Restore 'granted' state if they accepted previously
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
    } else if (status === 'declined') {
        // Keep 'denied' (Cookieless)
    } else {
        // New visitor: Show banner
        // (GA is running in 'denied' mode in the background)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createBanner);
        } else {
            createBanner();
        }
    }
})();