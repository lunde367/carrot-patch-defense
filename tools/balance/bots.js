// Robot players. Each one decides what to plant and upgrade between waves, the same way a
// person would, using only what the game allows (seeds, unlocked defenders, open grass).
import { G, plantAt, upgrade, costOf, upCostOf, towerAt, spray, sprayReady, sprayStats } from '../../web/js/engine/game.js';
import { PLANTS, SPRAY } from '../../web/js/data/spray.js';
import { path, pointAt, laneTotal, buildable, bonusAt } from '../../web/js/engine/path.js';
import { HILL, fertReady, fertilize, clearCost, clearScenery } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { ENEMY } from '../../web/js/data/enemies.js';
import { COLS, ROWS } from '../../web/js/data/levels.js';

const ATTACKERS = ['bunny','rose','squirrel','sprinkler','pine','owl','ladybug'];

// Points along the path, used to judge how much of it a spot can reach.
let samples = [];
export function preparePath(){
  samples = [];
  for (let li=0; li<path.lanes.length; li++){ const T=laneTotal(li); for (let d=0.6; d<T; d+=0.25){ const [x,y]=pointAt(d,li); samples.push({x,y,w:(.6+.8*d/T)/Math.sqrt(path.lanes.length)}); } }
}
function coverage(c, r, range, fliersOnly=false){
  const x=c+.5, y=r+.5; let s=0;
  if (bonusAt(c,r)==='hill') range*=HILL;                      // hills reach farther
  for (const p of samples) if (Math.hypot(p.x-x,p.y-y)<=range) s+=p.w;
  return bonusAt(c,r)==='sunny' ? s*1.1 : s;                    // sunny spots work faster
}
function freeCells(){
  const out=[];
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++) if (buildable(c,r) && !towerAt(c,r)) out.push([c,r]);
  return out;
}
// Best open spot for a defender; sunflowers go wherever no defender would want to stand.
function bestCell(type, rnd=null){
  const cells=freeCells(); if (!cells.length) return null;
  if (type==='sunflower'){ const sunny=cells.find(([c,r])=>bonusAt(c,r)==='sunny'); if (sunny) return sunny;
    let best=null, bs=Infinity; for (const [c,r] of cells){ const s=coverage(c,r,2.5); if (s<bs){ bs=s; best=[c,r]; } } return best; }
  // helpers go where they reach the most of what they help
  if (type==='hive' || type==='barrel'){
    const want = type==='hive' ? (t=>t.type!=='sunflower'&&t.type!=='hive'&&t.type!=='barrel') : (t=>['rose','sunflower','pine'].includes(t.type));
    const R=TYPES[type].range[0]*G.S.perks.rangeMul; let best=null, bs=-1;
    for (const [c,r] of cells){ const n=G.S.towers.filter(t=>want(t)&&Math.hypot(t.x-(c+.5),t.y-(r+.5))<=R).length; if (n>bs){ bs=n; best=[c,r]; } }
    return best;
  }
  const range=TYPES[type].range[0]*G.S.perks.rangeMul;
  const scored=cells.map(([c,r])=>({c,r,s:coverage(c,r,range)})).sort((a,b)=>b.s-a.s);
  const pick = rnd ? scored[Math.floor(rnd()*Math.min(8,scored.length))] : scored[0];
  return [pick.c, pick.r];
}
function place(type, rnd){
  const S=G.S; if (S.seeds<costOf(type)) return false;
  const cell=bestCell(type, rnd); if (!cell) return false;
  S.build=type; const res=plantAt(cell[0],cell[1]); S.build=null;
  return res.ok;
}
// Upgrade the defender standing on the most path, if affordable.
function upgradeBest(filter=()=>true){
  const S=G.S;
  // only fighters get upgraded first; helpers (scarecrow, hive, barrel) only once every fighter is maxed
  const fighter = t => ATTACKERS.includes(t.type);
  let cands=S.towers.filter(t=>t.lv<2 && fighter(t) && filter(t) && S.seeds>=upCostOf(t));
  if (!cands.length) cands=S.towers.filter(t=>t.lv<2 && t.type!=='sunflower' && !fighter(t) && filter(t) && S.seeds>=upCostOf(t) && S.towers.filter(fighter).every(f=>f.lv>=2));
  if (!cands.length) return false;
  cands.sort((a,b)=>coverage(b.c,b.r,TYPES[b.type].range[b.lv])-coverage(a.c,a.r,TYPES[a.type].range[a.lv]));
  return upgrade(cands[0]);
}
const count = type => G.S.towers.filter(t=>t.type===type).length;
// does this level send any flying pests (directly, grown up, or hatched by a boss)?
const levelHasFliers = () => { const L=G.LV, kinds=new Set([L.boss, ...L.pool.map(p=>p[0])]);
  for (const k of [...kinds]){ const D=ENEMY[k]; if (D.adult) kinds.add(D.adult); if (D.spawns) kinds.add(D.spawns.type); }
  return [...kinds].some(k=>ENEMY[k].fly); };
const attackers = avail => ATTACKERS.filter(k=>avail.includes(k));

// Each strategy: spend(available defenders, wave number about to start, random fn)
export const STRATEGIES = {
  // A sensible player: a mix of defenders, one sunflower early, upgrades once there are enough.
  balanced(avail, wave){
    maybeClear(wave);
    const atk=attackers(avail);
    for (let guard=0; guard<40; guard++){
      if (avail.includes('sunflower') && wave<=2 && count('sunflower')===0 && place('sunflower')) continue;
      if (avail.includes('scarecrow') && levelHasFliers() && wave>=2 && count('scarecrow')<Math.min(3, 1+Math.floor(wave/3)) && place('scarecrow')) continue;
      if (avail.includes('barrel') && G.CH.drought && wave>=2 && count('barrel')<Math.min(3, Math.floor(wave/2)) && place('barrel')) continue;
      if (avail.includes('hive') && wave>=3 && count('hive')<Math.min(2, Math.floor(wave/3)) && place('hive')) continue;
      const want = 3 + Math.floor(wave*.8);
      const n = G.S.towers.filter(t=>t.type!=='sunflower' && !TYPES[t.type].support).length;
      // try the defender we have fewest of; if it can't go anywhere (or costs too much), try the next one
      const order = atk.slice().sort((a,b)=>count(a)-count(b)), placeAny = () => order.some(k=>place(k));
      if (n < want){
        if (placeAny()) continue;
        if (upgradeBest()) continue;
        break;
      }
      if (upgradeBest()) continue;
      if (placeAny()) continue;
      break;
    }
  },
  // Lots of defenders, never upgrades.
  spammer(avail){
    const atk=attackers(avail);
    for (let guard=0; guard<60; guard++){
      const next=atk.slice().sort((a,b)=>count(a)-count(b)||costOf(a)-costOf(b));
      if (!next.some(k=>place(k))) break;
    }
  },
  // Few defenders, upgraded as high as possible.
  upgrader(avail){
    const atk=attackers(avail);
    for (let guard=0; guard<40; guard++){
      if (upgradeBest()) continue;
      if (G.S.towers.length<3 + Math.floor(G.S.wave/3) && place(atk[G.S.towers.length % atk.length])) continue;
      if (G.S.towers.every(t=>t.lv>=2) && place(atk[G.S.towers.length % atk.length])) continue;
      break;
    }
  },
  // A sloppy beginner: random choices, decent-but-not-best spots.
  random(avail, wave, rnd){
    for (let guard=0; guard<40; guard++){
      const roll=rnd();
      if (roll<.25 && upgradeBest(()=>rnd()<.5)) continue;
      const type=avail[Math.floor(rnd()*avail.length)];
      if (place(type, rnd)) continue;
      if (rnd()<.5) break;
      if (!avail.some(k=>G.S.seeds>=costOf(k))) break;
    }
  },
};
// One-defender-only players, to find defenders that are too strong or too weak.
export function monoStrategy(type){
  return function(avail, wave){
    for (let guard=0; guard<40; guard++){
      if (count(type) < 3 + Math.floor(wave*.8) && place(type)) continue;
      if (upgradeBest(t=>t.type===type)) continue;
      if (place(type)) continue;
      break;
    }
  };
}
export const MONO_TYPES = ATTACKERS;

// Sprayer use during a wave: when a pest gets close to the crops, spray where it hits the most
// pests and wilts the fewest plants. Called every half second of game time.
export function maybeSpray(){
  const S=G.S; if (!sprayReady() || !S.enemies.length) return false;
  const { radius } = sprayStats();
  const live = S.enemies.filter(e => !e.dead && !e.under && e.dist>0.3);
  const danger = live.filter(e => e.dist > laneTotal(e.lane)*.72);
  if (!danger.length) return false;
  let best=null, bestScore=0;
  for (const c of danger){
    const pests = live.filter(e => Math.hypot(e.x-c.x, e.y-c.y) <= radius).length;
    const plants = S.towers.filter(t => PLANTS.includes(t.type) && Math.hypot(t.x-c.x, t.y-c.y) <= radius*SPRAY.drift).length;
    const score = pests - plants*1.5;
    if (score > bestScore){ bestScore=score; best=c; }
  }
  if (!best) return false;
  return !!spray(best.x, best.y);
}

// Fertilizer: use it when a crowd or a boss is on the board. Every bot does this; it has no downside.
export function maybeFertilize(){
  const S=G.S; if (!fertReady()) return;
  const live=S.enemies.filter(e=>e.hp>0);
  if (live.length>=5 || live.some(e=>ENEMY[e.type].boss)) fertilize();
}

// Clearing: early on, if a rock (or stump, fire...) sits on a clearly better spot than any open
// one, pay to clear it. At most one a wave, and only with seeds to spare for a defender after.
export function maybeClear(wave){
  const S=G.S; if (wave>5) return false;
  const R=TYPES.bunny.range[0]*S.perks.rangeMul;
  let bestFree=0;
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++) if (buildable(c,r) && !S.towers.some(t=>t.c===c&&t.r===r)) bestFree=Math.max(bestFree, coverage(c,r,R));
  let pick=null, ps=0;
  for (const o of path.scenery){ if (o.w*o.h>1) continue; const v=coverage(o.c,o.r,R); if (v>ps){ ps=v; pick=o; } }
  if (pick && ps>bestFree*1.15 && S.seeds>=clearCost(pick)+TYPES.bunny.cost) return clearScenery(pick);
  return false;
}
