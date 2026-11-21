// First-time player check: a robot opens the game with a brand-new save, follows the tutorial the way
// a person would (tapping the real buttons and the real board), wins the first garden, reads the journal
// page, and starts the next two gardens. It saves a screenshot of every card it sees, and fails if the
// game throws an error, the tutorial stalls, or the first garden isn't won.
//
//   node tools/test/first-play.mjs                 (needs Playwright: npm i -D playwright && npx playwright install chromium)
//   node tools/test/first-play.mjs --device "iPhone SE" --out test-shots
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const arg = (n, d) => { const i = process.argv.indexOf('--'+n); return i > 0 ? process.argv[i+1] : d; };
const DEVICE = arg('device', 'Pixel 7'), OUT = arg('out', 'test-shots'), ROOT = new URL('../../web/', import.meta.url).pathname;
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = path.endsWith('/') ? path+'index.html' : path;
  try { const body = await readFile(join(ROOT, file));
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const URL0 = `http://localhost:${server.address().port}/`;

const problems = [], seen = [];
const fail = msg => { problems.push(msg); console.log('  ✗ ' + msg); };
await mkdir(OUT, { recursive:true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ ...devices[DEVICE], serviceWorkers:'block' })).newPage();
page.on('pageerror', e => fail('page error: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) fail('console error: ' + m.text()); });
let shotN = 0;
const shot = async name => { const f = `${OUT}/${String(++shotN).padStart(2,'0')}-${name.replace(/[^\w]+/g,'-').slice(0,40)}.png`; await page.screenshot({ path:f }); };
const game = (fn, a) => page.evaluate(fn, a);

// one step of "what would a new player tap now?"
async function step(){
  const s = await game(async () => {
    const vis = el => el && !el.hidden && el.getClientRects().length > 0;
    const over = document.getElementById('over'), coach = [...document.querySelectorAll('.coach')].find(c => !c.hidden);
    const { G } = await import('/js/engine/game.js');
    if (vis(over) && over.innerText.trim()){
      const title = (over.querySelector('h2,h3') || {}).innerText || over.innerText.slice(0, 40);
      const btn = over.querySelector('.btn.main') || over.querySelector('.row button, button');
      return { kind:'card', title, sel: btn ? (btn.id ? '#'+btn.id : null) : null, go: btn && btn.dataset.go, text: btn && btn.innerText };
    }
    if (vis(coach)){
      const text = coach.querySelector('.coach-text').innerText, b = coach.querySelector('.coach-btn');
      if (b && !b.hidden) return { kind:'coach-btn', text };
      if (G.hint && G.hint.c != null && G.S && !G.S.sel && G.S.build){ return { kind:'cell', c:G.hint.c, r:G.hint.r, text }; }
      if (G.hint && G.hint.c != null && !G.hint.reach) return { kind:'cell', c:G.hint.c, r:G.hint.r, text };   // "tap your bunny"
      const t = [...document.querySelectorAll('.coach-target, [data-coach-target]')][0];
      return { kind:'coach-wait', text };
    }
    return { kind:'play', mode: G.S && G.S.mode, active: G.S && G.S.active, wave: G.S && G.S.wave, home: vis(document.getElementById('home')) };
  });
  return s;
}
const tapCell = async (c, r) => {
  const p = await game(async ([c, r]) => { const { COLS, ROWS } = await import('/js/data/levels.js'); const b = document.getElementById('cv').getBoundingClientRect();
    return { x: b.left + (c+.5)*b.width/COLS, y: b.top + (r+.5)*b.height/ROWS }; }, [c, r]);
  await page.mouse.click(p.x, p.y);
};
const tapTarget = async () => {   // the coach points at something: tap it
  const sel = await game(() => { const coach = [...document.querySelectorAll('.coach')].find(c => !c.hidden); const t = coach && coach.dataset.target; return t || null; });
  return sel;
};

console.log(`First-time player on ${DEVICE}`);
await page.goto(URL0 + '#'); await page.waitForTimeout(1200); await shot('start');
const t0 = Date.now(); let lastTitle = '', stall = 0, last = '', homeTaps = 0;
while (Date.now() - t0 < 480000){
  const s = await step(), key = JSON.stringify(s);
  if (key === last) stall++; else stall = 0; last = key;
  if (stall > 300) { fail('stuck on: ' + key); break; }
  if (s.kind === 'card'){
    if (s.title !== lastTitle){ lastTitle = s.title; seen.push(s.title); console.log('  card: ' + s.title.replace(/\s+/g,' ')); await shot(s.title); }
    if (/saved|cleared|stars?\b.*won|got the/i.test(s.title) && seen.length > 3) {}
    await page.locator('#over .btn.main, #over .row button').first().click(); await page.waitForTimeout(350);
    const done = await game(async () => { const { Save } = await import('/js/save.js'); return { won:(Save.data.stars[0]||0) > 0, tut:Save.data.tutorialDone, g1:(Save.data.stars[1]||0) }; });
    if (done.won && done.tut && /Leafy|Harvest/i.test(lastTitle)) break;
    continue;
  }
  if (s.kind === 'coach-btn'){ console.log('  tip: ' + s.text.slice(0, 60)); await shot('tip'); await page.locator('.coach:not([hidden]) .coach-btn:not([hidden])').click(); continue; }
  if (s.kind === 'cell'){ await tapCell(s.c, s.r); await page.waitForTimeout(250); continue; }
  if (s.kind === 'coach-wait'){
    // tap whatever the tip points at: a tray card, Start wave, the speed button or Upgrade
    const map = [['Tap it to pick it', '#card-bunny'], ['Sprinkler', '#card-sprinkler'], ['Start wave', '#go'], ['play faster', '#spd'],
                 ['next bend', '#card-bunny'], ['Upgrade it', '#iUp']];
    const hit = map.find(([k]) => s.text.includes(k));
    if (hit){ const el = page.locator(hit[1]); if (await el.isVisible() && await el.isEnabled()) await el.click(); }
    await page.waitForTimeout(400); continue;
  }
  // free play: start waves, speed up, and wait
  if (s.home){   // the home screen: a new player taps the big Start button
    if (++homeTaps > 3) break;
    await page.locator('#home .btn.main').first().click(); await page.waitForTimeout(600); continue;
  }
  if (s.mode === 'play' && !s.active){ const go = page.locator('#go'); if (await go.isEnabled()) await go.click(); }
  const spd = page.locator('#spd'); if (s.active && (await spd.innerText()).trim() === '1×') await spd.click();   // play at 2×, like most players
  await page.waitForTimeout(500);
}
const save = await game(async () => { const { Save } = await import('/js/save.js'); return { tut:Save.data.tutorialDone, stars:Save.data.stars.slice(0,3), diary:Object.keys(Save.data.diary||{}).length }; });
console.log('  result:', JSON.stringify(save));
if (!save.tut) fail('tutorial never finished');
if (!(save.stars[0] > 0)) fail('first garden not won');
if (!seen.some(t => /Cabbage|diary|garden/i.test(t))) fail('no journal page shown after the first garden');

// the next two gardens should open and run a wave without trouble
for (const gi of [1, 2]){
  await game(async gi => { (await import('/js/ui/ui.js')).play(gi); }, gi); await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++){ const b = page.locator('#over:not([hidden]) .btn.main, #over:not([hidden]) .row button').first(); if (!(await b.count())) break; await shot('garden'+(gi+1)+'-card'); await b.click(); await page.waitForTimeout(300); }
  await game(async () => { const g = await import('/js/engine/game.js'); const S = g.G.S; S.seeds = 400;
    for (const [c, r, t] of [[3,3,'bunny'],[6,4,'bunny'],[3,6,'sprinkler'],[6,7,'bunny']]){ S.build = t; g.plantAt(c, r); } S.build = null; });
  await page.locator('#go').click(); await page.waitForTimeout(6000); await shot('garden'+(gi+1)+'-wave');
}
await browser.close(); server.close();
console.log(problems.length ? `\n${problems.length} problem(s) found.` : '\nAll good.');
process.exit(problems.length ? 1 : 0);
