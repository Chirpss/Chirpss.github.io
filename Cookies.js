/**
 * Cookies.js (Improved)
 * Manages Cookie Consent for Chirpss
 * specific support for Google Consent Mode v2 (March 2024 reqs)
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        key: 'chirpss_analytics_consent',
        ga_id: 'G-SV2022ERX5',
        // All the Google Consent Mode v2 keys
        consent_types: {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        }
    };

    // --- 1. Initialize Google Consent Mode ---
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    // Set Defaults immediately (Deny All)
    gtag('consent', 'default', CONFIG.consent_types);

    // --- 2. Load Google Analytics ---
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ga_id}`;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', CONFIG.ga_id, { 'anonymize_ip': true });

    // --- 3. UI Helpers (Styles & HTML) ---
    
    function injectStyles() {
        if (document.getElementById('chirpss-cookie-style')) return;
        const style = document.createElement('style');
        style.id = 'chirpss-cookie-style';
        style.innerHTML = `
            /* Banner Styles */
            #cookie-banner {
                position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
                background-color: #2A3C50; color: #F5F1E6;
                padding: 1.5rem; box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
                font-family: 'Inter', sans-serif;
                transform: translateY(100%); transition: transform 0.3s ease-in-out;
            }
            #cookie-banner.visible { transform: translateY(0); }
            
            .cb-content {
                max-width: 900px; margin: 0 auto; display: flex; 
                flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;
            }
            .cb-text { font-size: 0.95rem; line-height: 1.4; flex: 1; min-width: 250px; }
            .cb-text a { color: #E87040; text-decoration: underline; }
            
            .cb-buttons { display: flex; gap: 0.75rem; }
            
            button.cb-btn {
                padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; 
                font-weight: 600; font-size: 0.9rem; transition: opacity 0.2s;
            }
            button.cb-accept { background-color: #E87040; color: #1C2A39; border: none; }
            button.cb-decline { background-color: transparent; color: #F5F1E6; border: 1px solid #5A6F82; }
            button.cb-btn:hover { opacity: 0.9; }

            /* Re-open Button (Floating Shield) */
            #cookie-revoke {
                position: fixed; bottom: 20px; left: 20px; z-index: 9998;
                background: #2A3C50; color: #fff; width: 40px; height: 40px;
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                border: 2px solid #5A6F82; font-size: 1.2rem;
            }
            #cookie-revoke:hover { transform: scale(1.1); }
        `;
        document.head.appendChild(style);
    }

    function createBanner() {
        injectStyles();
        if (document.getElementById('cookie-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cb-content">
                <div class="cb-text">
                    We use cookies to improve your gaming experience. 
                    Without consent, we use basic cookieless analytics.
                    <a href="/cookies.html">Learn more.</a>
                </div>
                <div class="cb-buttons">
                    <button id="cb-decline" class="cb-btn cb-decline">Decline</button>
                    <button id="cb-accept" class="cb-btn cb-accept">Accept All</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        // Animation delay for smoother UX
        setTimeout(() => banner.classList.add('visible'), 100);

        document.getElementById('cb-accept').addEventListener('click', () => updateConsent('granted'));
        document.getElementById('cb-decline').addEventListener('click', () => updateConsent('denied'));
    }

    function createRevokeButton() {
        injectStyles();
        if (document.getElementById('cookie-revoke')) return;
        
        const btn = document.createElement('div');
        btn.id = 'cookie-revoke';
        btn.title = "Manage Cookie Preferences";
        btn.innerHTML = '🍪'; // Or use an SVG shield icon here
        btn.addEventListener('click', () => {
            const banner = document.getElementById('cookie-banner');
            if (banner) banner.classList.add('visible');
        });
        document.body.appendChild(btn);
    }

    // --- 4. Logic & State Management ---

    function updateConsent(state) {
        localStorage.setItem(CONFIG.key, state);
        
        // Hide Banner
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.remove('visible');

        if (state === 'granted') {
            // Update ALL signals for Consent Mode v2
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        } else {
            // If denied, we strictly do NOT update. 
            // The defaults (denied) set at the top remain active.
        }
    }

    // --- 5. Execution ---

    const savedStatus = localStorage.getItem(CONFIG.key);

    if (savedStatus === 'granted') {
        // User previously accepted - restore full tracking
        updateConsent('granted');
        createRevokeButton(); // Allow them to change mind
    } else if (savedStatus === 'denied') {
        // User previously declined - stay in ping mode
        createRevokeButton(); // Allow them to change mind
    } else {
        // New user - show banner
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createBanner);
        } else {
            createBanner();
        }
    }

})();
