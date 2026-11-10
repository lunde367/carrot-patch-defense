// Draws the garden board. Sizes itself to fit any phone, tablet or desktop window.
import { G, towerAt, rangeOf } from '../engine/game.js';
import { path, buildable } from '../engine/path.js';
import { COLS, ROWS } from '../data/levels.js';
import { TYPES } from '../data/towers.js';
import { ENEMY } from '../data/enemies.js';
import { ell, rng } from '../../kit/js/draw.js';
import { drawCrop } from './art-common.js';
import { DRAW, drawPips, drawShot } from './art-towers.js';
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
  const kids=[...app.children].filter(el=>el!==boardEl && el.offsetParent!==null);
  const gap=parseFloat(getComputedStyle(app).rowGap)||0;
  const pad=el=>{ const cs=getComputedStyle(el); return parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom); };
  const reserved = kids.reduce((h,el)=>h+el.offsetHeight,0) + gap*kids.length + pad(document.body) + pad(document.documentElement) + 6;
  const fitW = Math.min(app.clientWidth, 560) / COLS;
  const fitH = (vh - reserved) / ROWS;
  tile = Math.max(22, Math.floor(Math.min(fitW, fitH)));
  W=tile*COLS; H=tile*ROWS; dpr=Math.min(2, window.devicePixelRatio||1);
  cv.width=bgc.width=Math.round(W*dpr); cv.height=bgc.height=Math.round(H*dpr);
  cv.style.width=W+'px'; cv.style.height=H+'px';
  rebuild();
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
  const R=rng(7+LV.gi*13);
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++){
    if (path.cells.has(c+','+r)||R()>.22) continue;
    const x=c*s+s*(.2+R()*.6), y=r*s+s*(.2+R()*.6);
    if (R()<.5){ b.strokeStyle='#7fb064'; b.lineWidth=1.5; b.beginPath();
      for (const o of [-.06,0,.06]){ b.moveTo(x,y); b.lineTo(x+o*s*1.5,y-s*.13); } b.stroke(); }
    else { const col=['#f7d6e0','#fff3b0','#e2d3f5'][Math.floor(R()*3)];
      for (let k=0;k<5;k++){ const a=k*1.2566; ell(b,x+Math.cos(a)*s*.06,y+Math.sin(a)*s*.06,s*.045,s*.045,col); }
      ell(b,x,y,s*.03,s*.03,'#e6a92e'); }
  }
  b.lineJoin='round'; b.lineCap='round';
  const line=(w,col)=>{ b.beginPath(); path.pts.forEach(([x,y],i)=>i?b.lineTo(x*s,y*s):b.moveTo(x*s,y*s)); b.strokeStyle=col; b.lineWidth=w*s; b.stroke(); };
  line(.84,'#b48d5a'); line(.68,'#dcbd8b');
  const R2=rng(31);
  for (const sg of path.segs){ const n=Math.floor(sg.len*3); for (let i=0;i<n;i++){ const k=R2();
    ell(b,(sg.x1+(sg.x2-sg.x1)*k+(R2()-.5)*.45)*s,(sg.y1+(sg.y2-sg.y1)*k+(R2()-.5)*.45)*s,s*.035,s*.025,'#c4a271'); } }
  if (LV.season!=='summer'){ b.fillStyle=LV.season==='spring'?'rgba(200,245,210,.10)':'rgba(235,165,50,.14)'; b.fillRect(0,0,W,gy); }
  b.fillStyle='#f3ead8'; b.strokeStyle='#b9ab8f'; b.lineWidth=1;
  for (let c=0;c<COLS;c++){ if (c===path.exitCol) continue; for (const o of [.22,.62]){ const x=c*s+o*s;
    b.beginPath(); b.moveTo(x,gy+s*.02); b.lineTo(x+s*.08,gy-s*.12); b.lineTo(x+s*.16,gy+s*.02); b.lineTo(x+s*.16,gy+s*.2); b.lineTo(x,gy+s*.2); b.closePath(); b.fill(); b.stroke(); } }
}

export function draw(clock){
  const S=G.S; if (!S || !tile) return;
  const s=tile;
  g.setTransform(1,0,0,1,0,0); g.drawImage(bgc,0,0); g.setTransform(dpr,0,0,dpr,0,0);

  const show=Math.ceil(S.lives/S.maxLives*(COLS-1)); let k=0;
  for (let c=0;c<COLS;c++){ if (c===path.exitCol) continue; if (k++>=show) continue; drawCrop(g,G.CH.crop,(c+.5)*s,(ROWS-.45)*s,s); }

  if (S.build && S.mode==='play'){ g.fillStyle='rgba(255,255,255,.28)';
    for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++) if (buildable(c,r)&&!towerAt(c,r)){ g.beginPath(); g.arc((c+.5)*s,(r+.5)*s,s*.1,0,6.28); g.fill(); } }
  if (S.sel && TYPES[S.sel.type].range){ const R=rangeOf(S.sel);
    g.beginPath(); g.arc(S.sel.x*s,S.sel.y*s,R*s,0,6.28); g.fillStyle='rgba(255,255,255,.18)'; g.fill();
    g.setLineDash([6,5]); g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=2; g.stroke(); g.setLineDash([]); }

  for (const f of S.fx){ const p=1-f.life/f.max;
    if (f.k==='ring'){ g.beginPath(); g.arc(f.x*s,f.y*s,f.r*s*p,0,6.28); g.strokeStyle=`rgba(150,210,240,${1-p})`; g.lineWidth=3; g.stroke(); }
    if (f.k==='thud') ell(g,f.x*s,f.y*s,f.r*s*(.4+.6*p),f.r*s*(.25+.4*p),`rgba(120,80,40,${.35*(1-p)})`,`rgba(94,61,32,${1-p})`,2); }

  if (G.hint){ const p=.5+.5*Math.sin(clockReal()*6), x=(G.hint.c+.5)*s, y=(G.hint.r+.5)*s;
    g.beginPath(); g.arc(x,y,s*(.36+.08*p),0,6.28); g.fillStyle=`rgba(255,240,170,${.35+.25*p})`; g.fill();
    g.lineWidth=3; g.strokeStyle='#f0913f'; g.stroke(); }

  // towers and pests sorted by depth so nearer things overlap farther ones
  const items=[];
  for (const t of S.towers) items.push({y:t.y,t});
  for (const e of S.enemies) items.push({y:e.y+(e.fly?.6:0),e});
  items.sort((a,b)=>a.y-b.y);
  for (const it of items){
    g.save();
    if (it.t){ const t=it.t; g.translate(t.x*s,t.y*s);
      if (S.sel===t) ell(g,0,s*.26,s*.36,s*.12,null,'#fff',2);
      g.save(); DRAW[t.type](g,s,t.hop,t.lv,clock+t.x,t.look||1); g.restore(); drawPips(g,s,t.lv); }
    else { const e=it.e; g.translate(e.x*s,e.y*s); g.save(); if (e.face<0) g.scale(-1,1); drawEnemy(g,e,s); g.restore();
      const lift=e.fly?s*.28:0;
      if (e.hit>0&&!e.under){ g.globalAlpha=e.hit*4; ell(g,0,-lift,e.size*s,e.size*s*.8,'rgba(255,255,255,.8)'); g.globalAlpha=1; }
      if (e.hp<e.max&&!e.under){ const bw=s*(ENEMY[e.type].boss?.9:.5), by=-e.size*s-8-lift; g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(-bw/2,by,bw,4);
        g.fillStyle=e.hp/e.max>.4?'#7cc85a':'#e5734a'; g.fillRect(-bw/2,by,bw*e.hp/e.max,4);
        if (e.armor){ g.fillStyle='#9aa8b4'; g.fillRect(-bw/2-5,by-1,4,6); } } }
    g.restore();
  }
  for (const sh of S.shots){ g.save(); g.translate(sh.x*s,sh.y*s); drawShot(g,sh,s); g.restore(); }
  for (const f of S.fx){ const a=Math.max(0,f.life/f.max);
    if (f.k==='puff'){ g.globalAlpha=a; ell(g,f.x*s,f.y*s,s*.07*(1.5-a),s*.07*(1.5-a),'#fffbe8'); g.globalAlpha=1; }
    if (f.k==='txt'){ g.globalAlpha=a; g.font=`800 ${Math.round(s*.36)}px Sniglet, Nunito, ui-rounded, sans-serif`; g.textAlign='center';
      g.lineWidth=3; g.strokeStyle='rgba(255,255,255,.9)'; g.strokeText(f.t,f.x*s,f.y*s); g.fillStyle=f.c; g.fillText(f.t,f.x*s,f.y*s); g.globalAlpha=1; }
  }
}
