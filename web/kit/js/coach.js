// Tutorial coach: a speech bubble that points at one thing at a time and waits for the
// player to do it. Reusable by any game in the family.
//
//   const coach = createCoach({ onFinish(skipped){ ... } });
//   coach.start([
//     { text:'Tap the bunny', target:'#card-bunny', until:'pickTower', when:d=>d==='bunny' },
//     { text:'All done!', button:'Got it' },
//   ]);
//
// Step fields: text, target (selector, element or function; without one the bubble sits at the
// bottom of the screen), place ('auto' next to the target |
// 'over' or 'over-bottom' inside its bottom edge | 'over-top' inside its top edge), until (event
// name), when (filter for that event), button (shows a button that advances), enter()/leave() hooks.
import { on } from './events.js';

export function createCoach({ onFinish = () => {}, skipLabel = 'Skip tutorial' } = {}){
  const el = document.createElement('div');
  el.className = 'coach'; el.hidden = true; el.setAttribute('role','status');
  el.innerHTML = `<p class="coach-text"></p><div class="coach-acts"><button class="coach-btn" hidden></button><button class="coach-skip">${skipLabel}</button></div><i class="coach-arrow"></i>`;
  document.body.append(el);
  const textEl = el.querySelector('.coach-text'), btn = el.querySelector('.coach-btn'), arrow = el.querySelector('.coach-arrow');

  let steps = [], i = -1, target = null, off = null, ticker = null;

  const resolve = t => !t ? null : typeof t === 'function' ? t() : typeof t === 'string' ? document.querySelector(t) : t;

  function clearStep(){
    if (off) { off(); off = null; }
    if (target) target.classList.remove('coach-target');
    const s = steps[i]; if (s && s.leave) s.leave();
    target = null;
  }
  function show(){
    const s = steps[i];
    if (s.enter) s.enter();
    textEl.textContent = typeof s.text === 'function' ? s.text() : s.text;
    btn.hidden = !s.button; btn.textContent = s.button || '';
    target = resolve(s.target);
    if (target && !String(s.place).startsWith('over')) target.classList.add('coach-target');
    // bring a target that's off screen into view so the bubble can point at it
    if (target){ const r = target.getBoundingClientRect(); if (r.bottom > window.innerHeight - 140 || r.top < 0) target.scrollIntoView({ block:'center' }); }
    if (s.until) off = on(s.until, d => { if (!s.when || s.when(d)) next(); });
    el.hidden = false; position();
  }
  function position(){
    if (el.hidden) return;
    const s = steps[i], vw = window.innerWidth, vh = window.innerHeight;
    // The game may redraw the element we point at; find it again if so.
    if (s.target && (!target || !target.isConnected)){
      target = resolve(s.target);
      if (target && !String(s.place).startsWith('over')) target.classList.add('coach-target');
    }
    const w = Math.min(300, vw - 32); el.style.width = w + 'px';
    const h = el.offsetHeight;
    let top, left, arrowSide = 'none', ax = 0;
    if (!target){
      // Nothing to point at: sit at the bottom of the screen, clear of the play area
      // (games keep the action up top and controls at the bottom).
      const safe = parseFloat(getComputedStyle(document.documentElement).paddingBottom) || 0;
      top = vh - h - 12 - safe; left = (vw - w)/2;
    }
    else {
      const r = target.getBoundingClientRect();
      left = Math.min(Math.max(16, r.left + r.width/2 - w/2), vw - w - 16);
      if (s.place === 'over-top'){ top = r.top + 10; }
      else if (s.place === 'over' || s.place === 'over-bottom'){ top = r.bottom - h - 10; }
      else if (r.top > h + 24){ top = r.top - h - 14; arrowSide = 'down'; }
      else { top = r.bottom + 14; arrowSide = 'up'; }
      ax = Math.min(Math.max(18, r.left + r.width/2 - left), w - 18);
    }
    el.style.top = Math.max(8, top) + 'px'; el.style.left = left + 'px';
    arrow.dataset.side = arrowSide; arrow.style.left = ax + 'px';
  }
  function next(){
    clearStep(); i++;
    if (i >= steps.length) return finish(false);
    show();
  }
  function finish(skipped){
    clearStep(); el.hidden = true; i = -1; steps = [];
    clearInterval(ticker); ticker = null;
    onFinish(skipped);
  }
  btn.addEventListener('click', next);
  el.querySelector('.coach-skip').addEventListener('click', () => finish(true));
  window.addEventListener('resize', position);

  return {
    start(list){ if (ticker) finish(true); steps = list; i = -1; ticker = setInterval(position, 250); next(); },
    stop(){ if (steps.length){ clearStep(); el.hidden = true; i = -1; steps = []; clearInterval(ticker); ticker = null; } },
    get active(){ return steps.length > 0; },
  };
}
