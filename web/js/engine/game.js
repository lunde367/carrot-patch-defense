// Pure game simulation: no DOM, drawing, sound or ads. It reports what happens through events.
import { TYPES } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { LEVELS, setGrid, ROWS } from '../data/levels.js';
import { path, setPath, setScenery, sceneryAt, bonusAt, pointAt, laneTotal, buildable } from './path.js';
import { sceneryFor, bonusFor } from '../data/scenery.js';
import { FERT } from '../data/fertilizer.js';
import { emit } from '../../kit/js/events.js';
import { NO_PERKS } from '../data/perks.js';
import { SPRAY, PLANTS } from '../data/spray.js';

export const G = { S:null, LV:null, CH:null, hint:null };   // hint: a tile the tutorial highlights
const MAX_FX = 260;
const HEAT_SLOW = .75;   // in a heat wave, uncooled defenders fire at 75% speed
const DRY_SLOW = .75;    // in a drought, plant defenders with no Sprinkler nearby fire at 75% speed
export const HILL = 1.2, SUNNY_RATE = 1.15, SUNNY_SEEDS = 1.5;   // helpful tiles: +20% range; 15% faster; +50% sunflower seeds

export function startLevel(gi, speed=1, bonusSeeds=0, perks=NO_PERKS){
  // `gi` is a level's number, or a level object that isn't part of the story (the Endless Garden).
  const LV = G.LV = typeof gi==='object' ? gi : LEVELS[gi]; gi = LV.gi; G.CH = LV.ch; setGrid(LV.cols, LV.rows); setPath(LV.lanes || LV.pts); G.hint = null;
  const onPath=(c,r)=>path.cells.has(c+','+r), scen=sceneryFor(LV, onPath, LV.gi===0 ? [[2,1],[4,3]] : []);
  setScenery(scen, bonusFor(LV, onPath, scen));
  newShots = [];                                   // drop shots left over from a game that ended mid-wave
  const maxLives = G.LV.lives + (perks.lives||0);
  G.S = { mode:'play', paused:false, seeds:120+gi*15+bonusSeeds+perks.seeds, lives:maxLives, maxLives, perks, wave:0,
    fence:perks.fence, headStartUsed:false,
    sprayOn: gi >= SPRAY.unlock && !G.LV.ch.noSpray, sprayCd:0, aiming:false,   // Part 4: the sprayer is put away for good
    fertOn: gi >= FERT.unlock, fertCd:0, fertT:0,                                 // Compost: cooldown, and time left while it's working
    leaks:{},                                                                     // pests that reached the crops, by type (for the tip after a loss)
    revived:false, adSeeds:false, adRefill:false,                                 // one-per-try extras (ads or Remove Ads)
    enemies:[], towers:[], shots:[], fx:[], spawnQ:[], spawnT:0, laneNext:0, active:false, speed, sel:null, build:null };
  emit('levelStart', LV);
}

// ---------- waves ----------
// A level's heat waves and aphid booms: its own list if it has one, else its garden's.
// Stars: lose a fifth of your crops or fewer for 3 stars, half or fewer for 2.
// With 20 crops that's 4 and 10; with 10 crops it's 2 and 5.
export const starLimits = max => [Math.floor(max*.2), Math.floor(max*.5)];
export const starsFor = (lost, max) => { const [a,b]=starLimits(max); return lost<=a?3:lost<=b?2:1; };
// A boss that gets through eats a quarter of the crops (5 of 20, 3 of 10).
const bossBite = () => Math.max(3, Math.round(G.S.maxLives*.25));
export const bossWave = w => G.LV.endless ? w%5===0 : w===G.LV.waves;
export const heatAt = w => (G.LV.heat || G.CH.heat || []).includes(w);
export const rainAt = w => (G.LV.rain || G.CH.rain || []).includes(w);
export const swarmAt = w => (G.LV.swarm || G.CH.swarm || []).includes(w);
// Difficulty (chosen in Settings): pest health is multiplied by `hp`. G.diff is the multiplier in play.
export const DIFFICULTY = {
  easy:   { hp:.8,  name:'Easy',   note:'Pests are softer. Great for little gardeners.' },
  normal: { hp:1,   name:'Normal', note:'The garden as it was meant to be played.' },
  hard:   { hp:1.3, name:'Hard',   note:'For grown-up gardeners. You’ll need your Sprayer and Compost.' },
};
const hpMul = () => G.LV.hpMul*(G.diff||1);
// In the Endless Garden pests also get a steady 9% tougher every wave, so every run ends somewhere.
const hpScale = w => (1+.2*(w-1)+.015*(w-1)*(w-1))*hpMul()*(G.LV.endless ? Math.pow(G.LV.growth, w-1) : 1);
function makeWave(w){
  const pool=G.LV.pool.filter(p=>p[1]<=w), sum=pool.reduce((a,p)=>a+p[2],0);
  const q=[], n=5+Math.floor(w*1.8);
  for (let i=0;i<n;i++){
    let r=Math.random()*sum, p=pool[0];
    for (const x of pool){ r-=x[2]; if (r<=0){ p=x; break; } }
    q.push({t:p[0], m:p[3]});
  }
  // Aphid boom (Apple Orchard): a big extra burst of the garden's smallest pest.
  if (swarmAt(w)){ const small=pool[0]; for (let i=0;i<Math.floor(n*.9);i++) q.splice(Math.floor(Math.random()*q.length), 0, {t:small[0], m:small[3]}); }
  if (G.LV.endless){ if (w%5===0) q.push({t:G.LV.bosses[(w/5-1)%G.LV.bosses.length]}); if (q.length>46) q.splice(0, q.length-46); }
  else if (w===G.LV.waves) q.push({t:G.LV.boss});
  return q;
}
export function startWave(){
  const S=G.S; if (!S||S.active||S.mode!=='play'||S.paused) return false;
  S.wave++; S.spawnQ=makeWave(S.wave); S.spawnT=0; S.active=true; S.sel=null;
  // Heat wave (Act 2 gardens): defenders slow down unless a Sprinkler is close enough to cool them.
  S.heat = heatAt(S.wave);
  for (const t of S.towers) t.cool = !S.heat || watered(t);
  // Rain (Part 4): pests slow down and every plant gets a drink.
  S.rain = rainAt(S.wave); if (S.rain) emit('rain');
  if (S.heat) emit('heat', S.towers.filter(t=>!t.cool).length);
  if (swarmAt(S.wave)) emit('swarm');
  emit('waveStart', { wave:S.wave, boss:bossWave(S.wave) }); emit('select', null);
  return true;
}
function spawnEnemy(type, dist, morph, lane=0){
  const S=G.S, d=ENEMY[type], sc=d.boss?hpMul()*(G.LV.endless?(.6+S.wave*.12)*Math.pow(G.LV.growth, S.wave-1):1):hpScale(Math.max(1,S.wave));
  const hp=Math.round(d.hp*sc), [x,y]=pointAt(dist, lane);
  const e={ type, hp, max:hp, spd:d.spd, reward:d.reward+Math.floor(G.LV.gi/2), size:d.size, armor:d.armor||0,
    dist, x, y, face:1, slow:0, hit:0, ph:Math.random()*6, bt:0, fly:!!d.fly, lane, morphAt:morph?laneTotal(lane)*morph:null, cocoon:0, scared:0, st:0 };
  S.enemies.push(e);
  if (d.boss) emit('boss', type);
  return e;
}
function grow(e){
  const S=G.S, ad=ENEMY[e.type].adult, d=ENEMY[ad], frac=e.hp/e.max, mx=Math.round(d.hp*hpScale(S.wave));
  // A grown-up comes out above ground (a grub that grows while tunneling must not stay hidden forever).
  Object.assign(e, { type:ad, max:mx, hp:Math.max(1,Math.round(mx*frac)), spd:d.spd, size:d.size, armor:d.armor||0, fly:!!d.fly,
    reward:d.reward+Math.floor(G.LV.gi/2), under:false, bt:0 });
  puffs(e.x, e.y, 6, 1); emit('grow', e);
}

// ---------- building ----------
// Prices and reach after Garden Shed perks.
export const costOf = type => Math.round(TYPES[type].cost*G.S.perks.costMul);
export const upCostOf = t => Math.round(TYPES[t.type].up[t.lv]*G.S.perks.costMul);
export const rangeOf = t => TYPES[t.type].range[t.lv]*G.S.perks.rangeMul*(t.tile==='hill'?HILL:1);
// Plant defenders need water in a drought: a Sprinkler close enough to reach them.
const WATER = ['sprinkler','barrel'];
const watered = t => WATER.includes(t.type) || G.S.towers.some(o => WATER.includes(o.type) && Math.hypot(o.x-t.x,o.y-t.y) <= rangeOf(o));
// Bee Hive: the best boost from any hive in reach (a hive doesn't boost itself).
const hiveBoost = t => { let b=1; for (const h of G.S.towers) if (h.type==='hive' && h!==t && Math.hypot(h.x-t.x,h.y-t.y) <= rangeOf(h)) b=Math.max(b, TYPES.hive.boost[h.lv]); return b; };
export const SMOG = .6;   // in smog, defenders only spot fliers within 60% of their reach
export const RAIN_SLOW = .8;
export const towerAt = (c,r) => G.S.towers.find(t=>t.c===c&&t.r===r);
export function plantAt(c,r){
  const S=G.S, T=TYPES[S.build], cost=costOf(S.build);
  if (!buildable(c,r)) return { ok:false, reason: sceneryAt(c,r) ? 'scenery' : 'path' };
  if (towerAt(c,r)) return { ok:false, reason:'taken' };
  if (S.seeds<cost) return { ok:false, reason:'seeds', cost, name:T.name };
  S.seeds-=cost;
  const head = S.build==='bunny' && S.perks.headLv>0 && !S.headStartUsed;
  if (head) S.headStartUsed = true;
  const lv = head ? S.perks.headLv : 0;
  const t={ type:S.build, c, r, x:c+.5, y:r+.5, lv, cd:0, hop:1, look:1, spent:cost, tile:bonusAt(c,r) };
  t.cool = !S.heat || watered(t);
  S.towers.push(t); emit('plant', t); return { ok:true, tower:t };
}
export function upgrade(t){
  const S=G.S; if (!t||t.lv>=2) return false;
  const cost=upCostOf(t); if (S.seeds<cost) return false;
  S.seeds-=cost; t.spent+=cost; t.lv++; t.hop=1; emit('upgrade', t); return true;
}
export function sell(t){
  const S=G.S; if (!t) return 0;
  const v=Math.floor(t.spent*.7); S.seeds+=v; S.towers=S.towers.filter(x=>x!==t); S.sel=null; emit('sell', v); return v;
}

// ---------- the Pesticide Sprayer ----------
export const sprayStats = () => { const p=G.S.perks;
  return { damage:SPRAY.power*p.sprayDmg, radius:SPRAY.radius*p.sprayRadius, recharge:SPRAY.recharge*p.sprayRecharge, wilt:SPRAY.wilt*p.sprayWilt }; };
// ---------- Compost (called `fert` in code) ----------
export const fertReady = () => G.S.fertOn && G.S.fertCd<=0 && G.S.fertT<=0 && G.S.mode==='play' && G.S.active;
export function fertilize(){
  const S=G.S; if (!fertReady()) return false;
  S.fertT=S.perks.fertTime; S.fertCd=FERT.recharge*S.perks.fertRecharge;
  for (const t of S.towers) puffs(t.x, t.y-.2, 3, .6);
  emit('fert'); return true;
}
// ---------- Extras from ads (or Remove Ads) ----------
// Second chance: after a loss, go back to the start of the wave you lost on with half your crops.
export function revive(){
  const S=G.S; if (S.mode!=='lost' || S.revived) return false;
  S.revived=true; S.mode='play'; S.lives=Math.ceil(S.maxLives/2);
  S.enemies=[]; S.shots=[]; S.spawnQ=[]; S.active=false; S.heat=false; S.rain=false; S.fertT=0;
  S.wave=Math.max(0, S.wave-1); emit('revive'); return true;
}
// ---------- Clearing scenery ----------
// Any rock, stump, fire or pile of litter can be cleared away for seeds, freeing its tiles.
export const clearCost = o => o.w*o.h>1 ? 60 : 30;
// In Part 4 the garden is healing: the pond stays where it is (the frogs live there).
export const canClear = o => !(G.CH.act===4 && o.kind==='pond');
export const sceneryPiece = (c,r) => path.scenery.find(o => c>=o.c && c<o.c+o.w && r>=o.r && r<o.r+o.h) || null;
export function clearScenery(o){
  const S=G.S; if (!o || S.mode!=='play' || !canClear(o)) return false;
  const cost=clearCost(o); if (S.seeds<cost) return false;
  S.seeds-=cost;
  setScenery(path.scenery.filter(x => x!==o), [...path.bonus].map(([k,kind]) => { const [c,r]=k.split(',').map(Number); return { c, r, kind }; }));
  puffs(o.c+o.w/2, o.r+o.h/2, 10, 1.1);
  emit('clear', o); return true;
}
export function addSeeds(n){ G.S.seeds+=n; emit('seeds', n); }
export function refillSpray(){ G.S.sprayCd=0; G.S.adRefill=true; }

export const sprayReady = () => G.S.sprayOn && G.S.sprayCd<=0 && G.S.mode==='play';
// Spray a circle centred on tile coordinates (x, y). Returns how many pests and plants it hit.
export function spray(x, y){
  const S=G.S; if (!sprayReady()) return null;
  // The spray takes a share of each pest's own health: all of it for ordinary pests (they die),
  // less for big pests and bosses, and less again where pests resist it.
  const st=sprayStats(), share = p => (ENEMY[p.type].boss ? SPRAY.bossShare : ENEMY[p.type].hp>=SPRAY.toughHp ? SPRAY.toughShare : 1) * st.damage * (1-G.LV.resist);
  let pests=0, plants=0;
  for (const e of S.enemies){
    if (e.dead || (e.under && !SPRAY.hitsUnderground) || e.dist<=0.3) continue;
    if (Math.hypot(e.x-x, e.y-y) > st.radius) continue;
    pests++;
    e.hp-=Math.ceil(e.max*Math.min(1, share(e))); e.hit=.2;      // soaks through armor
    if (e.hp<=0){ e.hp=1; damage(e, 999); }              // reuse the normal squash (seeds, puffs, events)
  }
  for (const t of S.towers) if (PLANTS.includes(t.type) && Math.hypot(t.x-x, t.y-y) <= st.radius*SPRAY.drift){ t.wilt=st.wilt; plants++; }
  S.sprayCd=st.recharge; S.aiming=false;
  S.fx.push({k:'spray',x,y,r:st.radius*SPRAY.drift,life:.9,max:.9});
  if (G.LV.resist>0 && pests) floatText(x, y-st.radius*.6, `resisted ${Math.round(G.LV.resist*100)}%`, '#8a6bb0', 1.1);
  emit('spray', { pests, plants });
  return { pests, plants };
}

// ---------- combat ----------
let newShots=[];
function puffs(x,y,n,spd){ const S=G.S; if (S.fx.length>MAX_FX) return;
  for (let i=0;i<n;i++){ const a=Math.random()*6.28; S.fx.push({k:'puff',x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:.45,max:.45}); } }
function floatText(x,y,t,c,life=.9){ const S=G.S; if (S.fx.length<MAX_FX) S.fx.push({k:'txt',x,y,t,life,max:life,c}); }

function damage(e,d){
  const S=G.S; if (e.dead||e.under) return;
  e.hp-=Math.max(1,d-e.armor); e.hit=.12;
  if (e.armor && d<=e.armor+1 && Math.random()<.15){ floatText(e.x,e.y-.3,'tink','#7a8a96',.5); emit('tink'); }
  else emit('hit');
  if (e.hp<=0){
    const gain=Math.round(e.reward*S.perks.rewardMul);
    e.dead=true; S.seeds+=gain;
    floatText(e.x,e.y-.3,'+'+gain,'#c98a12'); puffs(e.x,e.y,7,1.4);
    emit('kill', { boss:!!ENEMY[e.type].boss });
  }
}
const targetable = e => !e.dead && !e.under && e.dist>0.3;
function hitShot(s){
  const S=G.S;
  if (s.k==='cone'){
    for (const e of S.enemies) if (targetable(e)&&!e.fly&&Math.hypot(e.x-s.tx,e.y-s.ty)<=s.splash) damage(e,s.dmg);
    S.fx.push({k:'thud',x:s.tx,y:s.ty,r:s.splash,life:.4,max:.4}); emit('thud'); return;
  }
  if (!targetable(s.tgt)) return;
  damage(s.tgt,s.dmg);
  if (s.k==='acorn' && s.bounce>0){
    const hits=[...s.hits,s.tgt]; let best=null, bd=1.8;
    for (const e of S.enemies){ if (!targetable(e)||hits.includes(e)) continue; const d=Math.hypot(e.x-s.tgt.x,e.y-s.tgt.y); if (d<bd){bd=d;best=e;} }
    if (best) newShots.push({k:'acorn',x:s.tgt.x,y:s.tgt.y,tgt:best,tx:best.x,ty:best.y,spd:9,dmg:Math.max(1,Math.round(s.dmg*.75)),bounce:s.bounce-1,hits,a:0,spin:0});
  }
}

// ---------- one simulation step ----------
export function update(dt){
  const S=G.S;
  if (S.spawnQ.length){ S.spawnT-=dt;
    // pests take turns at each entrance
    if (S.spawnT<=0){ const it=S.spawnQ.shift(); spawnEnemy(it.t,0,it.m,(S.laneNext++)%path.lanes.length); S.spawnT=ENEMY[it.t].gap||2; } }

  for (const e of S.enemies){
    if (e.dead) continue;
    const D=ENEMY[e.type];
    e.slow=Math.max(0,e.slow-dt); e.hit=Math.max(0,e.hit-dt); e.ph+=dt*6; e.scared=Math.max(0,e.scared-dt);
    if (D.spawns && !e.under && e.dist>0.5){ e.st+=dt;                     // mothers hatch babies as they go
      if (e.st>=D.spawns.every){ e.st=0; spawnEnemy(D.spawns.type, Math.max(0.3, e.dist-0.25), null, e.lane); puffs(e.x,e.y,4,.8); } }
    if (e.cocoon>0){ e.cocoon-=dt; if (e.cocoon<=0) grow(e); continue; }
    if (e.morphAt!=null && e.dist>=e.morphAt){ e.morphAt=null; e.cocoon=1.3; floatText(e.x,e.y-.35,'growing!','#8a5fb0',1); emit('cocoon'); continue; }
    if (D.burrow){ e.bt+=dt; e.under = e.bt>1 && (e.bt%4.5)>3; } else e.under = false;
    let mul=(e.slow>0?.5:1)*(e.under?1.3:1)*(S.rain?RAIN_SLOW:1);
    if (D.hopper){ e.jump=Math.sin(e.ph*.9)>.2; mul*=e.jump?2.2:.25; }
    e.dist+=e.spd*mul*dt;
    const [x,y,f]=pointAt(e.dist, e.lane); e.x=x; e.y=y; if (f) e.face=f;
    if (e.dist>=laneTotal(e.lane)){
      e.dead=true;
      if (S.fence>0){ S.fence--; floatText(e.x,ROWS-1.3,'Fence!','#8a6a48',1); emit('fence', S.fence); continue; }   // Sturdy Fence
      const lost=D.boss?bossBite():1; S.lives=Math.max(0,S.lives-lost); S.leaks[e.type]=(S.leaks[e.type]||0)+lost;
      floatText(e.x,ROWS-1.1,'−'+lost,'#c2456b',1); emit('leak', lost);
      if (S.lives<=0){ S.mode='lost'; S.active=false; emit('lose', { wave:S.wave }); return; }
    }
  }

  if (S.sprayCd>0 && S.active) S.sprayCd=Math.max(0, S.sprayCd-dt);   // recharges during waves
  if (S.active){ if (S.fertT>0) S.fertT=Math.max(0, S.fertT-dt); else if (S.fertCd>0) S.fertCd=Math.max(0, S.fertCd-dt); }
  for (const t of S.towers){
    const T=TYPES[t.type];
    t.dry = !!(G.CH.drought && !S.rain && PLANTS.includes(t.type) && !watered(t));
    t.cd-=dt*(S.heat && !t.cool ? HEAT_SLOW : 1)*(t.dry ? DRY_SLOW : 1)*(t.tile==='sunny' ? SUNNY_RATE : 1)*hiveBoost(t)*(S.fertT>0 ? S.perks.fertBoost : 1)*(S.perks.rateMul||1); t.hop=Math.max(0,t.hop-dt*4);
    if (t.wilt>0){ t.wilt=Math.max(0, t.wilt-dt); continue; }          // wilted by the spray
    if (t.type==='sunflower' || T.support) continue;
    const R=rangeOf(t), seen = e => Math.hypot(e.x-t.x,e.y-t.y) <= R*(G.CH.smog && e.fly ? SMOG : 1);
    if (t.type==='scarecrow'){
      // Scares every flier in reach back up the path. Bosses only flinch half as far. A scared pest
      // can't be scared again for a moment, so several scarecrows can't hold one forever.
      if (t.cd>0) continue;
      const near=S.enemies.filter(e=>targetable(e)&&e.fly&&e.scared<=0&&seen(e));
      if (!near.length) continue;
      t.cd=1/T.rate[t.lv]; t.hop=1;
      for (const e of near){ e.dist=Math.max(0.35, e.dist-T.push[t.lv]*(ENEMY[e.type].boss?.5:1)); e.scared=2.6;
        const [x,y]=pointAt(e.dist, e.lane); e.x=x; e.y=y; }
      S.fx.push({k:'scare',x:t.x,y:t.y,r:R,life:.6,max:.6}); emit('scare', near.length);
      continue;
    }
    const inR=S.enemies.filter(e=>targetable(e)&&!(T.ground&&e.fly)&&seen(e));
    if (!inR.length||t.cd>0) continue;
    t.cd=1/T.rate[t.lv]; t.hop=1;
    const left=e=>laneTotal(e.lane)-e.dist, lead=inR.reduce((a,b)=>left(b)<left(a)?b:a);   // the pest closest to the crops
    if (t.type==='sprinkler'){
      for (const e of inR){ damage(e,T.dmg[t.lv]); e.slow=T.slow[t.lv]; }
      S.fx.push({k:'ring',x:t.x,y:t.y,r:R,life:.5,max:.5});
    } else if (t.type==='rose'){
      for (const e of [...inR].sort((a,b)=>b.dist-a.dist).slice(0,T.multi[t.lv]))
        S.shots.push({k:'thorn',x:t.x,y:t.y-.2,tgt:e,tx:e.x,ty:e.y,spd:8,dmg:T.dmg[t.lv],a:0,spin:0});
    } else if (t.type==='pine'){
      const d0=Math.hypot(lead.x-t.x,lead.y-t.y)||1;
      S.shots.push({k:'cone',x:t.x,y:t.y-.3,tgt:lead,tx:lead.x,ty:lead.y,spd:6.5,dmg:T.dmg[t.lv],splash:T.splash[t.lv],a:0,spin:0,d0,gone:0});
    } else if (t.type==='squirrel'){
      t.look=Math.sign(lead.x-t.x)||t.look;
      S.shots.push({k:'acorn',x:t.x,y:t.y-.1,tgt:lead,tx:lead.x,ty:lead.y,spd:9,dmg:T.dmg[t.lv],bounce:T.bounce[t.lv],hits:[],a:0,spin:0});
    } else if (t.type==='ladybug'){
      const tgt=lead; t.look=Math.sign(tgt.x-t.x)||t.look;
      S.shots.push({k:'lady',x:t.x,y:t.y-.15,tgt,tx:tgt.x,ty:tgt.y,spd:6,dmg:T.dmg[t.lv]*(ENEMY[tgt.type].hp<=16?2:1),a:0,spin:0});
    } else {
      const tgt = t.type==='owl' ? inR.reduce((a,b)=>b.hp>a.hp?b:a) : lead;
      t.look=Math.sign(tgt.x-t.x)||t.look;
      S.shots.push({k:t.type==='owl'?'feather':'carrot',x:t.x,y:t.y-.15,tgt,tx:tgt.x,ty:tgt.y,spd:t.type==='owl'?10:7,dmg:T.dmg[t.lv],a:0,spin:0});
    }
    emit('shoot', t.type);
  }

  for (const s of S.shots){
    if (!s.tgt.dead){ s.tx=s.tgt.x; s.ty=s.tgt.y; }
    const dx=s.tx-s.x, dy=s.ty-s.y, d=Math.hypot(dx,dy); s.a=Math.atan2(dy,dx); s.spin+=dt*14;
    const step=s.spd*dt;
    if (d<=step+.05){ hitShot(s); s.done=true; }
    else { s.x+=dx/d*step; s.y+=dy/d*step; if (s.k==='cone') s.gone+=step; }
  }
  S.shots=S.shots.filter(s=>!s.done).concat(newShots); newShots=[];
  S.enemies=S.enemies.filter(e=>!e.dead);
  for (const f of S.fx){ f.life-=dt; if (f.k==='puff'){ f.x+=f.vx*dt; f.y+=f.vy*dt; } if (f.k==='txt') f.y-=dt*.6; }
  S.fx=S.fx.filter(f=>f.life>0);

  if (S.active && !S.spawnQ.length && !S.enemies.length && S.mode==='play'){
    S.active=false; S.heat=false; S.rain=false;
    if (S.wave>=G.LV.waves){
      const lost=S.maxLives-S.lives, stars=starsFor(lost, S.maxLives);
      S.mode='won'; emit('win', { stars, lives:S.lives, maxLives:S.maxLives, lost, gi:G.LV.gi }); return;
    }
    const bonus=8+S.wave*2; let inc=0;
    for (const t of S.towers) if (t.type==='sunflower'){ const v=Math.round(TYPES.sunflower.income[t.lv]*(t.tile==='sunny'?SUNNY_SEEDS:1)*(t.dry?.7:1)); inc+=v; floatText(t.x,t.y-.5,'+'+v,'#c98a12',1.3); t.hop=1; }
    S.seeds+=bonus+inc;
    emit('waveClear', { wave:S.wave, seeds:bonus+inc, fromFlowers:inc });
  }
}
