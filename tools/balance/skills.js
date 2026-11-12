// Skill check: how much do the Sprayer and Fertilizer matter? Plays each level twice with the same
// "balanced" no-ads player: once using both skills when it makes sense, once never touching them.
//
//   node tools/balance/skills.js                 every level
//   node tools/balance/skills.js --from 2 --to 8 --runs 30
//   node tools/balance/skills.js --diff hard     the same, on another difficulty
import { G, DIFFICULTY, startLevel, startWave, update, starsFor } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { LEVELS } from '../../web/js/data/levels.js';
import { perkValues } from '../../web/js/data/perks.js';
import { shop, starsBefore } from './shed.js';
import { STRATEGIES, preparePath, maybeSpray, maybeFertilize } from './bots.js';

const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? +process.argv[i+1] : def; };
const RUNS = arg('runs', 20), FROM = arg('from', 0), TO = arg('to', LEVELS.length-1), DT = 1/30;
{ const i=process.argv.indexOf('--diff'); if (i>0) G.diff = DIFFICULTY[process.argv[i+1]].hp; }   // --diff easy|normal|hard
const mulberry32 = a => () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

function play(gi, seed, skills){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  startLevel(gi, 1, 0, perkValues(shop(starsBefore(gi, 2.5), gi).owned)); preparePath();
  const S = G.S, avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  for (let w=0; w<LEVELS[gi].waves; w++){
    STRATEGIES.balanced(avail, w+1, rnd);
    if (!startWave()) break;
    let t=0, next=0;
    while (S.mode==='play' && S.active && t<900){ update(DT); t+=DT; if (skills && t>=next){ next=t+.5; maybeFertilize(); maybeSpray(); } }
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won';
  return { won, three: won && starsFor(S.maxLives-S.lives, S.maxLives)===3 };
}
const pct = x => `${Math.round(x*100)}%`.padStart(4);
console.log('                       with skills    no skills\n                       win   3★       win   3★');
for (const L of LEVELS.slice(FROM, TO+1)){
  const r = [true,false].map(sk => { const g=[...Array(RUNS)].map((_,i)=>play(L.gi, 7000+i, sk)); return [g.filter(x=>x.won).length/RUNS, g.filter(x=>x.three).length/RUNS]; });
  console.log(`${String(L.gi).padStart(2)} ${L.name.padEnd(18)} ${pct(r[0][0])} ${pct(r[0][1])}     ${pct(r[1][0])} ${pct(r[1][1])}`);
}
