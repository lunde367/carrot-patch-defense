// One-time touches to the iPhone and Android projects that Capacitor creates:
// lock the game to portrait and copy the version number from package.json.
// Usage: npm run app:setup   (after `npx cap add ios` / `npx cap add android`; safe to run again)
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const root = new URL('../', import.meta.url), at = p => new URL(p, root);
const { version } = JSON.parse(await readFile(at('package.json'), 'utf8'));
const build = process.env.BUILD_NUMBER || '1';
const edit = async (p, fn) => { if (!existsSync(at(p))) return console.log('skipped (not there yet):', p);
  const before = await readFile(at(p), 'utf8'), after = fn(before);
  if (after !== before) await writeFile(at(p), after); console.log(after !== before ? 'updated:' : 'already fine:', p); };

// iPhone and iPad: portrait only, full screen (an iPad app may only limit rotation when it is full screen).
await edit('ios/App/App/Info.plist', s => {
  s = s.replace(/(<key>UISupportedInterfaceOrientations(?:~ipad)?<\/key>\s*<array>)[\s\S]*?(<\/array>)/g,
    '$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2');
  if (!s.includes('UIRequiresFullScreen')) s = s.replace(/<\/dict>\s*<\/plist>/, '\t<key>UIRequiresFullScreen</key>\n\t<true/>\n</dict>\n</plist>');
  return s; });
await edit('ios/App/App.xcodeproj/project.pbxproj', s =>
  s.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`).replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`));

// Android: portrait only.
await edit('android/app/src/main/AndroidManifest.xml', s =>
  s.includes('android:screenOrientation') ? s : s.replace(/<activity\b/, '<activity\n            android:screenOrientation="portrait"'));
await edit('android/app/build.gradle', s =>
  s.replace(/versionName "[^"]*"/, `versionName "${version}"`).replace(/versionCode \d+/, `versionCode ${build}`));
