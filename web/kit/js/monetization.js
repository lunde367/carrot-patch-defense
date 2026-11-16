// Ads and purchases for every game in the family, behind one small interface.
// Games only call these functions, so plugging in a real ad network (e.g. AdMob, with its
// child-safe and non-personalized settings on) or a real store (e.g. RevenueCat) later means
// editing this file and nothing else.
//
// ADS: inside the phone apps, rewarded video ads come from AdMob (@capacitor-community/admob).
// They are asked for as non-personalized and rated for everyone, so no tracking question is needed.
// In a browser there is no ad network, so a clearly labeled placeholder card stands in.
// PURCHASES: still a pretend checkout, clearly labeled.
import { plugin, isNative, platform } from './native.js';

let save = null;
export function bindSave(s){ save = s; if (!s.data.owned) s.data.owned = {}; }

const AdMob = () => (isNative ? plugin('AdMob') : null);
const EV = { reward:'onRewardedVideoAdReward', closed:'onRewardedVideoAdDismissed', failShow:'onRewardedVideoAdFailedToShow' };
let unit = '', testing = true, ready = false, loading = null, retryMs = 15000;

// Loads the next ad in the background so it is ready the moment a player asks for one.
function preload(){
  const A = AdMob(); if (!A || !unit || ready) return Promise.resolve(ready);
  if (!loading) loading = A.prepareRewardVideoAd({ adId:unit, isTesting:testing, npa:true })
    .then(() => { ready = true; retryMs = 15000; return true; })
    .catch(() => { setTimeout(preload, retryMs); retryMs = Math.min(retryMs*2, 240000); return false; })
    .finally(() => { loading = null; });
  return loading;
}
// Call once at start. `rewarded` holds the ad unit for each phone: { android:'…', ios:'…' }.
// While `testing` is true only Google's test ads are shown, so nothing here can earn or break rules.
export async function initAds({ rewarded = {}, testing:t = true } = {}){
  const A = AdMob(); if (!A) return false;
  unit = rewarded[platform] || ''; testing = t; if (!unit) return false;
  try {
    await A.initialize({ initializeForTesting:testing, maxAdContentRating:'General', tagForChildDirectedTreatment:false, tagForUnderAgeOfConsent:false });
    try {   // where the law asks for it (Europe), Google's own consent form is shown once
      const info = await A.requestConsentInfo();
      if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await A.showConsentForm();
    } catch(e) {}
    preload(); return true;
  } catch(e) { return false; }
}
const wait = ms => new Promise(r => setTimeout(() => r(false), ms));
async function realAd(){
  const A = AdMob();
  if (!ready && !(await Promise.race([preload(), wait(7000)]))){ await notice('No ad right now', 'Please try again in a little while.'); return false; }
  return new Promise(resolve => {
    let earned = false, done = false; const subs = [];
    const finish = ok => { if (done) return; done = true; subs.forEach(h => Promise.resolve(h).then(x => x && x.remove && x.remove()).catch(()=>{})); ready = false; preload(); resolve(ok); };
    subs.push(A.addListener(EV.reward, () => { earned = true; }));
    subs.push(A.addListener(EV.closed, () => setTimeout(() => finish(earned), 50)));    // the reward can arrive just after closing
    subs.push(A.addListener(EV.failShow, () => finish(false)));
    A.showRewardVideoAd().then(() => { earned = true; }).catch(() => finish(false));
  });
}

export const Ads = {
  // True when a rewarded ad can be shown right now.
  rewardedReady(placement){ return AdMob() && unit ? ready : true; },
  // Shows a rewarded ad. Resolves true if the player earned the reward.
  async showRewarded(placement, label=''){ return AdMob() && unit ? realAd() : placeholderAd(placement, label); },
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
function notice(title, text){
  return new Promise(resolve => { const el = sheet(`<b>${title}</b><p>${text}</p><div class="testad-row"><button class="testad-btn main" data-r="1">OK</button></div>`);
    el.addEventListener('click', e => { if (!e.target.closest('[data-r]')) return; el.remove(); resolve(); }); });
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
