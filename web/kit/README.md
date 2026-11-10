# Cozy Kit

The shared foundation for every game in the family. Open `kit/index.html` in a browser to see
the style guide: colors, type, buttons, overlays, the tutorial bubble, art style and sounds.

| File | What it gives a game |
| --- | --- |
| `css/kit.css` | Palette (light + dark), fonts, buttons, chips, overlays, panels, stars, tutorial bubble, safe areas for notches |
| `css/fonts.css` | Offline fonts (files in `fonts/`, fetched by `npm run fonts`) |
| `js/storage.js` | `createSave()` — reliable saves on phones, versioned so updates never wipe progress |
| `js/audio.js` | `Audio` — synthesized sound effects and music box, starts on first tap, `tone()` / `noise()` to make new sounds |
| `js/lifecycle.js` | Pause and save when the app is backgrounded; Android back button |
| `js/coach.js` | `createCoach()` — step-by-step tutorials that point at things and wait for the player |
| `js/monetization.js` | `Ads` and `Store` — the one place to plug in real ads and purchases |
| `js/native.js` | Detects the app vs. browser; `#dev` test mode |
| `js/events.js` | Tiny event bus (`on` / `emit`) |
| `js/draw.js` | Art-style helpers: `ell`, `shadow`, `crown`, `rng` |
| `js/ui.js` | `$`, `starStr`, shared stroke icons |

## Rules that keep the family consistent

- Link `kit.css` before the game's own CSS. Games may override `--accent` to get their own
  signature color; leave the rest of the palette alone.
- Titles use the two-tone wordmark: `<h1 class="k-title">Name <span>Word</span></h1>`.
- Characters are drawn with `ell()` shapes: a base color, a darker outline, a soft `shadow()`
  and a small white highlight. Bosses wear the `crown()`.
- Every game uses the same UI sounds (`tap`, `chime`, `sparkle`, `win`, `lose`, `denied`) and
  adds its own on top with `Audio.register()`.
- Don't edit the kit inside a single game. Change it in one place, then copy `web/kit/` into the
  other games so they stay in step.

## Starting a new game

From the Carrot Patch folder: `npm run new-game -- "Pond Pals"`. That creates `../pond-pals/`
with this kit, a tiny working starter game, the GitHub Pages workflow and the app setup.
