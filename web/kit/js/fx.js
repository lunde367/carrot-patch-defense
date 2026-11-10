// Feel-good effects for the game family: toasts, confetti and screen shake.
// All of them respect the player's "reduce motion" setting.
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- toast: a small message that slides in at the top and leaves on its own ----------
let toastBox = null;
export function toast(html, { kind = 'info', ms = 4500 } = {}){
  if (!toastBox){ toastBox = document.createElement('div'); toastBox.className = 'toasts'; toastBox.setAttribute('aria-live','polite'); document.body.append(toastBox); }
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`; el.innerHTML = html;
  toastBox.append(el);
  const close = () => { if (el.classList.contains('out')) return; el.classList.add('out'); setTimeout(() => el.remove(), 350); };
  el.addEventListener('pointerdown', close);          // tap to dismiss early
  setTimeout(close, ms);
}

// ---------- confetti: a short burst of paper bits over the whole screen ----------
export function confetti({ count = 90, colors = ['#f0913f','#f6c344','#8fc25a','#e8749a','#7fb3d1','#fafcf5'] } = {}){
  if (reduced()) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti';
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
  cv.width = W*dpr; cv.height = H*dpr; document.body.append(cv);
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const bits = Array.from({ length:count }, () => ({
    x: W/2 + (Math.random()-.5)*W*.3, y: H*.35, vx: (Math.random()-.5)*9, vy: -6-Math.random()*7,
    r: Math.random()*6.28, vr: (Math.random()-.5)*.4, w: 6+Math.random()*6, h: 4+Math.random()*4, c: colors[Math.floor(Math.random()*colors.length)],
  }));
  let t0 = performance.now();
  (function step(now){
    const t = (now - t0)/1000; g.clearRect(0,0,W,H);
    for (const b of bits){ b.vy += .28; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      g.save(); g.translate(b.x,b.y); g.rotate(b.r); g.globalAlpha = Math.max(0, 1 - t/2.4); g.fillStyle = b.c; g.fillRect(-b.w/2,-b.h/2,b.w,b.h); g.restore(); }
    if (t < 2.4) requestAnimationFrame(step); else cv.remove();
  })(t0);
}

// ---------- shake: a quick wobble of one element ----------
export function shake(el, strength = 1){
  if (reduced() || !el) return;
  el.style.setProperty('--shake', `${Math.round(3*strength)}px`);
  el.classList.remove('shaking'); void el.offsetWidth; el.classList.add('shaking');
  setTimeout(() => el.classList.remove('shaking'), 320);
}
