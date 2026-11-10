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
  fence:    [.15, ()=>{ noise(.1,{freq:350,vol:.2}); tone(196,.18,{type:'triangle',vol:.12,to:150}); }],
  leak:     [.2,  ()=>tone(330,.35,{type:'triangle',vol:.14,to:150})],
  wave:     [.3,  ()=>{ [392,494,587].forEach((f,i)=>tone(f,.5,{type:'triangle',vol:.1,at:i*.07})); }],
  boss:     [.5,  ()=>{ tone(110,.7,{type:'sawtooth',vol:.07,to:90,attack:.05}); tone(165,.7,{type:'triangle',vol:.08,at:.15,to:130}); }],
  bosskill: [.3,  ()=>{ noise(.4,{freq:700,vol:.12}); [392,523,659,784].forEach((f,i)=>tone(f,.3,{type:'triangle',vol:.12,at:.1+i*.07})); }],
});

// A gentle G–F–Em–D music box.
Audio.setMusic({ bpm:84, chords:[[196,247,294],[175,220,262],[165,196,247],[147,185,220]], scale:[392,440,494,587,659,784,880] });

export const SHOT_SOUND = { bunny:'throw', rose:'thorn', squirrel:'acorn', sprinkler:'splash', pine:'throw', owl:'hoot' };
