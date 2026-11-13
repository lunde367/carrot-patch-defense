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
  'start-cabbage':    ['happy',  [['face',.14,1],['crop','cabbage',.36,1],['crop','cabbage',.5,1],['pest','babyslug',.67,.45],['tower','bunny',.86,1.1]]],
  // the pictures on the four part cards
  // Hand-placed: [kind, id, x, size, y] with x and y as fractions of the picture (y = where it stands).
  'part-1':           ['happy',  [['land'],['sun'],['cloud',.24,.16,1],['fence',.6],['crop','carrot',.7,.7,.74],['crop','cabbage',.34,.75,.78],['tower','sunflower',.84,1,.9],['crop','cabbage',.16,1,.93],['tower','bunny',.52,1.35,.95]]],
  'part-2':           ['hot',    [['land'],['sun',2.1],['heat'],['cracks'],['pest','locust',.2,.75,.42],['crop','tomato',.2,.9,.9],['pest','stinkbug',.84,.6,.84],['spray',.5,1.7,1,.94]]],
  'part-3':           ['dust',   [['land'],['swirl',.3,.22],['swirl',.74,.3],['cracks'],['scen','stump',.6,1,.72],['crop','wheat',.36,.6,.78],['scen','litter',.86,.8,.8],['scen','tire',.2,1.15,.95],['scen','fire',.72,1.1,.96]]],
  'part-4':           ['rain',   [['land'],['cloud',.3,.14,1.2],['cloud',.72,.2,1],['rain'],['creek'],['scen','sapling',.2,1.3,.8],['tower','barrel',.52,.8,.74],['scen','sapling',.82,1.7,.9],['crop','radish',.58,.95,.92],['scen','clover',.38,1,.94]]],
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

function gardenerFace(c, x, y, s){   // the diary's owner: straw hat, freckles, a big smile
  c.save(); c.translate(x, y); c.lineJoin='round'; c.lineCap='round';
  ell(c, 0, -s*.02, s*.3, s*.07, 'rgba(30,20,10,.2)');
  c.fillStyle='#5f9a45'; c.strokeStyle='#33582a'; c.lineWidth=Math.max(1.5,s*.035); c.beginPath(); c.roundRect(-s*.26,-s*.3,s*.52,s*.3,s*.1); c.fill(); c.stroke();   // shoulders
  ell(c, 0, -s*.52, s*.25, s*.26, '#f1c9a0', '#8a5a34', Math.max(1.5,s*.035));                                                   // face
  ell(c, -s*.09, -s*.55, s*.025, s*.03, '#3b2a1c'); ell(c, s*.09, -s*.55, s*.025, s*.03, '#3b2a1c');
  ell(c, -s*.15, -s*.46, s*.045, s*.03, 'rgba(226,120,110,.5)'); ell(c, s*.15, -s*.46, s*.045, s*.03, 'rgba(226,120,110,.5)');
  c.strokeStyle='#3b2a1c'; c.lineWidth=Math.max(1.2,s*.03); c.beginPath(); c.arc(0, -s*.47, s*.09, .25, Math.PI-.25); c.stroke();
  ell(c, 0, -s*.72, s*.4, s*.085, '#e6c56a', '#8a6a24', Math.max(1.5,s*.035));                                                    // hat brim
  c.fillStyle='#edd07c'; c.strokeStyle='#8a6a24'; c.beginPath(); c.roundRect(-s*.2,-s*.95,s*.4,s*.25,s*.1); c.fill(); c.stroke();
  c.fillStyle='#c2456b'; c.fillRect(-s*.2,-s*.79,s*.4,s*.05);
  c.restore();
}
// Turn the cleanly drawn scene into a colored-pencil sketch: wobbly graphite outlines found from the
// picture's edges, over a light hatched wash of its colors, with nothing behind it but the page.
function pencil(src, d){
  const w=src.width, h=src.height, a=src.getContext('2d').getImageData(0,0,w,h).data;
  const lum=new Float32Array(w*h);
  for (let i=0,p=0;i<w*h;i++,p+=4){ const al=a[p+3]/255; lum[i]=(.3*a[p]+.59*a[p+1]+.11*a[p+2])*al+255*(1-al); }
  const out=new ImageData(w,h), o=out.data, L=(x,y)=>lum[Math.min(h-1,Math.max(0,y))*w+Math.min(w-1,Math.max(0,x))];
  const hatch=Math.max(3, Math.round(2.5*d));
  for (let y=0;y<h;y++) for (let x=0;x<w;x++){
    // a slow wobble, as if the hand wasn't quite steady
    const xs=Math.min(w-1,Math.max(0,x+Math.round(Math.sin(y*.07/d*2)*1.1*d))), ys=Math.min(h-1,Math.max(0,y+Math.round(Math.sin(x*.06/d*2)*1.1*d)));
    const gx=L(xs+1,ys-1)+2*L(xs+1,ys)+L(xs+1,ys+1)-L(xs-1,ys-1)-2*L(xs-1,ys)-L(xs-1,ys+1);
    const gy=L(xs-1,ys+1)+2*L(xs,ys+1)+L(xs+1,ys+1)-L(xs-1,ys-1)-2*L(xs,ys-1)-L(xs+1,ys-1);
    const n=((Math.imul(x*374761393 ^ y*668265263, 1274126177)>>>0)%1000)/1000;         // paper grain
    const line=Math.min(1, Math.pow(Math.min(1, Math.hypot(gx,gy)/150), .75)*(.72+.28*n));
    const p=(ys*w+xs)*4, al=a[p+3]/255, g=.3*a[p]+.59*a[p+1]+.11*a[p+2];
    const stroke=((x+y)%hatch)<hatch*.55 ? 1 : .35, cross=g<120 && ((x-y+4096)%hatch)<hatch*.4 ? .25 : 0;
    const wash=al*Math.min(.62, (.34*stroke+cross)*(.8+.4*n));
    // soften the colors toward gray so they read as pencil, not paint
    const r=a[p]*.7+g*.3, gg=a[p+1]*.7+g*.3, b=a[p+2]*.7+g*.3, A=1-(1-wash)*(1-line), q=(y*w+x)*4;
    if (A<=0.003) continue;
    const kw=wash*(1-line)/A, kl=line/A;
    o[q]=r*kw+58*kl; o[q+1]=gg*kw+52*kl; o[q+2]=b*kw+46*kl; o[q+3]=Math.round(A*255);
  }
  return out;
}
// Draws the scene for a diary page as a pencil sketch on a transparent background (the page shows through).
// The picture is a little taller than wide, to sit on the left-hand page of the open journal: things stand
// in two rows, the back row smaller.
export function drawDiaryScene(canvas, key){
  const sc = SCENES[key]; if (!sc) return false;
  const d = Math.min(2, window.devicePixelRatio||1), W = 190, H = 170;
  const off = document.createElement('canvas'); off.width = W*d; off.height = H*d;
  const c = off.getContext('2d'); c.setTransform(d,0,0,d,0,0);
  const ground = MOOD[sc[0]][2], s = 58, rows = [H*.52, H*.92];
  const placed = sc[1].some(it => it[0]==='land'), hy = H*.6;
  if (placed){                                                              // a full picture: rolling ground up to a horizon
    c.fillStyle = ground; c.strokeStyle = 'rgba(70,60,40,.9)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-4, hy+6); c.quadraticCurveTo(W*.25, hy-12, W*.52, hy+2); c.quadraticCurveTo(W*.8, hy+14, W+4, hy-4); c.lineTo(W+4, H+4); c.lineTo(-4, H+4); c.closePath(); c.fill(); c.stroke();
  } else ell(c, W/2, H*.72, W*.5, H*.27, ground);                           // a diary sketch: a patch of ground, no frame
  const PROPS = ['sun','rain','creek','land','cloud','fence','cracks','swirl','heat'];
  const things = sc[1].filter(it => !PROPS.includes(it[0]));
  for (const it of sc[1]){
    const [kind, id, fx, k0=1] = it; c.save();
    if (kind==='sun'){ const r=11*(id||1), sx=(id||1)>1.9 ? W*.6 : W-30, sy=(id||1)>1.9 ? 38 : 26; c.translate(sx-(W-30), sy-26); ell(c, W-30, 26, r, r, '#f8cf4e', '#b07a10', 1.5);
      c.strokeStyle='#b07a10'; c.lineWidth=1.5; for (let i=0;i<8;i++){ const a=i*Math.PI/4; c.beginPath(); c.moveTo(W-30+Math.cos(a)*r*1.3, 26+Math.sin(a)*r*1.3); c.lineTo(W-30+Math.cos(a)*r*1.75, 26+Math.sin(a)*r*1.75); c.stroke(); } }
    else if (kind==='rain'){ c.strokeStyle='rgba(60,110,160,.9)'; c.lineWidth=1.6; c.lineCap='round';
      for (let i=0;i<22;i++){ const x=(i*37%W), y=(i*53%Math.round(H*.6)); c.beginPath(); c.moveTo(x,y); c.lineTo(x-4,y+10); c.stroke(); } }
    else if (kind==='land'){ }
    else if (kind==='cloud'){ const x=id*W, y=fx*H, k=k0*13; for (const [dx,dy,r] of [[-1.1,.2,.8],[0,-.25,1.05],[1.1,.2,.85],[0,.35,.9]]) ell(c, x+dx*k, y+dy*k, r*k, r*k*.72, '#ffffff'); 
      c.strokeStyle='rgba(70,70,80,.9)'; c.lineWidth=1.3; c.beginPath(); c.moveTo(x-k*1.9,y+k*.7); c.quadraticCurveTo(x-k*2.2,y-k*.3,x-k*1.1,y-k*.4); c.quadraticCurveTo(x-k*.6,y-k*1.3,x+k*.5,y-k*.8); c.quadraticCurveTo(x+k*1.8,y-k*.9,x+k*1.9,y+k*.1); c.quadraticCurveTo(x+k*2.2,y+k*.8,x+k*1.2,y+k*.8); c.lineTo(x-k*1.9,y+k*.7); c.stroke(); }
    else if (kind==='fence'){ const y=id*H; c.strokeStyle='rgba(110,80,40,.95)'; c.fillStyle='#f3ead2'; c.lineWidth=1.2;
      for (let x=6;x<W-4;x+=13){ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-15); c.lineTo(x+3.5,y-19); c.lineTo(x+7,y-15); c.lineTo(x+7,y); c.closePath(); c.fill(); c.stroke(); }
      c.beginPath(); c.moveTo(0,y-6); c.lineTo(W,y-6); c.moveTo(0,y-12); c.lineTo(W,y-12); c.stroke(); }
    else if (kind==='cracks'){ c.strokeStyle='rgba(90,70,45,.9)'; c.lineWidth=1.2; c.lineJoin='round';
      for (const [x,y] of [[.12,.74],[.4,.7],[.66,.76],[.9,.9],[.3,.97]]){ c.beginPath(); c.moveTo(x*W-10,y*H-3); c.lineTo(x*W-3,y*H+2); c.lineTo(x*W+2,y*H-2); c.lineTo(x*W+10,y*H+3); c.moveTo(x*W+2,y*H-2); c.lineTo(x*W+5,y*H-8); c.stroke(); } }
    else if (kind==='swirl'){ const x=id*W, y=fx*H; c.strokeStyle='rgba(120,95,60,.9)'; c.lineWidth=1.4; c.lineCap='round';
      for (let i=0;i<3;i++){ c.beginPath(); c.moveTo(x-22+i*5, y+i*8); c.bezierCurveTo(x-6, y-10+i*8, x+8, y+10+i*8, x+24-i*4, y-2+i*8); c.stroke(); } }
    else if (kind==='heat'){ c.strokeStyle='rgba(190,120,40,.85)'; c.lineWidth=1.3; c.lineCap='round';
      for (const x of [.1,.34,.7,.92]){ c.beginPath(); c.moveTo(x*W, hy-6); c.bezierCurveTo(x*W-6, hy-16, x*W+6, hy-24, x*W, hy-34); c.stroke(); } }
    else if (kind==='creek'){ c.strokeStyle='#6aa8cc'; c.lineWidth=7; c.lineCap='round'; c.beginPath(); c.moveTo(4,H-6); c.bezierCurveTo(W*.3,H-18,W*.6,H+2,W-4,H-9); c.stroke(); }
    else {
      const own = it[4]!=null;                                              // hand-placed in a full picture
      const n = things.length, i = things.indexOf(it), two = !own && n>3, back = two && i%2===0, gy = own ? it[4]*H : rows[back?0:1], k = k0*(back?.85:1);
      const row = two ? things.filter((_,j) => (j%2===0)===back) : things, j = row.indexOf(it);
      const px = own ? (kind==='spray'||kind==='face' ? id : fx)*W : W*(j+1)/(row.length+1) + (two ? (back ? -8 : 8) : 0);
      if (kind==='spray') sprayer(c, px, gy+4, s*(fx||1)*.8*(back?.82:1));
      else if (kind==='face') gardenerFace(c, px, gy+4, s*(fx||1)*1.25*(back?.9:1));
      else if (kind==='crop') drawCrop(c, id, px, gy, s*1.45*k);
      else if (kind==='tower'){ c.translate(px, gy-s*k*.22); DRAW[id](c, s*k, 0, 0, 1, 1); }
      else if (kind==='pest'){ const E=ENEMY[id]; if (E){ const sz=30*k*(E.shape==='hopper'?.72:1)/E.size; c.translate(px, gy - (E.fly ? 18 : 6)); drawEnemy(c, { type:id, size:E.size, ph:1.2, fly:!!E.fly, face:-1, hp:1, max:1 }, sz); } }
      else if (kind==='scen'){ const ss=s*k; c.translate(px-ss/2, gy-ss*.72); drawScenery(c, { c:0, r:0, w:1, h:1, kind:id, seed:7 }, ss); }
    }
    c.restore();
  }
  canvas.width = off.width; canvas.height = off.height;
  canvas.getContext('2d').putImageData(pencil(off, d), 0, 0);
  return true;
}
