// Renders the app icon and splash screens from the game's art.
// Usage (needs Playwright):  npx playwright install chromium  then  node tools/icons/render.cjs
// Serve the project root first, e.g.  npx serve . -l 8767
const { chromium } = require('playwright');
const base = process.env.ART_URL || 'http://localhost:8767/tools/icons/art.html';
const jobs = [
  ['assets/icon.png', 'icon', 1024], ['web/icons/icon-512.png', 'icon', 512], ['web/icons/icon-192.png', 'icon', 192],
  ['web/icons/apple-touch-icon.png', 'icon', 180], ['web/icons/favicon-32.png', 'icon', 32],
  ['assets/splash.png', 'splash', 2732], ['assets/splash-dark.png', 'splash&dark=1', 2732],
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [out, kind, size] of jobs){
    await p.setViewportSize({ width:size, height:size });
    await p.goto(`${base}?kind=${kind}&size=${size}`); await p.waitForFunction(() => document.title === 'ready');
    await (await p.$('#c')).screenshot({ path: out, omitBackground: false });
    console.log('saved', out);
  }
  await b.close();
})();
