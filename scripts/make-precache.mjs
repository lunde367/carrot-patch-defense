// Lists every file the game needs, so the website's offline cache (web/sw.js) can fetch them all
// the first time someone plays, not only the ones they happened to open. Run before publishing.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = new URL('../web/', import.meta.url).pathname, skip = /(^|\/)(sw\.js|precache\.json|privacy\.html|support\.html|README\.md)$|\.map$/;
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [relative(root, p)]; });
const files = ['./', ...walk(root).filter(f => !skip.test(f)).sort()];
writeFileSync(join(root, 'precache.json'), JSON.stringify(files));
console.log(`precache.json: ${files.length} files`);
