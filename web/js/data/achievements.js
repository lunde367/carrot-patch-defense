// Achievements. `goal` + `stat` make a progress bar; `check` decides unlocks for one-off feats.
// Stats live in Save.data.stats; `ctx` is the event that just happened.
import { LEVELS, CHAPTERS } from './levels.js';
import { TYPES } from './towers.js';
import { DIARY } from './diary.js';

const starsAt = (save, gi) => save.stars[gi] || 0;
const partDone = (s, n) => CHAPTERS.filter(ch=>ch.act===n).every(ch=>ch.levels.every(l=>starsAt(s,l.gi)>0));
const totalStars = s => LEVELS.reduce((n,l)=>n+starsAt(s,l.gi), 0);
const shedTiers = s => Object.values(s.perks||{}).reduce((n,v)=>n+(+v||0), 0);

// Headings on the Achievements page. Anything not listed lands under the first one.
export const ACH_GROUPS = [
  ['Garden basics', []],
  ['Story',         ['master','part1','part2','part3','part4','diary5','diaryAll','ending']],
  ['Stars',         ['ribbon','perfect','stars30','stars60','stars90','ribbon3']],
  ['Clever wins',   ['noNibble','speedy','close','few','marathon','flawless12','kinds']],
  ['Tools',         ['fence','shed','clear1','clear50','sprayHits','fert','scare','shed10']],
  ['Big numbers',   ['bosses','pests','sunny','bosses20','pests5k','pests20k','sunny2']],
  ['Endless Garden',['endless10','endless20','endless30']],
  ['Hard',          ['tough1','tough10','tough3']],
];
export const ACHIEVEMENTS = [
  { id:'firstWin',   name:'First Harvest',    desc:'Win any level.',                                    check:(s,e)=>e.type==='win' },
  { id:'noNibble',   name:'Not a Nibble',     desc:'Win a level without losing a single crop.',         check:(s,e)=>e.type==='win' && e.lost===0 },
  { id:'speedy',     name:'Fast Forward',     desc:'Win a level at 3× speed.',                          check:(s,e)=>e.type==='win' && e.speed===3 },
  { id:'ribbon',     name:'Blue Ribbon',      desc:'Get 3 stars on every level of one garden.',
    check:s=>CHAPTERS.some(ch=>ch.levels.every(l=>starsAt(s,l.gi)===3)) },
  { id:'master',     name:'Master Gardener',  desc:'Beat every level.',                                check:s=>LEVELS.every(l=>starsAt(s,l.gi)>0) },
  { id:'perfect',    name:'Perfect Season',   desc:'Get 3 stars on every level.',                      check:s=>LEVELS.every(l=>starsAt(s,l.gi)===3) },
  { id:'bosses',     name:'Boss Buster',      desc:'Squash 5 bosses.',                                  stat:'bossKills', goal:5 },
  { id:'pests',      name:'Pest Control',     desc:'Squash 1,000 pests.',                               stat:'kills', goal:1000 },
  { id:'maxed',      name:'Fully Grown',      desc:'Upgrade a defender all the way to level 3.',        check:(s,e)=>e.type==='upgrade' && e.lv===2 },
  { id:'crowd',      name:'Full House',       desc:'Have 12 defenders planted at once.',                check:(s,e)=>e.type==='plant' && e.count>=12 },
  { id:'sunny',      name:'Sunny Side Up',    desc:'Collect 500 seeds from Sunflowers.',                stat:'flowerSeeds', goal:500 },
  { id:'fence',      name:'Good Fences',      desc:'Let your Sturdy Fence stop a pest.',                check:(s,e)=>e.type==='fence' },
  { id:'shed',       name:'Handy Helper',     desc:'Buy your first Garden Shed upgrade.',               check:(s,e)=>e.type==='perk' },
  // the story, one part at a time
  { id:'part1',      name:'Backyard Hero',    desc:'Finish every garden in Part 1.',                    check:s=>partDone(s,1) },
  { id:'part2',      name:'Heat Wave Hero',   desc:'Finish every garden in Part 2.',                    check:s=>partDone(s,2) },
  { id:'part3',      name:'Hardy Perennial',  desc:'Finish every garden in Part 3.',                    check:s=>partDone(s,3) },
  { id:'part4',      name:'Rain Maker',       desc:'Finish every garden in Part 4.',                    check:s=>partDone(s,4) },
  { id:'diary5',     name:'Page Turner',      desc:'Read 5 diary pages.',                               check:s=>DIARY.filter(d=>s.diary[d.key]).length>=5 },
  { id:'diaryAll',   name:'The Whole Story',  desc:'Read every diary page.',                            check:s=>DIARY.every(d=>s.diary[d.key]) },
  // stars
  { id:'stars30',    name:'Star Collector',   desc:'Earn 30 stars.',                                    check:s=>totalStars(s)>=30 },
  { id:'stars60',    name:'Starry Night',     desc:'Earn 60 stars.',                                    check:s=>totalStars(s)>=60 },
  { id:'stars90',    name:'Constellation',    desc:'Earn 90 stars.',                                    check:s=>totalStars(s)>=90 },
  { id:'ribbon3',    name:'Prize Winner',     desc:'Get 3 stars on every level of three gardens.',
    check:s=>CHAPTERS.filter(ch=>ch.levels.every(l=>starsAt(s,l.gi)===3)).length>=3 },
  // close calls and clever wins
  { id:'close',      name:'By a Whisker',     desc:'Win a level with just one crop left.',              check:(s,e)=>e.type==='win' && e.left===1 },
  { id:'few',        name:'Small but Mighty', desc:'Win a level with 5 defenders or fewer.',            check:(s,e)=>e.type==='win' && e.towers<=5 && e.gi>0 },
  { id:'marathon',   name:'Long Haul',        desc:'Win a 12-wave level.',                              check:(s,e)=>e.type==='win' && e.waves>=12 },
  { id:'flawless12', name:'Not a Leaf Lost',  desc:'Win a 12-wave level without losing a single crop.', check:(s,e)=>e.type==='win' && e.waves>=12 && e.lost===0 },
  { id:'kinds',      name:'Mixed Border',     desc:'Plant every kind of defender at least once.',
    check:s=>Object.keys(TYPES).every(k=>(s.stats.kinds||{})[k]) },
  // tools of the trade
  { id:'clear1',     name:'Tidy Up',          desc:'Clear something out of the way for seeds.',         check:(s,e)=>e.type==='clear' },
  { id:'clear50',    name:'Clean Sweep',      desc:'Clear 50 things out of the way.',                   stat:'clears', goal:50 },
  { id:'sprayHits',  name:'Soaked',           desc:'Hit 100 pests with the Sprayer.',                   stat:'sprayHits', goal:100 },
  { id:'fert',       name:'Green Thumb',      desc:'Use Compost 25 times.',                          stat:'ferts', goal:25 },
  { id:'scare',      name:'Shoo!',            desc:'Scare away 50 birds with Scarecrows.',              stat:'scares', goal:50 },
  { id:'shed10',     name:'Well Stocked',     desc:'Buy 10 Garden Shed upgrades.',                      check:s=>shedTiers(s)>=10 },
  // hard difficulty
  { id:'tough1',     name:'Tough Cookie',     desc:'Win a level on Hard.',                        check:(s,e)=>e.type==='win' && e.tough },
  { id:'tough10',    name:'Tough as Nails',   desc:'Win 10 levels on Hard.',                      stat:'toughWins', goal:10 },
  { id:'tough3',     name:'Thorny Customer',  desc:'Get 3 stars on a 12-wave level on Hard.',     check:(s,e)=>e.type==='win' && e.tough && e.waves>=12 && e.stars===3 },
  // after the story
  { id:'ending',     name:'Happily Ever After', desc:'See the end of the story.',                       check:s=>!!s.ended },
  { id:'endless10',  name:'Holding On',       desc:'Clear 10 waves in the Endless Garden.',             check:s=>(s.endless?.best||0)>=10 },
  { id:'endless20',  name:'Deep Rooted',      desc:'Clear 20 waves in the Endless Garden.',             check:s=>(s.endless?.best||0)>=20 },
  { id:'endless30',  name:'Evergreen',        desc:'Clear 30 waves in the Endless Garden.',             check:s=>(s.endless?.best||0)>=30 },
  // big numbers
  { id:'bosses20',   name:'Boss of Bosses',   desc:'Squash 20 bosses.',                                 stat:'bossKills', goal:20 },
  { id:'pests5k',    name:'Pest Patrol',      desc:'Squash 5,000 pests.',                               stat:'kills', goal:5000 },
  { id:'pests20k',   name:'Legend of the Garden', desc:'Squash 20,000 pests.',                          stat:'kills', goal:20000 },
  { id:'sunny2',     name:'Sunflower Fields', desc:'Collect 3,000 seeds from Sunflowers.',              stat:'flowerSeeds', goal:3000 },
];
