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
// Every picture is hand-placed. Things: [kind, id, x, size, y]; the sprayer and the gardener: [kind, x, size, 1, y].
// x and y are fractions of the picture, y being where the thing stands. Sky and ground props have their own forms:
// ['land'] ['sun', size] ['cloud', x, y, size] ['fence', y] ['cracks'] ['swirl', x, y] ['heat'] ['rain'] ['creek'].
const SCENES = {
  'part-1':           ['happy',  [['land'],['sun'],['cloud',.24,.16,1],['fence',.6],['crop','carrot',.7,.7,.74],['crop','cabbage',.34,.75,.78],['tower','sunflower',.84,1,.9],['crop','cabbage',.16,1,.93],['tower','bunny',.52,1.35,.95]]],
  'part-2':           ['hot',    [['land'],['sun',2.1],['heat'],['cracks'],['pest','locust',.2,.75,.42],['crop','tomato',.2,.9,.9],['pest','stinkbug',.84,.6,.84],['spray',.5,1.7,1,.94]]],
  'part-3':           ['dust',   [['land'],['swirl',.3,.22],['swirl',.74,.3],['cracks'],['scen','stump',.6,1,.72],['crop','wheat',.36,.6,.78],['scen','litter',.86,.8,.8],['scen','tire',.2,1.15,.95],['scen','fire',.72,1.1,.96]]],
  'part-4':           ['rain',   [['land'],['cloud',.3,.14,1.2],['cloud',.72,.2,1],['rain'],['creek'],['scen','sapling',.2,1.3,.8],['tower','barrel',.52,.8,.74],['scen','sapling',.82,1.7,.9],['crop','radish',.58,.95,.9],['scen','clover',.38,1,.9]]],
  'start-cabbage':    ['happy',  [['land'],['sun'],['fence',.6],['tower','bunny',.84,.85,.74],['crop','cabbage',.52,.8,.8],['crop','cabbage',.68,.95,.93],['pest','babyslug',.86,.38,.9],['face',.22,1.15,1,.97]]],
  'after-cabbage':    ['happy',  [['land'],['sun'],['cloud',.24,.16,1],['crop','cabbage',.3,.75,.76],['tower','bunny',.86,.85,.76],['crop','cabbage',.16,1,.93],['crop','cabbage',.42,1.1,.95],['tower','bunny',.7,1.2,.95]]],
  'start-strawberry': ['happy',  [['land'],['cloud',.28,.16,1.1],['fence',.6],['crop','strawberry',.36,.8,.78],['tower','bunny',.86,.85,.78],['crop','strawberry',.18,1,.93],['spray',.6,1.6,1,.95]]],
  'after-strawberry': ['happy',  [['land'],['sun'],['crop','strawberry',.3,.7,.74],['crop','strawberry',.16,1,.94],['crop','strawberry',.4,1,.9],['spray',.74,1.8,1,.95]]],
  'after-carrot':     ['hot',    [['land'],['sun',2.1],['heat'],['creek'],['crop','carrot',.2,1,.88],['crop','carrot',.42,1.05,.9],['crop','carrot',.64,.9,.86],['crop','carrot',.84,.75,.76]]],
  'start-tomato':     ['hot',    [['land'],['sun',2.1],['heat'],['crop','tomato',.4,.8,.8],['crop','tomato',.2,1,.93],['tower','sprinkler',.68,1.15,.94],['spray',.9,1,1,.8]]],
  'after-tomato':     ['hot',    [['land'],['sun'],['cracks'],['pest','stinkbug',.64,.5,.76],['crop','tomato',.18,.9,.92],['pest','stinkbug',.46,.62,.92],['spray',.84,1.5,1,.95]]],
  'start-apple':      ['hot',    [['land'],['cloud',.3,.16,1.1],['crop','apple',.4,.85,.8],['crop','apple',.2,1,.93],['crop','apple',.56,.95,.94],['scen','skep',.82,1.5,.95]]],
  'start-apple-2':    ['hot',    [['land'],['cloud',.7,.16,1],['pest','jbeetle',.52,.55,.76],['pest','jbeetle',.86,.55,.8],['scen','pot',.22,1.5,.96],['pest','jbeetle',.66,.7,.93]]],
  'after-apple':      ['hot',    [['land'],['cloud',.3,.18,1],['crop','apple',.4,.5,.8],['pest','aphid',.74,.4,.78],['crop','apple',.22,.65,.92],['pest','aphid',.6,.45,.9],['pest','aphid',.86,.45,.92]]],
  'start-corn':       ['hot',    [['land'],['sun',2.1],['cracks'],['crop','corn',.38,.85,.8],['tower','sprinkler',.86,.85,.78],['crop','corn',.2,1,.93],['scen','bucket',.64,1.3,.96]]],
  'after-corn':       ['hot',    [['land'],['cracks'],['pest','locust',.24,.7,.36],['pest','locust',.6,.6,.28],['pest','locust',.84,.75,.46],['crop','corn',.18,.8,.92],['spray',.54,1.7,1,.95]]],
  'start-dust':       ['dust',   [['land'],['swirl',.3,.2],['cracks'],['crop','wheat',.34,.7,.8],['scen','trough',.86,1,.8],['crop','wheat',.18,.9,.93],['tower','barrel',.6,1.25,.95]]],
  'start-dust-2':     ['dust',   [['land'],['swirl',.66,.22],['cracks'],['crop','wheat',.86,.65,.78],['scen','bucket',.64,1.1,.93],['spray',.3,1.5,1,.95]]],
  'after-dust':       ['dust',   [['land'],['swirl',.7,.24],['cracks'],['crop','wheat',.4,.8,.82],['crop','wheat',.2,1,.93],['scen','tire',.74,1.4,.96]]],
  'start-rooftop':    ['smog',   [['land'],['cloud',.3,.15,1.2],['cloud',.74,.24,1.1],['pest','pigeon',.82,.8,.52],['crop','pepper',.58,.8,.8],['scen','pot',.2,1.3,.96],['crop','pepper',.42,.95,.93]]],
  'after-rooftop':    ['smog',   [['land'],['cloud',.3,.16,1.2],['cloud',.74,.26,1],['crop','pepper',.38,.85,.82],['crop','pepper',.2,1,.93],['scen','table',.72,1.5,.96]]],
  'start-vault':      ['dark',   [['land'],['cloud',.3,.18,1.1],['cloud',.72,.26,.9],['crop','seed',.6,.85,.82],['scen','rock',.18,1.4,.96],['crop','seed',.44,1,.93],['pest','glowslug',.82,.4,.9]]],
  'after-vault':      ['dark',   [['land'],['cloud',.7,.16,1],['crop','seed',.2,1,.93],['scen','sapling',.52,1.6,.94],['scen','clover',.82,1.2,.95]]],
  'start-rain':       ['rain',   [['land'],['cloud',.3,.14,1.2],['cloud',.72,.2,1],['rain'],['scen','sapling',.2,1.3,.82],['tower','barrel',.86,.85,.8],['scen','sapling',.44,1.8,.95],['crop','radish',.68,.95,.94]]],
  'after-rain':       ['rain',   [['land'],['cloud',.28,.16,1.1],['creek'],['crop','radish',.38,.85,.78],['scen','clover',.86,1,.8],['crop','radish',.2,1,.88],['scen','sapling',.66,1.8,.9]]],
  'start-meadow':     ['regrow', [['land'],['sun'],['cloud',.26,.16,1],['crop','bloom',.52,.8,.8],['scen','clover',.16,1.2,.95],['crop','bloom',.36,1,.93],['tower','hive',.8,1.25,.95]]],
  'after-meadow':     ['regrow', [['land'],['sun'],['crop','bloom',.32,.8,.8],['tower','ladybug',.9,.8,.78],['crop','bloom',.16,1,.93],['crop','bloom',.48,1,.95],['tower','hive',.72,1.15,.93]]],
  'start-newgarden':  ['regrow', [['land'],['sun'],['fence',.6],['crop','pumpkin',.4,.85,.82],['crop','pumpkin',.2,1.1,.94],['scen','sapling',.64,1.7,.94],['tower','bunny',.86,1,.95]]],
  'after-newgarden':  ['regrow', [['land'],['sun'],['cloud',.26,.16,1],['creek'],['tower','hive',.4,.85,.76],['crop','pumpkin',.16,1.1,.88],['scen','sapling',.62,1.8,.9],['tower','bunny',.84,1,.9]]],
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
    const r=a[p]*.7+g*.3, gg=a[p+1]*.7+g*.3, b=a[p+2]*.7+g*.3, A0=1-(1-wash)*(1-line), q=(y*w+x)*4; let A=A0;
    const edge=Math.min(1, Math.min(x, y, w-1-x, h-1-y)/(9*d)); A*=edge*(2-edge);
    if (A<=0.003) continue;
    const kw=wash*(1-line)/A0, kl=line/A0;
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
      if (kind==='spray') sprayer(c, px, gy-(own?2:-4), s*(fx||1)*.8*(back?.82:1));
      else if (kind==='face') gardenerFace(c, px, gy-(own?2:-4), s*(fx||1)*1.25*(back?.9:1));
      else if (kind==='crop') drawCrop(c, id, px, gy-(own ? s*1.45*k*.14 : 0), s*1.45*k);
      else if (kind==='tower'){ c.translate(px, gy-s*k*(own ? .44 : .22)); DRAW[id](c, s*k, 0, 0, 1, 1); }
      else if (kind==='pest'){ const E=ENEMY[id]; if (E){ const sz=30*k*(E.shape==='hopper'?.72:1)/E.size; c.translate(px, gy - (E.fly ? 18 : 6)); drawEnemy(c, { type:id, size:E.size, ph:1.2, fly:!!E.fly, face:-1, hp:1, max:1 }, sz); } }
      else if (kind==='scen'){ const ss=s*k; c.translate(px-ss/2, gy-ss*(own ? .9 : .72)); drawScenery(c, { c:0, r:0, w:1, h:1, kind:id, seed:7 }, ss); }
    }
    c.restore();
  }
  canvas.width = off.width; canvas.height = off.height;
  canvas.getContext('2d').putImageData(pencil(off, d), 0, 0);
  return true;
}
