/* Service worker del Dojo de código: guarda la app para usarla sin internet y detecta versiones nuevas.
   construir.py rellena VERSION (versión + huella del contenido) y la lista de archivos. */
const VERSION = '__VERSION__';
const CACHE = 'dojo-' + VERSION;
const ARCHIVOS = __ARCHIVOS__;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('dojo-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'actualizar') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }))
      .then(g => g || (r.mode === 'navigate' ? caches.open(CACHE).then(c => c.match('./')) : null))
      .then(g => g || fetch(r))
  );
});
