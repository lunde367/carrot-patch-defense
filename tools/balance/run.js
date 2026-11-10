// Balance check: robot players play every level many times using the game's real rules.
//
//   npm run balance                      every level, 40 games per bot
//   npm run balance -- --runs 100        more games (slower, steadier numbers)
//   npm run balance -- --level 4         one level (0 = Seedlings … 8 = Big Dig)
//   npm run balance -- --perks all       play with every Garden Shed upgrade owned
//   npm run balance -- --seed 7          a different (but repeatable) set of games
//
// Writes tools/balance/reports/report.html (open in a browser) and latest.json.
import { writeFile, mkdir } from 'node:fs/promises';
import { G, startLevel, startWave, update } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { ENEMY } from '../../web/js/data/enemies.js';
import { LEVELS, WAVES } from '../../web/js/data/levels.js';
import { PERKS, perkValues } from '../../web/js/data/perks.js';
import { STRATEGIES, monoStrategy, MONO_TYPES, preparePath } from './bots.js';
import { buildReport } from './report.js';

// ---------- options ----------
const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? process.argv[i+1] : def; };
const RUNS = +arg('runs', 40);
const ONLY = arg('level', null);
const PERK_MODE = arg('perks', 'none');
const SEED = +arg('seed', 1);
const DT = 1/30;

const allPerks = Object.fromEntries(PERKS.map(p=>[p.id, p.costs.length]));
const perks = perkValues(PERK_MODE==='all' ? allPerks : {});

// Repeatable randomness: the same seed always produces the same games.
function mulberry32(a){ return () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function playOne(gi, strategy, seed){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  startLevel(gi, 1, 0, perks); preparePath();
  const S = G.S;
  const avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  for (let w=0; w<WAVES; w++){
    strategy(avail, w+1, rnd);
    if (!startWave()) break;
    let t=0;
    while (S.mode==='play' && S.active && t<900){ update(DT); t+=DT; }
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won', lost = S.maxLives - S.lives;
  return { won, lost, stars: won ? (lost<=4?3:lost<=10?2:1) : 0, wave: S.wave, towers: S.towers.length };
}

function summarize(games){
  const n=games.length, wins=games.filter(g=>g.won);
  const losses=games.filter(g=>!g.won).map(g=>g.wave).sort((a,b)=>a-b);
  return {
    games:n,
    winRate: wins.length/n,
    threeStar: games.filter(g=>g.stars===3).length/n,
    avgStars: games.reduce((a,g)=>a+g.stars,0)/n,
    avgLost: wins.length ? wins.reduce((a,g)=>a+g.lost,0)/wins.length : null,
    lossWave: losses.length ? losses[Math.floor(losses.length/2)] : null,
  };
}

const levels = ONLY!=null ? [LEVELS[+ONLY]] : LEVELS;
const results = [];
const t0 = Date.now();
for (const LV of levels){
  const pests = [...LV.pool.map(p=>p[0]), LV.boss];
  const fliers = pests.some(k => ENEMY[k].fly || (ENEMY[k].adult && ENEMY[ENEMY[k].adult].fly));
  const row = { gi:LV.gi, name:LV.name, chapter:LV.ch.name, boss:LV.boss, fliers, bots:{}, mono:{} };
  const avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= LV.gi);
  for (const [name, strat] of Object.entries(STRATEGIES)){
    row.bots[name] = summarize(Array.from({length:RUNS}, (_,i) => playOne(LV.gi, strat, SEED*100000+LV.gi*1000+i)));
  }
  for (const type of MONO_TYPES){
    if (!avail.includes(type)) continue;
    row.mono[type] = summarize(Array.from({length:Math.ceil(RUNS/2)}, (_,i) => playOne(LV.gi, monoStrategy(type), SEED*100000+LV.gi*1000+500+i)));
  }
  results.push(row);
  const b=row.bots.balanced;
  console.log(`${String(LV.gi).padStart(2)} ${LV.name.padEnd(15)} balanced win ${(b.winRate*100).toFixed(0).padStart(3)}%  3★ ${(b.threeStar*100).toFixed(0).padStart(3)}%  ` +
    `spammer ${(row.bots.spammer.winRate*100).toFixed(0).padStart(3)}%  upgrader ${(row.bots.upgrader.winRate*100).toFixed(0).padStart(3)}%  random ${(row.bots.random.winRate*100).toFixed(0).padStart(3)}%`);
}
const meta = { runs:RUNS, perks:PERK_MODE, seed:SEED, seconds:(Date.now()-t0)/1000, date:new Date().toISOString() };
const { html, fragment, flags } = buildReport(results, meta);
const dir = new URL('./reports/', import.meta.url);
await mkdir(dir, { recursive:true });
await writeFile(new URL('latest.json', dir), JSON.stringify({ meta, flags, results }, null, 2));
await writeFile(new URL('report.html', dir), html);
await writeFile(new URL('report-page.html', dir), fragment);
console.log(`\n${flags.length} things to look at:`);
for (const f of flags) console.log(`  [${f.kind}] ${f.level}: ${f.text}`);
console.log(`\nDone in ${meta.seconds.toFixed(1)}s. Report: tools/balance/reports/report.html`);
