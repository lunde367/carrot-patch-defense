// Defenders, drawn at the origin facing right. s = tile size, t = hop (0..1), anim = clock.
import { ell } from './art-common.js';

function bunny(c,s,t){
  ell(c,0,s*.26,s*.28,s*.08,'rgba(40,60,20,.25)'); c.translate(0,-t*s*.1);
  for (const o of [-1,1]){ ell(c,o*s*.075,-s*.3,s*.055,s*.15,'#f7f2ec','#7d6f62',s*.025); ell(c,o*s*.075,-s*.29,s*.025,s*.1,'#f2a7b5'); }
  ell(c,0,s*.08,s*.23,s*.19,'#f7f2ec','#7d6f62',s*.03);
  ell(c,0,-s*.1,s*.17,s*.14,'#f7f2ec','#7d6f62',s*.03);
  ell(c,-s*.06,-s*.12,s*.025,s*.03,'#3a2e26'); ell(c,s*.06,-s*.12,s*.025,s*.03,'#3a2e26');
  ell(c,0,-s*.065,s*.025,s*.018,'#e88aa0');
  c.save(); c.translate(s*.12,s*.06); c.rotate(-.6); c.beginPath(); c.moveTo(-s*.05,0); c.lineTo(s*.05,0); c.lineTo(0,s*.16); c.closePath();
  c.fillStyle='#ef8a2b'; c.fill(); ell(c,0,-s*.02,s*.04,s*.025,'#5fa040'); c.restore();
}
function sprinkler(c,s,t,lv,anim){
  ell(c,0,s*.24,s*.28,s*.08,'rgba(40,60,20,.25)');
  c.strokeStyle='#41657a'; c.lineWidth=s*.06; c.lineCap='round'; c.beginPath(); c.moveTo(s*.12,-s*.05); c.lineTo(s*.3,-s*.2); c.stroke();
  ell(c,s*.31,-s*.21,s*.05,s*.04,'#5d93b4','#41657a',s*.02);
  c.beginPath(); c.arc(-s*.02,-s*.18,s*.11,Math.PI,0); c.lineWidth=s*.04; c.stroke();
  c.beginPath(); c.roundRect(-s*.17,-s*.16,s*.32,s*.36,s*.07); c.fillStyle='#7fb3d1'; c.fill(); c.lineWidth=s*.03; c.stroke();
  c.fillStyle='rgba(255,255,255,.45)'; c.fillRect(-s*.12,-s*.1,s*.05,s*.22);
  for (let i=0;i<3;i++){ const a=anim*2+i*2.094; ell(c,Math.cos(a)*s*.36,Math.sin(a)*s*.2-s*.02,s*.035,s*.045,'#bfe3f5'); }
}
function owl(c,s,t,lv,anim,look){
  ell(c,0,s*.28,s*.25,s*.07,'rgba(40,60,20,.25)'); c.translate(0,-t*s*.06);
  c.fillStyle='#7a5a3d'; for (const o of [-1,1]){ c.beginPath(); c.moveTo(o*s*.08,-s*.24); c.lineTo(o*s*.2,-s*.34); c.lineTo(o*s*.19,-s*.18); c.fill(); }
  ell(c,0,s*.02,s*.22,s*.27,'#9b7552','#5a3f28',s*.03);
  ell(c,0,s*.1,s*.13,s*.15,'#dcc49d');
  const blink=(anim%4)<.12;
  for (const o of [-1,1]){ ell(c,o*s*.09,-s*.09,s*.085,blink?s*.015:s*.085,'#fff','#5a3f28',s*.02);
    if (!blink) ell(c,o*s*.09+(look||1)*s*.03,-s*.09,s*.04,s*.04,'#2b2018'); }
  c.beginPath(); c.moveTo(-s*.035,-s*.02); c.lineTo(s*.035,-s*.02); c.lineTo(0,s*.04); c.fillStyle='#e8a33c'; c.fill();
}
function sunflower(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.2,s*.06,'rgba(40,60,20,.25)');
  const sw=Math.sin(anim*1.5)*.06;
  c.strokeStyle='#4f8a3c'; c.lineWidth=s*.05; c.beginPath(); c.moveTo(0,s*.3); c.quadraticCurveTo(s*.02,s*.1,0,-s*.05); c.stroke();
  c.save(); c.translate(s*.06,s*.17); c.rotate(-.6); ell(c,0,0,s*.09,s*.04,'#6aa84f'); c.restore();
  c.save(); c.translate(0,-s*.1); c.rotate(sw); const big=1+t*.1;
  for (let k=0;k<11;k++){ c.save(); c.rotate(k*.5712); ell(c,0,-s*.15*big,s*.05,s*.085*big,'#f4c430','#d39b12',s*.015); c.restore(); }
  ell(c,0,0,s*.1,s*.1,'#6b4423'); ell(c,-s*.03,-s*.03,s*.025,s*.025,'#8a5a30'); c.restore();
}
function rose(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.22,s*.06,'rgba(40,60,20,.25)');
  c.strokeStyle='#3f7a3a'; c.lineWidth=s*.045; c.lineCap='round'; c.beginPath(); c.moveTo(0,s*.3); c.quadraticCurveTo(-s*.04,s*.08,0,-s*.08); c.stroke();
  c.fillStyle='#2f5e2c'; for (const [x,y,d] of [[-.02,.2,-1],[.0,.06,1]]){ c.beginPath(); c.moveTo(x*s,y*s); c.lineTo(x*s+d*s*.06,y*s-s*.02); c.lineTo(x*s,y*s-s*.04); c.fill(); }
  c.save(); c.translate(s*.07,s*.12); c.rotate(-.5); ell(c,0,0,s*.09,s*.045,'#5c9a4a','#3f7a3a',s*.015); c.restore();
  c.save(); c.translate(-s*.08,s*.18); c.rotate(.5); ell(c,0,0,s*.08,s*.04,'#5c9a4a','#3f7a3a',s*.015); c.restore();
  c.save(); c.translate(0,-s*.15); const p=1+t*.12; c.scale(p,p);
  for (let k=0;k<6;k++){ c.save(); c.rotate(k*1.047+anim*.2); ell(c,0,-s*.1,s*.075,s*.08,'#d6455d','#8f1f37',s*.015); c.restore(); }
  ell(c,0,0,s*.1,s*.1,'#c23250','#8f1f37',s*.015);
  c.beginPath(); c.arc(0,0,s*.055,0,4.8); c.strokeStyle='#8f1f37'; c.lineWidth=s*.02; c.stroke();
  c.restore();
}
function pine(c,s,t){
  ell(c,0,s*.3,s*.3,s*.08,'rgba(40,60,20,.25)');
  c.fillStyle='#7a5234'; c.fillRect(-s*.05,s*.12,s*.1,s*.18);
  const sq=1-t*.08; c.save(); c.scale(1/sq,sq);
  const tri=(y,w,h,col)=>{ c.beginPath(); c.moveTo(0,y-h); c.lineTo(w,y); c.lineTo(-w,y); c.closePath(); c.fillStyle=col; c.fill(); c.strokeStyle='#244d2c'; c.lineWidth=s*.02; c.stroke(); };
  tri(s*.16,s*.3,s*.26,'#3d7a48'); tri(s*.0,s*.24,s*.24,'#478a52'); tri(-s*.15,s*.17,s*.22,'#52995c');
  ell(c,-s*.12,s*.12,s*.04,s*.055,'#9a6b3c','#5e3d20',s*.012); ell(c,s*.1,-s*.02,s*.035,s*.05,'#9a6b3c','#5e3d20',s*.012);
  c.restore();
}
function squirrel(c,s,t,lv,anim,look){
  ell(c,0,s*.28,s*.28,s*.08,'rgba(40,60,20,.25)'); c.scale(look||1,1); c.translate(0,-t*s*.08);
  c.save(); c.translate(-s*.17,-s*.05); c.rotate(-.25+Math.sin(anim*3)*.08);
  ell(c,0,0,s*.13,s*.26,'#c9773f','#7d4520',s*.025); ell(c,-s*.03,-s*.12,s*.07,s*.1,'#e09a5e'); c.restore();
  ell(c,s*.03,s*.1,s*.15,s*.17,'#b8682f','#7d4520',s*.025);
  ell(c,s*.06,s*.13,s*.08,s*.1,'#f0d3a8');
  c.fillStyle='#b8682f'; c.beginPath(); c.moveTo(s*.06,-s*.16); c.lineTo(s*.1,-s*.27); c.lineTo(s*.14,-s*.15); c.fill();
  ell(c,s*.1,-s*.08,s*.12,s*.1,'#b8682f','#7d4520',s*.025);
  ell(c,s*.14,-s*.1,s*.022,s*.025,'#2b2018'); ell(c,s*.21,-s*.06,s*.018,s*.015,'#2b2018');
  ell(c,s*.15,s*.05,s*.045,s*.05,'#9a6b3c','#5e3d20',s*.012); ell(c,s*.15,s*.015,s*.05,s*.022,'#6b4423');
}

function scarecrow(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.24,s*.07,'rgba(40,60,20,.25)');
  const sw=Math.sin(anim*1.3)*.05+t*.25; c.save(); c.rotate(sw*.4);
  c.strokeStyle='#7a5234'; c.lineWidth=s*.05; c.lineCap='round';
  c.beginPath(); c.moveTo(0,s*.3); c.lineTo(0,-s*.18); c.moveTo(-s*.26,-s*.02); c.lineTo(s*.26,-s*.02); c.stroke();
  // shirt with patches, straw hands
  c.beginPath(); c.moveTo(-s*.24,-s*.06); c.lineTo(s*.24,-s*.06); c.lineTo(s*.13,s*.16); c.lineTo(-s*.13,s*.16); c.closePath();
  c.fillStyle='#c2456b'; c.fill(); c.strokeStyle='#7d2440'; c.lineWidth=s*.02; c.stroke();
  c.fillStyle='#e8c35f'; c.fillRect(-s*.05,s*.02,s*.08,s*.07); c.strokeStyle='#7d2440'; c.strokeRect(-s*.05,s*.02,s*.08,s*.07);
  c.strokeStyle='#e0b84a'; c.lineWidth=s*.02; for (const o of [-1,1]) for (const k of [-.03,0,.03]){ c.beginPath(); c.moveTo(o*s*.25,-s*.02); c.lineTo(o*s*.32,-s*.02+k*s*1.4); c.stroke(); }
  // head and hat
  ell(c,0,-s*.2,s*.1,s*.1,'#f0dca8','#a88a52',s*.02);
  ell(c,-s*.035,-s*.21,s*.015,s*.015,'#2b2018'); ell(c,s*.035,-s*.21,s*.015,s*.015,'#2b2018');
  c.strokeStyle='#2b2018'; c.lineWidth=s*.012; c.beginPath(); c.arc(0,-s*.18,s*.035,.3,2.8); c.stroke();
  ell(c,0,-s*.28,s*.17,s*.035,'#9a6b3c','#5e3d20',s*.015);
  c.beginPath(); c.moveTo(-s*.09,-s*.29); c.lineTo(-s*.07,-s*.4); c.lineTo(s*.07,-s*.4); c.lineTo(s*.09,-s*.29); c.closePath(); c.fillStyle='#9a6b3c'; c.fill(); c.strokeStyle='#5e3d20'; c.stroke();
  if (lv>=1){ c.fillStyle='#e8c35f'; c.fillRect(-s*.09,-s*.33,s*.18,s*.03); }
  c.restore();
}

function barrel(c,s,t,lv){
  ell(c,0,s*.3,s*.24,s*.07,'rgba(40,60,20,.25)');
  c.beginPath(); c.moveTo(-s*.2,-s*.2); c.quadraticCurveTo(-s*.26,s*.05,-s*.2,s*.28); c.lineTo(s*.2,s*.28); c.quadraticCurveTo(s*.26,s*.05,s*.2,-s*.2); c.closePath();
  c.fillStyle='#9a6b3c'; c.fill(); c.strokeStyle='#5e3d20'; c.lineWidth=s*.02; c.stroke();
  c.strokeStyle='#6f7a82'; c.lineWidth=s*.035; for (const y of [-.1,.17]){ c.beginPath(); c.moveTo(-s*.23,y*s); c.lineTo(s*.23,y*s); c.stroke(); }
  ell(c,0,-s*.2,s*.2,s*.06,'#5aa0c8','#3a6a8a',s*.015);
  const ripple=(Date.now()/600)%1; ell(c,0,-s*.2,s*.12*ripple,s*.035*ripple,null,'rgba(255,255,255,.7)',1);
  if (lv>=1){ c.strokeStyle='#6f7a82'; c.lineWidth=s*.03; c.beginPath(); c.moveTo(s*.2,0); c.lineTo(s*.3,0); c.lineTo(s*.3,s*.08); c.stroke(); }
  if (lv>=2) ell(c,s*.3,s*.12,s*.03,s*.04,'#5aa0c8');
}
function hive(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.24,s*.07,'rgba(40,60,20,.25)');
  c.strokeStyle='#6b4423'; c.lineWidth=s*.04; c.beginPath(); c.moveTo(0,s*.3); c.lineTo(0,s*.1); c.stroke();
  for (let k=0;k<4;k++){ const w=s*(.24-k*.04), y=s*(.06-k*.1); ell(c,0,y,w,s*.07,'#e8b84a','#a8782a',s*.015); }
  ell(c,0,s*.02,s*.04,s*.03,'#3a2614');
  for (let k=0;k<2+lv;k++){ const a=anim*3+k*2.1; const bx=Math.cos(a)*s*.32, by=Math.sin(a*1.3)*s*.2-s*.1;
    ell(c,bx,by,s*.035,s*.025,'#f2c94a','#3a2614',1); c.fillStyle='rgba(255,255,255,.8)'; ell(c,bx,by-s*.025,s*.025,s*.015,'rgba(255,255,255,.85)'); }
}
function ladybug(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.24,s*.07,'rgba(40,60,20,.25)');
  // a little wooden nest box with ladybugs on it
  c.beginPath(); c.roundRect(-s*.18,-s*.12,s*.36,s*.4,s*.04); c.fillStyle='#b5824e'; c.fill(); c.strokeStyle='#6b4a2b'; c.lineWidth=s*.02; c.stroke();
  c.beginPath(); c.moveTo(-s*.24,-s*.1); c.lineTo(0,-s*.3); c.lineTo(s*.24,-s*.1); c.closePath(); c.fillStyle='#c2456b'; c.fill(); c.stroke();
  for (const [x,y] of [[-.07,0],[.07,.06],[0,.15]]) ell(c,x*s,y*s,s*.025,s*.018,'#3a2614');
  const n=1+lv; for (let k=0;k<n;k++){ const a=anim*2+k*2.4; const bx=Math.cos(a)*s*.28, by=-s*.1+Math.sin(a)*s*.14;
    ell(c,bx,by,s*.05,s*.045,'#e23a3a','#3a1a1a',1); c.fillStyle='#222'; ell(c,bx+s*.03,by,s*.02,s*.025,'#222'); ell(c,bx-s*.01,by-s*.015,s*.012,s*.012,'#222'); }
}

export const DRAW = { bunny, rose, squirrel, sprinkler, pine, owl, sunflower, scarecrow, barrel, hive, ladybug };
export function drawPips(c,s,lv){ for (let i=0;i<=lv;i++) ell(c,(i-lv/2)*s*.12,s*.4,s*.04,s*.04,'#f7b267','#9c5a1a',s*.015); }

export function drawShot(g,sh,s){
  if (sh.k==='carrot'){ g.rotate(sh.spin); g.beginPath(); g.moveTo(-s*.05,-s*.08); g.lineTo(s*.05,-s*.08); g.lineTo(0,s*.12); g.closePath();
    g.fillStyle='#ef8a2b'; g.fill(); ell(g,0,-s*.1,s*.045,s*.03,'#5fa040'); }
  else if (sh.k==='thorn'){ g.rotate(sh.a); g.beginPath(); g.moveTo(s*.1,0); g.lineTo(-s*.06,-s*.035); g.lineTo(-s*.06,s*.035); g.closePath(); g.fillStyle='#8f1f37'; g.fill(); }
  else if (sh.k==='acorn'){ g.rotate(sh.spin); ell(g,0,s*.02,s*.05,s*.06,'#9a6b3c','#5e3d20',1); ell(g,0,-s*.03,s*.055,s*.025,'#6b4423'); }
  else if (sh.k==='cone'){ const p=Math.min(1,sh.gone/sh.d0), h=Math.sin(p*Math.PI)*s*.9;
    ell(g,0,s*.3,s*.07,s*.025,'rgba(30,30,10,.25)'); g.translate(0,-h); g.rotate(sh.spin*.5);
    ell(g,0,0,s*.07,s*.1,'#9a6b3c','#5e3d20',1.2); g.strokeStyle='#5e3d20'; g.lineWidth=1;
    for (const y of [-.04,0,.04]){ g.beginPath(); g.moveTo(-s*.06,y*s); g.lineTo(s*.06,y*s); g.stroke(); } }
  else if (sh.k==='lady'){ ell(g,0,0,s*.05,s*.045,'#e23a3a','#3a1a1a',1); ell(g,s*.03,0,s*.02,s*.025,'#222'); }
  else { g.rotate(sh.a); ell(g,0,0,s*.14,s*.045,'#efe4d0','#8a6a48',1.2); g.beginPath(); g.moveTo(-s*.14,0); g.lineTo(s*.12,0); g.strokeStyle='#8a6a48'; g.stroke(); }
}
