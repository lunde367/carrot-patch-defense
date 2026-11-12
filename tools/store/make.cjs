// Makes the store screenshots and the Google Play feature graphic from the real game.
// Usage (needs Playwright):  serve the project root (e.g.  python3 -m http.server 8767),  then
//   node tools/store/make.cjs
// Output goes to store/. Sizes: iPhone 6.7" (1290×2796), iPad 12.9" (2048×2732), Android phone (1080×2400).
// Check the sizes each store currently asks for before uploading; they change from time to time.
const { chromium } = require('playwright');
const base = process.env.GAME_URL || 'http://localhost:8767';
const DEVICES = [
  ['iphone',  { width:430, height:932 }, 3],
  ['ipad',    { width:1024, height:1366 }, 2],
  ['android', { width:360, height:800 }, 3],
];
// A finished save, so every garden, defender and diary page is there to show.
const SAVE = () => {
  const stars = Array.from({ length:36 }, (_, i) => (i % 4 === 1 ? 2 : 3));
  const all = n => Object.fromEntries(n.map(k => [k, true]));
  return { v:2, stars, tutorialDone:true, shedTour:true, ended:true, bonusStars:0,
    settings:{ sfx:false, music:false, speed:1, diff:'normal', diffAsked:true },
    seen:all(['bunny','rose','squirrel','sprinkler','pine','owl','sunflower','scarecrow','barrel','hive','ladybug','spray','fert']),
    intros:all([...Array(37).keys()]), parts:all([1,2,3,4]), fold:{ open:1, cur:4 },
    perks:{ pouch:3, fence:2, thumb:2, reach:2, harvest:2 }, endless:{ best:17, runs:4 },
    stats:{ wins:52, losses:9, kills:8421, bossKills:41, flowerSeeds:2210, clears:23, sprayHits:312, ferts:44, scares:67 } };
};
// Play a level with the robot player up to a wave, then stop a few seconds into the next one.
const battle = async (p, gi, waves, secs) => p.evaluate(async ({ gi, waves, secs }) => {
  const ui = await import('/web/js/ui/ui.js'), g = await import('/web/js/engine/game.js');
  const { TYPES } = await import('/web/js/data/towers.js'), bots = await import('/tools/balance/bots.js');
  ui.play(gi); const S = g.G.S; S.paused = false; document.getElementById('over').hidden = true; bots.preparePath();
  const avail = Object.keys(TYPES).filter(k => TYPES[k].unlock <= gi);
  for (let w = 0; w < waves; w++){
    bots.STRATEGIES.balanced(avail, w+1); g.startWave();
    const until = w === waves-1 ? secs : 900; let t = 0;
    while (S.mode === 'play' && S.active && t < until){ g.update(1/30); t += 1/30; }
  }
  S.speed = 1; S.paused = true;          // freeze the moment
}, { gi, waves, secs });
const SCENES = [
  ['1-backyard', async p => battle(p, 4, 5, 9)],
  ['2-big-garden', async p => battle(p, 35, 6, 12)],
  ['3-dry-years', async p => battle(p, 20, 5, 10)],
  ['4-gardens', async p => { await p.evaluate(async () => (await import('/web/js/ui/ui.js')).showMenu()); }],
  ['5-diary', async p => { await p.evaluate(async () => (await import('/web/js/ui/ui.js')).showMenu()); await p.click('[data-go="diary"]'); }],
  ['6-field-guide', async p => { await p.evaluate(async () => (await import('/web/js/ui/ui.js')).showMenu()); await p.click('[data-go="guide"]'); await p.click('[data-tab="pests"]'); }],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, viewport, scale] of DEVICES){
    const ctx = await b.newContext({ viewport, deviceScaleFactor:scale, isMobile:name!=='ipad', hasTouch:true });
    await ctx.addInitScript(save => { try { localStorage.setItem('carrot-patch-save', save); } catch {} }, JSON.stringify(SAVE()));
    const p = await ctx.newPage();
    for (const [scene, run] of SCENES){
      await p.goto(base + '/web/index.html'); await p.waitForTimeout(1800);
      await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
      await run(p); await p.waitForTimeout(700);
      await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
      const out = `store/screenshots/${name}/${scene}.png`;
      await p.screenshot({ path: out }); console.log('saved', out);
    }
    await ctx.close();
  }
  // Google Play feature graphic, 1024×500
  const p = await b.newPage({ viewport:{ width:1024, height:500 } });
  await p.setContent(`<body style="margin:0;width:1024px;height:500px;display:flex;align-items:center;gap:48px;padding:0 72px;box-sizing:border-box;
      background:linear-gradient(135deg,#a6cf8a,#7fb86a);font-family:'Arial Rounded MT Bold','Nunito',system-ui,sans-serif">
    <img src="${base}/assets/icon.png" style="width:300px;height:300px;border-radius:66px;box-shadow:0 14px 40px rgba(30,60,20,.35)">
    <div><div style="font-size:74px;font-weight:800;line-height:1;color:#243524">Carrot Patch<br><span style="color:#fff;text-shadow:0 3px 0 #c9641a">Defense</span></div>
      <div style="font-size:30px;font-weight:700;color:#2f4a2a;margin-top:18px">A cozy garden tower defense</div></div></body>`);
  await p.waitForTimeout(600); await p.screenshot({ path:'store/feature-graphic.png' }); console.log('saved store/feature-graphic.png');
  await b.close();
})();
