// Starts a new game in the family, with the shared kit already in place.
// Usage: npm run new-game -- "Pond Pals"
// Creates ../pond-pals/ next to this project, ready for `npm run dev`.
import { cp, mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv.slice(2).join(' ').trim();
if (!name){ console.error('Give the game a name, e.g.  npm run new-game -- "Pond Pals"'); process.exit(1); }
const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dest = join(root, '..', id);
if (existsSync(dest)){ console.error(`${dest} already exists.`); process.exit(1); }

await cp(join(root,'templates','new-game'), dest, { recursive:true });
await cp(join(root,'web','kit'), join(dest,'web','kit'), { recursive:true });
await mkdir(join(dest,'scripts'), { recursive:true });
await cp(join(root,'scripts','fetch-fonts.mjs'), join(dest,'scripts','fetch-fonts.mjs'));
await cp(join(root,'.github'), join(dest,'.github'), { recursive:true });
await cp(join(root,'.gitignore'), join(dest,'.gitignore'));

const pkg = JSON.parse(await readFile(join(root,'package.json'),'utf8'));
pkg.name = id; pkg.version = '0.1.0'; pkg.description = name; delete pkg.scripts['new-game'];
await writeFile(join(dest,'package.json'), JSON.stringify(pkg, null, 2)+'\n');
const cap = JSON.parse(await readFile(join(root,'capacitor.config.json'),'utf8'));
cap.appId = 'com.example.' + id.replace(/-/g,''); cap.appName = name;
await writeFile(join(dest,'capacitor.config.json'), JSON.stringify(cap, null, 2)+'\n');

// Fill in the name placeholders.
async function walk(dir){
  for (const f of await readdir(dir)){
    const p = join(dir,f);
    if ((await stat(p)).isDirectory()){ if (f !== 'kit') await walk(p); continue; }
    if (!/\.(html|js|css|md)$/.test(f)) continue;
    const s = await readFile(p,'utf8');
    if (s.includes('__GAME_')) await writeFile(p, s.replaceAll('__GAME_NAME__', name).replaceAll('__GAME_ID__', id));
  }
}
await walk(join(dest,'web'));
await writeFile(join(dest,'README.md'), `# ${name}\n\nA game in the cozy family, built on the shared kit in \`web/kit/\`.\n\n- \`npm run dev\` to play locally\n- \`npm run fonts\` once to bundle fonts\n- See the Carrot Patch README for building the iPhone and Android apps.\n`);
console.log(`Created ${dest}\nNext:  cd ../${id} && npm run dev`);
