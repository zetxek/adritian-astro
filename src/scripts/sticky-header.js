// Ported from Hugo theme's static/js/sticky-header.js
import { simulateClick } from './dom-utils.js';

class StickyHeader {
  constructor(header) {
    this.header = header;
    this.thresholdPosition = 15;
    this.triggeredStickyClass = 'header--sticky-triggered';
    this.stickyClass = 'header--sticky';
    this.ticking = false;
    this.bodyPosition = 0;
    this.navbar = document.getElementById('navbarSupportedContent');

    this.initSticky();
    this.scrollChanged();
    window.addEventListener('resize', () => this.resizeHandler());
  }

  initSticky() {
    this.header.classList.toggle(this.stickyClass, true);
    this.updateHeaderHeightVar();
    window.addEventListener('scroll', () => this.scrollHandler(), { passive: true });
  }

  scrollHandler() {
    if (this.ticking) return;
    window.requestAnimationFrame(() => {
      this.scrollChanged();
      this.ticking = false;
    });
    this.ticking = true;
  }

  scrollChanged() {
    this.bodyPosition = Math.abs(document.body.getBoundingClientRect().top);
    this.header.classList.toggle(this.triggeredStickyClass, this.bodyPosition > this.thresholdPosition);
    this.updateHeaderHeightVar();
  }

  updateHeaderHeightVar() {
    // Drives the html { scroll-padding-top } used for anchor-link offsetting
    // (see global.css), so the offset always matches the header's real,
    // currently-transitioning height instead of a hardcoded guess.
    document.documentElement.style.setProperty('--header-height', `${this.header.getBoundingClientRect().height}px`);
  }

  resizeHandler() {
    // Above the mobile breakpoint the collapse menu is always visible inline,
    // so an open (.show) collapse left over from a narrower viewport must be
    // collapsed back, or it renders as a stray full-height overlay.
    if (window.innerWidth > 991 && this.navbar?.classList.contains('show')) {
      simulateClick(document.querySelector('.navbar-toggler'));
    }
    this.updateHeaderHeightVar();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyHeader);
} else {
  initStickyHeader();
}

function initStickyHeader() {
  const header = document.querySelector('.header');
  if (header) new StickyHeader(header);
}
