// Offline cache for the web and home-screen versions. (The store apps carry their own files.)
// Everything the game loads is kept after the first visit; later visits open from the cache at once
// and quietly fetch any update for next time.
const CACHE = 'carrot-patch-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method!=='GET' || new URL(req.url).origin!==location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch:req.mode==='navigate' });
    const fresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});
