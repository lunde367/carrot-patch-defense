// The garden-food button (called `fert` in code), a second reusable ability beside the Sprayer.
// Parts 1-3: Fertilizer, a store-bought chemical. Much stronger, but when it wears off it burns the roots:
//   every Rose, Sunflower and Pine Tree wilts for a few seconds. Part of how the land gets used up.
// Part 4 and the Endless Garden: Compost, made from kitchen scraps. Gentler, lasts longer, harms nothing.
export const FERT = {
  unlock: 6,          // 6 = Carrot Rows: Sprouting, the last cozy garden
  recharge: 60,       // seconds of wave time before it's ready again
  chemBoost: 1.8,     // Fertilizer's extra speed, as a multiple of Compost's (35% -> 63%)
  burn: 5,            // seconds plant defenders wilt when Fertilizer wears off
  compostTime: 1.3,   // Compost lasts this much longer than Fertilizer
};
export const PLANT_NAMES = 'Roses, Sunflowers and Pine Trees';
