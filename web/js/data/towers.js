// Defender stats. Each array is [level 1, level 2, level 3]; `up` is the cost of the next upgrade.
export const TYPES = {
  bunny:{name:'Carrot Bunny',cost:40,up:[50,90],range:[2.3,2.6,2.9],rate:[1.2,1.5,1.9],dmg:[6,10,16],
    desc:'Tosses carrots at the pest closest to your crops.'},
  rose:{name:'Thorny Rose',cost:50,up:[55,90],range:[2,2.2,2.5],rate:[.8,1,1.2],dmg:[4,6,10],multi:[3,4,5],
    desc:'Fires thorns at several pests at once.'},
  squirrel:{name:'Squirrel',cost:65,up:[65,110],range:[2.5,2.7,3],rate:[2,2.6,3.2],dmg:[4,6,9],bounce:[1,2,2],
    desc:'Rapid-fire acorns that bounce to the next pest.'},
  sprinkler:{name:'Sprinkler',cost:55,up:[60,100],range:[1.6,1.8,2.0],rate:[.9,1,1.2],dmg:[2,4,7],slow:[1.2,1.6,2],ground:true,
    desc:'Soaks and slows every crawling pest nearby. Can’t reach fliers.'},
  pine:{name:'Pine Tree',cost:75,up:[75,120],range:[3,3.3,3.6],rate:[.5,.6,.7],dmg:[12,20,34],splash:[.9,1,1.15],ground:true,
    desc:'Lobs pine cones that bonk every crawling pest in an area. Can’t hit fliers.'},
  owl:{name:'Night Owl',cost:90,up:[90,150],range:[3.6,4,4.5],rate:[.45,.55,.7],dmg:[26,44,75],
    desc:'Long-range feather strike on the toughest pest. Great against armor.'},
  sunflower:{name:'Sunflower',cost:60,up:[70,110],income:[10,18,28],
    desc:'Drops extra seeds after every wave you clear.'}
};

export function statsText(t){
  const T=TYPES[t.type], l=t.lv;
  switch (t.type){
    case 'sunflower': return `+${T.income[l]} seeds after each wave`;
    case 'rose': return `Damage ${T.dmg[l]} · Hits ${T.multi[l]} pests · Range ${T.range[l]}`;
    case 'pine': return `Area damage ${T.dmg[l]} · Range ${T.range[l]} · ${T.rate[l]} per sec`;
    case 'squirrel': return `Damage ${T.dmg[l]} · ${T.rate[l]} per sec · Bounces ${T.bounce[l]}×`;
    case 'sprinkler': return `Splash ${T.dmg[l]} · Range ${T.range[l]} · Slows ${T.slow[l]}s`;
    default: return `Damage ${T.dmg[l]} · Range ${T.range[l]} · ${T.rate[l]} per sec`;
  }
}
