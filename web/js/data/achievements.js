// Achievements. `goal` + `stat` make a progress bar; `check` decides unlocks for one-off feats.
// Stats live in Save.data.stats; `ctx` is the event that just happened.
import { LEVELS, CHAPTERS } from './levels.js';

const starsAt = (save, gi) => save.stars[gi] || 0;

export const ACHIEVEMENTS = [
  { id:'firstWin',   name:'First Harvest',    desc:'Win any level.',                                    check:(s,e)=>e.type==='win' },
  { id:'noNibble',   name:'Not a Nibble',     desc:'Win a level without losing a single crop.',         check:(s,e)=>e.type==='win' && e.lost===0 },
  { id:'speedy',     name:'Fast Forward',     desc:'Win a level at 3× speed.',                          check:(s,e)=>e.type==='win' && e.speed===3 },
  { id:'ribbon',     name:'Blue Ribbon',      desc:'Get 3 stars on every level of one garden.',
    check:s=>CHAPTERS.some(ch=>ch.levels.every(l=>starsAt(s,l.gi)===3)) },
  { id:'master',     name:'Master Gardener',  desc:'Beat all 9 levels.',                                check:s=>LEVELS.every(l=>starsAt(s,l.gi)>0) },
  { id:'perfect',    name:'Perfect Season',   desc:'Get 3 stars on all 9 levels.',                      check:s=>LEVELS.every(l=>starsAt(s,l.gi)===3) },
  { id:'bosses',     name:'Boss Buster',      desc:'Squash 5 bosses.',                                  stat:'bossKills', goal:5 },
  { id:'pests',      name:'Pest Control',     desc:'Squash 1,000 pests.',                               stat:'kills', goal:1000 },
  { id:'maxed',      name:'Fully Grown',      desc:'Upgrade a defender all the way to level 3.',        check:(s,e)=>e.type==='upgrade' && e.lv===2 },
  { id:'crowd',      name:'Full House',       desc:'Have 12 defenders planted at once.',                check:(s,e)=>e.type==='plant' && e.count>=12 },
  { id:'sunny',      name:'Sunny Side Up',    desc:'Collect 500 seeds from Sunflowers.',                stat:'flowerSeeds', goal:500 },
  { id:'fence',      name:'Good Fences',      desc:'Let your Sturdy Fence stop a pest.',                check:(s,e)=>e.type==='fence' },
  { id:'shed',       name:'Handy Helper',     desc:'Buy your first Garden Shed upgrade.',               check:(s,e)=>e.type==='perk' },
];
