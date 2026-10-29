// Service worker: caché de la app para que funcione sin cobertura.
// Estrategia: devuelve lo cacheado al instante y actualiza en segundo plano.
// Si cambias index.html, sube el número de versión para forzar la actualización.
const V = 'ronda-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => {
      const red = fetch(e.request).then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
        return r;
      }).catch(() => hit);
      return hit || red;
    })
  );
});
