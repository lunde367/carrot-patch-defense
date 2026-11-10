// Pests. `shape` picks the drawing; colors live here so one shape can have many variants.
// armor: flat damage removed from every hit (minimum 1). adult: what a young pest grows into.
export const ENEMY = {
  // ---- Cabbage Patch: slugs, snails & beetles ----
  babyslug:{name:'Baby Slug',hp:8,spd:.7,reward:2,size:.17,gap:.5,shape:'slug',col:'#cdbb8a',dk:'#8f7f52'},
  slug:{name:'Garden Slug',hp:22,spd:.65,reward:4,size:.25,gap:.7,shape:'slug',col:'#a89a5c',dk:'#6f6232'},
  bananaslug:{name:'Banana Slug',hp:70,spd:.5,reward:9,size:.34,gap:1.1,shape:'slug',col:'#f0cf45',dk:'#9c7d16',spots:true},
  fatslug:{name:'Fat Slug',boss:true,hp:240,spd:.42,reward:40,size:.46,shape:'slug',col:'#8d8a4a',dk:'#55532a',spots:true},
  snail:{name:'Armored Snail',hp:30,armor:2,spd:.55,reward:6,size:.3,gap:.9,shape:'snail',shell:'#cf8a46',sdk:'#7a4a1f'},
  giantsnail:{name:'Giant Snail',boss:true,hp:280,armor:5,spd:.4,reward:45,size:.48,shape:'snail',shell:'#8a5ca8',sdk:'#4f2e66'},
  fleagrub:{name:'Flea Beetle Grub',hp:6,spd:.85,reward:2,size:.16,gap:.4,shape:'grub',adult:'fleabeetle'},
  fleabeetle:{name:'Flea Beetle',hp:14,spd:1.1,reward:4,size:.2,gap:.5,shape:'beetle',col:'#3f8a55',dk:'#1f4a2c',hopper:true},
  beetle:{name:'Shield Beetle',hp:30,armor:3,spd:.85,reward:6,size:.28,gap:.75,shape:'beetle',col:'#4560a3',dk:'#1f2e52'},
  beetleking:{name:'Beetle King',boss:true,hp:440,armor:6,spd:.45,reward:60,size:.5,shape:'beetle',col:'#7a46b0',dk:'#3c1f5e'},
  // ---- Strawberry Bed: caterpillars & moths ----
  inchworm:{name:'Inchworm',hp:7,spd:.9,reward:2,size:.18,gap:.45,shape:'inch'},
  caterpillar:{name:'Caterpillar',hp:16,spd:.8,reward:3,size:.26,gap:.6,shape:'cat',a:'#8ccc3f',b:'#7bbf31',dk:'#4c7d1c',adult:'moth'},
  fuzzy:{name:'Fuzzy Caterpillar',hp:24,armor:2,spd:.7,reward:5,size:.27,gap:.75,shape:'cat',a:'#e08a2c',b:'#3a2a1c',dk:'#2a1c10',hairy:true},
  chunkycat:{name:'Chunky Caterpillar',boss:true,hp:250,spd:.45,reward:40,size:.46,shape:'cat',a:'#4fb8a0',b:'#3ea08a',dk:'#226a5a'},
  hornworm:{name:'Giant Hornworm',boss:true,hp:320,armor:3,spd:.45,reward:50,size:.48,shape:'cat',a:'#7cc04a',b:'#6cb03a',dk:'#3d6e1e',horn:true},
  moth:{name:'Moth',hp:16,spd:1.5,reward:5,size:.26,gap:.55,fly:true,shape:'moth',wing:'#efe6c8',body:'#8a7458',dk:'#5a4a36'},
  hawkmoth:{name:'Hawk Moth',hp:34,spd:1.9,reward:8,size:.32,gap:.7,fly:true,shape:'moth',wing:'#d3a9b2',body:'#5a4048',dk:'#3a2830'},
  mothqueen:{name:'Moth Queen',boss:true,hp:380,spd:.6,reward:60,size:.52,fly:true,shape:'moth',wing:'#b9a6e0',body:'#4f3f7a',dk:'#2e2350'},
  // ---- Carrot Rows: mice, moles & gophers ----
  babymouse:{name:'Baby Mouse',hp:6,spd:1.5,reward:2,size:.17,gap:.4,shape:'mouse',fur:'#e2c3bd'},
  mouse:{name:'Field Mouse',hp:14,spd:2,reward:4,size:.24,gap:.55,shape:'mouse',fur:'#a39a91'},
  vole:{name:'Vole',hp:22,spd:2.4,reward:5,size:.25,gap:.55,shape:'mouse',fur:'#7a5e48',short:true},
  bigmouse:{name:'Old Whiskers',boss:true,hp:240,spd:1,reward:40,size:.44,shape:'mouse',fur:'#8f8780'},
  mole:{name:'Mole',hp:40,spd:.8,reward:7,size:.3,gap:.9,burrow:true,shape:'mole',fur:'#4a4450'},
  molemom:{name:'Mama Mole',boss:true,hp:330,spd:.55,reward:50,size:.46,burrow:true,shape:'mole',fur:'#3c3642'},
  gopher:{name:'Gopher',hp:60,spd:.7,reward:9,size:.34,gap:1.1,burrow:true,shape:'gopher'},
  gopherboss:{name:'Grumpy Gopher',boss:true,hp:460,spd:.55,reward:60,size:.48,burrow:true,shape:'gopher'},
};
