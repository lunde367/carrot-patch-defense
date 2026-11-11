// Ad check: how much easier does the game get for a player who takes every ad extra?
//
//   node tools/balance/ads.js            all levels, 20 games per player
//   node tools/balance/ads.js --runs 40  more games for steadier numbers
//   node tools/balance/ads.js --from 9 --to 17   just some levels
//
// Two players, both the "balanced" bot with the Shed bought the typical way and the Sprayer used:
//   no ads  – never watches anything
//   all ads – takes every extra whenever it's offered:
//             +60 seeds before wave 1, a Sprayer refill when it's recharging,
//             the second chance after a loss (once per try), and both bonus stars every day
//             (assumed: about six levels played a day, so +2 stars per 6 levels; change with --perday).
// 3× speed is left out: it changes how fast the game runs, not how hard it is.
// Results print as a table and go to tools/balance/reports/ads.json.
import { writeFileSync, mkdirSync } from 'node:fs';
import { G, startLevel, startWave, update, starsFor, revive, addSeeds, refillSpray, sprayReady } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { LEVELS } from '../../web/js/data/levels.js';
import { perkValues } from '../../web/js/data/perks.js';
import { EXTRAS } from '../../web/js/data/extras.js';
import { shop, starsBefore } from './shed.js';
import { STRATEGIES, preparePath, maybeSpray, maybeFertilize } from './bots.js';

const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? +process.argv[i+1] : def; };
// --only seeds|refill|second|stars tests one extra on its own
const ONLY = (()=>{ const i=process.argv.indexOf('--only'); return i>0 ? process.argv[i+1] : null; })();
const use = k => !ONLY || ONLY===k;
const RUNS = arg('runs', 20), FROM = arg('from', 0), TO = arg('to', LEVELS.length-1), PER_DAY = arg('perday', 6);
const DT = 1/30;
const mulberry32 = a => () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

// Bonus stars an all-ads player has by this level: 2 a day, PER_DAY levels played a day.
const bonusStars = gi => Math.floor(gi/PER_DAY)*EXTRAS.starsPerDay;

function play(gi, seed, ads){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  const stars = starsBefore(gi, 2.5) + (ads && use('stars') ? bonusStars(gi) : 0);
  startLevel(gi, 1, 0, perkValues(shop(stars, gi).owned)); preparePath();
  const S = G.S, extras = ads && gi >= EXTRAS.firstLevel;
  const avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  let revived = false;
  for (let w=0; w<LEVELS[gi].waves; w++){
    if (extras && use('seeds') && w===0){ addSeeds(EXTRAS.bonusSeeds); S.adSeeds = true; }
    STRATEGIES.balanced(avail, S.wave+1, rnd);
    if (!startWave()) break;
    let t=0, next=0;
    while (S.mode==='play' && S.active && t<900){
      update(DT); t+=DT;
      if (t>=next){ next=t+.5; maybeFertilize(); maybeSpray();
        if (extras && use('refill') && S.sprayOn && !S.adRefill && !sprayReady() && S.sprayCd>EXTRAS.refillAfter) refillSpray(); }
    }
    if (S.mode==='lost' && extras && use('second') && revive()){ revived = true; w = S.wave-1; continue; }   // replay the wave it lost on
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won', lost = S.maxLives - S.lives;
  return { won, three: won && starsFor(lost, S.maxLives)===3, revived };
}

const pct = x => `${Math.round(x*100)}%`.padStart(4);
const rows = [];
console.log(`Ad check: ${RUNS} games per player per level, ${PER_DAY} levels a day${ONLY?`, only: ${ONLY}`:''}\n`);
console.log('                        no ads        all ads       change');
console.log('                      win   3★       win   3★       win   3★   second chance used');
for (const L of LEVELS.slice(FROM, TO+1)){
  const res = {};
  for (const ads of [false, true]){
    const g = [...Array(RUNS)].map((_,i) => play(L.gi, 5000+i, ads));
    res[ads?'ads':'none'] = { win: g.filter(x=>x.won).length/RUNS, three: g.filter(x=>x.three).length/RUNS, revived: g.filter(x=>x.revived).length/RUNS };
  }
  const a=res.none, b=res.ads, dw=b.win-a.win, d3=b.three-a.three;
  rows.push({ gi:L.gi, name:L.name, ...res });
  const sg = x => ((x>=0?'+':'')+Math.round(x*100)).padStart(4);
  console.log(`${String(L.gi).padStart(2)} ${L.name.padEnd(17)} ${pct(a.win)} ${pct(a.three)}      ${pct(b.win)} ${pct(b.three)}      ${sg(dw)} ${sg(d3)}   ${pct(b.revived)}`);
}
mkdirSync(new URL('./reports/', import.meta.url), { recursive:true });
writeFileSync(new URL('./reports/ads.json', import.meta.url), JSON.stringify(rows, null, 1));
const avg = k => rows.reduce((s,r)=>s+r[k].three,0)/rows.length, avgW = k => rows.reduce((s,r)=>s+r[k].win,0)/rows.length;
console.log(`\nAverage: no ads win ${pct(avgW('none'))}, 3★ ${pct(avg('none'))}  ·  all ads win ${pct(avgW('ads'))}, 3★ ${pct(avg('ads'))}`);
