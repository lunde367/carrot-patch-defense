// Little pictures for the garden diary: one scene per page, built from the game's own art.
import { DRAW } from './art-towers.js';
import { drawEnemy } from './art-enemies.js';
import { drawScenery } from './art-scenery.js';
import { drawCrop, ell } from './art-common.js';
import { ENEMY } from '../data/enemies.js';

// Sky (top, bottom) and ground colors for each mood.
const MOOD = {
  happy:  ['#cfe8f5','#eef7df','#a6cf8a'], hot:   ['#f6dfa0','#f6eecb','#c3cb88'], dust: ['#dcc293','#ecdcb6','#cdb88c'],
  smog:   ['#aeb0a2','#d0cfbc','#aeb29c'], dark:  ['#3f3b48','#6b6470','#7c756a'], rain: ['#a9c6d2','#dcebe3','#9fcc86'],
  regrow: ['#c2e4f2','#eaf7da','#a6d888'],
};
// Each item: [kind, id, x (0..1 across the page), size (1 = normal)]. Extras: sun, rain, spray, creek.
const SCENES = {
  'start-cabbage':    ['happy',  [['crop','cabbage',.2,1],['crop','cabbage',.36,1],['pest','babyslug',.55,1],['tower','bunny',.8,1.1]]],
  'after-cabbage':    ['happy',  [['sun'],['crop','cabbage',.16,1.1],['crop','cabbage',.32,1.2],['crop','cabbage',.48,1.1],['tower','bunny',.68,1],['tower','bunny',.86,1.1]]],
  'start-strawberry': ['happy',  [['crop','strawberry',.18,1],['crop','strawberry',.34,1],['spray',.6,1.2],['tower','bunny',.84,1]]],
  'after-strawberry': ['happy',  [['crop','strawberry',.16,1.1],['crop','strawberry',.3,1.1],['crop','strawberry',.44,1.1],['spray',.68,1.5]]],
  'after-carrot':     ['hot',    [['sun',1.3],['crop','carrot',.2,1],['crop','carrot',.36,1],['crop','carrot',.52,1],['creek']]],
  'start-tomato':     ['hot',    [['sun',1.5],['crop','tomato',.22,1],['crop','tomato',.4,1],['tower','sprinkler',.66,1],['spray',.86,.9]]],
  'after-tomato':     ['hot',    [['sun',1.4],['crop','tomato',.2,.9],['pest','stinkbug',.45,1],['pest','stinkbug',.6,1],['spray',.84,1.2]]],
  'start-apple':      ['hot',    [['crop','apple',.2,1],['crop','apple',.36,1.1],['crop','apple',.52,1],['scen','skep',.8,1.2]]],
  'start-apple-2':    ['hot',    [['scen','pot',.2,1.2],['pest','jbeetle',.45,1],['pest','jbeetle',.6,1],['pest','jbeetle',.76,1],['crop','apple',.9,.9]]],
  'after-apple':      ['hot',    [['crop','apple',.24,.7],['crop','apple',.38,.6],['pest','aphid',.58,1],['pest','aphid',.7,1],['pest','aphid',.82,1]]],
  'start-corn':       ['hot',    [['sun',1.6],['crop','corn',.2,1],['crop','corn',.36,1],['scen','bucket',.62,1.1],['tower','sprinkler',.84,1]]],
  'after-corn':       ['hot',    [['pest','locust',.2,1],['pest','locust',.36,1],['pest','locust',.52,1],['spray',.8,1.3]]],
  'start-dust':       ['dust',   [['crop','wheat',.18,1],['crop','wheat',.32,.9],['tower','barrel',.58,1.1],['scen','trough',.84,1]]],
  'start-dust-2':     ['dust',   [['spray',.3,1.3],['scen','bucket',.62,1],['crop','wheat',.84,.8]]],
  'after-dust':       ['dust',   [['crop','wheat',.24,1],['crop','wheat',.4,1],['scen','tire',.7,1.1]]],
  'start-rooftop':    ['smog',   [['scen','pot',.18,1.1],['crop','pepper',.36,1],['crop','pepper',.52,1],['pest','pigeon',.8,1]]],
  'after-rooftop':    ['smog',   [['crop','pepper',.2,1.1],['crop','pepper',.36,1.1],['scen','table',.7,1.1]]],
  'start-vault':      ['dark',   [['scen','rock',.16,1.1],['crop','seed',.4,1.2],['crop','seed',.56,1.2],['pest','glowslug',.82,1]]],
  'after-vault':      ['dark',   [['crop','seed',.22,1.2],['scen','sapling',.5,1.2],['scen','clover',.76,1.1]]],
  'start-rain':       ['rain',   [['rain'],['scen','sapling',.18,1.2],['scen','sapling',.38,1.4],['crop','radish',.62,1],['tower','barrel',.84,1]]],
  'after-rain':       ['rain',   [['creek'],['crop','radish',.2,1],['crop','radish',.36,1],['scen','sapling',.62,1.4],['scen','clover',.84,1.1]]],
  'start-meadow':     ['regrow', [['sun'],['scen','clover',.16,1.1],['crop','bloom',.34,1.1],['crop','bloom',.5,1.1],['tower','hive',.76,1.1]]],
  'after-meadow':     ['regrow', [['sun'],['crop','bloom',.16,1],['crop','bloom',.3,1.1],['crop','bloom',.44,1],['tower','hive',.66,1],['tower','ladybug',.86,1]]],
  'start-newgarden':  ['regrow', [['crop','pumpkin',.2,1.1],['crop','pumpkin',.38,1.2],['scen','sapling',.62,1.5],['tower','bunny',.84,1.1]]],
  'after-newgarden':  ['regrow', [['sun'],['creek'],['crop','pumpkin',.16,1.2],['tower','hive',.38,1],['scen','sapling',.58,1.6],['tower','bunny',.78,1.1],['scen','clover',.93,1]]],
};

function sprayer(c, x, y, s){   // the yellow bottle from the spray button
  c.save(); c.translate(x, y); c.lineJoin='round';
  c.fillStyle='rgba(30,20,10,.25)'; c.beginPath(); c.ellipse(0, s*.02, s*.3, s*.07, 0, 0, 6.3); c.fill();
  c.fillStyle='#e9d24a'; c.strokeStyle='#6a5a10'; c.lineWidth=Math.max(1.5, s*.04);
  c.beginPath(); c.roundRect(-s*.2, -s*.62, s*.4, s*.62, s*.07); c.fill(); c.stroke();
  c.fillStyle='#c2456b'; c.fillRect(-s*.19, -s*.4, s*.38, s*.18);
  c.fillStyle='#8a8f96'; c.beginPath(); c.roundRect(-s*.1, -s*.82, s*.2, s*.2, s*.03); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(s*.1, -s*.76); c.lineTo(s*.34, -s*.82); c.stroke();
  c.restore();
}

export function drawDiaryScene(canvas, key){
  const sc = SCENES[key]; if (!sc) return false;
  const d = Math.min(2, window.devicePixelRatio||1), W = 280, H = 110;
  canvas.width = W*d; canvas.height = H*d;
  const c = canvas.getContext('2d'); c.setTransform(d,0,0,d,0,0);
  const [top, bottom, ground] = MOOD[sc[0]], gy = H*.72, s = 46;
  const sky = c.createLinearGradient(0,0,0,gy); sky.addColorStop(0, top); sky.addColorStop(1, bottom);
  c.fillStyle = sky; c.fillRect(0,0,W,gy);
  c.fillStyle = ground; c.fillRect(0,gy,W,H-gy);
  c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(0,gy,W,2);
  for (const it of sc[1]){
    const [kind, id, fx, k=1] = it;
    c.save();
    if (kind==='sun'){ const r=13*(id||1); ell(c, W-34, 26, r*1.5, r*1.5, 'rgba(255,220,120,.35)'); ell(c, W-34, 26, r, r, '#f8cf4e', '#e0a020', 1.5); }
    else if (kind==='rain'){ c.strokeStyle='rgba(70,120,160,.55)'; c.lineWidth=1.6; c.lineCap='round';
      for (let i=0;i<26;i++){ const x=(i*37%W), y=(i*53%Math.round(gy)); c.beginPath(); c.moveTo(x,y); c.lineTo(x-4,y+10); c.stroke(); } }
    else if (kind==='creek'){ c.strokeStyle='#7fb8d8'; c.lineWidth=7; c.lineCap='round'; c.beginPath(); c.moveTo(-5,H-8); c.bezierCurveTo(W*.3,H-18,W*.6,H+2,W+5,H-10); c.stroke();
      c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(20,H-11); c.lineTo(48,H-13); c.moveTo(150,H-7); c.lineTo(180,H-8); c.stroke(); }
    else if (kind==='spray') sprayer(c, id*W, gy+8, s*(fx||1)*.8);
    else if (kind==='crop') drawCrop(c, id, fx*W, gy+2, s*1.5*k);
    else if (kind==='tower'){ c.translate(fx*W, gy-s*k*.22); DRAW[id](c, s*k, 0, 0, 1, 1); }
    else if (kind==='pest'){ const E=ENEMY[id]; if (E){ const sz=24*k/E.size; c.translate(fx*W, gy - (E.fly ? 16 : 6)); drawEnemy(c, { type:id, size:E.size, ph:1.2, fly:!!E.fly, face:-1, hp:1, max:1 }, sz); } }
    else if (kind==='scen'){ const ss=s*k; c.translate(fx*W-ss/2, gy-ss*.72); drawScenery(c, { c:0, r:0, w:1, h:1, kind:id, seed:7 }, ss); }
    c.restore();
  }
  return true;
}
