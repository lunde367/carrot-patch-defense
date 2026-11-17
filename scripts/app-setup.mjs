// One-time touches to the iPhone and Android projects that Capacitor creates:
// lock the game to portrait and copy the version number from package.json.
// Usage: npm run app:setup   (after `npx cap add ios` / `npx cap add android`; safe to run again)
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const root = new URL('../', import.meta.url), at = p => new URL(p, root);
const { version } = JSON.parse(await readFile(at('package.json'), 'utf8'));
const build = process.env.BUILD_NUMBER || '1';
const { ADS } = await import(at('web/js/data/config.js'));
const edit = async (p, fn) => { if (!existsSync(at(p))) return console.log('skipped (not there yet):', p);
  const before = await readFile(at(p), 'utf8'), after = fn(before);
  if (after !== before) await writeFile(at(p), after); console.log(after !== before ? 'updated:' : 'already fine:', p); };

// iPhone and iPad: portrait only, full screen (an iPad app may only limit rotation when it is full screen).
await edit('ios/App/App/Info.plist', s => {
  s = s.replace(/(<key>UISupportedInterfaceOrientations(?:~ipad)?<\/key>\s*<array>)[\s\S]*?(<\/array>)/g,
    '$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2');
  // AdMob needs the app's ad id here, or the app closes the moment it opens.
  const ad = `\t<key>GADApplicationIdentifier</key>\n\t<string>${ADS.appId.ios}</string>\n`;
  s = /<key>GADApplicationIdentifier<\/key>/.test(s)
    ? s.replace(/\t?<key>GADApplicationIdentifier<\/key>\s*<string>[^<]*<\/string>\n?/, ad)
    : s.replace(/<\/dict>\s*<\/plist>/, ad + '\t<key>GADIsAdManagerApp</key>\n\t<true/>\n\t<key>SKAdNetworkItems</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>SKAdNetworkIdentifier</key>\n\t\t\t<string>cstr6suwn9.skadnetwork</string>\n\t\t</dict>\n\t</array>\n</dict>\n</plist>');
  if (!s.includes('UIRequiresFullScreen')) s = s.replace(/<\/dict>\s*<\/plist>/, '\t<key>UIRequiresFullScreen</key>\n\t<true/>\n</dict>\n</plist>');
  return s; });
await edit('ios/App/App.xcodeproj/project.pbxproj', s =>
  s.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`).replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`));

// Android: portrait only.
await edit('android/app/src/main/AndroidManifest.xml', s =>
  s.includes('android:screenOrientation') ? s : s.replace(/<activity\b/, '<activity\n            android:screenOrientation="portrait"'));
await edit('android/app/build.gradle', s =>
  s.replace(/versionName "[^"]*"/, `versionName "${version}"`).replace(/versionCode \d+/, `versionCode ${build}`));
// Android test builds: always sign with the project's own test key. Left to itself the build machine
// uses whatever debug key it happens to have, and Android refuses to update an app whose key changed.
await edit('android/app/build.gradle', s => s.includes('test.keystore') ? s : s + `
android {
    signingConfigs {
        debug {
            storeFile file('../../tools/app/test.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
`);
// Android: the app's ad id (AdMob closes the app at launch without it).
await edit('android/app/src/main/res/values/strings.xml', s => /name="admob_app_id"/.test(s)
  ? s.replace(/<string name="admob_app_id">[^<]*<\/string>/, `<string name="admob_app_id">${ADS.appId.android}</string>`)
  : s.replace('</resources>', `    <string name="admob_app_id">${ADS.appId.android}</string>\n</resources>`));
await edit('android/app/src/main/AndroidManifest.xml', s => s.includes('com.google.android.gms.ads.APPLICATION_ID') ? s
  : s.replace(/(<application\b[^>]*>)/, '$1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id"/>'));
