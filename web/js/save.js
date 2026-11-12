// This game's save data, built on the kit's save system.
import { createSave } from '../kit/js/storage.js';
import { PERKS } from './data/perks.js';

const defaults = () => ({
  v: 2,
  stars: [],                                   // best stars per level, by level index
  perks: {},                                   // Garden Shed tiers owned, e.g. { pouch:2 }
  seen: {},                                    // defenders already introduced
  tutorialDone: false,
  settings: { sfx:true, music:true, speed:1, tough:false },
  owned: {},                                   // purchases, e.g. { remove_ads:true }
  stats: { wins:0, losses:0, kills:0, bossKills:0, flowerSeeds:0 },
  ach: {},                                     // achievements earned, id → date
  diary: {},                                   // diary pages read
  parts: {},                                   // story parts whose title card was shown
  fold: {},                                    // home screen: parts the player opened (true) or closed (false)
  pests: null,                                 // pests already introduced with a card (null = not set up yet)
  fast3Until: 0,                               // 3× speed is unlocked until this time (ms), from watching an ad
  bonusStars: 0,                               // extra stars earned from ads
  adStars: { day:'', n:0 },                    // bonus stars claimed today (2 a day)
});

// Upgrade older saves to the current shape so updates never wipe progress.
function migrate(d, base){
  const out = { ...base, ...d, v:base.v,
    stars: Array.isArray(d.stars) ? d.stars : [],
    perks: { ...(d.perks||{}) }, seen: { ...(d.seen||{}) },
    settings: { ...base.settings, ...(d.settings||{}) },
    owned: { ...(d.owned||{}) }, stats: { ...base.stats, ...(d.stats||{}) }, ach: { ...(d.ach||{}) }, diary: { ...(d.diary||{}) }, parts: { ...(d.parts||{}) }, fold: { ...(d.fold||{}) }, pests: d.pests ? { ...d.pests } : null, adStars: { ...base.adStars, ...(d.adStars||{}) } };
  if (!d.v || d.v < 2){
    // v1 players already know the basics; introduce only defenders they haven't reached.
    out.tutorialDone = out.stars.some(Boolean);
  }
  return out;
}

export const Save = createSave({
  key: 'carrot-patch-save', defaults, migrate,
  legacy: () => { const old = JSON.parse(localStorage.getItem('cpd-prog2')); return old && old.stars ? { stars:old.stars } : null; },
});

// Stars: earned (best per level), spent in the shed, and left to spend.
export const starsEarned = () => Save.data.stars.reduce((a,b)=>a+(b||0),0) + (Save.data.bonusStars||0);
export const starsSpent = () => PERKS.reduce((sum,p)=>sum+p.costs.slice(0,Save.data.perks[p.id]||0).reduce((a,b)=>a+b,0),0);
export const starsLeft = () => starsEarned() - starsSpent();
