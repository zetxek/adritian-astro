/*!
 * Ported from Hugo theme's assets/js/navbar-overflow.js
 * Automatically moves overflowing nav items and selectors to a "More" dropdown.
 */

var MORE_DROPDOWN_ID = 'navbar-more-dropdown';
var MORE_BUTTON_ID = 'navbar-more-button';
var RESIZE_DEBOUNCE_MS = 100;

var moreDropdown = null;
var moreButton = null;
var navbarNav = null;
var navbarToggler = null;
var resizeTimeout = null;
var overflowMode = 'dropdown';
// Tracks <li> dropdown items moved (not cloned) into the More dropdown so
// resetAllItems can return them to their original <ul.dropdown-menu>. Moving
// preserves the click handlers bound directly by color-modes.js etc. —
// cloning would silently break them.
var movedDropdownItems = [];

function init() {
  navbarNav = document.querySelector('.header .navbar-nav');
  if (!navbarNav) return;

  navbarToggler = document.querySelector('.navbar-toggler');

  if (overflowMode === 'dropdown') {
    createMoreDropdown();
  }

  // Handle overflow on load (after a short delay to ensure DOM is fully rendered)
  setTimeout(handleOverflow, 50);

  // Handle overflow on resize (debounced)
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleOverflow, RESIZE_DEBOUNCE_MS);
  });

  // Handle overflow when dropdowns are opened/closed
  document.addEventListener('shown.bs.dropdown', handleOverflow);
  document.addEventListener('hidden.bs.dropdown', handleOverflow);
}

function createMoreDropdown() {
  moreDropdown = document.getElementById(MORE_DROPDOWN_ID);
  moreButton = document.getElementById(MORE_BUTTON_ID);

  if (moreDropdown && moreButton) return;

  var moreLi = document.createElement('li');
  moreLi.className = 'dropdown nav-item more-dropdown';
  moreLi.id = 'navbar-more-item';

  moreButton = document.createElement('button');
  moreButton.id = MORE_BUTTON_ID;
  moreButton.className = 'btn btn-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center';
  moreButton.type = 'button';
  moreButton.setAttribute('data-bs-toggle', 'dropdown');
  moreButton.setAttribute('data-bs-auto-close', 'outside');
  moreButton.setAttribute('aria-expanded', 'false');
  moreButton.setAttribute('aria-haspopup', 'true');
  moreButton.textContent = 'More';

  moreDropdown = document.createElement('ul');
  moreDropdown.id = MORE_DROPDOWN_ID;
  moreDropdown.className = 'dropdown-menu dropdown-menu-end';
  moreDropdown.setAttribute('aria-labelledby', MORE_BUTTON_ID);

  moreLi.appendChild(moreButton);
  moreLi.appendChild(moreDropdown);

  navbarNav.appendChild(moreLi);
}

function handleOverflow() {
  if (!navbarNav) return;

  resetAllItems();

  // On mobile, don't use overflow - items are in collapse menu
  if (window.innerWidth < 992) {
    var moreItem = document.getElementById('navbar-more-item');
    if (moreItem) {
      moreItem.style.display = 'none';
    }
    return;
  }

  navbarNav = document.querySelector('.header .navbar-nav');
  if (!navbarNav) return;

  var navbarCollapse = document.getElementById('navbarSupportedContent');
  if (!navbarCollapse) return;

  // Buffer reserves room for the More button. Measure the actual rendered
  // button so localized labels don't clip.
  var buffer = 20;
  if (overflowMode === 'dropdown') {
    var moreItemEl = document.getElementById('navbar-more-item');
    if (moreItemEl) {
      var prevDisplay = moreItemEl.style.display;
      moreItemEl.style.display = 'list-item';
      var measured = moreItemEl.getBoundingClientRect().width;
      moreItemEl.style.display = prevDisplay;
      buffer = measured > 0 ? Math.ceil(measured) + 8 : 120;
    } else {
      buffer = 120;
    }
  }
  var availableWidth = navbarCollapse.offsetWidth - buffer;

  var items = Array.from(navbarNav.children).filter(function (item) {
    return !item.classList.contains('more-dropdown');
  });

  var totalWidth = 0;
  var overflowItems = [];

  items.forEach(function (item) {
    totalWidth += item.getBoundingClientRect().width;
    if (totalWidth > availableWidth) {
      overflowItems.push(item);
    }
  });

  if (overflowItems.length > 0) {
    var moreItem = document.getElementById('navbar-more-item');
    if (moreItem) {
      moreItem.style.display = 'list-item';
    }
    overflowItems.forEach(function (item) {
      moveItemToMore(item);
    });
  } else {
    var moreItemToHide = document.getElementById('navbar-more-item');
    if (moreItemToHide) {
      moreItemToHide.style.display = 'none';
    }
  }
}

function moveItemToMore(item) {
  if (!moreDropdown) return;

  // Dropdown items (language/theme selectors) get inlined with a section
  // header. Bootstrap 5 has no native nested-dropdown support, so a nested
  // toggle wouldn't open. We also MOVE the original <li> items rather than
  // cloning so handlers bound directly by color-modes.js etc. keep working.
  if (item.classList.contains('dropdown')) {
    var dropdownMenu = item.querySelector('.dropdown-menu');
    if (dropdownMenu) {
      var labelText = getDropdownLabel(item);
      if (labelText) {
        var headerLi = document.createElement('li');
        headerLi.className = 'overflow-section-header';
        var header = document.createElement('h6');
        header.className = 'dropdown-header';
        header.textContent = labelText;
        headerLi.appendChild(header);
        moreDropdown.appendChild(headerLi);
      }

      Array.from(dropdownMenu.children).forEach(function (li) {
        movedDropdownItems.push({ item: li, originalParent: dropdownMenu });
        moreDropdown.appendChild(li);
      });

      item.dataset.inMore = 'true';
      item.style.display = 'none';
      return;
    }
  }

  // Plain nav items: clone the link (it has no JS-bound handlers worth
  // preserving — links navigate via href).
  var link = item.querySelector('a, button');
  if (!link) return;

  var dropdownItem = document.createElement('li');
  var dropdownLink = link.cloneNode(true);

  if (dropdownLink.id) {
    dropdownLink.id = dropdownLink.id + '-more';
  }
  dropdownLink.classList.remove('dropup');
  dropdownLink.classList.remove('dropdown-toggle');
  dropdownLink.removeAttribute('data-bs-toggle');
  dropdownLink.removeAttribute('aria-expanded');
  dropdownLink.removeAttribute('aria-haspopup');

  dropdownItem.appendChild(dropdownLink);

  item.dataset.inMore = 'true';
  moreDropdown.appendChild(dropdownItem);
  item.style.display = 'none';
}

function getDropdownLabel(item) {
  var labelEl = item.querySelector('.current-scheme, .current-theme, .label');
  if (labelEl && labelEl.textContent.trim()) {
    return labelEl.textContent.trim();
  }
  var toggle = item.querySelector('.dropdown-toggle, [data-bs-toggle="dropdown"]');
  if (toggle) {
    var aria = toggle.getAttribute('aria-label');
    if (aria) return aria.trim();
    if (toggle.textContent.trim()) return toggle.textContent.trim();
  }
  return '';
}

function resetAllItems() {
  var itemsInOverflow = Array.from(navbarNav.children).filter(function (item) {
    return item.dataset.inMore === 'true';
  });

  itemsInOverflow.forEach(function (item) {
    item.style.display = '';
    delete item.dataset.inMore;
  });

  // Return moved <li> dropdown items to their original parent BEFORE
  // clearing the More dropdown — otherwise we'd destroy elements that still
  // own live event handlers.
  movedDropdownItems.forEach(function (entry) {
    if (entry.originalParent && entry.item) {
      entry.originalParent.appendChild(entry.item);
    }
  });
  movedDropdownItems = [];

  if (moreDropdown) {
    while (moreDropdown.firstChild) {
      moreDropdown.removeChild(moreDropdown.firstChild);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
