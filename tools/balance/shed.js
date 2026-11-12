// What Garden Shed upgrades a player would realistically own when they reach a level.
import { PERKS } from '../../web/js/data/perks.js';
import { FERT } from '../../web/js/data/fertilizer.js';
import { SPRAY } from '../../web/js/data/spray.js';
import { SKILLS, SKILL_COSTS } from '../../web/js/data/skills.js';
import { TYPES } from '../../web/js/data/towers.js';

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
    const options = PERKS.filter(p => !p.post && (!p.spray || gi > SPRAY.unlock) && (!p.fert || gi > FERT.unlock)).map(p => ({ p, tier:owned[p.id]||0 }))
      .filter(o => o.tier < o.p.costs.length && o.p.costs[o.tier] <= stars)
      .sort((a,b) => a.p.costs[a.tier] - b.p.costs[b.tier]);
    if (!options.length) break;
    const { p, tier } = options[0];
    stars -= p.costs[tier]; owned[p.id] = tier+1;
  }
  return { owned, left:stars };
}

export const describe = owned => PERKS.filter(p=>owned[p.id]).map(p=>`${p.name} ${owned[p.id]}/${p.costs.length}`).join(', ') || 'none';

// Defender skills a player would own at level `gi`, given how many challenge stars they earn per level beaten
// (0 = never replays for challenges, 1 = picks up the easy ones, 3 = gets nearly all of them).
// They buy the cheapest next step, fighters first, so skills spread across the defenders they use.
export const chalBefore = (gi, perLevel) => Math.floor(Math.min(gi, 36) * perLevel);
const ORDER = ['bunny','pine','rose','sprinkler','squirrel','owl','ladybug','sunflower','hive','barrel','scarecrow'];
export function skillShop(stars, gi = 99){
  const owned = {};
  for (;;){
    const options = [];
    for (const type of ORDER){ if (TYPES[type].unlock > gi) continue;
      for (const br of SKILLS[type]){ const n = (owned[type]||{})[br.id] || 0; if (n < SKILL_COSTS.length && SKILL_COSTS[n] <= stars) options.push({ type, br:br.id, n, cost:SKILL_COSTS[n], rank:ORDER.indexOf(type) }); } }
    if (!options.length) break;
    options.sort((a,b) => a.cost-b.cost || a.rank-b.rank);
    const o = options[0]; stars -= o.cost; (owned[o.type] || (owned[o.type] = {}))[o.br] = o.n+1;
  }
  return owned;
}
