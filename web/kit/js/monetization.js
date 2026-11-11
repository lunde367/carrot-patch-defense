// Ads and purchases for every game in the family, behind one small interface.
// Games only call these functions, so plugging in a real ad network (e.g. AdMob, with its
// child-safe and non-personalized settings on) or a real store (e.g. RevenueCat) later means
// editing this file and nothing else.
//
// FOR NOW: every ad is a placeholder card the player can close right away, and every purchase is a
// pretend checkout. Both are clearly labeled. This lets every reward flow be tested before real
// ads exist.
let save = null;
export function bindSave(s){ save = s; if (!s.data.owned) s.data.owned = {}; }

export const Ads = {
  // True when a rewarded ad is ready to show. (Placeholder: always.)
  rewardedReady(placement){ return true; },
  // Shows a rewarded ad. Resolves true if the player earned the reward.
  async showRewarded(placement, label=''){ return placeholderAd(placement, label); },
};

export const Store = {
  owns(id){ return !!(save && save.data.owned && save.data.owned[id]); },
  // Asks a grown-up first, then runs the (pretend) checkout. Resolves true if bought.
  async buy(id, { name='', price='' } = {}){
    if (!(await parentalGate())) return false;
    const ok = await pretendCheckout(name, price);
    if (ok && save){ save.data.owned[id] = true; save.commit(); }
    return ok;
  },
  // Restores purchases on a new phone. (Placeholder: purchases already live in the save.)
  async restore(){ return !!(save && Object.keys(save.data.owned||{}).length); },
  forget(id){ if (save){ delete save.data.owned[id]; save.commit(); } },   // test mode only
};

// ---------- placeholders (clearly not real) ----------
function sheet(html){
  const el = document.createElement('div'); el.className = 'testad'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
  el.innerHTML = html; document.body.append(el); return el;
}
function placeholderAd(placement, label){
  return new Promise(resolve => {
    const el = sheet(`<b>Ad placeholder</b>
      <p>A short video ad would play here in the finished app.</p>
      ${label?`<p class="testad-reward">Reward: ${label}</p>`:''}
      <div class="testad-row"><button class="testad-btn main" data-r="1">Close and get reward</button>
      <button class="testad-btn" data-r="0">Skip, no reward</button></div>
      <small>${placement}</small>`);
    el.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; el.remove(); resolve(b.dataset.r==='1'); });
  });
}
function pretendCheckout(name, price){
  return new Promise(resolve => {
    const el = sheet(`<b>Pretend checkout</b>
      <p>${name}<br><span class="testad-price">${price}</span></p>
      <p>No money is charged. In the finished app this is the App Store or Google Play payment sheet.</p>
      <div class="testad-row"><button class="testad-btn main" data-r="1">Buy (test)</button><button class="testad-btn" data-r="0">Cancel</button></div>`);
    el.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; el.remove(); resolve(b.dataset.r==='1'); });
  });
}

// ---------- grown-up check ----------
// A simple question before any purchase, as the app stores expect for family games.
export function parentalGate(){
  return new Promise(resolve => {
    const a = 6 + Math.floor(Math.random()*4), b = 6 + Math.floor(Math.random()*4), right = a*b;
    const picks = [right, right+a, right-b, right+1].sort(() => Math.random()-.5);
    const el = sheet(`<b>Ask a grown-up</b>
      <p>To continue, a grown-up should answer: what is ${a} × ${b}?</p>
      <div class="testad-row">${picks.map(n=>`<button class="testad-btn num" data-n="${n}">${n}</button>`).join('')}</div>
      <button class="testad-btn" data-n="x">Cancel</button>`);
    el.addEventListener('click', e => { const t = e.target.closest('[data-n]'); if (!t) return; el.remove(); resolve(t.dataset.n==String(right)); });
  });
}
