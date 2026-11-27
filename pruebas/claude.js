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
  // Los retos salen al azar: «¿Qué pieza es?» no lleva tutor (su explicación es la lección de colores), así que se pasa al siguiente
  for (let i = 0; i < 15; i++) {
    await p.locator('.opcion, .codigo li.toca').first().click().catch(async () => { while (await p.locator('.piezas .pieza').count()) await p.locator('.piezas .pieza').first().click(); await p.getByRole('button', { name: 'Comprobar' }).click(); });
    await p.waitForSelector('.respuesta');
    if (await p.getByRole('button', { name: 'Explícamelo mejor' }).count()) break;
    await p.locator('#siguiente').click(); await p.waitForSelector('.reto');
  }
  ok('el tutor aparece con «Usa tu cuenta de Claude»', await p.getByRole('button', { name: 'Explícamelo mejor' }).isVisible());
  await p.getByRole('button', { name: 'Explícamelo mejor' }).click(); await p.waitForTimeout(300);
  ok('el tutor responde', /Explicación de prueba/.test(await p.textContent('.tutor')));
  ok('la pregunta lleva el programa y la salida real', await p.evaluate(() => /Programa:\n/.test(window.__pregunta) && /profesor de programación/.test(window.__pregunta)));
  await p.goto('http://localhost:8771/#lab'); await p.locator('#v-lab .chip', { hasText: 'Python' }).click();
  await p.fill('#editor-codigo', 'print(sum(i for i in range(10)))'); await p.click('#btn-ejecutar');
  await p.locator('#consola', { hasText: /fin del programa/ }).waitFor({ timeout: 15000 });
  ok('el laboratorio ejecuta en el hilo aparte también aquí', /45/.test(await p.textContent('#consola')));
  // el capítulo personalizado: Claude de profesor, con el material de la clase
  await p.goto('http://localhost:8771/#estudio'); await p.waitForSelector('#personales'); await p.locator('.personal-acceso').first().click(); await p.waitForSelector('#chat-personal textarea');
  await p.fill('#chat-personal-texto', '¿Qué es j?'); await p.click('#chat-personal-enviar'); await p.waitForTimeout(400);
  ok('el chat del capítulo responde con Claude', /Explicación de prueba/.test(await p.textContent('#chat-personal .burbuja.ella')) && /¿Qué es j\?/.test(await p.textContent('#chat-personal .burbuja.yo')));
  ok('la pregunta lleva el capítulo de la clase y la rúbrica', await p.evaluate(() => { const m = window.__pregunta; const t = Array.isArray(m) ? m.map(x => x.content).join('\n') : String(m); return /Matrices y condicionales/.test(t) && /Resultado y funcionamiento/.test(t) && /¿Qué es j\?/.test(t); }));
  await p.locator('#chat-personal .sugerencias .chip').first().click(); await p.waitForTimeout(400);
  ok('las preguntas rápidas también preguntan, y la conversación sigue (2 respuestas)', await p.locator('#chat-personal .burbuja.ella').count() === 2 && await p.evaluate(() => Array.isArray(window.__pregunta) && window.__pregunta.length === 3 && window.__pregunta[1].role === 'assistant'));
  ok('cada parte tiene «Explícamelo con Claude»', await p.locator('.seccion-personal').getByRole('button', { name: 'Explícamelo con Claude' }).count() === 7);
  // Cómo armar un programa: «Ayúdame con este paso» pregunta a Claude con el ejercicio y el paso
  await p.locator('#menu-lateral a[href="#estudio"]').click(); await p.getByRole('button', { name: '← Elegir lenguaje' }).click(); await p.waitForSelector('#armar-inicio'); await p.locator('#armar-inicio').getByRole('button', { name: 'C++', exact: true }).click();
  await p.locator('#armar-practica .capitulo').first().click(); await p.waitForSelector('#guiado-paso-1');
  await p.locator('#guiado-paso-1').getByRole('button', { name: 'Ayúdame con este paso' }).click(); await p.waitForTimeout(300);
  ok('el guiado pide ayuda a Claude con el ejercicio, el lenguaje y el paso', /Explicación de prueba/.test(await p.textContent('#guiado-paso-1 .tutor')) && await p.evaluate(() => /Promedio|promedio/.test(window.__pregunta) && /C\+\+/.test(window.__pregunta) && /paso: 1/.test(window.__pregunta)));
  // aunque las cuentas de Supabase estén activadas, dentro de Claude no se pide login: ya lo identifica su cuenta de Claude
  await p.evaluate(() => { localStorage.setItem('dojo-pruebas', '1'); localStorage.setItem('dojo-cuenta-config', JSON.stringify({ url: 'https://prueba-dojo.supabase.co', anon: 'anon-de-prueba-' + 'x'.repeat(40) })); });
  await p.reload(); await p.waitForTimeout(800);
  ok('dentro de Claude no aparece la pantalla de entrar', await p.locator('#acceso').count() === 0);
  await p.evaluate(() => { localStorage.removeItem('dojo-cuenta-config'); });
  await p.goto('http://localhost:8771/#plan');
  ok('el plan enlaza a la app instalable', await p.locator('a[href="https://andyyepez018-gif.github.io/dojo-de-codigo/"]').count() === 1);
  ok('sin errores de JavaScript', errores.length === 0, errores);
  await c.close();

  // Inglés dentro de Claude: su voz (tts), su dictado y la conversación libre con Claude (sample)
  const { vozFalsa, resuelveIngles, cierraFiesta } = require('./robot-ingles.js');
  for (const negar of [false, true]) {
    const ci = await b.newContext({ viewport: { width: 1280, height: 860 } });
    await ci.addInitScript(vozFalsa);
    await ci.addInitScript(negar => {
      localStorage.setItem('dojo-progreso', JSON.stringify({ v: 2, bienvenida: true, puntos: 50 }));
      window.__tts = []; window.__dict = []; window.__navegador = 0; window.__charla = [];
      const ss = window.speechSynthesis; const hablaNav = ss.speak.bind(ss); ss.speak = u => { window.__navegador++; hablaNav(u); };
      const oyentes = { estadoT: [], parcial: [], final: [], estadoD: [] }, avisa = (l, e) => oyentes[l].slice().forEach(f => f(e));
      const quita = (l, f) => () => { oyentes[l] = oyentes[l].filter(x => x !== f); };
      const tts = { speak: (t, o) => { window.__tts.push({ t, o }); window.__dicho.push(t); avisa('estadoT', { state: 'speaking' }); return new Promise(r => setTimeout(() => { avisa('estadoT', { state: 'idle', reason: 'completed' }); r({ playedMs: 500 }); }, 20)); },
        stop: async () => {}, onState: f => { oyentes.estadoT.push(f); return quita('estadoT', f); } };
      let escuchando = false;
      const dictation = { start: o => { window.__dict.push(o); if (negar) return Promise.reject({ code: 'not_granted', message: 'no' });
          escuchando = true; avisa('estadoD', { state: 'listening' });
          setTimeout(() => { avisa('parcial', { text: window.__oir.split(' ')[0] }); setTimeout(() => { avisa('final', { text: window.__oir }); avisa('parcial', { text: '' }); }, 30); }, 30);
          return Promise.resolve(); },
        stop: async () => { if (escuchando) { escuchando = false; avisa('estadoD', { state: 'idle', reason: 'stopped' }); } },
        active: () => escuchando, onPartial: f => { oyentes.parcial.push(f); return quita('parcial', f); }, onFinal: f => { oyentes.final.push(f); return quita('final', f); }, onState: f => { oyentes.estadoD.push(f); return quita('estadoD', f); } };
      const sample = async (input) => { window.__charla.push(input); return { text: Array.isArray(input) && input.length > 1 ? 'EN: Nice! What are you learning now?\nES: Se dice «I am», no «I is».' : 'EN: Hi! I am Sam. What is your name?\nES: Bien dicho.', truncated: false }; };
      const doc = { onSnapshot(cb) { setTimeout(() => cb({ exists: false, data: () => undefined, metadata: { fromCache: false } }), 30); return () => {}; }, set: async () => {} };
      window.claude = { use: async n => (n === 'tts' ? tts : n === 'dictation' ? dictation : n === 'sample' ? sample : n === 'db' ? { doc: () => doc } : n === 'user' ? { id: async () => 'u_prueba' } : null) };
    }, negar);
    const pi = await ci.newPage(); pi.on('pageerror', e => errores.push(e.message));
    await pi.goto('http://localhost:8771/#ingles'); await pi.waitForSelector('.portada-en'); await pi.waitForTimeout(300);
    if (!negar) {
      ok('en Claude usa su voz y su dictado', /voz de Claude/.test(await pi.textContent('.estado-voz')) && /dictado de Claude/.test(await pi.textContent('.estado-voz')));
      await pi.locator('#v-ingles').getByRole('button', { name: 'Practicar', exact: true }).click(); await pi.waitForSelector('#v-ingles .ejercicio');
      let hablado = false;
      for (let k = 0; k < 40 && !hablado; k++) { const t = await resuelveIngles(pi, true); hablado = t === 'habla'; if (!(await pi.locator('#v-ingles .respuesta.si').count())) ok('acierta con la voz de Claude (' + t + ')', false); await cierraFiesta(pi); if (!hablado) { await pi.locator('#ing-siguiente').click(); await pi.waitForSelector('#v-ingles .ejercicio'); } }
      ok('habla con la voz de Claude, en inglés, y nunca con la del navegador', await pi.evaluate(() => window.__tts.length > 3 && window.__tts.every(x => x.o && x.o.language === 'en') && window.__navegador === 0));
      ok('el dictado de Claude escucha en inglés y puntúa lo dicho', hablado && await pi.evaluate(() => window.__dict.length > 0 && window.__dict.every(o => o.language === 'en')) && await pi.locator('#v-ingles .palabras-dichas .mal').count() === 0);
      await pi.locator('#v-ingles').getByRole('button', { name: '← Inglés' }).click();
      await pi.locator('#v-ingles .portada-en').getByRole('button', { name: 'Conversar' }).click(); await pi.waitForSelector('#v-ingles .chat');
      await pi.getByRole('button', { name: 'Hablar con Claude' }).click(); await pi.locator('#v-ingles .burbuja.ella').waitFor();
      ok('la conversación libre: Claude saluda en inglés y se oye', /What is your name/.test(await pi.textContent('#v-ingles .chat')) && await pi.evaluate(() => window.__tts.at(-1).t === 'Hi! I am Sam. What is your name?'));
      await pi.fill('#libre-texto', 'I is Leo'); await pi.keyboard.press('Enter'); await pi.locator('#v-ingles .correccion').waitFor();
      ok('Claude corrige en español y la charla lleva todo lo dicho', /I am/.test(await pi.textContent('#v-ingles .correccion')) && await pi.evaluate(() => { const m = window.__charla.at(-1); return Array.isArray(m) && m.at(-1).role === 'user' && m.at(-1).content === 'I is Leo' && m.some(x => x.role === 'assistant'); }));
    } else {
      await pi.locator('#v-ingles .portada-en').getByRole('button', { name: 'Conversar' }).click(); await pi.waitForSelector('#v-ingles .chat');
      await pi.locator('#v-ingles .microfono').click(); await pi.waitForTimeout(300);
      ok('si niega el micrófono: lo dice, quita el botón y no lo pide por otro lado', /Sin permiso para el micrófono/.test(await pi.textContent('#aviso')) && await pi.locator('#v-ingles .microfono').count() === 0 && await pi.locator('#conv-texto').count() === 1);
    }
    await ci.close();
  }
  ok('sin errores de JavaScript en inglés', errores.length === 0, errores);
  await b.close(); srv.close();
  console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
})();
