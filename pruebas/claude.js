// Versión «dentro de Claude»: la página tal cual se publica como artefacto (sin service worker), con
// window.claude simulado (base de datos, usuario y tutor) para recorrer esos caminos del código.
// Uso: node pruebas/claude.js   (levanta su propio servidor en el puerto 8771)
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const pagina = '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync(RAIZ + '/index.html', 'utf8') + '</body></html>';
const srv = http.createServer((q, r) => {
  const f = q.url.split('?')[0]; if (f === '/' || f === '/index.html') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(pagina); }
  const p = path.join(RAIZ, f); if (!p.startsWith(RAIZ) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(fs.readFileSync(p));
}).listen(8771);
(async () => {
  const b = await chromium.launch(); let bien = 0, mal = 0; const errores = [];
  const ok = (n, c, d) => { if (c) { bien++; console.log('  ✓ ' + n); } else { mal++; console.log('  ✗ ' + n + (d ? ' → ' + JSON.stringify(d).slice(0, 200) : '')); } };
  const c = await b.newContext({ viewport: { width: 1280, height: 860 } });
  await c.addInitScript(() => {
    window.__guardado = [];
    const doc = { onSnapshot(cb) { setTimeout(() => cb({ exists: false, data: () => undefined, metadata: { fromCache: false, hasPendingWrites: false } }), 50); return () => {}; }, set: async d => { window.__guardado.push(d); } };
    const sample = async (input, opts) => { const t = 'Explicación de prueba: el bucle suma uno cada vuelta.'; if (opts && opts.onText) opts.onText({ text: t, delta: t }); window.__pregunta = input; return { text: t, truncated: false }; };
    window.claude = { use: async n => n === 'db' ? { doc: () => doc } : n === 'user' ? { id: async () => 'u_prueba' } : n === 'sample' ? sample : null };
  });
  const p = await c.newPage();
  p.on('pageerror', e => errores.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load/.test(m.text())) errores.push(m.text()); });
  await p.goto('http://localhost:8771/'); await p.waitForSelector('.bienvenida');
  await p.getByRole('button', { name: 'Empezar' }).click(); await p.waitForTimeout(2500);
  ok('guarda el progreso en la cuenta (base de datos)', await p.evaluate(() => window.__guardado.length > 0 && window.__guardado.at(-1).bienvenida === true));
  ok('el pie dice que se guarda en la cuenta', /en tu cuenta/.test(await p.textContent('#pie-lateral')));
  ok('sin service worker dentro de Claude', await p.evaluate(async () => !(await navigator.serviceWorker.getRegistration())));
  await p.goto('http://localhost:8771/#retos'); await p.waitForSelector('.reto');
  await p.locator('.opcion, .codigo li.toca').first().click().catch(async () => { while (await p.locator('.piezas .pieza').count()) await p.locator('.piezas .pieza').first().click(); await p.getByRole('button', { name: 'Comprobar' }).click(); });
  await p.waitForSelector('.respuesta');
  ok('el tutor aparece con «Usa tu cuenta de Claude»', await p.getByRole('button', { name: 'Explícamelo mejor' }).isVisible());
  await p.getByRole('button', { name: 'Explícamelo mejor' }).click(); await p.waitForTimeout(300);
  ok('el tutor responde', /Explicación de prueba/.test(await p.textContent('.tutor')));
  ok('la pregunta lleva el programa y la salida real', await p.evaluate(() => /Programa:\n/.test(window.__pregunta) && /profesor de programación/.test(window.__pregunta)));
  await p.goto('http://localhost:8771/#lab'); await p.locator('#v-lab .chip', { hasText: 'Python' }).click();
  await p.fill('#editor-codigo', 'print(sum(i for i in range(10)))'); await p.click('#btn-ejecutar');
  await p.locator('#consola', { hasText: /fin del programa/ }).waitFor({ timeout: 15000 });
  ok('el laboratorio ejecuta en el hilo aparte también aquí', /45/.test(await p.textContent('#consola')));
  await p.goto('http://localhost:8771/#plan');
  ok('el plan enlaza a la app instalable', await p.locator('a[href="https://andyyepez018-gif.github.io/dojo-de-codigo/"]').count() === 1);
  ok('sin errores de JavaScript', errores.length === 0, errores);
  await c.close();
  await b.close(); srv.close();
  console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
})();
