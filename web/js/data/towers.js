// Defender stats. Each array is [level 1, level 2, level 3]; `up` is the cost of the next upgrade.
// unlock: the level (0 = Seedlings, 1 = Leafy Heads, …) where the defender first becomes available.
export const TYPES = {
  bunny:{name:'Carrot Bunny',unlock:0,cost:50,up:[55,95],range:[2.2,2.5,2.8],rate:[1.1,1.4,1.7],dmg:[7,11,16],
    desc:'Tosses carrots at the pest closest to your crops.'},
  rose:{name:'Thorny Rose',unlock:3,cost:55,up:[55,90],range:[2.2,2.4,2.7],rate:[.8,.95,1.1],dmg:[5,8,12],multi:[3,4,5],
    desc:'Fires thorns at several pests at once.'},
  squirrel:{name:'Squirrel',unlock:4,cost:70,up:[70,115],range:[2.4,2.6,2.9],rate:[1.8,2.3,2.8],dmg:[4,6,9],bounce:[1,2,2],
    desc:'Rapid-fire acorns that bounce to the next pest.'},
  sprinkler:{name:'Sprinkler',unlock:0,cost:55,up:[60,100],range:[1.8,2.0,2.2],rate:[1,1.1,1.3],dmg:[3,5,8],slow:[1.4,1.8,2.2],ground:true,
    desc:'Soaks and slows every crawling pest nearby. Can’t reach fliers.'},
  pine:{name:'Pine Tree',unlock:1,cost:75,up:[75,120],range:[3,3.3,3.6],rate:[.55,.65,.75],dmg:[14,22,36],splash:[.9,1,1.15],ground:true,
    desc:'Lobs pine cones that bonk every crawling pest in an area. Great against armor. Can’t hit fliers.'},
  owl:{name:'Night Owl',unlock:5,cost:90,up:[90,140],range:[3.8,4.2,4.7],rate:[.55,.65,.8],dmg:[32,52,85],
    desc:'Long-range feather strike on the toughest pest, flying or not.'},
  scarecrow:{name:'Scarecrow',unlock:15,cost:65,up:[65,105],range:[2,2.3,2.6],rate:[.5,.6,.7],push:[.9,1.2,1.5],
    desc:'Scares flying pests back up the path. Doesn’t hurt anything, so pair it with defenders that do.'},
  sunflower:{name:'Sunflower',unlock:2,cost:60,up:[70,110],income:[10,18,28],
    desc:'Drops extra seeds after every wave you clear.'}
};

// Tray order: the order defenders unlock in.
export const TRAY = Object.keys(TYPES).sort((a,b)=>TYPES[a].unlock-TYPES[b].unlock);

export function statsText(t, perks){
  const T=TYPES[t.type], l=t.lv, R=v=>+(v*(perks?perks.rangeMul:1)).toFixed(1);
  switch (t.type){
    case 'sunflower': return `+${T.income[l]} seeds after each wave`;
    case 'scarecrow': return `Scares fliers back ${T.push[l]} tiles · Range ${R(T.range[l])} · every ${+(1/T.rate[l]).toFixed(1)}s`;
    case 'rose': return `Damage ${T.dmg[l]} · Hits ${T.multi[l]} pests · Range ${R(T.range[l])}`;
    case 'pine': return `Area damage ${T.dmg[l]} · Range ${R(T.range[l])} · ${T.rate[l]} per sec`;
    case 'squirrel': return `Damage ${T.dmg[l]} · ${T.rate[l]} per sec · Bounces ${T.bounce[l]}×`;
    case 'sprinkler': return `Splash ${T.dmg[l]} · Range ${R(T.range[l])} · Slows ${T.slow[l]}s`;
    default: return `Damage ${T.dmg[l]} · Range ${R(T.range[l])} · ${T.rate[l]} per sec`;
  }
}
