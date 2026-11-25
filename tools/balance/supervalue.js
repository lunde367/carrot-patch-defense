// Super value check: is each Super upgrade worth its seeds?
//
//   node tools/balance/supervalue.js                 the usual set of test levels, 3 runs each
//   node tools/balance/supervalue.js --levels 13,23,31 --runs 5
//   node tools/balance/supervalue.js --types squirrel,cow
//
// For each defender, plays a level's waves with a small fixed team (two Pine Trees and two Bunnies, fully grown)
// plus the defender being tested, and never builds anything else. Crops can't run out, so every wave is played.
// Three gardens are compared:
//   base    the team + one fully grown (level 3) defender
//   super   the team + that defender grown into its Super
//   copy    the team + two fully grown copies of the defender
// "Worth" compares what the Super upgrade adds per seed with what a second copy adds per seed:
// 1.0 means the Super is exactly as good a use of seeds as building another one; below about 0.7 it's a poor buy,
// above about 1.6 it's a must-buy that makes everything else look pointless.
import { G, DIFFICULTY, startLevel, startWave, update, upgrade, plantAt, costOf, upCostOf } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { LEVELS } from '../../web/js/data/levels.js';
import { ENEMY } from '../../web/js/data/enemies.js';
import { perkValues } from '../../web/js/data/perks.js';
import { skillValues } from '../../web/js/data/skills.js';
import { laneTotal } from '../../web/js/engine/path.js';
import { preparePath, bestCell } from './bots.js';

const arg = (n, d) => { const i=process.argv.indexOf('--'+n); return i>0 ? process.argv[i+1] : d; };
const RUNS = +arg('runs', 3), ONLY = arg('types', ''), LVS = arg('levels', '13,20,23,26,31,34').split(',').map(Number), DT = 1/30;
G.diff = DIFFICULTY.normal.hp;
const mulberry32 = a => () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const ALL = Object.fromEntries(Object.keys(TYPES).map(k => [k, { a:3, b:3, s:1 }]));
const fullCost = type => TYPES[type].cost + TYPES[type].up[0] + TYPES[type].up[1];

function plant(type, lv){
  const S=G.S, cell=bestCell(type); if (!cell) return null;
  S.build=type; const r=plantAt(cell[0], cell[1]); S.build=null; if (!r.ok) return null;
  while (r.tower.lv < lv && upgrade(r.tower));
  return r.tower;
}
function run(gi, seed, type, variant){
  Math.random = mulberry32(seed);
  startLevel(gi, 1, 0, { ...perkValues({}), skills:skillValues(ALL) }); preparePath();
  const S=G.S; S.seeds=1e6; S.lives=S.maxLives=1e6;
  for (const k of ['pine','pine','bunny','bunny']) plant(k, 2);
  if (variant==='copy'){ plant(type, 2); plant(type, 2); } else plant(type, variant==='super' ? 3 : 2);
  S.seeds=0;
  let dmg=0, leaks=0, seeds=0;
  for (let w=0; w<LEVELS[gi].waves; w++){
    const s0=S.seeds; if (!startWave()) break; let t=0;
    while (S.active && S.mode==='play' && t<600){
      const before=new Map(S.enemies.map(e=>[e,e.hp]));
      update(DT); t+=DT;
      for (const [e,hp] of before){ if (S.enemies.includes(e)) { if (e.hp<hp) dmg+=hp-e.hp; }
        else if (e.dist>=laneTotal(e.lane)) leaks++; else dmg+=Math.max(0,hp); } }
    seeds+=S.seeds-s0;
  }
  return { dmg, leaks, seeds };
}
const avg = (gi, type, v) => { const r=[...Array(RUNS)].map((_,i)=>run(gi, 300+i, type, v)); return { dmg:r.reduce((s,x)=>s+x.dmg,0)/RUNS, leaks:r.reduce((s,x)=>s+x.leaks,0)/RUNS, seeds:r.reduce((s,x)=>s+x.seeds,0)/RUNS }; };

console.log(`Super value check on levels ${LVS.join(', ')}, Normal, ${RUNS} runs each.\n`);
console.log('defender     Super upgrade   damage +super  +copy    leaks base/super/copy    worth');
const out=[];
for (const type of Object.keys(TYPES).filter(k => !ONLY || ONLY.split(',').includes(k))){
  let b={dmg:0,leaks:0,seeds:0}, s={...b}, c={...b}; let n=0;
  for (const gi of LVS){ if (TYPES[type].unlock > gi) continue; n++;
    const A=avg(gi,type,'base'), B=avg(gi,type,'super'), C=avg(gi,type,'copy');
    for (const [o,x] of [[b,A],[s,B],[c,C]]) for (const k in o) o[k]+=x[k]; }
  if (!n) continue;
  const supCost=TYPES[type].up[2], copyCost=fullCost(type);
  // seeds count as damage-equivalents for the Sunflower; leaks stopped count for helpers through the team's damage
  const val = o => o.dmg + (type==='sunflower' ? o.seeds*6 : 0);
  const gS=(val(s)-val(b))/n, gC=(val(c)-val(b))/n, worth=(gS/supCost)/(gC/copyCost);
  out.push({ type, worth });
  console.log(`${type.padEnd(12)} ${String(supCost).padStart(5)} seeds   ${(gS>0?'+':'')+Math.round(gS)}`.padEnd(42)+`${(gC>0?'+':'')+Math.round(gC)}`.padEnd(9)+`${(b.leaks/n).toFixed(0)}/${(s.leaks/n).toFixed(0)}/${(c.leaks/n).toFixed(0)}`.padEnd(25)+`${isFinite(worth)?worth.toFixed(2):'n/a'}`);
}
