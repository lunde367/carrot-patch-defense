// Sound for every game in the family: effects and a gentle music-box loop, synthesized live
// (no audio files). Phones only allow sound after a tap, so nothing starts until the first tap.
//
//   Audio.register({ pop:[.04, () => tone(380,.09,{to:950})] });   // [min gap seconds, recipe]
//   Audio.setMusic({ bpm:84, chords:[[196,247,294]], scale:[392,440,494] });
//   Audio.play('pop');
let ctx=null, master=null, sfxBus=null, musicBus=null, settings={ sfx:true, music:true };
let musicTimer=null, nextNoteTime=0, step=0, suspendedByApp=false;
let music = { bpm:84, chords:[[196,247,294],[175,220,262],[165,196,247],[147,185,220]], scale:[392,440,494,587,659,784,880], volume:.22 };
const SOUNDS = {}, lastPlayed = {};

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
  musicBus.gain.setTargetAtTime(settings.music?music.volume:0, t, .3);
  if (settings.music) startMusic(); else stopMusic();
}

// ---------- building blocks for recipes ----------
export function tone(freq, dur, { type='sine', vol=.2, to=null, at=0, attack=.005, bus=null }={}){
  const t=ctx.currentTime+at, o=ctx.createOscillator(), gn=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t+dur);
  gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(vol,t+attack); gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(gn); gn.connect(bus||sfxBus); o.start(t); o.stop(t+dur+.02);
}
let noiseBuf=null;
export function noise(dur, { vol=.15, freq=1200, q=1, type='bandpass', at=0 }={}){
  if (!noiseBuf){ noiseBuf=ctx.createBuffer(1, ctx.sampleRate*.5, ctx.sampleRate); const d=noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const t=ctx.currentTime+at, src=ctx.createBufferSource(), f=ctx.createBiquadFilter(), gn=ctx.createGain();
  src.buffer=noiseBuf; f.type=type; f.frequency.value=freq; f.Q.value=q;
  gn.gain.setValueAtTime(vol,t); gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(f); f.connect(gn); gn.connect(sfxBus); src.start(t); src.stop(t+dur+.02);
}

// Family UI sounds every game gets for free.
Object.assign(SOUNDS, {
  tap:     [.04, ()=>tone(660,.06,{type:'triangle',vol:.08})],
  chime:   [.2,  ()=>{ [523,659,784].forEach((f,i)=>tone(f,.25,{type:'triangle',vol:.11,at:i*.08})); }],
  sparkle: [.05, ()=>{ [523,659,784,1047].forEach((f,i)=>tone(f,.16,{type:'triangle',vol:.13,at:i*.05})); }],
  win:     [1,   ()=>{ [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.32,{type:'triangle',vol:.13,at:i*.11})); }],
  lose:    [1,   ()=>{ [392,349,311,262].forEach((f,i)=>tone(f,.38,{type:'triangle',vol:.12,at:i*.16})); }],
  denied:  [.2,  ()=>{ tone(220,.12,{type:'triangle',vol:.1}); tone(196,.16,{type:'triangle',vol:.1,at:.1}); }],
});

// ---------- music: a slow music box over soft chords ----------
function scheduleMusic(){
  if (!ctx || ctx.state!=='running') return;
  const beat=60/music.bpm/2, CH=music.chords, SC=music.scale;
  while (nextNoteTime < ctx.currentTime+.6){
    const at=nextNoteTime-ctx.currentTime, bar=Math.floor(step/8)%CH.length;
    if (step%8===0) CH[bar].forEach(f=>tone(f,beat*7,{type:'sine',vol:.12,at,attack:.15,bus:musicBus}));
    if (step%2===0 || Math.random()<.3){
      const n=SC[(bar*2 + [0,2,4,3,1,2,5,4][step%8]) % SC.length];
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
  register(map){ Object.assign(SOUNDS, map); },
  setMusic(opts){ music = { ...music, ...opts }; },
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
