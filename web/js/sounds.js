// Carrot Patch's own sounds and music, registered with the kit's audio engine.
// The kit already provides: tap, chime, sparkle, win, lose, denied.
import { Audio, tone, noise } from '../kit/js/audio.js';

Audio.register({
  plant:    [.05, ()=>{ noise(.12,{freq:500,vol:.18}); tone(392,.1,{type:'triangle',vol:.16,at:.03}); tone(523,.14,{type:'triangle',vol:.16,at:.09}); }],
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
  spray:    [.5,  ()=>{ noise(.9,{freq:4200,q:.5,vol:.22,type:'highpass'}); noise(.6,{freq:900,q:.8,vol:.08,at:.1}); }],
  wilt:     [.4,  ()=>tone(520,.5,{type:'triangle',vol:.07,to:260,attack:.02})],
  page:     [.3,  ()=>{ noise(.25,{freq:3000,q:.4,vol:.06,type:'highpass'}); noise(.18,{freq:2200,q:.4,vol:.05,type:'highpass',at:.18}); }],
  heat:     [1,   ()=>{ tone(880,.6,{type:'sine',vol:.06,to:620,attack:.2}); noise(.8,{freq:600,q:.3,vol:.05,type:'lowpass'}); }],
  fence:    [.15, ()=>{ noise(.1,{freq:350,vol:.2}); tone(196,.18,{type:'triangle',vol:.12,to:150}); }],
  scare:    [.5,  ()=>{ noise(.18,{freq:1800,q:1.2,vol:.08}); tone(660,.12,{type:'square',vol:.04,to:440}); }],
  swarm:    [1,   ()=>{ noise(1.2,{freq:240,q:4,vol:.09,attack:.3}); noise(1,{freq:310,q:5,vol:.06,at:.2}); }],
  // a pest takes a bite out of a crop: a quick crunchy chomp
  leak:     [.2,  ()=>{ noise(.05,{freq:2400,q:.7,vol:.22}); noise(.06,{freq:1500,q:.8,vol:.2,at:.06}); noise(.05,{freq:2000,q:.7,vol:.16,at:.13});
                        tone(160,.08,{type:'triangle',vol:.12,to:90}); }],
  // boss voices, picked to match each boss
  'boss-slurp': [.5, ()=>{ tone(180,.35,{type:'sine',vol:.14,to:420,attack:.03}); tone(420,.3,{type:'sine',vol:.1,at:.3,to:160});
                        noise(.5,{freq:500,q:3,vol:.07,at:.05,type:'bandpass'}); tone(90,.6,{type:'triangle',vol:.09,at:.1,to:70}); }],
  'boss-buzz':  [.5, ()=>{ tone(150,.9,{type:'sawtooth',vol:.06,to:170,attack:.05}); tone(156,.9,{type:'sawtooth',vol:.05,to:176,attack:.05});
                        noise(.9,{freq:300,q:6,vol:.06}); }],
  'boss-click': [.5, ()=>{ for (let i=0;i<6;i++) noise(.03,{freq:3200-i*200,q:2,vol:.16,at:i*.07});
                        tone(110,.6,{type:'sawtooth',vol:.06,at:.1,to:85}); }],
  'boss-rumble':[.5, ()=>{ noise(.9,{freq:140,q:.8,vol:.25,type:'lowpass'}); tone(70,.8,{type:'triangle',vol:.14,to:50});
                        for (let i=0;i<3;i++) noise(.06,{freq:900,q:1,vol:.08,at:.2+i*.18}); }],
  'boss-squeak':[.5, ()=>{ tone(1600,.08,{type:'square',vol:.05,to:2100}); tone(1700,.1,{type:'square',vol:.05,at:.13,to:2300});
                        tone(130,.5,{type:'triangle',vol:.1,at:.2,to:100}); }],
  'boss-munch': [.5, ()=>{ for (let i=0;i<4;i++){ noise(.06,{freq:1800,q:.9,vol:.14,at:i*.16}); tone(140,.08,{type:'triangle',vol:.08,at:i*.16,to:100}); } }],
  'boss-chirp': [.5, ()=>{ for (let i=0;i<5;i++) tone(4200,.04,{type:'square',vol:.035,at:i*.09}); tone(120,.6,{type:'triangle',vol:.1,at:.1,to:90}); }],
  wave:     [.3,  ()=>{ [392,494,587].forEach((f,i)=>tone(f,.5,{type:'triangle',vol:.1,at:i*.07})); }],
  boss:     [.5,  ()=>{ tone(110,.7,{type:'sawtooth',vol:.07,to:90,attack:.05}); tone(165,.7,{type:'triangle',vol:.08,at:.15,to:130}); }],
  bosskill: [.3,  ()=>{ noise(.4,{freq:700,vol:.12}); [392,523,659,784].forEach((f,i)=>tone(f,.3,{type:'triangle',vol:.12,at:.1+i*.07})); }],
});

// Music by act. Act 2 keeps the same tune, but one note of the scale is flat: something's off.
export const MUSIC = {
  cozy: { bpm:84, chords:[[196,247,294],[175,220,262],[165,196,247],[147,185,220]], scale:[392,440,494,587,659,784,880] },
  off:  { bpm:80, chords:[[196,247,294],[175,220,262],[165,196,247],[147,185,220]], scale:[392,440,466,587,659,740,880] },
};
Audio.setMusic(MUSIC.cozy);

export const SHOT_SOUND = { bunny:'throw', rose:'thorn', squirrel:'acorn', sprinkler:'splash', pine:'throw', owl:'hoot' };
