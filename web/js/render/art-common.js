// Crop art for this game. Shared drawing helpers (ell, rng, crown) live in the kit.
import { ell } from '../../kit/js/draw.js';
export { ell, rng, crown } from '../../kit/js/draw.js';

export function drawCrop(c,type,x,y,s){
  if (type==='cabbage'){
    ell(c,x,y+s*.12,s*.26,s*.07,'rgba(30,20,10,.3)'); ell(c,x,y,s*.25,s*.2,'#8fc25a','#4f8a3c',1.5);
    ell(c,x-s*.07,y-s*.02,s*.12,s*.13,'#a9d672'); ell(c,x+s*.07,y-s*.03,s*.11,s*.12,'#b7df82'); ell(c,x,y-s*.05,s*.09,s*.09,'#cdeaa0');
  } else if (type==='tomato'){
    ell(c,x,y+s*.13,s*.24,s*.06,'rgba(30,20,10,.3)');
    for (const [dx,dy,rr] of [[-.1,.02,.12],[.1,.03,.11]]){
      ell(c,x+dx*s,y+dy*s,s*rr,s*rr*.9,'#e2483a','#a3261c',1.2); ell(c,x+dx*s-s*.04,y+dy*s-s*.04,s*.03,s*.02,'rgba(255,255,255,.55)');
      c.fillStyle='#4f8a3c'; c.beginPath(); for (let k=0;k<5;k++){ const a=k*1.2566-1.57; c.lineTo(x+dx*s+Math.cos(a)*s*.06,y+dy*s-s*rr*.7+Math.sin(a)*s*.03); c.lineTo(x+dx*s+Math.cos(a+.63)*s*.02,y+dy*s-s*rr*.7+Math.sin(a+.63)*s*.012); } c.closePath(); c.fill(); }
    c.strokeStyle='#4f8a3c'; c.lineWidth=Math.max(1.2,s*.03); c.beginPath(); c.moveTo(x-s*.1,y-s*.1); c.quadraticCurveTo(x,y-s*.24,x+s*.1,y-s*.1); c.stroke();
  } else if (type==='apple'){
    ell(c,x,y+s*.13,s*.2,s*.06,'rgba(30,20,10,.3)');
    ell(c,x,y,s*.15,s*.14,'#d8433a','#8e2018',1.3); ell(c,x-s*.05,y-s*.04,s*.04,s*.03,'rgba(255,255,255,.5)');
    c.strokeStyle='#6b4423'; c.lineWidth=Math.max(1.2,s*.025); c.beginPath(); c.moveTo(x,y-s*.12); c.lineTo(x+s*.02,y-s*.2); c.stroke();
    ell(c,x+s*.07,y-s*.17,s*.06,s*.03,'#5fa040','#3f7a2a',1);
  } else if (type==='corn'){
    ell(c,x,y+s*.14,s*.18,s*.05,'rgba(30,20,10,.3)');
    c.save(); c.translate(x,y); c.rotate(-.35);
    ell(c,0,0,s*.08,s*.17,'#f2cf4a','#b38f16',1.2);
    c.fillStyle='#e0b52c'; for (let k=-3;k<=3;k++) for (const o of [-.03,.03]) ell(c,o*s,k*s*.04,s*.014,s*.012,'#d9a91e');
    for (const o of [-1,1]){ c.beginPath(); c.moveTo(0,s*.17); c.quadraticCurveTo(o*s*.14,s*.02,o*s*.03,-s*.14); c.quadraticCurveTo(o*s*.06,s*.04,0,s*.17); c.fillStyle='#7fb44c'; c.fill(); c.strokeStyle='#4f7a2a'; c.lineWidth=1; c.stroke(); }
    c.restore();
  } else if (type==='carrot'){
    c.strokeStyle='#4f8a3c'; c.lineWidth=Math.max(1.5,s*.04); c.lineCap='round';
    for (const o of [-.12,-.04,.04,.12]){ c.beginPath(); c.moveTo(x,y-s*.02); c.quadraticCurveTo(x+o*s*1.2,y-s*.2,x+o*s*2,y-s*.32); c.stroke(); }
    ell(c,x,y+s*.06,s*.13,s*.09,'#ef8a2b','#b85d14',1.2);
    c.strokeStyle='#c96a1c'; c.lineWidth=1; c.beginPath(); c.moveTo(x-s*.07,y+s*.08); c.lineTo(x-s*.01,y+s*.08); c.stroke();
  } else {
    ell(c,x,y+s*.15,s*.26,s*.07,'rgba(30,20,10,.3)');
    for (const [dx,dy] of [[-.15,-.04],[.15,-.04],[0,-.12]]) ell(c,x+dx*s,y+dy*s,s*.13,s*.09,'#5c9a4a','#3f7a3a',1);
    for (const dx of [-.09,.1]){ const bx=x+dx*s, by=y+s*.06;
      c.beginPath(); c.moveTo(bx-s*.09,by-s*.04); c.quadraticCurveTo(bx,by-s*.1,bx+s*.09,by-s*.04); c.quadraticCurveTo(bx+s*.06,by+s*.12,bx,by+s*.14); c.quadraticCurveTo(bx-s*.06,by+s*.12,bx-s*.09,by-s*.04);
      c.fillStyle='#e0364b'; c.fill(); c.strokeStyle='#a01f30'; c.lineWidth=1; c.stroke();
      for (const [sx,sy] of [[-.03,.0],[.03,.02],[0,.07],[-.02,.1]]) ell(c,bx+sx*s,by+sy*s,s*.01,s*.014,'#ffe08a');
      ell(c,bx,by-s*.06,s*.06,s*.025,'#4f8a3c'); }
  }
}
