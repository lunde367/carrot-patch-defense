// Board size in tiles, waves per level, and every chapter/level.
// pool entries: [pest, first wave it appears, weight, optional "grows up at this fraction of the path"]
export const COLS = 9, ROWS = 14, WAVES = 8;   // WAVES is the standard level length; a level can set its own `waves`

// The story's four parts. A part's name stays hidden until the player reaches it, so the turn
// in the story is discovered, not announced. `tint` colors its heading on the home screen.
export const PARTS = [
  { n:1, name:'The Backyard',         tint:'#5f9a45' },
  { n:2, name:'The Long Hot Summer',  tint:'#c29a3a' },
  { n:3, name:'The Dry Years',        tint:'#9a7a5a' },
  { n:4, name:'The First Rain',       tint:'#4f9a8a' },
];

export const CHAPTERS = [
  { id:'cabbage', name:'Cabbage Patch', crop:'cabbage', cropPlural:'cabbages', pests:'Slugs, snails & beetles', grass:['#a6cf8a','#9ec781'], levels:[
    { name:'Seedlings', season:'spring', boss:'fatslug',
      pts:[[1.5,-0.6],[1.5,2.5],[7.5,2.5],[7.5,5.5],[1.5,5.5],[1.5,9.5],[6.5,9.5],[6.5,13.2]],
      pool:[['babyslug',1,3],['fleagrub',2,2],['slug',4,1.5]],
      intro:'Baby slugs and flea beetle grubs are after the seedlings.' },
    { name:'Leafy Heads', season:'summer', boss:'giantsnail',
      pts:[[7.5,-0.6],[7.5,1.5],[2.5,1.5],[2.5,4.5],[5.5,4.5],[5.5,7.5],[1.5,7.5],[1.5,10.5],[4.5,10.5],[4.5,13.2]],
      pool:[['slug',1,3],['fleagrub',1,2,.5],['snail',2,2],['fleabeetle',4,1.5]],
      intro:'Snails wear armor, so small hits barely dent them. Grubs grow into hopping flea beetles halfway down.' },
    { name:'Harvest Time', waves:10, season:'late summer', boss:'beetleking',
      pts:[[4.5,-0.6],[4.5,1.5],[1.5,1.5],[1.5,4.5],[7.5,4.5],[7.5,7.5],[2.5,7.5],[2.5,10.5],[7.5,10.5],[7.5,13.2]],
      pool:[['snail',1,2],['fleabeetle',1,2],['bananaslug',2,2],['beetle',3,2]],
      intro:'Banana slugs and shield beetles are out in force. The Beetle King is coming.' },
  ]},
  { id:'strawberry', name:'Strawberry Bed', crop:'strawberry', cropPlural:'strawberries', pests:'Caterpillars & moths', grass:['#9ccc8f','#93c386'], levels:[
    { name:'First Blossoms', season:'spring', boss:'chunkycat',
      pts:[[6.5,-0.6],[6.5,3.5],[1.5,3.5],[1.5,6.5],[7.5,6.5],[7.5,10.5],[3.5,10.5],[3.5,13.2]],
      pool:[['inchworm',1,3],['caterpillar',2,2]],
      intro:'Inchworms and caterpillars are munching the blossoms.' },
    { name:'Ripening', season:'summer', boss:'hornworm',
      pts:[[1.5,-0.6],[1.5,1.5],[4.5,1.5],[4.5,4.5],[7.5,4.5],[7.5,8.5],[1.5,8.5],[1.5,11.5],[5.5,11.5],[5.5,13.2]],
      pool:[['inchworm',1,1.5],['caterpillar',1,3,.55],['fuzzy',2,2]],
      intro:'Fuzzy caterpillars are armored by their hair. Others spin cocoons and fly out as moths!' },
    { name:'Berry Picking', waves:10, season:'late summer', boss:'mothqueen',
      pts:[[3.5,-0.6],[3.5,2.5],[7.5,2.5],[7.5,4.5],[1.5,4.5],[1.5,7.5],[6.5,7.5],[6.5,10.5],[2.5,10.5],[2.5,13.2]],
      pool:[['moth',1,2.5],['fuzzy',1,1.5],['caterpillar',2,1.5,.35],['hawkmoth',3,1.5]],
      intro:'The air is full of moths. Sprinklers and pine trees can’t reach fliers.' },
  ]},
  { id:'carrot', name:'Carrot Rows', crop:'carrot', cropPlural:'carrots', pests:'Mice, moles & gophers', grass:['#b3d18a','#aac981'], levels:[
    { name:'Sprouting', season:'spring', boss:'bigmouse',
      pts:[[4.5,-0.6],[4.5,3.5],[1.5,3.5],[1.5,7.5],[7.5,7.5],[7.5,11.5],[4.5,11.5],[4.5,13.2]],
      pool:[['babymouse',1,3],['mouse',2,2]],
      intro:'Baby mice are scurrying in. They’re quick but fragile.' },
    { name:'Deep Roots', season:'summer', boss:'molemom',
      pts:[[1.5,-0.6],[1.5,4.5],[4.5,4.5],[4.5,1.5],[7.5,1.5],[7.5,9.5],[2.5,9.5],[2.5,13.2]],
      pool:[['mouse',1,3],['vole',2,2],['mole',3,1.5]],
      intro:'Voles are fast. Moles tunnel underground, where your towers can’t hit them.' },
    { name:'Big Dig', waves:10, season:'late summer', boss:'gopherboss',
      pts:[[7.5,-0.6],[7.5,1.5],[1.5,1.5],[1.5,4.5],[7.5,4.5],[7.5,7.5],[1.5,7.5],[1.5,10.5],[7.5,10.5],[7.5,13.2]],
      pool:[['vole',1,2.5],['mole',1,2],['gopher',3,1.5]],
      intro:'Gophers are the toughest diggers yet, and the Grumpy Gopher leads them.' },
  ]},
  // ---- Act 2: Something's Off ----
  { id:'tomato', name:'Tomato Greenhouse', crop:'tomato', cropPlural:'tomatoes', pests:'Whiteflies & stink bugs', grass:['#c3cb88','#b9c17e'],
    act:2, mood:'off', greenhouse:true, heat:[3,6], levels:[
    { name:'Hothouse', season:'spring', boss:'sapsucker',
      pts:[[2.5,-0.6],[2.5,2.5],[6.5,2.5],[6.5,5.5],[2.5,5.5],[2.5,8.5],[6.5,8.5],[6.5,11.5],[3.5,11.5],[3.5,13.2]],
      pool:[['whitenymph',1,3,.5],['stinknymph',2,2,.6],['whitefly',4,1.5]],
      intro:'It’s too hot outside, so the tomatoes moved into the greenhouse. Whitefly nymphs hatch into fliers halfway down.' },
    { name:'Vine Rows', season:'summer', boss:'shieldbug',
      pts:[[7.5,-0.6],[7.5,3.5],[4.5,3.5],[4.5,1.5],[1.5,1.5],[1.5,6.5],[7.5,6.5],[7.5,10.5],[1.5,10.5],[1.5,13.2]],
      pool:[['whitefly',1,3],['stinknymph',1,2,.5],['stinkbug',3,2]],
      intro:'Stink bugs wear tough shells. Watch for heat waves: only defenders near a Sprinkler stay cool.' },
    { name:'Red Harvest', waves:10, heat:[3,6,9], season:'late summer', boss:'baron',
      pts:[[5.5,-0.6],[5.5,1.5],[1.5,1.5],[1.5,4.5],[7.5,4.5],[7.5,7.5],[4.5,7.5],[4.5,10.5],[7.5,10.5],[7.5,13.2]],
      pool:[['whitefly',1,2.5],['stinkbug',1,2],['bigstink',3,2]],
      intro:'The biggest stink bugs shrug off the spray. The Stink Bug Baron is coming for the harvest.' },
  ]},
  { id:'apple', name:'Apple Orchard', crop:'apple', cropPlural:'apples', pests:'Aphids & invasive beetles', grass:['#b2c67c','#a8bc72'],
    act:2, mood:'off', swarm:[4,7], levels:[
    { name:'Blossom Time', season:'spring', boss:'aphidmother',
      pts:[[6.5,-0.6],[6.5,1.5],[1.5,1.5],[1.5,4.5],[5.5,4.5],[5.5,7.5],[2.5,7.5],[2.5,10.5],[6.5,10.5],[6.5,13.2]],
      pool:[['aphid',1,4,.5],['jbeetle',3,1.5]],
      intro:'The trees are in bloom, but there isn’t a bee in sight. Aphids come in booms: watch for swarms on waves 4 and 7.' },
    { name:'Green Apples', season:'summer', boss:'copperking',
      pts:[[2.5,-0.6],[2.5,2.5],[7.5,2.5],[7.5,5.5],[4.5,5.5],[4.5,8.5],[1.5,8.5],[1.5,11.5],[5.5,11.5],[5.5,13.2]],
      pool:[['aphid',1,3,.5],['jbeetle',1,2],['longhorn',4,1.2]],
      intro:'Beetles from far away have found the orchard. Their shiny shells shrug off small hits.' },
    { name:'Small Harvest', waves:10, swarm:[4,7,9], season:'late summer', boss:'theswarm',
      pts:[[4.5,-0.6],[4.5,1.5],[7.5,1.5],[7.5,4.5],[1.5,4.5],[1.5,7.5],[7.5,7.5],[7.5,10.5],[2.5,10.5],[2.5,13.2]],
      pool:[['aphid',1,3,.4],['wingaphid',2,2],['longhorn',2,1.5],['jbeetle',1,1.5]],
      intro:'The apples came in small this year. Something huge is buzzing over the hill: The Swarm.' },
  ]},
  { id:'corn', name:'Corn Field', crop:'corn', cropPlural:'corn', pests:'Locusts & rootworms', grass:['#c9c486','#bfba7c'],
    act:2, mood:'off', drought:true, levels:[
    { name:'Knee High', season:'spring', boss:'grandhopper',
      pts:[[7.5,-0.6],[7.5,2.5],[3.5,2.5],[3.5,5.5],[7.5,5.5],[7.5,8.5],[1.5,8.5],[1.5,11.5],[4.5,11.5],[4.5,13.2]],
      pool:[['hopperling',1,3,.55],['rootworm',2,2]],
      intro:'No rain for weeks. Plant defenders (Roses, Sunflowers, Pine Trees) need a Sprinkler nearby or they wilt in the drought.' },
    { name:'Dry Spell', season:'summer', boss:'rootking',
      pts:[[1.5,-0.6],[1.5,4.5],[4.5,4.5],[4.5,1.5],[7.5,1.5],[7.5,7.5],[3.5,7.5],[3.5,10.5],[6.5,10.5],[6.5,13.2]],
      pool:[['rootworm',1,3,.5],['locust',2,2],['hopperling',1,1.5,.5]],
      intro:'Rootworms tunnel under the cracked ground and come up as beetles. Locusts are on the wing.' },
    { name:'Dust and Tassels', waves:12, season:'late summer', boss:'locustking',
      pts:[[5.5,-0.6],[5.5,1.5],[1.5,1.5],[1.5,5.5],[6.5,5.5],[6.5,8.5],[2.5,8.5],[2.5,11.5],[7.5,11.5],[7.5,13.2]],
      pool:[['locust',1,3],['cornbeetle',1,1.5],['rootworm',2,2]],
      intro:'The sky goes dark with locusts. The spray barely slows them now. The Locust King is coming.' },
  ]},
];

// Pest toughness per level, in play order (1 = base health). Tuned with the balance check
// (npm run balance) with the Garden Shed upgrades a typical player owns at each level, so the
// three-star rate slopes down from about 90% early to about 25% on Big Dig even for a player who
// never sprays. The Pesticide Sprayer then makes levels easier, a shortcut, never a requirement.
// Pests in the first level of a garden start weak, so those levels need a bigger multiplier.
const TOUGHNESS = [1.15, 2.8, 2.32,   5.2, 2.55, 2.0,   4.8, 2.2, 3.22,   6.45, 5.15, 4.75,   3.95, 5.45, 5.75,   5.35, 4.45, 4.65];

// Flat list of every level in play order, each linked back to its chapter.
export const LEVELS = [];
CHAPTERS.forEach((ch,ci) => ch.levels.forEach((lv,li) => {
  LEVELS.push(Object.assign(lv, { ch, ci, li, gi:LEVELS.length }));
}));
CHAPTERS.forEach(ch => { ch.act = ch.act || 1; });
LEVELS.forEach(l => { l.waves = l.waves || WAVES; });
// Crops to protect: 20 in the cozy first part, 10 from Part 2 on, when things get serious.
LEVELS.forEach(l => { l.lives = l.lives || (l.ch.act>=2 ? 10 : 20); });
LEVELS.forEach(l => { l.hpMul = TOUGHNESS[l.gi] ?? 1+l.gi*.14; });
// How much less spray damage pests take on each level (0 = none, 0.3 = 30% less). Grows through
// the story, the same for every player: rising in Act 2, high in Act 3, fading in Act 4.
const SPRAY_RESIST = [0, 0, 0,   0, 0, 0,   0, 0, 0,   .4, .65, .75,   .6, .7, .75,   .75, .8, .85];   // Act 1 (gardens 1-3): the spray works like magic; Act 2 resistance begins
LEVELS.forEach(l => { l.resist = SPRAY_RESIST[l.gi] ?? 0; });
