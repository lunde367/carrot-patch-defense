// Super check: do Super defenders make the game too easy?
//
//   node tools/balance/super.js                        every level on Normal, 6 games per way per player
//   node tools/balance/super.js --diff hard --from 15 --to 35 --runs 8
//   node tools/balance/super.js --players none,spread         only some of the players
//
// Plays every level with the expert bot four times over, each with a different player's defender skills:
//   none    no skills at all (never replays for challenge stars)
//   spread  one challenge star per level beaten, spread over many defenders the way most people shop (no Supers)
//   rush    two challenge stars per level beaten, all poured into one defender at a time, Super first chance it gets;
//           in the garden it upgrades a defender all the way to Super the moment it can afford to
//   maxed   every skill and every Super already owned, and rushes Supers in the garden the same way
//   maxcalm every skill and every Super owned, but plays the expert's normal way (grows a Super only when it's worth it)
// and prints win rate, 3-star rate, crops lost, and how many Super defenders the bot actually grew.
import { G, DIFFICULTY, startLevel, startWave, update, starsFor, canUpgrade, upgrade, upCostOf } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { LEVELS } from '../../web/js/data/levels.js';
import { perkValues } from '../../web/js/data/perks.js';
import { shop, starsBefore, skillShop, chalBefore } from './shed.js';
import { SKILLS, SKILL_COSTS, SUPER_COST, skillValues } from '../../web/js/data/skills.js';
import { STRATEGIES, preparePath, expertDuringWave, expertSpray, expertCompost } from './bots.js';
import { on } from '../../web/kit/js/events.js';

const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? +process.argv[i+1] : def; };
const sarg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? process.argv[i+1] : def; };
const RUNS = arg('runs', 6), FROM = arg('from', 0), TO = arg('to', LEVELS.length-1), DT = 1/30;
const DIFF = sarg('diff', 'normal'), ONLY = sarg('players', ''); G.diff = DIFFICULTY[DIFF].hp;
const mulberry32 = a => () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

// The defenders a rusher builds up, most useful first.
const RUSH = ['pine','bunny','rose','owl','squirrel','sprinkler','cow','scarecrow','sunflower','hive','barrel'];
function rushShop(stars, gi){
  const owned={};
  for (const type of RUSH){ if (TYPES[type].unlock > gi) continue; const o = owned[type] = {};
    for (let n=0; n<SKILL_COSTS.length; n++) for (const br of SKILLS[type]){ if ((o[br.id]||0)===n && stars>=SKILL_COSTS[n]){ stars-=SKILL_COSTS[n]; o[br.id]=n+1; } }
    if ((o.a||0)>=3 && (o.b||0)>=3 && stars>=SUPER_COST){ stars-=SUPER_COST; o.s=1; }
    if (!o.s) break; }
  return owned;
}
const maxedShop = gi => Object.fromEntries(Object.keys(SKILLS).filter(k => TYPES[k].unlock<=gi).map(k => [k, { a:3, b:3, s:1 }]));
const PLAYERS = {
  none:   () => ({}),
  spread: gi => skillShop(chalBefore(gi, 1), gi),
  rush:   gi => rushShop(chalBefore(gi, 2), gi),
  maxed:  gi => maxedShop(gi),
  maxcalm:gi => maxedShop(gi),
};
const RUSHES = { rush:true, maxed:true };
// Rushing: any defender that can grow into a Super gets every upgrade it can afford, highest first.
// It saves up for those upgrades instead of planting anything new, once it has two fighters down.
// Returns true when it is still saving (so nothing else should be bought yet).
function rushUp(){
  const S=G.S, can = t => S.perks.skills[t.type] && S.perks.skills[t.type].super && canUpgrade(t);
  for (;;){ const c=S.towers.filter(can).sort((a,b)=>b.lv-a.lv)[0];
    if (!c) return false;
    if (S.towers.filter(t=>!TYPES[t.type].support && t.type!=='sunflower').length<2) return false;
    if (S.seeds<upCostOf(c)) return true;
    if (!upgrade(c)) return false; }
}

let supers = 0; on('upgrade', t => { if (t.lv===3) supers++; });
function play(gi, seed, who, way){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  startLevel(gi, 1, 0, { ...perkValues(shop(starsBefore(gi, 2.8), gi).owned), skills:skillValues(PLAYERS[who](gi)) }); preparePath();
  const S = G.S, avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  supers = 0;
  for (let w=0; w<LEVELS[gi].waves; w++){
    if (!(RUSHES[who] && rushUp())) STRATEGIES[way==='value'?'expert':'balanced'](avail, w+1, rnd);
    if (!startWave()) break;
    let t=0, next=0, buy=2;
    while (S.mode==='play' && S.active && t<900){ update(DT); t+=DT;
      if (t>=next){ next=t+.5; expertCompost(); expertSpray(); }
      if (t>=buy){ buy=t+2; if (RUSHES[who] && rushUp()) continue; if (way==='value') expertDuringWave(avail); else STRATEGIES.balanced(avail, w+1, rnd); } }
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won', lost = S.maxLives - S.lives;
  return { won, three: won && starsFor(lost, S.maxLives)===3, lost, supers };
}
const pct = x => `${Math.round(x*100)}%`.padStart(4);
console.log(`Super check: ${DIFFICULTY[DIFF].name}, ${RUNS} games per way per player. Each cell: win · 3★ · crops lost (Supers grown per game)\n`);
console.log('                     ' + Object.keys(PLAYERS).filter(p => !ONLY || ONLY.split(',').includes(p)).map(p=>p.padEnd(23)).join(''));
const tot = Object.fromEntries(Object.keys(PLAYERS).map(p=>[p,{win:0,three:0,lost:0,sup:0,n:0}]));
for (const L of LEVELS.slice(FROM, TO+1)){
  const cells=[];
  for (const who of Object.keys(PLAYERS).filter(p => !ONLY || ONLY.split(',').includes(p))){
    // the expert plays both of its ways and keeps the better one, like a person learning the level
    let best=null;
    for (const way of ['value','mixed']){ const g=[...Array(RUNS)].map((_,i)=>play(L.gi, 9000+i, who, way));
      const r={ win:g.filter(x=>x.won).length/RUNS, three:g.filter(x=>x.three).length/RUNS, lost:g.reduce((s,x)=>s+x.lost,0)/RUNS, sup:g.reduce((s,x)=>s+x.supers,0)/RUNS };
      if (!best || r.win*100-r.lost > best.win*100-best.lost) best=r; }
    const T=tot[who]; T.win+=best.win; T.three+=best.three; T.lost+=best.lost/L.lives; T.sup+=best.sup; T.n++;
    cells.push(`${pct(best.win)} ${pct(best.three)} ${best.lost.toFixed(1).padStart(4)} (${best.sup.toFixed(1)})`.padEnd(23));
  }
  console.log(`${String(L.gi).padStart(2)} ${L.name.padEnd(18)}${cells.join('')}`);
}
console.log('\nAverage              ' + Object.entries(tot).filter(([p])=>!ONLY||ONLY.split(',').includes(p)).map(([,T])=>T).map(T=>`${pct(T.win/T.n)} ${pct(T.three/T.n)} ${(T.lost/T.n*100).toFixed(0).padStart(3)}%lost (${(T.sup/T.n).toFixed(1)})`.padEnd(24)).join(''));
