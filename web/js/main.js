// Boot: build the page, load the save, wire sound and phone lifecycle, run the game loop.
import { MARKUP } from './ui/markup.js';
import { G, update } from './engine/game.js';
import { Save, starsLeft } from './save.js';
import { SHOT_SOUND, MUSIC } from './sounds.js';
import { on } from '../kit/js/events.js';
import { ENEMY } from './data/enemies.js';
import { Audio } from '../kit/js/audio.js';
import { shake, confetti } from '../kit/js/fx.js';
import { bindSave } from '../kit/js/monetization.js';
import { initLifecycle } from '../kit/js/lifecycle.js';
import { initBoard, resize, draw } from './render/board.js';
import { initUI, play, showMenu, lastOpenLevel, refresh, pause, resume } from './ui/ui.js';
import { initAchievements } from './ui/achievements.js';

// Engine events → sound effects
on('shoot', type => Audio.play(SHOT_SOUND[type]));
on('hit', () => Audio.play('hit'));
on('tink', () => Audio.play('tink'));
on('thud', () => Audio.play('thud'));
on('kill', ({ boss }) => Audio.play(boss ? 'bosskill' : 'pop'));
on('plant', () => Audio.play('plant'));
on('upgrade', () => Audio.play('sparkle'));
on('sell', () => Audio.play('sell'));
on('cocoon', () => Audio.play('cocoon'));
on('grow', () => Audio.play('grow'));
on('leak', () => Audio.play('leak'));
on('fence', () => Audio.play('fence'));
on('scare', () => Audio.play('scare'));
on('rain', () => Audio.play('rain'));
on('fert', () => Audio.play('fert'));
on('swarm', () => { Audio.play('swarm'); shake(document.getElementById('board'), .5); });
on('heat', () => { Audio.play('heat'); shake(document.getElementById('board'), .5); });
on('levelStart', LV => Audio.setMusic(MUSIC[LV.ch.mood] || MUSIC.cozy));
on('spray', ({ plants }) => { Audio.play('spray'); if (plants) setTimeout(() => Audio.play('wilt'), 350); shake(document.getElementById('board'), .7); });

// Screen shake and confetti on the big moments
const board = () => document.getElementById('board');
on('kill', ({ boss }) => { if (boss) shake(board(), 2.2); });
on('leak', lost => shake(board(), lost>1 ? 2.5 : .8));
on('boss', () => shake(board(), 1.4));
on('fence', () => shake(board(), .6));
on('win', ({ stars }) => { if (stars===3) setTimeout(() => confetti(), 250); });
on('boss', type => Audio.play(ENEMY[type] && ENEMY[type].voice ? 'boss-'+ENEMY[type].voice : 'boss'));
on('waveStart', () => Audio.play('wave'));
on('waveClear', () => Audio.play('chime'));

let last=performance.now(), clock=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  const S=G.S;
  if (S && S.mode==='play' && !S.paused){
    clock+=dt;
    for (let i=0;i<S.speed;i++){ update(dt); if (G.S.mode!=='play') break; }
  }
  draw(clock); refresh();
  requestAnimationFrame(frame);
}

async function boot(){
  document.getElementById('root').innerHTML = MARKUP;
  await Save.load();
  // If upgrade prices went up after an update, refund rather than leave the player owing stars.
  if (starsLeft() < 0){ Save.data.perks = {}; Save.commit(); }
  bindSave(Save);
  Audio.init(Save.data.settings);
  initBoard(document.getElementById('cv'), document.getElementById('board'));
  initUI();
  initAchievements();
  play(lastOpenLevel(), 0, { quiet:true });   // a board ready behind the menu; no cards yet
  showMenu();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

  initLifecycle({
    onPause(){ pause(); Audio.suspend(); Save.flush(); },
    onResume(){ Audio.resume(); last=performance.now(); },     // stays paused until the player taps Resume
    onBack(){ const S=G.S; if (!S) return; if (S.paused) resume(); else if (S.mode==='play') pause(); else showMenu(); },
  });
  requestAnimationFrame(t => { last=t; frame(t); });
  // Offline cache for the web and home-screen versions (the store apps carry their own files).
  if ('serviceWorker' in navigator && location.protocol==='https:' && !window.Capacitor) navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
boot();
