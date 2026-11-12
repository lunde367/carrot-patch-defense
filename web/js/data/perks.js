// Garden Shed: permanent upgrades bought with stars.
// Every upgrade has several tiers: the first is cheap and each one after costs a little more,
// so players can try a bit of everything early and specialise later. The whole Shed costs about
// 110 stars, close to the 108 the levels give, so stars stay useful to the end.
// (The first tiers match the original Shed exactly, so level tuning still holds.)
const V = {   // what each tier gives
  pouch:[15,30,45,55,65], fence:[2,4,5], thumb:[4,8,11,14], reach:[5,10,14], harvest:[10,20,28,35], head:[2,3],
  formula:[20,40,60,75], nozzle:[20,40,55], refill:[30,50,60], gentle:[50,80],
  fmix:[45,55,65], flong:[12,14,16], fbin:[15,30],
  heirloom:[20,40,60], roots:[2,4], sprouts:[4,7,10],
};
export const PERKS = [
  { id:'pouch',   name:'Seed Pouch',     costs:[1,2,3,4,5], desc:t=>`Start every level with +${V.pouch[t]} seeds.` },
  { id:'fence',   name:'Sturdy Fence',   costs:[2,3,4],     desc:t=>`The fence stops the first ${V.fence[t]} pests that get through each level.` },
  { id:'thumb',   name:'Green Thumb',    costs:[2,3,4,5],   desc:t=>`Defenders and upgrades cost ${V.thumb[t]}% less.` },
  { id:'reach',   name:'Long Reach',     costs:[2,4,5],     desc:t=>`All defenders reach ${V.reach[t]}% farther.` },
  { id:'harvest', name:'Bigger Harvest', costs:[1,2,3,4],   desc:t=>`Squashed pests drop ${V.harvest[t]}% more seeds.` },
  { id:'head',    name:'Head Start',     costs:[6,8],       desc:t=>`Your first Carrot Bunny each level is planted already at level ${V.head[t]}.` },
  // Sprayer upgrades (shown once the Sprayer has been introduced)
  { id:'formula', name:'Stronger Formula', spray:true, costs:[1,1,2,3], desc:t=>`The spray is ${V.formula[t]}% stronger, enough to beat some resistance.` },
  { id:'nozzle',  name:'Wider Nozzle',     spray:true, costs:[1,2,3],   desc:t=>`The spray circle is ${V.nozzle[t]}% wider.` },
  { id:'refill',  name:'Quick Refill',     spray:true, costs:[1,2,3],   desc:t=>`The Sprayer refills ${V.refill[t]}% faster.` },
  { id:'gentle',  name:'Gentle Formula',   spray:true, costs:[1,1],     desc:t=>`Your plants wilt ${V.gentle[t]}% shorter in the spray.` },
  // Compost upgrades (shown once the Compost has been introduced)
  { id:'fmix',    name:'Rich Mix',       fert:true, costs:[1,2,3], desc:t=>`Compost makes defenders work ${V.fmix[t]}% faster (from 35%).` },
  { id:'flong',   name:'Deep Mulch',   fert:true, costs:[1,2,3], desc:t=>`Compost lasts ${V.flong[t]} seconds (from 10).` },
  { id:'fbin',    name:'Second Bin',    fert:true, costs:[2,3],   desc:t=>`Compost is ready again ${V.fbin[t]}% sooner.` },
  // After the story: bought with stars from the Endless Garden (shown once the story is finished)
  { id:'heirloom', name:'Heirloom Seeds', post:true, costs:[2,3,4], desc:t=>`Start every level with another +${V.heirloom[t]} seeds.` },
  { id:'roots',    name:'Deep Roots',     post:true, costs:[3,4],   desc:t=>`Every garden has ${V.roots[t]} more crops to lose.` },
  { id:'sprouts',  name:'Quick Sprouts',  post:true, costs:[2,3,4], desc:t=>`All defenders work ${V.sprouts[t]}% faster, all the time.` },
];

// Owned tiers → the numbers the game uses.
export function perkValues(owned = {}){
  const n = id => owned[id] || 0, at = (id, base) => n(id) ? V[id][n(id)-1] : base;
  return {
    seeds:    at('pouch', 0) + at('heirloom', 0),
    lives:    at('roots', 0),                 // extra crops
    rateMul:  1 + at('sprouts', 0)/100,
    fence:    at('fence', 0),                 // pests the fence stops before any crop is eaten
    costMul:  1 - at('thumb', 0)/100,
    rangeMul: 1 + at('reach', 0)/100,
    rewardMul:1 + at('harvest', 0)/100,
    headLv:   n('head') ? V.head[n('head')-1]-1 : 0,   // first bunny of the level starts at this upgrade level
    sprayDmg:      1 + at('formula', 0)/100,
    sprayRadius:   1 + at('nozzle', 0)/100,
    sprayRecharge: 1 - at('refill', 0)/100,
    sprayWilt:     1 - at('gentle', 0)/100,
    fertBoost:     1 + at('fmix', 35)/100,
    fertTime:      at('flong', 10),
    fertRecharge:  1 - at('fbin', 0)/100,
  };
}
export const NO_PERKS = perkValues({});
// Everything owned (test mode plays with this).
export const ALL_PERKS = Object.fromEntries(PERKS.filter(p => !p.post).map(p => [p.id, p.costs.length]));

export const PRODUCTS = { removeAds:'remove_ads' };
