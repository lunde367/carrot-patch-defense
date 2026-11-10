// Board size in tiles, waves per level, and every chapter/level.
// pool entries: [pest, first wave it appears, weight, optional "grows up at this fraction of the path"]
export const COLS = 9, ROWS = 14, WAVES = 8;

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
    { name:'Harvest Time', season:'late summer', boss:'beetleking',
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
    { name:'Berry Picking', season:'late summer', boss:'mothqueen',
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
    { name:'Big Dig', season:'late summer', boss:'gopherboss',
      pts:[[7.5,-0.6],[7.5,1.5],[1.5,1.5],[1.5,4.5],[7.5,4.5],[7.5,7.5],[1.5,7.5],[1.5,10.5],[7.5,10.5],[7.5,13.2]],
      pool:[['vole',1,2.5],['mole',1,2],['gopher',3,1.5]],
      intro:'Gophers are the toughest diggers yet, and the Grumpy Gopher leads them.' },
  ]},
];

// Flat list of every level in play order, each linked back to its chapter.
export const LEVELS = [];
CHAPTERS.forEach((ch,ci) => ch.levels.forEach((lv,li) => {
  LEVELS.push(Object.assign(lv, { ch, ci, li, gi:LEVELS.length, hpMul:1+LEVELS.length*.14 }));
}));
