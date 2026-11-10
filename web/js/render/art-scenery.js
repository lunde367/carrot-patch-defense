// Scenery art: the rocks, stumps, pots and other things that take up tiles in each garden.
// Drawn once into the background. Same family style: soft round shapes and darker outlines.
import { ell, rng } from '../../kit/js/draw.js';

const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
const shadow = (c, x, y, rx, ry) => ell(c, x, y, rx, ry, 'rgba(30,20,10,.22)');

export function drawScenery(c, o, s){
  const x = o.c*s, y = o.r*s, w = o.w*s, h = o.h*s, cx = x+w/2, cy = y+h/2, R = rng(o.seed+1);
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  const art = ART[o.kind]; if (art) art(c, { x, y, w, h, cx, cy, s, R });
  c.restore();
}

const ART = {
  rock(c, { cx, cy, s, R }){
    shadow(c, cx, cy+s*.24, s*.36, s*.1);
    c.beginPath(); const n = 7, rad = s*.32;
    for (let k=0;k<n;k++){ const a = k/n*6.283 + R()*.3, rk = rad*(.8+R()*.25); c.lineTo(cx+Math.cos(a)*rk, cy+s*.04+Math.sin(a)*rk*.75); }
    c.closePath(); c.fillStyle = '#a7aa9c'; c.fill(); c.strokeStyle = '#6d7064'; c.lineWidth = 1.5; c.stroke();
    ell(c, cx-s*.08, cy-s*.06, s*.12, s*.07, '#c2c5b6');
    c.strokeStyle = '#85887a'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx+s*.04, cy+s*.02); c.lineTo(cx+s*.13, cy+s*.12); c.stroke();
  },
  bush(c, { cx, cy, s, R }){
    shadow(c, cx, cy+s*.26, s*.38, s*.1);
    for (const [dx, dy, r] of [[-.15,.06,.2],[.15,.06,.2],[0,-.08,.24]]) ell(c, cx+dx*s, cy+dy*s, s*r, s*r*.9, '#5f9a45', '#3f6e2e', 1.5);
    ell(c, cx-s*.06, cy-s*.12, s*.09, s*.06, '#7fb862');
    for (let k=0;k<3;k++) ell(c, cx+(R()-.5)*s*.4, cy+(R()-.3)*s*.3, s*.035, s*.035, '#e0566e');
  },
  haybale(c, { cx, cy, s }){
    shadow(c, cx, cy+s*.28, s*.4, s*.09);
    rr(c, cx-s*.38, cy-s*.22, s*.76, s*.48, s*.12); c.fillStyle = '#e8c35f'; c.fill(); c.strokeStyle = '#a7832a'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#c9a03c'; c.lineWidth = 1;
    for (const o of [-.2,-.06,.08,.22]){ c.beginPath(); c.moveTo(cx-s*.32, cy+o*s); c.lineTo(cx+s*.32, cy+o*s+s*.02); c.stroke(); }
    c.strokeStyle = '#9b5a2e'; c.lineWidth = 2; for (const o of [-.14,.14]){ c.beginPath(); c.moveTo(cx+o*s, cy-s*.22); c.lineTo(cx+o*s, cy+s*.26); c.stroke(); }
  },
  basket(c, { cx, cy, s, R }){
    shadow(c, cx, cy+s*.26, s*.32, s*.08);
    c.strokeStyle = '#8a5a2f'; c.lineWidth = Math.max(1.5, s*.04); c.beginPath(); c.arc(cx, cy-s*.02, s*.22, 3.3, 6.12); c.stroke();
    for (const [dx, dy] of [[-.1,-.04],[.04,-.06],[.12,0],[-.02,.01]]) ell(c, cx+dx*s, cy+dy*s, s*.07, s*.065, '#e2384c', '#9d1f2e', 1);
    c.beginPath(); c.moveTo(cx-s*.28, cy); c.lineTo(cx+s*.28, cy); c.lineTo(cx+s*.22, cy+s*.24); c.lineTo(cx-s*.22, cy+s*.24); c.closePath();
    c.fillStyle = '#c98b4b'; c.fill(); c.strokeStyle = '#8a5a2f'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#a8703a'; c.lineWidth = 1; for (const o of [.08,.16]){ c.beginPath(); c.moveTo(cx-s*.26+o*s*.2, cy+o*s); c.lineTo(cx+s*.26-o*s*.2, cy+o*s); c.stroke(); }
    void R;
  },
  stump(c, { cx, cy, s }){
    shadow(c, cx, cy+s*.27, s*.36, s*.09);
    c.beginPath(); c.moveTo(cx-s*.28, cy-s*.08); c.lineTo(cx-s*.3, cy+s*.2); c.quadraticCurveTo(cx, cy+s*.32, cx+s*.3, cy+s*.2); c.lineTo(cx+s*.28, cy-s*.08); c.closePath();
    c.fillStyle = '#8a5d3b'; c.fill(); c.strokeStyle = '#5b3a22'; c.lineWidth = 1.5; c.stroke();
    ell(c, cx, cy-s*.08, s*.28, s*.12, '#d9b183', '#5b3a22', 1.5);
    c.strokeStyle = '#b58a5c'; c.lineWidth = 1; ell(c, cx, cy-s*.08, s*.17, s*.07, null, '#b58a5c', 1); ell(c, cx, cy-s*.08, s*.07, s*.03, null, '#b58a5c', 1);
  },
  molehill(c, { cx, cy, s, R }){
    shadow(c, cx, cy+s*.22, s*.36, s*.08);
    c.beginPath(); c.moveTo(cx-s*.36, cy+s*.2); c.quadraticCurveTo(cx-s*.2, cy-s*.24, cx, cy-s*.2); c.quadraticCurveTo(cx+s*.22, cy-s*.24, cx+s*.36, cy+s*.2); c.closePath();
    c.fillStyle = '#7a5235'; c.fill(); c.strokeStyle = '#523520'; c.lineWidth = 1.5; c.stroke();
    for (let k=0;k<6;k++) ell(c, cx+(R()-.5)*s*.45, cy+(R()-.2)*s*.3, s*.03, s*.022, '#9a6c48');
    ell(c, cx, cy-s*.12, s*.07, s*.035, '#3a2516');
  },
  pot(c, { cx, cy, s, R }){
    shadow(c, cx, cy+s*.27, s*.3, s*.08);
    c.strokeStyle = '#4f8a3c'; c.lineWidth = Math.max(1.2, s*.03);
    for (const o of [-.1,0,.1]){ c.beginPath(); c.moveTo(cx, cy-s*.08); c.quadraticCurveTo(cx+o*s*1.6, cy-s*.24, cx+o*s*2.2, cy-s*.3); c.stroke(); }
    if (R() < .6) ell(c, cx+s*.12, cy-s*.24, s*.05, s*.05, '#e2483a');
    c.beginPath(); c.moveTo(cx-s*.24, cy-s*.06); c.lineTo(cx+s*.24, cy-s*.06); c.lineTo(cx+s*.17, cy+s*.26); c.lineTo(cx-s*.17, cy+s*.26); c.closePath();
    c.fillStyle = '#d07a4c'; c.fill(); c.strokeStyle = '#8e4a26'; c.lineWidth = 1.5; c.stroke();
    rr(c, cx-s*.27, cy-s*.12, s*.54, s*.1, s*.03); c.fillStyle = '#e08d5e'; c.fill(); c.stroke();
  },
  crate(c, { cx, cy, s }){
    shadow(c, cx, cy+s*.28, s*.36, s*.08);
    rr(c, cx-s*.3, cy-s*.24, s*.6, s*.5, s*.05); c.fillStyle = '#c99a5f'; c.fill(); c.strokeStyle = '#7d5a30'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#9c7544'; c.lineWidth = 1;
    for (const o of [-.08,.08]){ c.beginPath(); c.moveTo(cx-s*.3, cy+o*s); c.lineTo(cx+s*.3, cy+o*s); c.stroke(); }
    c.strokeStyle = '#7d5a30'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx-s*.26, cy-s*.2); c.lineTo(cx+s*.26, cy+s*.22); c.stroke();
  },
  pond(c, { cx, cy, w, h, s, R }){
    ell(c, cx, cy+s*.06, w*.46, h*.4, '#8a7a56');
    ell(c, cx, cy, w*.44, h*.38, '#7fb3d1', '#4d7f9c', 2);
    ell(c, cx-w*.1, cy-h*.1, w*.2, h*.1, '#a8d0e6');
    for (const [dx, dy] of [[.22,.12],[-.18,.16]]){ ell(c, cx+dx*w, cy+dy*h, s*.16, s*.12, '#6fae54', '#3f6e2e', 1.2);
      c.fillStyle = '#7fb3d1'; c.beginPath(); c.moveTo(cx+dx*w, cy+dy*h); c.arc(cx+dx*w, cy+dy*h, s*.17, -.3, .3); c.closePath(); c.fill(); }
    ell(c, cx+w*.22, cy+h*.08, s*.05, s*.05, '#f7d6e0');
    for (let k=0;k<4;k++){ const ax = cx+(R()<.5?-1:1)*w*(.38+R()*.06), ay = cy+(R()-.5)*h*.5;
      c.strokeStyle = '#5f8f45'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ax, ay+s*.1); c.lineTo(ax+(R()-.5)*s*.1, ay-s*.18); c.stroke(); }
  },
  haystack(c, { cx, cy, w, h, s }){
    shadow(c, cx, cy+h*.38, w*.44, h*.12);
    c.beginPath(); c.moveTo(cx-w*.42, cy+h*.36); c.quadraticCurveTo(cx-w*.44, cy-h*.3, cx, cy-h*.4); c.quadraticCurveTo(cx+w*.44, cy-h*.3, cx+w*.42, cy+h*.36); c.closePath();
    c.fillStyle = '#e8c35f'; c.fill(); c.strokeStyle = '#a7832a'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = '#c9a03c'; c.lineWidth = 1.2;
    for (let k=0;k<9;k++){ const ox = (k/8-.5)*w*.7; c.beginPath(); c.moveTo(cx+ox*.5, cy-h*.3); c.quadraticCurveTo(cx+ox, cy, cx+ox*1.05, cy+h*.32); c.stroke(); }
    // a pitchfork leaning on it
    c.strokeStyle = '#8a5a2f'; c.lineWidth = Math.max(1.5, s*.05); c.beginPath(); c.moveTo(cx+w*.3, cy+h*.36); c.lineTo(cx+w*.12, cy-h*.36); c.stroke();
    c.strokeStyle = '#7a7d74'; c.lineWidth = 1.5; for (const o of [-.05,0,.05]){ c.beginPath(); c.moveTo(cx+w*.12+o*w, cy-h*.36); c.lineTo(cx+w*.1+o*w, cy-h*.46); c.stroke(); }
  },
  log(c, { cx, cy, w, h, s }){
    shadow(c, cx, cy+h*.3, w*.46, h*.12);
    rr(c, cx-w*.42, cy-h*.24, w*.8, h*.48, h*.24); c.fillStyle = '#8a5d3b'; c.fill(); c.strokeStyle = '#5b3a22'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#6e4a2e'; c.lineWidth = 1; for (const o of [-.2,0,.15]){ c.beginPath(); c.moveTo(cx+o*w, cy-h*.2); c.quadraticCurveTo(cx+o*w+s*.1, cy, cx+o*w, cy+h*.2); c.stroke(); }
    ell(c, cx+w*.38, cy, h*.16, h*.24, '#d9b183', '#5b3a22', 1.5); ell(c, cx+w*.38, cy, h*.07, h*.11, null, '#b58a5c', 1);
    ell(c, cx-w*.18, cy-h*.22, s*.08, s*.05, '#6fae54'); ell(c, cx-w*.1, cy-h*.25, s*.06, s*.04, '#86c06d');
  },
  table(c, { cx, cy, w, h, s }){
    shadow(c, cx, cy+h*.34, w*.46, h*.1);
    c.strokeStyle = '#6b4a2b'; c.lineWidth = Math.max(2, s*.06);
    for (const o of [-.38,.38]){ c.beginPath(); c.moveTo(cx+o*w, cy-h*.05); c.lineTo(cx+o*w, cy+h*.34); c.stroke(); }
    rr(c, cx-w*.46, cy-h*.2, w*.92, h*.2, s*.04); c.fillStyle = '#b5824e'; c.fill(); c.strokeStyle = '#6b4a2b'; c.lineWidth = 1.5; c.stroke();
    // little seedling pots on top
    for (const o of [-.28,-.06,.18]){ const px = cx+o*w, py = cy-h*.2;
      c.beginPath(); c.moveTo(px-s*.1, py-s*.14); c.lineTo(px+s*.1, py-s*.14); c.lineTo(px+s*.07, py); c.lineTo(px-s*.07, py); c.closePath();
      c.fillStyle = '#d07a4c'; c.fill(); c.strokeStyle = '#8e4a26'; c.lineWidth = 1; c.stroke();
      c.strokeStyle = '#4f8a3c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px, py-s*.14); c.lineTo(px-s*.05, py-s*.26); c.moveTo(px, py-s*.14); c.lineTo(px+s*.05, py-s*.24); c.stroke(); }
  },
};
