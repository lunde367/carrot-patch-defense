import { COLS, ROWS } from '../data/levels.js';

// The current level's dirt path: segments, total length, and which tiles it covers.
export const path = { pts:[], segs:[], total:0, cells:new Set(), exitCol:0 };

export function setPath(pts){
  path.pts = pts; path.segs = []; path.total = 0; path.cells = new Set();
  for (let k=0;k<pts.length-1;k++){
    const [x1,y1]=pts[k], [x2,y2]=pts[k+1], len=Math.hypot(x2-x1,y2-y1);
    path.segs.push({x1,y1,x2,y2,len,start:path.total}); path.total += len;
  }
  for (const s of path.segs){
    const steps=Math.ceil(s.len*4);
    for (let k=0;k<=steps;k++) path.cells.add(Math.floor(s.x1+(s.x2-s.x1)*k/steps)+','+Math.floor(s.y1+(s.y2-s.y1)*k/steps));
  }
  path.exitCol = Math.floor(pts[pts.length-1][0]);
}

// Position along the path → [x, y, horizontal direction]
export function pointAt(d){
  for (const s of path.segs){
    if (d <= s.start+s.len){ const k=(d-s.start)/s.len; return [s.x1+(s.x2-s.x1)*k, s.y1+(s.y2-s.y1)*k, Math.sign(s.x2-s.x1)]; }
  }
  const s=path.segs[path.segs.length-1]; return [s.x2, s.y2, 0];
}

export const buildable = (c,r) => c>=0 && c<COLS && r>=0 && r<ROWS-1 && !path.cells.has(c+','+r);
