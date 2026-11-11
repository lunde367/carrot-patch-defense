// Pests, drawn at the origin facing right. Fliers draw above their shadow.
import { ENEMY } from '../data/enemies.js';
import { ell, crown } from './art-common.js';

function mound(c,r,e){
  ell(c,0,r*.4,r*1.1,r*.45,'#7a5234','#5a3a20',1.5);
  for (let k=0;k<4;k++) ell(c,Math.sin(e.ph+k*1.7)*r*.7,r*.25-Math.abs(Math.cos(e.ph*1.3+k))*r*.3,r*.13,r*.11,'#8f6643');
}

export function drawEnemy(c,e,s){
  const D=ENEMY[e.type], r=e.size*s, w=Math.sin(e.ph)*.5;
  if (e.cocoon>0){ const sh=Math.sin(e.ph*5)*r*.08, R=Math.max(r,s*.2);
    ell(c,0,R*.8,R*.9,R*.25,'rgba(40,40,20,.22)');
    ell(c,sh,0,R*.75,R*.95,'#f6f1e3','#c9bea4',1.5);
    c.strokeStyle='#d8cfb8'; c.lineWidth=1; for (const y of [-.45,-.1,.25,.55]){ c.beginPath(); c.moveTo(sh-R*.6,y*R); c.quadraticCurveTo(sh,y*R+R*.18,sh+R*.6,y*R); c.stroke(); }
    return; }
  if (e.under){ mound(c,r,e); return; }
  if (e.fly){ ell(c,0,r*.9,r*.8,r*.22,'rgba(40,40,20,.18)'); c.translate(0,-s*.28+Math.sin(e.ph*.8)*s*.05); }
  else { ell(c,0,r*.85,r*1.1,r*.3,'rgba(40,40,20,.22)'); if (D.hopper&&e.jump) c.translate(0,-Math.abs(Math.sin(e.ph*1.8))*r*1.2); }
  if (D.glow){ const pulse=.55+.25*Math.sin(e.ph*.7); c.save(); c.globalAlpha=pulse*.45; ell(c,0,0,r*1.7,r*1.25,D.glow); c.globalAlpha=pulse*.6; ell(c,0,0,r*1.25,r*.95,D.glow); c.restore(); }
  switch (D.shape){
  case 'swirl': {
    // a spinning column of dust with grit flying around it
    const sp=e.ph*2.5;
    for (let k=0;k<5;k++){ const y=(k-2)*r*.32, rw=r*(0.45+k*.18);
      c.save(); c.translate(Math.sin(sp+k)*r*.12,y); c.rotate(Math.sin(sp*.5+k)*.08);
      ell(c,0,0,rw,r*.16,k%2?D.col:'#d9c294',D.dk,1.2); c.restore(); }
    for (let k=0;k<6;k++){ const a=sp+k*1.05; ell(c,Math.cos(a)*r*1.1,Math.sin(a)*r*.5,r*.06,r*.06,D.dk); }
    if (D.boss) crown(c,0,-r*1.05,r*.32);
    break; }
  case 'bird': {
    // a pigeon from above: flapping wings, round body, little head and beak
    const fl=Math.sin(e.ph*3)*.5+.5;
    for (const sy of [-1,1]){ c.beginPath(); c.moveTo(-r*.2,0); c.quadraticCurveTo(-r*.3,sy*r*(1+fl*.5),-r*.9,sy*r*(.7+fl*.6)); c.quadraticCurveTo(-r*.6,sy*r*.3,-r*.2,0);
      c.fillStyle=D.col; c.fill(); c.strokeStyle=D.dk; c.lineWidth=1.2; c.stroke(); }
    c.beginPath(); c.moveTo(-r*.7,0); c.lineTo(-r*1.25,-r*.25); c.lineTo(-r*1.25,r*.25); c.closePath(); c.fillStyle=D.dk; c.fill();
    ell(c,0,0,r*.75,r*.45,D.col,D.dk,1.4); ell(c,r*.55,0,r*.32,r*.3,D.neck||D.col,D.dk,1.2);
    ell(c,r*.65,-r*.13,r*.06,r*.06,'#f2a03a'); ell(c,r*.65,r*.13,r*.06,r*.06,'#f2a03a');
    c.beginPath(); c.moveTo(r*.85,-r*.06); c.lineTo(r*1.05,0); c.lineTo(r*.85,r*.06); c.closePath(); c.fillStyle='#e8b04a'; c.fill();
    if (D.boss) crown(c,r*.4,-r*.45,r*.28);
    break; }
  case 'frog': {
    // a frog from above: bent back legs, wide body, big eyes
    c.strokeStyle=D.dk; c.lineWidth=Math.max(1.5,r*.18); c.lineCap='round';
    for (const sy of [-1,1]){ c.beginPath(); c.moveTo(-r*.3,sy*r*.4); c.lineTo(-r*.95,sy*r*.9); c.lineTo(-r*.5,sy*r*1.05); c.stroke();
      c.beginPath(); c.moveTo(r*.35,sy*r*.4); c.lineTo(r*.75,sy*r*.85); c.stroke(); }
    ell(c,0,0,r*.85,r*.7,D.col,D.dk,Math.max(1.2,r*.08));
    ell(c,-r*.2,0,r*.4,r*.35,'rgba(255,255,255,.18)');
    for (const sy of [-1,1]){ ell(c,r*.5,sy*r*.38,r*.2,r*.2,D.col,D.dk,1.2); ell(c,r*.55,sy*r*.38,r*.1,r*.1,'#2b2018'); }
    if (D.boss) crown(c,-r*.1,-r*.55,r*.32);
    break; }
  case 'slug': {
    const st=1+Math.sin(e.ph*.5)*.07;
    ell(c,0,r*.1,r*1.5*st,r*.6,D.col,D.dk,Math.max(1.2,r*.08));
    ell(c,-r*.2,-r*.15,r*.9,r*.22,'rgba(255,255,255,.18)');
    if (D.spots) for (const [x,y] of [[-.7,0],[-.2,-.2],[.3,.1],[-.4,.3]]) ell(c,x*r,y*r,r*.13,r*.1,D.dk);
    c.strokeStyle=D.dk; c.lineWidth=Math.max(1.2,r*.1); c.beginPath(); c.moveTo(r*1.2,-r*.1); c.lineTo(r*1.55,-r*.85); c.moveTo(r*1,-r*.15); c.lineTo(r*1.1,-r*.9); c.stroke();
    ell(c,r*1.55,-r*.88,r*.1,r*.1,'#2b2018'); ell(c,r*1.1,-r*.93,r*.1,r*.1,'#2b2018');
    ell(c,r*.95,0,r*.12,r*.12,'#fff'); ell(c,r*1,0,r*.06,r*.06,'#222');
    if (D.boss) crown(c,-r*.1,-r*.45,r*.4); break; }
  case 'snail': {
    const st=1+Math.sin(e.ph*.7)*.06;
    ell(c,r*.1,r*.45,r*1.3*st,r*.35,'#e3d2a6','#a8936a',1.2);
    c.strokeStyle='#a8936a'; c.lineWidth=1.5; c.beginPath(); c.moveTo(r*1.05,r*.3); c.lineTo(r*1.3,-r*.4); c.moveTo(r*.9,r*.3); c.lineTo(r*.95,-r*.45); c.stroke();
    ell(c,r*1.3,-r*.42,r*.1,r*.1,'#3a2e26');
    ell(c,-r*.1,-r*.1,r*.75,r*.72,D.shell,D.sdk,Math.max(1.8,r*.1));
    c.beginPath(); for (let a=0;a<9;a+=.3){ const rr=r*.6*(1-a/10); c.lineTo(-r*.1+Math.cos(a)*rr,-r*.1+Math.sin(a)*rr); } c.strokeStyle=D.sdk; c.lineWidth=1.5; c.stroke();
    ell(c,-r*.35,-r*.45,r*.18,r*.1,'rgba(255,255,255,.35)');
    if (D.boss) crown(c,-r*.1,-r*.8,r*.35); break; }
  case 'beetle':
    c.strokeStyle=D.dk; c.lineWidth=1.5; for (const o of [-.45,0,.45]){ c.beginPath(); c.moveTo(o*r,0); c.lineTo(o*r+w*r*.3,r*.85); c.stroke(); }
    ell(c,r*.85,0,r*.38,r*.36,D.dk); ell(c,0,0,r,r*.78,D.col,D.dk,Math.max(1.5,r*.08));
    c.beginPath(); c.moveTo(-r,0); c.lineTo(r*.7,0); c.strokeStyle=D.dk; c.stroke();
    ell(c,-r*.3,-r*.4,r*.25,r*.12,'rgba(255,255,255,.35)');
    if (D.copper){ c.save(); c.beginPath(); c.ellipse(0,0,r*.98,r*.76,0,0,6.283); c.clip(); c.fillStyle='rgba(205,125,60,.75)'; c.fillRect(-r,-r,r*1.05,r*2); c.restore();
      c.beginPath(); c.moveTo(-r,0); c.lineTo(r*.7,0); c.strokeStyle=D.dk; c.lineWidth=1.5; c.stroke(); }
    if (D.stripes){ c.strokeStyle=D.dk; c.lineWidth=Math.max(1.2,r*.12); for (const y of [-.35,.35]){ c.beginPath(); c.moveTo(-r*.85,y*r); c.lineTo(r*.6,y*r*.9); c.stroke(); } }
    if (D.spots) for (const [x,y] of [[-.55,-.35],[-.15,.4],[.25,-.4],[-.5,.3],[.3,.35]]) ell(c,x*r,y*r,r*.09,r*.08,'#f2f2ea');
    if (D.horns){ c.strokeStyle=D.dk; c.lineWidth=1.3; for (const sy of [-1,1]){ c.beginPath(); c.moveTo(r*1.05,sy*r*.15); c.quadraticCurveTo(r*1.2,sy*r*1.2,-r*.2,sy*r*1.35); c.stroke(); } }
    if (D.armor>=3){ c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.2; c.beginPath(); c.arc(0,0,r*.6,-2.6,-.5); c.stroke(); }
    if (D.boss){ c.strokeStyle=D.dk; c.lineWidth=3; c.beginPath(); c.moveTo(r*1.1,-r*.1); c.quadraticCurveTo(r*1.6,-r*.4,r*1.5,-r*.8); c.stroke(); crown(c,0,-r*.6,r*.35); }
    break;
  case 'aphid': {
    // a soft pear-shaped body with little legs and two back tubes
    c.strokeStyle=D.dk; c.lineWidth=1; for (const o of [-.3,.1,.45]) for (const sy of [-1,1]){ c.beginPath(); c.moveTo(o*r,sy*r*.4); c.lineTo(o*r+w*r*.4*sy,sy*r*.95); c.stroke(); }
    c.beginPath(); c.moveTo(-r*.6,-r*.25); c.lineTo(-r*1.05,-r*.45); c.moveTo(-r*.6,r*.25); c.lineTo(-r*1.05,r*.45); c.stroke();
    ell(c,-r*.15,0,r*.95,r*.72,D.col,D.dk,Math.max(1.2,r*.08)); ell(c,r*.75,0,r*.36,r*.34,D.col,D.dk,1.2);
    ell(c,-r*.35,-r*.3,r*.35,r*.15,'rgba(255,255,255,.35)'); ell(c,r*.9,-r*.12,r*.08,r*.08,'#3a2a1a');
    c.beginPath(); c.moveTo(r*1.05,-r*.1); c.quadraticCurveTo(r*1.4,-r*.5,r*1.2,-r*.85); c.stroke();
    if (D.boss){ for (const [x,y] of [[-.7,.55],[-.4,.7]]) ell(c,x*r,y*r,r*.18,r*.14,D.col,D.dk,1); crown(c,-r*.1,-r*.6,r*.35); }
    break; }
  case 'hopper': {
    // grasshopper / locust from above: long body, big folded back legs, wings when grown
    c.strokeStyle=D.dk; c.lineWidth=Math.max(1.2,r*.12);
    for (const sy of [-1,1]){ c.beginPath(); c.moveTo(-r*.1,sy*r*.3); c.lineTo(-r*.9,sy*r*.85); c.lineTo(-r*1.25,sy*r*.4); c.stroke();
      c.lineWidth=1.2; c.beginPath(); c.moveTo(r*.3,sy*r*.25); c.lineTo(r*.5+w*r*.3,sy*r*.7); c.stroke(); c.lineWidth=Math.max(1.2,r*.12); }
    if (D.wings){ const fl=e.fly?Math.abs(Math.sin(e.ph*4)):0;
      for (const sy of [-1,1]) ell(c,-r*.45,sy*r*(.2+.45*fl),r*.85,r*(.22+.3*fl),'rgba(236,226,190,.8)',D.dk,1); }
    ell(c,-r*.2,0,r*1.05,r*.36,D.col,D.dk,Math.max(1.2,r*.08));
    ell(c,r*.85,0,r*.32,r*.3,D.col,D.dk,1.2); ell(c,r*.95,-r*.17,r*.08,r*.09,'#2b2018'); ell(c,r*.95,r*.17,r*.08,r*.09,'#2b2018');
    c.lineWidth=1; c.beginPath(); c.moveTo(r*1.1,-r*.1); c.quadraticCurveTo(r*1.6,-r*.4,r*1.7,-r*.7); c.moveTo(r*1.1,r*.1); c.quadraticCurveTo(r*1.6,r*.4,r*1.7,r*.7); c.stroke();
    if (D.boss) crown(c,-r*.1,-r*.45,r*.32);
    break; }
  case 'grub':
    ell(c,-r*.6,Math.sin(e.ph)*r*.1,r*.6,r*.55,D.col2||'#e9dfb6',D.dk||'#a89a66',1); ell(c,r*.2,0,r*.75,r*.68,D.col||'#f1e8c2',D.dk||'#a89a66',1);
    ell(c,r*.65,-r*.1,r*.3,r*.3,'#b07a3c'); ell(c,r*.75,-r*.15,r*.08,r*.08,'#222'); if (D.boss) crown(c,0,-r*.55,r*.32); break;
  case 'inch': {
    const hump=(.5+Math.abs(Math.sin(e.ph*.8))*.9)*r;
    c.strokeStyle='#8fcb52'; c.lineWidth=r*.55; c.lineCap='round';
    c.beginPath(); c.moveTo(-r*1.1,r*.5); c.quadraticCurveTo(0,r*.5-hump*1.6,r*1,r*.5); c.stroke();
    c.strokeStyle='#5f9a2e'; c.lineWidth=1; c.stroke();
    ell(c,r*1.1,r*.35,r*.32,r*.3,'#9fd862','#5f9a2e',1); ell(c,r*1.22,r*.28,r*.08,r*.08,'#222'); break; }
  case 'cat': {
    for (let k=3;k>=0;k--){ const x=-k*r*.55, y=Math.sin(e.ph+k*.9)*r*.15;
      ell(c,x,y,r*.38,r*.4,k%2?D.a:D.b,D.dk,1.2);
      if (D.hairy){ c.strokeStyle=D.dk; c.lineWidth=1; for (let h=-2;h<=2;h++){ c.beginPath(); c.moveTo(x+h*r*.1,y-r*.35); c.lineTo(x+h*r*.16,y-r*.62); c.stroke(); } }
      else ell(c,x,y-r*.2,r*.12,r*.07,'#f2d64b'); }
    if (D.horn){ c.strokeStyle='#d9772b'; c.lineWidth=3; c.beginPath(); c.moveTo(-r*1.65,-r*.2); c.quadraticCurveTo(-r*1.9,-r*.7,-r*1.6,-r*.9); c.stroke();
      c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=2; for (let k=0;k<4;k++){ c.beginPath(); c.moveTo(-k*r*.55-r*.15,r*.25); c.lineTo(-k*r*.55+r*.15,-r*.05); c.stroke(); } }
    ell(c,r*.5,-r*.05,r*.42,r*.42,D.hairy?D.b:D.a,D.dk,1.4);
    c.strokeStyle=D.dk; c.lineWidth=1.3; c.beginPath(); c.moveTo(r*.55,-r*.4); c.lineTo(r*.75,-r*.75); c.moveTo(r*.4,-r*.42); c.lineTo(r*.45,-r*.8); c.stroke();
    ell(c,r*.7,-r*.1,r*.1,r*.11,'#fff'); ell(c,r*.73,-r*.1,r*.05,r*.06,'#222');
    if (D.boss) crown(c,r*.5,-r*.5,r*.3); break; }
  case 'moth': {
    const fl=Math.abs(Math.sin(e.ph*3.5));
    for (const sy of [-1,1]){ ell(c,-r*.15,sy*r*(.35+.35*fl),r*.75,r*(.25+.35*fl),D.wing,D.dk,1.2);
      ell(c,-r*.2,sy*r*(.35+.35*fl),r*.14,r*.12,D.body); }
    ell(c,0,0,r*.65,r*.24,D.body,D.dk,1.2); ell(c,r*.6,0,r*.2,r*.2,D.body);
    c.strokeStyle=D.dk; c.lineWidth=1; c.beginPath(); c.moveTo(r*.7,-r*.1); c.quadraticCurveTo(r*1,-r*.5,r*1.2,-r*.45); c.moveTo(r*.7,r*.1); c.quadraticCurveTo(r*1,r*.5,r*1.2,r*.45); c.stroke();
    if (D.boss) crown(c,r*.55,-r*.2,r*.25); break; }
  case 'shield': {
    // stink bug, seen from above: a shield-shaped body with a darker triangle on its back
    c.strokeStyle=D.dk; c.lineWidth=1.4;
    for (const o of [-.45,0,.45]) for (const sy of [-1,1]){ c.beginPath(); c.moveTo(o*r,sy*r*.5); c.lineTo(o*r+w*r*.3*sy,sy*r*1.0); c.stroke(); }
    c.beginPath(); c.moveTo(r*1.05,-r*.15); c.quadraticCurveTo(r*1.5,-r*.5,r*1.6,-r*.75); c.moveTo(r*1.05,r*.15); c.quadraticCurveTo(r*1.5,r*.5,r*1.6,r*.75); c.stroke();
    c.beginPath(); c.moveTo(r*.95,0); c.lineTo(r*.45,-r*.8); c.lineTo(-r*.85,-r*.62); c.lineTo(-r*1.05,0); c.lineTo(-r*.85,r*.62); c.lineTo(r*.45,r*.8); c.closePath();
    c.fillStyle=D.col; c.fill(); c.strokeStyle=D.dk; c.lineWidth=Math.max(1.4,r*.08); c.stroke();
    c.beginPath(); c.moveTo(r*.4,0); c.lineTo(-r*.55,-r*.38); c.lineTo(-r*.55,r*.38); c.closePath(); c.fillStyle=D.dk; c.globalAlpha=.35; c.fill(); c.globalAlpha=1;
    if (D.spots) for (const [x,y] of [[-.2,-.45],[-.2,.45],[.2,-.5],[.2,.5]]) ell(c,x*r,y*r,r*.09,r*.08,'#efe3c4');
    ell(c,-r*.35,-r*.25,r*.25,r*.1,'rgba(255,255,255,.25)');
    ell(c,r*1.02,0,r*.24,r*.22,D.dk); ell(c,r*1.1,-r*.12,r*.05,r*.05,'#f6e7c0'); ell(c,r*1.1,r*.12,r*.05,r*.05,'#f6e7c0');
    if (D.boss) crown(c,-r*.15,-r*.55,r*.32);
    break; }
  case 'mouse':
    c.strokeStyle='#b39a8e'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-r*.9,r*.2);
    if (D.short) c.lineTo(-r*1.3,r*.3); else c.quadraticCurveTo(-r*1.6,-r*.2+w*r*.6,-r*2,r*.3); c.stroke();
    ell(c,0,r*.15,r,r*.62,D.fur,'#6d655e',1.5);
    ell(c,r*.45,-r*.45,r*.32,r*.32,D.fur,'#6d655e',1.2); ell(c,r*.45,-r*.45,r*.17,r*.17,'#f2b6c0');
    ell(c,r*.95,r*.05,r*.1,r*.1,'#2b2018'); ell(c,r*.65,-r*.05,r*.08,r*.09,'#2b2018');
    c.strokeStyle='#6d655e'; c.lineWidth=1; c.beginPath(); c.moveTo(r*.85,r*.15); c.lineTo(r*1.3,r*.05); c.moveTo(r*.85,r*.2); c.lineTo(r*1.3,r*.3); c.stroke();
    if (D.boss){ c.beginPath(); c.moveTo(r*.85,r*.25); c.lineTo(r*1.5,r*.5); c.moveTo(r*.85,r*.1); c.lineTo(r*1.5,-r*.2); c.stroke(); crown(c,r*.15,-r*.5,r*.3); }
    break;
  case 'mole':
    ell(c,0,r*.15,r*1.05,r*.75,D.fur,'#25212a',1.6); ell(c,-r*.3,-r*.2,r*.5,r*.2,'rgba(255,255,255,.12)');
    for (const y of [r*.55,r*.35]) ell(c,r*.65,y,r*.22,r*.13,'#e9a7b4','#b56a7a',1);
    ell(c,r*1.05,-r*.05,r*.17,r*.14,'#ef9fb0','#b56a7a',1); ell(c,r*.6,-r*.25,r*.05,r*.05,'#111');
    if (D.boss) crown(c,0,-r*.5,r*.32); break;
  case 'gopher':
    ell(c,0,r*.1,r*1,r*.85,'#9a7048','#5e4128',2); ell(c,r*.2,r*.3,r*.55,r*.5,'#d2b48c');
    ell(c,-r*.4,-r*.7,r*.2,r*.17,'#9a7048','#5e4128',1.5);
    ell(c,r*.45,-r*.35,r*.12,r*.13,'#2b2018'); ell(c,r*.95,-r*.05,r*.16,r*.12,'#3a2a22');
    c.fillStyle='#fffaf0'; c.fillRect(r*.62,r*.1,r*.16,r*.28); c.strokeStyle='#5e4128'; c.lineWidth=1; c.strokeRect(r*.62,r*.1,r*.16,r*.28);
    if (D.boss){ c.strokeStyle='#5e4128'; c.lineWidth=2; c.beginPath(); c.moveTo(r*.25,-r*.55); c.lineTo(r*.6,-r*.45); c.stroke(); crown(c,-r*.05,-r*.75,r*.32); }
    break;
  }
  if (e.slow>0) ell(c,0,-r*.1,r*1.15,r*.95,null,'rgba(120,190,230,.8)',2);
}
