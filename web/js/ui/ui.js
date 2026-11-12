// Everything the player sees and taps outside the board: HUD, tray, panels and overlays.
import { G, DIFFICULTY, BOONS, takeBoon, undoPlant, bossWave, startLevel, startWave, towerAt, plantAt, upgrade, sell, costOf, upCostOf, spray, sprayReady, sprayStats, swarmAt, starLimits, fertReady, fertilize, revive, addSeeds, refillSpray, clearCost, canClear, sceneryPiece, clearScenery } from '../engine/game.js';
import { SCENERY_NAMES } from '../data/scenery.js';
import { SPRAY, PLANTS } from '../data/spray.js';
import { path } from '../engine/path.js';
import { TYPES, TRAY, statsText } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { PARTS, CHAPTERS, LEVELS, ENDLESS, WAVES, ROWS, COLS } from '../data/levels.js';
import { drawDiaryScene } from '../render/art-diary.js';
import { TOWER_FACTS, pestFact } from '../data/facts.js';
import { haptic, setHaptics } from '../../kit/js/haptics.js';
import { shouldAskRating, answerRating } from '../../kit/js/rating.js';
import { track, setTelemetry } from '../../kit/js/telemetry.js';
import { VERSION } from '../data/config.js';
import { SKILLS, SKILL_COSTS, SKILL_TOTAL, skillValues, skillsSpent } from '../data/skills.js';
import { challengesFor, challengeText, challengeMet, CHALLENGE_TOTAL } from '../data/challenges.js';
import { drawEnemy } from '../render/art-enemies.js';
import { PERKS, perkValues, ALL_PERKS, PRODUCTS } from '../data/perks.js';
import { Save, starsLeft, starsEarned, endlessStars } from '../save.js';
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
import { ACHIEVEMENTS, ACH_GROUPS } from '../data/achievements.js';
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
  startLevel(gi===ENDLESS.gi ? ENDLESS : gi, fast3Open() ? Save.data.settings.speed : Math.min(2, Save.data.settings.speed), bonusSeeds, { ...perkValues(owned), skills:skillValues(Save.data.skills) });
}
on('levelStart', (...a) => { drawLivesIcon(); return onLevelStart(...a); });
const onLevelStart = (LV => {
  if (devMode && !LV.ch.noSpray) G.S.sprayOn = true;
  $('board').classList.toggle('spray-left', path.exitCol >= 5);   // keep the button off the path's end
  setHome(false); hideOverlay(); disarmRestart(); resize(); renderBar(); renderInfo(); dirty();
  msg(LV.endless ? `Endless Garden. Best so far: wave ${Save.data.endless.best}.` : `${LV.ch.name} ${LV.li+1}: ${LV.name}. Plant your defenders, then tap Start wave.`);
  paintDiff();
  requestAnimationFrame(() => { refresh(); resize(); });   // the skill buttons may have just appeared beside the message
  if (quietStart){ quietStart=false; return; }                         // started silently behind the menu
  if (LV.gi===0 && !Save.data.tutorialDone){                           // the tutorial comes first, after the diary's opening page
    const p0=diaryEntry('start-cabbage');
    if (p0 && !Save.data.diary[p0.key]){ afterDiary=()=>{ G.S.paused=false; hideOverlay(); dirty(); startTutorial(); }; showDiaryPage(p0.key, 'Start gardening'); }
    else startTutorial();
    return; }
  // Cards to show before play, one after another: a diary page, new defenders, a new tool.
  intro = [];
  const page = diaryEntry(LV.li===0 ? `start-${LV.ch.id}` : `start-${LV.ch.id}-${LV.li+1}`);   // a garden's first level, or a page for a later level
  const firstOfPart = LV.li===0 && CHAPTERS.find(c => c.act===LV.ch.act)===LV.ch;
  if (firstOfPart && LV.ch.act>1 && !Save.data.parts[LV.ch.act]) intro.push(['part', LV.ch.act]);
  if (page && !Save.data.diary[page.key]) intro.push(['diary', page.key]);
  if (!Save.data.settings.diffAsked && !devMode) intro.push(['diff']);          // asked once: who's gardening?
  if (!Save.data.intros[LV.gi] && !(Save.data.stars[LV.gi]>0)) intro.push(['level']);
  if (!LV.endless && Save.data.stars[LV.gi]>0 && !chalShown.has(LV.gi) && Object.keys(chalGot(LV.gi)).length<challengesFor(LV).length) intro.push(['chal']);   // replaying a beaten level: its challenges                           // what this level is about, the first time
  if (!devMode){
    for (const k of TRAY) if (towerOpen(k) && TYPES[k].unlock>0 && !Save.data.seen[k]) intro.push(['defender', k]);
    if (G.S.sprayOn && !Save.data.seen.spray) intro.push(['spray']);
    if (G.S.fertOn && !Save.data.seen.fert) intro.push(['fert']);
  }
  nextIntro();
});
let intro = [], afterDiary = null;
// ---------- Challenge stars ----------
const CH_ICON = '✦';
const chalGot = gi => Save.data.chal[gi] || {};
export const chalCount = () => Object.values(Save.data.chal).reduce((n,o) => n+Object.keys(o).length, 0);
const chalList = (L, fresh=[]) => `<ul class="chal-list">${challengesFor(L).map(id => { const got=chalGot(L.gi)[id];
  return `<li class="${got?'got':''}"><i>${CH_ICON}</i><span>${challengeText(id, L)}${fresh.includes(id)?' <b>New!</b>':''}</span></li>`; }).join('')}</ul>`;
// Challenge stars are spent on defender skills.
const chalLeft = () => chalCount() + (devMode ? 60 : 0) - skillsSpent(Save.data.skills);
const chalShown = new Set();          // levels whose challenge card was shown this session
function showChalCard(){
  const LV=G.LV; chalShown.add(LV.gi); G.S.paused=true;
  overlay(`<div class="panel newdef levelcard"><span class="tag">Challenge stars · ${Object.keys(chalGot(LV.gi)).length} of ${challengesFor(LV).length}</span>
    <h3>${LV.name}</h3><p>You’ve beaten this level, so extra goals are open. Win while meeting any of them to earn its star, then spend stars on defender skills.</p>${chalList(LV)}</div>
    <div class="row"><button class="btn main" data-go="level-ok">Let’s go</button></div>`);
}
// Endless Garden: after every boss, pick one of three gifts.
function showBoons(ids){
  G.S.paused=true;
  overlay(`<div class="panel newdef"><span class="tag">Wave ${G.S.wave} cleared</span><h3>Pick a gift</h3>
    <p>It lasts for the rest of this run.</p>
    <div class="diff-pick">${ids.map(id=>`<button class="btn ghost" data-go="boon-pick" data-boon="${id}"><b>${BOONS[id].name}</b><small>${BOONS[id].desc}</small></button>`).join('')}</div></div>`);
}
function nextIntro(){
  const card = intro.shift();
  if (!card){ if (G.S && G.S.mode==='play'){ G.S.paused=false; hideOverlay(); dirty(); } return; }
  if (card[0]==='part') showPartCard(card[1]);
  else if (card[0]==='diary') showDiaryPage(card[1]);
  else if (card[0]==='defender') showNewDefender(card[1]);
  else if (card[0]==='fert') showFertIntro();
  else if (card[0]==='level') showLevelCard();
  else if (card[0]==='chal') showChalCard();
  else if (card[0]==='diff') showDiffChoice();
  else showSprayIntro();
}
// What this level is about: shown the first time it's played (the text used to sit under the board).
function showLevelCard(){
  const LV=G.LV, S=G.S; Save.data.intros[LV.gi]=true; Save.commit(); S.paused=true;
  const d=G.diffId!=='normal' ? ` · ${DIFFICULTY[G.diffId].name}` : '';
  overlay(`<div class="panel newdef levelcard"><span class="tag">${LV.endless ? 'After the story' : `${LV.ch.name} · ${LV.li+1} of ${LV.ch.levels.length}`}</span>
    <h3>${LV.name}</h3><p>${LV.intro}</p>
    <p class="lc-facts">${LV.endless?'Endless':LV.waves} waves · ${S.maxLives} ${LV.ch.cropPlural} to protect${d}</p>
    ${S.fence?`<p class="lc-facts">Your fence will stop the first ${S.fence} pests that get through.</p>`:''}</div>
    <div class="row"><button class="btn main" data-go="level-ok">Let’s go</button></div>`);
}
// Asked once, early: how hard should the pests be? It can be changed in Settings any time.
function showDiffChoice(){
  G.S.paused=true;
  overlay(`<div class="panel newdef"><span class="tag">One quick question</span><h3>Who’s gardening?</h3>
    <p>Pick how tough the pests are. You can change it any time in Settings.</p>
    <div class="diff-pick">${Object.entries(DIFFICULTY).map(([k,d])=>`<button class="btn ${k==='normal'?'main':'ghost'}" data-go="diff-pick" data-diff="${k}"><b>${d.name}</b><small>${d.note}</small></button>`).join('')}</div></div>`);
}
// A small badge on the board when the difficulty isn't Normal.
function paintDiff(){ const b=$('diffBadge'); b.hidden = G.diffId==='normal' || !G.diffId; b.textContent = G.diffId ? DIFFICULTY[G.diffId].name : ''; b.dataset.diff = G.diffId||''; }
// A diary page, shown on a sheet of lined paper. Marked as read once shown.
// A title card when the story moves into a new part. Shown once.
function showPartCard(n){
  const P=PARTS[n-1]; Save.data.parts[n]=true; Save.commit();
  if (G.S) G.S.paused=true;
  overlay(`<div class="part-card" style="--part:${P.tint}">${P.before?`<p class="part-before">${P.before}</p>`:''}<canvas class="diary-art part-art" data-scene="part-${n}"></canvas><span>Part ${n}</span><h2>${P.name}</h2></div>
    <div class="row"><button class="btn main" data-go="part-ok">Begin</button></div>`);
  $('over').classList.add('part-over'); paintScenes($('over'));
  Audio.play('wave');
}
const esc = t => String(t).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
const gardener = () => esc((Save.data.settings.name || 'Robin').trim() || 'Robin');
const diaryText = d => d.key==='start-cabbage' ? `This diary belongs to ${gardener()}. ${d.text}` : d.text;
const paintScenes = root => { for (const cv of root.querySelectorAll('canvas[data-scene]')) if (!drawDiaryScene(cv, cv.dataset.scene)) cv.remove(); };
function showDiaryPage(key, cont='Continue'){
  const d=diaryEntry(key); Save.data.diary[key]=true; Save.commit(); emit('diary', key);
  if (G.S) G.S.paused=true;
  overlay(`<div class="diary-page"><canvas class="diary-art" data-scene="${key}"></canvas><span class="diary-tag">From the garden diary</span><h3>${d.title}</h3><p>${diaryText(d)}</p></div>
    <div class="row"><button class="btn main" data-go="diary-ok">${cont}</button></div>`);
  paintScenes($('over'));
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
  const ok = await Ads.showRewarded(placement, label); if (ok) track('extra_used', { kind:String(placement).toLowerCase().replace(/[^a-z0-9_]/g,'_').slice(0,24) });
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
    <h3>Compost</h3><p>Kitchen scraps and old leaves, turned into good food for your garden. Tap the green button during a wave and every defender works faster for a few seconds.</p>
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
        ${ok?`<span class="stars">${starStr(st)}</span>`:'<span class="lv-lock">Locked</span>'}
        ${st>0?`<span class="lv-chal">${challengesFor(l).map(id=>`<i class="${chalGot(l.gi)[id]?'got':''}">${CH_ICON}</i>`).join('')}</span>`:''}</button>`; }).join('');
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
  const hi=LEVELS[highest()], allDone=(Save.data.stars[LEVELS.length-1]||0)>0;
  home(`<div class="home-head"><h2><small class="where">Part ${hi.ch.act} · ${PARTS[hi.ch.act-1].name}</small>${hi.ch.name}</h2>
      <button class="shed-btn" data-go="shed">${ICON.shed}Garden Shed <b>★ ${starsLeft()}</b></button></div>
    ${(Save.data.stars[0]||0)>0 || devMode ? `<button class="skills-btn" data-go="skills"><span><b>Defender skills</b><small>Spend challenge stars to make each defender special.</small></span><b class="sk-left">${CH_ICON} ${chalLeft()}</b></button>` : ''}
    ${allDone ? `<p class="home-note">The story is finished. Every garden is open to replay.</p>`
      : `<button class="btn main continue" data-lv="${hi.gi}">${(Save.data.stars[0]||0)>0?'Continue':'Start'} · ${hi.ch.name} ${hi.li+1}: ${hi.name}</button>`}
    ${html}
    ${storyDone()?`<button class="endless-card" data-go="endless"><span><small>After the story</small><b>Endless Garden</b><em>Waves never stop. A boss every 5th wave.</em></span><span class="e-best"><small>Best</small><b>${Save.data.endless.best}</b></span></button>`:''}
    ${devMode?'<p class="devnote">Test mode is on: every level and defender is unlocked. Tap the title 7 times to turn it off.</p>':''}
    <div class="home-tools">
      <button class="tool-btn wide" data-go="achievements">${ICON.trophy}<span>Achievements</span><b>${achievementCount()}/${ACHIEVEMENTS.length}</b></button>
      <button class="tool-btn" data-go="diary">${ICON.book}<span>Diary</span></button>
      <button class="tool-btn" data-go="guide">${ICON.map}<span>Field guide</span></button>
      <button class="tool-btn" data-go="stats">${ICON.trophy}<span>Stats</span></button>
      <button class="tool-btn" data-go="settings">${ICON.gear}<span>Settings</span></button>
    </div>`);
  for (const c2 of $('home').querySelectorAll('canvas[data-crop]')){ const c=c2.getContext('2d'); c.setTransform(2,0,0,2,0,0); drawCrop(c,c2.dataset.crop,20,24,66); }
  stopShedTour();
  if (!devMode && !Save.data.shedTour && Save.data.tutorialDone && starsLeft()>0) startShedTour(false);
}

const storyDone = () => devMode || (Save.data.stars[LEVELS.length-1]||0)>0;
// ---------- Garden Shed ----------
function showShed(){
  const left=starsLeft();
  const perkRow = p => {
    const tier=Save.data.perks[p.id]||0, maxed=tier>=p.costs.length, cost=p.costs[tier];
    const desc = p.desc(maxed ? tier-1 : tier);
    return `<div class="perk"><h3>${p.name}</h3>
      <button data-perk="${p.id}" ${maxed||cost>left?'disabled':''}>${maxed?'Owned':`★ ${cost}`}</button>
      <p>${maxed?desc:(tier?`Next: ${desc}`:desc)}</p>
      <span class="tiers">${p.costs.map((_,i)=>`<i class="${i<tier?'on':''}"></i>`).join('')}</span></div>`;
  };
  const rows = PERKS.filter(p => !p.post && (!p.spray || sprayUnlocked()) && (!p.fert || fertUnlocked())).map(perkRow).join('');
  const postRows = storyDone() ? PERKS.filter(p => p.post).map(perkRow).join('') : '';
  const anyOwned = Object.values(Save.data.perks).some(Boolean);
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button>
      <h2>Garden Shed</h2><span class="star-count">★ ${left}</span></div>
    <p class="home-note">Spend stars on upgrades that help in every level. Earn more stars by beating levels with more crops left.</p>
    ${devMode?'<p class="devnote">Test mode: you play with every upgrade already owned, whatever you buy here.</p>':''}
    ${highest()>=EXTRAS.firstLevel ? (()=>{ const n=EXTRAS.starsPerDay-starsToday();
      return `<div class="shed-bonus"><span><b>Bonus star</b><small>${n>0?`${noAds()?'Claim':'Watch a short ad for'} an extra star. ${n} left today.`:'Come back tomorrow for more.'}</small></span>
        <button class="btn ghost small" data-go="adstar" ${n>0?'':'disabled'}>${n>0?`${tv()}+★ 1`:'Done'}</button></div>`; })() : ''}
    <div class="perks">${rows}</div>
    ${postRows?`<h3 class="ach-group">After the story<small>Endless Garden: ★ ${endlessStars()} earned</small></h3>
      <p class="home-note">Every 3 waves of your best Endless Garden run earns a star.</p><div class="perks">${postRows}</div>`:''}
    ${sprayUnlocked()?'':`<p class="home-note">More upgrades unlock in ${LEVELS[SPRAY.unlock].ch.name}.</p>`}
    <div class="shed-foot"><button class="btn main" data-go="menu">Back to gardens</button>
    ${anyOwned?'<button class="btn ghost" data-go="refund">Refund all stars</button>':''}</div>`);
  emit('shedOpen');
}
function buyPerk(id){
  const p=PERKS.find(x=>x.id===id), tier=Save.data.perks[id]||0, cost=p.costs[tier];
  if (cost==null || cost>starsLeft()){ Audio.play('denied'); return; }
  Save.data.perks[id]=tier+1; Save.commit(); Audio.play('sparkle'); const y=window.scrollY; showShed(); window.scrollTo(0,y); emit('perk', id); track('shed_buy', { perk:id, tier:tier+1 });
}

// ---------- Achievements ----------
function showAchievements(){
  const row = a => {
    const got = Save.data.ach[a.id], prog = progressOf(a);
    return `<div class="ach${got?' got':''}"><span class="ach-icon" aria-hidden="true">${got?'★':ICON.lock}</span>
      <span class="ach-text"><b>${a.name}</b><small>${a.desc}</small>
      ${!got && prog!=null ? `<span class="ach-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${a.goal}" aria-valuenow="${prog}"><i style="width:${prog/a.goal*100}%"></i></span><small class="ach-num">${prog.toLocaleString()} / ${a.goal.toLocaleString()}</small>` : ''}
      </span>${got?`<span class="ach-date">${niceDate(got)}</span>`:''}</div>`;
  };
  const listed = new Set(ACH_GROUPS.flatMap(g => g[1]));
  const rows = ACH_GROUPS.map(([name, ids], i) => {
    const list = ACHIEVEMENTS.filter(a => i===0 ? !listed.has(a.id) : ids.includes(a.id));
    if (!list.length) return '';
    return `<h3 class="ach-group">${name}<small>${list.filter(a=>Save.data.ach[a.id]).length}/${list.length}</small></h3>${list.map(row).join('')}`;
  }).join('');
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button>
      <h2>Achievements</h2><span class="star-count">${achievementCount()}/${ACHIEVEMENTS.length}</span></div>
    <div class="achs">${rows}</div>`);
}

// ---------- Diary ----------
// The diary is a journal you page through, one entry per page, each with a small picture.
// A page is written once it has been read in a level, or once its level is already behind you.
function pageWritten(d){
  if (Save.data.diary[d.key]) return true;
  const m=d.key.match(/^(start|after)-([a-z]+)(?:-(\d))?$/), ch=m && CHAPTERS.find(c => c.id===m[2]); if (!ch) return false;
  const lv = m[1]==='after' ? ch.levels[ch.levels.length-1] : ch.levels[(+m[3]||1)-1];
  return (Save.data.stars[lv.gi]||0)>0;
}
let jPage = 0;
function showDiary(at){
  const pages = DIARY.filter(pageWritten);
  let wrote=false; for (const d of pages) if (!Save.data.diary[d.key]){ Save.data.diary[d.key]=true; wrote=true; }
  if (wrote){ Save.commit(); emit('diary'); }
  jPage = Math.max(0, Math.min(pages.length-1, at==null ? pages.length-1 : at));
  const d = pages[jPage];
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button><h2>${gardener()}’s diary</h2><span class="star-count">${pages.length}/${DIARY.length}</span></div>
    ${d ? `<div class="journal"><div class="j-rings" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
        <div class="j-page" id="jPage"><canvas class="diary-art" data-scene="${d.key}"></canvas>
          <h3>${d.title}</h3><p>${diaryText(d)}</p><span class="j-num">Page ${jPage+1}</span></div></div>
      <div class="j-nav"><button class="btn ghost" data-go="j-prev" ${jPage===0?'disabled':''}>‹ Earlier</button>
        <button class="btn ghost" data-go="j-next" ${jPage>=pages.length-1?'disabled':''}>Later ›</button></div>
      ${pages.length<DIARY.length?'<p class="home-note">More pages get written as you play.</p>':''}`
      : '<p class="home-note">Your diary is empty. Start your first garden to write the first page.</p>'}`);
  paintScenes($('home'));
  // swipe left or right to turn the page
  const el=$('jPage'); if (el){ let x0=null;
    el.addEventListener('pointerdown', e => { x0=e.clientX; });
    el.addEventListener('pointerup', e => { if (x0!=null && Math.abs(e.clientX-x0)>40) turnPage(e.clientX<x0 ? 1 : -1); x0=null; }); }
}
function turnPage(dir){
  const n=DIARY.filter(pageWritten).length, to=jPage+dir; if (to<0 || to>=n) return;
  Audio.play('page'); showDiary(to);
  const el=$('jPage'); if (el) el.classList.add(dir>0 ? 'turn-next' : 'turn-prev');
}

// ---------- Defender skills: two branches per defender, bought with challenge stars ----------
function showSkills(){
  const left=chalLeft(), open=TRAY.filter(towerOpen);
  const cards=open.map(k => { const T=TYPES[k], own=Save.data.skills[k]||{};
    const rows=SKILLS[k].map(br => { const n=own[br.id]||0, max=n>=SKILL_COSTS.length, cost=SKILL_COSTS[n];
      return `<div class="sk-branch"><span><b>${br.name}</b><span class="tiers">${SKILL_COSTS.map((_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>
          <small>${max ? br.desc(n-1) : `${n?'Next: ':''}${br.desc(n)}`}</small></span>
        ${max ? '<span class="sk-max">Full</span>' : `<button class="btn ${left>=cost?'main':'ghost'} small" data-go="skill-buy" data-type="${k}" data-br="${br.id}" ${left>=cost?'':'disabled'}>${CH_ICON} ${cost}</button>`}</div>`; }).join('');
    return `<div class="sk-card"><header><canvas data-tower="${k}"></canvas><b>${T.name}</b></header>${rows}</div>`; }).join('');
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button><h2>Defender skills</h2><span class="star-count">${CH_ICON} ${left}</span></div>
    <p class="home-note">Earn challenge stars (${CH_ICON}) by replaying levels you’ve beaten and meeting their extra goals. You have earned ${chalCount()} of ${CHALLENGE_TOTAL}; every skill together costs ${SKILL_TOTAL}, so choose your favorites.</p>
    <div class="sk-list">${cards}</div>
    ${open.length<TRAY.length?`<p class="home-note">${TRAY.length-open.length} more defender${TRAY.length-open.length>1?'s':''} to unlock.</p>`:''}
    <div class="row"><button class="btn ghost small" data-go="skill-refund" ${skillsSpent(Save.data.skills)?'':'disabled'}>Refund all skills</button></div>`);
  for (const cv of $('home').querySelectorAll('canvas[data-tower]')) drawIcon(cv, cv.dataset.tower, 44);
}

// ---------- Field guide: every defender and every pest met so far ----------
const guideCount = () => `${TRAY.filter(towerOpen).length + Object.keys(Save.data.pests||{}).length}/${TRAY.length + Object.keys(ENEMY).length}`;
function showGuide(tab){
  setupPestsSeen();
  const met = Save.data.pests||{};
  const pestIds = Object.keys(ENEMY), seen = pestIds.filter(t => devMode || met[t]);
  const cards = tab==='pests'
    ? pestIds.map(t => { const E=ENEMY[t]; if (!(devMode || met[t])) return `<div class="g-card unknown"><span class="g-q">?</span><b>Not met yet</b></div>`;
        return `<div class="g-card"><canvas data-pest="${t}" width="128" height="128"></canvas><b>${E.name}${E.boss?' <i>Boss</i>':''}</b>
          <ul>${pestTraits(t).map(x=>`<li>${x}</li>`).join('')}</ul><p class="g-fact">${pestFact(t)}</p></div>`; }).join('')
    : TRAY.map(k => { const T=TYPES[k]; if (!towerOpen(k)) return `<div class="g-card unknown"><span class="g-q">?</span><b>Unlocks in ${LEVELS[T.unlock].ch.name}</b></div>`;
        return `<div class="g-card"><canvas data-tower="${k}"></canvas><b>${T.name}</b><p>${T.desc}</p><p class="g-fact">${TOWER_FACTS[k]||''}</p></div>`; }).join('');
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button><h2>Field guide</h2></div>
    <div class="seg" role="tablist"><button role="tab" aria-checked="${tab!=='pests'}" data-go="guide" data-tab="defenders">Defenders ${TRAY.filter(towerOpen).length}/${TRAY.length}</button>
      <button role="tab" aria-checked="${tab==='pests'}" data-go="guide" data-tab="pests">Pests ${seen.length}/${pestIds.length}</button></div>
    <div class="guide">${cards}</div>`);
  for (const cv of $('home').querySelectorAll('canvas[data-tower]')) drawIcon(cv, cv.dataset.tower, 64);
  for (const cv of $('home').querySelectorAll('canvas[data-pest]')){
    const t=cv.dataset.pest, E=ENEMY[t], c=cv.getContext('2d'), sz=36/E.size;
    c.translate(64, 68 + (E.fly ? sz*.28 : 0)); drawEnemy(c, { type:t, size:E.size, ph:1.2, fly:!!E.fly, face:1, hp:1, max:1 }, sz);
  }
}

// ---------- Stats ----------
function showStats(){
  const s=Save.data.stats, n=v=>(v||0).toLocaleString(), beaten=LEVELS.filter(l=>(Save.data.stars[l.gi]||0)>0).length;
  const games=(s.wins||0)+(s.losses||0);
  const rows=[
    ['Levels beaten', `${beaten} of ${LEVELS.length}`], ['Stars earned', n(starsEarned())],
    ['Challenge stars', `${chalCount()} of ${CHALLENGE_TOTAL}`],
    ['Defender skills bought', `${Object.values(Save.data.skills).reduce((s,o)=>s+Object.values(o).reduce((a,b)=>a+b,0),0)} of ${Object.keys(SKILLS).length*6}`],
    ['Three-star levels', `${LEVELS.filter(l=>Save.data.stars[l.gi]===3).length} of ${LEVELS.length}`],
    ['Games won', n(s.wins)], ['Games lost', n(s.losses)], ['Win rate', games ? Math.round(s.wins/games*100)+'%' : '—'],
    ['Pests squashed', n(s.kills)], ['Bosses beaten', n(s.bossKills)], ['Seeds from Sunflowers', n(s.flowerSeeds)],
    ['Pests hit by the Sprayer', n(s.sprayHits)], ['Times Compost was used', n(s.ferts)], ['Birds scared off', n(s.scares)],
    ['Things cleared out of the way', n(s.clears)], ['Wins on Hard', n(s.toughWins)],
    ['Diary pages written', `${DIARY.filter(pageWritten).length} of ${DIARY.length}`],
    ['Endless Garden best wave', n(Save.data.endless.best)], ['Endless Garden runs', n(Save.data.endless.runs)],
  ];
  home(`<div class="home-head"><button class="btn ghost icon" data-go="menu" aria-label="Back to gardens">${ICON.back}</button><h2>Stats</h2></div>
    <div class="stats-list">${rows.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`);
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
      ${toggle('t-haptics','Vibration',s.haptics!==false,'A small buzz when you plant, and when pests reach the crops.')}
    </div>
    <div class="set-group">
      <div class="set-row"><span><b>Gardener’s name</b><small>The name on the diary.</small></span>
        <input class="name-in" id="gName" maxlength="12" value="${gardener()}" aria-label="Gardener’s name" autocomplete="off" spellcheck="false"></div>
      ${toggle('t-share','Share anonymous play data',s.share!==false,'Only counts like “level 7 won with 3 stars”. Never your name, your device or anything that could identify you.')}
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
    <p class="version">Carrot Patch Defense · version ${VERSION}</p>`);
  const gn=$('gName'); if (gn) gn.onchange=()=>{ Save.data.settings.name=gn.value.replace(/[<>&"']/g,'').trim().slice(0,12) || 'Robin'; Save.commit(); };
}

on('win', w => {
  const LV=G.LV, page = LV.li===LV.ch.levels.length-1 && diaryEntry(`after-${LV.ch.id}`);
  if (page && !Save.data.diary[page.key]){ recordWin(w); afterDiary = () => showWin(w, true); showDiaryPage(page.key, 'See your stars'); return; }
  showWin(w);
});
function recordWin({ stars, gi }){
  if (recordWin.done===gi) return; recordWin.done=gi;
  const before=Save.data.stars[gi]||0;
  recordWin.before=before; recordWin.fresh=[];
  if (before>0){                                    // a replay: any challenge met for the first time earns its star
    const got=Save.data.chal[gi] || (Save.data.chal[gi]={});
    for (const id of challengesFor(LEVELS[gi])) if (!got[id] && challengeMet(id, G.S)){ got[id]=true; recordWin.fresh.push(id); }
    if (recordWin.fresh.length) emit('challenge', recordWin.fresh.length);
  }
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
    ${before>0 ? `<div class="chal-box"><b>Challenge stars${recordWin.fresh.length?` · +${recordWin.fresh.length} ${CH_ICON}`:''}</b>${chalList(LV, recordWin.fresh)}</div>`
      : `<p class="pause-intro">${CH_ICON} Three challenge stars are now open on this level. Play it again to try for them.</p>`}
    ${unlocks.length&&before===0?`<p>Next level unlocks the ${unlocks.map(k=>TYPES[k].name).join(' and ')}!</p>`:''}
    <div class="row">${next?`<button class="btn main" data-go="next">${next.ci!==LV.ci?`On to ${next.ch.name}`:'Next level'}</button>`:''}
    ${gained?'<button class="btn ghost" data-go="shed">Garden Shed</button>':''}
    <button class="btn ghost" data-go="retry">Play again</button><button class="btn ghost" data-go="menu">All gardens</button></div>
    ${stars===3 && LV.li===LV.ch.levels.length-1 && shouldAskRating(Save, { wins:Save.data.stats.wins }) ? `<div class="rate-box" id="rateBox"><b>Enjoying the garden?</b>
      <span>A rating helps other families find it.</span><div class="row"><button class="btn main small" data-go="rate" data-a="ok">OK</button>
      <button class="btn ghost small" data-go="rate" data-a="later">Not now</button><button class="btn ghost small" data-go="rate" data-a="never">Never ask me again</button></div></div>` : ''}
    ${next?'':`<div class="row"><button class="btn main" data-go="ending">${Save.data.ended?'See the ending again':'Finish the story'}</button></div>`}`);
  dirty();
}
on('lose', ({ wave }) => {
  stopTutorial();
  Save.data.stats.losses++; Save.commit(); Audio.play('lose');
  const LV=G.LV, left=starsLeft(), second = extrasHere() && !G.S.revived && !LV.endless;
  if (LV.endless){
    const E=Save.data.endless, cleared=wave-1; E.runs++; Save.commit();
    overlay(`<h2>${cleared>=E.best && cleared>0 ? 'A new best!' : 'The garden rests'}</h2>
      <p>You held the Endless Garden for ${cleared} wave${cleared===1?'':'s'}. Your best is ${E.best}.</p>
      <p>Endless stars: ★ ${endlessStars()}. The next one comes at wave ${(endlessStars()+1)*3}.</p>
      <p class="tip"><b>Tip:</b> ${lossTip()}</p>
      <div class="row"><button class="btn main" data-go="retry">Go again</button><button class="btn ghost" data-go="shed">Garden Shed</button><button class="btn ghost" data-go="menu">All gardens</button></div>`);
    dirty(); return;
  }
  overlay(`<h2>The pests got the ${LV.ch.cropPlural}</h2>
    <p>You reached wave ${wave} of ${LV.waves} in ${LV.name}.</p>
    <p class="tip"><b>Tip:</b> ${lossTip()}</p>
    ${left>0?`<p>You have ★ ${left} to spend in the Garden Shed.</p>`:''}
    <div class="row"><button class="btn main" data-go="retry">Try again</button>
    ${second?`<button class="btn ghost offer" data-go="revive">${tv()}Keep going from wave ${wave} with ${Math.ceil(G.S.maxLives/2)} crops</button>`:''}
    ${left>0?'<button class="btn ghost" data-go="shed">Garden Shed</button>':''}
    <button class="btn ghost" data-go="menu">All gardens</button></div>`);
  dirty();
});

// One tip after a loss, based on the kind of pest that ate the most crops.
function lossTip(){
  const S=G.S, top=Object.entries(S.leaks).sort((a,b)=>b[1]-a[1])[0];
  if (!top) return 'Plant defenders near the bends, where pests pass more than once.';
  const D=ENEMY[top[0]], name=D.name, ground=Object.values(TYPES).filter(T=>T.ground).map(T=>T.name+'s').join(' and ');
  if (D.boss) return `The ${name} got through. Upgrade your strongest defenders to level 3 before the last wave${S.fertOn?', and save your Compost for it':''}.`;
  if (D.fly) return `Most of what got through was flying (${name}s). ${ground} can’t reach fliers, so add Carrot Bunnies${towerOpen('rose')?' or Thorny Roses':''} near the end of the path.`;
  if (D.armor) return `${name}s wear armor, so small hits barely dent them. Big hitters like ${towerOpen('owl')?'Night Owls and ':''}Pine Trees get through it.`;
  if (D.burrow) return `${name}s tunnel under part of the path. Spread defenders along the whole path so something is waiting where they come up.`;
  if (D.spd>=1.4 || D.hopper) return `${name}s are quick. A Sprinkler slows everything near it, which gives your other defenders time.`;
  return `${name}s came in crowds. Pine Trees and Sprinklers hit many pests at once, and upgrades beat extra defenders.`;
}
// The ending: shown after the last level, and again any time from its win screen.
function showEnding(){
  const first=!Save.data.ended; Save.data.ended=true; Save.commit(); emit('ending');
  const todo=ACHIEVEMENTS.length-achievementCount();
  overlay(`<div class="part-card ending" style="--part:#f6c344"><span>The End</span><h2>The garden is yours for good.</h2></div>
    <p class="ending-text">Twelve gardens, thirty-six harvests, and one sprayer left to rust in the shed. Thank you for playing.</p>
    <p class="ending-text small">${first?'The <b>Endless Garden</b> is now open. ':''}${todo?`${todo} achievement${todo>1?'s are':' is'} still waiting.`:''}</p>
    <div class="row"><button class="btn main" data-go="endless">Endless Garden</button><button class="btn ghost" data-go="menu">All gardens</button></div>`);
  $('over').classList.add('part-over');
  Audio.play('win');
}

export function pause(){
  const S=G.S; if (!S || S.mode!=='play' || S.paused) return;
  if (!S.active && S.wave===0) return;           // nothing to protect yet
  S.paused=true;
  overlay(`<h2>Paused</h2><p>${G.LV.name}, wave ${S.wave}${G.LV.endless?'':` of ${G.LV.waves}`}${G.diffId!=='normal'?` · ${DIFFICULTY[G.diffId].name}`:''}</p><p class="pause-intro">${G.LV.intro}</p>
    ${G.LV.endless ? (S.boons.length?`<p class="pause-intro"><b>Gifts:</b> ${S.boons.map(id=>BOONS[id].name).join(', ')}</p>`:'')
      : Save.data.stars[G.LV.gi]>0 ? `<div class="chal-box">${chalList(G.LV)}</div>` : ''}
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
    case 'diff': { const s=Save.data.settings; s.diff=b.dataset.diff; s.diffAsked=true; delete s.tough; Save.commit(); showSettings(); return; }
    case 'replay-tutorial': Save.data.tutorialDone=false; Save.commit(); return play(0);
    case 'shed': leaveLevel(); return showShed();
    case 'refund': Save.data.perks={}; Save.commit(); return showShed();
    case 'skills': leaveLevel(); return showSkills();
    case 'skill-buy': { const [type, br]=[b.dataset.type, b.dataset.br], o=Save.data.skills[type] || (Save.data.skills[type]={}), n=o[br]||0;
      if (n>=SKILL_COSTS.length || chalLeft()<SKILL_COSTS[n]) return Audio.play('denied');
      o[br]=n+1; Save.commit(); Audio.play('sparkle'); haptic('light'); track('skill_buy', { type, branch:br, step:n+1 }); emit('skill', type);
      const y=window.scrollY; showSkills(); window.scrollTo(0,y); return; }
    case 'skill-refund': Save.data.skills={}; Save.commit(); return showSkills();
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
    case 'level-ok': return nextIntro();
    case 'rate': { const a=b.dataset.a; answerRating(Save, a); track('rating', { answer:a }); const box=$('rateBox'); if (box) box.innerHTML = a==='ok' ? '<b>Thank you!</b>' : '<span>No problem.</span>'; return; }
    case 't-haptics': { const s=Save.data.settings; s.haptics=s.haptics===false; setHaptics(s.haptics); Save.commit(); haptic('medium'); showSettings(); return; }
    case 't-share': { const s=Save.data.settings; s.share=s.share===false; setTelemetry(s.share); Save.commit(); showSettings(); return; }
    case 'boon-pick': { const id=b.dataset.boon; if (takeBoon(id)){ G.S.paused=false; hideOverlay(); Audio.play('sparkle'); msg(`${BOONS[id].name}: ${BOONS[id].desc}`); dirty(); } return; }
    case 'ending': return showEnding();
    case 'endless': return play(ENDLESS.gi);
    case 'guide': return showGuide(b.dataset.tab||'defenders');
    case 'stats': return showStats();
    case 'j-prev': case 'j-next': return turnPage(b.dataset.go==='j-next' ? 1 : -1);
    case 'diff-pick': { const s=Save.data.settings; s.diff=b.dataset.diff; s.diffAsked=true; delete s.tough; Save.commit();
      G.diffId=s.diff; G.diff=DIFFICULTY[s.diff].hp; paintDiff(); return nextIntro(); }
    case 'fert-ok': { Save.data.seen.fert=true; Save.commit(); G.S.paused=false; hideOverlay(); dirty();
      msg('Save the Compost for a big crowd or a boss.'); return nextIntro(); }
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
      if (G.S.build){ msg(`${T.name}. Touch the grass to see its reach, then let go to plant.`); emit('pickTower', key); }
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
const LIVING = ['bush','sapling','clover','skep'];
const moved = o => G.CH.act===4 && LIVING.includes(o.kind);
// A small bubble over the board next to a tapped piece of scenery, offering to clear it.
function paintScenePop(){
  const S=G.S, o=S&&S.selScen, pop=$('scenePop');
  if (!o || S.sel || S.mode!=='play'){ pop.hidden=true; return; }
  const [name,verb0]=SCENERY_NAMES[o.kind]||['Scenery','Clear'], cost=clearCost(o), big=o.w*o.h>1;
  // In Part 4 living things are moved, never cleared, and the pond stays.
  const gentle=moved(o), verb=gentle ? 'Replant' : verb0, stays=!canClear(o);
  pop.querySelector('b').textContent=name;
  pop.querySelector('small').textContent = stays ? 'The pond stays. The frogs live here now.'
    : gentle ? 'Move it to a better spot to plant a defender here.'
    : `${big?'These spots are':'This spot is'} blocked. Clear it for seeds to plant a defender here.`;
  const btn=$('spClear'); btn.hidden=stays; btn.textContent=`${verb} · ${cost} seeds`; btn.disabled=S.seeds<cost;
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
  $('seeds').textContent=S.seeds; $('lives').textContent=S.lives; $('wave').textContent=G.LV.endless ? S.wave : `${S.wave}/${G.LV.waves}`;
  $('season').textContent=G.LV.endless?'wave':G.LV.season==='late summer'?'harvest':G.LV.season;
  const go=$('go'); go.disabled=S.active||S.mode!=='play'||S.paused;
  go.textContent = S.mode!=='play' ? 'Pick a level' : S.active ? `Wave ${S.wave}…` : bossWave(S.wave+1) ? 'Boss wave' : `Start wave ${S.wave+1}`;
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
  b.setAttribute('aria-label', on ? 'Compost: working' : ready ? 'Compost: ready' : `Compost: ready in ${Math.ceil(S.fertCd)} seconds`);
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
// For a few seconds after planting, an Undo button gives every seed back.
let undoT=null, lastPlanted=null;
function offerUndo(t){ if (tutorialActive()) return; lastPlanted=t; $('undo').hidden=false; clearTimeout(undoT); undoT=setTimeout(endUndo, 5000); }
function endUndo(){ clearTimeout(undoT); lastPlanted=null; $('undo').hidden=true; }
function tryPlant(c,r){
  const S=G.S, res=plantAt(c,r);
  if (res.ok){ offerUndo(res.tower); if (!tutorialActive()) msg(tileNote(res.tower) || (S.wave===0&&S.towers.length===1?'Nice. Plant more, or tap Start wave when ready.':`${TYPES[res.tower.type].name} planted.`)); dirty(); return; }
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
    if (!S.active){ Audio.play('denied'); msg('Save the Compost for a wave. Start a wave first.'); return; }
    if (S.fertT>0){ msg('Your defenders are already fed!'); return; }
    if (!fertilize()){ Audio.play('denied'); msg(`The Compost is getting ready. ${Math.ceil(S.fertCd)} seconds to go.`); return; }
    msg('Compost spread! Every defender works faster for a few seconds.'); dirty(); };
  $('adSeeds').onclick=async()=>{ const S=G.S; if (!S || S.adSeeds || S.wave>0) return;
    if (await earn('bonus_seeds', `+${EXTRAS.bonusSeeds} seeds`)){ S.adSeeds=true; addSeeds(EXTRAS.bonusSeeds); msg(`+${EXTRAS.bonusSeeds} seeds!`); Audio.play('sparkle'); } dirty(); };
  $('adRefill').onclick=async()=>{ const S=G.S; if (!S || S.adRefill || sprayReady()) return;
    if (await earn('spray_refill', 'a full Sprayer')){ refillSpray(); msg('Sprayer refilled!'); Audio.play('splash'); } dirty(); };
  $('restart').onclick=onRestart;
  $('sound').onclick=onSound;
  $('map').onclick=()=>{ Audio.play('tap'); showMenu(); };
  $('spClear').onclick=()=>{ const S=G.S, o=S.selScen; if (!o) return; const [name]=SCENERY_NAMES[o.kind]||['Scenery'];
    const gentle=moved(o);
    if (clearScenery(o)){ S.selScen=null; rebuild(); renderInfo(); Audio.play('pop'); msg(gentle?`${name} moved to a better spot. This one is free now.`:o.kind==='fire'?'Fire’s out! That spot is free now.':o.kind==='litter'||o.kind==='tire'?'All cleaned up! That spot is free now.':`${name} cleared. That spot is free now.`); }
    else { Audio.play('denied'); msg(`Not enough seeds. It costs ${clearCost(o)}.`); } };
  $('spClose').onclick=()=>{ G.S.selScen=null; renderInfo(); };
  $('iUp').onclick=()=>{ const t=G.S.sel; if (upgrade(t)){ renderInfo(); msg(`${TYPES[t.type].name} upgraded to level ${t.lv+1}.`); } };
  $('undo').onclick=()=>{ const t=lastPlanted; endUndo(); if (undoPlant(t)){ Audio.play('sell'); msg('Taken back. Your seeds are returned.'); renderBar(); renderInfo(); dirty(); } };
  on('levelStart', endUndo); on('upgrade', endUndo); on('sell', endUndo);
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

  on('waveStart', ({ wave, boss }) => { if (!tutorialActive() && !G.S.heat && !G.S.rain && !swarmAt(wave) && !pestQueue.length) msg(boss ? `${G.LV.endless?'Boss wave':'Final wave'}! The ${ENEMY[(G.S.spawnQ.find(q=>ENEMY[q.t].boss)||{t:G.LV.boss}).t].name} is coming!` : wave===G.LV.waves-1 ? 'One more wave before the boss.' : 'Here they come…'); });
  on('rain', () => msg('Rain! Pests slow down in the wet, and every plant gets a drink.'));
  on('swarm', () => msg('Aphid boom! A huge swarm is hatching. Splash defenders and the spray shine here.'));
  on('heat', hot => msg(hot ? `Heat wave! ${hot} defender${hot>1?'s are':' is'} overheating. Defenders near a Sprinkler stay cool.` : 'Heat wave! Your Sprinklers are keeping everyone cool.'));
  on('fence', left => msg(left ? `Your Sturdy Fence stopped a pest! It can stop ${left} more this level.` : 'Your Sturdy Fence stopped a pest! That was its last one this level.'));
  on('waveClear', () => { if (G.S) { G.S.aiming=false; G.aim=null; } });
  on('boons', ids => showBoons(ids));
  on('waveClear', ({ wave }) => { if (G.LV.endless && wave>Save.data.endless.best){ Save.data.endless.best=wave; Save.commit(); emit('endlessBest', wave); } });
  on('waveClear', ({ wave, seeds, fromFlowers }) => msg(`Wave ${wave} cleared. +${seeds} seeds${fromFlowers?` (${fromFlowers} from sunflowers)`:''}.`));
}
