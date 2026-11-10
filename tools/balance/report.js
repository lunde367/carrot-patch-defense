// Turns balance results into flags (things worth tuning) and a readable HTML report.
import { TYPES } from '../../web/js/data/towers.js';
import { ENEMY } from '../../web/js/data/enemies.js';
import { WAVES } from '../../web/js/data/levels.js';

const pct = v => v==null ? '—' : Math.round(v*100)+'%';
const median = a => { const s=[...a].sort((x,y)=>x-y); return s.length ? s[Math.floor(s.length/2)] : 0; };

export function findFlags(results){
  const flags=[];
  const add=(kind,row,text)=>flags.push({ kind, level:`${row.gi+1}. ${row.name}`, gi:row.gi, text });
  results.forEach((row,i)=>{
    const b=row.bots.balanced, r=row.bots.random, prev=results[i-1];
    if (b.winRate<.6) add('Too hard', row, `A sensible player wins only ${pct(b.winRate)} of the time.`);
    if (row.gi>0 && r.winRate>=.9 && b.threeStar>=.9) add('Too easy', row, `Even random play wins ${pct(r.winRate)}, and a sensible player gets 3 stars ${pct(b.threeStar)} of the time.`);
    if (prev && prev.gi===row.gi-1 && prev.bots.balanced.winRate-b.winRate>.35)
      add('Spike', row, `Win rate drops from ${pct(prev.bots.balanced.winRate)} to ${pct(b.winRate)} compared with the level before.`);
    if (b.winRate<.85 && b.lossWave===WAVES) add('Boss', row, `Most losses happen on the boss wave. The ${ENEMY[row.boss].name} may be too tough.`);
    const monos=Object.entries(row.mono).sort((a,b)=>b[1].winRate-a[1].winRate);
    if (monos.length>=3 && monos[0][1].winRate>=.85 && monos[1][1].winRate<=.4)
      add('Dominant', row, `${TYPES[monos[0][0]].name} alone wins ${pct(monos[0][1].winRate)}; the next best single defender wins ${pct(monos[1][1].winRate)}.`);
  });
  // Defenders that are clearly worse than the others across several levels.
  for (const type of Object.keys(TYPES)){
    const weakAt=results.filter(row=>{
      const m=row.mono[type]; if (!m) return false;
      if (TYPES[type].ground && row.fliers) return false;   // can't hit fliers by design
      const others=Object.entries(row.mono).filter(([k])=>k!==type).map(([,v])=>v.winRate);
      return others.length>=2 && m.winRate<.2 && median(others)>=.6;
    });
    if (weakAt.length>=2) flags.push({ kind:'Weak', level:'Several levels', gi:99, text:`${TYPES[type].name} on its own loses on ${weakAt.map(r=>r.name).join(', ')} while most other defenders win. It may need a boost (or is meant as a helper).` });
  }
  return flags;
}

export function findExtraFlags({ finales=[], upgradeValue=[] }){
  const flags=[];
  for (const f of finales){
    const t=f.players.typical, s=f.players.struggling, lvl=`${f.gi+1}. ${f.name}`;
    if (t && t.sensible.threeStar>=.95 && t.beginner.winRate>=.95)
      flags.push({ kind:'Too easy', level:lvl, gi:f.gi, text:`With the upgrades a typical player owns by now (${t.owned}), even a beginner always wins this finale.` });
    if (s && s.sensible.winRate<.75)
      flags.push({ kind:'Too hard', level:lvl, gi:f.gi, text:`A struggling player (★${s.stars}, owning ${s.owned}) still wins only ${pct(s.sensible.winRate)}.` });
  }
  if (upgradeValue.length>=3){
    const per=upgradeValue.map(u=>u.perStar), med=median(per);
    for (const u of upgradeValue){
      if (med>0 && u.perStar>=2*med && u.perStar>.08) flags.push({ kind:'Upgrade', level:'Garden Shed', gi:100, text:`${u.name} is a bargain: +${(u.perStar*100).toFixed(1)} three-star points per star spent, about ${(u.perStar/med).toFixed(1)}× the typical upgrade.` });
      if (u.perStar<=.005) flags.push({ kind:'Upgrade', level:'Garden Shed', gi:100, text:`${u.name} barely changes three-star results. It may only help you survive, not earn stars.` });
    }
  }
  return flags;
}

export function buildReport(results, meta, extras={}){
  const flags=[...findFlags(results), ...findExtraFlags(extras)];
  const { finales=[], upgradeValue=[], base } = extras;
  const monoTypes=Object.keys(TYPES).filter(k=>results.some(r=>r.mono[k]));
  const BOTS=[['balanced','Sensible'],['upgrader','Upgrader'],['spammer','Spammer'],['random','Beginner']];

  // Difficulty curve: sensible and beginner win rate per level, drawn to scale.
  const W=640, H=220, L=40, R=12, T=14, B=40, iw=W-L-R, ih=H-T-B, step=iw/results.length, bw=Math.min(22, step/3);
  const y=v=>T+ih*(1-v);
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Win rate per level">`;
  for (const g of [0,.25,.5,.75,1]) svg+=`<line x1="${L}" x2="${W-R}" y1="${y(g)}" y2="${y(g)}" class="grid"/><text x="${L-6}" y="${y(g)+4}" class="ax" text-anchor="end">${g*100}%</text>`;
  results.forEach((row,i)=>{
    const cx=L+step*i+step/2;
    [['balanced','s1',-bw/2-1],['random','s2',bw/2+1]].forEach(([k,cls,dx])=>{
      const v=row.bots[k].winRate; svg+=`<rect x="${cx+dx-bw/2}" y="${y(v)}" width="${bw}" height="${ih*v}" rx="3" class="${cls}"><title>${row.name}: ${pct(v)}</title></rect>`;
    });
    svg+=`<text x="${cx}" y="${H-B+16}" class="ax" text-anchor="middle">${row.gi+1}</text>`;
    if (i===0 || results[i-1].chapter!==row.chapter) svg+=`<text x="${cx-step/2+4}" y="${H-6}" class="ax ch">${row.chapter}</text>`;
  });
  svg+=`</svg>`;

  const cell=(v, good=true)=>{ if (v==null) return '<td class="na">—</td>'; const t=good?v:1-v;
    const cls=t>=.85?'hi':t>=.6?'mid':t>=.3?'low':'bad'; return `<td class="${cls}">${pct(v)}</td>`; };
  const botRows=results.map(r=>`<tr><th>${r.gi+1}. ${r.name}<small>${r.chapter}</small></th>${BOTS.map(([k])=>cell(r.bots[k].winRate)).join('')}
    <td>${pct(r.bots.balanced.threeStar)}</td><td>${r.bots.balanced.avgLost==null?'—':r.bots.balanced.avgLost.toFixed(1)}</td><td>${r.bots.balanced.lossWave??'—'}</td></tr>`).join('');
  const monoRows=results.map(r=>`<tr><th>${r.gi+1}. ${r.name}</th>${monoTypes.map(k=>r.mono[k]?cell(r.mono[k].winRate):'<td class="na">locked</td>').join('')}</tr>`).join('');
  const flagList = flags.length ? flags.map(f=>`<li><span class="tag t-${f.kind.replace(/\s/g,'')}">${f.kind}</span><div><b>${f.level}</b><span>${f.text}</span></div></li>`).join('')
    : '<li class="ok">Nothing stands out. Every level is winnable and none is a pushover.</li>';

  const body = `
<main class="rep">
  <header><p class="eyebrow">Carrot Patch Defense</p><h1>Balance Check</h1>
    <p class="meta">${meta.runs} games per robot player per level · Garden Shed upgrades: ${meta.perks==='all'?'all owned':'none'} · seed ${meta.seed} · ${new Date(meta.date).toLocaleString()}</p></header>
  <section><h2>Things to look at</h2><ul class="flags">${flagList}</ul></section>
  <section><h2>Difficulty curve</h2><p class="note">How often each robot wins, level by level. A healthy curve slopes gently down, with the beginner falling behind the sensible player.</p>
    <div class="legend"><span><i class="s1"></i>Sensible player</span><span><i class="s2"></i>Beginner (random)</span></div>
    <div class="chart">${svg}</div></section>
  <section><h2>Win rate by robot player</h2>
    <div class="scroll"><table><thead><tr><th>Level</th>${BOTS.map(([,n])=>`<th>${n}</th>`).join('')}<th>3★ (sensible)</th><th>Crops lost</th><th>Usual losing wave</th></tr></thead><tbody>${botRows}</tbody></table></div>
    <p class="note">Sensible: a mix of defenders plus upgrades. Upgrader: few defenders, maxed out. Spammer: lots of defenders, no upgrades. Beginner: random choices. "Crops lost" is the sensible player's average in games it won.</p></section>
  ${finales.length?`<section><h2>Chapter finales with expected upgrades</h2>
    <p class="note">The last level of each garden, played with the Garden Shed upgrades a player would own by then. Stars are spent cheapest-first.</p>
    <div class="scroll"><table><thead><tr><th>Finale</th><th>Player</th><th>Stars</th><th>Upgrades owned</th><th>3★ (sensible)</th><th>Beginner wins</th></tr></thead><tbody>
    ${finales.map(f=>Object.entries(f.players).map(([id,p],i)=>`<tr>${i===0?`<th rowspan="3">${f.gi+1}. ${f.name}<small>${f.chapter}</small></th>`:''}
      <td class="lbl">${{struggling:'Struggling (2★/level)',typical:'Typical (2.5★/level)',perfect:'Perfectionist (3★/level)'}[id]}</td><td>★ ${p.stars}</td><td class="wrap">${p.owned}</td>
      ${cell(p.sensible.threeStar)}${cell(p.beginner.winRate)}</tr>`).join('')).join('')}</tbody></table></div></section>`:''}
  ${upgradeValue.length?`<section><h2>What each upgrade is worth</h2>
    <p class="note">Each Garden Shed upgrade owned alone and maxed, across the three finales. Without upgrades a sensible player gets 3 stars ${pct(base.threeStar)} of the time. "Per star" is the gain for each star it costs.</p>
    <div class="scroll"><table><thead><tr><th>Upgrade</th><th>Total cost</th><th>3★ with it</th><th>Gain per star</th></tr></thead><tbody>
    ${upgradeValue.map(u=>`<tr><th>${u.name}</th><td>★ ${u.cost}</td>${cell(u.threeStar)}<td>+${(u.perStar*100).toFixed(1)} pts</td></tr>`).join('')}</tbody></table></div></section>`:''}
  <section><h2>One defender only</h2>
    <div class="scroll"><table><thead><tr><th>Level</th>${monoTypes.map(k=>`<th>${TYPES[k].name}</th>`).join('')}</tr></thead><tbody>${monoRows}</tbody></table></div>
    <p class="note">Win rate when a robot uses just one kind of defender. One column far above the rest means that defender is too strong; a column that's always low may need a boost. Sprinklers and Pine Trees are expected to struggle alone where pests fly.</p></section>
</main>`;

  const style = `
:root{ --bg:#f3f6ec; --surface:#ffffff; --line:#d9e1cc; --ink:#25301d; --muted:#66745b; --s1:#e07a26; --s2:#7aa6c9;
  --hi:#d7ecc6; --mid:#eef3d2; --low:#f8e2c6; --bad:#f4cbd0; --hi-ink:#25401a; --bad-ink:#6b1c2a;
  --display:'Sniglet','Nunito',ui-rounded,system-ui,sans-serif; --body:'Nunito',ui-rounded,system-ui,sans-serif }
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){ --bg:#182016; --surface:#222c1e; --line:#35432e; --ink:#e6eedb; --muted:#9dad8d; --s1:#f0913f; --s2:#86b3d6;
  --hi:#2f4a26; --mid:#3b4423; --low:#4a3a22; --bad:#4d2630; --hi-ink:#d7f0c4; --bad-ink:#f6c6cf; color-scheme:dark }}
:root[data-theme="dark"]{ --bg:#182016; --surface:#222c1e; --line:#35432e; --ink:#e6eedb; --muted:#9dad8d; --s1:#f0913f; --s2:#86b3d6;
  --hi:#2f4a26; --mid:#3b4423; --low:#4a3a22; --bad:#4d2630; --hi-ink:#d7f0c4; --bad-ink:#f6c6cf; color-scheme:dark }
body{ margin:0; background:var(--bg); color:var(--ink); font-family:var(--body); font-size:15px; line-height:1.45;
  padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); padding-block:20px 40px }
.rep{ max-width:860px; margin:0 auto; display:flex; flex-direction:column; gap:30px }
h1,h2{ font-family:var(--display); margin:0; text-wrap:balance } h1{ font-size:2rem } h2{ font-size:1.25rem; margin-bottom:10px }
.eyebrow{ margin:0 0 2px; font-size:.75rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--s1) }
.meta,.note{ color:var(--muted); margin:8px 0 0; max-width:68ch } .note{ font-size:.88rem }
.flags{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px }
.flags li{ display:flex; gap:12px; align-items:flex-start; background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:10px 12px }
.flags li div{ display:flex; flex-direction:column; min-width:0 } .flags li span:not(.tag){ color:var(--muted) } .flags li.ok{ color:var(--muted) }
.tag{ flex:none; font-size:.68rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; border-radius:999px; padding:3px 9px; margin-top:2px; background:var(--low); color:var(--ink) }
.t-Upgrade{ background:var(--mid) }
.t-Toohard,.t-Boss,.t-Spike{ background:var(--bad); color:var(--bad-ink) } .t-Tooeasy{ background:var(--hi); color:var(--hi-ink) }
.legend{ display:flex; gap:16px; font-size:.85rem; color:var(--muted); margin:10px 0 6px } .legend i{ display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:6px; vertical-align:-1px }
.legend .s1{ background:var(--s1) } .legend .s2{ background:var(--s2) }
.chart{ background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:10px; overflow-x:auto }
.chart svg{ width:100%; min-width:520px; height:auto; display:block }
.chart .grid{ stroke:var(--line); stroke-width:1 } .chart .ax{ fill:var(--muted); font-size:11px; font-family:var(--body) } .chart .ch{ font-weight:800 }
.chart rect.s1{ fill:var(--s1) } .chart rect.s2{ fill:var(--s2) }
.scroll{ overflow-x:auto; background:var(--surface); border:1px solid var(--line); border-radius:12px }
table{ border-collapse:collapse; width:100%; font-variant-numeric:tabular-nums; font-size:.88rem }
th,td{ padding:8px 10px; text-align:center; border-bottom:1px solid var(--line); white-space:nowrap }
thead th{ font-size:.75rem; color:var(--muted); font-weight:800 } tbody th{ text-align:left; font-weight:800 }
tbody th small{ display:block; font-weight:600; color:var(--muted); font-size:.75rem }
td.hi{ background:var(--hi); color:var(--hi-ink); font-weight:800 } td.mid{ background:var(--mid) } td.low{ background:var(--low) }
td.bad{ background:var(--bad); color:var(--bad-ink); font-weight:800 } td.na{ color:var(--muted) }
tr:last-child th, tr:last-child td{ border-bottom:0 }
td.lbl{ text-align:left } td.wrap{ white-space:normal; text-align:left; min-width:180px; font-size:.82rem; color:var(--muted) }`;

  const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800&family=Sniglet:wght@800&display=swap">`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Balance Check</title>${fonts}<style>${style}</style></head><body>${body}</body></html>`;
  // Same page without the document wrapper, for publishing as a shared page.
  const fragment = `<title>Balance Check</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${fonts}\n<style>${style}</style>\n${body}`;
  return { html, fragment, flags };
}
