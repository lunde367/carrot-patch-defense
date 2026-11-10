// Everything the player sees and taps outside the board: HUD, tray, panels and overlays.
import { G, startLevel, startWave, towerAt, plantAt, upgrade, sell, costOf, upCostOf } from '../engine/game.js';
import { TYPES, TRAY, statsText } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { CHAPTERS, LEVELS, WAVES, ROWS } from '../data/levels.js';
import { PERKS, perkValues, REWARDS } from '../data/perks.js';
import { Save, starsLeft } from '../save.js';
import { Audio } from '../../kit/js/audio.js';
import { Ads } from '../../kit/js/monetization.js';
import { devMode, secretTaps } from '../../kit/js/native.js';
import { on, emit } from '../../kit/js/events.js';
import { $, starStr, ICON } from '../../kit/js/ui.js';
import { DRAW } from '../render/art-towers.js';
import { drawCrop } from '../render/art-common.js';
import { cellAt, resize } from '../render/board.js';
import { startTutorial, stopTutorial, tutorialActive } from './tutorial.js';

const msg = t => { $('msg').textContent = t; };
const highest = () => { let gi=0; while (gi+1<LEVELS.length && (Save.data.stars[gi]||0)>0) gi++; return gi; };
export const unlocked = gi => devMode || gi <= highest();
export const lastOpenLevel = highest;
// A defender is available once the player has reached the level that unlocks it.
const towerOpen = key => devMode || TYPES[key].unlock <= highest();
const unlockLevelName = key => LEVELS[TYPES[key].unlock].name;

function drawIcon(canvas, key, size){
  const d=Math.min(2, window.devicePixelRatio||1); canvas.width=canvas.height=size*d;
  const c=canvas.getContext('2d'); c.setTransform(d,0,0,d,size/2*d,size*.57*d); DRAW[key](c,size*.9,0,0,1,1);
}

// ---------- start / restart ----------
export function play(gi, bonusSeeds=0){
  stopTutorial();
  startLevel(gi, Save.data.settings.speed, bonusSeeds, perkValues(Save.data.perks));
}
on('levelStart', LV => {
  setHome(false); hideOverlay(); disarmRestart(); resize(); renderBar(); renderInfo(); dirty();
  msg(`${LV.ch.name} ${LV.li+1}: ${LV.name}. ${LV.intro}`);
  const fresh = TRAY.filter(k => towerOpen(k) && TYPES[k].unlock>0 && !Save.data.seen[k]);
  if (fresh.length && !devMode) showNewDefender(fresh[0]);
  else if (LV.gi===0 && !Save.data.tutorialDone) startTutorial();
});

// ---------- overlays ----------
function overlay(html){ const o=$('over'); o.innerHTML=html; o.hidden=false; o.scrollTop=0; }
// The home screen (garden picker and shed) replaces the game view entirely.
function setHome(on){ document.querySelector('.app').classList.toggle('home-mode', on); $('home').hidden=!on; }
function home(html){ hideOverlay(); setHome(true); $('home').innerHTML=html; window.scrollTo(0,0); }
function leaveLevel(){ const S=G.S; if (S){ S.mode='menu'; S.active=false; S.sel=null; S.build=null; S.paused=false; } stopTutorial(); }
function hideOverlay(){ $('over').hidden=true; }

function showNewDefender(key){
  const T=TYPES[key];
  G.S.paused=true;
  overlay(`<div class="panel newdef"><span class="tag">New defender</span><canvas id="newdefArt"></canvas>
    <h3>${T.name}</h3><p>${T.desc}</p><p>Costs ${costOf(key)} seeds.</p></div>
    <div class="row"><button class="btn main" data-go="gotit" data-key="${key}">Plant one!</button></div>`);
  drawIcon($('newdefArt'), key, 84);
  Audio.play('sparkle');
}

export function showMenu(){
  leaveLevel(); renderInfo(); disarmRestart(); dirty();
  const html = CHAPTERS.map((ch, ci) => {
    // A garden opens only once every level of the garden before it is beaten.
    const prev = CHAPTERS[ci-1];
    if (ci>0 && !devMode && !prev.levels.every(l => (Save.data.stars[l.gi]||0)>0)){
      const done = prev.levels.filter(l => (Save.data.stars[l.gi]||0)>0).length;
      return `<div class="chap locked" aria-disabled="true"><header><span class="chap-lock">${ICON.lock}</span>
        <span><b>${ch.name}</b><small>Beat all 3 ${prev.name} levels to unlock · ${done} of 3 done</small></span></header></div>`;
    }
    const lvls = ch.levels.map(l => { const ok=unlocked(l.gi), st=Save.data.stars[l.gi]||0;
      return `<button class="lv${G.LV&&G.LV.gi===l.gi?' cur':''}" data-lv="${l.gi}" ${ok?'':'disabled'}><b>${l.li+1}. ${l.name}</b>
        ${ok?`<span class="stars">${starStr(st)}</span>`:'<span class="lv-lock">Locked</span>'}</button>`; }).join('');
    return `<div class="chap"><header><canvas data-crop="${ch.crop}" width="80" height="80"></canvas>
      <span><b>${ch.name}</b><small>${ch.pests}</small></span></header><div class="lvls">${lvls}</div></div>`;
  }).join('');
  home(`<div class="home-head"><h2>Pick a garden</h2>
      <button class="shed-btn" data-go="shed">${ICON.shed}Garden Shed <b>★ ${starsLeft()}</b></button></div>
    ${html}${devMode?'<p class="devnote">Test mode is on: every level and defender is unlocked. Tap the title 7 times to turn it off.</p>':''}
    ${devMode?'<div class="home-foot"><button class="reset-btn" data-go="reset">Reset progress (test mode)</button></div>':''}`);
  for (const c2 of $('home').querySelectorAll('canvas[data-crop]')){ const c=c2.getContext('2d'); c.setTransform(2,0,0,2,0,0); drawCrop(c,c2.dataset.crop,20,22,32); }
}

// ---------- Garden Shed ----------
function showShed(){
  const left=starsLeft();
  const rows = PERKS.map(p => {
    const tier=Save.data.perks[p.id]||0, maxed=tier>=p.costs.length, cost=p.costs[tier];
    const desc = p.desc(maxed ? tier-1 : tier);
    return `<div class="perk"><h3>${p.name}</h3>
      <button data-perk="${p.id}" ${maxed||cost>left?'disabled':''}>${maxed?'Owned':`★ ${cost}`}</button>
      <p>${maxed?desc:(tier?`Next: ${desc}`:desc)}</p>
      <span class="tiers">${p.costs.map((_,i)=>`<i class="${i<tier?'on':''}"></i>`).join('')}</span></div>`;
  }).join('');
  const anyOwned = Object.values(Save.data.perks).some(Boolean);
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button>
      <h2>Garden Shed</h2><span class="star-count">★ ${left}</span></div>
    <p class="home-note">Spend stars on upgrades that help in every level. Earn more stars by beating levels with more crops left.</p>
    <div class="perks">${rows}</div>
    <div class="shed-foot"><button class="btn main" data-go="menu">Back to gardens</button>
    ${anyOwned?'<button class="btn ghost" data-go="refund">Refund all stars</button>':''}</div>`);
}
function buyPerk(id){
  const p=PERKS.find(x=>x.id===id), tier=Save.data.perks[id]||0, cost=p.costs[tier];
  if (cost==null || cost>starsLeft()){ Audio.play('denied'); return; }
  Save.data.perks[id]=tier+1; Save.commit(); Audio.play('sparkle'); showShed();
}

on('win', ({ stars, lives, maxLives, lost, gi }) => {
  const before=Save.data.stars[gi]||0;
  Save.data.stars[gi]=Math.max(before, stars); Save.data.stats.wins++; Save.commit();
  Audio.play('win');
  const next=LEVELS[gi+1], LV=G.LV, gained=Math.max(0, stars-before);
  const unlocks = next ? TRAY.filter(k => TYPES[k].unlock===next.gi) : [];
  overlay(`<h2>${LV.name} saved!</h2><div class="stars">${starStr(stars)}</div>
    <p>You beat the ${ENEMY[LV.boss].name} with ${lives} of ${maxLives} ${LV.ch.cropPlural} left.${stars<3?' Lose 2 or fewer for three stars.':''}</p>
    ${gained?`<p>+${gained} ★ for the Garden Shed (★ ${starsLeft()} to spend).</p>`:''}
    ${unlocks.length&&before===0?`<p>Next level unlocks the ${unlocks.map(k=>TYPES[k].name).join(' and ')}!</p>`:''}
    <div class="row">${next?`<button class="btn main" data-go="next">${next.ci!==LV.ci?`On to ${next.ch.name}`:'Next level'}</button>`:''}
    ${gained?'<button class="btn ghost" data-go="shed">Garden Shed</button>':''}
    <button class="btn ghost" data-go="retry">Play again</button><button class="btn ghost" data-go="menu">All gardens</button></div>
    ${next?'':'<p>That’s every garden for now. More are coming!</p>'}`);
  dirty();
});
on('lose', ({ wave }) => {
  stopTutorial();
  Save.data.stats.losses++; Save.commit(); Audio.play('lose');
  const LV=G.LV, ad=Ads.rewardedReady('retry_bonus'), left=starsLeft();
  overlay(`<h2>The pests got the ${LV.ch.cropPlural}</h2>
    <p>You reached wave ${wave} of ${WAVES} in ${LV.name}.</p>
    ${left>0?`<p>You have ★ ${left} to spend in the Garden Shed. Upgrades there could help.</p>`:''}
    <div class="row"><button class="btn main" data-go="retry">Try again</button>
    ${ad?`<button class="btn ghost" data-go="adretry">Watch an ad: retry with +${REWARDS.retrySeeds} seeds</button>`:''}
    ${left>0?'<button class="btn ghost" data-go="shed">Garden Shed</button>':''}
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
  if (b.dataset.perk) return buyPerk(b.dataset.perk);
  const gi=G.LV.gi;
  switch (b.dataset.go){
    case 'next': return play(gi+1);
    case 'retry': return play(gi);
    case 'menu': return showMenu();
    case 'shed': leaveLevel(); return showShed();
    case 'refund': Save.data.perks={}; Save.commit(); return showShed();
    case 'resume': return resume();
    case 'reset': {
      // Two taps: the first arms the button, the second erases.
      if (!devMode) return;
      if (!b.classList.contains('armed')){
        b.classList.add('armed'); b.textContent='Tap again to erase all stars, upgrades and unlocks';
        setTimeout(()=>{ if (b.isConnected){ b.classList.remove('armed'); b.textContent='Reset progress (test mode)'; } }, 4000);
        return;
      }
      await Save.reset(['settings','owned']);       // keep sound settings and any purchases
      Audio.play('chime'); play(0); showMenu();
      return;
    }
    case 'gotit': {
      const key=b.dataset.key; Save.data.seen[key]=true; Save.commit();
      G.S.paused=false; hideOverlay(); G.S.build=key; renderBar(); dirty();
      msg(`${TYPES[key].name} selected. Tap the grass to plant it.`);
      const more = TRAY.find(k => towerOpen(k) && TYPES[k].unlock>0 && !Save.data.seen[k]);
      if (more) showNewDefender(more);
      return;
    }
    case 'adretry': { b.disabled=true; const ok=await Ads.showRewarded('retry_bonus'); if (ok) play(gi, REWARDS.retrySeeds); else b.disabled=false; return; }
  }
}

// ---------- defender tray & info panel ----------
export function renderBar(){
  const S=G.S, bar=$('bar'); bar.innerHTML='';
  for (const key of TRAY){
    const T=TYPES[key], open=towerOpen(key), b=document.createElement('button'), cost=S?costOf(key):T.cost;
    b.className='card'+(open?'':' locked'); b.id='card-'+key; b.setAttribute('aria-pressed', !!(S&&S.build===key));
    b.title = open ? `${T.name} · ${cost} seeds` : `${T.name} · unlocks at ${unlockLevelName(key)}`;
    b.setAttribute('aria-label', b.title);
    const ic=document.createElement('canvas'); drawIcon(ic, key, 44);
    b.append(ic);
    b.insertAdjacentHTML('beforeend', open ? `<b>${T.name}</b><span>${cost}</span>` : `<span class="lockic">${ICON.lock}</span><b>${T.name}</b><span>—</span>`);
    if (open && T.unlock>0 && Save.data.seen[key] && T.unlock===highest() && (Save.data.stars[T.unlock]||0)===0) b.insertAdjacentHTML('beforeend','<i class="new">NEW</i>');
    b.onclick=()=>{
      if (!G.S||G.S.mode!=='play'||G.S.paused) return;
      if (!open){ Audio.play('denied'); msg(`The ${T.name} unlocks when you reach ${unlockLevelName(key)}.`); return; }
      Audio.play('tap');
      G.S.build=G.S.build===key?null:key; G.S.sel=null; renderInfo(); renderBar();
      if (G.S.build){ msg(`${T.name}: ${T.desc} Tap the grass to plant.`); emit('pickTower', key); }
    };
    bar.append(b);
  }
  dirty();
}
export function renderInfo(){
  const t=G.S&&G.S.sel; $('info').hidden=!t; dirty(); if (!t) return;
  const T=TYPES[t.type];
  $('iName').innerHTML=`${T.name}<em>Level ${t.lv+1}</em>`; $('iDesc').textContent=T.desc; $('iStats').textContent=statsText(t, G.S.perks);
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
  for (const k of TRAY){ const el=$('card-'+k); if (el && towerOpen(k)) el.classList.toggle('poor', S.seeds<costOf(k)); }
  if (S.sel){ const up=$('iUp');
    if (S.sel.lv>=2){ up.textContent='Max level'; up.disabled=true; }
    else { const cost=upCostOf(S.sel); up.textContent=`Upgrade · ${cost}`; up.disabled=S.seeds<cost; }
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

function paintDev(){
  const chip=$('seedsChip'); chip.classList.toggle('dev', devMode); chip.tabIndex=devMode?0:-1;
  chip.title = devMode ? 'Test mode: tap for +200 seeds' : 'Seeds';
}

// ---------- board input ----------
function onBoardTap(ev){
  const S=G.S; if (!S||S.mode!=='play'||S.paused) return;
  const [c,r]=cellAt(ev.clientX, ev.clientY);
  const t=towerAt(c,r);
  if (t){ S.sel=t; S.build=null; renderBar(); renderInfo(); Audio.play('tap'); emit('select', t); return; }
  if (S.build){
    const res=plantAt(c,r);
    if (res.ok){ if (!tutorialActive()) msg(S.wave===0&&S.towers.length===1?'Nice. Plant more, or tap Start wave when ready.':`${TYPES[res.tower.type].name} planted.`); dirty(); return; }
    Audio.play('denied');
    if (res.reason==='seeds') msg(`Not enough seeds. ${res.name} costs ${res.cost}.`);
    else msg(r>=ROWS-1?'That’s your crop row. Plant on the grass.':'Keep the path clear. Plant on the grass.');
    return;
  }
  if (S.sel){ S.sel=null; renderInfo(); }
}

export function initUI(){
  $('cv').addEventListener('pointerdown', onBoardTap);
  $('over').addEventListener('click', onOverlayClick);
  $('home').addEventListener('click', onOverlayClick);
  $('go').onclick=()=>{ if (startWave()) disarmRestart(); };
  $('spd').onclick=()=>{ const S=G.S; if (!S) return; S.speed=S.speed===1?2:S.speed===2?3:1; Save.data.settings.speed=S.speed; Save.commit(); Audio.play('tap'); };
  $('restart').onclick=onRestart;
  $('sound').onclick=onSound;
  $('map').onclick=()=>{ Audio.play('tap'); showMenu(); };
  $('iUp').onclick=()=>{ const t=G.S.sel; if (upgrade(t)){ renderInfo(); msg(`${TYPES[t.type].name} upgraded to level ${t.lv+1}.`); } };
  $('iSell').onclick=()=>{ const v=sell(G.S.sel); renderInfo(); msg(`Sold for ${v} seeds.`); };
  $('seedsChip').onclick=()=>{ if (devMode && G.S){ G.S.seeds+=200; msg('Test mode: +200 seeds.'); } };
  paintDev();
  // Secret switch: tap the title 7 times quickly to turn test mode on or off.
  secretTaps(document.querySelector('.k-title'), on => {
    Audio.play(on ? 'sparkle' : 'tap'); paintDev();
    if (G.S && G.S.mode==='play'){ renderBar(); msg(on ? 'Test mode on. Tap the seeds counter for +200 seeds.' : 'Test mode off.'); }
    else showMenu();
  });
  paintSound();

  on('waveStart', ({ wave, boss }) => { if (!tutorialActive()) msg(boss ? `Final wave! The ${ENEMY[G.LV.boss].name} is coming!` : wave===WAVES-1 ? 'One more wave before the boss.' : 'Here they come…'); });
  on('waveClear', ({ wave, seeds, fromFlowers }) => msg(`Wave ${wave} cleared. +${seeds} seeds${fromFlowers?` (${fromFlowers} from sunflowers)`:''}.`));
}
