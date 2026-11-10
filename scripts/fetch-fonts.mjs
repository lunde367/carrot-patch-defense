// Downloads the game's fonts from Google Fonts into web/fonts/ so the app works offline.
// Usage: npm run fonts   (needs Node 18+ and an internet connection, run once)
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const out = new URL('../web/fonts/', import.meta.url);
const jobs = [
  { css:'https://fonts.googleapis.com/css2?family=Sniglet:wght@400&display=swap', file:'sniglet-400.woff2' },
  { css:'https://fonts.googleapis.com/css2?family=Sniglet:wght@800&display=swap', file:'sniglet-800.woff2' },
  { css:'https://fonts.googleapis.com/css2?family=Nunito:wght@500..800&display=swap', file:'nunito-variable.woff2', latin:true },
];

await mkdir(out, { recursive:true });
for (const j of jobs){
  const css = await (await fetch(j.css, { headers:{ 'User-Agent':UA } })).text();
  // Google splits fonts by alphabet; keep the basic Latin block (the last one listed).
  const urls = [...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map(m=>m[1]);
  if (!urls.length) throw new Error('No font found for '+j.file);
  const url = urls[urls.length-1];
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(new URL(j.file, out), buf);
  console.log('saved', j.file, (buf.length/1024).toFixed(0)+' KB');
}
