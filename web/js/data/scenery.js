// Garden scenery: things that sit on the grass and take up building spots.
// Each garden has its own small pieces and one big piece. Later levels in a garden get more
// of them, and some always land right beside the path, where defenders would most like to stand.
import { COLS, ROWS } from './levels.js';
import { rng } from '../../kit/js/draw.js';

export const SCENERY = {
  cabbage:    { small:['rock','bush'],       big:{ kind:'pond',     w:2, h:2 } },
  strawberry: { small:['haybale','basket'],  big:{ kind:'haystack', w:2, h:2 } },
  carrot:     { small:['stump','molehill'],  big:{ kind:'log',      w:2, h:1 } },
  tomato:     { small:['pot','crate'],       big:{ kind:'table',    w:2, h:1 } },
};
// How many small pieces each level in a garden gets (level 1, 2, 3), and whether it gets the big one.
const SMALL = [4, 5, 6], BIG = [false, true, true];
// Share of the small pieces that go on the best spots next to the path.
const NEAR = .5;

// Build the scenery list for one level. `onPath(c,r)` says whether a tile is dirt path.
// `keep` lists tiles that must stay free (the tutorial's hint spots).
export function sceneryFor(LV, onPath, keep=[]){
  const set = SCENERY[LV.ch.id] || SCENERY.cabbage, R = rng(101 + LV.gi*977);
  const taken = new Set(), out = [];
  const kept = new Set(keep.map(([c,r]) => c+','+r));
  const free = (c,r) => c>=0 && c<COLS && r>=0 && r<ROWS-1 && !onPath(c,r) && !taken.has(c+','+r) && !kept.has(c+','+r);
  // keep a ring of open grass around each piece so they never form walls
  const roomy = (c,r,w,h) => { for (let y=r-1;y<=r+h;y++) for (let x=c-1;x<=c+w;x++) if (taken.has(x+','+y)) return false; return true; };
  const take = (c,r,w,h,kind) => { for (let y=r;y<r+h;y++) for (let x=c;x<c+w;x++) taken.add(x+','+y); out.push({ c, r, w, h, kind, seed:Math.floor(R()*1e6) }); };
  // how many path tiles sit within 1.5 tiles: high = a prime defender spot
  const near = (c,r) => { let n=0; for (let y=r-2;y<=r+2;y++) for (let x=c-2;x<=c+2;x++) if (Math.hypot(x-c,y-r)<=1.5 && onPath(x,y)) n++; return n; };

  if (BIG[LV.li]){
    const b = set.big, spots = [];
    for (let r=1;r<ROWS-2-b.h;r++) for (let c=0;c<=COLS-b.w;c++){
      let ok = true; for (let y=r;y<r+b.h;y++) for (let x=c;x<c+b.w;x++) if (!free(x,y)) ok=false;
      if (ok) spots.push([c,r]);
    }
    if (spots.length){ const [c,r] = spots[Math.floor(R()*spots.length)]; take(c,r,b.w,b.h,b.kind); }
  }
  const n = LV.gi===0 ? 3 : SMALL[LV.li], nNear = LV.gi===0 ? 0 : Math.round(n*NEAR);
  const cells = [];
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++) if (free(c,r)) cells.push({ c, r, s:near(c,r), k:R() });
  const best = cells.filter(x => x.s>=3).sort((a,b) => b.s-a.s || a.k-b.k);
  const any  = cells.slice().sort((a,b) => a.k-b.k);
  let placed = 0;
  for (const list of [best.slice(0, nNear*3), any]){
    for (const x of list){
      if (placed >= (list===any ? n : nNear)) break;
      if (!free(x.c,x.r) || !roomy(x.c,x.r,1,1)) continue;
      take(x.c, x.r, 1, 1, set.small[Math.floor(R()*set.small.length)]); placed++;
    }
  }
  return out;
}
