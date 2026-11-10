# Carrot Patch Defense

A cozy garden tower defense game. It's built as a plain web game (no build step), so the
same code runs in a browser, on GitHub Pages, and inside an iPhone/Android app via Capacitor.

## Play it locally

```
npm run dev        # then open http://localhost:5173
```

Add `#dev` to the end of the address (e.g. `http://localhost:5173/#dev`) for **test mode**:
every level unlocked, tap the seeds counter for +200 seeds, and ads are simulated.

## Project layout

```
web/                    ← everything the player gets (this folder becomes the app)
  index.html
  css/style.css         ← house style: colors, fonts, buttons (reuse for future games)
  css/fonts.css         ← offline fonts (files go in web/fonts/)
  js/main.js            ← starts the game, game loop, sound hookups
  js/data/              ← towers.js, enemies.js, levels.js  ← balance & content lives here
  js/engine/            ← game.js (rules & simulation), path.js
  js/render/            ← board.js (drawing the garden), art-*.js (all the characters)
  js/ui/                ← ui.js (menus, buttons, panels), markup.js (page layout)
  js/platform/          ← phone stuff: storage, audio, lifecycle, ads/purchases, native detection
scripts/fetch-fonts.mjs ← downloads the fonts once
capacitor.config.json   ← app name & ID for the stores
```

Most tuning — new pests, levels, tower stats — only touches `js/data/`.

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

All money code goes through `js/platform/monetization.js`. The game already calls:
- `Ads.rewardedReady(placement)` / `Ads.showRewarded(placement)` — used on the lose screen
  ("watch an ad: retry with +60 seeds").
- `Store.owns(id)` / `Store.buy(id)` / `Store.restore()` — product ID `remove_ads` is reserved.

To go live, install an ad plugin (e.g. AdMob for Capacitor) and a purchases plugin
(e.g. RevenueCat), and fill in the `TODO(app)` spots in that one file.
