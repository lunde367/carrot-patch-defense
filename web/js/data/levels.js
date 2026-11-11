// Board size in tiles, waves per level, and every chapter/level.
// pool entries: [pest, first wave it appears, weight, optional "grows up at this fraction of the path"]
export const COLS = 9, ROWS = 14, WAVES = 8;   // WAVES is the standard level length; a level can set its own `waves`

// The story's four parts. A part's name stays hidden until the player reaches it, so the turn
// in the story is discovered, not announced. `tint` colors its heading on the home screen.
export const PARTS = [
  { n:1, name:'The Backyard',         tint:'#5f9a45' },
  { n:2, name:'The Long Hot Summer',  tint:'#c29a3a' },
  { n:3, name:'The Dry Years',        tint:'#9a7a5a' },
  { n:4, name:'The First Rain',       tint:'#4f9a8a', before:'Three seasons later…' },
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
    act:2, mood:'off', greenhouse:true, heat:[3,6], road:[.8,1], levels:[
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
    act:2, mood:'off', swarm:[4,7], road:[.65,1], levels:[
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
    act:2, mood:'off', drought:true, road:[.5,1], levels:[
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
  { id:'dust', name:'Dust Bowl Farm', crop:'wheat', cropPlural:'wheat', pests:'Dust beetles & sand fleas', grass:['#cdb88c','#c3ae82'],
    act:3, mood:'withered', drought:true, road:[.35,1], levels:[
    { name:'Topsoil', season:'spring', boss:'dustdevil', mirrorOf:9,
      pool:[['sandflea',1,3],['dustgrub',2,2,.5]],
      intro:'The wind took the topsoil. Plant defenders need water: a Rain Barrel keeps every plant near it watered.' },
    { name:'Dry Wind', season:'summer', boss:'dustdevil', mirrorOf:10,
      pool:[['sandflea',1,2.5],['dustgrub',1,2,.5],['dustbeetle',3,2]],
      intro:'Sand fleas hop in clouds, and dust beetles wear thick shells.' },
    { name:'Dust Storm', season:'late summer', boss:'dustdevil', waves:10, mirrorOf:11,
      pool:[['sandflea',1,2],['dustbeetle',1,2.5],['dustgrub',2,2,.45]],
      intro:'The sky has gone brown. Something is spinning across the fields: the Dust Devil.' },
  ]},
  { id:'rooftop', name:'Rooftop Garden', crop:'pepper', cropPlural:'peppers', pests:'Rats, pigeons & smog moths', grass:['#aeb29c','#a4a892'],
    act:3, mood:'withered', smog:true, road:[0,1], levels:[
    { name:'Gray Morning', season:'spring', boss:'ratking', mirrorOf:12,
      pool:[['rat',1,3],['pigeon',3,1.5]],
      intro:'The last green in the city is up on the roof. The smog hides fliers: defenders only spot them up close.' },
    { name:'Heavy Air', season:'summer', boss:'bigpidge', mirrorOf:13,
      pool:[['rat',1,2.5],['pigeon',1,2],['smogworm',2,2,.5]],
      intro:'Pigeons with dull, dusty feathers circle the chimneys. Smog worms grow into smog moths.' },
    { name:'The Smog Moth', season:'late summer', boss:'smogqueen', waves:10, mirrorOf:14,
      pool:[['smogworm',1,2.5,.45],['pigeon',1,2],['rat',2,2],['smogmoth',3,1.5]],
      intro:'The air is thick and yellow. Out of it comes the biggest moth anyone has ever seen.' },
  ]},
  { id:'vault', name:'The Last Seed Vault', crop:'seed', cropPlural:'seed packets', pests:'Glowing mutants', grass:['#9c958a','#928b80'],
    act:3, mood:'withered', dark:true, road:[0,1], cracked:true, levels:[
    { name:'Ashes', season:'spring', boss:'mutantmole', mirrorOf:15,
      pool:[['glowslug',1,3],['glowmole',3,1.5]],
      intro:'Nothing grows out here anymore. These are the last seeds. The pests that are left glow in the dark.' },
    { name:'Last Light', season:'summer', boss:'palequeen', mirrorOf:16,
      pool:[['glowslug',1,2],['glowworm',1,2,.5],['glowsnail',3,1.5]],
      intro:'Glowing caterpillars turn into pale moths. Even the snails shine.' },
    { name:'The Blight', season:'late summer', boss:'blight', waves:12, mirrorOf:17,
      pool:[['glowslug',1,2],['glowworm',1,2,.45],['glowsnail',2,1.5],['glowmole',3,1.5]],
      intro:'The Blight is everything the spray left behind. Protect the last seeds. If they make it, the garden can come back.' },
  ]},
  { id:'rain', name:'Rain Garden', crop:'radish', cropPlural:'radishes', pests:'Flood frogs & mud snails', grass:['#9fcc86','#95c27c'],
    act:4, mood:'regrow', rain:[2,4,6], levels:[
    { name:'First Rain', season:'spring', boss:'bullfrog', mirrorOf:1,
      pool:[['puddleslug',1,3],['frog',2,2]],
      intro:'The trees you planted are growing, and the rain is back! Pests slow down in the rain, and every plant gets a drink. No more spraying: the bees are back.' },
    { name:'Puddles', season:'summer', boss:'mudcrab', mirrorOf:2,
      pool:[['puddleslug',1,2.5],['frog',1,2],['mudsnail',3,1.5]],
      intro:'Mud snails have come up out of the puddles, and a Mud Crab is crawling up the creek.' },
    { name:'The Flood', season:'late summer', boss:'snapper', waves:10, rain:[2,4,6,8], mirrorOf:3,
      pool:[['frog',1,2.5],['mudsnail',1,2],['puddleslug',1,2]],
      intro:'The creek has burst its banks. An old snapping turtle rides the flood straight for the radishes.' },
  ]},
  { id:'meadow', name:'Wildflower Meadow', crop:'bloom', cropPlural:'wildflowers', pests:'Old pests, back again', grass:['#a6d888','#9cce7e'],
    act:4, mood:'regrow', levels:[
    { name:'Clover', season:'spring', boss:'chunkycat', mirrorOf:4,
      pool:[['slug',1,2.5],['caterpillar',1,2,.5],['aphid',2,2]],
      intro:'Clover and wildflowers everywhere. The old pests are back, just ordinary ones now. Ladybugs love aphids.' },
    { name:'Bees Again', season:'summer', boss:'mothqueen', mirrorOf:5,
      pool:[['caterpillar',1,2,.5],['mouse',1,2],['snail',3,1.5]],
      intro:'The meadow hums with bees. Put a Bee Hive near your defenders and they’ll work faster.' },
    { name:'Old Friends', season:'late summer', boss:'whiskers', waves:10, mirrorOf:6,
      pool:[['mouse',1,2],['moth',1,2],['snail',2,1.5],['slug',1,2]],
      intro:'Someone you know is coming back for one more try at the garden: Old Whiskers.' },
  ]},
  { id:'newgarden', name:'The New Garden', crop:'pumpkin', cropPlural:'pumpkins', pests:'The Blight’s last remnants', grass:['#9cd68a','#92cc80'],
    act:4, mood:'regrow', levels:[
    { name:'Seedlings Again', season:'spring', boss:'beetleking', mirrorOf:7,
      pool:[['beetle',1,2],['puddleslug',1,2],['glowslug',3,1.5]],
      intro:'The seeds from the vault are in the ground. A few glowing pests are still out there.' },
    { name:'Wild and Green', season:'summer', boss:'giantsnail', mirrorOf:8,
      pool:[['caterpillar',1,2,.5],['jbeetle',1,1.5],['glowworm',2,1.5,.5],['frog',1,1.5]],
      intro:'The garden grows wilder than before: tall grass, a pond, bees on the clover.' },
    { name:'The New Garden', season:'late summer', boss:'blightweak', waves:12, mirrorOf:13,
      pool:[['glowslug',1,2],['glowsnail',2,1.5],['mudsnail',1,1.5],['wingaphid',2,1.5],['frog',1,1.5]],
      intro:'The Blight is weak, but it’s coming one last time. Hold on, and the garden is yours for good.' },
  ]},
];

// Pest toughness per level, in play order (1 = base health). Tuned with the balance check
// (npm run balance) with the Garden Shed upgrades a typical player owns at each level, so the
// three-star rate slopes down from about 90% early to about 25% on Big Dig even for a player who
// never sprays. The Pesticide Sprayer then makes levels easier, a shortcut, never a requirement.
// Pests in the first level of a garden start weak, so those levels need a bigger multiplier.
const TOUGHNESS = [1.15, 2.4, 2.32,   5.2, 2.55, 2.0,   4.8, 2.2, 3.22,   6.45, 5.15, 4.75,   3.95, 5.45, 5.75,   5.35, 4.45, 4.65,
                   5.7, 5.9, 1.7,   3.25, 3.1, 2.85,   5.6, 6.7, 5.9,   13.6, 11.3, 16,   13.8, 8.1, 10.2,   8.05, 5.7, 16.5];

// Flat list of every level in play order, each linked back to its chapter.
export const LEVELS = [];
CHAPTERS.forEach((ch,ci) => ch.levels.forEach((lv,li) => {
  LEVELS.push(Object.assign(lv, { ch, ci, li, gi:LEVELS.length }));
}));
CHAPTERS.forEach(ch => { ch.act = ch.act || 1; if (ch.act===4) ch.noSpray = true; });   // no Sprayer in Part 4
// Some later levels reuse an earlier level's path, flipped left to right.
LEVELS.forEach(l => { if (l.mirrorOf!=null && !l.pts) l.pts = LEVELS[l.mirrorOf].pts.map(([x,y]) => [9-x, y]); });
LEVELS.forEach(l => { l.waves = l.waves || WAVES; });
// Crops to protect: 20 in the cozy first part, 10 from Part 2 on, when things get serious.
LEVELS.forEach(l => { l.lives = l.lives || (l.ch.act>=2 ? 10 : 20); });
LEVELS.forEach(l => { l.hpMul = TOUGHNESS[l.gi] ?? 1+l.gi*.14; });
// How much less spray damage pests take on each level (0 = none, 0.3 = 30% less). Grows through
// the story, the same for every player: rising in Act 2, high in Act 3, fading in Act 4.
const SPRAY_RESIST = [0, 0, 0,   0, 0, 0,   0, 0, 0,   .4, .65, .75,   .6, .7, .75,   .75, .8, .85,
                      .85, .88, .9,   .9, .9, .92,   .92, .94, .95,   .6, .55, .5,   .4, .35, .3,   .25, .2, .2];   // Act 1 (gardens 1-3): the spray works like magic; Act 2 resistance begins
LEVELS.forEach(l => { l.resist = SPRAY_RESIST[l.gi] ?? 0; });
