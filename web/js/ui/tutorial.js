import { emit } from '../../kit/js/events.js';
// First-level tutorial, run by the kit's coach. Each step waits for the player to do one thing.
import { createCoach } from '../../kit/js/coach.js';
import { G, upCostOf } from '../engine/game.js';
import { TYPES } from '../data/towers.js';
import { Save } from '../save.js';

const coach = createCoach({
  onFinish(){ Save.data.tutorialDone = true; Save.commit(); emit('tutorialDone'); G.hint = null; allowed = null; onAllow(); },
});

export const tutorialActive = () => coach.active;
export function stopTutorial(){ coach.stop(); G.hint = null; allowed = null; }

// Which defenders the current step lets the player pick (null = any). The tray re-draws when it changes.
let allowed = null, onAllow = () => {};
export const tutorialAllows = key => !coach.active || !allowed || allowed.includes(key);
export const onTutorialAllow = fn => { onAllow = fn; };
const allow = list => { allowed = list; if (list && G.S && G.S.build && !list.includes(G.S.build)) G.S.build = null; onAllow(); };

// The first level teaches where to plant, not just how: each hint spot shows the defender's reach and
// lights up the stretches of path it would cover. Spots are the best ones on Seedlings' path (inside its bends).
const BEST = { bunny:{ c:6, r:3 }, sprinkler:{ c:6, r:4 }, bunny2:{ c:2, r:7 } };
const hintFor = (spot, type) => ({ ...spot, reach:TYPES[type].range[0] });
const topUp = n => { if (G.S.seeds < n) G.S.seeds = n; };
export function startTutorial(){
  const bunnyOf = () => G.S.towers.find(t => t.type==='bunny');
  coach.start([
    { text:'Pests crawl down the dirt path to your cabbages, and each one that gets through eats one. The Carrot Bunny throws carrots at them. Tap it to pick it.',
      target:'#card-bunny', until:'pickTower', when:k => k==='bunny', enter(){ allow(['bunny']); } },
    { text:'Where you plant matters most. From inside a bend, the bunny reaches three stretches of path at once (lit up in orange). Tap the glowing spot.',
      target:'#board', place:'over', until:'plant',
      enter(){ G.hint = hintFor(BEST.bunny, 'bunny'); }, leave(){ G.hint = null; } },
    { text:'Wrong spot? For a few seconds after planting, Undo gives back every seed.', target:'#undo', fallback:'#msg', button:'Got it' },
    { text:'The Sprinkler barely hurts pests, but it slows them down. Put it next to the bunny, so slowed pests stay in the bunny’s reach longer.',
      target:'#card-sprinkler', until:'plant', when:t => t.type==='sprinkler',
      enter(){ allow(['sprinkler']); topUp(TYPES.sprinkler.cost); G.hint = hintFor(BEST.sprinkler, 'sprinkler'); }, leave(){ G.hint = null; } },
    { text:'Ready? Tap Start wave.', target:'#go', until:'waveStart', enter(){ allow([]); } },
    { text:'Your defenders fight on their own, and every pest they squash drops seeds. Tap 1× to play faster.', target:'#spd', until:'waveClear', tuck:'#spd', tuckAfter:7000, enter(){ allow(null); } },
    { text:'Wave cleared! Spend those seeds: plant another bunny inside the next bend down the path.',
      target:'#card-bunny', until:'plant', when:t => t.type==='bunny',
      enter(){ allow(['bunny']); topUp(TYPES.bunny.cost); G.hint = hintFor(BEST.bunny2, 'bunny'); }, leave(){ G.hint = null; allow(null); } },
    { text:'Now tap your first bunny to see what it can do.', target:'#board', place:'over', until:'select', when:t => t && t.type==='bunny',
      enter(){ const b = bunnyOf(); if (b) G.hint = { c:b.c, r:b.r }; }, leave(){ G.hint = null; } },
    { text:'Upgrade it. Upgraded defenders hit harder and reach farther. (Sell gives back most of what you spent.)', target:'#iUp', until:'upgrade',
      enter(){ const b = G.S.sel; if (b) topUp(upCostOf(b)); } },
    { text:'Rocks and bushes take up good spots. Tap one any time to clear it for a few seeds.', target:'#board', place:'over', button:'Got it' },
    { text:'After each wave, the line under the board says what’s coming next. The Fat Slug arrives on wave 8, so keep upgrading. Save every cabbage for 3 stars!',
      target:'#msg', button:'Let’s go' },
  ]);
}

// Garden Shed tour: shown the first time the player has stars to spend.
// It starts on the home screen (pointing at the Shed button) and finishes inside the Shed.
const shedCoach = createCoach({
  skipLabel:'Skip',
  onFinish(){ Save.data.shedTour = true; Save.commit(); },
});
export const shedTourActive = () => shedCoach.active;
export function stopShedTour(){ shedCoach.stop(); }
export function startShedTour(inShed){
  const steps = [
    { text:'You earned stars! Spend them in the Garden Shed on upgrades that help in every level.',
      target:'.nav-shed', until:'shedOpen' },
    { text:'This is how many stars you have to spend. Beat levels with more crops left to earn up to 3 stars each.',
      target:'.star-count', button:'Next' },
    { text:'Each upgrade costs stars, shown on its button. Tap one you can afford to buy it.',
      target:() => document.querySelector('.perk button:not([disabled])'), until:'perk' },
    { text:'Bought! The bars under an upgrade show how many tiers you own. Changed your mind? Refund all stars any time and pick again.',
      target:'[data-go="refund"]', button:'Got it' },
  ];
  shedCoach.start(inShed ? steps.slice(1) : steps);
}
