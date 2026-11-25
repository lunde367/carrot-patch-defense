// Defenders, drawn at the origin facing right. s = tile size, t = hop (0..1), anim = clock.
// lv 3 is the Super form: each defender gets its own new look (plus the glow board.js draws under it).
import { ell } from './art-common.js';
const SUP = 3;
// a little gold crown, centred on (x, y)
function crown(c,x,y,w,col='#f6c945'){ c.beginPath(); c.moveTo(x-w,y); c.lineTo(x-w,y-w*.9); c.lineTo(x-w*.5,y-w*.45); c.lineTo(x,y-w*1.1); c.lineTo(x+w*.5,y-w*.45); c.lineTo(x+w,y-w*.9); c.lineTo(x+w,y); c.closePath();
  c.fillStyle=col; c.fill(); c.strokeStyle='#a5761a'; c.lineWidth=Math.max(1,w*.18); c.stroke(); ell(c,x,y-w*.55,w*.16,w*.16,'#e2455c'); }
// a puffy storm or rain cloud above a defender
function cloud(c,s,y,anim,dark,big=1){ const col=dark?'#7a8496':'#dfe8f0', edge=dark?'#525a6a':'#9fb0c0'; c.save(); c.translate(0,y); c.scale(big,big); c.translate(0,-y);
  for (const [x,yy,r] of [[-.13,0,.1],[0,-.05,.13],[.13,0,.1],[0,.03,.12]]) ell(c,x*s,y+yy*s,r*s,r*s*.8,col,edge,s*.012);
  for (const [x,yy,r] of [[-.13,0,.09],[0,-.05,.12],[.13,0,.09],[0,.03,.11]]) ell(c,x*s,y+yy*s,r*s,r*s*.78,col);
  for (let k=0;k<5;k++){ const d=(anim*1.6+k*.37)%1; ell(c,(k-2)*s*.06,y+s*.1+d*s*.22,s*.014,s*.03,`rgba(110,170,220,${1-d})`); } c.restore(); }

function bunny(c,s,t,lv){
  if (lv>=SUP) return kingBunny(c,s,t);
  ell(c,0,s*.26,s*.28,s*.08,'rgba(40,60,20,.25)'); c.translate(0,-t*s*.1);
  for (const o of [-1,1]){ ell(c,o*s*.075,-s*.3,s*.055,s*.15,'#f7f2ec','#7d6f62',s*.025); ell(c,o*s*.075,-s*.29,s*.025,s*.1,'#f2a7b5'); }
  ell(c,0,s*.08,s*.23,s*.19,'#f7f2ec','#7d6f62',s*.03);
  ell(c,0,-s*.1,s*.17,s*.14,'#f7f2ec','#7d6f62',s*.03);
  ell(c,-s*.06,-s*.12,s*.025,s*.03,'#3a2e26'); ell(c,s*.06,-s*.12,s*.025,s*.03,'#3a2e26');
  ell(c,0,-s*.065,s*.025,s*.018,'#e88aa0');
  const gold=lv>=SUP;
  c.save(); c.translate(s*.12,s*.06); c.rotate(-.6); c.beginPath(); c.moveTo(-s*.05,0); c.lineTo(s*.05,0); c.lineTo(0,s*.16); c.closePath();
  c.fillStyle=gold?'#f6c945':'#ef8a2b'; c.fill(); if (gold){ c.strokeStyle='#b88a1c'; c.lineWidth=s*.015; c.stroke(); } ell(c,0,-s*.02,s*.04,s*.025,'#5fa040'); c.restore();
}
// Golden Bunny (Super): a king. Red ermine-trimmed cape, a big gold crown, a sceptre in one paw and a golden carrot in the other.
function kingBunny(c,s,t){
  ell(c,0,s*.26,s*.32,s*.09,'rgba(40,60,20,.25)'); c.translate(0,-t*s*.1);
  c.beginPath(); c.moveTo(-s*.15,-s*.06); c.quadraticCurveTo(-s*.34,s*.12,-s*.3,s*.27); c.lineTo(s*.3,s*.27); c.quadraticCurveTo(s*.34,s*.12,s*.15,-s*.06); c.closePath();   // cape
  c.fillStyle='#b81f3a'; c.fill(); c.strokeStyle='#6e0f22'; c.lineWidth=s*.02; c.stroke();
  c.beginPath(); c.roundRect(-s*.31,s*.22,s*.62,s*.07,s*.03); c.fillStyle='#fbf8f0'; c.fill(); c.strokeStyle='#9a8f80'; c.lineWidth=s*.012; c.stroke();   // ermine trim
  for (let k=0;k<6;k++) ell(c,-s*.25+k*s*.1,s*.255,s*.01,s*.016,'#1e1e24');
  for (const o of [-1,1]){ ell(c,o*s*.075,-s*.32,s*.055,s*.15,'#f7f2ec','#7d6f62',s*.025); ell(c,o*s*.075,-s*.31,s*.025,s*.1,'#f2a7b5'); }
  ell(c,0,s*.08,s*.22,s*.18,'#f7f2ec','#7d6f62',s*.03);
  ell(c,0,-s*.1,s*.17,s*.14,'#f7f2ec','#7d6f62',s*.03);
  ell(c,-s*.06,-s*.11,s*.025,s*.03,'#3a2e26'); ell(c,s*.06,-s*.11,s*.025,s*.03,'#3a2e26'); ell(c,0,-s*.06,s*.025,s*.018,'#e88aa0');
  crown(c,0,-s*.2,s*.15);                                                              // a big crown
  for (const [x,col] of [[-.08,'#3a8ad0'],[.08,'#3aa060']]) ell(c,x*s,-s*.25,s*.018,s*.018,col);
  c.save(); c.translate(-s*.2,s*.08); c.rotate(-.35);                                  // the sceptre
  c.fillStyle='#d9a43a'; c.fillRect(-s*.018,-s*.34,s*.036,s*.42); c.strokeStyle='#8a5a10'; c.lineWidth=s*.01; c.strokeRect(-s*.018,-s*.34,s*.036,s*.42);
  ell(c,0,-s*.38,s*.06,s*.06,'#f6c945','#8a5a10',s*.012); ell(c,-s*.02,-s*.4,s*.018,s*.018,'#fff6c8');
  c.fillStyle='#f6c945'; c.fillRect(-s*.01,-s*.5,s*.02,s*.08); c.fillRect(-s*.035,-s*.475,s*.07,s*.02); c.restore();
  ell(c,-s*.19,s*.07,s*.05,s*.04,'#f7f2ec','#7d6f62',s*.02);                            // paw on the sceptre
  c.save(); c.translate(s*.15,s*.06); c.rotate(-.6); c.beginPath(); c.moveTo(-s*.06,0); c.lineTo(s*.06,0); c.lineTo(0,s*.2); c.closePath();   // golden carrot
  c.fillStyle='#f6c945'; c.fill(); c.strokeStyle='#b88a1c'; c.lineWidth=s*.015; c.stroke(); ell(c,0,-s*.03,s*.05,s*.03,'#5fa040'); c.restore();
  ell(c,s*.17,s*.07,s*.05,s*.04,'#f7f2ec','#7d6f62',s*.02);
}
function sprinkler(c,s,t,lv,anim){
  ell(c,0,s*.24,s*.28,s*.08,'rgba(40,60,20,.25)');
  c.strokeStyle='#41657a'; c.lineWidth=s*.06; c.lineCap='round'; c.beginPath(); c.moveTo(s*.12,-s*.05); c.lineTo(s*.3,-s*.2); c.stroke();
  ell(c,s*.31,-s*.21,s*.05,s*.04,'#5d93b4','#41657a',s*.02);
  c.beginPath(); c.arc(-s*.02,-s*.18,s*.11,Math.PI,0); c.lineWidth=s*.04; c.stroke();
  c.beginPath(); c.roundRect(-s*.17,-s*.16,s*.32,s*.36,s*.07); c.fillStyle='#7fb3d1'; c.fill(); c.lineWidth=s*.03; c.stroke();
  c.fillStyle='rgba(255,255,255,.45)'; c.fillRect(-s*.12,-s*.1,s*.05,s*.22);
  for (let i=0;i<(lv>=SUP?5:3);i++){ const a=anim*(lv>=SUP?3:2)+i*(lv>=SUP?1.2566:2.094); ell(c,Math.cos(a)*s*.36,Math.sin(a)*s*.2-s*.02,s*.035,s*.045,lv>=SUP?'#9fd8ff':'#bfe3f5'); }
  if (lv>=SUP){ const ph=(anim*.45)%1, strike=ph<.07;                                // Storm Sprinkler: its own storm cloud, raining, with a lightning strike every couple of seconds
    if (strike){ c.save(); c.globalAlpha=1-ph/.07; const gr=c.createRadialGradient(0,s*.1,0,0,s*.1,s*.6); gr.addColorStop(0,'rgba(255,250,200,.7)'); gr.addColorStop(1,'rgba(255,250,200,0)'); c.fillStyle=gr; c.beginPath(); c.arc(0,s*.1,s*.6,0,6.28); c.fill(); c.restore(); }
    c.save(); c.globalAlpha=.92; cloud(c,s,-s*.4,anim,true,1.3); c.restore();   // big, but kept mostly inside its own tile so it doesn't hide the defender above
    if (strike){ const side=Math.floor(anim*.45)%2 ? 1 : -1, bx=side*s*.24;
      c.beginPath(); c.moveTo(side*s*.12,-s*.34); c.lineTo(bx+side*s*.02,-s*.2); c.lineTo(bx-side*s*.04,-s*.18); c.lineTo(bx+side*s*.03,s*.04); c.lineTo(bx-side*s*.02,s*.06); c.lineTo(bx,s*.24);
      c.strokeStyle='#fff27a'; c.lineWidth=s*.04; c.lineJoin='round'; c.stroke(); c.strokeStyle='#ffffff'; c.lineWidth=s*.015; c.stroke(); ell(c,bx,s*.24,s*.08,s*.03,'rgba(255,245,160,.8)'); }
    else if ((anim*3.1)%1<.08){ ell(c,s*.05,-s*.42,s*.1,s*.06,'rgba(255,250,190,.6)'); } }   // a flicker inside the cloud
}
function owl(c,s,t,lv,anim,look){
  ell(c,0,s*.28,s*.25,s*.07,'rgba(40,60,20,.25)'); c.translate(0,-t*s*.06);
  const thunder=lv>=SUP;                                                              // Thunder Owl: tall tufts, dark storm feathers, a lightning chest, a big purple cape
  if (thunder){ const fl=Math.sin(anim*2)*.02;
    c.beginPath(); c.moveTo(-s*.2,-s*.12); c.quadraticCurveTo(-s*.42,s*.1,-s*.4-fl*s,s*.33); c.quadraticCurveTo(-s*.27,s*.27,-s*.2,s*.34); c.quadraticCurveTo(-s*.1,s*.28,0,s*.35);
    c.quadraticCurveTo(s*.1,s*.28,s*.2,s*.34); c.quadraticCurveTo(s*.27,s*.27,s*.4+fl*s,s*.33); c.quadraticCurveTo(s*.42,s*.1,s*.2,-s*.12); c.closePath();
    c.fillStyle='#6a2a9a'; c.fill(); c.strokeStyle='#3a1458'; c.lineWidth=s*.02; c.stroke();
    c.beginPath(); c.moveTo(-s*.2,-s*.12); c.lineTo(-s*.28,-s*.24); c.lineTo(-s*.1,-s*.17); c.moveTo(s*.2,-s*.12); c.lineTo(s*.28,-s*.24); c.lineTo(s*.1,-s*.17); c.fillStyle='#8a3ac0'; c.fill(); }   // high collar
  c.fillStyle=thunder?'#3e3a52':'#7a5a3d'; for (const o of [-1,1]){ c.beginPath(); c.moveTo(o*s*.08,-s*.24); c.lineTo(o*s*(thunder?.24:.2),-s*(thunder?.44:.34)); c.lineTo(o*s*.19,-s*.18); c.fill(); }
  ell(c,0,s*.02,s*.22,s*.27,thunder?'#5a5470':'#9b7552',thunder?'#2a2638':'#5a3f28',s*.03);
  ell(c,0,s*.1,s*.13,s*.15,thunder?'#cfd4ea':'#dcc49d');
  if (thunder){ c.beginPath(); c.moveTo(s*.03,s*.0); c.lineTo(-s*.04,s*.11); c.lineTo(s*.01,s*.11); c.lineTo(-s*.03,s*.22); c.lineTo(s*.06,s*.08); c.lineTo(s*.01,s*.08); c.closePath(); c.fillStyle='#ffd84a'; c.fill(); }
  const blink=(anim%4)<.12;
  for (const o of [-1,1]){ ell(c,o*s*.09,-s*.09,s*.085,blink?s*.015:s*.085,'#fff','#5a3f28',s*.02);
    if (!blink) ell(c,o*s*.09+(look||1)*s*.03,-s*.09,s*.04,s*.04,thunder?'#e8a320':'#2b2018'); }
  c.beginPath(); c.moveTo(-s*.035,-s*.02); c.lineTo(s*.035,-s*.02); c.lineTo(0,s*.04); c.fillStyle='#e8a33c'; c.fill();
  if (thunder) ell(c,0,-s*.2,s*.035,s*.03,'#f6c945','#8a5a10',s*.01);                // the cape's gold clasp
}
function sunflower(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.2,s*.06,'rgba(40,60,20,.25)');
  const sw=Math.sin(anim*1.5)*.06;
  c.strokeStyle='#4f8a3c'; c.lineWidth=s*.05; c.beginPath(); c.moveTo(0,s*.3); c.quadraticCurveTo(s*.02,s*.1,0,-s*.05); c.stroke();
  c.save(); c.translate(s*.06,s*.17); c.rotate(-.6); ell(c,0,0,s*.09,s*.04,'#6aa84f'); c.restore();
  c.save(); c.translate(0,-s*.1); c.rotate(sw); const big=(1+t*.1)*(lv>=SUP?1.3:1);
  if (lv>=SUP){ for (let k=0;k<12;k++){ c.save(); c.rotate(k*.5236+anim*.3); c.fillStyle='rgba(255,226,110,.35)'; c.beginPath(); c.moveTo(-s*.03,-s*.2); c.lineTo(0,-s*.42); c.lineTo(s*.03,-s*.2); c.fill(); c.restore(); } }   // Giant Sunflower: sun rays
  for (let k=0;k<11;k++){ c.save(); c.rotate(k*.5712); ell(c,0,-s*.15*big,s*.05,s*.085*big,'#f4c430','#d39b12',s*.015); c.restore(); }
  ell(c,0,0,s*.1*(lv>=SUP?1.3:1),s*.1*(lv>=SUP?1.3:1),'#6b4423'); ell(c,-s*.03,-s*.03,s*.025,s*.025,'#8a5a30');
  if (lv>=SUP){ ell(c,-s*.04,-s*.01,s*.015,s*.018,'#2b2018'); ell(c,s*.04,-s*.01,s*.015,s*.018,'#2b2018'); c.beginPath(); c.arc(0,s*.02,s*.04,.4,2.7); c.strokeStyle='#2b2018'; c.lineWidth=s*.015; c.stroke(); }   // and a smile
  c.restore();
}
function rose(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.22,s*.06,'rgba(40,60,20,.25)');
  c.strokeStyle='#3f7a3a'; c.lineWidth=s*.045; c.lineCap='round'; c.beginPath(); c.moveTo(0,s*.3); c.quadraticCurveTo(-s*.04,s*.08,0,-s*.08); c.stroke();
  c.fillStyle='#2f5e2c'; for (const [x,y,d] of [[-.02,.2,-1],[.0,.06,1]]){ c.beginPath(); c.moveTo(x*s,y*s); c.lineTo(x*s+d*s*.06,y*s-s*.02); c.lineTo(x*s,y*s-s*.04); c.fill(); }
  c.save(); c.translate(s*.07,s*.12); c.rotate(-.5); ell(c,0,0,s*.09,s*.045,'#5c9a4a','#3f7a3a',s*.015); c.restore();
  c.save(); c.translate(-s*.08,s*.18); c.rotate(.5); ell(c,0,0,s*.08,s*.04,'#5c9a4a','#3f7a3a',s*.015); c.restore();
  const cr=lv>=SUP, pet=cr?'#9e1030':'#d6455d', mid=cr?'#7a0a24':'#c23250', edge=cr?'#f2c94a':'#8f1f37';   // Crimson Rose: deep red, gold-edged, thorny
  if (cr){ c.fillStyle='#6a1a1a'; c.strokeStyle='#3a0a0a'; c.lineWidth=s*.008;        // a stem bristling with big thorns
    for (const [y,d] of [[.26,-1],[.2,1],[.14,-1],[.08,1],[.02,-1],[-.04,1]]){ const x=-Math.sin((.3-y)/.38*Math.PI)*s*.03;
      c.beginPath(); c.moveTo(x,y*s+s*.025); c.lineTo(x+d*s*.075,y*s-s*.03); c.lineTo(x,y*s-s*.02); c.closePath(); c.fill(); c.stroke(); } }
  c.save(); c.translate(0,-s*.15); const p=(1+t*.12)*(cr?1.15:1); c.scale(p,p);
  for (let k=0;k<6;k++){ c.save(); c.rotate(k*1.047+anim*.2); ell(c,0,-s*.1,s*.075,s*.08,pet,edge,s*.015); c.restore(); }
  ell(c,0,0,s*.1,s*.1,mid,edge,s*.015);
  c.beginPath(); c.arc(0,0,s*.055,0,4.8); c.strokeStyle='#8f1f37'; c.lineWidth=s*.02; c.stroke();
  c.restore();
}
function pine(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.3,s*.08,'rgba(40,60,20,.25)');
  c.fillStyle='#7a5234'; c.fillRect(-s*.05,s*.12,s*.1,s*.18);
  const sq=1-t*.08; c.save(); c.scale(1/sq,sq);
  const tri=(y,w,h,col)=>{ c.beginPath(); c.moveTo(0,y-h); c.lineTo(w,y); c.lineTo(-w,y); c.closePath(); c.fillStyle=col; c.fill(); c.strokeStyle='#244d2c'; c.lineWidth=s*.02; c.stroke(); };
  const fire=lv>=SUP;                                                                 // Firecone Pine: dark needles and glowing ember cones
  tri(s*.16,s*.3,s*.26,fire?'#2e5a3a':'#3d7a48'); tri(s*.0,s*.24,s*.24,fire?'#356a42':'#478a52'); tri(-s*.15,s*.17,s*.22,fire?'#3e7a4a':'#52995c');
  const cone=fire?'#ef7a2b':'#9a6b3c', ced=fire?'#a83a12':'#5e3d20';
  for (const [x,y,w] of fire?[[-.12,.12,1],[.1,-.02,.9],[.0,-.2,.8],[.15,.13,.85]]:[[-.12,.12,1],[.1,-.02,.9]]){ if (fire) ell(c,x*s,y*s,s*.07*w,s*.08*w,`rgba(255,170,60,${.35+.25*Math.sin((anim||0)*5+x*20)})`); ell(c,x*s,y*s,s*.04*w,s*.055*w,cone,ced,s*.012); }
  c.restore();
  if (fire){ const f=Math.sin((anim||0)*8)*.02; c.beginPath(); c.moveTo(-s*.05,-s*.4); c.quadraticCurveTo(-s*.04,-s*.5,(f)*s,-s*.56); c.quadraticCurveTo(s*.04,-s*.5,s*.05,-s*.4); c.closePath(); c.fillStyle='#f6c344'; c.fill();
    c.beginPath(); c.moveTo(-s*.025,-s*.41); c.quadraticCurveTo(0,-s*.47,f*s,-s*.5); c.quadraticCurveTo(s*.02,-s*.46,s*.025,-s*.41); c.fillStyle='#ef5a2b'; c.fill(); }
}
function squirrel(c,s,t,lv,anim,look){
  ell(c,0,s*.28,s*.28,s*.08,'rgba(40,60,20,.25)'); c.scale(look||1,1); c.translate(0,-t*s*.08);
  const honey=lv>=SUP;                                                                // Honey Squirrel: golden tail, a knight's helmet, a honey pot at its feet
  c.save(); c.translate(-s*.17,-s*.05); c.rotate(-.25+Math.sin(anim*3)*.08);
  ell(c,0,0,s*.13,s*.26,honey?'#e3a33a':'#c9773f','#7d4520',s*.025); ell(c,-s*.03,-s*.12,s*.07,s*.1,honey?'#f6d27a':'#e09a5e'); c.restore();
  ell(c,s*.03,s*.1,s*.15,s*.17,'#b8682f','#7d4520',s*.025);
  ell(c,s*.06,s*.13,s*.08,s*.1,'#f0d3a8');
  if (!honey){ c.fillStyle='#b8682f'; c.beginPath(); c.moveTo(s*.06,-s*.16); c.lineTo(s*.1,-s*.27); c.lineTo(s*.14,-s*.15); c.fill(); }
  ell(c,s*.1,-s*.08,s*.12,s*.1,'#b8682f','#7d4520',s*.025);
  ell(c,s*.14,-s*.1,s*.022,s*.025,'#2b2018'); ell(c,s*.21,-s*.06,s*.018,s*.015,'#2b2018');
  if (honey){
    // a shiny gold knight's helmet with a red plume
    c.beginPath(); c.moveTo(-s*.02,-s*.08); c.quadraticCurveTo(-s*.02,-s*.24,s*.1,-s*.24); c.quadraticCurveTo(s*.23,-s*.24,s*.23,-s*.1); c.lineTo(s*.2,-s*.08); c.closePath();
    c.fillStyle='#e8b43a'; c.fill(); c.strokeStyle='#8a5a10'; c.lineWidth=s*.016; c.stroke();
    c.beginPath(); c.moveTo(-s*.03,-s*.085); c.lineTo(s*.24,-s*.085); c.strokeStyle='#b07a1a'; c.lineWidth=s*.03; c.stroke();      // brim
    c.beginPath(); c.moveTo(s*.1,-s*.24); c.lineTo(s*.1,-s*.09); c.strokeStyle='#b07a1a'; c.lineWidth=s*.014; c.stroke();            // ridge
    ell(c,s*.04,-s*.19,s*.03,s*.02,'rgba(255,248,200,.8)');                                                                       // shine
    const wv=Math.sin(anim*4)*.02; c.beginPath(); c.moveTo(s*.1,-s*.24); c.quadraticCurveTo(s*.02,-s*.38,-s*.14,-s*.32+wv*s); c.quadraticCurveTo(-s*.02,-s*.3,s*.08,-s*.23); c.fillStyle='#d8343a'; c.fill();
    ell(c,s*.15,s*.05,s*.045,s*.05,'#e3a33a','#8a5a1a',s*.012); ell(c,s*.15,s*.015,s*.05,s*.022,'#6b4423');                     // a honey-dipped acorn
    // a round clay honey pot by its feet, honey spilling over the rim
    const px=s*.25, py=s*.2;
    ell(c,px,py,s*.12,s*.11,'#c8683a','#7a3a1a',s*.016); ell(c,px-s*.04,py-s*.03,s*.03,s*.05,'rgba(255,220,180,.35)');
    c.beginPath(); c.roundRect(px-s*.075,py-s*.03,s*.15,s*.06,s*.012); c.fillStyle='#f6ecd0'; c.fill(); c.strokeStyle='#7a3a1a'; c.lineWidth=s*.008; c.stroke();
    c.fillStyle='#7a3a1a'; c.font=`900 ${Math.round(s*.042)}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('HONEY',px,py+s*.002);
    ell(c,px,py-s*.1,s*.09,s*.03,'#a8502a','#7a3a1a',s*.012); ell(c,px,py-s*.105,s*.075,s*.022,'#f2b93a');
    c.fillStyle='#f2b93a'; for (const [dx,len] of [[-.05,.04],[.02,.05],[.06,.03]]){ c.beginPath(); c.roundRect(px+dx*s-s*.012,py-s*.11,s*.024,len*s,s*.012); c.fill(); ell(c,px+dx*s,py-s*.11+len*s,s*.016,s*.018,'#f2b93a'); } }
  else { ell(c,s*.15,s*.05,s*.045,s*.05,'#9a6b3c','#5e3d20',s*.012); ell(c,s*.15,s*.015,s*.05,s*.022,'#6b4423'); }
}

function scarecrow(c,s,t,lv,anim){
  if (lv>=SUP) return crowKing(c,s,t,anim);
  ell(c,0,s*.3,s*.24,s*.07,'rgba(40,60,20,.25)');
  const sw=Math.sin(anim*1.3)*.05+t*.25; c.save(); c.rotate(sw*.4);
  c.strokeStyle='#7a5234'; c.lineWidth=s*.05; c.lineCap='round';
  c.beginPath(); c.moveTo(0,s*.3); c.lineTo(0,-s*.18); c.moveTo(-s*.26,-s*.02); c.lineTo(s*.26,-s*.02); c.stroke();
  // shirt with patches, straw hands
  const king=false;
  c.beginPath(); c.moveTo(-s*.24,-s*.06); c.lineTo(s*.24,-s*.06); c.lineTo(s*.13,s*.16); c.lineTo(-s*.13,s*.16); c.closePath();
  c.fillStyle=king?'#5a3a8a':'#c2456b'; c.fill(); c.strokeStyle=king?'#2e1a4e':'#7d2440'; c.lineWidth=s*.02; c.stroke();
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
  crowBird(c,s*.27,-s*.07,s*.1,Math.sin(anim*2)*.2,false);                          // a crow perched on the arm, ready to go
}
// Crow King (Super): no longer straw, a royal guard in a red coat and a tall black bearskin hat, crows at his command.
function crowKing(c,s,t,anim){
  ell(c,0,s*.3,s*.26,s*.07,'rgba(40,60,20,.25)');
  const sw=Math.sin(anim*1.3)*.02+t*.08; c.save(); c.rotate(sw*.3);
  c.fillStyle='#1e2440'; c.fillRect(-s*.09,s*.1,s*.075,s*.17); c.fillRect(s*.015,s*.1,s*.075,s*.17);        // trousers
  c.fillStyle='#c8202e'; c.fillRect(-s*.065,s*.1,s*.018,s*.17); c.fillRect(s*.05,s*.1,s*.018,s*.17);         // red stripes
  c.fillStyle='#111'; c.beginPath(); c.roundRect(-s*.1,s*.25,s*.09,s*.05,s*.015); c.roundRect(s*.01,s*.25,s*.09,s*.05,s*.015); c.fill();   // boots
  c.beginPath(); c.moveTo(-s*.15,-s*.1); c.lineTo(s*.15,-s*.1); c.lineTo(s*.14,s*.13); c.lineTo(-s*.14,s*.13); c.closePath();               // red tunic
  c.fillStyle='#c8202e'; c.fill(); c.strokeStyle='#6e0f18'; c.lineWidth=s*.018; c.stroke();
  c.fillStyle='#f4f4f0'; c.fillRect(-s*.145,s*.05,s*.29,s*.035); ell(c,0,s*.067,s*.03,s*.022,'#f6c945','#8a5a10',s*.008);   // white belt, gold buckle
  for (let k=0;k<4;k++) ell(c,0,-s*.07+k*s*.04,s*.012,s*.012,'#f6c945');                                    // buttons
  c.fillStyle='#1e2440'; c.fillRect(-s*.15,-s*.1,s*.3,s*.03);                                                // collar
  for (const o of [-1,1]){ c.beginPath(); c.ellipse(o*s*.16,-s*.09,s*.05,s*.022,0,0,6.28); c.fillStyle='#f6c945'; c.fill(); c.strokeStyle='#8a5a10'; c.lineWidth=s*.008; c.stroke(); }   // epaulettes
  c.strokeStyle='#c8202e'; c.lineWidth=s*.06; c.lineCap='round';
  c.beginPath(); c.moveTo(-s*.15,-s*.06); c.lineTo(-s*.19,s*.1); c.stroke();                                 // left arm at its side
  c.beginPath(); c.moveTo(s*.15,-s*.06); c.lineTo(s*.3,-s*.03); c.stroke();                                   // right arm out, for the crow
  ell(c,-s*.19,s*.12,s*.03,s*.03,'#f4f4f0','#9a9a90',s*.008); ell(c,s*.32,-s*.03,s*.03,s*.03,'#f4f4f0','#9a9a90',s*.008);   // white gloves
  ell(c,0,-s*.16,s*.075,s*.075,'#f0c8a0','#a07850',s*.014);                                                  // face
  ell(c,-s*.028,-s*.17,s*.012,s*.012,'#2b2018'); ell(c,s*.028,-s*.17,s*.012,s*.012,'#2b2018');
  c.strokeStyle='#7a3a2a'; c.lineWidth=s*.012; c.beginPath(); c.moveTo(-s*.03,-s*.13); c.lineTo(s*.03,-s*.13); c.stroke();   // a stern mouth
  c.strokeStyle='#f6c945'; c.lineWidth=s*.01; c.beginPath(); c.moveTo(-s*.07,-s*.2); c.quadraticCurveTo(0,-s*.06,s*.07,-s*.2); c.stroke();   // chin strap
  // the tall black bearskin hat, fuzzy at the edges, with a red plume
  c.beginPath(); c.ellipse(0,-s*.33,s*.11,s*.17,0,0,6.28); c.fillStyle='#14141a'; c.fill();
  for (let k=0;k<14;k++){ const a=k/14*6.28; ell(c,Math.cos(a)*s*.105,-s*.33+Math.sin(a)*s*.165,s*.025,s*.025,'#14141a'); }
  ell(c,-s*.04,-s*.4,s*.02,s*.05,'rgba(255,255,255,.12)');
  const wv=Math.sin(anim*3)*.015; c.beginPath(); c.moveTo(s*.09,-s*.24); c.quadraticCurveTo(s*.16,-s*.34,s*.13+wv*s,-s*.45); c.quadraticCurveTo(s*.1,-s*.34,s*.07,-s*.25); c.fillStyle='#e2303a'; c.fill();
  c.restore();
  crowBird(c,s*.33,-s*.09,s*.15,Math.sin(anim*2)*.2,true);                           // the crow king's own crow, crowned
  crowBird(c,-s*.17,-s*.15,s*.1,Math.sin(anim*2.6+1)*.25,false);                    // and one on his shoulder
}
// A crow, side on, facing right. flap: -1..1.
export function crowBird(c,x,y,w,flap,king){
  c.save(); c.translate(x,y);
  ell(c,0,0,w*.55,w*.32,king?'#2a1e3e':'#1e1e24');
  c.beginPath(); c.moveTo(-w*.1,-w*.05); c.quadraticCurveTo(-w*.3,-w*(.5+flap*.5),-w*.7,-w*(.3+flap*.6)); c.quadraticCurveTo(-w*.35,-w*.05,-w*.1,w*.05); c.fillStyle=king?'#3e2c5a':'#2e2e36'; c.fill();
  c.beginPath(); c.moveTo(-w*.45,0); c.lineTo(-w*.85,-w*.12); c.lineTo(-w*.8,w*.12); c.closePath(); c.fillStyle=king?'#2a1e3e':'#1e1e24'; c.fill();
  ell(c,w*.45,-w*.18,w*.25,w*.22,king?'#2a1e3e':'#1e1e24'); ell(c,w*.52,-w*.22,w*.06,w*.06,'#f2d16b');
  c.beginPath(); c.moveTo(w*.66,-w*.2); c.lineTo(w*.92,-w*.12); c.lineTo(w*.66,-w*.08); c.closePath(); c.fillStyle='#e8a33c'; c.fill();
  if (king) crown(c,w*.45,-w*.36,w*.16);
  c.restore();
}

// a little green frog sitting, facing right (dir -1 faces left). gulp: 0..1 puffs its throat.
function frog(c,x,y,w,dir,gulp,blink){
  c.save(); c.translate(x,y); c.scale(dir,1);
  ell(c,0,0,w*.5,w*.38,'#6ab04a','#2f6a24',w*.07); ell(c,w*.15,w*.12,w*.25,w*.16,'#cfe8a0');
  ell(c,-w*.32,w*.2,w*.18,w*.1,'#5a9a3e','#2f6a24',w*.05);
  for (const ex of [-.15,.25]){ ell(c,ex*w,-w*.33,w*.15,w*.15,'#6ab04a','#2f6a24',w*.06); ell(c,ex*w,-w*.33,w*.1,blink?w*.02:w*.1,'#fffde8'); if (!blink) ell(c,ex*w+w*.03,-w*.33,w*.05,w*.07,'#1a1a10'); }
  if (gulp) ell(c,w*.3,w*.1,w*.16*(.6+gulp*.6),w*.14*(.6+gulp*.6),'#f2e4b0','#c8b880',w*.03);
  c.beginPath(); c.arc(w*.25,-w*.08,w*.18,.2,1.4); c.strokeStyle='#2f6a24'; c.lineWidth=w*.05; c.stroke();
  c.restore();
}
function barrel(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.24,s*.07,'rgba(40,60,20,.25)');
  c.beginPath(); c.moveTo(-s*.2,-s*.2); c.quadraticCurveTo(-s*.26,s*.05,-s*.2,s*.28); c.lineTo(s*.2,s*.28); c.quadraticCurveTo(s*.26,s*.05,s*.2,-s*.2); c.closePath();
  c.fillStyle='#9a6b3c'; c.fill(); c.strokeStyle='#5e3d20'; c.lineWidth=s*.02; c.stroke();
  c.strokeStyle='#6f7a82'; c.lineWidth=s*.035; for (const y of [-.1,.17]){ c.beginPath(); c.moveTo(-s*.23,y*s); c.lineTo(s*.23,y*s); c.stroke(); }
  ell(c,0,-s*.2,s*.2,s*.06,'#5aa0c8','#3a6a8a',s*.015);
  const ripple=(Date.now()/600)%1; ell(c,0,-s*.2,s*.12*ripple,s*.035*ripple,null,'rgba(255,255,255,.7)',1);
  if (lv>=1){ c.strokeStyle='#6f7a82'; c.lineWidth=s*.03; c.beginPath(); c.moveTo(s*.2,0); c.lineTo(s*.3,0); c.lineTo(s*.3,s*.08); c.stroke(); }
  if (lv>=2) ell(c,s*.3,s*.12,s*.03,s*.04,'#5aa0c8');
  if (lv>=SUP){ const a=anim||0;                                                     // Frog Barrel: a little pond on top, lily pads, cattails and frogs
    c.strokeStyle='#5a7a2a'; c.lineWidth=s*.02; for (const [x,h] of [[-.16,.36],[-.11,.3]]){ c.beginPath(); c.moveTo(x*s,-s*.2); c.lineTo(x*s+Math.sin(a+x*9)*s*.01,-s*(.2+h)); c.stroke(); ell(c,x*s,-s*(.16+h),s*.022,s*.06,'#7a4a24'); }
    for (const [x,y,r] of [[.1,-.21,.07],[-.06,-.19,.05]]){ c.beginPath(); c.moveTo(x*s,y*s); c.ellipse(x*s,y*s,r*s,r*s*.4,0,.3,6); c.closePath(); c.fillStyle='#5aa040'; c.fill(); c.strokeStyle='#2f6a24'; c.lineWidth=s*.01; c.stroke(); }
    ell(c,-s*.04,-s*.23,s*.025,s*.02,'#f2a0c0');                                    // a lily flower
    const g1=Math.max(0,Math.sin(a*2.2)), b1=(a%3.3)<.12;
    frog(c,s*.1,-s*.28,s*.17,1,g1,b1); frog(c,-s*.24,s*.06,s*.13,-1,Math.max(0,Math.sin(a*1.7+2)),(a%4.1)<.12); }
}
// Bee Hive: a painted wooden box hive on legs (not the old straw skeps), with bees busy around it
function hive(c,s,t,lv,anim){
  ell(c,0,s*.3,s*.28,s*.07,'rgba(40,60,20,.25)');
  c.save(); c.translate(0,s*.3); c.scale(1.25,1.25); c.translate(0,-s*.3);
  c.fillStyle='#6b4423'; c.fillRect(-s*.17,s*.17,s*.04,s*.13); c.fillRect(s*.13,s*.17,s*.04,s*.13);           // stand
  const boxes=lv>=2?3:2, cols=lv>=SUP?['#f6c945','#f2b83a','#f6c945']:['#f2d16b','#8fc7d9','#f2a0b8'], h=s*.15;
  for (let k=0;k<boxes;k++){ const y=s*.18-(k+1)*h;
    c.beginPath(); c.roundRect(-s*.2,y,s*.4,h-s*.01,s*.015); c.fillStyle=cols[k]; c.fill(); c.strokeStyle='#6b4a2b'; c.lineWidth=s*.016; c.stroke();
    c.fillStyle='rgba(107,74,43,.35)'; c.fillRect(-s*.06,y+h*.35,s*.12,s*.025);                                // hand grips
    if (lv>=SUP){ c.strokeStyle='rgba(160,100,20,.45)'; c.lineWidth=s*.008;                                     // a honeycomb pattern
      for (let hx=-3;hx<=3;hx++){ const cx=hx*s*.055, cy=y+h*.55+(hx%2?s*.02:0), r=s*.022; c.beginPath(); for (let q=0;q<6;q++){ const an=q*1.047; c.lineTo(cx+Math.cos(an)*r, cy+Math.sin(an)*r); } c.closePath(); c.stroke(); } } }
  const top=s*.18-boxes*h;
  c.beginPath(); c.moveTo(-s*.24,top); c.lineTo(-s*.2,top-s*.07); c.lineTo(s*.2,top-s*.07); c.lineTo(s*.24,top); c.closePath();   // roof
  c.fillStyle='#b5824e'; c.fill(); c.strokeStyle='#6b4a2b'; c.lineWidth=s*.016; c.stroke();
  c.fillStyle='#3a2614'; c.fillRect(-s*.08,s*.15,s*.16,s*.025);                                                  // entrance slot
  if (lv>=1){ ell(c,s*.12,top-s*.1,s*.04,s*.04,'#f2a0b8','#b0607a',1); ell(c,s*.12,top-s*.1,s*.015,s*.015,'#f2d16b'); }   // a flower on the roof
  ell(c,-s*.02,s*.13,s*.035,s*.012,'#e8b84a');                                                                  // a drip of honey
  if (lv>=SUP) for (const [x,ph] of [[-.15,0],[.05,.4],[.16,.7]]){ const d=((anim*.4+ph)%1); c.fillStyle='#f2b93a';   // honey oozing down the sides
    c.beginPath(); c.roundRect(x*s-s*.012,top,s*.024,s*.06+d*s*.18,s*.012); c.fill(); ell(c,x*s,top+s*.06+d*s*.18,s*.017,s*.02,'#f2b93a'); }
  const bs=lv>=SUP?1.6:1;                                                                                     // Queen's Hive: bigger bees, and more of them
  for (let k=0;k<(lv>=SUP?7:3+lv);k++){ const a=anim*3+k*(lv>=SUP?.9:2.1), bx=Math.cos(a)*s*(lv>=SUP?.36:.32), by=Math.sin(a*1.3)*s*.2-s*.12;
    ell(c,bx,by,s*.035*bs,s*.025*bs,'#f2c94a','#3a2614',1); if (lv>=SUP){ c.fillStyle='#3a2614'; c.fillRect(bx-s*.008,by-s*.025*bs,s*.012,s*.05*bs); }
    ell(c,bx,by-s*.025*bs,s*.025*bs,s*.015*bs,'rgba(255,255,255,.85)'); }
  if (lv>=SUP){ const qa=anim*1.7, qx=Math.cos(qa)*s*.22, qy=-s*.42+Math.sin(qa*2)*s*.04;            // Queen's Hive: the queen herself, crowned
    ell(c,qx,qy-s*.05,s*.06,s*.035,'rgba(255,255,255,.85)');
    ell(c,qx,qy,s*.085,s*.055,'#f2c94a','#3a2614',1.5); ell(c,qx-s*.03,qy,s*.016,s*.05,'#3a2614'); ell(c,qx+s*.02,qy,s*.016,s*.05,'#3a2614');
    crown(c,qx+s*.06,qy-s*.045,s*.045); }
  c.restore();
}
// Dairy Cow: a round black-and-white cow seen from the front-ish, tail flicking; she rears back to fling a pat
function cow(c,s,t,lv,anim,look=1){
  if (lv>=SUP) return prizeCow(c,s,t,anim,look);
  ell(c,0,s*.3,s*.3,s*.08,'rgba(40,60,20,.25)');
  c.save(); c.scale(look<0?-1:1,1); c.translate(0,-t*s*.05);
  c.fillStyle='#4a3a2a'; for (const x of [-.17,-.06,.08,.18]) c.fillRect(x*s-s*.025,s*.12,s*.05,s*.17);   // legs
  c.fillStyle='#2b2018'; for (const x of [-.17,-.06,.08,.18]) c.fillRect(x*s-s*.027,s*.26,s*.054,s*.04);  // hooves
  ell(c,0,s*.05,s*.27,s*.17,'#fbf8f0','#5a4a3a',s*.018);                                                  // body
  ell(c,-s*.1,0,s*.08,s*.07,'#2b2622'); ell(c,s*.09,s*.1,s*.07,s*.05,'#2b2622'); ell(c,-s*.17,s*.12,s*.04,s*.035,'#2b2622');
  ell(c,s*.02,s*.2,s*.06,s*.03,'#f2b8c0','#c78a92',1);                                                     // udder
  const sw=Math.sin(anim*2.2)*.25+t*.6; c.strokeStyle='#5a4a3a'; c.lineWidth=s*.018;                        // tail
  c.beginPath(); c.moveTo(-s*.26,0); c.quadraticCurveTo(-s*.36,-s*.05+sw*s*.1,-s*.34,s*.1+sw*s*.05); c.stroke(); ell(c,-s*.34,s*.11+sw*s*.05,s*.025,s*.035,'#2b2622');
  c.save(); c.translate(s*.24,-s*.08); c.rotate(-.15-t*.4);                                                // head
  c.fillStyle='#e8dcc0'; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*s*.05,-s*.08); c.quadraticCurveTo(sx*s*.1,-s*.16,sx*s*.07,-s*.19); c.lineTo(sx*s*.04,-s*.09); c.fill(); }
  ell(c,-s*.09,-s*.06,s*.05,s*.025,'#2b2622'); ell(c,s*.09,-s*.06,s*.05,s*.025,'#fbf8f0','#5a4a3a',1);   // ears
  ell(c,0,0,s*.1,s*.11,'#fbf8f0','#5a4a3a',s*.016); ell(c,-s*.03,-s*.04,s*.04,s*.045,'#2b2622');
  ell(c,0,s*.07,s*.075,s*.05,'#f2b8c0','#c78a92',1); ell(c,-s*.025,s*.07,s*.012,s*.01,'#7a4a52'); ell(c,s*.025,s*.07,s*.012,s*.01,'#7a4a52');
  ell(c,-s*.04,-s*.01,s*.015,s*.018,'#1a1410'); ell(c,s*.04,-s*.01,s*.015,s*.018,'#1a1410');
  c.restore();
  if (lv>=1){ ell(c,s*.2,s*.06,s*.035,s*.04,'#e8b84a','#9a6a1a',1); }                                   // a bell
  if (lv>=2){ for (let k=0;k<3;k++) ell(c,s*(.16+k*.05),-s*.2-Math.abs(k-1)*s*.01,s*.025,s*.025,['#f2a0b8','#fff3a0','#a0c8f2'][k]); }   // a daisy crown
  c.restore();
}
// Prize Cow (Super): up on her hind legs, flexing, with a champion's belt and a blue ribbon.
function prizeCow(c,s,t,anim,look){
  ell(c,0,s*.3,s*.26,s*.08,'rgba(40,60,20,.25)');
  c.save(); c.scale(look<0?-1:1,1); const fx=t*.12+Math.sin(anim*2)*.02;              // flex harder when she throws
  const W='#fbf8f0', E='#5a4a3a', B='#2b2622';
  for (const o of [-1,1]){ c.beginPath(); c.moveTo(o*s*.05,s*.08); c.quadraticCurveTo(o*s*.15,s*.16,o*s*.1,s*.27); c.lineTo(o*s*.02,s*.27); c.quadraticCurveTo(o*s*.02,s*.16,o*s*.0,s*.1); c.closePath();   // thick legs
    c.fillStyle=W; c.fill(); c.strokeStyle=E; c.lineWidth=s*.014; c.stroke(); c.fillStyle=B; c.beginPath(); c.roundRect(o>0?s*.015:-s*.105,s*.255,s*.09,s*.045,s*.012); c.fill(); }   // hooves
  c.beginPath(); c.moveTo(-s*.13,-s*.16); c.quadraticCurveTo(-s*.2,-s*.02,-s*.1,s*.11); c.lineTo(s*.1,s*.11); c.quadraticCurveTo(s*.2,-s*.02,s*.13,-s*.16); c.closePath();   // a V-shaped chest
  c.fillStyle=W; c.fill(); c.strokeStyle=E; c.lineWidth=s*.016; c.stroke();
  ell(c,-s*.09,s*.0,s*.04,s*.05,B); ell(c,s*.1,s*.06,s*.03,s*.035,B);
  c.strokeStyle='rgba(90,74,58,.55)'; c.lineWidth=s*.012;                                                   // pecs and abs
  c.beginPath(); c.arc(-s*.05,-s*.09,s*.05,.2,2.6); c.stroke(); c.beginPath(); c.arc(s*.05,-s*.09,s*.05,.5,2.9); c.stroke();
  for (const y of [-.01,.03]){ c.beginPath(); c.moveTo(-s*.03,y*s); c.lineTo(s*.03,y*s); c.stroke(); } c.beginPath(); c.moveTo(0,-s*.04); c.lineTo(0,s*.07); c.stroke();
  c.fillStyle='#d9a43a'; c.fillRect(-s*.12,s*.07,s*.24,s*.045); ell(c,0,s*.092,s*.05,s*.035,'#f6c945','#8a5a10',s*.01); ell(c,0,s*.092,s*.02,s*.015,'#e2455c');   // champion's belt
  for (const o of [-1,1]){ // big flexing arms: shoulder, bulging bicep, forearm up, hoof fist
    const sx=o*s*.13, sy=-s*.13, ex=o*s*.3, ey=-s*(.12+fx), hx=o*s*.27, hy=-s*(.34+fx);
    c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=E; c.lineWidth=s*.085; c.beginPath(); c.moveTo(sx,sy); c.lineTo(ex,ey); c.lineTo(hx,hy); c.stroke();
    c.strokeStyle=W; c.lineWidth=s*.065; c.stroke();
    ell(c,(sx+ex)/2,(sy+ey)/2-s*.035,s*.07,s*.05,W,E,s*.012);                       // bicep
    ell(c,(sx+ex)/2-o*s*.01,(sy+ey)/2-s*.045,s*.025,s*.018,'rgba(255,255,255,.9)');
    ell(c,hx,hy,s*.045,s*.04,B); }
  c.save(); c.translate(0,-s*.24); c.rotate(-t*.1);                                   // head
  c.fillStyle='#e8dcc0'; for (const sx of [-1,1]){ c.beginPath(); c.moveTo(sx*s*.05,-s*.06); c.quadraticCurveTo(sx*s*.13,-s*.12,sx*s*.1,-s*.18); c.lineTo(sx*s*.04,-s*.08); c.fill(); }
  ell(c,-s*.1,-s*.03,s*.05,s*.025,B); ell(c,s*.1,-s*.03,s*.05,s*.025,W,E,1);
  ell(c,0,0,s*.09,s*.1,W,E,s*.016); ell(c,s*.03,-s*.04,s*.035,s*.04,B);
  ell(c,0,s*.06,s*.07,s*.045,'#f2b8c0','#c78a92',1); ell(c,-s*.022,s*.06,s*.011,s*.009,'#7a4a52'); ell(c,s*.022,s*.06,s*.011,s*.009,'#7a4a52');
  ell(c,-s*.035,-s*.01,s*.014,s*.016,'#1a1410'); ell(c,s*.035,-s*.01,s*.014,s*.016,'#1a1410');
  c.strokeStyle='#1a1410'; c.lineWidth=s*.014; c.beginPath(); c.moveTo(-s*.06,-s*.04); c.lineTo(-s*.015,-s*.025); c.moveTo(s*.06,-s*.04); c.lineTo(s*.015,-s*.025); c.stroke();   // determined brows
  c.restore();
  for (let k=0;k<8;k++){ const a=k*.785; ell(c,s*.07+Math.cos(a)*s*.035,-s*.1+Math.sin(a)*s*.035,s*.022,s*.022,'#3a6ad0','#1e3a80',1); }   // blue ribbon
  ell(c,s*.07,-s*.1,s*.026,s*.026,'#f6c945','#a5761a',1);
  c.restore();
}
export const DRAW = { bunny, rose, squirrel, sprinkler, pine, owl, sunflower, scarecrow, barrel, hive, cow };
export function drawPips(c,s,lv){
  if (lv>=SUP){ for (let i=0;i<4;i++){ const x=(i-1.5)*s*.12, y=s*.4, r=s*.055; c.beginPath();      // Super: four gold stars
      for (let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, rr=k%2?r*.45:r; c.lineTo(x+Math.cos(a)*rr, y+Math.sin(a)*rr); } c.closePath(); c.fillStyle='#ffd84a'; c.fill(); c.strokeStyle='#a5761a'; c.lineWidth=s*.012; c.stroke(); } return; }
  for (let i=0;i<=lv;i++) ell(c,(i-lv/2)*s*.12,s*.4,s*.04,s*.04,'#f7b267','#9c5a1a',s*.015); }

const glow = (g,s,r,col) => { const gr=g.createRadialGradient(0,0,0,0,0,r*s); gr.addColorStop(0,col); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.beginPath(); g.arc(0,0,r*s,0,6.28); g.fill(); };
export function drawShot(g,sh,s){
  if (sh.k==='crow'){ const w=s*(sh.big?.42:.28); if (sh.big) glow(g,s,.4,'rgba(170,120,255,.45)');      // a crow flying out along the line
    g.translate(0,-s*.25); if (sh.dx<0) g.scale(-1,1); else if (sh.dy) g.rotate(sh.dy*.35);
    crowBird(g,0,0,w,Math.sin(sh.spin*1.3),sh.big); return; }
  if (sh.k==='carrot'){ if (sh.sup){ glow(g,s,.28,'rgba(255,220,90,.6)'); g.scale(1.45,1.45); } g.rotate(sh.a-Math.PI/2);   // flies point first, like a spike
    g.beginPath(); g.moveTo(-s*.05,-s*.08); g.lineTo(s*.05,-s*.08); g.lineTo(0,s*.12); g.closePath();
    g.fillStyle=sh.sup?'#f6c945':'#ef8a2b'; g.fill(); if (sh.sup){ g.strokeStyle='#b88a1c'; g.lineWidth=1.2; g.stroke(); } ell(g,0,-s*.1,s*.045,s*.03,'#5fa040'); }
  else if (sh.k==='thorn'){ g.rotate(sh.a); if (sh.sup){ glow(g,s,.16,'rgba(255,90,120,.55)'); g.scale(1.35,1.35); } g.beginPath(); g.moveTo(s*.1,0); g.lineTo(-s*.06,-s*.035); g.lineTo(-s*.06,s*.035); g.closePath(); g.fillStyle=sh.sup?'#c8102e':'#8f1f37'; g.fill(); if (sh.sup){ g.strokeStyle='#f2c94a'; g.lineWidth=1; g.stroke(); } }
  else if (sh.k==='acorn'){ if (sh.honey) glow(g,s,.2,'rgba(255,200,60,.55)'); g.scale(1.4,1.4); g.rotate(sh.spin); ell(g,0,s*.02,s*.05,s*.06,sh.honey?'#e3a33a':'#9a6b3c',sh.honey?'#8a5a1a':'#5e3d20',1); ell(g,0,-s*.03,s*.055,s*.025,'#6b4423');
    if (sh.honey) ell(g,s*.02,s*.08,s*.015,s*.03,'#f2c94a'); }
  else if (sh.k==='cone'){ const p=Math.min(1,sh.gone/sh.d0), h=Math.sin(p*Math.PI)*s*.9;
    ell(g,0,s*.3,s*.07,s*.025,'rgba(30,30,10,.25)'); g.translate(0,-h);
    if (sh.fire){ glow(g,s,.24,'rgba(255,140,40,.7)'); for (let k=1;k<4;k++) ell(g,-Math.cos(sh.a)*s*.07*k,-Math.sin(sh.a)*s*.07*k+s*.02*k,s*.04*(1-k*.2),s*.04*(1-k*.2),`rgba(255,${190-k*30},60,${.7-k*.15})`); }
    g.rotate(sh.spin*.5);
    ell(g,0,0,s*.07,s*.1,sh.fire?'#ef7a2b':'#9a6b3c',sh.fire?'#a83a12':'#5e3d20',1.2); g.strokeStyle='#5e3d20'; g.lineWidth=1;
    for (const y of [-.04,0,.04]){ g.beginPath(); g.moveTo(-s*.06,y*s); g.lineTo(s*.06,y*s); g.stroke(); } }
  else if (sh.k==='pat'){ const p=Math.min(1,sh.gone/sh.d0), h=Math.sin(p*Math.PI)*s*1.1;   // a cow pat, lobbed high
    ell(g,0,s*.3,s*.07,s*.025,'rgba(30,30,10,.25)'); g.translate(0,-h); g.rotate(sh.spin*.3);
    ell(g,0,0,s*.09,s*.055,'#6b4a26','#3e2a12',1.2); ell(g,-s*.015,-s*.02,s*.05,s*.03,'#7d5a30'); ell(g,s*.01,-s*.035,s*.025,s*.015,'#8a6638'); }
  else { g.rotate(sh.a);
    if (sh.thunder){ glow(g,s,.38,'rgba(255,240,120,.8)'); g.scale(1.6,1.6); }
    else if (sh.sup) glow(g,s,.2,'rgba(200,210,255,.5)');
    ell(g,0,0,s*.14,s*.045,sh.thunder?'#fff6b0':sh.sup?'#e4e6f6':'#efe4d0',sh.thunder?'#c89a10':'#8a6a48',1.2); g.beginPath(); g.moveTo(-s*.14,0); g.lineTo(s*.12,0); g.strokeStyle=sh.thunder?'#c89a10':'#8a6a48'; g.stroke(); }
}
