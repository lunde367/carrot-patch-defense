// The Pesticide Sprayer: a reusable ability, not a defender.
// Tap the spray button, then the board: every pest in the circle takes damage, and plant
// defenders in the circle wilt for a few seconds. Then it recharges.
// Resistance (per level, in levels.js) lowers the share, so in Act 2 sprayed pests walk out of the mist
// weakened instead of squashed; Stronger Formula raises it again. Tuned with npm run balance.
export const SPRAY = {
  unlock: 3,            // first level where it's available (3 = Strawberry Bed: First Blossoms), in the cozy act
  power: 1,             // share of a sprayed pest's health it takes: 1 = ordinary pests die outright
  toughHp: 40,          // pests with at least this base health are big: they take only toughShare
  toughShare: .6,
  bossShare: .12,       // bosses barely notice it
  radius: 1.5,          // tiles
  recharge: 50,         // seconds of game time
  wilt: 10,             // seconds plant defenders stop working
  drift: 1.6,            // the mist that wilts plants reaches this many times the damage circle
  hitsUnderground: false,
};
// Defenders that are plants, and so wilt in the spray.
export const PLANTS = ['rose', 'sunflower', 'pine'];
