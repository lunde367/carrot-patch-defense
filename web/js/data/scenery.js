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
  apple:      { small:['skep','applecrate'], big:{ kind:'cart',     w:2, h:1 } },
  corn:       { small:['shock','bucket','litter'], big:{ kind:'trough', w:2, h:1 } },
  dust:       { small:['fire','bucket','tire'], big:{ kind:'trough', w:2, h:1 } },
  rooftop:    { small:['litter','tire','pot'], big:{ kind:'table', w:2, h:1 } },
  vault:      { small:['litter','fire','rock'], big:{ kind:'log', w:2, h:1 } },
  rain:       { small:['sapling','clover'],  big:{ kind:'pond',     w:2, h:2 } },
  meadow:     { small:['bush','skep'],       big:{ kind:'haystack', w:2, h:2 } },
  newgarden:  { small:['bush','basket'],     big:{ kind:'pond',     w:2, h:2 } },
};
// How many small pieces each level in a garden gets (level 1, 2, 3), and whether it gets the big one.
const SMALL = [6, 8, 10], BIG = [false, true, true];   // more scenery; any piece can be cleared for seeds
// Share of the small pieces that go on the best spots next to the path.
const NEAR = .6;

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
  const area = COLS*ROWS/(9*14);                       // bigger boards get more scenery
  const n = LV.gi===0 ? 3 : Math.round(SMALL[LV.li]*area), nNear = LV.gi===0 ? 0 : Math.round(n*NEAR);
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

// Helpful tiles: a hill (+range) on a good spot beside the path, and a sunny patch (Sunflowers
// make more seeds there; other defenders work a little faster) somewhere quieter.
// None in the tutorial level. The third level of a garden gets a second hill.
export function bonusFor(LV, onPath, scenery){
  if (LV.gi===0) return [];
  const R = rng(55 + LV.gi*331), blocked = new Set(), out = [];
  for (const o of scenery) for (let y=o.r;y<o.r+o.h;y++) for (let x=o.c;x<o.c+o.w;x++) blocked.add(x+','+y);
  const free = (c,r) => c>=0 && c<COLS && r>=0 && r<ROWS-1 && !onPath(c,r) && !blocked.has(c+','+r);
  const near = (c,r) => { let n=0; for (let y=r-2;y<=r+2;y++) for (let x=c-2;x<=c+2;x++) if (Math.hypot(x-c,y-r)<=1.5 && onPath(x,y)) n++; return n; };
  const cells = [];
  for (let r=0;r<ROWS-1;r++) for (let c=0;c<COLS;c++) if (free(c,r)) cells.push({ c, r, s:near(c,r), k:R() });
  const apart = x => out.every(o => Math.abs(o.c-x.c)+Math.abs(o.r-x.r) >= 4);
  const pick = (list, kind) => { const x = list.find(apart); if (x){ out.push({ c:x.c, r:x.r, kind }); blocked.add(x.c+','+x.r); } };
  const hills = cells.filter(x => x.s>=3).sort((a,b) => a.k-b.k);
  pick(hills, 'hill'); if (LV.li===2) pick(hills.filter(x => !blocked.has(x.c+','+x.r)), 'hill');
  pick(cells.filter(x => x.s<=2 && !blocked.has(x.c+','+x.r)).sort((a,b) => a.k-b.k), 'sunny');
  return out;
}

// Names for the info card when a player taps a piece, and the word for getting rid of it.
export const SCENERY_NAMES = {
  rock:['Rock','Clear'], bush:['Berry Bush','Clear'], pond:['Lily Pond','Fill in'], haybale:['Hay Bale','Clear'], basket:['Basket','Clear'],
  haystack:['Haystack','Clear'], stump:['Old Stump','Dig up'], molehill:['Molehill','Flatten'], log:['Fallen Log','Haul away'],
  pot:['Clay Pot','Clear'], crate:['Crate','Clear'], table:['Potting Table','Move'], skep:['Old Bee Hive','Clear'], applecrate:['Apple Crate','Clear'],
  cart:['Apple Cart','Move'], shock:['Corn Stalks','Clear'], bucket:['Empty Bucket','Clear'], trough:['Dry Trough','Haul away'],
  fire:['Fire','Put out'], litter:['Litter','Clean up'], tire:['Old Tire','Clean up'], sapling:['Young Tree','Replant'], clover:['Clover','Clear'],
};
