// Detects whether we're running inside the iPhone/Android app (Capacitor) or a plain browser.
export const Cap = window.Capacitor || null;
export const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
export const platform = Cap && Cap.getPlatform ? Cap.getPlatform() : 'web';
export const plugin = name => (Cap && Cap.Plugins && Cap.Plugins[name]) || null;

// Test mode (for the developer): unlocks everything, adds testing buttons and fakes ads.
// Turn it on by opening the game with #dev at the end of the link, or by tapping the game's
// title 7 times quickly (works everywhere, including inside apps that drop the #dev part).
// It stays on for this device until it's switched off the same way.
const DEV_KEY = 'cozy-dev-mode';
let stored = false;
try { stored = localStorage.getItem(DEV_KEY) === '1'; } catch(e) {}
export let devMode = /^#dev\b/.test(location.hash) || stored;

export function setDevMode(on){
  devMode = on;
  try { on ? localStorage.setItem(DEV_KEY, '1') : localStorage.removeItem(DEV_KEY); } catch(e) {}
  if (!on && /^#dev\b/.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch(e) {} }
}

// Calls onToggle after `count` quick taps on an element (the secret test-mode switch).
export function secretTaps(el, onToggle, count = 7, windowMs = 3000){
  let taps = [];
  el.addEventListener('pointerdown', () => {
    const now = performance.now();
    taps = taps.filter(t => now - t < windowMs); taps.push(now);
    if (taps.length >= count){ taps = []; setDevMode(!devMode); onToggle(devMode); }
  });
}
