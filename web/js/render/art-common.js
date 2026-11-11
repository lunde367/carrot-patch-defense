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
  } else if (type==='wheat'){
    ell(c,x,y+s*.14,s*.16,s*.05,'rgba(30,20,10,.3)');
    c.strokeStyle='#b0903a'; c.lineWidth=Math.max(1,s*.02);
    for (const o of [-.07,0,.07]){ c.beginPath(); c.moveTo(x+o*s*.4,y+s*.14); c.lineTo(x+o*s,y-s*.1); c.stroke();
      for (let k=0;k<4;k++) ell(c,x+o*s+(k%2?.02:-.02)*s,y-s*.12-k*s*.04,s*.022,s*.035,'#e0b84a','#a88a2a',.8); }
  } else if (type==='pepper'){
    ell(c,x,y+s*.13,s*.16,s*.05,'rgba(30,20,10,.3)');
    c.save(); c.translate(x,y); c.rotate(.5);
    c.beginPath(); c.moveTo(-s*.06,-s*.08); c.quadraticCurveTo(s*.1,-s*.1,s*.06,s*.06); c.quadraticCurveTo(s*.02,s*.18,-s*.04,s*.16); c.quadraticCurveTo(-s*.1,s*.02,-s*.06,-s*.08);
    c.fillStyle='#d8433a'; c.fill(); c.strokeStyle='#8e2018'; c.lineWidth=1.2; c.stroke();
    ell(c,0,-s*.1,s*.05,s*.025,'#5fa040','#3f7a2a',1); c.restore();
  } else if (type==='seed'){
    ell(c,x,y+s*.15,s*.16,s*.04,'rgba(30,20,10,.3)');
    c.beginPath(); c.roundRect(x-s*.11,y-s*.14,s*.22,s*.28,s*.03); c.fillStyle='#f2e6c8'; c.fill(); c.strokeStyle='#a8936a'; c.lineWidth=1.2; c.stroke();
    ell(c,x,y-s*.01,s*.06,s*.06,'#8fc25a','#4f8a3c',1); c.fillStyle='#c2456b'; c.fillRect(x-s*.11,y+s*.08,s*.22,s*.04);
  } else if (type==='radish'){
    ell(c,x,y+s*.13,s*.14,s*.05,'rgba(30,20,10,.3)');
    for (const o of [-1,1]) ell(c,x+o*s*.05,y-s*.12,s*.04,s*.08,'#6fae54','#3f7a2a',1);
    ell(c,x,y+s*.01,s*.11,s*.11,'#e2486a','#9e2440',1.2); ell(c,x-s*.03,y-s*.03,s*.03,s*.025,'rgba(255,255,255,.55)');
    c.strokeStyle='#e8d8c8'; c.lineWidth=1; c.beginPath(); c.moveTo(x,y+s*.11); c.lineTo(x+s*.02,y+s*.17); c.stroke();
  } else if (type==='bloom'){
    c.strokeStyle='#4f8a3c'; c.lineWidth=Math.max(1,s*.02); c.beginPath(); c.moveTo(x,y+s*.14); c.lineTo(x,y); c.stroke();
    for (let k=0;k<5;k++){ const a=k*1.2566; ell(c,x+Math.cos(a)*s*.065,y-s*.05+Math.sin(a)*s*.065,s*.05,s*.05,'#b48ae0','#7a52a8',1); }
    ell(c,x,y-s*.05,s*.035,s*.035,'#f6c344');
  } else if (type==='pumpkin'){
    ell(c,x,y+s*.13,s*.2,s*.05,'rgba(30,20,10,.3)');
    for (const o of [-.08,.08]) ell(c,x+o*s,y+s*.01,s*.09,s*.11,'#ef8a2b','#a8541a',1.2);
    ell(c,x,y+s*.01,s*.09,s*.12,'#f59a3a','#a8541a',1.2);
    c.strokeStyle='#5e3d20'; c.lineWidth=Math.max(1.4,s*.03); c.beginPath(); c.moveTo(x,y-s*.1); c.lineTo(x+s*.03,y-s*.16); c.stroke();
    ell(c,x+s*.07,y-s*.13,s*.05,s*.025,'#5fa040');
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
