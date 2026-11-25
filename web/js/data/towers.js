// Defender stats. Each array is [level 1, level 2, level 3]; `up` is the cost of the next upgrade.
// unlock: the level (0 = Seedlings, 1 = Leafy Heads, …) where the defender first becomes available.
export const TYPES = {
  bunny:{name:'Carrot Bunny',unlock:0,cost:50,up:[55,95,150],range:[2.2,2.5,2.8,3],rate:[1.1,1.4,1.7,2],dmg:[7,11,16,22],
    desc:'Tosses carrots at the pest closest to your crops.',
    sup:{name:'Golden Bunny', short:'Golden carrots burst on every pest close by', desc:'Golden carrots that burst when they land, hitting every pest close by.'}},
  rose:{name:'Thorny Rose',unlock:3,cost:55,up:[55,90,145],range:[2.4,2.6,2.9,3.2],rate:[.9,1.05,1.2,1.4],dmg:[5,8,12,16],multi:[3,4,5,7],
    desc:'Fires thorns at several pests at once, fliers first. Thorns hit flying pests twice as hard, so roses are your best answer to moths and birds.',
    sup:{name:'Crimson Rose', short:'×3 on fliers · Spray and Fertilizer can’t wilt it', desc:'Thorns hit fliers three times as hard, and the Sprayer and Fertilizer can’t wilt it.'}},
  squirrel:{name:'Squirrel',unlock:4,cost:70,up:[70,115,180],range:[2.4,2.6,2.9,3.2],rate:[1.8,2.3,2.8,3.2],dmg:[4,6,9,12],bounce:[1,2,2,4],
    desc:'Rapid-fire acorns that bounce to the next pest.',
    sup:{name:'Honey Squirrel', short:'Honey acorns bounce farther and slow pests', desc:'Dips every acorn in honey: they bounce to two more pests and leave each one sticky and slow.'}},
  sprinkler:{name:'Sprinkler',unlock:0,cost:55,up:[60,100,160],range:[1.8,2.0,2.2,2.5],rate:[1,1.1,1.3,1.5],dmg:[3,5,8,12],slow:[1.4,1.8,2.2,2.6],ground:true,
    desc:'Soaks and slows every crawling pest nearby. Can’t reach fliers.',
    sup:{name:'Storm Sprinkler', short:'Soaks fliers too', desc:'A little storm of its own: it soaks and slows flying pests too.'}},
  pine:{name:'Pine Tree',unlock:1,cost:75,up:[75,120,190],range:[3,3.3,3.6,4],rate:[.55,.65,.75,.85],dmg:[14,22,36,48],splash:[.9,1,1.15,1.3],ground:true,
    desc:'Lobs pine cones that bonk every crawling pest in an area. Great against armor. Can’t hit fliers.',
    sup:{name:'Firecone Pine', short:'Cones crack the ground and leave it burning', desc:'Burning cones crack the ground open. Every crawling pest that walks over the fire gets singed.'}},
  owl:{name:'Night Owl',unlock:5,cost:90,up:[90,140,220],range:[3.8,4.2,4.7,5.2],rate:[.55,.65,.8,.9],dmg:[32,52,85,110],
    desc:'Long-range feather strike on the toughest pest, flying or not.',
    sup:{name:'Thunder Owl', short:'Every 5th strike hits 5× as hard', desc:'Every fifth strike is a thunder dive that hits five times as hard.'}},
  scarecrow:{name:'Scarecrow',unlock:15,cost:65,up:[65,105,165],range:[4,4.5,5,5.5],rate:[.5,.6,.7,.85],dmg:[3,5,8,12],push:[.9,1.2,1.5,1.8],line:true,
    desc:'Throws crows in a straight line. Each crow pecks every pest it flies past and knocks it back up the path (fliers get knocked farther). Tap it, then Turn, to point it another way.',
    sup:{name:'Crow King', short:'Every 4th crow carries a pest back to the start', desc:'Every fourth crow is a big one that grabs a pest and carries it all the way back to the start. Bosses are too heavy.'}},
  barrel:{name:'Rain Barrel',unlock:18,cost:45,up:[45,70,110],range:[2.2,2.6,3,3.4],water:[.06,.09,.12,.15],support:true,
    desc:'Waters every plant defender in reach. Well-watered plants work a little faster, and drought and heat can’t slow them. Doesn’t fight.',
    sup:{name:'Rain Cloud', short:'Pests in reach walk 25% slower', desc:'A rain cloud hangs over it. Every pest in its reach slogs through the puddles 25% slower.'}},
  hive:{name:'Bee Hive',unlock:31,cost:80,up:[80,120,190],range:[1.9,2.2,2.5,2.8],boost:[1.3,1.45,1.6,1.7],honey:[6,10,15,20],support:true,
    desc:'The bees are back! Every defender the bees reach works a lot faster, and the hive makes honey seeds after each wave. The hive itself doesn’t fight.',
    sup:{name:'Queen’s Hive', short:'Bees sting pests in reach', desc:'The queen sends out guards: bees sting every pest in the hive’s reach.'}},
  cow:{name:'Dairy Cow',unlock:30,cost:85,up:[80,125,200],range:[2.6,2.9,3.2,3.5],rate:[.45,.52,.6,.68],dmg:[10,16,26,34],splash:[.75,.85,.95,1.05],pile:[6,10,16,20],ground:true,
    desc:'Flings cow pats! Each one splats every crawling pest in an area and leaves a stinky pile that hurts and slows pests walking through it. Can’t hit fliers.',
    sup:{name:'Prize Cow', short:'Huge piles that last twice as long', desc:'Blue-ribbon pats: the stinky piles are much bigger and last twice as long.'}},
  sunflower:{name:'Sunflower',unlock:2,cost:60,up:[70,110,175],income:[10,18,28,38],
    desc:'Drops extra seeds after every wave you clear.',
    sup:{name:'Giant Sunflower', short:'Defenders next to it work 12% faster', desc:'So big and bright that defenders right next to it work faster in its light.'}}
};
// Super level (the 4th): opened per defender with challenge stars, after both of its skills are full.
export const SUPER_LV = 3;
// The Super numbers for the new powers.
export const SUPER = { burst:.6, burstR:.75, roseAir:3, honeySlow:1.2, fireR:.75, fireTime:4, fireDps:12, thunderEvery:5, thunder:5, crowEvery:4,
  pileWide:1.4, pileLong:2, sunReach:1.5, sunBoost:1.12, rainSlow:.75, stingDps:8 };

// Tray order: the order defenders unlock in.
export const TRAY = Object.keys(TYPES).sort((a,b)=>TYPES[a].unlock-TYPES[b].unlock);

export function statsText(t, perks){
  const T=TYPES[t.type], l=t.lv, R=v=>+(v*(perks?perks.rangeMul:1)).toFixed(1);
  return baseStats(t, T, l, R) + (l>=SUPER_LV ? ` · ${T.sup.short}` : '');
}
function baseStats(t, T, l, R){
  switch (t.type){
    case 'sunflower': return `+${T.income[l]} seeds after each wave`;
    case 'barrel': return `Plants in reach work ${Math.round(T.water[l]*100)}% faster · Range ${R(T.range[l])}`;
    case 'hive': return `Defenders in reach work ${Math.round((T.boost[l]-1)*100)}% faster · +${T.honey[l]} honey seeds a wave · Range ${R(T.range[l])}`;
    case 'cow': return `Splat ${T.dmg[l]} · Stinky pile ${T.pile[l]}/s · Range ${R(T.range[l])}`;
    case 'scarecrow': return `Crow ${T.dmg[l]} · Knocks pests back ${T.push[l]} tiles · Reaches ${R(T.range[l])} tiles in a line · every ${+(1/T.rate[l]).toFixed(1)}s`;
    case 'rose': return `Damage ${T.dmg[l]} (×${l>=SUPER_LV?SUPER.roseAir:2} on fliers) · Hits ${T.multi[l]} pests · Range ${R(T.range[l])}`;
    case 'pine': return `Area damage ${T.dmg[l]} · Range ${R(T.range[l])} · ${T.rate[l]} per sec`;
    case 'squirrel': return `Damage ${T.dmg[l]} · ${T.rate[l]} per sec · Bounces ${T.bounce[l]}×`;
    case 'sprinkler': return `Splash ${T.dmg[l]} · Range ${R(T.range[l])} · Slows ${T.slow[l]}s`;
    default: return `Damage ${T.dmg[l]} · Range ${R(T.range[l])} · ${T.rate[l]} per sec`;
  }
}
