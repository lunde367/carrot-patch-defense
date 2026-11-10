// Boot: build the page, load the save, wire sound and phone lifecycle, run the game loop.
import { MARKUP } from './ui/markup.js';
import { G, update } from './engine/game.js';
import { Save } from './save.js';
import { SHOT_SOUND } from './sounds.js';
import { on } from '../kit/js/events.js';
import { Audio } from '../kit/js/audio.js';
import { bindSave } from '../kit/js/monetization.js';
import { initLifecycle } from '../kit/js/lifecycle.js';
import { initBoard, resize, draw } from './render/board.js';
import { initUI, play, showMenu, lastOpenLevel, refresh, pause, resume } from './ui/ui.js';

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
on('boss', () => Audio.play('boss'));
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
  bindSave(Save);
  Audio.init(Save.data.settings);
  initBoard(document.getElementById('cv'), document.getElementById('board'));
  initUI();
  play(lastOpenLevel());
  showMenu();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

  initLifecycle({
    onPause(){ pause(); Audio.suspend(); Save.flush(); },
    onResume(){ Audio.resume(); last=performance.now(); },     // stays paused until the player taps Resume
    onBack(){ const S=G.S; if (!S) return; if (S.paused) resume(); else if (S.mode==='play') pause(); else showMenu(); },
  });
  requestAnimationFrame(t => { last=t; frame(t); });
}
boot();
