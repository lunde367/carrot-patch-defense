// The page layout. Injected by main.js so the web page and the app share one copy.
import { ICON } from '../../kit/js/ui.js';
export { ICON };

export const MARKUP = `
<div class="app">
  <header class="top">
    <div class="title-row"><h1 class="k-title">Carrot Patch <span>Defense</span></h1><span class="dev-badge" id="devBadge" hidden>Test mode</span></div>
    <div class="stats">
      <button class="chip" id="seedsChip" title="Seeds" tabindex="-1"><i class="dot d-seed"></i><span id="seeds">0</span><small>seeds</small></button>
      <div class="chip" title="Crops left"><i class="dot d-life"></i><span id="lives">0</span></div>
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
    <button class="spray-btn" id="spray" hidden aria-label="Pesticide Sprayer"><i class="spray-ring"></i><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9h5l1 3v8a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-8z"/><path d="M10 9V6h3v3"/><path d="M13 6h3l2-2"/><path d="M19 7.5h.01M20.5 5h.01M21 9h.01"/></svg></button>
    <div class="over" id="over" hidden></div>
  </div>

  <p class="msg" id="msg" aria-live="polite"></p>

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
