# Carrot Patch Defense

A cozy garden tower defense game. It's built as a plain web game (no build step), so the
same code runs in a browser, on GitHub Pages, and inside an iPhone/Android app via Capacitor.

## Play it locally

```
npm run dev        # then open http://localhost:5173
```

Add `#dev` to the end of the address (e.g. `http://localhost:5173/#dev`), or **tap the game's title 7 times**, for **test mode** (it stays on until you tap the title 7 times again):
every level and defender unlocked, tap the seeds counter for +200 seeds, and ads are simulated.
Test mode also adds a **Reset progress** button at the bottom of the garden picker that erases
all stars, upgrades and unlocks (two taps), so you can replay from the very beginning.

## Project layout

```
web/                    ← everything the player gets (this folder becomes the app)
  index.html
  kit/                  ← Cozy Kit: the shared look, sound and phone code for the whole game family
                          (open web/kit/index.html for the style guide; see web/kit/README.md)
  css/game.css          ← this game's own layout
  js/main.js            ← starts the game, game loop, sound hookups
  js/save.js            ← what gets saved: stars, Garden Shed upgrades, settings
  js/sounds.js          ← this game's sound effects and music
  js/data/              ← towers.js, enemies.js, levels.js, perks.js  ← balance & content lives here
  js/engine/            ← game.js (rules & simulation), path.js
  js/render/            ← board.js (drawing the garden), art-*.js (all the characters)
  js/ui/                ← ui.js (menus, tray, shed), tutorial.js, markup.js (page layout)
templates/new-game/     ← starter used by `npm run new-game`
scripts/                ← fetch-fonts.mjs, new-game.mjs
capacitor.config.json   ← app name & ID for the stores
```

Most tuning only touches `js/data/`:
- **When defenders unlock:** `unlock` in `towers.js` (0 = Seedlings, 1 = Leafy Heads, …).
- **Garden Shed upgrades:** `perks.js`. Costs add up to 27, the most stars you can earn.
- **Stars:** lose 2 or fewer crops for 3 stars, 10 or fewer for 2 (in `engine/game.js`).

## Start another game in the family

```
npm run new-game -- "Pond Pals"
```
Creates `../pond-pals/` with the kit, a tiny working starter game (with a tutorial), the
GitHub Pages workflow and the app setup.

## Balance check (robot players)

```
npm run balance                     # every level, 40 games per robot player (~45 seconds)
npm run balance -- --runs 100       # more games, steadier numbers
npm run balance -- --level 5        # one level (0 = Seedlings … 8 = Big Dig)
npm run balance -- --perks all      # as if every Garden Shed upgrade is owned
```

Robot players play every level using the game's real rules: a sensible player, an upgrader, a
spammer, a random beginner, and one-defender-only players for each defender. The report
(`tools/balance/reports/report.html`) flags levels that are too hard, too easy or a sudden spike,
bosses that cause most losses, and defenders that are too strong or too weak. Run it after any
change in `web/js/data/`. The tool lives in `tools/balance/` and never ships with the game.

## Put it online (free, for play-testing on any phone)

1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` publishes the game. The workflow downloads the fonts automatically.

## Turn it into an app

You need Node 18+. For iPhone you also need a Mac with Xcode; for Android, Android Studio.

```
npm install
npm run fonts                 # bundle fonts so the app works offline
npx cap add ios               # creates the ios/ project (once)
npx cap add android           # creates the android/ project (once)
npm run ios                   # copies web/ in and opens Xcode
npm run android               # copies web/ in and opens Android Studio
```

Before you publish:
- Change `appId` in `capacitor.config.json` to something you own, like `com.yourname.carrotpatch`.
  It can't be changed after the first store release.
- Lock to portrait: in Xcode, uncheck Landscape under *Device Orientation*; on Android set
  `android:screenOrientation="portrait"` on the activity in `AndroidManifest.xml`.
- Add an app icon and splash screen (`@capacitor/assets` can generate all sizes from one image).

After any change in `web/`, run `npm run sync` (or `npm run ios` / `npm run android`).

## What's already phone-ready

- **Saves** use the phone's own storage in the app (Capacitor Preferences), with browser
  storage as the web fallback. Saves are versioned, so updates won't wipe progress.
- **Pausing**: the game pauses and saves when the app goes to the background, a call comes in,
  or the screen locks. Android's back button pauses/resumes.
- **Sound** is generated in code (no files), starts only after the first tap as phones require,
  and has a 3-way toggle: music + effects, effects only, off.
- **Screens**: safe areas for notches and home bars, resizes for any phone or tablet, no
  pinch-zoom or text selection, touch-friendly button sizes.
- **Performance**: the background is drawn once per level, pixel density is capped at 2×, and
  effects are capped so busy waves stay smooth on older phones.

## Ads & purchases

All money code goes through `web/kit/js/monetization.js`. The game already calls:
- `Ads.rewardedReady(placement)` / `Ads.showRewarded(placement)` — used on the lose screen
  ("watch an ad: retry with +60 seeds").
- `Store.owns(id)` / `Store.buy(id)` / `Store.restore()` — product ID `remove_ads` is reserved.

To go live, install an ad plugin (e.g. AdMob for Capacitor) and a purchases plugin
(e.g. RevenueCat), and fill in the `TODO(app)` spots in that one file.
