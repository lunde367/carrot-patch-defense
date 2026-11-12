// Challenge stars: three extra goals on every level, open once the level has been beaten.
// They are checked when a replay is won; nothing is switched off, so the player decides how to try.
import { TYPES } from './towers.js';
import { SPRAY } from './spray.js';
import { FERT } from './fertilizer.js';

const BANNABLE = ['sprinkler','pine','bunny','rose','squirrel','owl'];
export function challengesFor(L){
  const gi=L.gi, big=(L.cols||9)>9, spray=gi>=SPRAY.unlock && L.ch.act<4, fert=gi>=FERT.unlock;
  if (gi===0) return ['perfect','few:4'];
  if (gi===1) return ['perfect','few:6','thrifty:80'];
  const kinds=BANNABLE.filter(k => TYPES[k].unlock<=gi);
  return [
    gi%2 ? `few:${big?9:7}` : `ban:${kinds[(gi>>1)%kinds.length]}`,
    (spray||fert) && gi%3!==0 ? 'noskills' : 'perfect',
    gi%2 ? 'cap2' : 'thrifty:120',
  ];
}
export function challengeText(id, L){
  const [k,v]=id.split(':'), spray=L.gi>=SPRAY.unlock && L.ch.act<4, fert=L.gi>=FERT.unlock;
  switch (k){
    case 'few': return `Win with ${v} defenders or fewer in the garden at once.`;
    case 'ban': return `Win without planting a ${TYPES[v].name}.`;
    case 'perfect': return 'Win without losing a single crop.';
    case 'noskills': return `Win without using ${spray&&fert?'the Sprayer or Compost':spray?'the Sprayer':'Compost'}.`;
    case 'cap2': return 'Win without upgrading any defender to level 3.';
    case 'thrifty': return `Win with ${v} seeds or more left over.`;
  }
  return '';
}
// S is the finished game's state; S.track is what the player did along the way.
export function challengeMet(id, S){
  const [k,v]=id.split(':'), T=S.track;
  switch (k){
    case 'few': return T.peak<=+v;
    case 'ban': return !T.kinds[v];
    case 'perfect': return S.lives>=S.maxLives;
    case 'noskills': return !T.spray && !T.fert;
    case 'cap2': return T.maxLv<2;
    case 'thrifty': return S.seeds>=+v;
  }
  return false;
}
export const CHALLENGE_TOTAL = 36*3 - 1;   // every level has three, except the first (two)
