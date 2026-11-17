// Offline cache for the web and home-screen versions. (The store apps carry their own files.)
// Every file is fetched fresh when there's a connection (so an update shows up right away and all files
// match), and kept in the cache so the game still opens offline.
const CACHE = 'carrot-patch-v2';
self.addEventListener('install', () => self.skipWaiting());
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
