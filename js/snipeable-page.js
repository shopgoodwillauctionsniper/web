/* ============================================================
   ShopGoodwill Sniper — Page Scripts
   ============================================================ */

'use strict';

/* ── OS Tab Selection ──────────────────────────────────────── */
function selectOS(os) {
    document.querySelectorAll('.os-panel').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('#osTabs .nav-link').forEach(function (b) { b.classList.remove('active'); });
    var panel = document.getElementById('os-' + os);
    var tab = document.getElementById('tab-' + os);
    if (panel) panel.classList.add('active');
    if (tab) tab.classList.add('active');
}

/* ── Copy Install Command ──────────────────────────────────── */
function copyCmd(id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    var text = el.textContent.trim();
    var reset = function () {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
    };
    navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(reset, 2200);
    }).catch(function () {
        try {
            var r = document.createRange();
            r.selectNode(el);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(r);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(reset, 2200);
        } catch (e) { }
    });
}

/* ── Version Label ─────────────────────────────────────────── */
fetch('/download/version.txt')
    .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
    .then(function (v) {
        var label = 'v' + v.trim() + ' \u2022 ';
        ['windows-version', 'macos-version', 'linux-version'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = label;
        });
    })
    .catch(function () { });

/* ── OS Auto-detect ────────────────────────────────────────── */
(function detectOS() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var pl = (navigator.platform || '').toLowerCase();
    var os = 'windows';
    if (/mac|iphone|ipad|ipod/.test(pl) || /macintosh/.test(ua)) { os = 'mac'; }
    else if (/linux/.test(pl) || /linux/.test(ua)) { os = 'linux'; }
    selectOS(os);
})();

/* ── Navbar scroll class ───────────────────────────────────── */
(function initNavScroll() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var onScroll = function () {
        if (window.scrollY > 40) { nav.classList.add('scrolled'); }
        else { nav.classList.remove('scrolled'); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

/* ── Smooth scroll for in-page anchors ─────────────────────── */
document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* close mobile nav if open */
    var collapse = document.getElementById('navbarNav');
    if (collapse && collapse.classList.contains('show')) {
        var bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
    }
});

/* ── Scroll fade-up animation (Intersection Observer) ──────── */
(function initFadeUp() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.fade-up').forEach(function (el) {
            el.classList.add('visible');
        });
        return;
    }
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-up').forEach(function (el) { obs.observe(el); });
})();

/* ── Snipe Demo Animation ──────────────────────────────────── */
(function initSnipeDemo() {
    var items = [
        { icon: '👖', name: "Vintage Levi's Jacket", bid: '$12.50', max: '$25.00' },
        { icon: '🧥', name: "1990s Patagonia Fleece", bid: '$8.75', max: '$20.00' },
        { icon: '🎧', name: "Apple AirPods Pro", bid: '$28.00', max: '$60.00' },
        { icon: '👟', name: "Vintage Nike Air Max", bid: '$19.00', max: '$40.00' },
    ];
    var itemIndex = 0;
    var step = 0;

    var cdEl = document.getElementById('demoCountdown');
    if (!cdEl) return;

    var statusEl = document.getElementById('demoStatusBar');
    var winEl = document.getElementById('demoWinOverlay');
    var fireEl = document.getElementById('demoFireOverlay');
    var nameEl = document.getElementById('demoItemName');
    var bidEl = document.getElementById('demoBidDisplay');
    var maxEl = document.getElementById('demoMaxBidDisplay');
    var winPriceEl = document.getElementById('demoWinPrice');
    var thumbEl = document.getElementById('demoItemThumb');

    function setItem(i) {
        var it = items[i];
        if (nameEl) nameEl.textContent = it.name;
        if (bidEl) bidEl.textContent = it.bid;
        if (maxEl) maxEl.textContent = it.max;
        if (thumbEl) thumbEl.textContent = it.icon;
    }

    function showCountdown(text, cls) {
        cdEl.textContent = text;
        cdEl.className = 'demo-countdown-display' + (cls ? ' ' + cls : '');
        if (fireEl) { fireEl.classList.remove('active'); fireEl.style.display = ''; }
        if (winEl) { winEl.classList.remove('active'); winEl.style.display = ''; }
        if (statusEl) statusEl.style.display = '';
    }

    function showQueued() {
        if (!statusEl) return;
        statusEl.className = 'demo-status-bar';
        statusEl.innerHTML = '<i class="bi bi-crosshair2 me-1"></i>Snipe Queued &bull; Max Bid: <strong>' + items[itemIndex].max + '</strong>';
    }

    function showFiring() {
        if (!statusEl) return;
        statusEl.className = 'demo-status-bar firing';
        statusEl.innerHTML = '<i class="bi bi-lightning-charge-fill me-1"></i>Preparing to fire...';
    }

    function showFire() {
        if (statusEl) statusEl.style.display = 'none';
        if (winEl) { winEl.classList.remove('active'); winEl.style.display = ''; }
        if (fireEl) { fireEl.style.display = 'flex'; void fireEl.offsetWidth; fireEl.classList.add('active'); }
    }

    function showWin() {
        if (statusEl) statusEl.style.display = 'none';
        if (fireEl) { fireEl.classList.remove('active'); fireEl.style.display = ''; }
        if (winPriceEl) winPriceEl.textContent = items[itemIndex].bid;
        if (winEl) { winEl.style.display = 'flex'; void winEl.offsetWidth; winEl.classList.add('active'); }
    }

    var phases = [
        function () { showCountdown('00:00:05', ''); showQueued(); return 850; },
        function () { showCountdown('00:00:04', ''); showQueued(); return 850; },
        function () { showCountdown('00:00:03', 'warn'); showQueued(); return 850; },
        function () { showCountdown('00:00:02', 'warn'); showQueued(); return 850; },
        function () { showCountdown('00:00:01', 'crit'); showFiring(); return 650; },
        function () { showCountdown('00:00:00', 'crit'); showFiring(); return 350; },
        function () { showFire(); return 900; },
        function () { showWin(); return 2400; },
        function () {
            /* reset for next item */
            if (winEl) { winEl.classList.remove('active'); winEl.style.display = ''; }
            if (fireEl) { fireEl.classList.remove('active'); fireEl.style.display = ''; }
            if (statusEl) { statusEl.style.display = ''; statusEl.className = 'demo-status-bar'; }
            itemIndex = (itemIndex + 1) % items.length;
            setItem(itemIndex);
            step = 0;
            return 700;
        }
    ];

    function run() {
        var delay = phases[step]();
        step = (step + 1 < phases.length) ? step + 1 : phases.length - 1;
        setTimeout(run, delay || 800);
    }

    setItem(itemIndex);
    setTimeout(run, 1200);
})();

/* ── Snipe Demo Card Lightbox ──────────────────────────────── */
(function initDemoCardLightbox() {
    var card = document.getElementById('heroDemoWrap');
    if (!card) return;

    function openLightbox() {
        var modal = document.getElementById('imageLightboxModal');
        var img = document.getElementById('lightboxImage');
        if (!modal || !img) return;
        img.src = '/img/bots/shopgoodwill-sniper.png';
        img.alt = 'ShopGoodwill Sniper application screenshot';

        /* Lock wrapper pixel dimensions so Bootstrap's body padding-right
           compensation (scrollbar removal) doesn't cause background-size:cover
           to reflow and glitch the screenshot */
        card.style.width = card.offsetWidth + 'px';
        card.style.height = card.offsetHeight + 'px';

        var bsModal = bootstrap.Modal.getOrCreateInstance(modal);

        modal.addEventListener('hidden.bs.modal', function unlock() {
            card.style.width = '';
            card.style.height = '';
            modal.removeEventListener('hidden.bs.modal', unlock);
        });

        bsModal.show();
    }

    card.addEventListener('click', openLightbox);
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
    });
})();
