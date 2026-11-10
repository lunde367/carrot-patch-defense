// Pause when the game leaves the screen (switching apps, a phone call, locking the phone),
// and handle Android's back button.
import { plugin } from './native.js';

export function initLifecycle({ onPause, onResume, onBack }){
  document.addEventListener('visibilitychange', () => document.hidden ? onPause() : onResume());
  window.addEventListener('pagehide', onPause);
  window.addEventListener('blur', () => { if (document.hidden) onPause(); });

  const App = plugin('App');
  if (App && App.addListener){
    App.addListener('pause', onPause);
    App.addListener('resume', onResume);
    App.addListener('backButton', onBack);
  }
}
