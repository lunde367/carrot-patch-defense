// Crop art for this game. Shared drawing helpers (ell, rng, crown) live in the kit.
import { ell } from '../../kit/js/draw.js';
export { ell, rng, crown } from '../../kit/js/draw.js';

export function drawCrop(c,type,x,y,s){
  if (type==='cabbage'){
    ell(c,x,y+s*.12,s*.26,s*.07,'rgba(30,20,10,.3)'); ell(c,x,y,s*.25,s*.2,'#8fc25a','#4f8a3c',1.5);
    ell(c,x-s*.07,y-s*.02,s*.12,s*.13,'#a9d672'); ell(c,x+s*.07,y-s*.03,s*.11,s*.12,'#b7df82'); ell(c,x,y-s*.05,s*.09,s*.09,'#cdeaa0');
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
