// Offline cache for the web and home-screen versions. (The store apps carry their own files.)
// Every file is fetched fresh when there's a connection (so an update shows up right away and all files
// match), and kept in the cache so the game still opens offline.
const CACHE = 'carrot-patch-v3';
// On install, fetch every file the game uses (listed in precache.json), so the whole game, journal
// pictures included, works offline after the first visit. A failed file is simply fetched later.
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(async cache => {
  try { const list = await (await fetch('precache.json', { cache:'no-cache' })).json();
    await Promise.all(list.map(f => cache.add(new Request(f, { cache:'no-cache' })).catch(() => {}))); } catch(e){} })); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method!=='GET' || new URL(req.url).origin!==location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    try { const res = await fetch(req, { cache:'no-cache' }); if (res.ok) cache.put(req, res.clone()); return res; }
    catch(e){ return (await cache.match(req, { ignoreSearch:req.mode==='navigate' })) || Response.error(); }
  }));
});
