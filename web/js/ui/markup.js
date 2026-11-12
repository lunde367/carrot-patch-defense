// The page layout. Injected by main.js so the web page and the app share one copy.
import { ICON } from '../../kit/js/ui.js';
export { ICON };

export const MARKUP = `
<div class="app">
  <header class="top">
    <div class="title-row"><h1 class="k-title">Carrot Patch <span>Defense</span></h1><span class="dev-badge" id="devBadge" hidden>Test mode</span></div>
    <div class="stats">
      <button class="chip" id="seedsChip" title="Seeds" tabindex="-1"><i class="dot d-seed"></i><span id="seeds">0</span><small>seeds</small></button>
      <div class="chip" title="Crops left"><canvas class="chip-crop" id="livesIcon" width="40" height="40" aria-hidden="true"></canvas><span id="lives">0</span></div>
      <div class="chip" title="Season and wave"><i class="dot d-wave"></i><small id="season">spring</small><span id="wave">0</span></div>
    </div>
  </header>

  <main class="home" id="home" hidden></main>

  <div class="controls">
    <button class="btn main" id="go">Start wave 1</button>
    <button class="btn ghost" id="spd" aria-label="Game speed">1×</button>
    <button class="btn ghost icon" id="restart" aria-label="Restart level" title="Restart level">${ICON.restart}<span class="lbl"></span></button>
    <button class="btn ghost icon" id="sound" aria-label="Sound" title="Sound">${ICON.soundAll}</button>
    <button class="btn ghost icon" id="map" aria-label="Gardens" title="Gardens">${ICON.map}</button>
  </div>

  <div class="board" id="board">
    <canvas id="cv" aria-label="Garden map"></canvas>
    <div class="scene-pop" id="scenePop" hidden role="dialog" aria-label="Clear this spot"><button class="sp-x" id="spClose" aria-label="Close">×</button>
      <b></b><small></small><button class="btn main small" id="spClear"></button></div>
    <span class="diff-badge" id="diffBadge" hidden></span>
    <button class="offer-pill" id="adSeeds" hidden></button>
    <button class="offer-pill small" id="adRefill" hidden></button>
    <div class="over" id="over" hidden></div>
  </div>

  <div class="msg-row">
    <button class="spray-btn" id="spray" hidden aria-label="Pesticide Sprayer"><i class="spray-ring"></i><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M11 13h8l1.5 4v10a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V17z" fill="#e9d24a" stroke="#6a5a10" stroke-width="1.6" stroke-linejoin="round"/><rect x="11" y="19" width="8.5" height="5" rx="1" fill="#c2456b"/><path d="M13 13V9h4v4" fill="#9aa6ae" stroke="#4a5258" stroke-width="1.6" stroke-linejoin="round"/><path d="M17 10h4l2.5-2.5" fill="none" stroke="#4a5258" stroke-width="1.8" stroke-linecap="round"/><circle cx="26" cy="6" r="1.3" fill="#7fb3d1"/><circle cx="28.5" cy="9.5" r="1.1" fill="#7fb3d1"/><circle cx="25.5" cy="11" r="1" fill="#7fb3d1"/><circle cx="29" cy="4" r=".9" fill="#7fb3d1"/></svg><b class="ab-cd" hidden></b><span class="ab-lbl">Spray</span></button>
    <p class="msg" id="msg" aria-live="polite"></p>
    <button class="btn ghost small undo" id="undo" hidden>Undo</button>
    <button class="fert-btn" id="fert" hidden aria-label="Compost"><i class="fert-ring"></i><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M8 13c0-1 1-2 2-2h12c1 0 2 1 2 2l1 13a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" fill="#b5824e" stroke="#5e3d20" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 11l2-3h8l2 3" fill="#9a6b3c" stroke="#5e3d20" stroke-width="1.6" stroke-linejoin="round"/><rect x="10.5" y="17" width="11" height="6" rx="1.5" fill="#f2e6c8"/><path d="M16 22v-3" stroke="#3f7a2a" stroke-width="1.5" stroke-linecap="round"/><path d="M16 19.5c-1.8 0-2.6-1-2.6-2.2 1.6 0 2.6.8 2.6 2.2zM16 19c1.6 0 2.6-1 2.6-2.4-1.6 0-2.6 1-2.6 2.4z" fill="#6fae54"/><path d="M16 8V4" stroke="#3f7a2a" stroke-width="1.6" stroke-linecap="round"/><path d="M16 5.5c-2.2 0-3.2-1.2-3.2-2.8 2 0 3.2 1 3.2 2.8zM16 5c2 0 3.2-1.2 3.2-3-2 0-3.2 1.2-3.2 3z" fill="#7fc05a"/></svg><b class="ab-cd" hidden></b><span class="ab-lbl">Compost</span></button>
  </div>

  <div class="info" id="info" hidden>
    <h3 id="iName"></h3>
    <div class="acts">
      <button class="btn ghost small" id="iUp">Upgrade</button>
      <button class="btn ghost small" id="iSell">Sell</button>
    </div>
    <p id="iDesc"></p>
    <p id="iStats"></p>
  </div>

  <div class="bar" id="bar"></div>
</div>`;
