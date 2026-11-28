// Board size in tiles, waves per level, and every chapter/level.
// pool entries: [pest, first wave it appears, weight, optional "grows up at this fraction of the path"]
// The board grid. Most levels are 9 × 14; a bigger level sets its own `cols`/`rows` and gets
// smaller tiles in the same space. COLS/ROWS are live: setGrid() changes them for the level being played.
export let COLS = 9, ROWS = 14;
export function setGrid(c=9, r=14){ COLS = c; ROWS = r; }
export const WAVES = 8;   // the standard level length; a level can set its own `waves`

// The story's four parts. A part's name stays hidden until the player reaches it, so the turn
// in the story is discovered, not announced. `tint` colors its heading on the home screen.
export const PARTS = [
  { n:1, name:'The Backyard',         tint:'#5f9a45' },
  { n:2, name:'The Long Hot Summer',  tint:'#c29a3a' },
  { n:3, name:'The Ruined Years',        tint:'#9a7a5a' },
  { n:4, name:'The First Rain',       tint:'#4f9a8a', before:'Three years later…' },
];

export const CHAPTERS = [
  { id:'cabbage', name:'Cabbage Bed', crop:'cabbage', cropPlural:'cabbages', pests:'Slugs, snails & beetles', grass:['#a6cf8a','#9ec781'], levels:[
    { name:'Seedlings', season:'spring', boss:'fatslug',
      pts:[[1.5,-0.6],[1.5,2.5],[7.5,2.5],[7.5,5.5],[1.5,5.5],[1.5,9.5],[6.5,9.5],[6.5,13.2]],
      pool:[['babyslug',1,3],['fleagrub',2,2],['slug',4,1.5]],
      intro:'Baby slugs and flea beetle grubs are after the seedlings.' },
    { name:'Leafy Heads', season:'summer', boss:'giantsnail', dew:[3,6],
      pts:[[7.5,-0.6],[7.5,1.5],[2.5,1.5],[2.5,4.5],[5.5,4.5],[5.5,7.5],[1.5,7.5],[1.5,10.5],[4.5,10.5],[4.5,13.2]],
      pool:[['slug',1,3],['fleagrub',1,2,.5],['snail',2,2],['fleabeetle',4,1.5]],
      intro:'Snails wear armor, so small hits barely dent them. Grubs grow into hopping flea beetles halfway down.' },
    { name:'Harvest Time', waves:10, season:'late summer', boss:'beetleking', dew:[4,8],
      pts:[[4.5,-0.6],[4.5,1.5],[1.5,1.5],[1.5,4.5],[7.5,4.5],[7.5,7.5],[2.5,7.5],[2.5,10.5],[7.5,10.5],[7.5,13.2]],
      pool:[['snail',1,2],['fleabeetle',1,2],['bananaslug',2,2],['beetle',3,2]],
      intro:'Banana slugs and shield beetles are out in force. Old Ironshell, the biggest beetle in the yard, is coming.' },
  ]},
  { id:'strawberry', name:'Strawberry Bed', crop:'strawberry', cropPlural:'strawberries', pests:'Caterpillars & moths', grass:['#9ccc8f','#93c386'], levels:[
    { name:'First Blossoms', waves:6, season:'spring', boss:'chunkycat',
      pts:[[7.5,-0.6],[7.5,2.5],[5.5,2.5],[5.5,5.5],[3.5,5.5],[3.5,8.5],[1.5,8.5],[1.5,13.2]],   // a short staircase across the bed
      pool:[['inchworm',1,3],['caterpillar',2,2]],
      intro:'Inchworms and caterpillars are munching the blossoms.' },
    { name:'Ripening', season:'summer', boss:'hornworm',
      pts:[[4.5,-0.6],[4.5,6.5],[1.5,6.5],[1.5,3.5],[7.5,3.5],[7.5,9.5],[2.5,9.5],[2.5,13.2]],
      pool:[['inchworm',1,1.5],['caterpillar',1,3,.55],['fuzzy',2,2]],
      intro:'Fuzzy caterpillars are armored by their hair. Others spin cocoons and fly out as moths!' },
    { name:'Berry Picking', waves:10, season:'late summer', boss:'mothqueen',
      lanes:[[[1.5,-0.6],[1.5,3.5],[4.5,3.5],[4.5,7.5],[7.5,7.5],[7.5,10.5],[3.5,10.5],[3.5,13.2]],
             [[7.5,-0.6],[7.5,3.5],[4.5,3.5],[4.5,7.5],[7.5,7.5],[7.5,10.5],[3.5,10.5],[3.5,13.2]]],   // two ways in that meet early
      pool:[['moth',1,2.5],['fuzzy',1,1.5],['caterpillar',2,1.5,.35],['hawkmoth',3,1.5]],
      intro:'The air is full of moths. Sprinklers and pine trees can’t reach fliers.' },
  ]},
  { id:'carrot', name:'Carrot Rows', crop:'carrot', cropPlural:'carrots', pests:'Mice, moles & gophers', grass:['#b3d18a','#aac981'], levels:[
    { name:'Sprouting', waves:7, season:'spring', boss:'bigmouse',
      pts:[[-0.6,2.5],[6.5,2.5],[6.5,6.5],[2.5,6.5],[2.5,10.5],[5.5,10.5],[5.5,13.2]],   // in through the side gate
      pool:[['babymouse',1,3],['mouse',2,2]],
      intro:'Baby mice are scurrying in. They’re quick but fragile.' },
    { name:'Deep Roots', waves:9, season:'summer', boss:'molemom', soft:[4,7],
      cols:11, rows:17, pts:[[1.5,-0.6],[1.5,5.5],[5.5,5.5],[5.5,1.5],[9.5,1.5],[9.5,9.5],[3.5,9.5],[3.5,13.5],[7.5,13.5],[7.5,16.2]],   // a big field with a long wander
      pool:[['mouse',1,3],['vole',2,2],['mole',3,1.5]],
      intro:'Voles are fast. Moles tunnel underground, where your defenders can’t hit them.' },
    { name:'Big Dig', waves:12, season:'late summer', boss:'gopherboss', soft:[4,8],
      pts:[[7.5,-0.6],[7.5,1.5],[1.5,1.5],[1.5,4.5],[7.5,4.5],[7.5,7.5],[1.5,7.5],[1.5,10.5],[7.5,10.5],[7.5,13.2]],
      pool:[['vole',1,2.5],['mole',1,2],['gopher',3,1.5]],
      intro:'Gophers are the toughest diggers yet, and the Grumpy Gopher leads them.' },
  ]},
  // ---- Act 2: Something's Off ----
  { id:'tomato', name:'Tomato Greenhouse', crop:'tomato', cropPlural:'tomatoes', pests:'Whiteflies & stink bugs', grass:['#c3cb88','#b9c17e'],
    act:2, mood:'off', greenhouse:true, heat:[3,6], road:[.8,1], levels:[
    { name:'Hothouse', waves:7, season:'spring', boss:'sapsucker',
      pts:[[2.5,-0.6],[2.5,10.5],[6.5,10.5],[6.5,3.5],[4.5,3.5],[4.5,13.2]],   // down one aisle, back up the next, and out through the middle
      pool:[['whitenymph',1,3,.5],['stinknymph',2,2,.6],['whitefly',4,1.5]],
      intro:'Whitefly nymphs crawl in, then grow wings halfway down. Keep something ready that can hit fliers.' },
    { name:'Vine Rows', waves:9, season:'summer', boss:'shieldbug',
      lanes:[[[2.5,-0.6],[2.5,5.5],[0.5,5.5],[0.5,10.5],[4.5,10.5],[4.5,13.2]],
             [[6.5,-0.6],[6.5,5.5],[8.5,5.5],[8.5,10.5],[4.5,10.5],[4.5,13.2]]],   // two rows that stay apart until the gate
      pool:[['whitefly',1,3],['stinknymph',1,2,.5],['stinkbug',3,2]],
      intro:'Stink bugs wear tough shells. Watch for heat waves: only defenders near a Sprinkler stay cool.' },
    { name:'Red Harvest', waves:11, heat:[3,6,9], season:'late summer', boss:'baron',
      pts:[[9.6,1.5],[1.5,1.5],[1.5,5.5],[7.5,5.5],[7.5,9.5],[3.5,9.5],[3.5,13.2]],   // in through the side door
      pool:[['whitefly',1,2.5],['stinkbug',1,2],['bigstink',3,2]],
      intro:'The biggest stink bugs barely feel the spray, so lean on your defenders. The Stink Bug Baron is coming.' },
  ]},
  { id:'apple', name:'Apple Orchard', crop:'apple', cropPlural:'apples', pests:'Aphids & invasive beetles', grass:['#b2c67c','#a8bc72'],
    act:2, mood:'off', swarm:[4,7], road:[.65,1], levels:[
    { name:'Blossom Time', waves:7, swarm:[3,6], season:'spring', boss:'aphidmother',
      pts:[[1.5,-0.6],[1.5,3.5],[4.5,3.5],[4.5,7.5],[7.5,7.5],[7.5,13.2]],   // a short path between the trees
      pool:[['aphid',1,4,.5],['jbeetle',3,1.5]],
      intro:'Aphids come in booms: watch for swarms on waves 3 and 6.' },
    { name:'Green Apples', waves:9, season:'summer', boss:'copperking',
      cols:11, rows:17, pts:[[9.5,-0.6],[9.5,2.5],[1.5,2.5],[1.5,6.5],[9.5,6.5],[9.5,10.5],[1.5,10.5],[1.5,14.5],[5.5,14.5],[5.5,16.2]],
      pool:[['aphid',1,3,.5],['jbeetle',1,2],['longhorn',4,1.2]],
      intro:'Beetles from far away have found the orchard. Their shiny shells shrug off small hits.' },
    { name:'Small Harvest', waves:10, swarm:[4,7,9], season:'late summer', boss:'theswarm',
      pts:[[4.5,-0.6],[4.5,1.5],[7.5,1.5],[7.5,4.5],[1.5,4.5],[1.5,7.5],[7.5,7.5],[7.5,10.5],[2.5,10.5],[2.5,13.2]],
      pool:[['aphid',1,3,.4],['wingaphid',2,2],['longhorn',2,1.5],['jbeetle',1,1.5]],
      intro:'Something huge is buzzing over the hill: The Swarm. Save your Fertilizer for it.' },
  ]},
  { id:'corn', name:'Corn Field', crop:'corn', cropPlural:'corn', pests:'Locusts & rootworms', grass:['#c9c486','#bfba7c'],
    act:2, mood:'off', drought:true, road:[.5,1], levels:[
    { name:'Knee High', waves:6, season:'spring', boss:'grandhopper',
      cols:7, rows:11, pts:[[5.5,-0.6],[5.5,2.5],[1.5,2.5],[1.5,6.5],[5.5,6.5],[5.5,8.5],[3.5,8.5],[3.5,10.2]],   // a small corner of the field
      pool:[['hopperling',1,3,.55],['rootworm',2,2]],
      intro:'Drought: the big farms pumped the river dry. Plant defenders (Roses, Sunflowers, Pine Trees) wilt unless a Sprinkler is nearby.' },
    { name:'Dry Spell', waves:9, season:'summer', boss:'rootking',
      lanes:[[[-0.6,1.5],[2.5,1.5],[2.5,6.5],[4.5,6.5],[4.5,9.5],[1.5,9.5],[1.5,11.5],[7.5,11.5],[7.5,13.2]],
             [[9.6,3.5],[6.5,3.5],[6.5,6.5],[4.5,6.5],[4.5,9.5],[1.5,9.5],[1.5,11.5],[7.5,11.5],[7.5,13.2]]],
      pool:[['rootworm',1,3,.5],['locust',2,2],['hopperling',1,1.5,.5]],
      intro:'Rootworms tunnel under the cracked ground and come up as beetles. Locusts are on the wing.' },
    { name:'Dust and Tassels', waves:12, season:'late summer', boss:'locustking',
      pts:[[5.5,-0.6],[5.5,1.5],[1.5,1.5],[1.5,5.5],[6.5,5.5],[6.5,8.5],[2.5,8.5],[2.5,11.5],[7.5,11.5],[7.5,13.2]],
      pool:[['locust',1,3],['cornbeetle',1,1.5],['rootworm',2,2]],
      intro:'The sky goes dark with locusts, and the Locust King is right behind them.' },
  ]},
  { id:'dust', name:'Dust Bowl Farm', crop:'wheat', cropPlural:'wheat', pests:'Dust beetles & sand fleas', grass:['#cdb88c','#c3ae82'],
    act:3, mood:'withered', drought:true, road:[.35,1], crowd:1.25, dust:[4,7], levels:[
    { name:'Topsoil', waves:9, season:'spring', boss:'dustdevil',
      pts:[[0.5,-0.6],[0.5,1.5],[8.5,1.5],[8.5,3.5],[0.5,3.5],[0.5,5.5],[8.5,5.5],[8.5,7.5],[0.5,7.5],[0.5,9.5],[8.5,9.5],[8.5,11.5],[4.5,11.5],[4.5,13.2]],   // one very long road, back and forth across the whole farm
      pool:[['sandflea',1,3],['dustgrub',2,2,.5], ['sludge',3,.8]],
      intro:'A Rain Barrel keeps every plant near it watered. Dust storms blow through on some waves: your defenders can’t see far until they pass.' },
    { name:'Dry Wind', waves:7, dust:[3,5], season:'summer', boss:'dustdevil',
      lanes:[[[-0.6,2.5],[3.5,2.5],[3.5,6.5],[5.5,6.5],[5.5,10.5],[4.5,10.5],[4.5,13.2]],
             [[9.6,4.5],[6.5,4.5],[6.5,6.5],[5.5,6.5],[5.5,10.5],[4.5,10.5],[4.5,13.2]]],   // blown in from both sides; short and fierce
      pool:[['sandflea',1,2.5],['dustgrub',1,2,.5],['dustbeetle',3,2], ['sludge',3,.8]],
      intro:'Sand fleas hop in clouds off the dead fields, and dust beetles wear thick shells.' },
    { name:'Dust Storm', season:'late summer', boss:'dustdevil', waves:11, dust:[2,4,6,8,10],
      cols:11, rows:17, pts:[[1.5,-0.6],[1.5,13.5],[4.5,13.5],[4.5,2.5],[7.5,2.5],[7.5,13.5],[9.5,13.5],[9.5,16.2]],   // long straight furrows
      pool:[['sandflea',1,2],['dustbeetle',1,2.5],['dustgrub',2,2,.45], ['sludge',3,.8]],
      intro:'Storm after storm hides the pests, and something is spinning in behind them: the Dust Devil.' },
  ]},
  { id:'rooftop', name:'Rooftop Garden', crop:'pepper', cropPlural:'peppers', pests:'Rats, pigeons & smog moths', grass:['#aeb29c','#a4a892'],
    act:3, mood:'withered', smog:true, road:[0,1], crowd:1.3, levels:[
    { name:'Gray Morning', waves:10, crowd:1.5, season:'spring', boss:'ratking',
      cols:11, rows:17, lanes:[[[1.5,-0.6],[1.5,4.5],[5.5,4.5],[5.5,8.5],[2.5,8.5],[2.5,16.2]],
             [[9.5,-0.6],[9.5,6.5],[7.5,6.5],[7.5,12.5],[9.5,12.5],[9.5,16.2]]],
      pool:[['rat',1,3],['pigeon',3,1.5], ['sludge',2,.8]],
      intro:'Nothing lives up here but the pests. The smog hides fliers: defenders only spot them up close.' },
    { name:'Heavy Air', season:'summer', boss:'bigpidge',
      pts:[[7.5,-0.6],[7.5,1.5],[1.5,1.5],[1.5,11.5],[7.5,11.5],[7.5,13.2]],   // around the edge of the roof, with a wide open middle
      pool:[['rat',1,2.5],['pigeon',1,2],['smogworm',2,2,.5], ['sludge',2,.8]],
      intro:'Pigeons with dull, dusty feathers circle the chimneys. Smog worms grow into smog moths.' },
    { name:'The Smog Moth', season:'late summer', boss:'smogqueen', waves:11,
      lanes:[[[1.5,-0.6],[1.5,6.5],[4.5,6.5],[4.5,13.2]], [[4.5,-0.6],[4.5,13.2]], [[7.5,-0.6],[7.5,6.5],[4.5,6.5],[4.5,13.2]]],   // three ways in, one way out
      pool:[['smogworm',1,2.5,.45],['pigeon',1,2],['rat',2,2],['smogmoth',3,1.5], ['sludge',2,.8]],
      intro:'The air is thick and yellow. Out of it comes the biggest moth anyone has ever seen.' },
  ]},
  { id:'vault', name:'The Last Seed Vault', crop:'seed', cropPlural:'seed packets', pests:'Glowing mutants', grass:['#9c958a','#928b80'],
    act:3, mood:'withered', dark:true, road:[0,1], cracked:true, crowd:1.25, levels:[
    { name:'Ashes', waves:6, season:'spring', boss:'mutantmole',
      cols:7, rows:11, pts:[[1.5,-0.6],[1.5,2.5],[5.5,2.5],[5.5,5.5],[1.5,5.5],[1.5,8.5],[3.5,8.5],[3.5,10.2]],   // a small, cramped bunker yard
      pool:[['glowslug',1,3],['glowmole',3,1.5], ['sludge',2,.8]],
      intro:'The pests that crawled out of the poisoned ground glow in the dark, and some have extra eyes. Keep them off the seeds.' },
    { name:'Last Light', waves:9, season:'summer', boss:'palequeen',
      pts:[[0.5,-0.6],[0.5,1.5],[2.5,1.5],[2.5,3.5],[4.5,3.5],[4.5,5.5],[6.5,5.5],[6.5,7.5],[8.5,7.5],[8.5,9.5],[5.5,9.5],[5.5,11.5],[2.5,11.5],[2.5,13.2]],   // a staircase down and back
      pool:[['glowslug',1,2],['glowworm',1,2,.5],['glowsnail',3,1.5], ['sludge',2,.8]],
      intro:'Glowing caterpillars turn into pale, lopsided moths. Even the snails shine.' },
    { name:'The Blight', season:'late summer', boss:'blight', waves:14,
      cols:11, rows:17, pts:[[5.5,-0.6],[5.5,9.5],[2.5,9.5],[2.5,4.5],[8.5,4.5],[8.5,13.5],[2.5,13.5],[2.5,16.2]],
      pool:[['glowslug',1,2],['glowworm',1,2,.45],['glowsnail',2,1.5],['glowmole',3,1.5], ['sludge',2,.8]],
      intro:'The Blight is everything the spray and the poison left behind. Protect the last seeds. If they make it, the garden can come back.' },
  ]},
  { id:'rain', name:'Rain Garden', crop:'radish', cropPlural:'radishes', pests:'Froghoppers & mud snails', grass:['#9fcc86','#95c27c'],
    act:4, mood:'regrow', rain:[2,4,6], levels:[
    { name:'First Rain', season:'spring', boss:'bullfrog',
      pts:[[2.5,-0.6],[2.5,3.5],[6.5,3.5],[6.5,8.5],[3.5,8.5],[3.5,13.2]],   // a short, gentle stream bed
      pool:[['puddleslug',1,3],['frog',2,2]],
      intro:'Pests slow down in the rain, and every plant gets a drink. No more spraying: the bees are back.' },
    { name:'Puddles', waves:9, season:'summer', boss:'mudcrab',
      flood:{ waves:[4,6], pts:[[4.5,-0.6],[4.5,11.5],[6.5,11.5],[6.5,13.2]] },   // the creek runs straight down and skips the whole loop
      pts:[[4.5,-0.6],[4.5,8.5],[7.5,8.5],[7.5,4.5],[1.5,4.5],[1.5,11.5],[6.5,11.5],[6.5,13.2]],
      pool:[['puddleslug',1,2.5],['frog',1,2],['mudsnail',3,1.5]],
      intro:'Mud snails have come up out of the puddles. When the creek floods, half the pests ride it as a shortcut.' },
    { name:'The Flood', season:'late summer', boss:'snapper', waves:11, rain:[2,4,6,8,10],
      flood:{ waves:[4,6,8,10], pts:[[4.5,-0.6],[4.5,13.2]] },   // the creek bursts straight down the middle
      lanes:[[[-0.6,3.5],[2.5,3.5],[2.5,9.5],[4.5,9.5],[4.5,13.2]], [[9.6,1.5],[6.5,1.5],[6.5,9.5],[4.5,9.5],[4.5,13.2]]],   // water pouring in from both banks
      pool:[['frog',1,2.5],['mudsnail',1,2],['puddleslug',1,2]],
      intro:'The creek floods again and again, straight down the middle. An old snapping turtle is riding it in.' },
  ]},
  { id:'meadow', name:'Wildflower Meadow', crop:'bloom', cropPlural:'wildflowers', pests:'Old pests, back again', grass:['#a6d888','#9cce7e'],
    act:4, mood:'regrow', levels:[
    { name:'Clover', waves:9, season:'spring', boss:'chunkycat',
      cols:11, rows:17, pts:[[5.5,-0.6],[5.5,2.5],[9.5,2.5],[9.5,6.5],[1.5,6.5],[1.5,10.5],[9.5,10.5],[9.5,14.5],[5.5,14.5],[5.5,16.2]],   // a long wander through a big meadow
      pool:[['slug',1,2.5],['caterpillar',1,2,.5],['aphid',2,2]],
      intro:'The old pests are back, just ordinary ones now. A Dairy Cow joins the garden: what she leaves behind feeds the soil, and the pests hate the smell.' },
    { name:'Bees Again', waves:7, season:'summer', boss:'mothqueen',
      pts:[[1.5,-0.6],[1.5,5.5],[3.5,5.5],[3.5,1.5],[5.5,1.5],[5.5,5.5],[7.5,5.5],[7.5,10.5],[2.5,10.5],[2.5,13.2]],   // up and down like a comb
      pool:[['caterpillar',1,2,.5],['mouse',1,2],['snail',3,1.5]],
      intro:'The meadow hums with bees. Put a Bee Hive near your defenders and they’ll work faster.' },
    { name:'Old Friends', season:'late summer', boss:'whiskers', waves:10,
      lanes:[[[1.5,-0.6],[1.5,2.5],[3.5,2.5],[3.5,6.5],[4.5,6.5],[4.5,8.5],[7.5,8.5],[7.5,11.5],[2.5,11.5],[2.5,13.2]],
             [[7.5,-0.6],[7.5,4.5],[5.5,4.5],[5.5,6.5],[4.5,6.5],[4.5,8.5],[7.5,8.5],[7.5,11.5],[2.5,11.5],[2.5,13.2]]],
      pool:[['mouse',1,2],['moth',1,2],['snail',2,1.5],['slug',1,2]],
      intro:'Someone you know is coming back for one more try at the garden: Old Whiskers.' },
  ]},
  { id:'newgarden', name:'The New Garden', crop:'pumpkin', cropPlural:'pumpkins', pests:'The Blight’s last remnants', grass:['#9cd68a','#92cc80'],
    act:4, mood:'regrow', levels:[
    { name:'Seedlings Again', season:'spring', boss:'beetleking', mirrorOf:0,   // the very first garden's path, turned around
      pool:[['beetle',1,2],['puddleslug',1,2],['glowslug',3,1.5]],
      intro:'A few glowing pests are still out there. Keep them off the new beds.' },
    { name:'Wild and Green', waves:10, season:'summer', boss:'giantsnail',
      pts:[[-0.6,2.5],[7.5,2.5],[7.5,6.5],[2.5,6.5],[2.5,10.5],[6.5,10.5],[6.5,13.2]],   // in through the side gate
      pool:[['caterpillar',1,2,.5],['jbeetle',1,1.5],['glowworm',2,1.5,.5],['frog',1,1.5]],
      intro:'It’s greener than it’s been in years, and more pests than ever want in.' },
    { name:'The New Garden', season:'late summer', boss:'blightweak', waves:12,
      cols:11, rows:17, lanes:[[[1.5,-0.6],[1.5,5.5],[5.5,5.5],[5.5,10.5],[2.5,10.5],[2.5,7.5],[8.5,7.5],[8.5,13.5],[3.5,13.5],[3.5,16.2]],
             [[9.5,-0.6],[9.5,3.5],[5.5,3.5],[5.5,10.5],[2.5,10.5],[2.5,7.5],[8.5,7.5],[8.5,13.5],[3.5,13.5],[3.5,16.2]]],
      pool:[['glowslug',1,2],['glowsnail',2,1.5],['mudsnail',1,1.5],['wingaphid',2,1.5],['frog',1,1.5]],
      intro:'The Blight is weak, but it’s coming one last time. Hold on, and the garden gets its second chance.' },
  ]},
];

// Pest toughness per level, in play order (1 = base health). Tuned with the balance check
// (npm run balance) with the Garden Shed upgrades a typical player owns at each level, so the
// three-star rate slopes down from about 90% early to about 25% on Big Dig even for a player who
// never sprays. The Pesticide Sprayer then makes levels easier, a shortcut, never a requirement.
// Pests in the first level of a garden start weak, so those levels need a bigger multiplier.
const TOUGHNESS = [1.15, 1.32, 0.94, 2.24, 2.88, 1.55, 2.08, 1.43, 1.63, 4.77, 2.06, 2.43, 1.48, 3.06, 3.56, 5.4, 3.11, 3.19, 13.83, 2.63, 7.81, 1.45, 3.34, 2.29, 5.59, 6.3, 5.91, 9.76, 13.83, 8.76, 13.62, 10.53, 13.58, 13.54, 13.85, 19.02];

// Flat list of every level in play order, each linked back to its chapter.
export const LEVELS = [];
CHAPTERS.forEach((ch,ci) => ch.levels.forEach((lv,li) => {
  LEVELS.push(Object.assign(lv, { ch, ci, li, gi:LEVELS.length }));
}));
CHAPTERS.forEach(ch => { ch.act = ch.act || 1; if (ch.act===4) ch.noSpray = true; });   // no Sprayer in Part 4
// Some later levels reuse an earlier level's path, flipped left to right.
LEVELS.forEach(l => { if (l.mirrorOf==null || l.pts || l.lanes) return;
  const src = LEVELS[l.mirrorOf], C = src.cols || 9, flip = pts => pts.map(([x,y]) => [C-x, y]);
  if (src.lanes) l.lanes = src.lanes.map(flip); else l.pts = flip(src.pts);
  if (src.cols){ l.cols = src.cols; l.rows = src.rows; } });
LEVELS.forEach(l => { l.waves = l.waves || WAVES; });
// Crops to protect: 20 in the cozy first part, 10 from Part 2 on, when things get serious.
LEVELS.forEach(l => { l.lives = l.lives || (l.ch.act>=2 ? 10 : 20); });
// (Retuned Nov 2026 with tools/balance/tune.js: for a player who owns a few defender skills, about one
// challenge star per level beaten, while a player with no skills at all still wins most of the time. From Part 2 on the values sit halfway
// between that tuning and the earlier no-skills tuning, because the full step cost no-skills players too many losses.)
const HARDER = 1;
LEVELS.forEach(l => { l.hpMul = +((TOUGHNESS[l.gi] ?? 1+l.gi*.14) * (l.gi>=2 && l.ch.act===1 ? HARDER : 1)).toFixed(3); });
// The Endless Garden: opens after the story. Waves never stop; a boss comes every 5th wave.
// It is not part of LEVELS (so stars, unlocks and "beat every level" ignore it).
const last = LEVELS[LEVELS.length-1];
export const ENDLESS = {
  endless:true, gi:LEVELS.length, li:2, ci:CHAPTERS.length, name:'Endless Garden', season:'forever', waves:Infinity, lives:10, hpMul:2.2, resist:0, growth:1.11,
  cols:last.cols, rows:last.rows, lanes:last.lanes,
  ch:{ id:'endless', name:'Endless Garden', crop:'pumpkin', cropPlural:'pumpkins', pests:'Everything, forever', grass:['#9cd68a','#92cc80'], act:4, mood:'regrow', noSpray:true, levels:[] },
  pool:[['slug',1,3],['caterpillar',1,2,.5],['mouse',2,2],['snail',3,1.5],['aphid',4,2.5,.5],['moth',5,2],['beetle',6,1.5],['vole',7,2],
        ['stinkbug',9,1.5],['locust',10,2],['mole',11,1.5],['jbeetle',12,1.5],['dustbeetle',14,1.5],['pigeon',15,1.5],['glowslug',17,2],['glowsnail',20,1.5]],
  bosses:['fatslug','chunkycat','bigmouse','beetleking','mothqueen','gopherboss','baron','locustking','dustdevil','smogqueen','blight'],
  intro:'The garden is yours, and the pests will never stop trying. Waves get tougher forever, and a boss comes every 5th wave. How long can you hold?',
};
ENDLESS.ch.levels.push(ENDLESS);
// How much less spray damage pests take on each level (0 = none, 0.3 = 30% less). Grows through
// the story, the same for every player: rising in Act 2, high in Act 3, fading in Act 4.
const SPRAY_RESIST = [0, 0, 0,   0, 0, 0,   0, 0, 0,   .4, .65, .75,   .6, .7, .75,   .75, .8, .85,
                      .85, .88, .9,   .9, .9, .92,   .92, .94, .95,   .6, .55, .5,   .4, .35, .3,   .25, .2, .2];   // Act 1 (gardens 1-3): the spray works like magic; Act 2 resistance begins
LEVELS.forEach(l => { l.resist = SPRAY_RESIST[l.gi] ?? 0; });
