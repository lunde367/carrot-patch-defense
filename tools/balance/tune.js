// Tune: find how tough each level's pests should be so a typical player hits a target 3-star rate.
//
//   node tools/balance/tune.js                   every level (except the tutorial and Leafy Heads)
//   node tools/balance/tune.js --from 9 --to 17  just some levels
//   node tools/balance/tune.js --runs 30         more games per try (steadier, slower)
//
// The player is the "balanced" bot that never watches ads, with the Shed bought the typical way,
// spraying and fertilizing when it makes sense (the same "no ads" player as ads.js).
// For each level it binary-searches the toughness (pest health multiplier) whose 3-star rate is
// closest to the target, while also keeping wins at 90% or more. It prints a ready-to-paste
// TOUGHNESS array; nothing is changed automatically.
//
// Defender skills: the tuned-for player earns about one challenge star per level beaten and spends
// them (TREES below). A second check keeps the game winnable for someone who never replays for
// challenge stars and so owns no skills: that player must still win at least 80% of the time.
// Targets: a gentle start, a little harder each part, and each garden's last level a bit harder.
import { G, startLevel, startWave, update, starsFor } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { LEVELS } from '../../web/js/data/levels.js';
import { perkValues } from '../../web/js/data/perks.js';
import { shop, starsBefore, skillShop, chalBefore } from './shed.js';
import { skillValues } from '../../web/js/data/skills.js';
import { STRATEGIES, preparePath, maybeSpray, maybeFertilize } from './bots.js';

const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? +process.argv[i+1] : def; };
const RUNS = arg('runs', 20), FROM = arg('from', 2), TO = arg('to', LEVELS.length-1);
const DT = 1/30, TREES = arg('trees', 1), FLOOR = .8;
const mulberry32 = a => () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

export function target(L){
  const byPart = { 1:.75, 2:.65, 3:.55, 4:.6 }[L.ch.act] ?? .6;
  return byPart - (L.li===2 ? .1 : 0);
}

function play(gi, seed, trees=TREES){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  startLevel(gi, 1, 0, { ...perkValues(shop(starsBefore(gi, 2.5), gi).owned), skills:skillValues(skillShop(chalBefore(gi, trees), gi)) }); preparePath();
  const S = G.S, avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  for (let w=0; w<LEVELS[gi].waves; w++){
    STRATEGIES.balanced(avail, w+1, rnd);
    if (!startWave()) break;
    let t=0, next=0;
    while (S.mode==='play' && S.active && t<900){ update(DT); t+=DT; if (t>=next){ next=t+.5; maybeFertilize(); maybeSpray(); } }
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won';
  return { won, three: won && starsFor(S.maxLives-S.lives, S.maxLives)===3 };
}
function rates(gi, mul){
  const L=LEVELS[gi], old=L.hpMul; L.hpMul=mul;
  const g=[...Array(RUNS)].map((_,i) => play(gi, 3000+i));
  const win=g.filter(x=>x.won).length/RUNS, three=g.filter(x=>x.three).length/RUNS;
  // only bother checking the no-skills player when the main player passes
  const bare = win>=.9 ? [...Array(RUNS)].map((_,i) => play(gi, 4000+i, 0)).filter(x=>x.won).length/RUNS : 0;
  L.hpMul=old;
  return { win, three, bare };
}

const out = {};
for (const L of LEVELS.slice(FROM, TO+1)){
  const goal = target(L);
  let lo = L.hpMul*.4, hi = L.hpMul*2.5;
  for (let k=0; k<9; k++){
    const m=(lo+hi)/2, r=rates(L.gi, m);
    if (r.three>=goal && r.win>=.9 && r.bare>=FLOOR) lo=m; else hi=m;
  }
  const r = rates(L.gi, lo);
  out[L.gi] = +lo.toFixed(2);
  console.log(`${String(L.gi).padStart(2)} ${L.name.padEnd(17)} ${String(L.hpMul).padStart(6)} → ${out[L.gi].toFixed(2).padStart(6)}   target 3★ ${Math.round(goal*100)}%, got ${Math.round(r.three*100)}%, wins ${Math.round(r.win*100)}%, no-skills wins ${Math.round(r.bare*100)}%`);
}
console.log('\nJSON ' + JSON.stringify(out));
