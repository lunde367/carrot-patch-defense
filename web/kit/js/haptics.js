// Small vibrations for touch feedback. Uses the phone's haptics inside the store apps, and the
// browser's vibration on Android web. Does nothing where neither exists (iPhone Safari), or when off.
import { plugin } from './native.js';
let enabled = true;
export function setHaptics(on){ enabled = !!on; }
const STYLE = { light:'LIGHT', medium:'MEDIUM', heavy:'HEAVY' }, MS = { light:10, medium:22, heavy:40, success:[14,60,22], warn:[30,50,30] };
export function haptic(kind='light'){
  if (!enabled) return;
  try {
    const H = plugin('Haptics');
    if (H){ if (kind==='success' || kind==='warn') H.notification({ type: kind==='success' ? 'SUCCESS' : 'WARNING' }); else H.impact({ style: STYLE[kind] || 'LIGHT' }); return; }
    if (navigator.vibrate) navigator.vibrate(MS[kind] || 10);
  } catch(e) {}
}
