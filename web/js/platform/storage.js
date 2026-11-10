// Save data. In the app it uses the phone's real storage (Capacitor Preferences), which the
// system won't clear the way it can clear browser storage. In a browser it falls back to
// localStorage, and to memory if even that is blocked.
import { plugin } from './native.js';

const KEY = 'carrot-patch-save';
const VERSION = 1;
const defaults = () => ({
  v: VERSION,
  stars: [],                                   // best stars per level, by level index
  settings: { sfx:true, music:true, speed:1 },
  owned: {},                                   // purchases, e.g. { remove_ads:true }
  stats: { wins:0, losses:0 },
});

let memory = null, timer = null;
const backend = {
  async read(){
    const P = plugin('Preferences');
    if (P) { const r = await P.get({ key:KEY }); return r && r.value; }
    try { return localStorage.getItem(KEY); } catch(e) { return memory; }
  },
  async write(v){
    const P = plugin('Preferences');
    if (P) { await P.set({ key:KEY, value:v }); return; }
    try { localStorage.setItem(KEY, v); } catch(e) { memory = v; }
  },
};

// Upgrade older saves to the current shape so updates never wipe progress.
function migrate(d){
  const base = defaults();
  if (!d || typeof d !== 'object') return base;
  return { ...base, ...d, v:VERSION,
    stars: Array.isArray(d.stars) ? d.stars : [],
    settings: { ...base.settings, ...(d.settings||{}) },
    owned: { ...(d.owned||{}) },
    stats: { ...base.stats, ...(d.stats||{}) } };
}

export const Save = {
  data: defaults(),
  async load(){
    let raw = null; try { raw = await backend.read(); } catch(e) {}
    let d = null; try { d = raw ? JSON.parse(raw) : null; } catch(e) {}
    if (!d) { try { const old = JSON.parse(localStorage.getItem('cpd-prog2')); if (old && old.stars) d = { stars:old.stars }; } catch(e) {} }
    this.data = migrate(d);
    return this.data;
  },
  // Batched write shortly after a change.
  commit(){ clearTimeout(timer); timer = setTimeout(() => this.flush(), 200); },
  // Immediate write, used when the app goes to the background.
  flush(){ clearTimeout(timer); return backend.write(JSON.stringify(this.data)).catch(()=>{}); },
};
