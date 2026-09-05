/*!
 * Experience widget selector — progressive enhancement for the two-column
 * job list / description panel widget (ported behavior from the Hugo
 * theme's per-job single-page master/detail pattern, adapted to a same-page
 * client-side swap for the homepage/experience-list widgets).
 *
 * Without this script, each `.experience` is a native <details>/<summary>
 * accordion with its own inline description — fully accessible with no JS.
 * With it, clicking/hovering/keyboard-selecting a job's <summary> instead
 * highlights it (.selected) and shows its description in the right-hand
 * panel, matching _experience.scss's `.experience.selected` styling.
 */
(() => {
  'use strict';

  function selectItem(widget, index) {
    const items = widget.querySelectorAll('[data-experience-item]');
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
    });

    const panels = widget.querySelectorAll('[data-experience-panel]');
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
  }

  function initWidget(widget) {
    const items = Array.from(widget.querySelectorAll('[data-experience-item]'));

    items.forEach((item, index) => {
      const summary = item.querySelector('summary');
      if (!summary) return;

      summary.addEventListener('mouseenter', () => selectItem(widget, index));

      item.addEventListener('toggle', () => {
        if (item.open) selectItem(widget, index);
      });
    });

    const alreadySelected = items.findIndex((item) => item.classList.contains('selected'));
    selectItem(widget, alreadySelected === -1 ? 0 : alreadySelected);
  }

  document.querySelectorAll('[data-experience-widget]').forEach(initWidget);
})();
