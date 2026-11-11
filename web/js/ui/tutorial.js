// First-level tutorial, run by the kit's coach. Each step waits for the player to do one thing.
import { createCoach } from '../../kit/js/coach.js';
import { G, upCostOf } from '../engine/game.js';
import { Save } from '../save.js';

const coach = createCoach({
  onFinish(){ Save.data.tutorialDone = true; Save.commit(); G.hint = null; allowed = null; onAllow(); },
});

export const tutorialActive = () => coach.active;
export function stopTutorial(){ coach.stop(); G.hint = null; allowed = null; }

// Which defenders the current step lets the player pick (null = any). The tray re-draws when it changes.
let allowed = null, onAllow = () => {};
export const tutorialAllows = key => !coach.active || !allowed || allowed.includes(key);
export const onTutorialAllow = fn => { onAllow = fn; };
const allow = list => { allowed = list; if (list && G.S && G.S.build && !list.includes(G.S.build)) G.S.build = null; onAllow(); };

export function startTutorial(){
  const bunnyOf = () => G.S.towers.find(t => t.type==='bunny');
  coach.start([
    { text:'Pests are coming for your cabbages! Tap the Carrot Bunny to pick it.',
      target:'#card-bunny', until:'pickTower', when:k => k==='bunny', enter(){ allow(['bunny']); } },
    { text:'Now tap the glowing spot to plant it beside the path.',
      target:'#board', place:'over', until:'plant',
      enter(){ G.hint = { c:2, r:1 }; }, leave(){ G.hint = null; } },
    { text:'Add a Sprinkler too. It soaks pests and slows them down. Tap it, then the glowing spot.',
      target:'#card-sprinkler', until:'plant', when:t => t.type==='sprinkler',
      enter(){ allow(['sprinkler']); G.hint = { c:4, r:3 }; }, leave(){ G.hint = null; } },
    { text:'Ready? Tap Start wave.', target:'#go', until:'waveStart', enter(){ allow([]); } },
    { text:'Your defenders fight on their own. Every pest you squash drops seeds.', until:'waveClear', enter(){ allow(null); } },
    { text:'Nice! Tap your bunny to see what it can do.', target:'#board', place:'over', until:'select', when:t => t && t.type==='bunny',
      enter(){ const b = bunnyOf(); if (b) G.hint = { c:b.c, r:b.r }; }, leave(){ G.hint = null; } },
    { text:'Tap Upgrade. Upgraded defenders hit harder and reach farther.', target:'#iUp', until:'upgrade',
      enter(){ const b = G.S.sel; if (b && G.S.seeds < upCostOf(b)) G.S.seeds = upCostOf(b); } },
    { text:'That’s it! Keep planting and upgrading. The Fat Slug shows up on wave 8. Beat levels to earn stars and unlock new defenders.',
      button:'Let’s go' },
  ]);
}
