// The Pesticide Sprayer: a reusable ability, not a defender.
// Tap the spray button, then the board: every pest in the circle takes damage, and plant
// defenders in the circle wilt for a few seconds. Then it recharges.
// Tuned with the balance check: careful aiming adds about +15 three-star points on the Carrot Rows
// levels, careless spraying about +6, so spraying always helps but aiming matters.
export const SPRAY = {
  unlock: 3,            // first level where it's available (3 = Strawberry Bed: First Blossoms), in the cozy act
  damage: 30,           // before resistance and the Stronger Formula upgrade
  radius: 1.6,          // tiles
  recharge: 35,         // seconds of game time
  wilt: 10,             // seconds plant defenders stop working
  drift: 1.6,            // the mist that wilts plants reaches this many times the damage circle
  hitsUnderground: false,
};
// Defenders that are plants, and so wilt in the spray.
export const PLANTS = ['rose', 'sunflower', 'pine'];
