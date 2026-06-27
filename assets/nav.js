/**
 * TinyImg Navigation Enhancement
 * - Adds mobile hamburger menu
 * - Converts Tools dropdown from hover to click (mobile-friendly)
 * - Shared across all pages
 */
(function () {
    'use strict';

    function enhanceNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const navInner = nav.querySelector('.flex.items-center.justify-between');
        if (!navInner) return;

        const menuContainer = navInner.querySelector('.flex.items-center.gap-2.flex-wrap');
        if (!menuContainer) return;

        // Add mobile menu toggle button (hidden on desktop)
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'md:hidden px-3 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border-2 border-gray-200';
        mobileToggle.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
        mobileToggle.setAttribute('aria-label', 'Toggle menu');
        navInner.appendChild(mobileToggle);

        // Mobile menu toggle behavior
        let menuOpen = false;
        mobileToggle.addEventListener('click', function () {
            menuOpen = !menuOpen;
            if (menuOpen) {
                menuContainer.style.display = 'flex';
                menuContainer.style.flexDirection = 'column';
                menuContainer.style.width = '100%';
                menuContainer.style.paddingTop = '12px';
                menuContainer.style.borderTop = '1px solid #f3f4f6';
                menuContainer.style.marginTop = '8px';
            } else {
                menuContainer.style.display = '';
                menuContainer.style.flexDirection = '';
                menuContainer.style.width = '';
                menuContainer.style.paddingTop = '';
                menuContainer.style.borderTop = '';
                menuContainer.style.marginTop = '';
            }
        });

        // Convert Tools hover dropdown to click-toggle
        const toolsButton = menuContainer.querySelector('button');
        if (toolsButton && toolsButton.textContent.trim().startsWith('Tools')) {
            const toolsWrapper = toolsButton.parentElement;
            const dropdown = toolsWrapper.querySelector('.absolute');

            // Remove hover-only classes, keep click logic
            if (dropdown) {
                let toolsOpen = false;
                toolsButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toolsOpen = !toolsOpen;
                    if (toolsOpen) {
                        dropdown.classList.remove('opacity-0', 'invisible');
                        dropdown.classList.add('opacity-100', 'visible');
                    } else {
                        dropdown.classList.add('opacity-0', 'invisible');
                        dropdown.classList.remove('opacity-100', 'visible');
                    }
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', function (e) {
                    if (!toolsWrapper.contains(e.target) && toolsOpen) {
                        toolsOpen = false;
                        dropdown.classList.add('opacity-0', 'invisible');
                        dropdown.classList.remove('opacity-100', 'visible');
                    }
                });
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceNav);
    } else {
        enhanceNav();
    }
})();
