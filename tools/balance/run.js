// Balance check: robot players play every level many times using the game's real rules.
//
//   npm run balance                      every level, 40 games per bot
//   npm run balance -- --runs 100        more games (slower, steadier numbers)
//   npm run balance -- --level 4         one level (0 = Seedlings … 8 = Big Dig)
//   npm run balance -- --perks none      play with no Garden Shed upgrades (default: the upgrades a
//                                        typical player owns when they reach each level)
//   npm run balance -- --perks all       play with every Garden Shed upgrade owned
//   npm run balance -- --quick           skip the chapter-finale and upgrade-value checks
//   npm run balance -- --seed 7          a different (but repeatable) set of games
//
// Writes tools/balance/reports/report.html (open in a browser) and latest.json.
import { writeFile, mkdir } from 'node:fs/promises';
import { starsFor, G, startLevel, startWave, update } from '../../web/js/engine/game.js';
import { TYPES } from '../../web/js/data/towers.js';
import { ENEMY } from '../../web/js/data/enemies.js';
import { LEVELS, WAVES } from '../../web/js/data/levels.js';
import { PERKS, perkValues } from '../../web/js/data/perks.js';
import { STRATEGIES, monoStrategy, MONO_TYPES, preparePath, maybeSpray, maybeFertilize } from './bots.js';
import { SPRAY } from '../../web/js/data/spray.js';
import { buildReport } from './report.js';
import { PLAYERS, starsBefore, shop, describe } from './shed.js';

// ---------- options ----------
const arg = (name, def) => { const i=process.argv.indexOf('--'+name); return i>0 ? process.argv[i+1] : def; };
const RUNS = +arg('runs', 40);
const ONLY = arg('level', null);
const PERK_MODE = arg('perks', 'typical');
const SEED = +arg('seed', 1);
const QUICK = process.argv.includes('--quick');
const SPRAY_MODE = arg('spray', 'on');   // on | off: whether robot players use the Sprayer
const DT = 1/30;

const allPerks = Object.fromEntries(PERKS.map(p=>[p.id, p.costs.length]));
const perks = perkValues(PERK_MODE==='all' ? allPerks : {});
// Upgrades used for the main per-level table.
const perksFor = gi => PERK_MODE==='typical' ? perkValues(shop(starsBefore(gi, 2.5), gi).owned) : perks;

// Repeatable randomness: the same seed always produces the same games.
function mulberry32(a){ return () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function playOne(gi, strategy, seed, perkSet=perks, useSpray=SPRAY_MODE==='on'){
  const rnd = mulberry32(seed); Math.random = mulberry32(seed*7919+13);
  startLevel(gi, 1, 0, perkSet); preparePath();
  const S = G.S; let sprays=0, wilted=0;
  const avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  for (let w=0; w<LEVELS[gi].waves; w++){
    strategy(avail, w+1, rnd);
    if (!startWave()) break;
    let t=0;
    let nextSpray=0;
    while (S.mode==='play' && S.active && t<900){ update(DT); t+=DT; if (t>=nextSpray){ nextSpray=t+.5; maybeFertilize(); if (useSpray && maybeSpray()){ sprays++; wilted+=G.lastWilt||0; } } }
    if (S.mode!=='play') break;
  }
  const won = S.mode==='won', lost = S.maxLives - S.lives;
  return { won, lost, stars: won ? starsFor(lost, S.maxLives) : 0, wave: S.wave, towers: S.towers.length, sprays };
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
    row.bots[name] = summarize(Array.from({length:RUNS}, (_,i) => playOne(LV.gi, strat, SEED*100000+LV.gi*1000+i, perksFor(LV.gi))));
  }
  for (const type of MONO_TYPES){
    if (!avail.includes(type)) continue;
    row.mono[type] = summarize(Array.from({length:Math.ceil(RUNS/2)}, (_,i) => playOne(LV.gi, monoStrategy(type), SEED*100000+LV.gi*1000+500+i, perksFor(LV.gi))));
  }
  results.push(row);
  const b=row.bots.balanced;
  console.log(`${String(LV.gi).padStart(2)} ${LV.name.padEnd(15)} balanced win ${(b.winRate*100).toFixed(0).padStart(3)}%  3★ ${(b.threeStar*100).toFixed(0).padStart(3)}%  ` +
    `spammer ${(row.bots.spammer.winRate*100).toFixed(0).padStart(3)}%  upgrader ${(row.bots.upgrader.winRate*100).toFixed(0).padStart(3)}%  random ${(row.bots.random.winRate*100).toFixed(0).padStart(3)}%`);
}
// ---------- chapter finales with the upgrades a player would own by then ----------
const finales = [];
const upgradeValue = [];
if (!QUICK && ONLY==null){
  console.log('\nChapter finales with expected Garden Shed upgrades:');
  for (const LV of LEVELS.filter(l => l.li===l.ch.levels.length-1)){
    const row = { gi:LV.gi, name:LV.name, chapter:LV.ch.name, players:{} };
    for (const pl of PLAYERS){
      const stars = starsBefore(LV.gi, pl.starsPerLevel), { owned, left } = shop(stars, LV.gi), set = perkValues(owned);
      const sum = k => summarize(Array.from({length:RUNS}, (_,i) => playOne(LV.gi, STRATEGIES[k], SEED*200000+LV.gi*1000+i, set)));
      row.players[pl.id] = { stars, left, owned:describe(owned), sensible:sum('balanced'), beginner:sum('random') };
      const r=row.players[pl.id];
      console.log(`  ${LV.name.padEnd(14)} ${pl.name.padEnd(13)} ★${String(stars).padStart(2)}  sensible 3★ ${(r.sensible.threeStar*100).toFixed(0).padStart(3)}%  beginner win ${(r.beginner.winRate*100).toFixed(0).padStart(3)}%  (${r.owned})`);
    }
    finales.push(row);
  }
  // What each upgrade adds to a typical player's real setup at each finale:
  // their usual upgrades with that one taken away, versus with it maxed.
  console.log('\nWhat each Garden Shed upgrade adds to a typical player, across the finales:');
  const fin = LEVELS.filter(l => l.li===l.ch.levels.length-1);
  const typicalAt = gi => shop(starsBefore(gi, 2.5), gi).owned;
  const test = edit => { let three=0, won=0, n=0;
    for (const LV of fin){ const set=perkValues(edit({ ...typicalAt(LV.gi) }));
      for (let i=0;i<Math.ceil(RUNS*.75);i++){ const g=playOne(LV.gi, STRATEGIES.balanced, SEED*300000+LV.gi*1000+i, set); three+=g.stars===3; won+=g.won; n++; } }
    return { threeStar:three/n, winRate:won/n }; };
  const base = test(o => o);
  for (const p of PERKS){
    const cost = p.costs.reduce((a,b)=>a+b,0);
    const without = test(o => { delete o[p.id]; return o; }), withMax = test(o => { o[p.id]=p.costs.length; return o; });
    upgradeValue.push({ id:p.id, name:p.name, cost, without:without.threeStar, threeStar:withMax.threeStar, perStar:(withMax.threeStar-without.threeStar)/cost });
    console.log(`  ${p.name.padEnd(15)} ★${cost}  3★ without ${(without.threeStar*100).toFixed(0).padStart(3)}% → maxed ${(withMax.threeStar*100).toFixed(0).padStart(3)}%  (+${((withMax.threeStar-without.threeStar)*100/cost).toFixed(1)} pts per star)`);
  }
  upgradeValue.base = base;
}

// ---------- the Sprayer: how much it helps on the levels that have it ----------
const sprayCheck = [];
if (!QUICK && ONLY==null){
  console.log('\nPesticide Sprayer (sensible player, typical upgrades), with vs without spraying:');
  for (const LV of LEVELS.filter(l => l.gi >= SPRAY.unlock)){
    const set = perksFor(LV.gi);
    // A player who never sprays spends their stars on garden upgrades instead of sprayer ones.
    const noSpraySet = perkValues(shop(starsBefore(LV.gi, 2.5), 0).owned);
    const games = on => Array.from({length:RUNS}, (_,i) => playOne(LV.gi, STRATEGIES.balanced, SEED*400000+LV.gi*1000+i, on ? set : noSpraySet, on));
    const w = games(true), wo = games(false);
    const row = { gi:LV.gi, name:LV.name, resist:LV.resist, with:summarize(w), without:summarize(wo), sprays:w.reduce((a,g)=>a+g.sprays,0)/w.length };
    sprayCheck.push(row);
    console.log(`  ${LV.name.padEnd(14)} resist ${String(Math.round(LV.resist*100)).padStart(2)}%  3★ ${(row.without.threeStar*100).toFixed(0).padStart(3)}% → ${(row.with.threeStar*100).toFixed(0).padStart(3)}%   win ${(row.without.winRate*100).toFixed(0).padStart(3)}% → ${(row.with.winRate*100).toFixed(0).padStart(3)}%   sprays per game ${row.sprays.toFixed(1)}`);
  }
}

const meta = { runs:RUNS, perks:PERK_MODE, seed:SEED, seconds:(Date.now()-t0)/1000, date:new Date().toISOString() };
const { html, fragment, flags } = buildReport(results, meta, { finales, upgradeValue, base:upgradeValue.base, sprayCheck });
const dir = new URL('./reports/', import.meta.url);
await mkdir(dir, { recursive:true });
await writeFile(new URL('latest.json', dir), JSON.stringify({ meta, flags, results, finales, upgradeValue, sprayCheck }, null, 2));
await writeFile(new URL('report.html', dir), html);
await writeFile(new URL('report-page.html', dir), fragment);
console.log(`\n${flags.length} things to look at:`);
for (const f of flags) console.log(`  [${f.kind}] ${f.level}: ${f.text}`);
console.log(`\nDone in ${meta.seconds.toFixed(1)}s. Report: tools/balance/reports/report.html`);
