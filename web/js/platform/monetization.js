// Ads and purchases live behind this one small interface. The game only ever calls these
// functions, so plugging in a real ad network (e.g. AdMob) or store (e.g. RevenueCat) later
// means editing this file and nothing else.
import { devMode } from './native.js';
import { Save } from './storage.js';

export const PRODUCTS = { removeAds:'remove_ads' };
export const REWARDS = { retrySeeds:60 };

export const Ads = {
  // True when a rewarded ad is loaded and ready to show.
  rewardedReady(placement){
    if (devMode) return true;
    // TODO(app): return the ad plugin's "is loaded" state here.
    return false;
  },
  // Shows a rewarded ad. Resolves true only if the player watched to the end.
  async showRewarded(placement){
    if (devMode) return testAd(placement);
    // TODO(app): call the ad plugin and resolve with whether the reward was earned.
    return false;
  },
};

export const Store = {
  owns(id){ return !!Save.data.owned[id]; },
  async buy(id){
    // TODO(app): call the store plugin; on success:
    // Save.data.owned[id] = true; Save.commit(); return true;
    return false;
  },
  async restore(){ /* TODO(app): restore purchases on a new phone */ return false; },
};

// Dev-mode stand-in so the reward flow can be tested in a browser. Clearly labeled, never shipped as a real ad.
function testAd(placement){
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'testad';
    el.innerHTML = `<b>Test ad</b><span>Dev mode only · ${placement}</span><span class="testad-bar"><i></i></span>`;
    document.body.append(el);
    setTimeout(() => { el.remove(); resolve(true); }, 1800);
  });
}
