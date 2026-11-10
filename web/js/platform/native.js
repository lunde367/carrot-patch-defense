// Detects whether we're running inside the iPhone/Android app (Capacitor) or a plain browser.
export const Cap = window.Capacitor || null;
export const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
export const platform = Cap && Cap.getPlatform ? Cap.getPlatform() : 'web';
export const plugin = name => (Cap && Cap.Plugins && Cap.Plugins[name]) || null;

// Test mode: open the game with #dev at the end of the link.
// Unlocks every level, shows a +200 seeds button, and fakes ads so you can test the flow.
export const devMode = /^#dev\b/.test(location.hash);
