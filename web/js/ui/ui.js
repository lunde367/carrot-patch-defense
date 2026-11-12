// Everything the player sees and taps outside the board: HUD, tray, panels and overlays.
import { G, DIFFICULTY, startLevel, startWave, towerAt, plantAt, upgrade, sell, costOf, upCostOf, spray, sprayReady, sprayStats, swarmAt, starLimits, fertReady, fertilize, revive, addSeeds, refillSpray, clearCost, sceneryPiece, clearScenery } from '../engine/game.js';
import { SCENERY_NAMES } from '../data/scenery.js';
import { SPRAY, PLANTS } from '../data/spray.js';
import { path } from '../engine/path.js';
import { TYPES, TRAY, statsText } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { PARTS, CHAPTERS, LEVELS, WAVES, ROWS, COLS } from '../data/levels.js';
import { drawEnemy } from '../render/art-enemies.js';
import { PERKS, perkValues, ALL_PERKS, PRODUCTS } from '../data/perks.js';
import { Save, starsLeft } from '../save.js';
import { Audio } from '../../kit/js/audio.js';
import { Ads, Store } from '../../kit/js/monetization.js';
import { FERT } from '../data/fertilizer.js';
import { EXTRAS } from '../data/extras.js';
import { toast } from '../../kit/js/fx.js';
import { devMode, secretTaps } from '../../kit/js/native.js';
import { on, emit } from '../../kit/js/events.js';
import { $, starStr, ICON } from '../../kit/js/ui.js';
import { DRAW } from '../render/art-towers.js';
import { drawCrop } from '../render/art-common.js';
import { cellAt, tileAt, resize, rebuild } from '../render/board.js';
import { startTutorial, stopTutorial, tutorialActive, tutorialAllows, onTutorialAllow, startShedTour, stopShedTour } from './tutorial.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { DIARY, diaryEntry } from '../data/diary.js';
import { achievementCount, progressOf, niceDate } from './achievements.js';

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
  // Test mode plays with every Garden Shed upgrade owned.
  const owned = devMode ? ALL_PERKS : Save.data.perks;
  G.diffId = diffOf(); G.diff = DIFFICULTY[G.diffId].hp;
  startLevel(gi, fast3Open() ? Save.data.settings.speed : Math.min(2, Save.data.settings.speed), bonusSeeds, perkValues(owned));
}
on('levelStart', (...a) => { drawLivesIcon(); return onLevelStart(...a); });
const onLevelStart = (LV => {
  if (devMode && !LV.ch.noSpray) G.S.sprayOn = true;
  $('board').classList.toggle('spray-left', path.exitCol >= 5);   // keep the button off the path's end
  setHome(false); hideOverlay(); disarmRestart(); resize(); renderBar(); renderInfo(); dirty();
  msg(`${LV.ch.name} ${LV.li+1}: ${LV.name}. ${LV.intro}${G.S.fence?` Your fence will stop the first ${G.S.fence} pests that get through.`:''}`);
  if (quietStart){ quietStart=false; return; }                         // started silently behind the menu
  if (LV.gi===0 && !Save.data.tutorialDone){ startTutorial(); return; }   // the tutorial comes first
  // Cards to show before play, one after another: a diary page, new defenders, a new tool.
  intro = [];
  const page = diaryEntry(LV.li===0 ? `start-${LV.ch.id}` : `start-${LV.ch.id}-${LV.li+1}`);   // a garden's first level, or a page for a later level
  const firstOfPart = LV.li===0 && CHAPTERS.find(c => c.act===LV.ch.act)===LV.ch;
  if (firstOfPart && LV.ch.act>1 && !Save.data.parts[LV.ch.act]) intro.push(['part', LV.ch.act]);
  if (page && !Save.data.diary[page.key]) intro.push(['diary', page.key]);
  if (!devMode){
    for (const k of TRAY) if (towerOpen(k) && TYPES[k].unlock>0 && !Save.data.seen[k]) intro.push(['defender', k]);
    if (G.S.sprayOn && !Save.data.seen.spray) intro.push(['spray']);
    if (G.S.fertOn && !Save.data.seen.fert) intro.push(['fert']);
  }
  nextIntro();
});
let intro = [], afterDiary = null;
function nextIntro(){
  const card = intro.shift();
  if (!card){ if (G.S && G.S.mode==='play'){ G.S.paused=false; hideOverlay(); dirty(); } return; }
  if (card[0]==='part') showPartCard(card[1]);
  else if (card[0]==='diary') showDiaryPage(card[1]);
  else if (card[0]==='defender') showNewDefender(card[1]);
  else if (card[0]==='fert') showFertIntro();
  else showSprayIntro();
}
// A diary page, shown on a sheet of lined paper. Marked as read once shown.
// A title card when the story moves into a new part. Shown once.
function showPartCard(n){
  const P=PARTS[n-1]; Save.data.parts[n]=true; Save.commit();
  if (G.S) G.S.paused=true;
  overlay(`<div class="part-card" style="--part:${P.tint}">${P.before?`<p class="part-before">${P.before}</p>`:''}<span>Part ${n}</span><h2>${P.name}</h2></div>
    <div class="row"><button class="btn main" data-go="part-ok">Begin</button></div>`);
  $('over').classList.add('part-over');
  Audio.play('wave');
}
function showDiaryPage(key, cont='Continue'){
  const d=diaryEntry(key); Save.data.diary[key]=true; Save.commit(); emit('diary', key);
  if (G.S) G.S.paused=true;
  overlay(`<div class="diary-page"><span class="diary-tag">From the garden diary</span><h3>${d.title}</h3><p>${d.text}</p></div>
    <div class="row"><button class="btn main" data-go="diary-ok">${cont}</button></div>`);
  Audio.play('page');
}

// ---------- overlays ----------
function overlay(html){ const o=$('over'); o.classList.remove('part-over'); o.innerHTML=html; o.hidden=false; o.scrollTop=0; }
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

// ---------- Extras: ads, or free with Remove Ads ----------
const noAds = () => Store.owns(PRODUCTS.removeAds);
const extrasHere = () => G.LV && G.LV.gi >= EXTRAS.firstLevel && !tutorialActive();
export const fast3Open = () => noAds() || Date.now() < (Save.data.fast3Until||0);
const today = () => { const d=new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; };
const starsToday = () => Save.data.adStars.day===today() ? Save.data.adStars.n : 0;
// Run an extra: free with Remove Ads, otherwise after a (placeholder) ad. Resolves true if earned.
async function earn(placement, label){
  if (noAds()) return true;
  const S=G.S, was=S && S.paused; if (S) S.paused=true;
  const ok = await Ads.showRewarded(placement, label);
  if (S) S.paused=was; dirty(); return ok;
}
const tv = () => noAds() ? '' : '<span class="tv">AD</span>';
// A small yes/no card over the board (used for the 3× speed offer).
function offerCard(title, text, yes, onYes, onNo){
  const S=G.S; if (S) S.paused=true;
  overlay(`<div class="panel offer-card"><h3>${title}</h3><p>${text}</p></div>
    <div class="row"><button class="btn main" data-go="offer-yes">${yes}</button><button class="btn ghost" data-go="offer-no">Not now</button></div>`);
  offerYes = async () => { hideOverlay(); if (S) S.paused=false; await onYes(); dirty(); };
  offerNo = () => { hideOverlay(); if (S) S.paused=false; if (onNo) onNo(); dirty(); };
}
let offerYes = null, offerNo = null;

function showFertIntro(){
  G.S.paused=true;
  overlay(`<div class="panel newdef"><span class="tag">New tool</span><div class="spray-art fert-art">${$('fert').querySelector('svg').outerHTML}</div>
    <h3>Fertilizer</h3><p>Good food for your garden. Tap the green button during a wave and every defender works faster for a few seconds.</p>
    <p>It never hurts anything. It takes a while to be ready again, so save it for a big crowd or a boss.</p></div>
    <div class="row"><button class="btn main" data-go="fert-ok">Got it</button></div>`);
  Audio.play('sparkle');
}
const fertUnlocked = () => devMode || !!Save.data.seen.fert;

// Spray upgrades appear in the Shed only once the Sprayer has been introduced in a level.
const sprayUnlocked = () => devMode || !!Save.data.seen.spray;
function showSprayIntro(){
  G.S.paused=true;
  overlay(`<div class="panel newdef"><span class="tag">New tool</span><div class="spray-art">${$('spray').querySelector('svg').outerHTML}</div>
    <h3>Pesticide Sprayer</h3><p>A gift from the garden center: “Works like magic!” Tap the spray button during a wave, then tap the garden. Every pest in the circle gets soaked.</p>
    <p>It needs time to refill. The mist drifts wider than the spray, and any Roses, Sunflowers or Pine Trees it reaches wilt for a while. Aim away from your plants!</p></div>
    <div class="row"><button class="btn main" data-go="spray-ok">Got it</button></div>`);
  Audio.play('sparkle');
}
// ---------- New pest cards ----------
// The first time a pest is about to show up, the wave pauses and a card says what it does.
// Pests that grow up, or that a boss hatches, are introduced along with the pest they come from.
let pestQueue = [];
function pestFamily(type, out=new Set()){
  if (out.has(type)) return out; out.add(type);
  const D=ENEMY[type]; if (D.adult) pestFamily(D.adult, out); if (D.spawns) pestFamily(D.spawns.type, out);
  return out;
}
// Players who were already playing have met the pests from levels they beat.
function setupPestsSeen(){
  if (Save.data.pests) return;
  Save.data.pests = {};
  for (const l of LEVELS) if ((Save.data.stars[l.gi]||0)>0){ for (const p of l.pool) pestFamily(p[0]).forEach(t => Save.data.pests[t]=true); pestFamily(l.boss).forEach(t => Save.data.pests[t]=true); }
  Save.commit();
}
function pestTraits(type){
  const D=ENEMY[type], out=[];
  const ground = Object.values(TYPES).filter(T => T.ground).map(T => T.name);
  if (D.boss){ const bite=Math.max(3, Math.round(G.S.maxLives*.25));
    out.push(`A boss: big and tough, and it comes in the final wave. If it reaches your garden it eats ${bite} crops at once.`); }
  if (D.fly) out.push(`Flies over the path. ${ground.join(' and ')} can’t reach it.`);
  if (D.armor) out.push(`Armor ${D.armor}: every hit does ${D.armor} less damage, so small hits barely dent it.`);
  if (D.burrow) out.push('Tunnels underground for part of the way, where nothing can hit it.');
  if (D.hopper) out.push('Hops along in quick jumps.');
  if (D.spawns) out.push(`Hatches ${ENEMY[D.spawns.type].name.toLowerCase()}s as it walks.`);
  if (D.adult) out.push(`Grows into a ${ENEMY[D.adult].name} partway down the path.`);
  if (D.spd>=1.4) out.push('Very fast.'); else if (D.spd<=.5 && !D.boss) out.push('Slow, but takes a lot of hits.');
  if (!out.length) out.push(D.hp<=10 ? 'Small and soft. Easy to squash, but they come in crowds.' : 'Tougher than it looks.');
  return out;
}
function introducePests(){
  setupPestsSeen();
  const S=G.S, fresh=[];
  for (const q of S.spawnQ) for (const t of pestFamily(q.t)) if (!Save.data.pests[t] && !fresh.includes(t)) fresh.push(t);
  if (tutorialActive()){ fresh.forEach(t => Save.data.pests[t]=true); Save.commit(); return; }
  // Grown-up forms and hatchlings ride along with the pest they come from.
  const lead = fresh.filter(t => !fresh.some(o => o!==t && (ENEMY[o].adult===t || (ENEMY[o].spawns && ENEMY[o].spawns.type===t))));
  pestQueue = lead.map(t => fresh.filter(x => x===t || pestFamily(t).has(x)));
  if (pestQueue.length){ S.paused=true; nextPest(); }
}
function nextPest(){
  const group = pestQueue.shift();
  if (!group){ G.S.paused=false; hideOverlay(); dirty(); return; }
  group.forEach(t => Save.data.pests[t]=true); Save.commit();
  const main = group[0], D = ENEMY[main], rest = group.slice(1);
  overlay(`<div class="panel newdef pestcard"><span class="tag">${D.boss?'Boss':'New pest'}</span>
      <div class="pest-art">${group.map(t=>`<canvas data-pest="${t}" width="160" height="160"></canvas>`).join('')}</div>
      <h3>${D.name}</h3><ul>${pestTraits(main).map(x=>`<li>${x}</li>`).join('')}</ul>
      ${rest.map(t=>`<p class="pest-also"><b>${ENEMY[t].name}:</b> ${pestTraits(t).filter(x=>!x.startsWith('Grows')).join(' ')}</p>`).join('')}</div>
    <div class="row"><button class="btn main" data-go="pest-ok">${pestQueue.length?'Next':'Got it'}</button></div>`);
  for (const cv of $('over').querySelectorAll('canvas[data-pest]')){
    // Draw every pest the same size on its card; fliers are drawn raised, so lower them to match.
    const t=cv.dataset.pest, E=ENEMY[t], c=cv.getContext('2d'), sz=44/E.size;
    c.translate(80, 84 + (E.fly ? sz*.28 : 0));
    drawEnemy(c, { type:t, size:E.size, ph:1.2, fly:!!E.fly, face:1, hp:1, max:1 }, sz);
  }
  Audio.play(D.boss ? (D.voice?'boss-'+D.voice:'boss') : 'pop');
}

// The crops counter shows the crop this garden is protecting.
function drawLivesIcon(){
  const cv=$('livesIcon'); if (!cv || !G.LV) return; const c=cv.getContext('2d');
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,40,40); drawCrop(c, G.LV.ch.crop, 20, 23, 78);
}
const highestPart = () => Math.max(...CHAPTERS.filter((ch,ci) => devMode || ci===0 || CHAPTERS[ci-1].levels.every(l => (Save.data.stars[l.gi]||0)>0)).map(c => c.act));
export function showMenu(){
  leaveLevel(); renderInfo(); disarmRestart(); dirty();
  const chapHtml = (ch, ci) => {
    // A garden opens only once every level of the garden before it is beaten.
    const prev = CHAPTERS[ci-1];
    if (ci>0 && !devMode && !prev.levels.every(l => (Save.data.stars[l.gi]||0)>0)){
      const done = prev.levels.filter(l => (Save.data.stars[l.gi]||0)>0).length;
      return `<div class="chap locked" aria-disabled="true"><header><span class="chap-lock">${ICON.lock}</span>
        <span><b>${ch.name}</b><small>Beat all 3 ${prev.name} levels to unlock · ${done} of 3 done</small></span></header></div>`;
    }
    const lvls = ch.levels.map(l => { const ok=unlocked(l.gi), st=Save.data.stars[l.gi]||0;
      return `<button class="lv${G.LV&&G.LV.gi===l.gi?' cur':''}" data-lv="${l.gi}" ${ok?'':'disabled'}>${l.waves>WAVES?`<i class="lv-long">${l.waves} waves</i>`:''}<b>${l.li+1}. ${l.name}</b>
        ${ok?`<span class="stars">${starStr(st)}</span>`:'<span class="lv-lock">Locked</span>'}</button>`; }).join('');
    return `<div class="chap"><header><canvas data-crop="${ch.crop}" width="80" height="80"></canvas>
      <span><b>${ch.name}</b><small>${ch.pests}</small></span></header><div class="lvls">${lvls}</div></div>`;
  };
  // Gardens grouped into the story's parts, each a section that opens and closes.
  // A part's name is hidden until one of its gardens is open. The part you're in starts open.
  const opened = ch => devMode || CHAPTERS.indexOf(ch)===0 || CHAPTERS[CHAPTERS.indexOf(ch)-1].levels.every(l => (Save.data.stars[l.gi]||0)>0);
  const current = Math.max(...CHAPTERS.filter(opened).map(c => c.act));
  const html = PARTS.map(P => {
    const chs = CHAPTERS.filter(c => c.act===P.n), reached = chs.some(opened);
    if (!reached) return `<section class="part locked"><div class="part-head"><span class="part-n">Part ${P.n}</span>
      <b>???</b><span class="part-meta">Finish Part ${P.n-1} to find out</span>${ICON.lock}</div></section>`;
    const lv = chs.flatMap(c => c.levels), got = lv.reduce((a,l) => a+(Save.data.stars[l.gi]||0), 0);
    // One part open at a time. It starts on the part you're in, and jumps ahead when you reach a new part.
    const F = Save.data.fold, open = (F.cur===current && F.open!=null ? F.open : current) === P.n;
    return `<section class="part${open?' open':''}" style="--part:${P.tint}">
      <button class="part-head" data-go="fold" data-part="${P.n}" aria-expanded="${open}"><span class="part-n">Part ${P.n}</span>
        <b>${P.name}</b><span class="part-meta">★ ${got}/${lv.length*3}</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="part-body">${chs.map(c => chapHtml(c, CHAPTERS.indexOf(c))).join('')}</div></section>`;
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
  stopShedTour();
  if (!devMode && !Save.data.shedTour && Save.data.tutorialDone && starsLeft()>0) startShedTour(false);
}

// ---------- Garden Shed ----------
function showShed(){
  const left=starsLeft();
  const rows = PERKS.filter(p => (!p.spray || sprayUnlocked()) && (!p.fert || fertUnlocked())).map(p => {
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
    ${devMode?'<p class="devnote">Test mode: you play with every upgrade already owned, whatever you buy here.</p>':''}
    ${highest()>=EXTRAS.firstLevel ? (()=>{ const n=EXTRAS.starsPerDay-starsToday();
      return `<div class="shed-bonus"><span><b>Bonus star</b><small>${n>0?`${noAds()?'Claim':'Watch a short ad for'} an extra star. ${n} left today.`:'Come back tomorrow for more.'}</small></span>
        <button class="btn ghost small" data-go="adstar" ${n>0?'':'disabled'}>${n>0?`${tv()}+★ 1`:'Done'}</button></div>`; })() : ''}
    <div class="perks">${rows}</div>
    ${sprayUnlocked()?'':`<p class="home-note">More upgrades unlock in ${LEVELS[SPRAY.unlock].ch.name}.</p>`}
    <div class="shed-foot"><button class="btn main" data-go="menu">Back to gardens</button>
    ${anyOwned?'<button class="btn ghost" data-go="refund">Refund all stars</button>':''}</div>`);
  emit('shedOpen');
}
function buyPerk(id){
  const p=PERKS.find(x=>x.id===id), tier=Save.data.perks[id]||0, cost=p.costs[tier];
  if (cost==null || cost>starsLeft()){ Audio.play('denied'); return; }
  Save.data.perks[id]=tier+1; Save.commit(); Audio.play('sparkle'); const y=window.scrollY; showShed(); window.scrollTo(0,y); emit('perk', id);
}

// ---------- Achievements ----------
function showAchievements(){
  const rows = ACHIEVEMENTS.map(a => {
    const got = Save.data.ach[a.id], prog = progressOf(a);
    return `<div class="ach${got?' got':''}"><span class="ach-icon" aria-hidden="true">${got?'★':ICON.lock}</span>
      <span class="ach-text"><b>${a.name}</b><small>${a.desc}</small>
      ${!got && prog!=null ? `<span class="ach-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${a.goal}" aria-valuenow="${prog}"><i style="width:${prog/a.goal*100}%"></i></span><small class="ach-num">${prog.toLocaleString()} / ${a.goal.toLocaleString()}</small>` : ''}
      </span>${got?`<span class="ach-date">${niceDate(got)}</span>`:''}</div>`;
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
// The chosen difficulty ('easy' | 'normal' | 'hard'); saves from the old Tough switch count as hard.
const diffOf = () => { const s=Save.data.settings; return DIFFICULTY[s.diff] ? s.diff : s.tough ? 'hard' : 'normal'; };
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
      <div class="set-row diff-row"><span><b>Difficulty</b><small>${DIFFICULTY[diffOf()].note} Changes start with your next level.</small></span>
        <div class="seg" role="radiogroup" aria-label="Difficulty">${Object.entries(DIFFICULTY).map(([k,d])=>`<button role="radio" aria-checked="${k===diffOf()}" data-go="diff" data-diff="${k}">${d.name}</button>`).join('')}</div></div>
    </div>
    <div class="set-group">
      <div class="set-row"><span><b>Tutorial</b><small>Play the guided first level again.</small></span>
        <button class="btn ghost small" data-go="replay-tutorial">Replay</button></div>
    </div>
    <div class="set-group">
      ${noAds() ? `<div class="set-row"><span><b>Ads removed</b><small>Thank you for supporting the game! 3× speed and second chances are yours for good.</small></span></div>`
        : `<div class="set-row"><span><b>Remove ads · ${EXTRAS.removeAdsPrice}</b><small>One purchase. Removes every ad, and unlocks 3× speed and second chances for good. Ads are only ever for optional extras.</small></span>
        <button class="btn main small" data-go="removeads">Remove ads</button></div>`}
      <div class="set-row"><span><b>Restore purchases</b><small>Got a new phone? Bring your purchase back.</small></span><button class="btn ghost small" data-go="restore">Restore</button></div>
      ${devMode&&noAds()?`<div class="set-row"><span><b>Test: forget Remove Ads</b><small>Undo the pretend purchase so you can test ads again.</small></span><button class="btn ghost small" data-go="forget-ads">Forget</button></div>`:''}
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
    <p>You beat the ${ENEMY[LV.boss].name} with ${lives} of ${maxLives} ${LV.ch.cropPlural} left.${stars<3?` Lose ${starLimits(maxLives)[0]} or fewer for three stars.`:''}</p>
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
  const LV=G.LV, left=starsLeft(), second = extrasHere() && !G.S.revived;
  overlay(`<h2>The pests got the ${LV.ch.cropPlural}</h2>
    <p>You reached wave ${wave} of ${LV.waves} in ${LV.name}.</p>
    ${left>0?`<p>You have ★ ${left} to spend in the Garden Shed. Upgrades there could help.</p>`:''}
    <div class="row"><button class="btn main" data-go="retry">Try again</button>
    ${second?`<button class="btn ghost offer" data-go="revive">${tv()}Keep going from wave ${wave} with ${Math.ceil(G.S.maxLives/2)} crops</button>`:''}
    ${left>0?'<button class="btn ghost" data-go="shed">Garden Shed</button>':''}
    <button class="btn ghost" data-go="menu">All gardens</button></div>`);
  dirty();
});

export function pause(){
  const S=G.S; if (!S || S.mode!=='play' || S.paused) return;
  if (!S.active && S.wave===0) return;           // nothing to protect yet
  S.paused=true;
  overlay(`<h2>Paused</h2><p>${G.LV.name}, wave ${S.wave} of ${G.LV.waves}</p>
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
    case 'diff': { const s=Save.data.settings; s.diff=b.dataset.diff; delete s.tough; Save.commit(); showSettings(); return; }
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
    case 'part-ok': return nextIntro();
    case 'fert-ok': { Save.data.seen.fert=true; Save.commit(); G.S.paused=false; hideOverlay(); dirty();
      msg('Save the Fertilizer for a big crowd or a boss.'); return nextIntro(); }
    case 'offer-yes': return offerYes && offerYes();
    case 'offer-no': return offerNo && offerNo();
    case 'revive': { b.disabled=true; if (await earn('second_chance', 'keep going with half your crops') && revive()){ hideOverlay(); msg(`Back in! Wave ${G.S.wave+1} again, with ${G.S.lives} crops.`); Audio.play('chime'); } else b.disabled=false; return; }
    case 'adstar': { b.disabled=true;
      if (starsToday()<EXTRAS.starsPerDay && await earn('bonus_star', 'one bonus star')){
        Save.data.adStars={ day:today(), n:starsToday()+1 }; Save.data.bonusStars=(Save.data.bonusStars||0)+1; Save.commit(); Audio.play('sparkle'); }
      showShed(); return; }
    case 'removeads': { b.disabled=true; const ok=await Store.buy(PRODUCTS.removeAds, { name:'Remove Ads', price:EXTRAS.removeAdsPrice });
      if (ok){ Audio.play('chime'); toast('<span><b>Thank you!</b><small>Ads are gone, and 3× speed and second chances are yours for good.</small></span>'); } showSettings(); return; }
    case 'restore': { const ok=await Store.restore(); toast(`<span><b>${ok?'Purchases restored':'Nothing to restore'}</b></span>`); showSettings(); return; }
    case 'forget-ads': { Store.forget(PRODUCTS.removeAds); Save.data.fast3Until=0; Save.data.adStars={day:'',n:0}; Save.commit(); showSettings(); return; }
    case 'pest-ok': return nextPest();
    case 'fold': {
      // Only one part open at a time: opening one folds the others.
      const n=+b.dataset.part, box=b.closest('.part'), open=!box.classList.contains('open');
      for (const o of document.querySelectorAll('.part.open')){ o.classList.remove('open'); o.querySelector('.part-head').setAttribute('aria-expanded', false); }
      box.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
      Save.data.fold = { open: open ? n : 0, cur: highestPart() }; Save.commit(); Audio.play('pop'); return; }
    case 'diary-ok': { if (afterDiary){ const f=afterDiary; afterDiary=null; return f(); } return nextIntro(); }
    case 'diary': return showDiary();
    case 'gotit': {
      const key=b.dataset.key; Save.data.seen[key]=true; Save.commit();
      G.S.paused=false; hideOverlay(); G.S.build=key; renderBar(); dirty();
      msg(`${TYPES[key].name} selected. Tap the grass to plant it.`);
      if (intro.length){ G.S.paused=true; nextIntro(); }
      return;
    }
  }
}

// ---------- defender tray & info panel ----------
onTutorialAllow(() => { if (G.S) renderBar(); });
export function renderBar(){
  const S=G.S, bar=$('bar'); bar.innerHTML='';
  const nextLocked = TRAY.find(k => !towerOpen(k));
  for (const key of TRAY){
    if (!towerOpen(key) && key!==nextLocked) continue;      // only tease the next defender to unlock
    const T=TYPES[key], open=towerOpen(key), b=document.createElement('button'), cost=S?costOf(key):T.cost;
    b.className='card'+(open?'':' locked')+(open&&!tutorialAllows(key)?' tut-off':''); b.id='card-'+key; b.setAttribute('aria-pressed', !!(S&&S.build===key));
    b.title = open ? `${T.name} · ${cost} seeds` : `${T.name} · unlocks at ${unlockLevelName(key)}`;
    b.setAttribute('aria-label', b.title);
    const ic=document.createElement('canvas'); drawIcon(ic, key, 44);
    b.append(ic);
    b.insertAdjacentHTML('beforeend', open ? `<b>${T.name}</b><span>${cost}</span>` : `<span class="lockic">${ICON.lock}</span><b>${T.name}</b><span>—</span>`);
    if (open && T.unlock>0 && Save.data.seen[key] && T.unlock===highest() && (Save.data.stars[T.unlock]||0)===0) b.insertAdjacentHTML('beforeend','<i class="new">NEW</i>');
    b.onclick=()=>{
      if (!G.S||G.S.mode!=='play'||G.S.paused) return;
      if (!open){ Audio.play('denied'); msg(`The ${T.name} unlocks when you reach ${unlockLevelName(key)}.`); return; }
      if (!tutorialAllows(key)){ Audio.play('denied'); return; }      // the tutorial step is about a different defender
      Audio.play('tap');
      G.S.build=G.S.build===key?null:key; G.S.sel=null; renderInfo(); renderBar();
      if (G.S.build){ msg(`${T.name}: ${T.desc} Touch the grass to see its reach, then let go to plant.`); emit('pickTower', key); }
    };
    bar.append(b);
  }
  dirty();
}
// What a helpful tile (or a drought) does for this defender, in one line.
function tileNote(t){
  const name=TYPES[t.type].name;
  if (t.tile==='hill') return t.type==='sunflower' ? `${name} on a hill. Hills give defenders more reach; Sunflowers like sunny patches.` : `${name} on a hill: 20% more range!`;
  if (t.tile==='sunny') return t.type==='sunflower' ? `${name} in a sunny patch: 50% more seeds!` : `${name} in a sunny patch: works 15% faster!`;
  return '';
}
// A small bubble over the board next to a tapped piece of scenery, offering to clear it.
function paintScenePop(){
  const S=G.S, o=S&&S.selScen, pop=$('scenePop');
  if (!o || S.sel || S.mode!=='play'){ pop.hidden=true; return; }
  const [name,verb]=SCENERY_NAMES[o.kind]||['Scenery','Clear'], cost=clearCost(o), big=o.w*o.h>1;
  pop.querySelector('b').textContent=name;
  pop.querySelector('small').textContent=`${big?'These spots are':'This spot is'} blocked. Clear it for seeds to plant a defender here.`;
  const btn=$('spClear'); btn.textContent=`${verb} · ${cost} seeds`; btn.disabled=S.seeds<cost;
  pop.hidden=false;
  // place it above the piece (or below, near the top edge), kept inside the board
  const cv=$('cv'), tile=cv.clientWidth/COLS, bw=pop.offsetWidth, bh=pop.offsetHeight;
  const cx=(o.c+o.w/2)*tile, top=o.r*tile, below=top-bh-10<0;
  pop.style.left=Math.max(6, Math.min(cv.clientWidth-bw-6, cx-bw/2))+'px';
  pop.style.top=(below ? (o.r+o.h)*tile+10 : top-bh-10)+'px';
  pop.classList.toggle('below', below);
  pop.style.setProperty('--ax', (cx-parseFloat(pop.style.left))+'px');
}
export function renderInfo(){
  paintScenePop();
  $('iSell').hidden=false;
  const t=G.S&&G.S.sel; $('info').hidden=!t; dirty(); if (!t) return;
  const T=TYPES[t.type];
  const extra=[tileNote(t).replace(/^.*?: /,'').replace(/^.*\. Hills.*$/,''), t.dry?'Thirsty: needs a Sprinkler nearby':''].filter(Boolean).join(' · ');
  $('iName').innerHTML=`${T.name}<em>Level ${t.lv+1}</em>`; $('iDesc').textContent=T.desc; $('iStats').textContent=statsText(t, G.S.perks)+(extra?` · ${extra}`:'');
}
on('select', renderInfo);

// ---------- HUD refresh (only touches the DOM when something changed) ----------
let lastKey='';
const dirty = () => { lastKey=''; };
export function refresh(){
  const S=G.S; if (!S) return;
  if (S.speed===3 && !fast3Open()){ S.speed=2; Save.data.settings.speed=2; Save.commit(); msg('Your hour of 3× speed is up. 2× is always free.'); }
  const key=[S.seeds,S.lives,S.wave,S.active,S.mode,S.speed,S.paused,S.sel&&S.sel.lv,G.LV.gi,Math.ceil(S.sprayCd*4),S.aiming,S.sprayOn,Math.ceil(S.fertCd*4),Math.ceil(S.fertT*4),S.adSeeds,S.adRefill].join('|');
  if (key===lastKey) return; lastKey=key;
  $('seeds').textContent=S.seeds; $('lives').textContent=S.lives; $('wave').textContent=`${S.wave}/${G.LV.waves}`;
  $('season').textContent=G.LV.season==='late summer'?'late':G.LV.season;
  const go=$('go'); go.disabled=S.active||S.mode!=='play'||S.paused;
  go.textContent = S.mode!=='play' ? 'Pick a level' : S.active ? `Wave ${S.wave}…` : S.wave+1===G.LV.waves ? 'Boss wave' : `Start wave ${S.wave+1}`;
  $('spd').textContent=S.speed+'×';
  $('restart').disabled=S.mode==='menu';
  for (const k of TRAY){ const el=$('card-'+k); if (el && towerOpen(k)) el.classList.toggle('poor', S.seeds<costOf(k)); }
  paintSpray(); paintFert(); paintOffers();
  if (S.selScen && !S.sel) paintScenePop();
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
function paintFert(){
  const S=G.S, b=$('fert'); b.hidden = !S || !S.fertOn || S.mode!=='play';
  if (b.hidden) return;
  b.classList.toggle('solo', $('spray').hidden);
  const on=S.fertT>0, ready=fertReady(), full=FERT.recharge*S.perks.fertRecharge;
  b.style.setProperty('--p', on ? S.fertT/S.perks.fertTime : ready ? 1 : 1 - S.fertCd/full);
  b.classList.toggle('on', on); b.classList.toggle('ready', ready);
  b.setAttribute('aria-label', on ? 'Fertilizer: working' : ready ? 'Fertilizer: ready' : `Fertilizer: ready in ${Math.ceil(S.fertCd)} seconds`);
  const cd=b.querySelector('.ab-cd'); cd.hidden = on || ready || !S.active; cd.textContent = Math.ceil(S.fertCd);
}
function paintOffers(){
  const S=G.S, ok = S && S.mode==='play' && !S.paused && extrasHere();
  const seeds=$('adSeeds'); seeds.hidden = !(ok && S.wave===0 && !S.active && !S.adSeeds);
  if (!seeds.hidden) seeds.innerHTML=`${tv()}+${EXTRAS.bonusSeeds} seeds`;
  const refill=$('adRefill'); refill.hidden = !(ok && S.sprayOn && S.active && !S.adRefill && !sprayReady() && S.sprayCd>EXTRAS.refillAfter);
  if (!refill.hidden) refill.innerHTML=`${tv()}Refill`;
}
function paintSpray(){
  const S=G.S, b=$('spray'); b.hidden = !S || !S.sprayOn || S.mode!=='play';
  if (b.hidden) return;
  const st=sprayStats(), ready=sprayReady() && S.active;
  b.style.setProperty('--p', ready ? 1 : 1 - S.sprayCd/st.recharge);
  b.classList.toggle('ready', ready); b.classList.toggle('aiming', !!S.aiming);
  const cd=b.querySelector('.ab-cd'); cd.hidden = ready || !S.active || S.sprayCd<=0; cd.textContent = Math.ceil(S.sprayCd);
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
  const S=G.S; if (!S) return;
  if (S.build && !S.aiming){
    // Placing a defender: show where it will go and how far it reaches.
    // A mouse previews on hover; a finger previews while pressed and plants on release.
    if (ev.pointerType==='mouse' || G.preview){ const [c,r]=cellAt(ev.clientX, ev.clientY); G.preview={ c, r, type:S.build }; }
    return;
  }
  if (!S.aiming) return;
  const [x,y]=tileAt(ev.clientX, ev.clientY); G.aim={ x, y, r:sprayStats().radius, drift:SPRAY.drift };
}
function onBoardUp(ev){
  const S=G.S, p=G.preview; if (!p || ev.pointerType==='mouse') return;
  G.preview=null; dirty();
  if (S && S.mode==='play' && !S.paused && S.build===p.type) tryPlant(p.c, p.r);
}
function tryPlant(c,r){
  const S=G.S, res=plantAt(c,r);
  if (res.ok){ if (!tutorialActive()) msg(tileNote(res.tower) || (S.wave===0&&S.towers.length===1?'Nice. Plant more, or tap Start wave when ready.':`${TYPES[res.tower.type].name} planted.`)); dirty(); return; }
  Audio.play('denied');
  if (res.reason==='seeds') msg(`Not enough seeds. ${res.name} costs ${res.cost}.`);
  else if (res.reason==='scenery') msg('Something’s in the way. Tap it to clear it for seeds.');
  else msg(r>=ROWS-1?'That’s your crop row. Plant on the grass.':'Keep the path clear. Plant on the grass.');
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
  if (t){ S.sel=t; S.selScen=null; S.build=null; renderBar(); renderInfo(); Audio.play('tap'); emit('select', t); return; }
  // tapping scenery always opens its clear bubble, even with a defender picked
  const piece=sceneryPiece(c,r);
  if (piece){ if (S.build){ S.build=null; renderBar(); } S.sel=null; S.selScen=piece; renderInfo(); Audio.play('tap'); return; }
  if (S.build){
    if (ev.pointerType==='mouse') return tryPlant(c,r);
    // touch: show the preview now, plant when the finger lifts (slide to adjust first)
    G.preview={ c, r, type:S.build }; try { $('cv').setPointerCapture(ev.pointerId); } catch {}
    dirty(); return;
  }
  if (S.sel || S.selScen){ S.sel=null; S.selScen=null; renderInfo(); }
}

export function initUI(){
  $('cv').addEventListener('pointerdown', onBoardTap);
  $('cv').addEventListener('pointermove', onBoardMove);
  $('cv').addEventListener('pointerup', onBoardUp);
  $('cv').addEventListener('pointercancel', () => { G.preview=null; });
  $('cv').addEventListener('pointerleave', ev => { if (ev.pointerType==='mouse') G.preview=null; });
  $('spray').onclick=onSprayBtn;
  $('over').addEventListener('click', onOverlayClick);
  $('home').addEventListener('click', onOverlayClick);
  $('go').onclick=()=>{ if (startWave()){ disarmRestart(); introducePests(); } };
  $('spd').onclick=()=>{ const S=G.S; if (!S) return;
    let next = S.speed===1?2:S.speed===2?3:1;
    const setSpeed = v => { S.speed=v; Save.data.settings.speed=v; Save.commit(); dirty(); };
    if (next===3 && !fast3Open()){
      if (!extrasHere()){ setSpeed(1); Audio.play('tap'); return; }        // no offers in the tutorial or first garden
      return offerCard('Super speed: 3×', noAds() ? '' : `Watch a short ad to unlock 3× speed for ${EXTRAS.fastHours} hour. 1× and 2× are always free.`, `${tv()}Unlock 3×`,
        async () => { if (await earn('fast_forward', `3× speed for ${EXTRAS.fastHours} hour`)){ Save.data.fast3Until=Date.now()+EXTRAS.fastHours*3600e3; setSpeed(3); msg('3× speed for the next hour!'); Audio.play('chime'); } else setSpeed(1); },
        () => setSpeed(1));
    }
    setSpeed(next); Audio.play('tap'); };
  $('fert').onclick=()=>{ const S=G.S; if (!S || S.paused || S.mode!=='play') return;
    if (!S.active){ Audio.play('denied'); msg('Save the Fertilizer for a wave. Start a wave first.'); return; }
    if (S.fertT>0){ msg('Your defenders are already fed!'); return; }
    if (!fertilize()){ Audio.play('denied'); msg(`The Fertilizer is getting ready. ${Math.ceil(S.fertCd)} seconds to go.`); return; }
    msg('Fertilized! Every defender works faster for a few seconds.'); dirty(); };
  $('adSeeds').onclick=async()=>{ const S=G.S; if (!S || S.adSeeds || S.wave>0) return;
    if (await earn('bonus_seeds', `+${EXTRAS.bonusSeeds} seeds`)){ S.adSeeds=true; addSeeds(EXTRAS.bonusSeeds); msg(`+${EXTRAS.bonusSeeds} seeds!`); Audio.play('sparkle'); } dirty(); };
  $('adRefill').onclick=async()=>{ const S=G.S; if (!S || S.adRefill || sprayReady()) return;
    if (await earn('spray_refill', 'a full Sprayer')){ refillSpray(); msg('Sprayer refilled!'); Audio.play('splash'); } dirty(); };
  $('restart').onclick=onRestart;
  $('sound').onclick=onSound;
  $('map').onclick=()=>{ Audio.play('tap'); showMenu(); };
  $('spClear').onclick=()=>{ const S=G.S, o=S.selScen; if (!o) return; const [name]=SCENERY_NAMES[o.kind]||['Scenery'];
    if (clearScenery(o)){ S.selScen=null; rebuild(); renderInfo(); Audio.play('pop'); msg(o.kind==='fire'?'Fire’s out! That spot is free now.':o.kind==='litter'||o.kind==='tire'?'All cleaned up! That spot is free now.':`${name} cleared. That spot is free now.`); }
    else { Audio.play('denied'); msg(`Not enough seeds. It costs ${clearCost(o)}.`); } };
  $('spClose').onclick=()=>{ G.S.selScen=null; renderInfo(); };
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

  on('waveStart', ({ wave, boss }) => { if (!tutorialActive() && !G.S.heat && !G.S.rain && !swarmAt(wave) && !pestQueue.length) msg(boss ? `Final wave! The ${ENEMY[G.LV.boss].name} is coming!` : wave===G.LV.waves-1 ? 'One more wave before the boss.' : 'Here they come…'); });
  on('rain', () => msg('Rain! Pests slow down in the wet, and every plant gets a drink.'));
  on('swarm', () => msg('Aphid boom! A huge swarm is hatching. Splash defenders and the spray shine here.'));
  on('heat', hot => msg(hot ? `Heat wave! ${hot} defender${hot>1?'s are':' is'} overheating. Defenders near a Sprinkler stay cool.` : 'Heat wave! Your Sprinklers are keeping everyone cool.'));
  on('fence', left => msg(left ? `Your Sturdy Fence stopped a pest! It can stop ${left} more this level.` : 'Your Sturdy Fence stopped a pest! That was its last one this level.'));
  on('waveClear', () => { if (G.S) { G.S.aiming=false; G.aim=null; } });
  on('waveClear', ({ wave, seeds, fromFlowers }) => msg(`Wave ${wave} cleared. +${seeds} seeds${fromFlowers?` (${fromFlowers} from sunflowers)`:''}.`));
}
