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
const levelHasFliers = () => { const L=G.LV, kinds=new Set([L.boss, ...(L.bosses||[]), ...L.pool.map(p=>p[0])].filter(Boolean));
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

// ---------------------------------------------------------------------------------------------
// The expert: plays like a careful, experienced person. For every seed it asks "what gives me the
// most extra damage along the path?" and compares planting each kind of defender on its best spot
// with every possible upgrade. It reads the level (how many pests fly, wear armor, come in crowds),
// plants Sunflowers only when they'll pay back, puts helpers where they help the most, saves up
// for a clearly better buy, and keeps spending while a wave is running.
// ---------------------------------------------------------------------------------------------
const covCache = new Map();
function cov(c, r, range){ const k=G.LV.gi+'|'+samples.length+'|'+c+','+r+'|'+range.toFixed(2); let v=covCache.get(k); if (v==null){ v=coverage(c,r,range); if (covCache.size>60000) covCache.clear(); covCache.set(k,v); } return v; }
// What the coming pests look like: share that fly, average armor, and how crowded waves are.
function forecast(wave){
  const L=G.LV, pool=L.pool.filter(p=>p[1]<=wave+1); let w=0, fly=0, armor=0, small=0, hp=0; const sc=(1+.2*(wave-1)+.015*(wave-1)*(wave-1))*L.hpMul*(G.diff||1);
  for (const p of (pool.length?pool:L.pool)){ const D=ENEMY[p[0]], A=D.adult?ENEMY[D.adult]:null, m=p[3]||0;
    const f = D.fly ? 1 : A && A.fly ? 1-m : 0;                      // nymphs fly for the rest of the path once grown
    w+=p[2]; fly+=p[2]*f; armor+=p[2]*((D.armor||0)*(A?m:1)+(A?(A.armor||0)*(1-m):0)); small+=p[2]*(D.hp<=16?1:0); hp+=p[2]*D.hp*sc; }
  const bossD = L.boss ? ENEMY[L.boss] : null, late = !L.endless && wave>=L.waves-2;
  return { hp:hp/w, fly:fly/w, armor:armor/w, small:small/w, crowd:Math.min(4, 1.4+wave*.25), bossFly:!!(bossD&&bossD.fly&&late), bossArmor:late&&bossD?(bossD.armor||0):0 };
}
// Damage per second a defender deals to the pests in its reach (before counting how much path it covers).
function power(type, lv, F){
  const T=TYPES[type]; if (!T.dmg) return 0;
  const armor = Math.max(F.armor, F.bossArmor*.5), hit = Math.min(Math.max(1, T.dmg[lv]-armor), F.hp*1.2 + (F.bossArmor||F.bossFly ? 30 : 0)),   // damage past a pest's health is wasted
    ground = T.ground ? (1-F.fly)*(F.bossFly?.6:1) : 1;
  let n = 1;
  if (type==='rose') n = Math.min(T.multi[lv], .6+F.crowd*.6);
  else if (type==='squirrel') n = 1+Math.min(T.bounce[lv], F.crowd-1)*.75;
  else if (type==='sprinkler') n = .5+F.crowd*.5;                     // hits everything in its (small) reach; the slow is valued separately
  else if (type==='pine') n = Math.min(2.2, .6+F.crowd*.3);
  else if (type==='ladybug') n = 1+F.small;
  else if (type==='owl') n = 1.15;                                    // picks the toughest pest: great against bosses
  return T.rate[lv]*hit*n*ground;
}
const rangeAt = (type, lv) => TYPES[type].range[lv]*G.S.perks.rangeMul;
const worth = (type, lv, c, r, F) => power(type, lv, F)*cov(c, r, rangeAt(type, lv));
// A Sprinkler's slow keeps pests in front of the defenders around it for longer (it doesn't stack with
// another Sprinkler nearby). In heat waves it also keeps its neighbors cool.
function slowBonus(c, r, F){
  const S=G.S, x=c+.5, y=r+.5;
  const other=S.towers.some(t=>t.type==='sprinkler' && (t.c!==c||t.r!==r) && Math.hypot(t.x-x,t.y-y)<2.6);
  const neighbors=S.towers.filter(t=>ATTACKERS.includes(t.type) && t.type!=='sprinkler' && Math.hypot(t.x-x,t.y-y)<=3).reduce((s,t)=>s+power(t.type,t.lv,F)*cov(t.c,t.r,rangeAt(t.type,t.lv)),0);
  return neighbors*((other?.1:.3)*(1-F.fly)*(F.bossFly?.6:1) + ((G.LV.heat||G.CH.heat) && !other ? .12 : 0));
}
function bestSpot(type, F){
  let best=null, bv=0; const R=rangeAt(type,0);
  for (const [c,r] of freeCells()){ let v=power(type,0,F)*cov(c,r,R); if (type==='sprinkler') v+=slowBonus(c,r,F); if (v>bv){ bv=v; best=[c,r]; } }
  return best && { cell:best, value:bv };
}
function expertSpend(avail, wave, { saving=true }={}){
  const S=G.S, F=forecast(wave), left = G.LV.endless ? 99 : G.LV.waves-wave+1;
  for (let guard=0; guard<60; guard++){
    const fighters=S.towers.filter(t=>ATTACKERS.includes(t.type)), opts=[];
    // Sunflowers: only while they still pay for themselves at least twice over, after two fighters are down.
    if (avail.includes('sunflower') && fighters.length>=2 && count('sunflower')<(left>=9?2:1)){
      const pay=TYPES.sunflower.income[0]*(left-1); if (pay>=costOf('sunflower')*1.15 && place('sunflower')) continue; }
    // a first one of each kind is worth a little extra: a mixed garden covers more situations
    for (const k of attackers(avail)){ const b=bestSpot(k,F); if (b) opts.push({ kind:'plant', type:k, cell:b.cell, gain:b.value*(count(k)===0?1.25:1), cost:costOf(k) }); }
    for (const t of S.towers){ if (t.lv>=2) continue;
      if (ATTACKERS.includes(t.type)) opts.push({ kind:'up', t, gain:(worth(t.type,t.lv+1,t.c,t.r,F)-worth(t.type,t.lv,t.c,t.r,F))*(fighters.length<4?.6:1), cost:upCostOf(t) });
      else if (t.type==='sunflower' && left>=4) opts.push({ kind:'up', t, gain:0, seeds:(TYPES.sunflower.income[t.lv+1]-TYPES.sunflower.income[t.lv])*(left-1), cost:upCostOf(t) }); }
    // Helpers, valued by what they add to the fighters around them.
    const near = (c,r,R,f) => fighters.filter(t=>f(t)&&Math.hypot(t.x-(c+.5),t.y-(r+.5))<=R).reduce((s,t)=>s+worth(t.type,t.lv,t.c,t.r,F),0);
    if (avail.includes('hive') && count('hive')<3){ const R=rangeAt('hive',0); let b=null,bv=0;
      for (const [c,r] of freeCells()){ const v=near(c,r,R,t=>hiveless(t))*(TYPES.hive.boost[0]-1); if (v>bv){ bv=v; b=[c,r]; } }
      if (b) opts.push({ kind:'plant', type:'hive', cell:b, gain:bv, cost:costOf('hive') }); }
    if (avail.includes('barrel') && G.CH.drought && count('barrel')<3){ const R=rangeAt('barrel',0); let b=null,bv=0;
      for (const [c,r] of freeCells()){ const v=near(c,r,R,t=>t.dry||(['rose','pine'].includes(t.type)&&!watered(t)))*.33; if (v>bv){ bv=v; b=[c,r]; } }
      if (b) opts.push({ kind:'plant', type:'barrel', cell:b, gain:bv, cost:costOf('barrel') }); }
    if (avail.includes('scarecrow') && F.fly>.25 && count('scarecrow')<2 && fighters.length>=4){ const sc=bestCell('scarecrow');
      if (sc) opts.push({ kind:'plant', type:'scarecrow', cell:sc, gain:F.fly*fighters.reduce((s,t)=>s+worth(t.type,t.lv,t.c,t.r,F),0)*.12, cost:costOf('scarecrow') }); }
    if (!opts.length) break;
    const ratio=o=>(o.gain + (o.seeds||0)*.02)/o.cost, all=opts.slice().sort((a,b)=>ratio(b)-ratio(a)), can=all.filter(o=>o.cost<=S.seeds);
    if (!can.length) break;
    // Save up when something clearly better is nearly in reach (never right before the boss).
    if (saving && all[0].cost>S.seeds && ratio(all[0])>ratio(can[0])*1.6 && all[0].cost<=S.seeds+60 && left>2) break;
    const o=can[0]; let ok=false;
    if (o.kind==='up') ok=upgrade(o.t); else { S.build=o.type; ok=plantAt(o.cell[0],o.cell[1]).ok; S.build=null; }
    if (!ok) break;
  }
}
const hiveless = t => true;
const watered = t => G.S.towers.some(o => ['sprinkler','barrel'].includes(o.type) && Math.hypot(o.x-t.x,o.y-t.y) <= rangeAt(o.type,o.lv));
// Clear a blocker when the spot under it is clearly better than any open one, at any point in the level.
function expertClear(F){
  const S=G.S; let bestFree=0, pick=null, ps=0; const R=rangeAt('bunny',0);
  for (const [c,r] of freeCells()) bestFree=Math.max(bestFree, cov(c,r,R));
  for (const o of path.scenery){ if (o.w*o.h>1) continue; const v=coverage(o.c,o.r,R); if (v>ps){ ps=v; pick=o; } }
  if (pick && ps>bestFree*1.2 && S.seeds>=clearCost(pick)+costOf('bunny')){ if (clearScenery(pick)){ covCache.clear(); return true; } }
  return false;
}
STRATEGIES.expert = function(avail, wave){ const F=forecast(wave); if (wave<=6) expertClear(F); expertSpend(avail, wave); };
// Called every couple of seconds while a wave runs: an expert keeps planting with the seeds pests drop.
export function expertDuringWave(avail){ expertSpend(avail, G.S.wave, { saving:false }); }
// Sprayer: wait for the biggest cluster instead of the first pest near the crops; never wilt more than one plant.
export function expertSpray(){
  const S=G.S; if (!sprayReady() || !S.enemies.length) return false;
  const { radius } = sprayStats(), live=S.enemies.filter(e=>!e.dead && !e.under && e.dist>0.3); if (!live.length) return false;
  let best=null, bs=0;
  for (const c of live){ const hit=live.filter(e=>Math.hypot(e.x-c.x,e.y-c.y)<=radius);
    const plants=S.towers.filter(t=>PLANTS.includes(t.type)&&Math.hypot(t.x-c.x,t.y-c.y)<=radius*SPRAY.drift).length;
    const score=hit.reduce((s,e)=>s+Math.min(e.hp, e.max)*(.5+e.dist/laneTotal(e.lane)),0) - plants*40; if (plants<=1 && score>bs){ bs=score; best={c,n:hit.length}; } }
  const urgent=live.some(e=>e.dist>laneTotal(e.lane)*.8);
  if (best && (best.n>=Math.min(6, 2+S.wave*.5) || urgent)) return !!spray(best.c.x, best.c.y);
  return false;
}
// Compost: on a boss once it's in reach of the defenders, or on a really big crowd.
export function expertCompost(){
  const S=G.S; if (!fertReady()) return;
  const live=S.enemies.filter(e=>!e.dead);
  if (live.some(e=>ENEMY[e.type].boss && e.dist>laneTotal(e.lane)*.2) || live.length>=9) fertilize();
}
