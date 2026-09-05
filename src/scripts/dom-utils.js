// Ported from Hugo theme's static/js/smooth-scroll-init.js
// https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/
export function simulateClick(elem) {
  if (!elem) return;
  const evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  elem.dispatchEvent(evt);
}
