// Ported from Hugo theme's static/js/smooth-scroll-init.js — the actual
// smooth-scroll library isn't ported (native `scroll-behavior: smooth` +
// `scroll-padding-top` in global.css cover it, and respect
// prefers-reduced-motion for free), only its side effect of collapsing the
// open mobile menu once a nav link is clicked.
import { simulateClick } from './dom-utils.js';

document.querySelectorAll('a.nav-link').forEach((navLink) => {
  navLink.addEventListener('click', () => {
    const navbar = document.getElementById('navbarSupportedContent');
    if (navbar && navbar.classList.contains('show')) {
      simulateClick(document.querySelector('.navbar-toggler'));
    }
  });
});
