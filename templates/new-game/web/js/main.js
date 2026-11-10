// Starter game: tap the bugs before they reach the bottom. It exists to show every kit piece
// working together. Replace it with your own game, keeping the boot steps at the bottom.
import { createSave } from '../kit/js/storage.js';
import { Audio, tone } from '../kit/js/audio.js';
import { initLifecycle } from '../kit/js/lifecycle.js';
import { createCoach } from '../kit/js/coach.js';
import { on, emit } from '../kit/js/events.js';
import { bindSave } from '../kit/js/monetization.js';
import { ell, shadow } from '../kit/js/draw.js';
import { $ } from '../kit/js/ui.js';

const Save = createSave({ key:'__GAME_ID__-save', defaults:() => ({ v:1, best:0, tutorialDone:false, settings:{ sfx:true, music:true }, owned:{} }) });
Audio.register({ squish:[.03, () => tone(380,.09,{ to:950 })] });

const cv = $('cv'), g = cv.getContext('2d');
let bugs = [], score = 0, running = false, paused = false, spawn = 0;

function start(){
  bugs = []; score = 0; running = true; paused = false; $('over').hidden = true; $('play').hidden = true; emit('start');
}
function end(){
  running = false; Save.data.best = Math.max(Save.data.best, score); Save.commit(); Audio.play('lose');
  $('over').innerHTML = `<h2>Game over</h2><p>${score} points · best ${Save.data.best}</p>
    <div class="row"><button class="btn main" id="again">Play again</button></div>`;
  $('over').hidden = false; $('again').onclick = start;
}
cv.addEventListener('pointerdown', ev => {
  if (!running || paused) return;
  const r = cv.getBoundingClientRect(), x = (ev.clientX-r.left)/r.width*360, y = (ev.clientY-r.top)/r.height*360;
  const hit = bugs.find(b => Math.hypot(b.x-x, b.y-y) < 26);
  if (hit){ bugs = bugs.filter(b => b !== hit); score++; Audio.play('squish'); emit('squish'); }
});

let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  if (running && !paused){
    spawn -= dt; if (spawn <= 0){ bugs.push({ x:30+Math.random()*300, y:-20, v:40+score*3 }); spawn = Math.max(.35, 1.2-score*.03); }
    for (const b of bugs){ b.y += b.v*dt; if (b.y > 380){ end(); break; } }
  }
  g.fillStyle = '#a6cf8a'; g.fillRect(0,0,360,360);
  for (const b of bugs){ g.save(); g.translate(b.x,b.y); shadow(g,14,16,5); ell(g,0,0,16,13,'#4560a3','#1f2e52',2); ell(g,-5,-6,6,3,'rgba(255,255,255,.35)'); g.restore(); }
  $('score').textContent = score;
  requestAnimationFrame(frame);
}

// ---------- boot (keep these steps in every game) ----------
await Save.load();
bindSave(Save);
Audio.init(Save.data.settings);
initLifecycle({
  onPause(){ paused = running; Audio.suspend(); Save.flush(); },
  onResume(){ Audio.resume(); paused = false; last = performance.now(); },
  onBack(){ paused = !paused; },
});
$('play').onclick = start;
if (!Save.data.tutorialDone){
  const coach = createCoach({ onFinish(){ Save.data.tutorialDone = true; Save.commit(); } });
  coach.start([
    { text:'Tap Play to start.', target:'#play', until:'start' },
    { text:'Tap the beetles before they reach the bottom!', target:'#stage', place:'over-top', until:'squish' },
    { text:'Nice squish! Now see how many you can get.', button:'Got it' },
  ]);
}
requestAnimationFrame(frame);
