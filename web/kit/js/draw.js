// Drawing helpers behind the family art style: soft rounded shapes with darker outlines,
// a slightly darker shade for depth, and small white highlights.
export function ell(c,x,y,rx,ry,fill,stroke,lw){
  c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,6.2832);
  if (fill){ c.fillStyle=fill; c.fill(); }
  if (stroke){ c.strokeStyle=stroke; c.lineWidth=lw||1; c.stroke(); }
}
// Repeatable pseudo-random numbers (same seed → same garden decorations every time).
export function rng(seed){ return ()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; }; }
// The boss crown used across the family.
export function crown(c,x,y,w){
  c.beginPath(); c.moveTo(x-w,y); c.lineTo(x-w,y-w*.9); c.lineTo(x-w*.5,y-w*.45); c.lineTo(x,y-w*1.1); c.lineTo(x+w*.5,y-w*.45); c.lineTo(x+w,y-w*.9); c.lineTo(x+w,y); c.closePath();
  c.fillStyle='#f6c344'; c.fill(); c.strokeStyle='#a07a10'; c.lineWidth=1.5; c.stroke(); ell(c,x,y-w*.35,w*.15,w*.15,'#e0364b');
}
// A soft drop shadow under a character.
export const shadow = (c,y,w,h) => ell(c,0,y,w,h,'rgba(40,60,20,.25)');
