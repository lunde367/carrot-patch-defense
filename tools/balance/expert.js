// Expert check: a much smarter robot player than the "balanced" one, to stand in for a skilled person.
//
//   node tools/balance/expert.js                       every level on Normal, 12 games each
//   node tools/balance/expert.js --diff hard           on Hard (or easy)
//   node tools/balance/expert.js --from 9 --to 17 --runs 20
//   node tools/balance/expert.js --noskills            the expert never sprays or composts
//   node tools/balance/expert.js --endless             how many Endless Garden waves each player clears
//
// The expert stands in for a skilled person who learns a level: it knows three ways to play
// (the value-counting plan, the steady mixed plan with sharper timing, and the plain balanced plan),
// practices each a few times on a level, and then plays the one that went best.
// Prints the expert next to the balanced bot: wins, three-star rate, and crops lost on average.
import { writeFileSync, mkdirSync } from 'node:fs';
import { G, DIFFICULTY, startLevel, startWave, update, starsFor } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { LEVELS, ENDLESS } from '../../web/js/data/levels.js';
import { perkValues } from '../../web/js/data/perks.js';
import { shop, starsBefore } from './shed.js';
import { STRATEGIES, preparePath, maybeSpray, maybeFertilize, expertDuringWave, expertSpray, expertCompost } from './bots.js';

const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? +process.argv[i+1] : def; };
const sarg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? process.argv[i+1] : def; };
const RUNS = arg('runs', 12), FROM = arg('from', 0), TO = arg('to', LEVELS.length-1), DT = 1/30;
const DIFF = sarg('diff', 'normal'), SKILLS = !process.argv.includes('--noskills');
G.diff = DIFFICULTY[DIFF].hp;
const mulberry32 = a => () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

function play(level, seed, who, maxWaves=Infinity){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  const gi = level.gi, stars = starsBefore(Math.min(gi, LEVELS.length), who==='balanced' ? 2.5 : 2.8);
  startLevel(level.endless ? level : gi, 1, 0, perkValues(shop(stars, gi).owned)); preparePath();
  const S = G.S, avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi), waves = Math.min(level.waves, maxWaves);
  const plan = who==='value' ? 'expert' : 'balanced', sharp = who!=='balanced';
  for (let w=0; w<waves; w++){
    STRATEGIES[plan](avail, w+1, rnd);
    if (!startWave()) break;
    let t=0, next=0, buy=2;
    while (S.mode==='play' && S.active && t<900){ update(DT); t+=DT;
      if (t>=next){ next=t+.5; if (SKILLS){ if (sharp){ expertCompost(); expertSpray(); } else { maybeFertilize(); maybeSpray(); } } }
      if (sharp && t>=buy){ buy=t+2; if (who==='value') expertDuringWave(avail); else STRATEGIES.balanced(avail, w+1, rnd); } }   // keeps spending during the wave
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won', lost = S.maxLives - S.lives;
  return { won, three: won && starsFor(lost, S.maxLives)===3, lost, wave:S.wave - (S.mode==='lost'?1:0) };
}
// The expert practices each way of playing, then sticks with the best one for this level.
const WAYS = ['value','mixed','balanced'], PRACTICE = 4;
function expertWay(level, maxWaves){
  let best=null, bs=-Infinity;
  for (const way of WAYS){ let sc=0; for (let i=0;i<PRACTICE;i++){ const g=play(level, 500+i, way, maxWaves); sc += level.endless ? g.wave : (g.won?100:0) - g.lost; }
    if (sc>bs){ bs=sc; best=way; } }
  return best;
}
const pct = x => `${Math.round(x*100)}%`.padStart(4);
if (process.argv.includes('--endless')){
  for (const who of ['balanced','expert']){ const way = who==='expert' ? expertWay(ENDLESS, 80) : who;
    const g=[...Array(RUNS)].map((_,i)=>play(ENDLESS, 9000+i, way, 80).wave).sort((a,b)=>a-b);
    console.log(`${who.padEnd(9)} Endless Garden waves cleared: worst ${g[0]}, middle ${g[Math.floor(g.length/2)]}, best ${g[g.length-1]}`); }
  process.exit(0);
}
console.log(`Expert check: ${DIFFICULTY[DIFF].name}, ${RUNS} games per player per level${SKILLS?'':', no skills'}\n`);
console.log('                        balanced bot      expert bot\n                        win   3★          win   3★   crops lost     plays');
const rows=[];
for (const L of LEVELS.slice(FROM, TO+1)){
  const r={};
  const way = expertWay(L);
  for (const who of ['balanced','expert']){ const g=[...Array(RUNS)].map((_,i)=>play(L, 9000+i, who==='expert' ? way : who));
    r[who]={ win:g.filter(x=>x.won).length/RUNS, three:g.filter(x=>x.three).length/RUNS, lost:g.reduce((s,x)=>s+x.lost,0)/RUNS }; }
  rows.push({ gi:L.gi, name:L.name, way, ...r });
  console.log(`${String(L.gi).padStart(2)} ${L.name.padEnd(19)} ${pct(r.balanced.win)} ${pct(r.balanced.three)}         ${pct(r.expert.win)} ${pct(r.expert.three)}   ${r.expert.lost.toFixed(1).padStart(5)} of ${String(L.lives).padEnd(3)}    ${way}`);
}
const avg=(w,k)=>rows.reduce((s,r)=>s+r[w][k],0)/rows.length;
console.log(`\nAverage: balanced win ${pct(avg('balanced','win'))}, 3★ ${pct(avg('balanced','three'))}  ·  expert win ${pct(avg('expert','win'))}, 3★ ${pct(avg('expert','three'))}`);
mkdirSync(new URL('./reports/', import.meta.url), { recursive:true });
writeFileSync(new URL(`./reports/expert-${DIFF}${SKILLS?'':'-noskills'}.json`, import.meta.url), JSON.stringify(rows, null, 1));
