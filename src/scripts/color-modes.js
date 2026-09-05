/*!
 * Color mode toggler, ported from the Adritian Hugo theme's
 * assets/js/color-modes.js (itself adapted from Bootstrap's docs).
 */
(() => {
  'use strict';

  const getStoredTheme = () => localStorage.getItem('theme');
  const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  function setTheme(theme) {
    document.documentElement.classList.add('theme-transition');

    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme-auto', 'true');
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
      document.documentElement.removeAttribute('data-theme-auto');
    }

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }

  setTheme(getPreferredTheme());

  const showActiveTheme = (theme) => {
    const themeSwitchers = document.querySelectorAll('.bd-theme-selector');
    if (!themeSwitchers.length) return;

    const activeThemeLabels = document.querySelectorAll('.current-theme');
    const btnsToActive = document.querySelectorAll(`[data-bs-theme-value="${theme}"]`);
    if (!btnsToActive.length) return;

    document.querySelectorAll('[data-bs-theme-value]').forEach((element) => {
      element.classList.remove('active');
      element.setAttribute('aria-pressed', 'false');
    });

    btnsToActive.forEach((element) => element.setAttribute('aria-pressed', 'true'));
    activeThemeLabels.forEach((element) => {
      element.textContent = btnsToActive[0].textContent;
    });

    themeSwitchers.forEach((switcher) => {
      switcher.querySelectorAll('[data-theme-icon]').forEach((icon) => {
        icon.classList.toggle('d-none', icon.getAttribute('data-theme-icon') !== theme);
      });
    });
  };

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme();
    if (
      storedTheme === 'auto' ||
      (!storedTheme && document.documentElement.getAttribute('data-theme-auto') === 'true')
    ) {
      setTheme('auto');
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme());

    document.querySelectorAll('[data-bs-theme-value]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const theme = toggle.getAttribute('data-bs-theme-value');
        setStoredTheme(theme);
        setTheme(theme);
        showActiveTheme(theme);
      });
    });
  });
})();
