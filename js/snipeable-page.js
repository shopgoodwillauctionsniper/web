function selectOS(os) {
    document.querySelectorAll('.os-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#osTabs .nav-link').forEach(b => b.classList.remove('active'));
    var panel = document.getElementById('os-' + os);
    var tab = document.getElementById('tab-' + os);
    if (panel) panel.classList.add('active');
    if (tab) tab.classList.add('active');
}

function copyCmd(id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent.trim()).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(function () {
        var range = document.createRange();
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
}

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

(function detectOS() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var platform = (navigator.platform || '').toLowerCase();
    var os = 'windows';
    if (/mac|iphone|ipad|ipod/.test(platform) || /macintosh/.test(ua)) {
        os = 'mac';
    } else if (/linux/.test(platform) || /linux/.test(ua)) {
        os = 'linux';
    }
    selectOS(os);
})();
