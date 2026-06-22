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
