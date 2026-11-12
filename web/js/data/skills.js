// Defender skills: every defender has two branches of three steps, bought with challenge stars.
// (The Garden Shed stays for upgrades that help everything; these make one defender special.)
// Each step lists the total it gives once bought, so a branch at step 2 uses steps[1].
import { TYPES } from './towers.js';

export const SKILL_COSTS = [1, 2, 3];
const pct = v => Math.round(v*100);
const branch = (id, name, key, vals, text, extra) => ({ id, name, steps:vals.map((v,i) => ({ [key]:v, ...(extra && i===vals.length-1 ? extra.fx : {}) })),
  desc:i => text(vals[i]) + (extra && i===vals.length-1 ? ' ' + extra.text : '') });

export const SKILLS = {
  bunny:     [ branch('a','Quick Paws','rate',[.03,.06,.09], v=>`Throws ${pct(v)}% faster.`),
               branch('b','Big Carrots','dmg',[.04,.08,.12], v=>`Carrots hit ${pct(v)}% harder.`, { fx:{ pierce:.35 }, text:'Each carrot also clips a second pest nearby.' }) ],
  sprinkler: [ branch('a','Wide Arc','range',[.03,.06,.09], v=>`Reaches ${pct(v)}% farther.`),
               branch('b','Cold Water','slow',[.1,.2,.3], v=>`Pests stay slowed ${pct(v)}% longer.`, { fx:{ dmg:.12 }, text:'The splash also hits 12% harder.' }) ],
  pine:      [ branch('a','Heavy Cones','dmg',[.04,.08,.12], v=>`Cones hit ${pct(v)}% harder.`),
               branch('b','Wide Burst','splash',[.04,.08,.12], v=>`Each cone bonks a ${pct(v)}% wider area.`) ],
  sunflower: [ branch('a','Rich Soil','income',[.06,.12,.18], v=>`Drops ${pct(v)}% more seeds after each wave.`),
               branch('b','Early Bloom','gift',[3,6,9], v=>`Gives ${v} seeds back the moment it’s planted.`) ],
  rose:      [ branch('a','Sharp Thorns','dmg',[.04,.08,.12], v=>`Thorns hit ${pct(v)}% harder.`),
               branch('b','More Blooms','rate',[.03,.06,.06], v=>`Fires ${pct(v)}% faster.`, { fx:{ multi:1 }, text:'Hits one more pest with every volley.' }) ],
  squirrel:  [ branch('a','Hard Shells','dmg',[.04,.08,.12], v=>`Acorns hit ${pct(v)}% harder.`),
               branch('b','Trick Shot','rate',[.03,.06,.06], v=>`Throws ${pct(v)}% faster.`, { fx:{ bounce:1 }, text:'Acorns bounce one more time.' }) ],
  owl:       [ branch('a','Keen Eyes','range',[.03,.06,.09], v=>`Sees ${pct(v)}% farther.`),
               branch('b','Sharp Talons','dmg',[.04,.08,.12], v=>`Strikes ${pct(v)}% harder.`) ],
  scarecrow: [ branch('a','Loud Rattle','push',[.06,.12,.18], v=>`Scares fliers ${pct(v)}% farther back.`),
               branch('b','Quick Turn','rate',[.06,.12,.18], v=>`Ready to scare again ${pct(v)}% sooner.`) ],
  barrel:    [ branch('a','Long Hose','range',[.05,.1,.15], v=>`Waters ${pct(v)}% farther.`),
               branch('b','Cool Water','cool',[.02,.04,.06], v=>`Plants it waters work ${pct(v)}% faster.`) ],
  hive:      [ branch('a','Busy Bees','boost',[.02,.04,.06], v=>`Defenders near the hive work another ${pct(v)}% faster.`),
               branch('b','Wide Meadow','range',[.05,.1,.15], v=>`The bees reach ${pct(v)}% farther.`) ],
  ladybug:   [ branch('a','More Ladybugs','rate',[.03,.06,.09], v=>`Sends ladybugs ${pct(v)}% faster.`),
               branch('b','Big Appetite','dmg',[.04,.08,.12], v=>`Each nip is ${pct(v)}% stronger.`) ],
};
// Owned steps, e.g. { bunny:{ a:2, b:1 } } → the numbers the game uses, e.g. { bunny:{ rate:.12, dmg:.08 } }.
export function skillValues(owned = {}){
  const out = {};
  for (const type in SKILLS){ const o = owned[type]; if (!o) continue; const v = out[type] = {};
    for (const b of SKILLS[type]){ const n = o[b.id] || 0; if (n) Object.assign(v, b.steps[n-1]); } }
  return out;
}
export const skillsSpent = (owned = {}) => Object.values(owned).reduce((s,o) => s + Object.values(o).reduce((t,n) => t + SKILL_COSTS.slice(0,n).reduce((a,b)=>a+b,0), 0), 0);
export const SKILL_TOTAL = Object.keys(SKILLS).length * 2 * SKILL_COSTS.reduce((a,b)=>a+b,0);
export const skillOpen = (type, highest) => TYPES[type].unlock <= highest;
