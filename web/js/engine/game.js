// Pure game simulation: no DOM, drawing, sound or ads. It reports what happens through events.
import { TYPES } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { LEVELS, WAVES } from '../data/levels.js';
import { path, setPath, pointAt, buildable } from './path.js';
import { emit } from '../core/events.js';

export const G = { S:null, LV:null, CH:null };
const MAX_FX = 260;

export function startLevel(gi, speed=1, bonusSeeds=0){
  const LV = G.LV = LEVELS[gi]; G.CH = LV.ch; setPath(LV.pts);
  G.S = { mode:'play', paused:false, seeds:120+gi*15+bonusSeeds, lives:20, wave:0,
    enemies:[], towers:[], shots:[], fx:[], spawnQ:[], spawnT:0, active:false, speed, sel:null, build:null };
  emit('levelStart', LV);
}

// ---------- waves ----------
const hpScale = w => (1+.2*(w-1)+.015*(w-1)*(w-1))*G.LV.hpMul;
function makeWave(w){
  const pool=G.LV.pool.filter(p=>p[1]<=w), sum=pool.reduce((a,p)=>a+p[2],0);
  const q=[], n=5+Math.floor(w*1.8);
  for (let i=0;i<n;i++){
    let r=Math.random()*sum, p=pool[0];
    for (const x of pool){ r-=x[2]; if (r<=0){ p=x; break; } }
    q.push({t:p[0], m:p[3]});
  }
  if (w===WAVES) q.push({t:G.LV.boss});
  return q;
}
export function startWave(){
  const S=G.S; if (!S||S.active||S.mode!=='play'||S.paused) return false;
  S.wave++; S.spawnQ=makeWave(S.wave); S.spawnT=0; S.active=true; S.sel=null;
  emit('waveStart', { wave:S.wave, boss:S.wave===WAVES }); emit('select', null);
  return true;
}
function spawnEnemy(type, dist, morph){
  const S=G.S, d=ENEMY[type], sc=d.boss?G.LV.hpMul:hpScale(Math.max(1,S.wave));
  const hp=Math.round(d.hp*sc), [x,y]=pointAt(dist);
  S.enemies.push({ type, hp, max:hp, spd:d.spd, reward:d.reward+Math.floor(G.LV.gi/2), size:d.size, armor:d.armor||0,
    dist, x, y, face:1, slow:0, hit:0, ph:Math.random()*6, bt:0, fly:!!d.fly, morphAt:morph?path.total*morph:null, cocoon:0 });
  if (d.boss) emit('boss', type);
}
function grow(e){
  const S=G.S, ad=ENEMY[e.type].adult, d=ENEMY[ad], frac=e.hp/e.max, mx=Math.round(d.hp*hpScale(S.wave));
  Object.assign(e, { type:ad, max:mx, hp:Math.max(1,Math.round(mx*frac)), spd:d.spd, size:d.size, armor:d.armor||0, fly:!!d.fly,
    reward:d.reward+Math.floor(G.LV.gi/2) });
  puffs(e.x, e.y, 6, 1); emit('grow', e);
}

// ---------- building ----------
export const towerAt = (c,r) => G.S.towers.find(t=>t.c===c&&t.r===r);
export function plantAt(c,r){
  const S=G.S, T=TYPES[S.build];
  if (!buildable(c,r)) return { ok:false, reason:'path' };
  if (towerAt(c,r)) return { ok:false, reason:'taken' };
  if (S.seeds<T.cost) return { ok:false, reason:'seeds', cost:T.cost, name:T.name };
  S.seeds-=T.cost;
  const t={ type:S.build, c, r, x:c+.5, y:r+.5, lv:0, cd:0, hop:1, look:1, spent:T.cost };
  S.towers.push(t); emit('plant', t); return { ok:true, tower:t };
}
export function upgrade(t){
  const S=G.S; if (!t||t.lv>=2) return false;
  const cost=TYPES[t.type].up[t.lv]; if (S.seeds<cost) return false;
  S.seeds-=cost; t.spent+=cost; t.lv++; t.hop=1; emit('upgrade', t); return true;
}
export function sell(t){
  const S=G.S; if (!t) return 0;
  const v=Math.floor(t.spent*.7); S.seeds+=v; S.towers=S.towers.filter(x=>x!==t); S.sel=null; emit('sell', v); return v;
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
    e.dead=true; S.seeds+=e.reward;
    floatText(e.x,e.y-.3,'+'+e.reward,'#c98a12'); puffs(e.x,e.y,7,1.4);
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
    if (S.spawnT<=0){ const it=S.spawnQ.shift(); spawnEnemy(it.t,0,it.m); S.spawnT=ENEMY[it.t].gap||2; } }

  for (const e of S.enemies){
    if (e.dead) continue;
    const D=ENEMY[e.type];
    e.slow=Math.max(0,e.slow-dt); e.hit=Math.max(0,e.hit-dt); e.ph+=dt*6;
    if (e.cocoon>0){ e.cocoon-=dt; if (e.cocoon<=0) grow(e); continue; }
    if (e.morphAt!=null && e.dist>=e.morphAt){ e.morphAt=null; e.cocoon=1.3; floatText(e.x,e.y-.35,'growing!','#8a5fb0',1); emit('cocoon'); continue; }
    if (D.burrow){ e.bt+=dt; e.under = e.bt>1 && (e.bt%4.5)>3; }
    let mul=(e.slow>0?.5:1)*(e.under?1.3:1);
    if (D.hopper){ e.jump=Math.sin(e.ph*.9)>.2; mul*=e.jump?2.2:.25; }
    e.dist+=e.spd*mul*dt;
    const [x,y,f]=pointAt(e.dist); e.x=x; e.y=y; if (f) e.face=f;
    if (e.dist>=path.total){
      e.dead=true; const lost=D.boss?5:1; S.lives=Math.max(0,S.lives-lost);
      floatText(e.x,12.9,'−'+lost,'#c2456b',1); emit('leak', lost);
      if (S.lives<=0){ S.mode='lost'; S.active=false; emit('lose', { wave:S.wave }); return; }
    }
  }

  for (const t of S.towers){
    const T=TYPES[t.type]; t.cd-=dt; t.hop=Math.max(0,t.hop-dt*4);
    if (t.type==='sunflower') continue;
    const R=T.range[t.lv];
    const inR=S.enemies.filter(e=>targetable(e)&&!(T.ground&&e.fly)&&Math.hypot(e.x-t.x,e.y-t.y)<=R);
    if (!inR.length||t.cd>0) continue;
    t.cd=1/T.rate[t.lv]; t.hop=1;
    const lead=inR.reduce((a,b)=>b.dist>a.dist?b:a);
    if (t.type==='sprinkler'){
      for (const e of inR){ damage(e,T.dmg[t.lv]); e.slow=T.slow[t.lv]; }
      S.fx.push({k:'ring',x:t.x,y:t.y,r:R,life:.5,max:.5});
    } else if (t.type==='rose'){
      for (const e of [...inR].sort((a,b)=>b.dist-a.dist).slice(0,T.multi[t.lv]))
        S.shots.push({k:'thorn',x:t.x,y:t.y-.2,tgt:e,tx:e.x,ty:e.y,spd:8,dmg:T.dmg[t.lv],a:0,spin:0});
    } else if (t.type==='pine'){
      const d0=Math.hypot(lead.x-t.x,lead.y-t.y)||1;
      S.shots.push({k:'cone',x:t.x,y:t.y-.3,tgt:lead,tx:lead.x,ty:lead.y,spd:4.5,dmg:T.dmg[t.lv],splash:T.splash[t.lv],a:0,spin:0,d0,gone:0});
    } else if (t.type==='squirrel'){
      t.look=Math.sign(lead.x-t.x)||t.look;
      S.shots.push({k:'acorn',x:t.x,y:t.y-.1,tgt:lead,tx:lead.x,ty:lead.y,spd:9,dmg:T.dmg[t.lv],bounce:T.bounce[t.lv],hits:[],a:0,spin:0});
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
    S.active=false;
    if (S.wave>=WAVES){
      S.mode='won'; const stars=S.lives>=18?3:S.lives>=10?2:1;
      emit('win', { stars, lives:S.lives, gi:G.LV.gi }); return;
    }
    const bonus=8+S.wave*2; let inc=0;
    for (const t of S.towers) if (t.type==='sunflower'){ const v=TYPES.sunflower.income[t.lv]; inc+=v; floatText(t.x,t.y-.5,'+'+v,'#c98a12',1.3); t.hop=1; }
    S.seeds+=bonus+inc;
    emit('waveClear', { wave:S.wave, seeds:bonus+inc, fromFlowers:inc });
  }
}
