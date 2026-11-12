// Anonymous play data: which levels people reach, win and lose, so the game can be tuned.
//
// What makes it anonymous and safe:
//  - No name, account, device ID, advertising ID or install ID is ever created or sent. Events can't be
//    tied to a person or even to each other.
//  - Only the short, fixed list of facts below can be sent (numbers and a few known words). No free text.
//  - Sent over HTTPS only, without cookies or credentials. Nothing is sent to any ad or analytics company.
//  - The player can switch it off in Settings, and it is off entirely until an address is set here.
//  - The server should count events and not store IP addresses.
//
// Usage:  initTelemetry({ url, app, version, enabled })  then  track('level_win', { gi:4, stars:3 })
import { platform, devMode } from './native.js';

const ALLOWED = {   // event → the only fields it may carry
  app_open:[], tutorial_done:[], level_start:['gi','diff'], level_win:['gi','diff','stars','lost'], level_lose:['gi','diff','wave'],
  endless_run:['wave','diff'], challenge:['gi','n'], shed_buy:['perk','tier'], extra_used:['kind'], remove_ads:['step'],
  rating:['answer'], story_end:[],
};
const WORDS = /^[a-z0-9_]{1,24}$/;
let cfg = { url:'', app:'', version:'', enabled:true }, queue = [], timer = null, installDay = 0;
const KEY = 'cozy-telemetry';

export function initTelemetry(options){
  cfg = { ...cfg, ...options };
  try { const s = JSON.parse(localStorage.getItem(KEY) || '{}'); installDay = s.day || 0; queue = Array.isArray(s.q) ? s.q.slice(-100) : [];
    if (!installDay){ installDay = Math.floor(Date.now()/86400000); persist(); } } catch(e) {}
  addEventListener('pagehide', () => flush(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
}
export function setTelemetry(on){ cfg.enabled = !!on; if (!on){ queue = []; persist(); } }
const active = () => cfg.enabled && /^https:\/\//.test(cfg.url) && !devMode;
function persist(){ try { localStorage.setItem(KEY, JSON.stringify({ day:installDay, q:queue })); } catch(e) {} }
// Days since first launch, in wide buckets, so "do people come back?" can be answered without knowing who anyone is.
function age(){ const d = Math.floor(Date.now()/86400000) - installDay; return d<=0?'d0':d===1?'d1':d<=3?'d2_3':d<=7?'d4_7':d<=14?'d8_14':d<=30?'d15_30':'d31plus'; }

export function track(event, fields={}){
  const allowed = ALLOWED[event]; if (!allowed) return;
  const out = { e:event, app:cfg.app, v:cfg.version, p:platform, age:age() };
  for (const k of allowed){ const v = fields[k];
    if (typeof v==='number' && isFinite(v)) out[k] = Math.round(v);
    else if (typeof v==='string' && WORDS.test(v)) out[k] = v; }
  if (devMode){ console.log('[telemetry, test mode: not sent]', out); return; }
  if (!active()) return;
  queue.push(out); if (queue.length > 100) queue.shift(); persist();
  if (!timer) timer = setTimeout(() => flush(false), 20000);
}
export function flush(leaving){
  clearTimeout(timer); timer = null;
  if (!active() || !queue.length) return;
  const batch = queue.splice(0, 50), body = JSON.stringify({ events:batch }); persist();
  try {
    if (leaving && navigator.sendBeacon){ navigator.sendBeacon(cfg.url, new Blob([body], { type:'text/plain' })); return; }
    fetch(cfg.url, { method:'POST', body, headers:{ 'Content-Type':'application/json' }, credentials:'omit', referrerPolicy:'no-referrer', keepalive:true })
      .then(r => { if (!r.ok) throw 0; }).catch(() => { queue = batch.concat(queue).slice(-100); persist(); });
  } catch(e) {}
}
