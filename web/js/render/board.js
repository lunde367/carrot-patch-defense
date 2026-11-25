// Draws the garden board. Sizes itself to fit any phone, tablet or desktop window.
import { G, towerAt, rangeOf, HILL, DUST_TIME, dewy, DIRS, CROW_W, bestDir } from '../engine/game.js';
import { path, buildable, pointAt, laneTotal } from '../engine/path.js';
import { drawScenery, drawBonus } from './art-scenery.js';
import { COLS, ROWS, CHAPTERS } from '../data/levels.js';
import { TYPES } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { ell, rng } from '../../kit/js/draw.js';
import { drawCrop } from './art-common.js';
import { DRAW, drawPips, drawShot, crowBird } from './art-towers.js';
import { drawEnemy } from './art-enemies.js';

let cv, g, bgc, boardEl, tile=0, W=0, H=0, dpr=1;
const clockReal = () => performance.now()/1000;   // keeps hints pulsing while the game is paused

export function initBoard(canvas, el){
  cv=canvas; boardEl=el; g=cv.getContext('2d', { alpha:false }); bgc=document.createElement('canvas');
  const onResize=()=>requestAnimationFrame(resize);
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
}

// Fit the board to the space left after the HUD, controls and tray.
export function resize(){
  if (boardEl.offsetParent===null) return;          // board not on screen (home screen); size it when a level opens
  const app=boardEl.parentElement;
  const vh=(window.visualViewport && window.visualViewport.height) || window.innerHeight;
  // Height of everything except the board: visible siblings, the gaps between them, page padding.
  // The defender info card comes and goes as you tap, so it never shrinks the board.
  const kids=[...app.children].filter(el=>el!==boardEl && el.id!=='info' && el.offsetParent!==null);
  const gap=parseFloat(getComputedStyle(app).rowGap)||0;
  const pad=el=>{ const cs=getComputedStyle(el); return parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom); };
  const reserved = kids.reduce((h,el)=>h+el.offsetHeight,0) + gap*kids.length + pad(document.body) + pad(document.documentElement) + 6;
  const fitW = Math.min(app.clientWidth, 860) / COLS;       // tablets get a bigger board
  const fitH = (vh - reserved) / ROWS;
  tile = Math.max(22, Math.floor(Math.min(fitW, fitH)));
  W=tile*COLS; H=tile*ROWS; dpr=Math.min(2, window.devicePixelRatio||1);
  cv.width=bgc.width=Math.round(W*dpr); cv.height=bgc.height=Math.round(H*dpr);
  cv.style.width=W+'px'; cv.style.height=H+'px';
  rebuild();
}

// Exact board position in tiles (for aiming the Sprayer).
export function tileAt(clientX, clientY){
  const rc=cv.getBoundingClientRect();
  return [(clientX-rc.left)/tile, (clientY-rc.top)/tile];
}
export function cellAt(clientX, clientY){
  const rc=cv.getBoundingClientRect();
  return [Math.floor((clientX-rc.left)/tile), Math.floor((clientY-rc.top)/tile)];
}

// Pre-render the static background (grass, path, fence) once per level or resize.
export function rebuild(){
  if (!tile || !G.LV) return;
  const b=bgc.getContext('2d'), s=tile, CH=G.CH, LV=G.LV;
  b.setTransform(dpr,0,0,dpr,0,0);
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++){ b.fillStyle=CH.grass[(r+c)%2]; b.fillRect(c*s,r*s,s,s); }
  const gy=(ROWS-1)*s; b.fillStyle='#8a5e3c'; b.fillRect(0,gy,W,s);
  b.strokeStyle='#76502f'; b.lineWidth=2; for (let i=1;i<3;i++){ b.beginPath(); b.moveTo(0,gy+i*s/3); b.lineTo(W,gy+i*s/3); b.stroke(); }
  // The ground tells the story: flowers thin out through Part 2, are gone in Part 3, and come back
  // thicker with every level of Part 4. Early Part 4 still has bare patches where nothing grows yet.
  const bloom = storyGround(LV);
  if (bloom.bare){ const Rb=rng(91+LV.gi*5); for (let i=0;i<bloom.bare;i++){ const x=Rb()*W, y=Rb()*(ROWS-1)*s, rr=s*(.5+Rb()*.6);
    ell(b,x,y,rr*1.3,rr*.8,'rgba(150,120,80,.28)'); ell(b,x+rr*.3,y+rr*.1,rr*.7,rr*.45,'rgba(140,108,70,.22)'); } }
  const R=rng(7+LV.gi*13);
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++){
    if (path.cells.has(c+','+r)||path.blocked.has(c+','+r)||path.bonus.has(c+','+r)||R()>.22*bloom.tufts) continue;
    const x=c*s+s*(.2+R()*.6), y=r*s+s*(.2+R()*.6);
    if (R()<bloom.grass){ b.strokeStyle=CH.mood==='withered'?'#9a8a62':'#7fb064'; b.lineWidth=1.5; b.beginPath();
      for (const o of [-.06,0,.06]){ b.moveTo(x,y); b.lineTo(x+o*s*1.5,y-s*.13); } b.stroke(); }
    else if (CH.mood==='withered'){ R(); b.strokeStyle='rgba(90,70,45,.55)'; b.lineWidth=1.2; b.beginPath(); b.moveTo(x-s*.07,y); b.lineTo(x+s*.02,y-s*.05); b.lineTo(x+s*.08,y+s*.02); b.stroke(); }   // dry cracks, no blossoms
    else { const col=['#f7d6e0','#fff3b0','#e2d3f5'][Math.floor(R()*3)];
      for (let k=0;k<5;k++){ const a=k*1.2566; ell(b,x+Math.cos(a)*s*.06,y+Math.sin(a)*s*.06,s*.045,s*.045,col); }
      ell(b,x,y,s*.03,s*.03,'#e6a92e'); }
  }
  b.lineJoin='round'; b.lineCap='round';
  const line=(w,col)=>{ for (const L of path.lanes){ b.beginPath(); L.pts.forEach(([x,y],i)=>i?b.lineTo(x*s,y*s):b.moveTo(x*s,y*s)); b.strokeStyle=col; b.lineWidth=w*s; b.stroke(); } };
  if (path.flood){   // a dry creek bed: pests only use it when it floods
    const bed=(w,col,dash)=>{ b.beginPath(); path.flood.pts.forEach(([x,y],i)=>i?b.lineTo(x*s,y*s):b.moveTo(x*s,y*s)); b.strokeStyle=col; b.lineWidth=w*s; b.setLineDash(dash||[]); b.stroke(); b.setLineDash([]); };
    bed(.7,'#8f9a86'); bed(.56,'#c9cdb6'); bed(.1,'#8fc0d6',[s*.3,s*.22]);
    const RB=rng(53); for (const sg of path.flood.segs){ const n=Math.floor(sg.len*4); for (let i=0;i<n;i++){ const k=RB(); ell(b,(sg.x1+(sg.x2-sg.x1)*k+(RB()-.5)*.4)*s,(sg.y1+(sg.y2-sg.y1)*k+(RB()-.5)*.4)*s,s*.05,s*.036,'#a3a892','#7e8572',1); } }
  }
  line(.84,'#b48d5a'); line(.68,'#dcbd8b');
  const R2=rng(31);
  for (const sg of path.lanes.flatMap(L=>L.segs)){ const n=Math.floor(sg.len*3); for (let i=0;i<n;i++){ const k=R2();
    ell(b,(sg.x1+(sg.x2-sg.x1)*k+(R2()-.5)*.45)*s,(sg.y1+(sg.y2-sg.y1)*k+(R2()-.5)*.45)*s,s*.035,s*.025,'#c4a271'); } }
  // Paved over: in later gardens part of the dirt path has been paved (CH.road = [from, to] as shares of the path).
  // Part 2: pale concrete slabs, like a farm yard or greenhouse aisle. Part 3: old grey asphalt, more cracked each garden.
  // The paving sits inside the dirt edges with square, crumbly ends, so it reads as part of the same path.
  if (CH.road){
    const slab = CH.act===2, [f0,f1]=CH.road;
    const P = slab ? { edge:'#9d998c', fill:'#c4c0b2', joint:'#a29e91', crack:'#8e8a7e', crumb:'#b3afa1' }
                   : { edge:'#55575a', fill:'#6f7174', joint:'#5e6063', crack:'#46484b', crumb:'#7c7e80' };
    const strips=[];
    for (let li=0; li<path.lanes.length; li++){
      const L=path.lanes[li], d0=f0*L.total, d1=f1*L.total, pts=[pointAt(d0,li)];
      for (const sg of L.segs){ const e=sg.start+sg.len; if (e>d0 && e<d1) pts.push([sg.x2,sg.y2]); }
      pts.push(pointAt(d1,li));
      strips.push((w,col)=>{ b.beginPath(); pts.forEach(([x,y],i)=>i?b.lineTo(x*s,y*s):b.moveTo(x*s,y*s)); b.strokeStyle=col; b.lineWidth=w*s; b.lineCap='butt'; b.stroke(); });
    }
    for (const f of strips) f(.66,P.edge);   // all edges first, then all tops, so lanes that meet join cleanly
    for (const f of strips) f(.58,P.fill);
    for (let li=0; li<path.lanes.length; li++){
      const L=path.lanes[li], d0=f0*L.total, d1=f1*L.total;
      // seams across the paving, on tile edges so lanes that share a stretch line up
      b.strokeStyle=P.joint; b.lineWidth=Math.max(1,s*.025); b.lineCap='butt';
      for (const sg of L.segs){ const a0=Math.max(sg.start,d0), a1=Math.min(sg.start+sg.len,d1); if (a1<=a0) continue;
        const h = sg.y1===sg.y2, dir = Math.sign(h ? sg.x2-sg.x1 : sg.y2-sg.y1), base = h ? sg.x1 : sg.y1;
        const u0=base+dir*(a0-sg.start), u1=base+dir*(a1-sg.start);
        for (let u=Math.ceil(Math.min(u0,u1)); u<Math.max(u0,u1); u+=slab?1:2){ const c = h ? sg.y1 : sg.x1;
          b.beginPath(); if (h){ b.moveTo(u*s,(c-.29)*s); b.lineTo(u*s,(c+.29)*s); } else { b.moveTo((c-.29)*s,u*s); b.lineTo((c+.29)*s,u*s); } b.stroke(); } }
      // the ragged start where the paving gives way to dirt (skip it when the whole path is paved)
      const RR=rng(77+LV.gi+li*5);
      if (f0>0){ const [x,y]=pointAt(d0,li), [x2,y2]=pointAt(d0+.05,li), tx=x-x2, ty=y-y2, nx=-ty, ny=tx;   // back along the path, and across it
        for (let i=0;i<5;i++){ const k=(RR()-.5)*.5, back=.04+RR()*.14; ell(b,(x+nx*k*20+tx*back*20)*s,(y+ny*k*20+ty*back*20)*s,s*(.03+RR()*.03),s*(.025+RR()*.02),P.crumb,P.edge,1); } }
      // cracks: a few in Part 2, more in Part 3, with weeds pushing through in the last gardens
      const n=Math.floor((d1-d0)*(CH.cracked?2:slab?.35:.8));
      for (let i=0;i<n;i++){
        const [x,y]=pointAt(d0+RR()*(d1-d0),li), ox=(RR()-.5)*.36, oy=(RR()-.5)*.36;
        b.strokeStyle=P.crack; b.lineWidth=1.1; b.lineCap='round'; b.beginPath(); b.moveTo((x+ox)*s,(y+oy)*s); b.lineTo((x+ox+(RR()-.5)*.22)*s,(y+oy+(RR()-.5)*.22)*s); b.lineTo((x+ox+(RR()-.5)*.3)*s,(y+oy+(RR()-.5)*.3)*s); b.stroke();
        if (CH.cracked && RR()<.4){ b.strokeStyle='#6f9a45'; b.lineWidth=1.2; b.beginPath(); b.moveTo((x+ox)*s,(y+oy)*s); b.lineTo((x+ox-.04)*s,(y+oy-.1)*s); b.moveTo((x+ox)*s,(y+oy)*s); b.lineTo((x+ox+.05)*s,(y+oy-.09)*s); b.stroke(); }
      }
    }
    b.lineCap='round';
  }
  if (CH.drought){
    // cracked, dry ground: thin dark crack lines scattered over the grass
    const RC=rng(91+LV.gi*7); b.strokeStyle='rgba(110,85,40,.45)'; b.lineWidth=1.2; b.lineCap='round';
    for (let i=0;i<26;i++){ let x=RC()*W, y=RC()*gy; if (path.cells.has(Math.floor(x/s)+','+Math.floor(y/s))) continue;
      b.beginPath(); b.moveTo(x,y); for (let k=0;k<3;k++){ x+=(RC()-.5)*s*.7; y+=(RC()-.5)*s*.7; b.lineTo(x,y); } b.stroke(); }
  }
  for (const [k,kind] of path.bonus){ const [c,r]=k.split(',').map(Number); drawBonus(b, {c,r,kind}, s); }
  for (const o of path.scenery) drawScenery(b, o, s);
  if (LV.season!=='summer'){ b.fillStyle=LV.season==='spring'?'rgba(200,245,210,.10)':'rgba(235,165,50,.14)'; b.fillRect(0,0,W,gy); }
  if (CH.greenhouse){
    // glass panes: thin white frame lines every 3 tiles and soft diagonal glare
    b.strokeStyle='rgba(255,255,255,.35)'; b.lineWidth=2;
    for (let c=3;c<COLS;c+=3){ b.beginPath(); b.moveTo(c*s,0); b.lineTo(c*s,gy); b.stroke(); }
    for (let r=4;r<ROWS-1;r+=4){ b.beginPath(); b.moveTo(0,r*s); b.lineTo(W,r*s); b.stroke(); }
    b.fillStyle='rgba(255,255,255,.08)';
    for (const x0 of [W*.1, W*.55]){ b.beginPath(); b.moveTo(x0,0); b.lineTo(x0+s*1.2,0); b.lineTo(x0+s*1.2-gy*.35,gy); b.lineTo(x0-gy*.35,gy); b.closePath(); b.fill(); }
    b.fillStyle='rgba(255,236,190,.07)'; b.fillRect(0,0,W,gy);
  }
  drawFence(b, s, gy);
}
// A white picket fence along the top of the crop row: two rails, evenly spaced pointed pickets with a little shading,
// and sturdy square posts on both sides of every gap where a path comes through.
function drawFence(b, s, gy){
  const top=gy-s*.2, bot=gy+s*.22, pw=s*.11, edge='#a8997a', paint='#f7f1e3', shade='#e2d8c2';
  const runs=[]; let start=null;                                                   // stretches of fence between the path gaps
  for (let c=0;c<=COLS;c++){ const open = c<COLS && !path.exitCols.has(c); if (open && start===null) start=c; if (!open && start!==null){ runs.push([start,c]); start=null; } }
  for (const [c0,c1] of runs){ const x0=c0*s, x1=c1*s;
    b.fillStyle='rgba(60,40,20,.22)'; b.fillRect(x0, bot-s*.02, x1-x0, s*.05);                                // shadow on the soil
    for (const y of [top+s*.1, bot-s*.11]){ b.fillStyle=shade; b.fillRect(x0, y, x1-x0, s*.055); b.strokeStyle=edge; b.lineWidth=1; b.strokeRect(x0+.5, y+.5, x1-x0-1, s*.055-1); }   // rails
    const n=Math.round((x1-x0)/(s*.25)), gap=(x1-x0)/n;
    for (let i=0;i<n;i++){ const x=x0+gap*(i+.5)-pw/2, post=(i===0 && c0>0) || (i===n-1 && c1<COLS);
      if (post) continue;
      b.beginPath(); b.moveTo(x, bot); b.lineTo(x, top+s*.05); b.lineTo(x+pw/2, top-s*.02); b.lineTo(x+pw, top+s*.05); b.lineTo(x+pw, bot); b.closePath();
      b.fillStyle=paint; b.fill(); b.fillStyle=shade; b.fillRect(x+pw*.68, top+s*.06, pw*.32, bot-top-s*.06); b.strokeStyle=edge; b.lineWidth=1.2; b.stroke(); }
    // gate posts beside each gap: taller, square, with a cap
    for (const [px,on] of [[x0, c0>0],[x1-s*.15, c1<COLS]]){ if (!on) continue;
      b.fillStyle=paint; b.strokeStyle=edge; b.lineWidth=1.2; b.beginPath(); b.rect(px+s*.01, top-s*.06, s*.13, bot-top+s*.06); b.fill(); b.stroke();
      b.fillStyle=shade; b.fillRect(px+s*.1, top-s*.05, s*.04, bot-top+s*.04);
      b.fillStyle='#efe6d2'; b.beginPath(); b.rect(px-s*.005, top-s*.1, s*.16, s*.05); b.fill(); b.stroke(); }
  }
}

// How lush the ground is for this level: { tufts: how many decorations, grass: share that are plain grass
// (the rest are flowers), bare: brown patches, bees: bees in the air }.
function storyGround(LV){
  const act=LV.ch.act, part=CHAPTERS.filter(c=>c.act===act).flatMap(c=>c.levels), i=Math.max(0, part.indexOf(LV)), t=part.length>1 ? i/(part.length-1) : 1;
  if (LV.endless) return { tufts:1.7, grass:.35, bare:0, bees:4 };
  if (act===1) return { tufts:1, grass:.5, bare:0, bees:LV.gi<3?2:1 };
  if (act===2) return { tufts:1-.35*t, grass:.55+.4*t, bare:Math.round(t*4), bees:0 };          // the blossoms quietly disappear
  if (act===3) return { tufts:.9, grass:.5, bare:4+Math.round(t*4), bees:0 };
  return { tufts:.7+1.1*t, grass:.7-.4*t, bare:Math.round((1-t)*5), bees:Math.round(t*5) };   // Part 4: it all comes back
}
// A bee wandering over the board (purely for show).
function drawBees(n, clock, s){
  for (let i=0;i<n;i++){ const a=clock*(.35+i*.07)+i*2.1, x=W*(.5+.42*Math.sin(a*1.3+i)), y=(ROWS-1)*s*(.5+.4*Math.sin(a*.9+i*1.7)), w=Math.sin(clock*40+i)*s*.03;
    ell(g,x,y+s*.16,s*.05,s*.02,'rgba(0,0,0,.12)');
    ell(g,x-s*.02,y-s*.045,s*.035,s*.03+w,'rgba(255,255,255,.75)'); ell(g,x+s*.025,y-s*.045,s*.035,s*.03-w,'rgba(255,255,255,.75)');
    ell(g,x,y,s*.055,s*.04,'#f2c230','#5a4210',1); g.fillStyle='#5a4210'; g.fillRect(x-s*.012,y-s*.036,s*.022,s*.072); }
}
export function draw(clock){
  const S=G.S; if (!S || !tile) return;
  const s=tile;
  g.setTransform(1,0,0,1,0,0); g.drawImage(bgc,0,0); g.setTransform(dpr,0,0,dpr,0,0);
  // dead patches left by the spray
  for (const p of S.scorch){ const R=rng(p.seed), rr=p.r*s;
    ell(g,p.x*s,p.y*s,rr,rr*.86,'rgba(120,92,52,.2)');
    for (let i=0;i<5;i++){ const a=R()*6.28, d=R()*rr*.7; ell(g,p.x*s+Math.cos(a)*d,p.y*s+Math.sin(a)*d,rr*.28,rr*.2,'rgba(96,72,40,.14)'); } }

  if (S.flood && path.flood){   // flash flood: the creek bed runs full
    const tf=clockReal(), run=(w,col,dash,off)=>{ g.beginPath(); path.flood.pts.forEach(([x,y],i)=>i?g.lineTo(x*s,y*s):g.moveTo(x*s,y*s)); g.strokeStyle=col; g.lineWidth=w*s; g.lineJoin='round'; g.lineCap='round'; g.setLineDash(dash||[]); g.lineDashOffset=off||0; g.stroke(); g.setLineDash([]); };
    run(.78,'rgba(74,138,176,.9)'); run(.6,'rgba(120,180,214,.9)'); run(.07,'rgba(255,255,255,.75)',[s*.34,s*.5],-tf*s*1.6); run(.05,'rgba(255,255,255,.5)',[s*.2,s*.7],-tf*s*2.3+s*.4);
  }
  if (S.soft){ g.fillStyle='rgba(70,44,20,.16)'; g.fillRect(0,0,W,(ROWS-1)*s); }   // soft ground: the whole field looks dug over and damp
  if (S.dewT){ const a=1, td=clockReal();   // morning dew: a cool sheen and glinting drops
    g.fillStyle=`rgba(150,205,225,${.24*a})`; g.fillRect(0,0,W,(ROWS-1)*s);
    for (let i=0;i<70;i++){ const x=(i*83.7%W), y=(i*131.3%((ROWS-1)*s)), tw=.5+.5*Math.sin(td*3+i*1.7), r=s*(.05+(i%3)*.018); g.globalAlpha=a*(.45+.55*tw); ell(g,x,y,r,r*1.2,'#f2fbff','#6fb4d2',1.2); ell(g,x-r*.3,y-r*.4,r*.28,r*.28,'#ffffff'); } g.globalAlpha=1; }
  if (S.heat){ const p=.5+.5*Math.sin(clockReal()*2.2);
    g.fillStyle=`rgba(255,140,40,${.10+.05*p})`; g.fillRect(0,0,W,(ROWS-1)*s);
    g.strokeStyle='rgba(255,200,140,.25)'; g.lineWidth=2;
    for (let i=0;i<5;i++){ const y=((clockReal()*30+i*60)%((ROWS-1)*s)); g.beginPath();
      for (let x=0;x<=W;x+=12) g.lineTo(x, y+Math.sin(x/18+clockReal()*3+i)*3); g.stroke(); } }
  const show=Math.ceil(S.lives/S.maxLives*(COLS-1)); let k=0;
  for (let c=0;c<COLS;c++){ if (path.exitCols.has(c)) continue; if (k++>=show) continue; drawCrop(g,G.CH.crop,(c+.5)*s,(ROWS-.45)*s,s); }

  if (S.build && S.mode==='play'){ g.fillStyle='rgba(255,255,255,.28)';
    for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++) if (buildable(c,r)&&!towerAt(c,r)){ g.beginPath(); g.arc((c+.5)*s,(r+.5)*s,s*.1,0,6.28); g.fill(); } }
  if (S.sel && TYPES[S.sel.type].range){ const R=rangeOf(S.sel);
    if (TYPES[S.sel.type].line) lineArea(g, S.sel.x, S.sel.y, S.sel.dir||0, R, s, .18);
    else { g.beginPath(); g.arc(S.sel.x*s,S.sel.y*s,R*s,0,6.28); g.fillStyle='rgba(255,255,255,.18)'; g.fill();
    g.setLineDash([6,5]); g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=2; g.stroke(); g.setLineDash([]); } }

  for (const f of S.fx){ const p=1-f.life/f.max;
    if (f.k==='ring'){ g.beginPath(); g.arc(f.x*s,f.y*s,f.r*s*p,0,6.28); g.strokeStyle=f.sup?`rgba(200,235,255,${1-p})`:`rgba(150,210,240,${1-p})`; g.lineWidth=f.sup?5:3; g.stroke();
      if (f.sup){ g.beginPath(); g.arc(f.x*s,f.y*s,f.r*s*p*.7,0,6.28); g.strokeStyle=`rgba(120,190,255,${.8*(1-p)})`; g.lineWidth=2; g.stroke(); } }
    if (f.k==='burst'){ ell(g,f.x*s,f.y*s,f.r*s*(.3+.7*p),f.r*s*(.25+.55*p),`rgba(255,215,90,${.35*(1-p)})`,`rgba(230,170,40,${1-p})`,2);   // golden carrot burst
      for (let k=0;k<8;k++){ const a=k*.785; ell(g,(f.x+Math.cos(a)*f.r*p)*s,(f.y+Math.sin(a)*f.r*.7*p)*s,s*.03,s*.03,`rgba(255,230,120,${1-p})`); } }
    if (f.k==='blast'){ ell(g,f.x*s,f.y*s,f.r*s*(.4+.6*p),f.r*s*(.3+.45*p),`rgba(255,140,40,${.45*(1-p)})`,`rgba(200,70,20,${1-p})`,2.5); }   // firecone landing
    if (f.k==='bolt'){ const a=1-p; g.strokeStyle=`rgba(255,245,140,${a})`; g.lineWidth=4; g.beginPath();   // thunder dive
      let x=f.x*s, y=f.y*s-s*1.6; g.moveTo(x,y); for (let k=0;k<5;k++){ x+=(k%2?1:-1)*s*.14; y+=s*.32; g.lineTo(x,y); } g.stroke();
      g.strokeStyle=`rgba(255,255,255,${a})`; g.lineWidth=1.5; g.stroke(); ell(g,f.x*s,f.y*s,s*.5*p+s*.1,s*.3*p+s*.06,`rgba(255,240,150,${.4*a})`); }
    if (f.k==='tongue'){ const q=p<.5?p*2:2-p*2, ex=f.x+(f.tx-f.x)*q, ey=f.y+(f.ty-f.y)*q;   // a frog's tongue shooting out and back
      g.strokeStyle='#e86a8a'; g.lineWidth=Math.max(2,s*.045); g.lineCap='round'; g.beginPath(); g.moveTo(f.x*s,f.y*s); g.lineTo(ex*s,ey*s); g.stroke(); ell(g,ex*s,ey*s,s*.05,s*.05,'#e86a8a','#b03a5a',1); }
    if (f.k==='carry'){ const a=1-p; g.save(); g.translate(f.x*s,(f.y-.3-p*.8)*s); g.globalAlpha=a; crowBird(g,0,0,s*.42,Math.sin(p*20),true); g.restore(); }   // the big crow flying off with a pest
    if (f.k==='superup'){ for (let k=0;k<3;k++){ const q=Math.min(1,p*1.4+k*.15); g.beginPath(); g.arc(f.x*s,f.y*s,s*(.3+q*1.1),0,6.28); g.strokeStyle=`rgba(255,215,90,${(1-q)*.9})`; g.lineWidth=4-k; g.stroke(); }
      for (let k=0;k<10;k++){ const a=k*.628+p*2; ell(g,(f.x+Math.cos(a)*p*.9)*s,(f.y-.2+Math.sin(a)*p*.6-p*.5)*s,s*.04,s*.04,`rgba(255,240,150,${1-p})`); } }
    if (f.k==='scare'){ g.beginPath(); g.arc(f.x*s,f.y*s,f.r*s*(.3+.7*p),0,6.28); g.strokeStyle=`rgba(194,69,107,${.7*(1-p)})`; g.lineWidth=2.5; g.setLineDash([4,5]); g.stroke(); g.setLineDash([]); }
    if (f.k==='splat'){ ell(g,f.x*s,f.y*s,f.r*s*(.3+.7*p),f.r*s*(.2+.4*p),`rgba(110,80,40,${.45*(1-p)})`,`rgba(70,48,22,${1-p})`,2);
      for (let k=0;k<6;k++){ const a=k*1.05; ell(g,(f.x+Math.cos(a)*f.r*p)*s,(f.y+Math.sin(a)*f.r*.6*p)*s,s*.03,s*.025,`rgba(92,62,30,${1-p})`); } }
    if (f.k==='thud') ell(g,f.x*s,f.y*s,f.r*s*(.4+.6*p),f.r*s*(.25+.4*p),`rgba(120,80,40,${.35*(1-p)})`,`rgba(94,61,32,${1-p})`,2); }
  // spray mist: a yellow-green cloud that billows out and fades
  for (const f of S.fx) if (f.k==='spray'){ const p=1-f.life/f.max, R=f.r*s*(.55+.45*Math.min(1,p*2.2)), a=.42*(1-p);
    g.beginPath(); g.arc(f.x*s,f.y*s,R,0,6.28); g.fillStyle=`rgba(196,214,92,${a})`; g.fill();
    g.setLineDash([5,6]); g.strokeStyle=`rgba(140,160,40,${a*1.6})`; g.lineWidth=2; g.stroke(); g.setLineDash([]);
    for (let i=0;i<9;i++){ const ang=i*.698+p*1.5, rr=R*(.35+.55*((i*37)%10)/10); ell(g,f.x*s+Math.cos(ang)*rr,f.y*s+Math.sin(ang)*rr,s*.12*(1-p*.5),s*.1*(1-p*.5),`rgba(220,232,140,${a})`); } }
  // fertilizer: little green sparkles rise from every defender while it works
  if (S.fertT>0){ const t=clockReal();
    for (const tw of S.towers) for (let k=0;k<2;k++){ const ph=(t*1.4+k*.5+tw.x*.3)%1;
      ell(g,(tw.x+(k?.22:-.22))*s,(tw.y-.1-ph*.5)*s,s*.045,s*.045,`rgba(140,220,90,${1-ph})`); } }
  // burning scenery flickers every frame
  for (const o of path.scenery) if (o.kind==='fire'){ const x=(o.c+.5)*s, y=(o.r+.5)*s, t=clockReal();
    for (let k=0;k<3;k++){ const ph=t*7+k*2.1, h=s*(.26+.06*Math.sin(ph)), w=s*(.13-.025*k), dx=(k-1)*s*.1;
      g.beginPath(); g.moveTo(x+dx-w, y+s*.08); g.quadraticCurveTo(x+dx-w*.8, y-h*.5, x+dx+Math.sin(ph)*s*.03, y-h); g.quadraticCurveTo(x+dx+w*.8, y-h*.5, x+dx+w, y+s*.08); g.closePath();
      g.fillStyle=k===1?'#f6c344':'#ef7a2b'; g.globalAlpha=.9; g.fill(); }
    g.globalAlpha=.35; g.fillStyle='#8a8a8a'; const sm=(t*.4)%1; ell(g,x+Math.sin(t)*s*.05,y-s*(.35+sm*.4),s*(.08+sm*.1),s*(.06+sm*.08),'#9a9a9a'); g.globalAlpha=1; }
  // placing: a ghost of the defender's reach, green where it can go, red where it can't
  const P=G.preview;
  if (P && S.build===P.type){
    const T=TYPES[P.type], ok=buildable(P.c,P.r) && !S.towers.some(t=>t.c===P.c&&t.r===P.r), x=(P.c+.5)*s, y=(P.r+.5)*s;
    g.fillStyle=ok?'rgba(255,255,255,.35)':'rgba(194,69,107,.35)'; g.fillRect(P.c*s+1,P.r*s+1,s-2,s-2);
    if (T.range && ok && T.line){ const R=T.range[0]*S.perks.rangeMul*(path.bonus.get(P.c+','+P.r)==='hill'?HILL:1); lineArea(g, P.c+.5, P.r+.5, bestDir(P.c,P.r,R), R, s, .14); }
    else if (T.range && ok){ const R=T.range[0]*S.perks.rangeMul*(path.bonus.get(P.c+','+P.r)==='hill'?HILL:1)*s;
      g.beginPath(); g.arc(x,y,R,0,6.28); g.fillStyle='rgba(255,255,255,.14)'; g.fill();
      g.setLineDash([5,5]); g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=2; g.stroke(); g.setLineDash([]); }
    if (ok){ g.save(); g.globalAlpha=.6; g.translate(x,y); DRAW[P.type](g,s,0,0,clockReal()); g.restore(); }
  }
  // aiming: show the spray circle where it will land
  if (S.aiming && G.aim){ const R=G.aim.r*s, D=R*(G.aim.drift||1);
    g.beginPath(); g.arc(G.aim.x*s,G.aim.y*s,D,0,6.28); g.setLineDash([3,6]); g.strokeStyle='rgba(160,120,40,.75)'; g.lineWidth=1.5; g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(G.aim.x*s,G.aim.y*s,R,0,6.28);
    g.fillStyle='rgba(196,214,92,.18)'; g.fill(); g.setLineDash([6,5]); g.strokeStyle='rgba(120,140,30,.9)'; g.lineWidth=2; g.stroke(); g.setLineDash([]); }

  if (G.hint){ const p=.5+.5*Math.sin(clockReal()*6), x=(G.hint.c+.5)*s, y=(G.hint.r+.5)*s;
    if (G.hint.reach){   // tutorial: what a defender planted here would reach, with the stretches of path it covers lit up
      const R=G.hint.reach*s; g.beginPath(); g.arc(x,y,R,0,6.28); g.fillStyle='rgba(255,236,150,.16)'; g.fill();
      g.setLineDash([7,6]); g.lineWidth=2; g.strokeStyle='rgba(214,120,40,.85)'; g.stroke(); g.setLineDash([]);
      g.lineCap='round'; g.strokeStyle=`rgba(240,145,63,${.45+.2*p})`; g.lineWidth=s*.26;
      for (let li=0; li<path.all.length; li++){ const T=laneTotal(li); let on=false; g.beginPath();
        for (let d=0; d<=T; d+=.1){ const [px,py]=pointAt(d,li), inR=Math.hypot(px+0-G.hint.c-.5, py-G.hint.r-.5)<=G.hint.reach;
          if (inR){ if (!on){ g.moveTo(px*s,py*s); on=true; } else g.lineTo(px*s,py*s); } else on=false; }
        g.stroke(); }
    }
    g.beginPath(); g.arc(x,y,s*(.36+.08*p),0,6.28); g.fillStyle=`rgba(255,240,170,${.35+.25*p})`; g.fill();
    g.lineWidth=3; g.strokeStyle='#f0913f'; g.stroke(); }

  // morning dew: fast slugs and snails leave a wet, shiny trail
  if (S.dewT) for (const e of S.enemies){ if (e.under || !dewy(e)) continue;
    for (let k=1;k<=7;k++){ const d=e.dist-k*.13; if (d<0) break; const [x,y]=pointAt(d, e.lane), f=1-k/8;
      ell(g,x*s,y*s+e.size*s*.2,e.size*s*(.7+.3*f),e.size*s*(.28+.1*f),`rgba(96,128,140,${.42*f})`);
      ell(g,x*s,y*s+e.size*s*.15,e.size*s*(.45+.2*f),e.size*s*(.12+.05*f),`rgba(205,238,255,${.7*f})`);
      if (k%2) ell(g,x*s-e.size*s*.15,y*s+e.size*s*.2,e.size*s*.12,e.size*s*.05,`rgba(255,255,255,${.8*f})`); } }
  // Sludge trail: black oily smears with a rainbow sheen that shrink as they dry
  if (S.slime && S.slime.length){ const tt=clockReal();
    for (const p of S.slime){ const f=Math.min(1,p.life/3), w=s*(.22+.08*Math.sin(p.seed));
      ell(g,p.x*s,p.y*s+s*.08,w*f+s*.06,w*.5*f+s*.03,`rgba(28,28,18,${.55*f+.1})`,`rgba(205,245,120,${.45*f})`,1.5);
      g.beginPath(); g.ellipse(p.x*s,p.y*s+s*.06,w*.6*f+s*.03,w*.22*f+s*.01,p.seed,3.4,5.8); g.strokeStyle=`hsla(${(tt*40+p.seed*60)%360},70%,62%,${.45*f})`; g.lineWidth=1.5; g.stroke(); } }
  // Cow pats: brown splats with green stink curling up
  if (S.piles && S.piles.length){ const tt=clockReal();
    for (const p of S.piles){ const f=Math.min(1,p.life/.8), R=p.r*s;
      if (p.fire){   // Firecone Pine: cracked, glowing ground with little flames dancing on it
        ell(g,p.x*s,p.y*s+s*.06,R*.85,R*.45,`rgba(60,30,14,${.7*f})`,`rgba(255,120,40,${.8*f})`,1.5);
        g.strokeStyle=`rgba(255,150,50,${.9*f})`; g.lineWidth=1.6; for (let k=0;k<5;k++){ const a=p.seed+k*1.26; g.beginPath(); g.moveTo(p.x*s,p.y*s+s*.06); g.lineTo(p.x*s+Math.cos(a)*R*.5,p.y*s+s*.06+Math.sin(a)*R*.25); g.lineTo(p.x*s+Math.cos(a+.3)*R*.75,p.y*s+s*.06+Math.sin(a+.3)*R*.38); g.stroke(); }
        for (let k=0;k<4;k++){ const ph=tt*7+k*1.9+p.seed, x=p.x*s+(k-1.5)*R*.32, y=p.y*s+s*.06, h=s*(.16+.05*Math.sin(ph))*f;
          g.beginPath(); g.moveTo(x-s*.05,y); g.quadraticCurveTo(x-s*.04,y-h*.6,x+Math.sin(ph)*s*.02,y-h); g.quadraticCurveTo(x+s*.04,y-h*.6,x+s*.05,y); g.closePath(); g.fillStyle=k%2?'#f6c344':'#ef7a2b'; g.globalAlpha=.85*f; g.fill(); g.globalAlpha=1; }
        continue; }
      ell(g,p.x*s,p.y*s+s*.06,R*.7,R*.35,`rgba(92,62,30,${.75*f})`,`rgba(60,40,18,${.8*f})`,1.2);
      ell(g,p.x*s-R*.15,p.y*s+s*.03,R*.35,R*.16,`rgba(120,86,46,${.8*f})`);
      g.strokeStyle=`rgba(150,190,70,${.6*f})`; g.lineWidth=1.6; g.lineCap='round';
      for (let k=0;k<3;k++){ const d=((tt*.7+k*.33+p.seed)%1), x=p.x*s+(k-1)*R*.35, y=p.y*s-d*s*.45;
        g.globalAlpha=1-d; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+s*.06,y-s*.06,x,y-s*.12); g.quadraticCurveTo(x-s*.06,y-s*.18,x,y-s*.24); g.stroke(); }
      g.globalAlpha=1; } }
  // Bee Hive: bees fly back and forth to every defender they help, so you can see who's boosted
  for (const h of S.towers){ if (h.type!=='hive') continue; const R=rangeOf(h), tt=clockReal();
    for (const t of S.towers){ if (t===h || t.type==='sunflower' || TYPES[t.type].support || Math.hypot(t.x-h.x,t.y-h.y)>R) continue;
      for (let k=0;k<2;k++){ const f=(tt*.45+k*.5+t.x*.13+t.y*.07)%1, q=f<.5?f*2:2-f*2, bx=h.x+(t.x-h.x)*q, by=h.y-.15+(t.y-h.y)*q-Math.sin(q*Math.PI)*.35+Math.sin(tt*9+k)*.04;
        ell(g,bx*s,by*s,s*.035,s*.026,'#f2c94a','#3a2614',1); ell(g,bx*s,by*s-s*.025,s*.024,s*.013,'rgba(255,255,255,.85)'); } } }
  // towers and pests sorted by depth so nearer things overlap farther ones
  const items=[];
  for (const t of S.towers) items.push({y:t.y,t});
  for (const e of S.enemies) items.push({y:e.y+(e.fly?.6:0),e});
  items.sort((a,b)=>a.y-b.y);
  for (const it of items){
    g.save();
    if (it.t){ const t=it.t; g.translate(t.x*s,t.y*s);
      if (TYPES[t.type].line){ const [dx,dy]=DIRS[t.dir||0];   // which way the scarecrow throws: three little chevrons on the ground
        g.strokeStyle='rgba(60,40,20,.45)'; g.lineWidth=2.2; g.lineCap='round';
        for (let k=0;k<3;k++){ const d=.42+k*.15, x=dx*d*s, y=dy*d*s+s*.18, w=s*.07; g.beginPath(); g.moveTo(x-dx*w-dy*w, y-dy*w-dx*w); g.lineTo(x, y); g.lineTo(x-dx*w+dy*w, y-dy*w+dx*w); g.stroke(); } }
      if (t.lv>=3){ const tt=clockReal(), pl=.5+.5*Math.sin(tt*3+t.x);   // Super: a golden glow on the ground and sparkles drifting up
        const gr=g.createRadialGradient(0,s*.22,0,0,s*.22,s*.55); gr.addColorStop(0,`rgba(255,220,100,${.45+.2*pl})`); gr.addColorStop(1,'rgba(255,220,100,0)');
        g.fillStyle=gr; g.beginPath(); g.ellipse(0,s*.22,s*.55,s*.26,0,0,6.28); g.fill();
        ell(g,0,s*.26,s*.38,s*.13,null,`rgba(255,210,80,${.6+.3*pl})`,2);
        for (let k=0;k<4;k++){ const ph=(tt*.6+k*.25+t.x*.17)%1, x=Math.sin(k*2.3+tt)*s*.3, y=s*.2-ph*s*.7; g.globalAlpha=1-ph;
          g.beginPath(); g.moveTo(x,y-s*.04); g.lineTo(x+s*.012,y-s*.012); g.lineTo(x+s*.04,y); g.lineTo(x+s*.012,y+s*.012); g.lineTo(x,y+s*.04); g.lineTo(x-s*.012,y+s*.012); g.lineTo(x-s*.04,y); g.lineTo(x-s*.012,y-s*.012); g.closePath(); g.fillStyle='#fff2a0'; g.fill(); }
        g.globalAlpha=1; }
      if (S.sel===t) ell(g,0,s*.26,s*.36,s*.12,null,'#fff',2);
      if (t.wilt>0){ g.globalAlpha=.5; g.save(); g.translate(s*.06,s*.06); g.rotate(.22); DRAW[t.type](g,s,0,t.lv,0,t.look||1); g.restore(); g.globalAlpha=1;
        ell(g,s*.22,-s*.3,s*.07,s*.07,'#c4d65c','#7d8f2a',1); g.fillStyle='#4a5a14'; g.font=`800 ${Math.round(s*.13)}px Nunito, sans-serif`; g.textAlign='center'; g.fillText('!',s*.22,-s*.255); }
      else { g.save(); DRAW[t.type](g,s,t.hop,t.lv,clock+t.x,t.look||1); g.restore(); }
      if (t.dry){ const d=(clockReal()*.8+t.x)%1; g.save(); g.translate(s*.24,-s*.24); g.rotate(.6+d*.4); ell(g,0,0,s*.06,s*.03,`rgba(190,140,60,${1-d*.5})`,'#8a6a2a',1); g.restore(); }
      if (t.gunk){ const d=(clockReal()*.9+t.x)%1;   // gummed up by sludge: oily drips and a dark puddle at its feet
        ell(g,0,s*.28,s*.36,s*.11,'rgba(24,24,14,.7)'); g.beginPath(); g.ellipse(0,s*.27,s*.24,s*.06,0,3.4,5.9); g.strokeStyle=`hsla(${(clockReal()*40+t.x*50)%360},70%,62%,.6)`; g.lineWidth=1.5; g.stroke();
        ell(g,s*.24,-s*.28,s*.07,s*.06,'#2a2a1c','#0e0e08',1); ell(g,s*.22,-s*.3,s*.02,s*.015,'rgba(255,255,255,.6)'); ell(g,-s*.18,-s*.1+d*s*.3,s*.03,s*.045,`rgba(40,40,26,${1-d})`); ell(g,s*.14,-s*.18+((d+.5)%1)*s*.3,s*.025,s*.04,`rgba(40,40,26,${1-(d+.5)%1})`); }
      if (S.heat && !t.cool){ const d=(clockReal()*1.4+t.x)%1; ell(g,s*.24,-s*.28+d*s*.18,s*.035,s*.05,`rgba(120,190,240,${1-d})`); }
      drawPips(g,s,t.lv); }
    else { const e=it.e; g.translate(e.x*s,e.y*s); g.save(); if (e.face<0) g.scale(-1,1); if (G.CH.smog && e.fly) g.globalAlpha=.55; drawEnemy(g,e,s); g.restore();
      if (G.LV.resist>0 && !e.under && !e.cocoon){ const hue=(clockReal()*90+e.ph*40)%360, ly=e.fly?-s*.28:0;   // chemical sheen = spray resistant
        g.beginPath(); g.ellipse(0,ly-e.size*s*.15,e.size*s*.7,e.size*s*.3,0,3.4,6.0); g.strokeStyle=`hsla(${hue},80%,70%,.55)`; g.lineWidth=2; g.stroke(); }
      const lift=e.fly?s*.28:0;
      if (S.dewT && !e.under && dewy(e)){ const tw=.5+.5*Math.sin(clockReal()*7+e.ph*3);   // a glint on the wet shell
        g.globalAlpha=.55+.45*tw; ell(g,-e.size*s*.25,-e.size*s*.45,e.size*s*.12,e.size*s*.12,'#ffffff'); ell(g,-e.size*s*.25,-e.size*s*.45,e.size*s*.26,e.size*s*.04,'rgba(255,255,255,.8)'); ell(g,-e.size*s*.25,-e.size*s*.45,e.size*s*.04,e.size*s*.26,'rgba(255,255,255,.8)'); g.globalAlpha=1; }
      if (e.hit>0&&!e.under){ g.globalAlpha=e.hit*4; ell(g,0,-lift,e.size*s,e.size*s*.8,'rgba(255,255,255,.8)'); g.globalAlpha=1; }
      if (e.hp<e.max&&!e.under){ const bw=s*(ENEMY[e.type].boss?.9:.5), by=-e.size*s-8-lift; g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(-bw/2,by,bw,4);
        g.fillStyle=e.hp/e.max>.4?'#7cc85a':'#e5734a'; g.fillRect(-bw/2,by,bw*e.hp/e.max,4);
        if (e.armor){ g.fillStyle='#9aa8b4'; g.fillRect(-bw/2-5,by-1,4,6); } } }
    g.restore();
  }
  for (const sh of S.shots){ g.save(); g.translate(sh.x*s,sh.y*s); drawShot(g,sh,s); g.restore(); }
  // Queen's Hive guard bees fly over the pests, so the sting shows
  for (const f of S.fx){ if (f.k!=='sting') continue; const p=1-f.life/f.max;
    { const q=Math.min(1,p*1.6), bx=f.x+(f.tx-f.x)*q, by=f.y+(f.ty-f.y)*q-Math.sin(q*Math.PI)*.25, dir=Math.sign(f.tx-f.x)||1;   // a guard bee darting out to sting
      for (let k=1;k<4;k++){ const qq=Math.max(0,q-k*.09), tx=f.x+(f.tx-f.x)*qq, ty=f.y+(f.ty-f.y)*qq-Math.sin(qq*Math.PI)*.25; ell(g,tx*s,ty*s,s*.02*(1-k*.2),s*.02*(1-k*.2),`rgba(255,220,90,${.55-k*.15})`); }   // a buzzing trail
      g.save(); g.translate(bx*s,by*s); g.scale(dir*1.5,1.5);
      ell(g,0,-s*.05,s*.05,s*.03,'rgba(255,255,255,.9)','rgba(120,120,120,.5)',1);                                   // wings
      ell(g,0,0,s*.075,s*.05,'#f2c94a','#3a2614',1.4); g.fillStyle='#3a2614'; g.fillRect(-s*.025,-s*.048,s*.018,s*.096); g.fillRect(s*.012,-s*.045,s*.016,s*.09);
      g.beginPath(); g.moveTo(-s*.07,-s*.012); g.lineTo(-s*.12,0); g.lineTo(-s*.07,s*.012); g.fillStyle='#c8202e'; g.fill();   // a red stinger
      ell(g,s*.05,-s*.012,s*.012,s*.012,'#1a1410'); g.strokeStyle='#1a1410'; g.lineWidth=1.2; g.beginPath(); g.moveTo(s*.035,-s*.035); g.lineTo(s*.065,-s*.028); g.stroke();   // an angry brow
      g.restore();
      if (q>=1){ const z=(p-1/1.6)/(1-1/1.6), r=s*(.14+z*.2);                                                       // the sting lands: a little red-and-yellow zap
        g.strokeStyle=`rgba(232,60,50,${1-z})`; g.lineWidth=2.2; for (let k=0;k<6;k++){ const an=k*1.047; g.beginPath(); g.moveTo(f.tx*s+Math.cos(an)*r*.4,f.ty*s+Math.sin(an)*r*.4); g.lineTo(f.tx*s+Math.cos(an)*r,f.ty*s+Math.sin(an)*r); g.stroke(); }
        ell(g,f.tx*s,f.ty*s,r*.35,r*.35,`rgba(255,230,90,${.8*(1-z)})`); } }
  }

  const H=(ROWS-1)*s, tt=clockReal();
  if (G.CH.smog){   // drifting yellow-gray smog
    for (let i=0;i<4;i++){ const x=((tt*12+i*W/2.3)%(W*1.6))-W*.3, y=H*(.15+i*.22);
      const gr=g.createRadialGradient(x,y,0,x,y,W*.45); gr.addColorStop(0,'rgba(170,160,120,.32)'); gr.addColorStop(1,'rgba(170,160,120,0)');
      g.fillStyle=gr; g.fillRect(0,0,W,H); } }
  if (!S.rain){ const bz=storyGround(G.LV).bees; if (bz) drawBees(bz, clockReal(), s); }
  if (S.rain){   // falling rain
    g.strokeStyle='rgba(200,225,245,.6)'; g.lineWidth=1.2;
    for (let i=0;i<70;i++){ const x=((i*53.7)%W + tt*20)%W, y=((i*97.3 + tt*420)%(H+30))-15; g.beginPath(); g.moveTo(x,y); g.lineTo(x-3,y+12); g.stroke(); }
    g.fillStyle='rgba(90,130,170,.08)'; g.fillRect(0,0,W,H); }
  if (S.dustT>0){   // a dust storm: a brown wall blows across and hides the pests
    const tt2=clockReal(), a=Math.min(1, S.dustT/1.2, (DUST_TIME-S.dustT)/.8);
    g.fillStyle=`rgba(176,140,92,${.5*a})`; g.fillRect(0,0,W,H+s);
    g.lineCap='round';
    for (let i=0;i<26;i++){ const y=(i*97.3%(H+s)), x=((i*211.7+tt2*(260+i%5*60))%(W*1.6))-W*.3, len=s*(1.2+(i%4)*.7);
      g.strokeStyle=`rgba(${i%2?226:140},${i%2?200:108},${i%2?150:70},${(.22+.1*(i%3))*a})`; g.lineWidth=s*(.05+(i%3)*.035);
      g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+len*.5,y+Math.sin(tt2*2+i)*s*.14,x+len,y+Math.sin(tt2*1.3+i)*s*.08); g.stroke(); }
  }
  if (G.CH.mood==='withered'){   // Part 3: a sick sky, ash drifting down, embers rising where it's dark
    const id=G.CH.id, tint = id==='dust' ? 'rgba(200,120,50,.11)' : id==='vault' ? 'rgba(60,40,70,.14)' : 'rgba(110,120,90,.08)';
    g.fillStyle=tint; g.fillRect(0,0,W,H+s);
    g.fillStyle = id==='dust' ? 'rgba(120,90,60,.5)' : 'rgba(70,66,62,.55)';
    for (let i=0;i<46;i++){ const x=((i*71.3 + tt*(9+i%5*3) + Math.sin(tt*.7+i)*14)%(W+20))-10, y=((i*113.7 + tt*(16+i%7*4))%(H+20))-10, r=s*(.018+(i%4)*.008); g.beginPath(); g.ellipse(x,y,r*1.4,r,i,0,6.3); g.fill(); }
    if (id!=='rooftop'){ for (let i=0;i<14;i++){ const life=((tt*.22+i*.173)%1), x=((i*197.3)%W)+Math.sin(tt*1.3+i*2)*s*.3, y=H-life*H*.9; g.globalAlpha=(1-life)*.75; ell(g,x,y,s*.03,s*.03,'#ffb24a'); } g.globalAlpha=1; }
  }
  if (G.CH.dark){   // the vault: dim edges, light in the middle
    const gr=g.createRadialGradient(W/2,H*.55,W*.25,W/2,H*.55,W*1.05); gr.addColorStop(0,'rgba(20,18,12,0)'); gr.addColorStop(1,'rgba(20,18,12,.55)');
    g.fillStyle=gr; g.fillRect(0,0,W,H+s); }
  for (const f of S.fx){ const a=Math.max(0,f.life/f.max);
    if (f.k==='puff'){ g.globalAlpha=a; ell(g,f.x*s,f.y*s,s*.07*(1.5-a),s*.07*(1.5-a),'#fffbe8'); g.globalAlpha=1; }
    if (f.k==='txt'){ g.globalAlpha=a; g.font=`800 ${Math.round(s*.36)}px Sniglet, Nunito, ui-rounded, sans-serif`; g.textAlign='center';
      g.lineWidth=3; g.strokeStyle='rgba(255,255,255,.9)'; g.strokeText(f.t,f.x*s,f.y*s); g.fillStyle=f.c; g.fillText(f.t,f.x*s,f.y*s); g.globalAlpha=1; }
  }
}

// A Scarecrow's reach: a straight lane from its tile, one way.
function lineArea(g, x, y, dir, L, s, alpha){
  const [dx,dy]=DIRS[dir], w=CROW_W, x0=x+dx*.15, y0=y+dy*.15, x1=x+dx*L, y1=y+dy*L;
  const lx=Math.min(x0,x1)-(dy?w:0), ly=Math.min(y0,y1)-(dx?w:0), lw=Math.abs(x1-x0)+(dy?2*w:0), lh=Math.abs(y1-y0)+(dx?2*w:0);
  g.beginPath(); g.roundRect(lx*s, ly*s, lw*s, lh*s, s*.2); g.fillStyle=`rgba(255,255,255,${alpha})`; g.fill();
  g.setLineDash([6,5]); g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=2; g.stroke(); g.setLineDash([]);
  g.fillStyle='rgba(255,255,255,.85)'; g.beginPath(); const hx=x1*s, hy=y1*s, a=s*.16;   // an arrowhead at the far end
  g.moveTo(hx+dx*a*.6, hy+dy*a*.6); g.lineTo(hx-dx*a*.5-dy*a, hy-dy*a*.5-dx*a); g.lineTo(hx-dx*a*.5+dy*a, hy-dy*a*.5+dx*a); g.closePath(); g.fill();
}
