/**
 * Cookies.js (Multi-language Support)
 * Manages Cookie Consent for Chirpss
 * Support for Google Consent Mode v2
 */

(function() {
    'use strict';

    // --- Configuration & Translations ---
    const CONFIG = {
        key: 'chirpss_analytics_consent',
        ga_id: 'G-SV2022ERX5',
        consent_types: {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        }
    };

    // Detect Language (Check URL for /De/ or HTML lang tag)
    const isGerman = window.location.href.includes('/De/') || document.documentElement.lang === 'de';

    const TEXT = isGerman ? {
        msg: 'Wir verwenden Cookies, um dein Spielerlebnis zu verbessern. Ohne Einwilligung nutzen wir einfache, cookie-freie Analysen.',
        learn: 'Mehr erfahren.',
        link: 'https://chirpss.github.io/De/cookies',
        decline: 'Ablehnen',
        accept: 'Alle akzeptieren'
    } : {
        msg: 'We use cookies to improve your gaming experience. Without consent, we use basic cookieless analytics.',
        learn: 'Learn more.',
        link: 'https://chirpss.github.io/En/cookies',
        decline: 'Decline',
        accept: 'Accept All'
    };

    // --- 1. Initialize Google Consent Mode ---
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

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
                    ${TEXT.msg}
                    <a href="${TEXT.link}">${TEXT.learn}</a>
                </div>
                <div class="cb-buttons">
                    <button id="cb-decline" class="cb-btn cb-decline">${TEXT.decline}</button>
                    <button id="cb-accept" class="cb-btn cb-accept">${TEXT.accept}</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('visible'), 100);

        document.getElementById('cb-accept').addEventListener('click', () => updateConsent('granted'));
        document.getElementById('cb-decline').addEventListener('click', () => updateConsent('denied'));
    }

    function createRevokeButton() {
        injectStyles();
        if (document.getElementById('cookie-revoke')) return;
        const btn = document.createElement('div');
        btn.id = 'cookie-revoke';
        btn.title = isGerman ? "Cookie-Einstellungen" : "Manage Cookie Preferences";
        btn.innerHTML = '🍪';
        btn.addEventListener('click', () => {
            const banner = document.getElementById('cookie-banner');
            if (banner) banner.classList.add('visible');
        });
        document.body.appendChild(btn);
    }

    // --- 4. Logic & State Management ---
    function updateConsent(state) {
        localStorage.setItem(CONFIG.key, state);
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.remove('visible');

        if (state === 'granted') {
            gtag('consent', 'update', {
                'ad_storage': 'granted', 'ad_user_data': 'granted',
                'ad_personalization': 'granted', 'analytics_storage': 'granted'
            });
        }
    }

    // --- 5. Execution ---
    const savedStatus = localStorage.getItem(CONFIG.key);
    if (savedStatus === 'granted') {
        updateConsent('granted');
        createRevokeButton();
    } else if (savedStatus === 'denied') {
        createRevokeButton();
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createBanner);
        } else {
            createBanner();
        }
    }
})();
