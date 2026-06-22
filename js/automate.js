        // Handle dropdown toggle - allow normal link behavior on mobile
        document.addEventListener('DOMContentLoaded', function () {
            const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

            function closeAllDropdowns() {
                document.querySelectorAll('.dropdown.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }

            function closeMobileNavbarIfOpen() {
                const navbarCollapse = document.getElementById('navbarNav');
                if (!navbarCollapse) return;
                if (!navbarCollapse.classList.contains('show')) return;
                if (!window.bootstrap?.Collapse) {
                    navbarCollapse.classList.remove('show');
                    return;
                }
                const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }

            dropdownToggles.forEach(toggle => {
                toggle.addEventListener('click', function (e) {
                    const href = (toggle.getAttribute('href') || '').trim();
                    const hashIndex = href.indexOf('#');
                    const hash = hashIndex >= 0 ? href.slice(hashIndex).toLowerCase() : '';

                    // Special-case: clicking "Bots" should close the dropdown before scrolling to the section.
                    if (hash === '#bots') {
                        e.preventDefault();

                        const dropdownContainer = toggle.closest('.nav-item.dropdown') || toggle.closest('.dropdown');
                        if (dropdownContainer) {
                            dropdownContainer.classList.add('disable-hover');
                            const removeDisableHover = () => dropdownContainer.classList.remove('disable-hover');
                            dropdownContainer.addEventListener('mouseleave', removeDisableHover, { once: true });
                            setTimeout(removeDisableHover, 1500);
                        }

                        // Hide any currently open dropdown UI immediately.
                        closeAllDropdowns();
                        if (window.bootstrap?.Dropdown) {
                            try {
                                const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
                                bsDropdown.hide();
                            } catch (_) {
                                // Ignore bootstrap dropdown errors and fall back to class removal.
                            }
                        }

                        // Drop focus so hover/focus styles don't keep it feeling "open".
                        if (document.activeElement === toggle) {
                            toggle.blur();
                        }

                        // If we're on mobile and the navbar is open, close it.
                        closeMobileNavbarIfOpen();

                        const target = document.getElementById('bots');
                        if (target) {
                            // Update URL without causing the browser's default jump.
                            if (window.history?.pushState) {
                                window.history.pushState(null, '', '#bots');
                            } else {
                                window.location.hash = 'bots';
                            }

                            requestAnimationFrame(() => {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            });
                            return;
                        }

                        // Fallback: if the target isn't on the page for some reason, navigate normally.
                        window.location.href = href || '/#bots';
                        return;
                    }

                    // On mobile, allow the link to work normally (don't prevent default)
                    // The CSS already hides the dropdown menu on mobile
                    if (window.innerWidth < 992) {
                        // Let the link navigate normally - don't prevent default
                        return;
                    }
                });
            });

            // Close dropdown when clicking outside (desktop only)
            document.addEventListener('click', function (e) {
                if (window.innerWidth >= 992) {
                    if (!e.target.closest('.dropdown')) {
                        closeAllDropdowns();
                    }
                }
            });

            // Close mobile navbar when clicking outside
            const navbarCollapse = document.getElementById('navbarNav');
            const navbarToggler = document.querySelector('.navbar-toggler');

            if (navbarCollapse && navbarToggler) {
                document.addEventListener('click', function (e) {
                    // Check if navbar is open
                    const isNavbarOpen = navbarCollapse.classList.contains('show');

                    // Check if click is outside navbar
                    const isClickInsideNavbar = navbarCollapse.contains(e.target);
                    const isClickOnToggler = navbarToggler.contains(e.target);

                    // Close if navbar is open and click is outside
                    if (isNavbarOpen && !isClickInsideNavbar && !isClickOnToggler) {
                        // Use Bootstrap's collapse method to close
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                            toggle: false
                        });
                        bsCollapse.hide();
                    }
                });
            }
        });

        const minBal = 0.00;
        const apiUrl = '/api';

        function scrollToAffiliateProgramSection() {
            const affiliateSection = document.getElementById('affiliate-program-section');

            if (affiliateSection)
                affiliateSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
        }

        function scrollToFeeSection() {
            const feeSection = document.getElementById('fees-section');

            if (feeSection)
                feeSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
        }

        function scrollToTopSmooth() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        function scrollToTopDelayed() {
            setTimeout(() => {
                switch (document.location.hash) {
                    case '#affiliate-program-section':
                        return scrollToAffiliateProgramSection();
                    case '#fees-section':
                        return scrollToFeeSection();
                    default:
                        return scrollToTopSmooth();
                }
            }, 1000);
        }

        function setupBots() {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'bots',
                })
            })
                .then(response => response.json())
                .then(data => {
                    // apiUrl = `https://${data.cache}/api`;

                    window.bots = data.bots;

                    let html = '';

                    Object.entries(data.bots).forEach(([key, bot]) => {
                        html += `
<a href="#" onclick="return botLogin('${key}')" id="${key}-status"
    class="bot-indicator badge d-block w-100 bg-danger">
    ${bot.icon} ${bot.name} Deactivated
</a>
`;
                    });

                    /* html += `
                    <a href="#" onclick="alert('We develop custom bots, contact us 310-923-5603!'); return false;" 
                        class="badge d-block w-100 text-black fw-normal fs-6">
                        Custom Bot? Hire Us!
                    </a>
                    `; */

                    const botsCard = document.getElementById('bot-statuses-card-body');

                    if (botsCard)
                        botsCard.innerHTML = html;

                    updateBotStatuses();
                })
                .catch(error => console.error(error));
        }

        setupBots();

        function premiumBot() {
            setTimeout(() => {
                alert('This bot requires our dedicated native Bot Grabber device solution, please upgrade to access this bot!');
            }, 10);

            document.querySelector('.premium-device-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

            return false;
        }

        function botLogin(platform) {
            if (typeof window[`${platform}Login`] === "function")
                window[`${platform}Login`]();
            else
                premiumBot();

            return false;
        }

        function botLogout(platform) {
            logoutPlatform(platform);

            return false;
        }

        const loginRegisterForm = document.getElementById('authForm');
        const toggleLink = document.getElementById('toggleLink');
        const formTitle = document.getElementById('formTitle');
        const submitButton = document.getElementById('submitButton');
        const mobileWrap = document.getElementById('mobile-wrap');
        const toggleText = document.getElementById('toggleText');
        const emailPassWrap = document.getElementById('emailPassWrap');
        const verificationCodesWrap = document.getElementById('verificationCodesWrap');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const mobile = document.getElementById('mobile');
        const mobileVerifyCode = document.getElementById('mobile-verify-code');
        const emailVerifyCode = document.getElementById('email-verify-code');
        const loggedOutWrap = document.getElementById('logged-out-wrap');
        const loggedInWrap = document.getElementById('logged-in-wrap');
        const settingsForm = document.getElementById('settings-form');
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        const logoutButton = document.getElementById('logout-button');
        const profileButton = document.getElementById('profile-button');
        const mobileVerifyCodeWrap = document.getElementById('mobile-verify-code-wrap');
        const emailVerifyCodeWrap = document.getElementById('email-verify-code-wrap');
        const yourCurrentBalance = document.getElementById('your_current_balance');
        const yourCurrentBalanceVal = yourCurrentBalance?.getElementsByTagName('span')[0];
        const addBalanceLink = document.getElementById('add_balance_link');
        const _proxyHowTo = document.getElementById('proxyHowTo');
        const _proxyHowToCloseBtn = _proxyHowTo?.querySelector('.close-x');
        const addFundsDialog = document.getElementById('add_funds_dialog');
        const addFundsBtcLoading = document.getElementById('add-funds-btc-loading');
        const addFundsBtcError = document.getElementById('add-funds-btc-error');
        const addFundsBtcReady = document.getElementById('add-funds-btc-ready');
        const forgotPass = document.getElementById('forgot-pass');
        // SMS VERIFICATION DISABLED - Remove these lines
        // const forgotPassMobileVerifyCodeWrap = forgotPass.querySelector('.forgot-pass-mobile-verify-code-wrap');
        // const forgotPassMobileVerifyCodeInput = forgotPassMobileVerifyCodeWrap.querySelector('#forgot-pass-mobile-verify-code');
        // const forgotPassTel = forgotPass.querySelector('input[type="tel"]');

        // ✅ ADD THESE EMAIL-BASED VARIABLES
        const forgotPassEmailVerifyCodeWrap = forgotPass?.querySelector('.forgot-pass-email-verify-code-wrap');
        const forgotPassEmailVerifyCodeInput = forgotPassEmailVerifyCodeWrap?.querySelector('#forgot-pass-email-verify-code');
        const forgotPassEmail = forgotPass?.querySelector('input[type="email"]');

        const bitcoinQRImgLink = document.getElementById('bitcoinQRImgLink');
        const bitcoinAddress = document.getElementById('bitcoinAddress');
        const commissionSelect = document.getElementById('commission-rate');

        const defaultEncryptionKey = 'bUOraX2j3dpLpqaG2FLnBLllGI62XrFw';
        const GPSIntervalMilliSeconds = 60000 * 1;

        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (addBalanceLink)
            addBalanceLink.onclick = evt => {
                evt.preventDefault();

                addBalance();

                return false;
            }

        let action = 'login';

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function shortEncryptDecrypt(mode, data, key) {
            if (!key) throw new Error("A key is required.");

            const keyBytes = key.split('').map(c => c.charCodeAt(0));

            if (mode === "encrypt") {
                // XOR encryption
                const encrypted = data.split('').map((char, i) => {
                    const xorResult = char.charCodeAt(0) ^ keyBytes[i % keyBytes.length];
                    return String.fromCharCode(xorResult);
                }).join('');

                // Base64 URL-safe encoding
                return btoa(encrypted).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            } else if (mode === "decrypt") {
                // Base64 URL-safe decoding
                const decoded = atob(data.replace(/-/g, '+').replace(/_/g, '/'));

                // XOR decryption
                const decrypted = decoded.split('').map((char, i) => {
                    const xorResult = char.charCodeAt(0) ^ keyBytes[i % keyBytes.length];
                    return String.fromCharCode(xorResult);
                }).join('');
                return decrypted;
            } else {
                throw new Error("Invalid mode. Use 'encrypt' or 'decrypt'.");
            }
        }

        function addBalance() {
            if (!window._user)
                return alert('Please login or register first...');

            // payWithCashApp();
            payWithZelle();
        }

        function payWithPayPal() {
            const
                payPalEmail = 'paypal@shopgoodwillsniper.com',
                packageName = capitalizeFirstLetter(window.location.hostname) + ' Add Balance',
                returnUrl = window.location.href,
                cancelUrl = window.location.href,
                custom = {
                    u: window._user._id
                },
                donationUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${encodeURIComponent(payPalEmail)}&currency_code=USD&item_name=${encodeURIComponent(packageName)}&return=${encodeURIComponent(returnUrl)}&cancel_return=${encodeURIComponent(cancelUrl)}&custom=${encodeURIComponent(shortEncryptDecrypt('encrypt', JSON.stringify(custom), defaultEncryptionKey))}`
                ;

            window.location.href = donationUrl;
        }

        function payWithCashApp() {
            const
                packageName = capitalizeFirstLetter(window.location.hostname) + ' Add Balance',
                cashAppUsername = 'BestDigitalServices',
                cashAppUrl = `https://cash.app/$${cashAppUsername}?note=${encodeURIComponent(packageName)}`,
                cashAppAffUrl = `https://cash.app/app/DRVV12D`;

            // alert('A payment window will open now for you to make a payment, when you are done, come back to this window/page to enter the transaction number/identifier to verify your payment!');

            // window.open(cashAppAffUrl, '_blank');
            window.open(cashAppUrl, '_blank');
        }

        function payWithZelle() {
            const modal = bootstrap.Modal.getOrCreateInstance(addFundsDialog);
            afdLoadBtcAddress();
            modal.show();
        }

        function afdLoadBtcAddress() {
            if (window._afdBtcLoaded) return;

            if (addFundsBtcLoading) addFundsBtcLoading.style.display = '';
            if (addFundsBtcError) addFundsBtcError.style.display = 'none';
            if (addFundsBtcReady) addFundsBtcReady.style.display = 'none';

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'pay' })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('pay data', data);
                    if (!data.bitcoinAddress) throw new Error('No address in response');

                    const addr = data.bitcoinAddress;
                    bitcoinAddress.innerText = addr;

                    const qrWrap = document.getElementById('add-funds-qr-wrap');
                    const qrImg = document.getElementById('add-funds-qr-img');
                    const linkIcon = document.getElementById('bitcoinLinkIcon');
                    const linkHint = document.getElementById('add-funds-link-hint');

                    if (!isMobile) {
                        // Desktop: show scannable QR code; address box copies to clipboard on click
                        const qrSrc = data.qrCode || data.bitcoinQR;
                        if (qrWrap && qrImg && qrSrc) {
                            qrImg.src = qrSrc;
                            qrWrap.style.display = '';
                        }
                        bitcoinQRImgLink.removeAttribute('href');
                        bitcoinQRImgLink.title = 'Click to copy address';
                        bitcoinQRImgLink.setAttribute('role', 'button');
                        bitcoinQRImgLink.setAttribute('aria-label', 'Copy Bitcoin address');
                        bitcoinQRImgLink.onclick = function (e) {
                            e.preventDefault();
                            afdCopyAddressWithFeedback(linkIcon, linkHint, addr);
                            return false;
                        };
                        if (linkIcon) linkIcon.className = 'bi bi-clipboard afd-address-ext';
                        if (linkHint) { linkHint.style.display = ''; linkHint.textContent = 'Click address to copy'; }
                    } else {
                        // Mobile: bitcoin: URI opens native wallet app — no QR needed
                        bitcoinQRImgLink.href = `bitcoin:${addr}`;
                        bitcoinQRImgLink.title = 'Tap to open Bitcoin wallet';
                        if (qrWrap) qrWrap.style.display = 'none';
                        if (linkHint) linkHint.style.display = 'none';
                        if (linkIcon) linkIcon.className = 'bi bi-box-arrow-up-right afd-address-ext';
                    }

                    window._afdBtcLoaded = true;

                    if (addFundsBtcLoading) addFundsBtcLoading.style.display = 'none';
                    if (addFundsBtcError) addFundsBtcError.style.display = 'none';
                    if (addFundsBtcReady) addFundsBtcReady.style.display = '';
                })
                .catch(error => {
                    console.error('afdLoadBtcAddress error:', error);
                    if (addFundsBtcLoading) addFundsBtcLoading.style.display = 'none';
                    if (addFundsBtcError) addFundsBtcError.style.display = '';
                });
        }

        // Copy address with icon/hint feedback (used by address box click on desktop)
        function afdCopyAddressWithFeedback(iconEl, hintEl, addr) {
            const doFeedback = (ok) => {
                if (iconEl) iconEl.className = ok
                    ? 'bi bi-check-lg afd-address-ext text-success'
                    : 'bi bi-clipboard afd-address-ext';
                if (hintEl) hintEl.textContent = ok ? 'Copied!' : 'Select & copy manually';
                setTimeout(() => {
                    if (iconEl) iconEl.className = 'bi bi-clipboard afd-address-ext';
                    if (hintEl) hintEl.textContent = 'Click address to copy';
                }, 2500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(addr).then(() => doFeedback(true)).catch(() => {
                    const ta = document.createElement('textarea');
                    ta.value = addr;
                    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
                    document.body.appendChild(ta);
                    ta.focus(); ta.select();
                    doFeedback(document.execCommand('copy'));
                    document.body.removeChild(ta);
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = addr;
                ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                doFeedback(document.execCommand('copy'));
                document.body.removeChild(ta);
            }
        }

        // Copy address with button feedback (used by Copy Address button)
        function afdCopyAddress(btn) {
            const addr = document.getElementById('bitcoinAddress').innerText.trim();
            btn.disabled = true;
            const doFeedback = (ok) => {
                btn.innerHTML = ok
                    ? '<i class="bi bi-check-lg me-1"></i>Copied!'
                    : '<i class="bi bi-clipboard me-1"></i>Copy Address';
                btn.disabled = false;
                if (ok) setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copy Address'; }, 2500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(addr).then(() => doFeedback(true)).catch(() => {
                    const ta = document.createElement('textarea');
                    ta.value = addr;
                    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
                    document.body.appendChild(ta);
                    ta.focus(); ta.select();
                    doFeedback(document.execCommand('copy'));
                    document.body.removeChild(ta);
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = addr;
                ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
                document.body.appendChild(ta);
                ta.focus(); ta.select();
                doFeedback(document.execCommand('copy'));
                document.body.removeChild(ta);
            }
        }

        function afdRetryBtc() {
            window._afdBtcLoaded = false;
            afdLoadBtcAddress();
        }

        function copyToClipboard(elementId) {
            const inputElement = document.getElementById(elementId);

            const copyValue = inputElement.innerText.trim();

            navigator.clipboard.writeText(copyValue)
                .then(() => alert(`Copied To Clipboard: ${copyValue}`))
                .catch(err => console.error('Failed to copy text: ', err));
        }

        function startWebSocket() {
            if (navigator?.userAgent?.includes('BidSniper')) return;

            stopWebSocket();

            console.log('Starting WebSocket');

            window.ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

            window.ws.onopen = () => console.log('WebSocket opened');
            window.ws.onclose = () => setTimeout(() => reconnectWebSocket(), 2500);
            window.ws.onmessage = evt => incomingWebSocketMessage(evt);
            window.ws.onerror = error => console.error(error);
        }

        function stopWebSocket() {
            if (!window.ws)
                return;

            console.info('Stopping WebSocket...');

            try {
                window.ws.onopen = null;
                window.ws.onclose = null;
                window.ws.onmessage = null;
                window.ws.onerror = null;

                window.ws.close();
            } catch (error) {
                console.error(error);
            }

            window.ws = null;

            delete window.ws;
        }

        function reconnectWebSocket() {
            stopWebSocket();
            startWebSocket();
        }

        function incomingWebSocketMessage(evt) {
            // console.log('Received server WebSocket message:', evt.data);

            let jsonMsg;

            try {
                jsonMsg = JSON.parse(evt.data);
            } catch (error) {
                return console.error(error);
            }

            if (jsonMsg?.msg)
                alert(jsonMsg.msg);

            if (jsonMsg.user !== undefined && JSON.stringify(window._user) !== JSON.stringify(jsonMsg.user)) {
                window._user = jsonMsg.user;

                user();

                userDataChanged();
            }
        }

        function userDataChanged() {
            if (!loggedInWrap)
                return;
            const newUserDataStr = window._user ? JSON.stringify(window._user) : '{}';

            if (window._lastUserData === newUserDataStr)
                return console.log('User data not changed since last update');

            window._lastUserData = newUserDataStr;
            // console.log('window._user', window._user);
            window.currentBalance = Number(window._user?.balance || 0);

            yourCurrentBalanceVal.innerText = '$' + window.currentBalance.toFixed(2);

            if (window.currentBalance < 0) {
                yourCurrentBalanceVal.classList.add('text-danger');
                yourCurrentBalanceVal.classList.remove('text-success');
                yourCurrentBalanceVal.classList.remove('text-muted');
            } else if (window.currentBalance > 0) {
                yourCurrentBalanceVal.classList.add('text-success');
                yourCurrentBalanceVal.classList.remove('text-danger');
                yourCurrentBalanceVal.classList.remove('text-muted');
            } else {
                yourCurrentBalanceVal.classList.add('text-muted');
                yourCurrentBalanceVal.classList.remove('text-danger');
                yourCurrentBalanceVal.classList.remove('text-success');
            }

            // Update affiliate program elements
            updateAffiliateUI();

            updateCurrentRate();

            updateBotStatuses();

            console.log('User data changed');

            // Check if sgw parameter exists in URL
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('sgw')) {
                const sgwToken = urlParams.get('sgw');

                if (!window?._user?.settings || window?._user?.settings?.sgw?.username === sgwToken) return;

                // Call universalLogin with sgw platform and the token
                if (sgwToken)
                    universalLogin('sgw', { username: sgwToken, password: '-' });
                else
                    botLogout('sgw');

                // Remove the sgw parameter from URL and redirect
                urlParams.delete('sgw');
                const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
                window.history.replaceState({}, document.title, newUrl);
            }
        }

        function updateBotStatuses() {
            if (window.bots)
                Object.entries(window.bots).forEach(([key, bot]) => {
                    let isActive;

                    switch (key) {
                        default:
                            isActive = window?._user?.settings?.[key];
                            break;
                    }

                    updateBotStatus(
                        document.getElementById(`${key}-status`),
                        isActive,
                        key,
                        bot
                    );
                });
        }

        function updateBotStatus(element, isActive, botType, bot) {
            if (!element)
                return;

            // Force boolean conversion to prevent type coercion issues
            isActive = Boolean(isActive);

            // Configure bot status based on active state
            const status = isActive ? 'Activated' : 'Deactivated';
            const action = isActive
                ? `return botLogout('${botType}')`
                : `return botLogin('${botType}')`;

            // Use innerHTML instead of textContent to preserve HTML structure
            element.innerHTML = `${bot.icon} ${bot.name} ${status}`;
            element.setAttribute('onclick', action);

            // Explicit class management instead of toggle
            if (isActive) {
                element.classList.remove('bg-danger');
                element.classList.add('bg-success');
            } else {
                element.classList.remove('bg-success');
                element.classList.add('bg-danger');
            }
        }

        /**
         * Shows or hides a loading overlay with message.
         * @param {string|null} message - Message to display. If null/empty, hides the overlay.
         * @param {number} timeout - Optional seconds before auto-hiding the overlay.
         */
        function showLoading(message, timeout) {
            // Get or create the overlay element
            let overlay = document.getElementById('loadingOverlay');

            // If the overlay doesn't exist, create it
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                overlay.style.display = 'none';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '9999';

                // Create message container
                const msgContainer = document.createElement('div');
                msgContainer.id = 'loadingMessage';
                msgContainer.style.backgroundColor = 'white';
                msgContainer.style.padding = '20px';
                msgContainer.style.borderRadius = '5px';
                msgContainer.style.textAlign = 'center';
                msgContainer.style.maxWidth = '25%';
                msgContainer.style.minWidth = '250px';

                // Add a spinner
                const spinner = document.createElement('div');
                spinner.className = 'spinner-border text-primary';
                spinner.setAttribute('role', 'status');
                spinner.style.display = 'block';
                spinner.style.margin = '0 auto 10px auto';

                // Add a span for accessibility
                const spinnerSpan = document.createElement('span');
                spinnerSpan.className = 'visually-hidden';
                spinnerSpan.textContent = 'Loading...';
                spinner.appendChild(spinnerSpan);

                // Add the message element
                const msgElement = document.createElement('div');
                msgElement.id = 'loadingMessageText';

                // Assemble the elements
                msgContainer.appendChild(spinner);
                msgContainer.appendChild(msgElement);
                overlay.appendChild(msgContainer);
                document.body.appendChild(overlay);
            }

            // Clear any existing timeout
            if (window.loadingTimeout) {
                clearTimeout(window.loadingTimeout);
                window.loadingTimeout = null;
            }

            // If message is provided, show the overlay with the message
            if (message) {
                document.getElementById('loadingMessageText').textContent = message;
                overlay.style.display = 'flex';

                // Set timeout if specified
                if (timeout && timeout > 0) {
                    window.loadingTimeout = setTimeout(() => {
                        showLoading(); // Call without arguments to hide
                    }, timeout * 1000);
                }
            } else {
                // Hide the overlay
                overlay.style.display = 'none';
            }
        }

        function scrollToPremiumDevice() {
            const premiumDeviceContainer = document.querySelector('.premium-device-container');

            if (premiumDeviceContainer) {
                // Get the full container element (not just the header)
                const rect = premiumDeviceContainer.getBoundingClientRect();

                // Calculate the element's position on the page
                const absoluteElementTop = rect.top + window.pageYOffset;

                // Get the height of the viewport and the element
                const viewportHeight = window.innerHeight;
                const elementHeight = rect.height;

                // If the element is taller than the viewport, just scroll to its top
                // Otherwise center it in the viewport
                let targetPosition;
                if (elementHeight > viewportHeight) {
                    targetPosition = absoluteElementTop;
                } else {
                    targetPosition = absoluteElementTop - ((viewportHeight - elementHeight) / 2);
                }

                // Perform the smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Add visual indicator (temporary highlight)
                premiumDeviceContainer.style.transition = 'background-color 0.5s ease';
                premiumDeviceContainer.style.backgroundColor = 'rgba(255, 243, 205, 0.5)';
                setTimeout(() => {
                    premiumDeviceContainer.style.backgroundColor = '';
                }, 1000);
            }
        }

        // Prevent double prompts with proper event handling
        function ziftyLogin(phone, code) {
            const pkgName = 'com.zifty.TreadsX';
            const sanitizedPkg = pkgName.replace(/\./g, '_').split('/')[0]; // Sanitize package name for DB lookup

            if ((window?._user?.settings?.[sanitizedPkg]?.expdate || 0) < Date.now())
                return alert('Dedicated Bot Grabber required. Purchase below to activate.') || scrollToPremiumDevice();

            if (window?._user?.balance < minBal && !window?._user?.settings?.upgradeCommissionExpireDateTime)
                return alert('Add funds to activate the bot.');

            // Prompt for phone if not provided
            if (!phone) {
                phone = prompt('Enter your Zifty login cell phone number:')?.trim();
                if (!phone) return false;
            }

            let dontTurnOffLoading;

            if (!code)
                showLoading('Now Activating Your Zifty Bot, Please Wait...');

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'zifty_login',
                    phone,
                    code: code || null, // Allow passing code or default to null
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else if (data.user) {
                        window._user = data.user;
                        userDataChanged();
                        alert('Zifty bot activated successfully, you can now close this window and the bot will continue processing orders for you!');
                    } else {
                        // Verification code needed - CALL ITSELF RECURSIVELY
                        const verifyCode = prompt('Enter the validation code you were just texted:')?.trim();
                        if (!verifyCode) return false;

                        dontTurnOffLoading = true; // Prevent loading overlay from hiding

                        // Call ziftyLogin again with phone and code instead of duplicating fetch
                        ziftyLogin(phone, verifyCode);
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                })
                .finally(() => dontTurnOffLoading ? undefined : showLoading()); // Hide loading overlay

            return false;
        }

        function deliverThatLogin() {
            if (window?._user?.balance < minBal && !window?._user?.settings?.upgradeCommissionExpireDateTime)
                return alert('Add funds to activate the bot.');

            const deliverThatLoginEmail = prompt('Enter your DeliverThat login email address:')?.trim();
            if (!deliverThatLoginEmail)
                return false;

            const deliverThatLoginPass = prompt('Enter your DeliverThat login password:')?.trim();
            if (!deliverThatLoginPass)
                return false;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deliverthat_login',
                    deliverThatLoginEmail,
                    deliverThatLoginPass
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error)
                        alert(data.error);
                    else if (data.user) {
                        window._user = data.user;

                        userDataChanged();

                        alert('✅ Your DeliverThat Bot is now active and processing orders!');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });

            return false;
        }

        function sparkLogin() {
            if (window?._user?.balance < minBal && !window?._user?.settings?.upgradeCommissionExpireDateTime)
                return alert('Add funds to activate the bot.');

            const sparkLoginEmail = prompt('Enter your Spark login email address:')?.trim();
            if (!sparkLoginEmail)
                return false;

            const sparkLoginPass = prompt('Enter your Spark login password:')?.trim();
            if (!sparkLoginPass)
                return false;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'spark_login',
                    sparkLoginEmail,
                    sparkLoginPass
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error)
                        alert(data.error);
                    else if (data.user) {
                        window._user = data.user;

                        userDataChanged();

                        alert('✅ Your Spark Bot is now active, please allow some time for it to take effect!');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });

            return false;
        }

        function roadieLogin() {
            if (window?._user?.balance < minBal && !window?._user?.settings?.upgradeCommissionExpireDateTime)
                return alert('Add funds to activate the bot.');

            const loginEmail = prompt('Enter your Roadie login email address:')?.trim();
            if (!loginEmail)
                return false;

            const loginPass = prompt('Enter your Roadie login password:')?.trim();
            if (!loginPass)
                return false;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'roadie_login',
                    loginEmail,
                    loginPass
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error)
                        alert(data.error);
                    else if (data.user) {
                        window._user = data.user;

                        userDataChanged();

                        alert('✅ Your Roadie Bot is now active, please allow up to 72 hours for it to take effect!');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });

            return false;
        }

        function cartwheelLogin() {
            if (window?._user?.balance < minBal && !window?._user?.settings?.upgradeCommissionExpireDateTime)
                return alert('Add funds to activate the bot.');

            const platform = 'cartwheel';
            const answers = { 'company': null, 'username': null, 'password': null };

            for (const field of Object.keys(answers)) {
                answers[field] = prompt(`Enter your ${capitalizeFirstLetter(platform)} ${capitalizeFirstLetter(field)}:`)?.trim();

                if (!answers[field])
                    return console.log('Cancelled');
            }

            universalLogin(platform, answers);

            return false;
        }

        function dlivrdLogin() {
            const platform = 'dlivrd';
            const answers = { 'username': null, 'password': null };

            for (const field of Object.keys(answers)) {
                answers[field] = prompt(`Enter your ${capitalizeFirstLetter(platform)} ${capitalizeFirstLetter(field)}:`)?.trim();

                if (!answers[field])
                    return console.log('Cancelled');
            }

            universalLogin(platform, answers);

            return false;
        }

        function sgwLogin() {
            if (window?._user?.balance < 25 && !window?._user?.settings?.upgradeCommissionExpireDateTime)
                return alert('This bot requires a minimum balance of $25 to activate, please add funds before proceeding!');

            alert('This bot requires our Bid Sniper software from ShopGoodwillSniper.com!

Once installed, simply enable hosted mode within the software.');

    window.open('https://shopgoodwillsniper.com', '_blank');

            return false;
        }

        function universalLogin(platform, params) {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'universal_login',
                    platform,
                    ...params
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error)
                        alert(data.error);
                    else if (data.user) {
                        window._user = data.user;

                        userDataChanged();

                        if (platform === 'sgw')
                            platform = 'ShopGoodwill';

                        alert(`✅ Your ${capitalizeFirstLetter(platform)} Bot is now active!`);
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });

            return false;
        }

        function scrollToProxyInfo() {
            document.getElementById('proxy-info').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        function logoutPlatform(platform) {
            if (!window._user || !platform)
                return alert('An unknown error occurred, please try refreshing the page...') || false;

            const prettyPlatformName = platform === 'sgw' ? 'ShopGoodwill.com' : capitalizeFirstLetter(platform);

            if (
                !navigator.userAgent.toLowerCase().includes('electron')
                &&
                !confirm(`Are you sure you want to deactivate the ${prettyPlatformName} bot?`)
            )
                return false;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'logout_platform',
                    platform
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error)
                        alert(data.error);
                    else if (data.user) {
                        window._user = data.user;

                        userDataChanged();

                        alert(`${prettyPlatformName} Bot Deactivated Successfully!`);
                    }
                })
                .catch(error => {
                    console.error(error);

                    alert(error.message || String(error));
                });

            return false;
        }

        // Function to hide autofill dropdowns
        function hideAutofillDropdowns() {
            // Get all input fields that might have autofill
            const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');

            inputs.forEach(input => {
                // Save original autocomplete value
                const originalAutocomplete = input.getAttribute('autocomplete');

                // Temporarily disable autocomplete
                input.setAttribute('autocomplete', 'off');

                // Force blur and refocus to dismiss dropdown
                if (document.activeElement === input)
                    input.blur();

                // Restore original autocomplete after a short delay
                setTimeout(() => {
                    if (originalAutocomplete)
                        input.setAttribute('autocomplete', originalAutocomplete);
                    else
                        input.removeAttribute('autocomplete');
                }, 100);
            });
        }

        function loggedIn() {
            if (!window._user || !loggedInWrap || loggedInWrap.style.display === 'flex')
                return false;

            delete window.lastCoordsStr;

            startWebSocket();

            if (settingsForm)
                settingsForm.onsubmit(undefined, true);

            // Hide autofill dropdowns when switching to logged-in view
            setTimeout(() => hideAutofillDropdowns(), 3000);

            scrollToTopDelayed();

            loggedOutWrap.style.display = 'none';
            loggedInWrap.style.display = 'flex';

            if (typeof loadFees === 'function') loadFees();

            GPS();
        }

        function logout() {
            if (
                !window._user ||
                loggedInWrap.style.display === 'none' ||
                !confirm('Are you sure you want to logout?')
            )
                return false;

            stopWebSocket();

            logoutButton.disabled = true;
            const originalBtnTxt = logoutButton.innerText;
            logoutButton.innerText = 'Please wait...';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'logout'
                })
            })
                .then(response => response.json())
                .then(data => {
                    window._user = undefined;

                    delete window._user;

                    userDataChanged();

                    window.location.reload(true);
                })
                .catch(error => {
                    console.error(error);

                    alert(error.message);
                })
                .finally(() => {
                    logoutButton.disabled = false;
                    logoutButton.innerText = originalBtnTxt;
                });
        }

        if (logoutButton)
            logoutButton.onclick = () => logout();

        function closeProfileWnd() {
            if (loginRegisterForm.style.display === 'none')
                return false;

            loginRegisterForm.style.display = 'none';

            mobileVerifyCode?.removeAttribute('required');
            emailVerifyCode?.removeAttribute('required');

            if (mobileVerifyCode)
                mobileVerifyCode.value = '';
            if (emailVerifyCode)
                emailVerifyCode.value = '';

            verificationCodesWrap.style.display = 'none';
            emailPassWrap.style.display = 'block';
            if (mobileWrap)
                mobileWrap.style.display = 'block';

            email.focus();
        }

        function profile() {
            if (
                !window._user ||
                loggedInWrap.style.display === 'none'
            )
                return false;

            action = 'register';

            if (!loggedInWrap.contains(loginRegisterForm)) {
                loginRegisterForm.classList.add('updateProfileForm');

                const closeBtn = loginRegisterForm.querySelector('.close-btn');
                closeBtn.onclick = () => closeProfileWnd();
                closeBtn.style.display = 'inline-block';

                loginRegisterForm.querySelector('label[for="password"]').innerText = 'New Password';
                password.setAttribute('placeholder', 'Leave blank to keep same');
                password.removeAttribute('required');

                mobile?.setAttribute('required', '');

                mobileVerifyCode?.removeAttribute('required');
                emailVerifyCode?.removeAttribute('required');

                verificationCodesWrap.style.display = 'none';
                emailPassWrap.style.display = 'block';
                if (mobileWrap)
                    mobileWrap.style.display = 'block';

                submitButton.innerText = 'Update';

                loggedInWrap.appendChild(loginRegisterForm);
            } else
                loginRegisterForm.style.display = 'block';

            if (mobile)
                mobile.value = window._user.mobile_number;
            email.value = window._user.email;
            password.value = '';
        }

        if (profileButton)
            profileButton.onclick = () => profile();

        if (loginRegisterForm)
            loginRegisterForm.onsubmit = () => {
                if (
                    loggedInWrap.contains(loginRegisterForm) &&
                    // !mobileVerifyCode?.hasAttribute('required') &&
                    !emailVerifyCode?.hasAttribute('required') &&
                    !confirm('Are you sure you want to update your profile?')
                )
                    return false;

                submitButton.disabled = true;
                const originalBtnTxt = submitButton.innerText;
                submitButton.innerText = 'Please wait...';

                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action,
                        email: email.value,
                        password: password.value,
                        mobile: mobile?.value,
                        mobileVerifyCode: mobileVerifyCode?.value,
                        emailVerifyCode: emailVerifyCode?.value
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            console.error(data);

                            alert(data.error);
                        } else {
                            switch (action) {
                                case 'register':
                                    if (
                                        // !mobileVerifyCode?.hasAttribute('required') &&
                                        !emailVerifyCode?.hasAttribute('required') &&
                                        data.message
                                    ) {
                                        emailPassWrap.style.display = 'none';
                                        /* if (mobileWrap)
                                            mobileWrap.style.display = 'none'; */
                                        verificationCodesWrap.style.display = 'block';

                                        /* if (mobileVerifyCode)
                                            mobileVerifyCode.value = ''; */
                                        if (emailVerifyCode)
                                            emailVerifyCode.value = '';

                                        if (window._user) {
                                            /* if (data.smsResult) {
                                                mobileVerifyCode?.setAttribute('required', '');
                                                if (mobileVerifyCodeWrap)
                                                    mobileVerifyCodeWrap.style.display = 'block';
                                            } else {
                                                mobileVerifyCode?.removeAttribute('required');
                                                if (mobileVerifyCodeWrap)
                                                    mobileVerifyCodeWrap.style.display = 'none';
                                            } */

                                            if (data.emailResult) {
                                                emailVerifyCode?.setAttribute('required', '');
                                                if (emailVerifyCodeWrap)
                                                    emailVerifyCodeWrap.style.display = 'block';
                                            } else {
                                                emailVerifyCode?.removeAttribute('required');
                                                if (emailVerifyCodeWrap)
                                                    emailVerifyCodeWrap.style.display = 'none';
                                            }
                                        } else {
                                            // mobileVerifyCode?.setAttribute('required', '');
                                            emailVerifyCode?.setAttribute('required', '');
                                            /* if (mobileVerifyCodeWrap)
                                                mobileVerifyCodeWrap.style.display = 'block'; */
                                            if (emailVerifyCodeWrap)
                                                emailVerifyCodeWrap.style.display = 'block';
                                        }

                                        if (data.emailResult && !data.smsResult)
                                            emailVerifyCode?.focus();
                                        /* else if (data.smsResult)
                                            mobileVerifyCode?.focus(); */
                                    } else if (window._user && !data.message)
                                        closeProfileWnd();

                                    break;
                            }

                            if (data.message)
                                alert(data.message);

                            if (data.user) {
                                window._user = data.user;

                                userDataChanged();

                                loggedIn();
                            }
                        }
                    })
                    .catch(error => {
                        console.error(error);

                        alert(error.message);
                    })
                    .finally(() => {
                        submitButton.disabled = false;
                        submitButton.innerText = originalBtnTxt;
                    });

                return false;
            };

        if (toggleLink)
            toggleLink.addEventListener('click', e => {
                e.preventDefault();

                switch (action) {
                    case 'login':
                        action = 'register';

                        mobile?.setAttribute('required', '');
                        mobileVerifyCode?.removeAttribute('required');
                        emailVerifyCode?.removeAttribute('required');

                        verificationCodesWrap.style.display = 'none';
                        emailPassWrap.style.display = 'block';
                        if (mobileWrap)
                            mobileWrap.style.display = 'block';

                        formTitle.innerText = 'Create a New Account';
                        submitButton.innerText = 'Sign Up';
                        toggleText.innerText = 'Already have an account? ';
                        toggleLink.innerText = 'Log In';

                        break;

                    case 'register':
                        action = 'login';

                        mobile?.removeAttribute('required');
                        mobileVerifyCode?.removeAttribute('required');
                        emailVerifyCode?.removeAttribute('required');

                        verificationCodesWrap.style.display = 'none';
                        if (mobileWrap)
                            mobileWrap.style.display = 'none';
                        emailPassWrap.style.display = 'block';

                        formTitle.innerText = 'Sign In to Your Account';
                        submitButton.innerText = 'Log In';
                        toggleText.innerText = "Don't have an account? ";
                        toggleLink.innerText = 'Sign Up';

                        break;
                }

                return false;
            });

        if (settingsForm)
            settingsForm.onsubmit = (ev, dontUpdate) => {
                let originalBtnTxt;

                if (!dontUpdate) {
                    saveSettingsBtn.disabled = true;
                    originalBtnTxt = saveSettingsBtn.innerText;
                    saveSettingsBtn.innerText = 'Please wait...';
                }

                const formData = new FormData(settingsForm);
                const formValues = {};

                // Iterate through the FormData entries
                for (const [key, value] of formData.entries()) {
                    const element = settingsForm.elements[key];

                    // Special handling for checkboxes
                    if (element.type === 'checkbox')
                        formValues[key] = element.checked;
                    else
                        formValues[key] = value;
                }

                // Ensure checkboxes are included, even if unchecked
                settingsForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox =>
                    formValues[checkbox.name] = checkbox.checked
                );

                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'settings',
                        settings: !dontUpdate ? formValues : undefined
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.user) {
                            window._user = data.user;

                            userDataChanged();

                            if (!dontUpdate)
                                alert('Settings saved successfully');
                            else
                                for (const key in window._user.settings) {
                                    // Ensures you only iterate over the object's own properties
                                    if (window._user.settings.hasOwnProperty(key)) {
                                        const el = document.getElementById(key);

                                        if (el && ![undefined, null].includes(window._user.settings[key])) {
                                            // Special handling for checkboxes
                                            if (el.type === 'checkbox')
                                                el.checked = window._user.settings[key];
                                            else
                                                el.value = window._user.settings[key];
                                        }
                                    }
                                }
                        } /* else {
                if (!dontUpdate)
                    alert('Failed to save settings try refreshing the page and ensure you are logged-in');
                else
                    alert('Failed to retrieve settings try refreshing the page and ensure you are logged-in');
            } */
                    })
                    .catch(error => {
                        console.error(error);

                        alert(error.message);
                    })
                    .finally(() => {
                        if (!dontUpdate) {
                            saveSettingsBtn.disabled = false;
                            saveSettingsBtn.innerText = originalBtnTxt;
                        }
                    });

                return false;
            };

        function user(cb) {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'user'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.user) {
                        window._user = data.user;

                        userDataChanged();

                        loggedIn();

                        if (cb)
                            cb();
                    }
                })
                .catch(error => console.error(error));
        }

        user();

        function isMobilePhone() {
            return /Android|iPhone|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches || window.innerWidth <= 768;
        }

        function isIOSDevice() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent);
        }

        function downloadCert() {
            const ua = navigator.userAgent || navigator.vendor || window.opera;

            if (/android/i.test(ua)) {
                console.log("Android detected");
                // Android-specific behavior
                window.location.href = 'public/cert/proxy/BotGrabber_com-cert.pem';
            } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
                console.log("iOS detected");
                // iOS-specific behavior
                window.location.href = 'public/cert/proxy/BotGrabber_com-cert.pem';
            } else {
                console.log("Desktop or other platform");
                window.location.href = 'public/cert/proxy/BotGrabber_com-cert.pem';
            }
        }

        async function GPS() {
            return;
            if (!window._user)
                return;

            // Check GPS permissions and get coordinates
            const getGPSLocation = () =>
                new Promise(resolve => {
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            const GPSSource = "GPS";
                            const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude, GPSSource };

                            updateGPSLocation(coords);

                            if (window.GPSInterval)
                                window.GPSInterval = clearInterval(window.GPSInterval);

                            window.GPSInterval = setInterval(async () => {
                                const coordsDict = (await getGPSLocation()) || { latitude: -1, longitude: -1, GPSSource: "Unknown" };

                                updateGPSLocation(coordsDict);
                            }, GPSIntervalMilliSeconds);

                            /* if (window.GPSWatchId)
                                window.GPSWatchId = navigator.geolocation.clearWatch(window.GPSWatchId);
        
                            // Start watching for location updates
                            window.GPSWatchId = navigator.geolocation.watchPosition(
                                pos => {
                                    const coordsDict = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, GPSSource };
        
                                    updateGPSLocation(coordsDict);
                                },
                                error => console.error("Error getting GPS updates:", error),
                                {
                                    enableHighAccuracy: true, // Use GPS if available
                                    maximumAge: 30000, // Use a cached position
                                    timeout: 30000
                                }
                            ); */

                            resolve(coords);
                        },
                        error => console.error(error) || resolve(),
                        {
                            enableHighAccuracy: true,
                            maximumAge: 0,
                            timeout: 30000
                        }
                    );
                });

            // Fetch IP-based location
            const getLocationByIP = async () => {
                try {
                    const response = await fetch('https://ipwhois.app/json/');
                    const data = await response.json();
                    const coords = { latitude: data.latitude, longitude: data.longitude, GPSSource: "IP Address" };

                    updateGPSLocation(coords);

                    if (window.GPSInterval)
                        window.GPSInterval = clearInterval(window.GPSInterval);

                    window.GPSInterval = setInterval(async () => {
                        const coordsDict = (await getLocationByIP()) || { latitude: -1, longitude: -1, GPSSource: "Unknown" };

                        updateGPSLocation(coordsDict);
                    }, GPSIntervalMilliSeconds);

                    return coords;
                } catch (er) {
                    console.error(er);
                }
            };

            return (await getGPSLocation()) || (await getLocationByIP()) || { latitude: -1, longitude: -1, GPSSource: "Unknown" };
        }

        function updateGPSLocation(coords) {
            if (!window._user || !window.ws || window.ws?.readyState !== WebSocket.OPEN)
                return console.log('Skipping GPS update cause user not logged in or websocket issue');

            const disallowedCoords = [-1, undefined, false, null];

            if (disallowedCoords.includes(coords.latitude) || disallowedCoords.includes(coords.longitude))
                return console.log('Skipping GPS update cause nothing has changed');

            const newCoordsStr = JSON.stringify(coords);

            if (newCoordsStr === window.lastCoordsStr)
                return console.log('Skipping GPS update cause nothing has changed');

            window.lastCoordsStr = newCoordsStr;

            console.log("Updated Location:", coords);

            window._user.settings.lat = coords.latitude;
            window._user.settings.lon = coords.longitude;

            if (window._user.settings.zifty) {
                window._user.settings.zifty.lat = coords.latitude;
                window._user.settings.zifty.lon = coords.longitude;
            }

            window.ws.send(JSON.stringify(coords));
        }

        function proxyHowTo() {
            if (_proxyHowToCloseBtn && !_proxyHowToCloseBtn?.onclick)
                _proxyHowToCloseBtn.onclick = () => _proxyHowTo.style.display = 'none';

            if (_proxyHowTo) {
                if (_proxyHowTo.style.display === 'none' || !_proxyHowTo.style.display)
                    _proxyHowTo.style.display = 'block';
                else
                    _proxyHowTo.style.display = 'none';
            }

            return false;
        }

        function forgotPassLink() {
            if (forgotPass.style.display === 'none' || !forgotPass.style.display) {
                forgotPass.style.display = 'block';
            } else {
                forgotPass.style.display = 'none';
                /* SMS VERIFICATION DISABLED
                forgotPassMobileVerifyCodeWrap.style.display = 'none';
                forgotPassMobileVerifyCodeInput.removeAttribute('required');
                forgotPassTel.disabled = false;
                forgotPassMobileVerifyCodeInput.value = '';
                */
                // ✅ CORRECT EMAIL VERSION
                if (forgotPassEmailVerifyCodeWrap)
                    forgotPassEmailVerifyCodeWrap.style.display = 'none';
                if (forgotPassEmailVerifyCodeInput) {
                    forgotPassEmailVerifyCodeInput.removeAttribute('required');
                    forgotPassEmailVerifyCodeInput.value = '';
                }
                if (forgotPassEmail)
                    forgotPassEmail.disabled = false;
            }

            return false;
        }

        if (forgotPass) {
            forgotPass.onsubmit = event => submitForgotPassForm(event);
            forgotPass.querySelector('.close-x').onclick = () => forgotPassLink();
        }

        function submitForgotPassForm(event) {
            event.preventDefault();

            if (!event.target.checkValidity())
                return false;

            const submitBtn = forgotPass.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            const originalBtnTxt = submitBtn.innerText;
            submitBtn.innerText = 'Please wait...';

            // ✅ GET EMAIL ELEMENTS (already declared globally above)

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'forgot_password',
                    email: forgotPassEmail?.value,
                    emailVerifyCode: forgotPassEmailVerifyCodeInput.value
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else if (data.message) {
                        alert(data.message);
                        if (forgotPassEmail)
                            forgotPassEmail.disabled = true;
                        if (forgotPassEmailVerifyCodeWrap)
                            forgotPassEmailVerifyCodeWrap.style.display = 'block';
                        forgotPassEmailVerifyCodeInput?.setAttribute('required', '');
                    } else if (data.user) {
                        window._user = data.user;

                        loggedIn();

                        userDataChanged();
                    } else {
                        forgotPassLink();
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnTxt;
                });

            return false;
        }

        // Update the buyUltimateDevice function to remove email pre-filling
        function buyUltimateDevice() {
            if (!window._user)
                return alert('Please log in or register first to purchase the Ultimate Bot Grabber.') || false;

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            /* if (window._user.balance < 100) {
                alert('You need at least $100 on your balance, please "Add Funds" and then try again!');
        
                // addBalance();
        
                return false;
            } */

            setTimeout(() => {
                // Show the shipping address modal
                const shippingModal = new bootstrap.Modal(document.getElementById('shippingAddressModal'));

                const shippingForm = document.getElementById('shippingAddressForm');
                shippingForm.reset();
                shippingForm.classList.remove('was-validated');

                shippingModal.show();
            }, 500);

            return false;
        }

        function setupShippingAddress() {
            const shippingForm = document.getElementById('shippingAddressForm');
            const completeOrderBtn = document.getElementById('completeOrderBtn');

            // Add Enter key support for form fields
            if (shippingForm) {
                const formFields = shippingForm.querySelectorAll('input, select');

                formFields.forEach(field => {
                    field.addEventListener('keypress', function (event) {
                        // Check if the pressed key is Enter
                        if (event.key === 'Enter') {
                            event.preventDefault(); // Prevent default form submission

                            // Trigger the same action as clicking the Complete Purchase button
                            if (completeOrderBtn)
                                completeOrderBtn.click();
                        }
                    });
                });
            }

            // Existing code for completeOrderBtn click handler...
            if (completeOrderBtn) {
                completeOrderBtn.addEventListener('click', function () {
                    // Check form validity
                    if (!shippingForm.checkValidity()) {
                        shippingForm.classList.add('was-validated');
                        return;
                    }

                    // Collect form data, using user account data for phone and email
                    const shippingData = {
                        fullName: document.getElementById('fullName')?.value,
                        address1: document.getElementById('address1')?.value,
                        address2: document.getElementById('address2')?.value || '',
                        city: document.getElementById('city')?.value,
                        country: document.getElementById('country')?.value,
                        state: document.getElementById('state')?.value,
                        zip: document.getElementById('zip')?.value,
                    };

                    const cityRegionPostal = [shippingData.city, shippingData.state, shippingData.zip]
                        .filter(Boolean)
                        .join(', ')
                        .replace(', ,', ',');

                    const shippingAddress = `
${shippingData.fullName}
${shippingData.address1}
${shippingData.address2 ? shippingData.address2 + '
' : ''}${cityRegionPostal}
${ shippingData.country }
                    `;

            // Show loading state
            completeOrderBtn.disabled = true;
            completeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

            // Submit the order to server - only if confirmed
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'  // Prevents caching
                },
                body: JSON.stringify({
                    action: 'purchase_device',
                    deviceSelect: document.getElementById('deviceSelect')?.value,
                    shipping: shippingData
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else if (data.user) {
                        // Update user data
                        window._user = data.user;
                        userDataChanged();

                        // Hide the modal
                        bootstrap.Modal.getInstance(document.getElementById('shippingAddressModal')).hide();

                        // Show success message
                        // Your order has been completed successfully!
                        alert(`✅ Order completed successfully!

Your Device with Bot Grabber App will be shipped to:
${ shippingAddress }
You will receive a tracking number once shipped!

Please allow 1 - 2 weeks to receive your new device as we hand program each device manually therefore it takes us some time to process each order so please be patient...

                If you need assistance in the meantime please email us at help@shopgoodwillsniper.com`);

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('An error occurred while processing your order. Please try again.');
                })
                .finally(() => {
                    // Reset button state
                    completeOrderBtn.disabled = false;
                    completeOrderBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Complete Purchase';
                });
        });
    }
}

function updateCurrentRate() {
    const currentRate = commissionRate();
    const expires = new Date(window?._user?.settings?.upgradeCommissionExpireDateTime);
    const expiresTxt
        =
        window?._user?.settings?.upgradeCommissionExpireDateTime > new Date().getTime()
            ?
            expires.toLocaleDateString()
            :
            'Never'
        ;

    //let curTxt = `Your Commission Rate: ${ currentRate } % `;
    let curTxt = `Membership`;

    if (window?._user?.settings?.upgradeCommissionExpireDateTime > new Date().getTime())
        curTxt += ` Expires: ${ expiresTxt }`;
    else
        curTxt += `: FREE`;

    if (!commissionSelect) return;

    // Update the first disabled option to show current rate
    commissionSelect.querySelector('option[value="current"]').textContent = curTxt;

    // Reset selected option to the first one
    commissionSelect.selectedIndex = 0;

    // Iterate through all options except "current"
    const options = Array.from(commissionSelect.options);
    options.forEach(option => {
        if (option.value !== "current") {
            // Process each non-current option
            // const rate = parseInt(option.value);

            option.disabled = false;
            /* if (rate >= currentRate)
                option.disabled = true;
            else
                option.disabled = false; */
        }
    });
}

function setupCommissionRate() {
    if (!commissionSelect) return;

    // Initialize on page load
    updateCurrentRate();

    // Handle selection change
    commissionSelect.addEventListener('change', e => {
        const selectedOption = commissionSelect.options[commissionSelect.selectedIndex];
        const newRate = parseInt(selectedOption.value);
        const price = parseFloat(selectedOption.dataset.price);
        const period = selectedOption.dataset.period;

        // Format period text for display
        let periodText = '';
        switch (period) {
            case 'hour': periodText = 'hourly'; break;
            case 'day': periodText = 'daily'; break;
            case 'week': periodText = 'weekly'; break;
            case 'month': periodText = 'monthly'; break;
            case 'quarter': periodText = '3-month'; break;
            case 'half': periodText = '6-month'; break;
            case 'year': periodText = 'yearly'; break;
            case 'lifetime': periodText = 'lifetime'; break;
        }

        // If it's just the default free plan, no need for confirmation
        if (period === 'current') {
            updateCurrentRate();
            return;
        }

        if (window._user.balance < price) {
            alert(`You need at least $${ price } on your balance, please "Add Funds" and then try again!`);

            updateCurrentRate();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            // addBalance();

            return false;
        }

        // Confirmation dialog
        /*         const confirmMessage = `Upgrade from ${ commissionRate() }% to ${ newRate }% ${ periodText } commission rate instead ?

                    Upgrade Cost Now: $${ price }
        Manual Payment Period: ${ periodText }
        
        Your balance will be deducted immediately and your new rate will be active right away.
        
        Click OK to complete your purchase or Cancel to keep your current rate.`; */

        const confirmMessage = `Upgrade to a professional membership now ?

                    Upgrade Cost Now: $${ price }
Manual Payment Period: ${ periodText }

Your balance will be deducted immediately and your new membership will be active right away.

Click OK to complete your purchase or Cancel to keep your current rate.`;

        if (confirm(confirmMessage)) {
            // Show processing status
            commissionSelect.disabled = true;

            // API request to upgrade commission rate
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'upgrade_commission',
                    rate: newRate,
                    period: period
                })
            })
                .then(response => response.json())
                .then(data => {
                    updateCurrentRate();

                    if (data.error)
                        alert(data.error);
                    else if (data.user) {
                        // Update user data
                        window._user = data.user;
                        userDataChanged();

                        // Show success message
                        // alert(`Successfully upgraded to ${ newRate }% ${ periodText } commission rate!`);
                        alert(`Successfully upgraded to a professional membership!`);

                        // Track purchase event in GA4
                        if (data.transaction) {
                            gtag("event", "purchase", {
                                transaction_id: data.transaction.transaction_id,
                                value: data.transaction.value,
                                currency: data.transaction.currency,
                                tax: data.transaction.tax,
                                shipping: data.transaction.shipping,
                                items: data.transaction.items
                            });

                            console.log('Purchase tracking sent to Google Analytics');
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('An error occurred while processing your upgrade. Please try again.');
                })
                .finally(() => {
                    commissionSelect.disabled = false;
                    updateCurrentRate();
                });
        } else {
            // User canceled, reset selection
            updateCurrentRate();
        }
    });
}

function commissionRate() {
    let result = 10;

    if (window?._user?.settings?.upgradeCommissionExpireDateTime > new Date().getTime())
        result = window?._user?.settings?.commissionRate;

    return result;
}

function handleCustomBotRequest(e) {
    e.preventDefault();
    const appNameInput = document.getElementById('customBotAppName');
    const form = document.getElementById('customBotRequestForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnTxt = submitBtn.innerHTML;
    const appName = appNameInput.value.trim();

    if (!appName) {
        alert('Please enter the app or software name.');
        return false;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Please wait...';

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'custom_bot_request', appName })
    })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                window._user = res.user;

                userDataChanged();

                alert('Your request has been received! We will contact you soon.');
                form.reset();
            } else
                alert(res.error || 'Request failed. Please try again.');
        })
        .catch(() => alert('Request failed. Please try again.'))
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnTxt;
        });

    return false;
}

function contactUs() {
    /* alert(
         `If you contact us regarding something you can help yourself with or waste our time asking rehtorical questions that are already available on our website, we will simply not reply to your email!`);
      if (
         window?._user?.settings?.commissionRate === undefined
         ||
         (window?._user?.settings?.upgradeCommissionExpireDateTime || 0) <= Date.now()
     ) {
         alert(
             "Support Policy

" +
             "⚠️ Support is available exclusively to our professional (paid) members ONLY!

" +
             "💡 You can review the information we already have readily available for you on this website for FREE ONLY!

" +
             "💵 OUR TIME IS NOT FREE OR UNLIMITED, IT IS PRECIOUS!

" +
             "🚫 FREE support is NOT available, PAID MEMBERS ONLY!

" +
             "👉 Upgrade to professional membership to receive support!"
         );
         window.scrollTo({
             top: 0,
             behavior: 'smooth'
         });
         return false;
     } */

    /* alert(`PLEASE NOTE!!!:

IF YOU CONTACT US REGARDING SOMETHING YOU CAN HELP YOURSELF WITH OR WASTE OUR TIME TALKING ALOT WE WILL BAN YOU!!!

WATCH THE VIDEOS WE HAVE POSTED ON OUR WEBSITE CAUSE THEY ARE THERE FOR A REASON AND THAT IS TO SAVE REPETITIVE QUESTIONS THAT WASTE OUR TIME OVER AND OVER AGAIN!!!

IT IS A PRIVILEGE TO USE OUR SERVICES OR EVEN TALK TO US REMEMBER THAT WHEN YOU ARE TALKING TO US, OUR TIME IS EXPENSIVE AND PRECIOUS DO NOT PLAY WITH OUR TIME OR WE WILL BAN YOU!!!

THINK BEFORE YOU EVEN SAY ONE WORD TO US BECAUSE WE WILL BAN YOU IF YOU PISS US OFF WITH YOUR WORDS!!!

REALLY THINK HARD BEFORE YOU CONTACT US AND ASK YOURSELF DO I REALLY NEED TO CONTACT THEM ? AND IF THE ANSWER IS NO, THEN DON'T CAUSE WE WILL BAN YOU!!!

DO YOU UNDERSTAND ??? WE WILL BAN YOU IMMEDIATELY IF YOU PISS US OFF WITH YOUR WORDS!!!

THINK REALLY LONG AND HARD BEFORE YOU EVEN TALK TO US CAUSE YOU MIGHT GET BANNED IF YOU WASTE OUR TIME OR SAY THE WRONG WORDS TO US!!!

WE DO NOT OFFER REFUNDS DO NOT EVEN WASTE OUR TIME ASKING OR YOU WILL BE BANNED!!!`); */

    const MIN_SUPPORT_BALANCE = 0.01; // Set a minimum balance requirement for support access

    if (Number(window._user?.balance || 0) < MIN_SUPPORT_BALANCE) {
        alert(`You need at least $${ MIN_SUPPORT_BALANCE.toFixed(2) } in your balance to receive support.Please add funds to continue.`);
        window.location.href = 'https://shopgoodwillsniper.com/user';
        return false;
    }

    window.location.href = 'mailto:admin@shopgoodwillsniper.com';
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    if (loggedInWrap) {
        setupCommissionRate();
        setupShippingAddress();
    }

    translate();
});

function showMacInstallInstructions() {
    const instructions = `📦 macOS Installation Instructions

After downloading and extracting the.zip file:

                1️⃣ Double - click the Bot Grabber.app file
                    (You may see a warning that it cannot be opened)

                2️⃣ Open System Settings:
   • Click the Apple Menu(top - left corner)
   • Select "System Settings"

                3️⃣ Navigate to Privacy & Security:
   • Click "Privacy & Security" in the sidebar
   • Scroll down to the "Security" section

                4️⃣ Allow the app to run:
   • You'll see a message about "Bot Grabber" being blocked
   • Click "Open Anyway" next to Bot Grabber

                5️⃣ Confirm opening:
   • Click "Open" in the confirmation dialog

✅ The app will now launch successfully!

                Note: This is required because the app is not code - signed by Apple.`;

    alert(instructions);
    return true; // Allow the download to proceed
}

function showWindowsInstallInstructions() {
    const instructions = `📦 Windows Installation Instructions

After downloading BotGrabber - App - Setup.exe:

                1️⃣ Locate the downloaded file
                    (Usually in your Downloads folder)

                2️⃣ Double - click BotGrabber - App - Setup.exe
                    (You may see a security warning)

                3️⃣ If Windows Defender SmartScreen appears:
   • Click "More info"
   • Click "Run anyway"

                4️⃣ Launch Bot Grabber:
   • Click it in your Start Menu

✅ The app will now launch successfully!

                Note: This is required because the app is not digitally signed by Microsoft.`;

    alert(instructions);
    return true; // Allow the download to proceed
}


// Function to update all affiliate UI elements
function updateAffiliateUI() {
    if (!window._user) return;

    // Update affiliate link
    const affiliateLink = document.getElementById('affiliate-link');
    if (affiliateLink) {
        const baseUrl = window.location.origin;
        const affiliateUrl = `${ baseUrl }/?a=${window._user._id}`;
                affiliateLink.value = affiliateUrl;
            }

            // Update affiliate balance
            const affiliateBalance = document.getElementById('affiliate-balance');
            const cashoutAmount = document.getElementById('cashout-amount');
            const affiliateBalanceAmount = Number(window._user?.affiliate_balance || 0);

            if (affiliateBalance) {
                affiliateBalance.innerText = '$' + affiliateBalanceAmount.toFixed(2);
            }

            if (cashoutAmount) {
                cashoutAmount.innerText = '$' + affiliateBalanceAmount.toFixed(2);
            }

            // Update cashout button state
            const cashoutBtn = document.getElementById('affiliate-cashout-btn');
            if (cashoutBtn) {
                if (affiliateBalanceAmount >= 25) {
                    cashoutBtn.disabled = false;
                    cashoutBtn.classList.remove('btn-secondary');
                    cashoutBtn.classList.add('btn-success');
                } else {
                    cashoutBtn.disabled = true;
                    cashoutBtn.classList.remove('btn-success');
                    cashoutBtn.classList.add('btn-secondary');
                }
            }

            // Update Bitcoin address field with saved value if available
            const bitcoinAddressField = document.getElementById('bitcoin-address');
            if (bitcoinAddressField && window._user?.settings?.affiliate_cashout_bitcoinAddress) {
                bitcoinAddressField.value = window._user.settings.affiliate_cashout_bitcoinAddress;
            }

            // Update referred users table
            updateReferredUsersTable();
        }

        // Function to update the referred users table
        function updateReferredUsersTable() {
            const noReferralsMessage = document.getElementById('no-referrals-message');
            const referredUsersTable = document.getElementById('referred-users-table-container');
            const tableBody = document.getElementById('referred-users-table-body');

            if (!tableBody || !noReferralsMessage || !referredUsersTable) return;

            const referredUsers = window._user?.settings?.affiliate_referred_users || [];

            if (referredUsers.length === 0) {
                noReferralsMessage.classList.remove('d-none');
                referredUsersTable.classList.add('d-none');
                return;
            }

            noReferralsMessage.classList.add('d-none');
            referredUsersTable.classList.remove('d-none');

            // Clear existing rows
            tableBody.innerHTML = '';

            // Add rows for each referred user
            referredUsers.forEach(user => {
                const row = document.createElement('tr');

                // User email (show only part before @)
                const emailParts = user.email.split('@');
                const maskedEmail = emailParts[0] + '@***';

                // Format date
                const date = new Date(user.date);
                const formattedDate = date.toLocaleDateString();

                // Format total commissions
                const totalCommissions = Number(user.total_commissions || 0).toFixed(2);

                row.innerHTML = `
            <td>${maskedEmail}</td>
            <td>${formattedDate}</td>
            <td>$${totalCommissions}</td>
        `;

                tableBody.appendChild(row);
            });
        }

        // Function to copy affiliate link to clipboard
        function copyAffiliateLink() {
            const affiliateLink = document.getElementById('affiliate-link');
            if (!affiliateLink) return;

            affiliateLink.select();
            affiliateLink.setSelectionRange(0, 99999); // For mobile devices

            navigator.clipboard.writeText(affiliateLink.value)
                .then(() => {
                    const copyBtn = document.getElementById('copy-affiliate-link-btn');
                    const originalHtml = copyBtn.innerHTML;

                    copyBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Copied!';
                    copyBtn.classList.remove('btn-primary');
                    copyBtn.classList.add('btn-success');

                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                        copyBtn.classList.remove('btn-success');
                        copyBtn.classList.add('btn-primary');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy the affiliate link. Please try again.');
                });
        }

        // Function to show the affiliate cashout modal
        function showAffiliateCashout() {
            if (!window._user) return false;

            const affiliateBalanceAmount = Number(window._user?.affiliate_balance || 0);

            if (affiliateBalanceAmount < 25) {
                alert('You need at least $25.00 in your affiliate balance to request a cashout.');
                return false;
            }

            // Show the modal
            const cashoutModal = new bootstrap.Modal(document.getElementById('affiliate-cashout-modal'));
            cashoutModal.show();

            return false;
        }

        // Function to validate Bitcoin address
        function isValidBitcoinAddress(address) {
            address = address?.trim();
            // Basic Bitcoin address validation (not comprehensive)
            if (!address || address.length < 25 || address.length > 62)
                return false;
            else
                return true;
        }

        // Function to process affiliate cashout
        function processAffiliateCashout() {
            if (!window._user) return;

            const bitcoinAddress = document.getElementById('bitcoin-address').value.trim();
            const confirmCheckbox = document.getElementById('cashout-confirm');
            const submitButton = document.getElementById('submit-cashout-btn');
            const affiliateBalanceAmount = Number(window._user?.affiliate_balance || 0);

            // Validate form
            let isValid = true;

            if (!isValidBitcoinAddress(bitcoinAddress)) {
                document.getElementById('bitcoin-address').classList.add('is-invalid');
                isValid = false;
            } else {
                document.getElementById('bitcoin-address').classList.remove('is-invalid');
            }

            if (!confirmCheckbox.checked) {
                confirmCheckbox.classList.add('is-invalid');
                isValid = false;
            } else {
                confirmCheckbox.classList.remove('is-invalid');
            }

            if (affiliateBalanceAmount < 25) {
                alert('You need at least $25.00 in your affiliate balance to request a cashout.');
                isValid = false;
            }

            if (!isValid) return;

            // Disable submit button and show loading
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...';

            // Submit cashout request
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'affiliate_cashout',
                    bitcoinAddress: bitcoinAddress
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else if (data.success) {
                        // Update user data with new balance
                        window._user = data.user;
                        userDataChanged();

                        // Close modal
                        bootstrap.Modal.getInstance(document.getElementById('affiliate-cashout-modal')).hide();

                        // Show success message
                        alert('Your cashout request has been processed successfully! You will receive your payment shortly.');
                    }
                })
                .catch(error => {
                    console.error('Error processing cashout:', error);
                    alert('An error occurred while processing your cashout request. Please try again.');
                })
                .finally(() => {
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                });
        }

        function translate() {
            const translations = {};
            const placeHolders2TranslationsMap = {};
            let placeholderCounter = 0;
            collectTextNodes().forEach(node => {
                const normalized = normalize(node.nodeValue);

                // Apply filters
                if (!normalized) return;
                if (normalized.length <= 2) return;
                if (!/[a-zA-Z]/.test(normalized)) return;
                if (normalized.includes('\"') || normalized.includes('@')) return;

                // Create unique placeholder using hash
                const placeholder = `__T_${placeholderCounter}__`;

                // Store in translations dictionary
                translations[placeholder] = normalized;
                placeHolders2TranslationsMap[placeholder] = node;
                // Replace text node content with placeholder
                // node.nodeValue = placeholder;
                placeholderCounter++;
            });

            console.log('translations', translations);

            // Detect user's browser language
            const userLanguage = navigator.language || navigator.userLanguage || 'en';
            const targetLanguage = userLanguage.split('-')[0]; // Get base language code (e.g., 'es' from 'es-MX')
            //  const targetLanguage = 'de'; // For testing only, force German has longest words
            // Skip translation if already in English
            if (targetLanguage === 'en')
                return console.log('Page already in English, skipping translation');

            // Get language name dynamically using Intl API
            let languageName;
            try {
                const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
                languageName = displayNames.of(targetLanguage);
            } catch (error) {
                console.warn('Failed to get language name:', error);
                languageName = targetLanguage.toUpperCase();
            }

            // Show loading indicator
            showLoading('Translating our website to ' + languageName + ' for you, please wait this can take up to a few minutes initially...');

            // Send translation request to backend using JSON
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'translate',
                    translations: translations,
                    targetLanguage: targetLanguage
                })
            })
                .then(response => response.json())
                .then(data => {
                    showLoading(null); // Hide loading

                    if (data.error)
                        return console.error('Translation error:', data.error);

                    if (data.translations) {
                        console.log('Received translations:', data.translations);
                        // Replace page HTML with translated version
                        Object.entries(data.translations).forEach(([placeholder, translatedText]) => {
                            if (placeHolders2TranslationsMap[placeholder]) {
                                console.log('Replacing', placeholder, 'with', translatedText);
                                placeHolders2TranslationsMap[placeholder].nodeValue = translatedText;
                            }
                        });
                        console.log('Page translated to:', targetLanguage);
                    }
                })
                .catch(error => {
                    showLoading(null);
                    console.error('Translation request failed:', error);
                });
        }


        // whether a node is in an element we should ignore
        function shouldIgnore(node) {
            if (!node || !node.parentElement) return true;
            const tag = node.parentElement.tagName;
            if (!tag) return true;
            const ignoreTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEMPLATE', 'SVG']);
            if (ignoreTags.has(tag)) return true;
            // ignore hidden or aria-hidden elements
            // const computed = window.getComputedStyle(node.parentElement);
            // if (computed && (computed.display === 'none' || computed.visibility === 'hidden')) return true;
            return false;
        }

        // collect text nodes
        function collectTextNodes(root = document.body) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => {
                    if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    if (shouldIgnore(node)) return NodeFilter.FILTER_REJECT;
                    // avoid text that is inside <input> or contenteditable (user content)
                    const p = node.parentElement;
                    if (!p) return NodeFilter.FILTER_REJECT;
                    if (p.isContentEditable) return NodeFilter.FILTER_REJECT;
                    if (['INPUT', 'TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            });
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            return nodes;
        }

        // collect attribute strings
        function collectAttributes(root = document.body) {
            const ATTRS = ['title', 'alt', 'placeholder', 'aria-label', 'data-i18n', 'value'];
            const nodes = [];
            ATTRS.forEach(attr => {
                document.querySelectorAll(`[${attr}]`).forEach(el => {
                    // skip inputs where value is user typed unless data-i18n present
                    if (attr === 'value' && !el.hasAttribute('data-i18n')) return;
                    const val = el.getAttribute(attr);
                    if (val && val.trim()) nodes.push({ el, attr, val });
                });
            });
            return nodes;
        }

        // normalize string (trim, collapse whitespace)
        function normalize(s) { return s; }

        // stable key generation: simple djb2 hash
        function hashStr(s) {
            let h = 5381;
            for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
            return (h >>> 0).toString(36);
        }

        function toggleReferralProgram() {
            const referralSection = document.getElementById('affiliate-program-section');

            if (!referralSection)
                return false;

            if (referralSection.style.display === 'none' || getComputedStyle(referralSection).display === 'none') {
                referralSection.style.display = 'block';
                // Scroll to the section smoothly
                referralSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                referralSection.style.display = 'none';
            }
            return false;
        }
        // Image Lightbox for Carousel Images
        document.addEventListener('DOMContentLoaded', function () {
            // Get or create the modal
            let modal = document.getElementById('imageLightboxModal');

            if (!modal) {
                // Create modal if it doesn't exist
                modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'imageLightboxModal';
                modal.tabIndex = -1;
                modal.setAttribute('aria-labelledby', 'imageLightboxModalLabel');
                modal.setAttribute('aria-hidden', 'true');

                modal.innerHTML = `
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-0">
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body d-flex align-items-center justify-content-center p-0">
                        <img id="lightboxImage" src="" alt="" class="img-fluid" style="max-height: 90vh; max-width: 100%; object-fit: contain;">
                    </div>
                </div>
            </div>
        `;

                document.body.appendChild(modal);
            }

            const lightboxImage = document.getElementById('lightboxImage');
            const bsModal = new bootstrap.Modal(modal);

            // Add click handlers to all carousel images and any standalone lightbox images
            const carouselImages = document.querySelectorAll('#heroCarousel .carousel-item img, img.lightbox-img');

            carouselImages.forEach(img => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Set the image source and alt text
                    lightboxImage.src = this.src;
                    lightboxImage.alt = this.alt;

                    // Show the modal
                    bsModal.show();
                });
            });

            // Close modal on background click
            modal.addEventListener('click', function (e) {
                if (e.target === modal || e.target.classList.contains('modal-body')) {
                    bsModal.hide();
                }
            });

            // Close modal on Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.classList.contains('show')) {
                    bsModal.hide();
                }
            });
        });

