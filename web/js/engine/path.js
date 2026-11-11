import { COLS, ROWS } from '../data/levels.js';

// The current level's paths. Most levels have one; some have several entrances ("lanes"),
// which may merge or stay apart. A path may also cross itself in a loop.
// path.pts / segs / total / exitCol describe lane 0, for code that only needs the main path.
export const path = { lanes:[], pts:[], segs:[], total:0, cells:new Set(), exitCol:0, exitCols:new Set(), scenery:[], blocked:new Set(), bonus:new Map() };

function makeLane(pts){
  const lane = { pts, segs:[], total:0 };
  for (let k=0;k<pts.length-1;k++){
    const [x1,y1]=pts[k], [x2,y2]=pts[k+1], len=Math.hypot(x2-x1,y2-y1);
    lane.segs.push({x1,y1,x2,y2,len,start:lane.total}); lane.total += len;
  }
  lane.exitCol = Math.floor(pts[pts.length-1][0]);
  return lane;
}
// Accepts one list of points, or a list of lanes (each a list of points).
export function setPath(ptsOrLanes){
  const lanes = Array.isArray(ptsOrLanes[0][0]) ? ptsOrLanes : [ptsOrLanes];
  path.lanes = lanes.map(makeLane); path.cells = new Set(); path.exitCols = new Set();
  for (const lane of path.lanes){
    path.exitCols.add(lane.exitCol);
    for (const s of lane.segs){
      const steps=Math.ceil(s.len*4);
      for (let k=0;k<=steps;k++) path.cells.add(Math.floor(s.x1+(s.x2-s.x1)*k/steps)+','+Math.floor(s.y1+(s.y2-s.y1)*k/steps));
    }
  }
  const L0 = path.lanes[0]; path.pts = L0.pts; path.segs = L0.segs; path.total = L0.total; path.exitCol = L0.exitCol;
}
export const laneTotal = (lane=0) => (path.lanes[lane] || path.lanes[0]).total;

// Position along a lane → [x, y, horizontal direction]
export function pointAt(d, lane=0){
  const segs = (path.lanes[lane] || path.lanes[0]).segs;
  for (const s of segs){
    if (d <= s.start+s.len){ const k=(d-s.start)/s.len; return [s.x1+(s.x2-s.x1)*k, s.y1+(s.y2-s.y1)*k, Math.sign(s.x2-s.x1)]; }
  }
  const s=segs[segs.length-1]; return [s.x2, s.y2, 0];
}

// Rocks, stumps, pots and other scenery that take up tiles.
// Helpful tiles (hills, sunny patches) don't block; they give a bonus to whatever is planted there.
export function setScenery(list, bonus=[]){
  path.bonus = new Map(bonus.map(b => [b.c+','+b.r, b.kind]));
  path.scenery = list; path.blocked = new Set();
  for (const o of list) for (let y=o.r;y<o.r+o.h;y++) for (let x=o.c;x<o.c+o.w;x++) path.blocked.add(x+','+y);
}
export const bonusAt = (c,r) => path.bonus.get(c+','+r) || null;
export const sceneryAt = (c,r) => path.blocked.has(c+','+r);
export const buildable = (c,r) => c>=0 && c<COLS && r>=0 && r<ROWS-1 && !path.cells.has(c+','+r) && !path.blocked.has(c+','+r);
