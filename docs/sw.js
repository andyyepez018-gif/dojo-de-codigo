/* Service worker del Dojo de código: guarda la app para usarla sin internet y detecta versiones nuevas.
   construir.py rellena VERSION (versión + huella del contenido) y la lista de archivos. */
const VERSION = '1.8.0-7d5d6c90c5';
const CACHE = 'dojo-' + VERSION;
const ARCHIVOS = ["./", "app.js", "contenido.js", "ejecutor.js", "escribir.js", "estudio.js", "fuentes/fuentes.css", "fuentes/ibm-plex-mono-latin-400-normal.woff2", "fuentes/ibm-plex-mono-latin-500-normal.woff2", "fuentes/ibm-plex-mono-latin-600-normal.woff2", "fuentes/ibm-plex-mono-latin-ext-400-normal.woff2", "fuentes/ibm-plex-mono-latin-ext-500-normal.woff2", "fuentes/ibm-plex-mono-latin-ext-600-normal.woff2", "fuentes/ibm-plex-sans-latin-400-normal.woff2", "fuentes/ibm-plex-sans-latin-500-normal.woff2", "fuentes/ibm-plex-sans-latin-600-normal.woff2", "fuentes/ibm-plex-sans-latin-ext-400-normal.woff2", "fuentes/ibm-plex-sans-latin-ext-500-normal.woff2", "fuentes/ibm-plex-sans-latin-ext-600-normal.woff2", "fuentes/zen-kaku-gothic-new-latin-500-normal.woff2", "fuentes/zen-kaku-gothic-new-latin-700-normal.woff2", "fuentes/zen-kaku-gothic-new-latin-900-normal.woff2", "fuentes/zen-kaku-gothic-new-latin-ext-500-normal.woff2", "fuentes/zen-kaku-gothic-new-latin-ext-700-normal.woff2", "fuentes/zen-kaku-gothic-new-latin-ext-900-normal.woff2", "habla.js", "icono-180.png", "icono-192.png", "icono-512.png", "icono-mascara-512.png", "index.html", "ingles.js", "manifest.webmanifest", "motor.js", "nucleo.js", "trabajador.js", "ui.js", "vista-estudio.js", "vista-examen.js", "vista-habla.js", "vista-ingles.js", "voz.js"];
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
