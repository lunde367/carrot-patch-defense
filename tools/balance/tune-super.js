// Tune late gardens for a player who uses Supers.
//
//   node tools/balance/tune-super.js --from 18 --to 35            print a toughness for each garden
//
// From Part 3 on, the gardens assume you've grown some Super defenders. For each garden this searches for the
// toughness at which the "rush" player (stars poured into Supers, grown as soon as they can be afforded) wins
// on Normal almost every time but gets 3 stars only about half the time. Paste the results into TOUGHNESS.
import { G, DIFFICULTY } from '../../web/js/engine/game.js';
import { LEVELS } from '../../web/js/data/levels.js';
process.argv.push('--players', 'rush');            // super.js reads this; its table isn't printed when imported
const { play } = await import('./super.js');
const arg = (n, d) => { const i=process.argv.indexOf('--'+n); return i>0 ? +process.argv[i+1] : d; };
const FROM=arg('from',18), TO=arg('to',35), RUNS=arg('runs',8), WHO=process.argv.includes('--player') ? process.argv[process.argv.indexOf('--player')+1] : 'rush';
G.diff = DIFFICULTY.normal.hp;
const rate = gi => { let three=0, win=0;
  for (let i=0;i<RUNS;i++){ const a=play(gi, 9000+i, WHO, 'value'), b=play(gi, 9000+i, WHO, 'mixed'); const r=(a.won&&!b.won)||(a.three&&!b.three)?a:b; win+=r.won; three+=r.three; }
  return { win:win/RUNS, three:three/RUNS }; };
for (let gi=FROM; gi<=TO; gi++){
  const L=LEVELS[gi], base=L.hpMul; let lo=.6, hi=2.4, res=null;
  // halve the range 6 times: too easy (3 stars more than ~55%) → tougher; too hard (lose, or 3 stars under ~40%) → easier
  for (let step=0; step<6; step++){ const m=(lo+hi)/2; L.hpMul=base*m; const r=rate(gi);
    if (r.win>=.85 && r.three>.55) lo=m; else if (r.win<.85 || r.three<.4) hi=m; else { lo=hi=m; res=r; break; } }
  const best=(lo+hi)/2; if (!res){ L.hpMul=base*best; res=rate(gi); }
  L.hpMul=base;
  console.log(`${String(gi).padStart(2)} ${L.name.padEnd(18)} ×${best.toFixed(2)}  (rush on Normal: win ${Math.round(res.win*100)}%, 3★ ${Math.round(res.three*100)}%)`);
}
