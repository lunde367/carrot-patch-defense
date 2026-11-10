// What Garden Shed upgrades a player would realistically own when they reach a level.
import { PERKS } from '../../web/js/data/perks.js';
import { SPRAY } from '../../web/js/data/spray.js';

// Kinds of player, by how many stars they usually earn per level.
export const PLAYERS = [
  { id:'struggling', name:'Struggling', starsPerLevel:2 },
  { id:'typical', name:'Typical', starsPerLevel:2.5 },
  { id:'perfect', name:'Perfectionist', starsPerLevel:3 },
];

// Stars earned before reaching level `gi` (levels are played in order).
export const starsBefore = (gi, starsPerLevel) => Math.floor(gi * starsPerLevel);

// Spend stars the way a typical shopper does: always buy the cheapest next tier available,
// so purchases spread across upgrades instead of maxing one.
export function shop(stars, gi = 99){
  const owned = {};
  for (;;){
    const options = PERKS.filter(p => !p.spray || gi > SPRAY.unlock).map(p => ({ p, tier:owned[p.id]||0 }))
      .filter(o => o.tier < o.p.costs.length && o.p.costs[o.tier] <= stars)
      .sort((a,b) => a.p.costs[a.tier] - b.p.costs[b.tier]);
    if (!options.length) break;
    const { p, tier } = options[0];
    stars -= p.costs[tier]; owned[p.id] = tier+1;
  }
  return { owned, left:stars };
}

export const describe = owned => PERKS.filter(p=>owned[p.id]).map(p=>`${p.name} ${owned[p.id]}/${p.costs.length}`).join(', ') || 'none';
