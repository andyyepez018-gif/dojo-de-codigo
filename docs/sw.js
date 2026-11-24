/* Service worker del Dojo de código: guarda la app para usarla sin internet y avisa de versiones nuevas.
   Cada versión publicada cambia VERSION; el navegador lo detecta y la app ofrece «Actualizar ahora». */
const VERSION = '1.1.0';
const CACHE = 'dojo-' + VERSION;
const FUENTES = 'dojo-fuentes';
const ARCHIVOS = ['./', 'index.html', 'motor.js', 'contenido.js', 'app.js', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png', 'icono-mascara-512.png', 'icono-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' }))))); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('dojo-') && k !== CACHE && k !== FUENTES).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'actualizar') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FUENTES).then(async c => { const g = await c.match(r); const red = fetch(r).then(x => { if (x.ok || x.type === 'opaque') c.put(r, x.clone()); return x; }).catch(() => g); return g || red; }));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(g => g || (r.mode === 'navigate' ? caches.match('index.html') : null)).then(g => g || fetch(r)));
});
