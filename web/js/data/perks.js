// Garden Shed: permanent upgrades bought with stars. Costs add up to 27, the most stars
// you can earn (3 stars × 9 levels), so a perfect player can own everything.
export const PERKS = [
  { id:'pouch',   name:'Seed Pouch',     costs:[1,2,3], desc:t=>`Start every level with +${[20,40,60][t]} seeds.` },
  { id:'fence',   name:'Sturdy Fence',   costs:[2,3],   desc:t=>`Protect ${[3,6][t]} extra crops each level.` },
  { id:'thumb',   name:'Green Thumb',    costs:[2,3],   desc:t=>`Defenders and upgrades cost ${[5,10][t]}% less.` },
  { id:'reach',   name:'Long Reach',     costs:[2,4],   desc:t=>`All defenders reach ${[8,16][t]}% farther.` },
  { id:'harvest', name:'Bigger Harvest', costs:[1,2],   desc:t=>`Squashed pests drop ${[10,20][t]}% more seeds.` },
  { id:'head',    name:'Head Start',     costs:[2],     desc:()=>`Carrot Bunnies are planted already at level 2.` },
];

// Owned tiers → the numbers the game uses.
export function perkValues(owned = {}){
  const n = id => owned[id] || 0;
  return {
    seeds:   [0,20,40,60][n('pouch')],
    lives:   [0,3,6][n('fence')],
    costMul: [1,.95,.9][n('thumb')],
    rangeMul:[1,1.08,1.16][n('reach')],
    rewardMul:[1,1.1,1.2][n('harvest')],
    bunnyLv: n('head') ? 1 : 0,
  };
}
export const NO_PERKS = perkValues({});

export const REWARDS = { retrySeeds:60 };
export const PRODUCTS = { removeAds:'remove_ads' };
