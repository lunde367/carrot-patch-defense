// Sound effects and a gentle music-box loop, synthesized live (no audio files to load).
// Phones only allow sound after the player taps, so nothing is created until the first tap.
let ctx=null, master=null, sfxBus=null, musicBus=null, settings={ sfx:true, music:true };
let musicTimer=null, nextNoteTime=0, step=0, suspendedByApp=false;
const lastPlayed={};

function ensure(){
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  musicBus = ctx.createGain(); musicBus.connect(master);
  apply();
  return ctx;
}
function apply(){
  if (!ctx) return;
  const t=ctx.currentTime;
  sfxBus.gain.setTargetAtTime(settings.sfx?1:0, t, .02);
  musicBus.gain.setTargetAtTime(settings.music?.22:0, t, .3);
  if (settings.music) startMusic(); else stopMusic();
}

// ---------- building blocks ----------
function tone(freq, dur, { type='sine', vol=.2, to=null, at=0, attack=.005, bus=sfxBus }={}){
  const t=ctx.currentTime+at, o=ctx.createOscillator(), gn=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t+dur);
  gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(vol,t+attack); gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(gn); gn.connect(bus); o.start(t); o.stop(t+dur+.02);
}
let noiseBuf=null;
function noise(dur, { vol=.15, freq=1200, q=1, type='bandpass', at=0 }={}){
  if (!noiseBuf){ noiseBuf=ctx.createBuffer(1, ctx.sampleRate*.5, ctx.sampleRate); const d=noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const t=ctx.currentTime+at, src=ctx.createBufferSource(), f=ctx.createBiquadFilter(), gn=ctx.createGain();
  src.buffer=noiseBuf; f.type=type; f.frequency.value=freq; f.Q.value=q;
  gn.gain.setValueAtTime(vol,t); gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(f); f.connect(gn); gn.connect(sfxBus); src.start(t); src.stop(t+dur+.02);
}

// ---------- the sound list (name → recipe, min gap in seconds) ----------
const SOUNDS = {
  tap:      [.04, ()=>tone(660,.06,{type:'triangle',vol:.08})],
  plant:    [.05, ()=>{ noise(.12,{freq:500,vol:.18}); tone(392,.1,{type:'triangle',vol:.16,at:.03}); tone(523,.14,{type:'triangle',vol:.16,at:.09}); }],
  upgrade:  [.05, ()=>{ [523,659,784,1047].forEach((f,i)=>tone(f,.16,{type:'triangle',vol:.13,at:i*.05})); }],
  sell:     [.05, ()=>{ tone(784,.08,{type:'square',vol:.05}); tone(1175,.12,{type:'square',vol:.05,at:.06}); }],
  throw:    [.07, ()=>noise(.07,{freq:2600,q:2,vol:.05})],
  thorn:    [.08, ()=>tone(1400,.05,{type:'triangle',vol:.04,to:900})],
  acorn:    [.06, ()=>tone(900,.04,{type:'square',vol:.025,to:600})],
  splash:   [.15, ()=>noise(.25,{freq:900,q:.6,vol:.08,type:'lowpass'})],
  hoot:     [.2,  ()=>{ tone(420,.18,{vol:.09,to:380}); tone(400,.22,{vol:.08,at:.2,to:340}); }],
  thud:     [.08, ()=>{ tone(140,.12,{vol:.18,to:70}); noise(.08,{freq:300,vol:.08}); }],
  hit:      [.05, ()=>tone(300,.05,{type:'triangle',vol:.05,to:220})],
  tink:     [.12, ()=>{ tone(2200,.12,{type:'triangle',vol:.05}); tone(3300,.08,{type:'sine',vol:.03}); }],
  pop:      [.04, ()=>tone(380,.09,{vol:.14,to:950})],
  cocoon:   [.2,  ()=>tone(300,.4,{type:'triangle',vol:.06,to:600,attack:.1})],
  grow:     [.15, ()=>{ tone(500,.12,{type:'triangle',vol:.08,to:900}); tone(700,.12,{type:'triangle',vol:.06,at:.08,to:1200}); }],
  leak:     [.2,  ()=>tone(330,.35,{type:'triangle',vol:.14,to:150})],
  wave:     [.3,  ()=>{ [392,494,587].forEach((f,i)=>tone(f,.5,{type:'triangle',vol:.1,at:i*.07})); }],
  boss:     [.5,  ()=>{ tone(110,.7,{type:'sawtooth',vol:.07,to:90,attack:.05}); tone(165,.7,{type:'triangle',vol:.08,at:.15,to:130}); }],
  clear:    [.3,  ()=>{ [523,659,784].forEach((f,i)=>tone(f,.25,{type:'triangle',vol:.11,at:i*.08})); }],
  bosskill: [.3,  ()=>{ noise(.4,{freq:700,vol:.12}); [392,523,659,784].forEach((f,i)=>tone(f,.3,{type:'triangle',vol:.12,at:.1+i*.07})); }],
  win:      [1,   ()=>{ [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.32,{type:'triangle',vol:.13,at:i*.11})); }],
  lose:     [1,   ()=>{ [392,349,311,262].forEach((f,i)=>tone(f,.38,{type:'triangle',vol:.12,at:i*.16})); }],
};

// ---------- music: a slow pentatonic music box over soft chords ----------
const CHORDS = [[196,247,294],[175,220,262],[165,196,247],[147,185,220]];   // G  F  Em  D-ish
const SCALE = [392,440,494,587,659,784,880];
function scheduleMusic(){
  if (!ctx || ctx.state!=='running') return;
  const beat=60/84/2;
  while (nextNoteTime < ctx.currentTime+.6){
    const at=nextNoteTime-ctx.currentTime, bar=Math.floor(step/8)%CHORDS.length;
    if (step%8===0) CHORDS[bar].forEach(f=>tone(f,beat*7,{type:'sine',vol:.12,at,attack:.15,bus:musicBus}));
    if (step%2===0 || Math.random()<.3){
      const n=SCALE[(bar*2 + [0,2,4,3,1,2,5,4][step%8]) % SCALE.length];
      if (Math.random()<.85) tone(n,beat*2.2,{type:'triangle',vol:.1,at,attack:.004,bus:musicBus});
    }
    nextNoteTime+=beat; step++;
  }
}
function startMusic(){ if (musicTimer||!ctx) return; nextNoteTime=ctx.currentTime+.1; musicTimer=setInterval(scheduleMusic,150); }
function stopMusic(){ clearInterval(musicTimer); musicTimer=null; }

export const Audio = {
  init(saved){
    settings = saved;
    const unlock = () => { if (!ensure()) return; if (ctx.state==='suspended' && !suspendedByApp) ctx.resume(); };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
  },
  play(name){
    if (!ctx || ctx.state!=='running' || !settings.sfx) return;
    const s=SOUNDS[name]; if (!s) return;
    const now=ctx.currentTime; if (now-(lastPlayed[name]||0) < s[0]) return;
    lastPlayed[name]=now; s[1]();
  },
  setSettings(next){ settings=next; apply(); },
  suspend(){ suspendedByApp=true; if (ctx && ctx.state==='running') ctx.suspend(); },
  resume(){ suspendedByApp=false; if (ctx && ctx.state==='suspended') ctx.resume(); },
};
