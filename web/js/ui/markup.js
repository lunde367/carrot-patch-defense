// The page layout. Injected by main.js so the web page and the app share one copy.
const svg = d => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICON = {
  restart: svg('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>'),
  map:     svg('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
  soundAll:svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>'),
  soundFx: svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>'),
  soundOff:svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
};

export const MARKUP = `
<div class="app">
  <header class="top">
    <h1>Carrot Patch <span>Defense</span></h1>
    <div class="stats">
      <button class="chip" id="seedsChip" title="Seeds" tabindex="-1"><i class="dot d-seed"></i><span id="seeds">0</span><small>seeds</small></button>
      <div class="chip" title="Crops left"><i class="dot d-life"></i><span id="lives">0</span></div>
      <div class="chip" title="Season and wave"><i class="dot d-wave"></i><small id="season">spring</small><span id="wave">0</span></div>
    </div>
  </header>

  <div class="controls">
    <button class="btn main" id="go">Start wave 1</button>
    <button class="btn ghost" id="spd" aria-label="Game speed">1×</button>
    <button class="btn ghost icon" id="restart" aria-label="Restart level" title="Restart level">${ICON.restart}<span class="lbl"></span></button>
    <button class="btn ghost icon" id="sound" aria-label="Sound" title="Sound">${ICON.soundAll}</button>
    <button class="btn ghost icon" id="map" aria-label="Gardens" title="Gardens">${ICON.map}</button>
  </div>

  <div class="board" id="board">
    <canvas id="cv" aria-label="Garden map"></canvas>
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
