// Everything the player sees and taps outside the board: HUD, tray, panels and overlays.
import { G, startLevel, startWave, towerAt, plantAt, upgrade, sell, costOf, upCostOf, spray, sprayReady, sprayStats } from '../engine/game.js';
import { SPRAY, PLANTS } from '../data/spray.js';
import { path } from '../engine/path.js';
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
import { cellAt, tileAt, resize } from '../render/board.js';
import { startTutorial, stopTutorial, tutorialActive } from './tutorial.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { DIARY, diaryEntry } from '../data/diary.js';
import { achievementCount, progressOf } from './achievements.js';

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
let quietStart = false;
export function play(gi, bonusSeeds=0, { quiet=false }={}){
  stopTutorial(); quietStart = quiet;
  startLevel(gi, Save.data.settings.speed, bonusSeeds, perkValues(Save.data.perks));
}
on('levelStart', LV => {
  if (devMode) G.S.sprayOn = true;
  $('board').classList.toggle('spray-left', path.exitCol >= 5);   // keep the button off the path's end
  setHome(false); hideOverlay(); disarmRestart(); resize(); renderBar(); renderInfo(); dirty();
  msg(`${LV.ch.name} ${LV.li+1}: ${LV.name}. ${LV.intro}${G.S.fence?` Your fence will stop the first ${G.S.fence} pests that get through.`:''}`);
  if (quietStart){ quietStart=false; return; }                         // started silently behind the menu
  if (LV.gi===0 && !Save.data.tutorialDone){ startTutorial(); return; }   // the tutorial comes first
  // Cards to show before play, one after another: a diary page, new defenders, a new tool.
  intro = [];
  const page = LV.li===0 && diaryEntry(`start-${LV.ch.id}`);
  if (page && !Save.data.diary[page.key]) intro.push(['diary', page.key]);
  if (!devMode){
    for (const k of TRAY) if (towerOpen(k) && TYPES[k].unlock>0 && !Save.data.seen[k]) intro.push(['defender', k]);
    if (G.S.sprayOn && !Save.data.seen.spray) intro.push(['spray']);
  }
  nextIntro();
});
let intro = [], afterDiary = null;
function nextIntro(){
  const card = intro.shift();
  if (!card){ if (G.S && G.S.mode==='play'){ G.S.paused=false; hideOverlay(); dirty(); } return; }
  if (card[0]==='diary') showDiaryPage(card[1]);
  else if (card[0]==='defender') showNewDefender(card[1]);
  else showSprayIntro();
}
// A diary page, shown on a sheet of lined paper. Marked as read once shown.
function showDiaryPage(key, cont='Continue'){
  const d=diaryEntry(key); Save.data.diary[key]=true; Save.commit();
  if (G.S) G.S.paused=true;
  overlay(`<div class="diary-page"><span class="diary-tag">From the garden diary</span><h3>${d.title}</h3><p>${d.text}</p></div>
    <div class="row"><button class="btn main" data-go="diary-ok">${cont}</button></div>`);
  Audio.play('page');
}

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

const sprayUnlocked = () => devMode || highest() >= SPRAY.unlock;
function showSprayIntro(){
  G.S.paused=true;
  overlay(`<div class="panel newdef"><span class="tag">New tool</span><div class="spray-art">${$('spray').querySelector('svg').outerHTML}</div>
    <h3>Pesticide Sprayer</h3><p>A gift from the garden center: “Works like magic!” Tap the spray button during a wave, then tap the garden. Every pest in the circle gets soaked.</p>
    <p>It needs time to refill. The mist drifts wider than the spray, and any Roses, Sunflowers or Pine Trees it reaches wilt for a while. Aim away from your plants!</p></div>
    <div class="row"><button class="btn main" data-go="spray-ok">Got it</button></div>`);
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
    <div class="home-tools">
      <button class="tool-btn" data-go="achievements">${ICON.trophy}<span>Achievements</span><b>${achievementCount()}/${ACHIEVEMENTS.length}</b></button>
      <button class="tool-btn" data-go="diary">${ICON.book}<span>Diary</span></button>
      <button class="tool-btn icon-only" data-go="settings" aria-label="Settings">${ICON.gear}</button>
    </div>`);
  for (const c2 of $('home').querySelectorAll('canvas[data-crop]')){ const c=c2.getContext('2d'); c.setTransform(2,0,0,2,0,0); drawCrop(c,c2.dataset.crop,20,22,32); }
}

// ---------- Garden Shed ----------
function showShed(){
  const left=starsLeft();
  const rows = PERKS.filter(p => !p.spray || sprayUnlocked()).map(p => {
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
    ${sprayUnlocked()?'':`<p class="home-note">More upgrades unlock in ${LEVELS[SPRAY.unlock].ch.name}.</p>`}
    <div class="shed-foot"><button class="btn main" data-go="menu">Back to gardens</button>
    ${anyOwned?'<button class="btn ghost" data-go="refund">Refund all stars</button>':''}</div>`);
}
function buyPerk(id){
  const p=PERKS.find(x=>x.id===id), tier=Save.data.perks[id]||0, cost=p.costs[tier];
  if (cost==null || cost>starsLeft()){ Audio.play('denied'); return; }
  Save.data.perks[id]=tier+1; Save.commit(); Audio.play('sparkle'); showShed(); emit('perk', id);
}

// ---------- Achievements ----------
function showAchievements(){
  const rows = ACHIEVEMENTS.map(a => {
    const got = Save.data.ach[a.id], prog = progressOf(a);
    return `<div class="ach${got?' got':''}"><span class="ach-icon" aria-hidden="true">${got?'★':ICON.lock}</span>
      <span class="ach-text"><b>${a.name}</b><small>${a.desc}</small>
      ${!got && prog!=null ? `<span class="ach-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${a.goal}" aria-valuenow="${prog}"><i style="width:${prog/a.goal*100}%"></i></span><small class="ach-num">${prog.toLocaleString()} / ${a.goal.toLocaleString()}</small>` : ''}
      </span>${got?`<span class="ach-date">${got}</span>`:''}</div>`;
  }).join('');
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button>
      <h2>Achievements</h2><span class="star-count">${achievementCount()}/${ACHIEVEMENTS.length}</span></div>
    <div class="achs">${rows}</div>`);
}

// ---------- Diary ----------
function showDiary(){
  const read = DIARY.filter(d => Save.data.diary[d.key]);
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button><h2>Garden diary</h2></div>
    ${read.length ? `<div class="diary-list">${read.map(d=>`<div class="diary-page"><h3>${d.title}</h3><p>${d.text}</p></div>`).join('')}</div>`
      : '<p class="home-note">Your diary is empty. Finish your first garden to write the first page.</p>'}`);
}

// ---------- Settings ----------
function showSettings(){
  const s=Save.data.settings;
  const toggle=(id,label,on,note)=>`<div class="set-row"><span><b>${label}</b>${note?`<small>${note}</small>`:''}</span>
    <button class="switch" role="switch" aria-checked="${on}" data-go="${id}" aria-label="${label}"><i></i></button></div>`;
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button><h2>Settings</h2></div>
    <div class="set-group">
      ${toggle('t-sfx','Sound effects',s.sfx)}
      ${toggle('t-music','Music',s.music)}
    </div>
    <div class="set-group">
      <div class="set-row"><span><b>Tutorial</b><small>Play the guided first level again.</small></span>
        <button class="btn ghost small" data-go="replay-tutorial">Replay</button></div>
    </div>
    ${devMode?`<div class="set-group dev">
      <div class="set-row"><span><b>Test mode is on</b><small>Every level and defender is unlocked. Tap the title 7 times to turn it off.</small></span></div>
      <div class="set-row"><span><b>Reset progress</b><small>Erase all stars, upgrades, unlocks and achievements.</small></span>
        <button class="reset-btn" data-go="reset">Reset</button></div>
    </div>`:''}
    <p class="version">Carrot Patch Defense · version 0.3</p>`);
}

on('win', w => {
  const LV=G.LV, page = LV.li===LV.ch.levels.length-1 && diaryEntry(`after-${LV.ch.id}`);
  if (page && !Save.data.diary[page.key]){ recordWin(w); afterDiary = () => showWin(w, true); showDiaryPage(page.key, 'See your stars'); return; }
  showWin(w);
});
function recordWin({ stars, gi }){
  if (recordWin.done===gi) return; recordWin.done=gi;
  const before=Save.data.stars[gi]||0;
  recordWin.before=before;
  Save.data.stars[gi]=Math.max(before, stars); Save.data.stats.wins++; Save.commit();
}
on('levelStart', () => { recordWin.done=null; });
function showWin(w, recorded=false){
  const { stars, lives, maxLives, gi } = w;
  if (!recorded) recordWin(w);
  const before=recordWin.before;
  Audio.play('win');
  const next=LEVELS[gi+1], LV=G.LV, gained=Math.max(0, stars-before);
  const unlocks = next ? TRAY.filter(k => TYPES[k].unlock===next.gi) : [];
  overlay(`<h2>${LV.name} saved!</h2><div class="stars">${starStr(stars)}</div>
    <p>You beat the ${ENEMY[LV.boss].name} with ${lives} of ${maxLives} ${LV.ch.cropPlural} left.${stars<3?' Lose 4 or fewer for three stars.':''}</p>
    ${gained?`<p>+${gained} ★ for the Garden Shed (★ ${starsLeft()} to spend).</p>`:''}
    ${unlocks.length&&before===0?`<p>Next level unlocks the ${unlocks.map(k=>TYPES[k].name).join(' and ')}!</p>`:''}
    <div class="row">${next?`<button class="btn main" data-go="next">${next.ci!==LV.ci?`On to ${next.ch.name}`:'Next level'}</button>`:''}
    ${gained?'<button class="btn ghost" data-go="shed">Garden Shed</button>':''}
    <button class="btn ghost" data-go="retry">Play again</button><button class="btn ghost" data-go="menu">All gardens</button></div>
    ${next?'':'<p>That’s every garden for now. More are coming!</p>'}`);
  dirty();
}
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
    case 'achievements': return showAchievements();
    case 'settings': return showSettings();
    case 't-sfx': case 't-music': {
      const s=Save.data.settings, k=b.dataset.go==='t-sfx'?'sfx':'music'; s[k]=!s[k];
      Save.commit(); Audio.setSettings(s); paintSound(); showSettings(); if (k==='sfx' && s.sfx) Audio.play('tap'); return;
    }
    case 'replay-tutorial': Save.data.tutorialDone=false; Save.commit(); return play(0);
    case 'shed': leaveLevel(); return showShed();
    case 'refund': Save.data.perks={}; Save.commit(); return showShed();
    case 'resume': return resume();
    case 'reset': {
      // Two taps: the first arms the button, the second erases.
      if (!devMode) return;
      if (!b.classList.contains('armed')){
        b.classList.add('armed'); b.textContent='Tap again to erase everything';
        setTimeout(()=>{ if (b.isConnected){ b.classList.remove('armed'); b.textContent='Reset'; } }, 4000);
        return;
      }
      await Save.reset(['settings','owned']);       // keep sound settings and any purchases
      Audio.play('chime'); play(0); showMenu();
      return;
    }
    case 'spray-ok': { Save.data.seen.spray=true; Save.commit(); G.S.paused=false; hideOverlay(); dirty();
      msg('Save the Sprayer for when pests get close to your crops.'); return nextIntro(); }
    case 'diary-ok': { if (afterDiary){ const f=afterDiary; afterDiary=null; return f(); } return nextIntro(); }
    case 'diary': return showDiary();
    case 'gotit': {
      const key=b.dataset.key; Save.data.seen[key]=true; Save.commit();
      G.S.paused=false; hideOverlay(); G.S.build=key; renderBar(); dirty();
      msg(`${TYPES[key].name} selected. Tap the grass to plant it.`);
      if (intro.length){ G.S.paused=true; nextIntro(); }
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
  const key=[S.seeds,S.lives,S.wave,S.active,S.mode,S.speed,S.paused,S.sel&&S.sel.lv,G.LV.gi,Math.ceil(S.sprayCd*4),S.aiming,S.sprayOn].join('|');
  if (key===lastKey) return; lastKey=key;
  $('seeds').textContent=S.seeds; $('lives').textContent=S.lives; $('wave').textContent=`${S.wave}/${WAVES}`;
  $('season').textContent=G.LV.season==='late summer'?'late':G.LV.season;
  const go=$('go'); go.disabled=S.active||S.mode!=='play'||S.paused;
  go.textContent = S.mode!=='play' ? 'Pick a level' : S.active ? `Wave ${S.wave}…` : S.wave+1===WAVES ? 'Boss wave' : `Start wave ${S.wave+1}`;
  $('spd').textContent=S.speed+'×';
  $('restart').disabled=S.mode==='menu';
  for (const k of TRAY){ const el=$('card-'+k); if (el && towerOpen(k)) el.classList.toggle('poor', S.seeds<costOf(k)); }
  paintSpray();
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
  $('devBadge').hidden = !devMode;
}

// ---------- board input ----------
// ---------- the Sprayer button: tap it, then tap the garden ----------
function paintSpray(){
  const S=G.S, b=$('spray'); b.hidden = !S || !S.sprayOn || S.mode!=='play';
  if (b.hidden) return;
  const st=sprayStats(), ready=sprayReady() && S.active;
  b.style.setProperty('--p', ready ? 1 : 1 - S.sprayCd/st.recharge);
  b.classList.toggle('ready', ready); b.classList.toggle('aiming', !!S.aiming);
  b.setAttribute('aria-label', ready ? (S.aiming ? 'Sprayer: tap the garden to spray, or tap here to cancel' : 'Pesticide Sprayer: ready') : `Pesticide Sprayer: refilling, ${Math.ceil(S.sprayCd)} seconds`);
}
function onSprayBtn(){
  const S=G.S; if (!S || S.mode!=='play' || S.paused) return;
  if (!S.active){ Audio.play('denied'); msg('Save the Sprayer for when pests are in the garden. Start a wave first.'); return; }
  if (!sprayReady()){ Audio.play('denied'); msg(`The Sprayer is refilling. ${Math.ceil(S.sprayCd)} seconds to go.`); return; }
  S.aiming=!S.aiming; S.build=null; S.sel=null; renderBar(); renderInfo(); Audio.play('tap');
  msg(S.aiming ? 'Tap where to spray. Plants inside the outer ring will wilt.' : 'Spray put away.');
  if (!S.aiming) G.aim=null; dirty();
}
function onBoardMove(ev){
  const S=G.S; if (!S || !S.aiming) return;
  const [x,y]=tileAt(ev.clientX, ev.clientY); G.aim={ x, y, r:sprayStats().radius, drift:SPRAY.drift };
}

function onBoardTap(ev){
  const S=G.S; if (!S||S.mode!=='play'||S.paused) return;
  if (S.aiming){
    const [x,y]=tileAt(ev.clientX, ev.clientY), res=spray(x,y); G.aim=null; dirty();
    if (res) msg(res.pests ? `Sprayed ${res.pests} pest${res.pests>1?'s':''}${res.plants?`. ${res.plants} plant${res.plants>1?'s':''} wilted`:''}.` : `Nothing to spray there${res.plants?`, and ${res.plants} plant${res.plants>1?'s':''} wilted`:''}.`);
    return;
  }
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
  $('cv').addEventListener('pointermove', onBoardMove);
  $('spray').onclick=onSprayBtn;
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

  on('waveStart', ({ wave, boss }) => { if (!tutorialActive() && !G.S.heat) msg(boss ? `Final wave! The ${ENEMY[G.LV.boss].name} is coming!` : wave===WAVES-1 ? 'One more wave before the boss.' : 'Here they come…'); });
  on('heat', hot => msg(hot ? `Heat wave! ${hot} defender${hot>1?'s are':' is'} overheating. Defenders near a Sprinkler stay cool.` : 'Heat wave! Your Sprinklers are keeping everyone cool.'));
  on('fence', left => msg(left ? `Your Sturdy Fence stopped a pest! It can stop ${left} more this level.` : 'Your Sturdy Fence stopped a pest! That was its last one this level.'));
  on('waveClear', () => { if (G.S) { G.S.aiming=false; G.aim=null; } });
  on('waveClear', ({ wave, seeds, fromFlowers }) => msg(`Wave ${wave} cleared. +${seeds} seeds${fromFlowers?` (${fromFlowers} from sunflowers)`:''}.`));
}
