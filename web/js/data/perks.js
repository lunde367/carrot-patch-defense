// Garden Shed: permanent upgrades bought with stars. The garden upgrades cost 31 stars in all, a
// little more than the 27 you can earn in the first three gardens, so players choose. Sprayer
// upgrades add 10 more. Tuned with npm run balance so each upgrade is worth about the same per star.
export const PERKS = [
  { id:'pouch',   name:'Seed Pouch',     costs:[1,2,3], desc:t=>`Start every level with +${[15,30,45][t]} seeds.` },
  { id:'fence',   name:'Sturdy Fence',   costs:[2,3],   desc:t=>`The fence stops the first ${[2,4][t]} pests that get through each level.` },
  { id:'thumb',   name:'Green Thumb',    costs:[2,3],   desc:t=>`Defenders and upgrades cost ${[4,8][t]}% less.` },
  { id:'reach',   name:'Long Reach',     costs:[2,4],   desc:t=>`All defenders reach ${[5,10][t]}% farther.` },
  { id:'harvest', name:'Bigger Harvest', costs:[1,2],   desc:t=>`Squashed pests drop ${[10,20][t]}% more seeds.` },
  { id:'head',    name:'Head Start',     costs:[6],     desc:()=>`Your first Carrot Bunny each level is planted already at level 2.` },
  // Sprayer upgrades (shown once the Sprayer is unlocked)
  { id:'formula', name:'Stronger Formula', spray:true, costs:[1,1,2], desc:t=>`The Sprayer does ${[40,80,130][t]}% more damage.` },
  { id:'nozzle',  name:'Wider Nozzle',     spray:true, costs:[1,2],   desc:t=>`The spray circle is ${[20,40][t]}% wider.` },
  { id:'refill',  name:'Quick Refill',     spray:true, costs:[1,1],   desc:t=>`The Sprayer refills ${[30,50][t]}% faster.` },
  { id:'gentle',  name:'Gentle Formula',   spray:true, costs:[1,1],   desc:t=>`Your plants wilt ${[50,80][t]}% shorter in the spray.` },
];

// Owned tiers → the numbers the game uses.
export function perkValues(owned = {}){
  const n = id => owned[id] || 0;
  return {
    seeds:   [0,15,30,45][n('pouch')],
    fence:   [0,2,4][n('fence')],          // pests the fence stops before any crop is eaten
    costMul: [1,.96,.92][n('thumb')],
    rangeMul:[1,1.05,1.10][n('reach')],
    rewardMul:[1,1.1,1.2][n('harvest')],
    headStart: n('head') > 0,              // first bunny of the level starts at level 2
    sprayDmg:   [1,1.4,1.8,2.3][n('formula')],
    sprayRadius:[1,1.2,1.4][n('nozzle')],
    sprayRecharge:[1,.7,.5][n('refill')],
    sprayWilt:  [1,.5,.2][n('gentle')],
  };
}
export const NO_PERKS = perkValues({});

export const REWARDS = { retrySeeds:60 };
export const PRODUCTS = { removeAds:'remove_ads' };
