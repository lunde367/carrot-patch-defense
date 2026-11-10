// Save data for any game in the family.
// In the app it uses the phone's own storage (Capacitor Preferences), which the system won't
// clear the way it can clear browser storage. In a browser it falls back to localStorage,
// and to memory if even that is blocked.
//
//   const Save = createSave({ key:'my-game', defaults:()=>({...}), migrate:(old, base)=>({...}) });
//   await Save.load();  Save.data.coins++;  Save.commit();
import { plugin } from './native.js';

export function createSave({ key, defaults, migrate = (d, base) => ({ ...base, ...d }), legacy = null }){
  let memory = null, timer = null;
  const backend = {
    async read(){
      const P = plugin('Preferences');
      if (P) { const r = await P.get({ key }); return r && r.value; }
      try { return localStorage.getItem(key); } catch(e) { return memory; }
    },
    async write(v){
      const P = plugin('Preferences');
      if (P) { await P.set({ key, value:v }); return; }
      try { localStorage.setItem(key, v); } catch(e) { memory = v; }
    },
  };
  return {
    data: defaults(),
    async load(){
      let raw = null; try { raw = await backend.read(); } catch(e) {}
      let d = null; try { d = raw ? JSON.parse(raw) : null; } catch(e) {}
      if (!d && legacy) { try { d = legacy(); } catch(e) {} }
      this.data = (d && typeof d === 'object') ? migrate(d, defaults()) : defaults();
      return this.data;
    },
    // Erase everything and start fresh. Pass keys to keep (e.g. purchases or settings).
    reset(keep = []){
      const fresh = defaults();
      for (const k of keep) if (k in this.data) fresh[k] = this.data[k];
      this.data = fresh; return this.flush();
    },
    // Batched write shortly after a change.
    commit(){ clearTimeout(timer); timer = setTimeout(() => this.flush(), 200); },
    // Immediate write, used when the app goes to the background.
    flush(){ clearTimeout(timer); return backend.write(JSON.stringify(this.data)).catch(() => {}); },
  };
}
