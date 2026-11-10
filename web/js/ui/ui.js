// Everything the player sees and taps outside the board: HUD, tray, panels and overlays.
import { G, startLevel, startWave, towerAt, plantAt, upgrade, sell } from '../engine/game.js';
import { TYPES, statsText } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { CHAPTERS, LEVELS, WAVES, ROWS } from '../data/levels.js';
import { Save } from '../platform/storage.js';
import { Audio } from '../platform/audio.js';
import { Ads, REWARDS } from '../platform/monetization.js';
import { devMode } from '../platform/native.js';
import { on } from '../core/events.js';
import { DRAW } from '../render/art-towers.js';
import { drawCrop } from '../render/art-common.js';
import { cellAt, rebuild } from '../render/board.js';
import { ICON } from './markup.js';

const $ = id => document.getElementById(id);
const msg = t => { $('msg').textContent = t; };
const starStr = n => '★'.repeat(n)+'<i>'+'★'.repeat(3-n)+'</i>';
export const unlocked = gi => devMode || gi===0 || (Save.data.stars[gi-1]||0) > 0;
export function lastOpenLevel(){ let gi=0; while (gi+1<LEVELS.length && (Save.data.stars[gi]||0)>0) gi++; return gi; }

// ---------- start / restart ----------
export function play(gi, bonusSeeds=0){
  startLevel(gi, Save.data.settings.speed, bonusSeeds);
}
on('levelStart', LV => {
  hideOverlay(); disarmRestart(); rebuild(); renderBar(); renderInfo(); dirty();
  msg(`${LV.ch.name} ${LV.li+1}: ${LV.name}. ${LV.intro}`);
});

// ---------- overlays ----------
function overlay(html){ const o=$('over'); o.innerHTML=html; o.hidden=false; o.scrollTop=0; }
function hideOverlay(){ $('over').hidden=true; }

export function showMenu(){
  const S=G.S; if (S){ S.mode='menu'; S.active=false; S.sel=null; S.build=null; S.paused=false; }
  renderInfo(); renderBar(); disarmRestart(); dirty();
  const html = CHAPTERS.map(ch => {
    const lvls = ch.levels.map(l => { const ok=unlocked(l.gi), st=Save.data.stars[l.gi]||0;
      return `<button class="lv${G.LV&&G.LV.gi===l.gi?' cur':''}" data-lv="${l.gi}" ${ok?'':'disabled'}><b>${l.li+1}. ${l.name}</b>
        <span class="st">${ok?starStr(st):'Locked'}</span></button>`; }).join('');
    return `<div class="chap"><header><canvas data-crop="${ch.crop}" width="80" height="80"></canvas>
      <span><b>${ch.name}</b><small>${ch.pests}</small></span></header><div class="lvls">${lvls}</div></div>`;
  }).join('');
  overlay(`<h2>Pick a garden</h2>${html}${devMode?'<p class="devnote">Test mode: every level is unlocked.</p>':''}`);
  for (const c2 of $('over').querySelectorAll('canvas[data-crop]')){ const c=c2.getContext('2d'); c.setTransform(2,0,0,2,0,0); drawCrop(c,c2.dataset.crop,20,22,32); }
  msg('Each garden has three levels. Beat one to unlock the next.');
}

on('win', ({ stars, lives, gi }) => {
  Save.data.stars[gi] = Math.max(Save.data.stars[gi]||0, stars); Save.data.stats.wins++; Save.commit();
  Audio.play('win');
  const next=LEVELS[gi+1], LV=G.LV;
  overlay(`<h2>${LV.name} saved!</h2><div class="stars">${starStr(stars)}</div>
    <p>You beat the ${ENEMY[LV.boss].name} with ${lives} of 20 ${LV.ch.cropPlural} left.${stars<3?' Keep 18 or more for three stars.':''}</p>
    <div class="row">${next?`<button class="btn main" data-go="next">${next.ci!==LV.ci?`On to ${next.ch.name}`:'Next level'}</button>`:''}
    <button class="btn ghost" data-go="retry">Play again</button><button class="btn ghost" data-go="menu">All gardens</button></div>
    ${next?'':'<p>That’s every garden for now. More are coming!</p>'}`);
  dirty();
});
on('lose', ({ wave }) => {
  Save.data.stats.losses++; Save.commit(); Audio.play('lose');
  const LV=G.LV, ad=Ads.rewardedReady('retry_bonus');
  overlay(`<h2>The pests got the ${LV.ch.cropPlural}</h2>
    <p>You reached wave ${wave} of ${WAVES} in ${LV.name}.</p>
    <div class="row"><button class="btn main" data-go="retry">Try again</button>
    ${ad?`<button class="btn ghost" data-go="adretry">Watch an ad: retry with +${REWARDS.retrySeeds} seeds</button>`:''}
    <button class="btn ghost" data-go="menu">All gardens</button></div>`);
  dirty();
});

export function pause(){
  const S=G.S; if (!S || S.mode!=='play' || S.paused) return;
  if (!S.active && S.wave===0) return;           // nothing to protect yet
  S.paused=true;
  overlay(`<h2>Paused</h2><p>${G.LV.name}, wave ${S.wave} of ${WAVES}</p>
    <div class="row"><button class="btn main" data-go="resume">Resume</button><button class="btn ghost" data-go="menu">All gardens</button></div>`);
  dirty();
}
export function resume(){ const S=G.S; if (!S||!S.paused) return; S.paused=false; hideOverlay(); dirty(); }

async function onOverlayClick(ev){
  const b=ev.target.closest('button'); if (!b) return;
  Audio.play('tap');
  if (b.dataset.lv!=null) return play(+b.dataset.lv);
  const gi=G.LV.gi;
  switch (b.dataset.go){
    case 'next': return play(gi+1);
    case 'retry': return play(gi);
    case 'menu': return showMenu();
    case 'resume': return resume();
    case 'adretry': { b.disabled=true; const ok=await Ads.showRewarded('retry_bonus'); if (ok) play(gi, REWARDS.retrySeeds); else b.disabled=false; return; }
  }
}

// ---------- defender tray & info panel ----------
export function renderBar(){
  const S=G.S, bar=$('bar'); bar.innerHTML='';
  const d=Math.min(2, window.devicePixelRatio||1);
  for (const key of Object.keys(TYPES)){
    const T=TYPES[key], b=document.createElement('button');
    b.className='card'; b.id='card-'+key; b.setAttribute('aria-pressed', !!(S&&S.build===key));
    b.title=`${T.name} · ${T.cost} seeds`; b.setAttribute('aria-label', `${T.name}, ${T.cost} seeds`);
    const ic=document.createElement('canvas'); ic.width=ic.height=44*d;
    const c=ic.getContext('2d'); c.setTransform(d,0,0,d,22*d,25*d); DRAW[key](c,40,0,0,1,1);
    b.append(ic); b.insertAdjacentHTML('beforeend', `<b>${T.name}</b><span>${T.cost}</span>`);
    b.onclick=()=>{ if (!G.S||G.S.mode!=='play'||G.S.paused) return; Audio.play('tap');
      G.S.build=G.S.build===key?null:key; G.S.sel=null; renderInfo(); renderBar();
      if (G.S.build) msg(`${T.name}: ${T.desc} Tap the grass to plant.`); };
    bar.append(b);
  }
  dirty();
}
export function renderInfo(){
  const t=G.S&&G.S.sel; $('info').hidden=!t; dirty(); if (!t) return;
  const T=TYPES[t.type];
  $('iName').innerHTML=`${T.name}<em>Level ${t.lv+1}</em>`; $('iDesc').textContent=T.desc; $('iStats').textContent=statsText(t);
}
on('select', renderInfo);

// ---------- HUD refresh (only touches the DOM when something changed) ----------
let lastKey='';
const dirty = () => { lastKey=''; };
export function refresh(){
  const S=G.S; if (!S) return;
  const key=[S.seeds,S.lives,S.wave,S.active,S.mode,S.speed,S.paused,S.sel&&S.sel.lv,G.LV.gi].join('|');
  if (key===lastKey) return; lastKey=key;
  $('seeds').textContent=S.seeds; $('lives').textContent=S.lives; $('wave').textContent=`${S.wave}/${WAVES}`;
  $('season').textContent=G.LV.season==='late summer'?'late':G.LV.season;
  const go=$('go'); go.disabled=S.active||S.mode!=='play'||S.paused;
  go.textContent = S.mode!=='play' ? 'Pick a level' : S.active ? `Wave ${S.wave}…` : S.wave+1===WAVES ? 'Boss wave' : `Start wave ${S.wave+1}`;
  $('spd').textContent=S.speed+'×';
  $('restart').disabled=S.mode==='menu';
  for (const k of Object.keys(TYPES)){ const el=$('card-'+k); if (el) el.classList.toggle('poor', S.seeds<TYPES[k].cost); }
  if (S.sel){ const T=TYPES[S.sel.type], up=$('iUp');
    if (S.sel.lv>=2){ up.textContent='Max level'; up.disabled=true; }
    else { const cost=T.up[S.sel.lv]; up.textContent=`Upgrade · ${cost}`; up.disabled=S.seeds<cost; }
    $('iSell').textContent=`Sell · +${Math.floor(S.sel.spent*.7)}`; }
}

// ---------- restart (two taps so it can't happen by accident) ----------
let armTimer=null;
function disarmRestart(){ clearTimeout(armTimer); armTimer=null; const b=$('restart'); b.classList.remove('armed'); b.querySelector('.lbl').textContent=''; }
function onRestart(){
  const S=G.S; if (!S||S.mode==='menu') return;
  if ((S.wave===0&&!S.towers.length) || armTimer){ Audio.play('tap'); play(G.LV.gi); return; }
  const b=$('restart'); b.classList.add('armed'); b.querySelector('.lbl').textContent='Tap again';
  msg('Tap Restart again to start this level over.'); armTimer=setTimeout(disarmRestart,3000);
}

// ---------- sound button: all on → effects only → off ----------
function soundState(){ const s=Save.data.settings; return s.sfx&&s.music?'all':s.sfx?'fx':'off'; }
function paintSound(){
  const st=soundState(), b=$('sound');
  b.innerHTML = st==='all'?ICON.soundAll : st==='fx'?ICON.soundFx : ICON.soundOff;
  b.setAttribute('aria-label', st==='all'?'Sound: music and effects':st==='fx'?'Sound: effects only':'Sound: off');
}
function onSound(){
  const s=Save.data.settings, st=soundState();
  if (st==='all'){ s.music=false; s.sfx=true; } else if (st==='fx'){ s.sfx=false; s.music=false; } else { s.sfx=true; s.music=true; }
  Save.commit(); Audio.setSettings(s); paintSound(); Audio.play('tap');
  msg(soundState()==='all'?'Music and sound effects on.':soundState()==='fx'?'Sound effects only.':'Sound off.');
}

// ---------- board input ----------
function onBoardTap(ev){
  const S=G.S; if (!S||S.mode!=='play'||S.paused) return;
  const [c,r]=cellAt(ev.clientX, ev.clientY);
  const t=towerAt(c,r);
  if (t){ S.sel=t; S.build=null; renderBar(); renderInfo(); Audio.play('tap'); return; }
  if (S.build){
    const res=plantAt(c,r);
    if (res.ok){ msg(S.wave===0&&S.towers.length===1?'Nice. Plant more, or tap Start wave when ready.':`${TYPES[res.tower.type].name} planted.`); dirty(); return; }
    if (res.reason==='seeds') msg(`Not enough seeds. ${res.name} costs ${res.cost}.`);
    else msg(r>=ROWS-1?'That’s your crop row. Plant on the grass.':'Keep the path clear. Plant on the grass.');
    return;
  }
  S.sel=null; renderInfo();
}

export function initUI(){
  $('cv').addEventListener('pointerdown', onBoardTap);
  $('over').addEventListener('click', onOverlayClick);
  $('go').onclick=()=>{ if (startWave()) disarmRestart(); };
  $('spd').onclick=()=>{ const S=G.S; if (!S) return; S.speed=S.speed===1?2:S.speed===2?3:1; Save.data.settings.speed=S.speed; Save.commit(); Audio.play('tap'); };
  $('restart').onclick=onRestart;
  $('sound').onclick=onSound;
  $('map').onclick=()=>{ Audio.play('tap'); showMenu(); };
  $('iUp').onclick=()=>{ const t=G.S.sel; if (upgrade(t)){ renderInfo(); msg(`${TYPES[t.type].name} upgraded to level ${t.lv+1}.`); } };
  $('iSell').onclick=()=>{ const v=sell(G.S.sel); renderInfo(); msg(`Sold for ${v} seeds.`); };
  if (devMode){ const chip=$('seedsChip'); chip.tabIndex=0; chip.classList.add('dev'); chip.title='Test mode: tap for +200 seeds';
    chip.onclick=()=>{ if (G.S){ G.S.seeds+=200; msg('Test mode: +200 seeds.'); } }; }
  paintSound();

  on('waveStart', ({ wave, boss }) => msg(boss ? `Final wave! The ${ENEMY[G.LV.boss].name} is coming!` : wave===WAVES-1 ? 'One more wave before the boss.' : 'Here they come…'));
  on('waveClear', ({ wave, seeds, fromFlowers }) => msg(`Wave ${wave} cleared. +${seeds} seeds${fromFlowers?` (${fromFlowers} from sunflowers)`:''}.`));
}
