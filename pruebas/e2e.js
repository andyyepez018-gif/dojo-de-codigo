// Prueba de extremo a extremo en un navegador real (Chromium con Playwright).
// Sin waitForFunction: la app prohíbe eval (política de seguridad) y eso rompería esas esperas.
// Uso: sirve docs/ en http://localhost:8770 y ejecuta  node pruebas/e2e.js [carpeta-capturas]
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const URL = process.env.DOJO_URL || 'http://localhost:8770/';
const CAPTURAS = process.argv[2] || path.join(__dirname, '..', 'capturas');
fs.mkdirSync(CAPTURAS, { recursive: true });
let bien = 0, mal = 0; const errores = [];
const ok = (n, c, det) => { if (c) { bien++; console.log('  ✓ ' + n); } else { mal++; console.log('  ✗ ' + n + (det !== undefined ? ' → ' + JSON.stringify(det).slice(0, 300) : '')); } };
const pausa = ms => new Promise(r => setTimeout(r, ms));
async function nueva(b, opts = {}, progreso) {
  const c = await b.newContext(opts);
  if (progreso !== undefined) await c.addInitScript(p => { try { if (!localStorage.getItem('dojo-iniciado')) { localStorage.setItem('dojo-progreso', p); localStorage.setItem('dojo-iniciado', '1'); } } catch (e) {} }, JSON.stringify(progreso));
  const p = await c.newPage();
  p.on('pageerror', e => errores.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errores.push('consola: ' + m.text()); });
  return { c, p };
}
async function responderReto(p) {
  if (await p.locator('.opcion:not([disabled])').count()) { await p.locator('.opcion:not([disabled])').first().click(); return 'opción'; }
  const n = await p.locator('.codigo li.toca').count(); if (n) { await p.locator('.codigo li.toca').nth(Math.min(1, n - 1)).click(); return 'línea'; }
  if (await p.locator('.piezas .pieza').count()) { while (await p.locator('.piezas .pieza').count()) await p.locator('.piezas .pieza').first().click(); await p.getByRole('button', { name: 'Comprobar' }).click(); return 'orden'; }
  return 'nada';
}
const sinDesbordar = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

(async () => {
  const b = await chromium.launch();
  const hoy = new Date(); const clave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);

  console.log('1. Primera vez: bienvenida');
  let { c, p } = await nueva(b, { viewport: { width: 1280, height: 860 } });
  await p.goto(URL); await p.waitForSelector('.bienvenida');
  ok('se ve la bienvenida', await p.locator('.bienvenida h1').isVisible());
  await pausa(400); await p.screenshot({ path: path.join(CAPTURAS, '01-bienvenida.png') });
  await p.getByRole('button', { name: 'Python' }).click(); await p.locator('.bienvenida').getByRole('button', { name: '10', exact: true }).click();
  await p.getByRole('button', { name: 'Empezar' }).click();
  ok('tras empezar se ve la portada y el siguiente paso', await p.locator('.portada').isVisible() && await p.locator('.siguiente').isVisible());
  ok('el ajuste elegido se guarda', await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('dojo-progreso')); return d.ajustes.lang === 'py' && d.ajustes.meta === 10 && d.bienvenida; }));
  await p.screenshot({ path: path.join(CAPTURAS, '02-hoy.png'), fullPage: true });

  console.log('2. Retos (todas las clases), espera y paso a paso desde un reto');
  await p.getByRole('button', { name: 'Sí · empezar retos' }).click(); await p.waitForSelector('.reto');
  ok('la banda de espera aparece', await p.locator('.banda.espera').isVisible());
  const vistos = new Set();
  for (let i = 0; i < 16; i++) {
    vistos.add(await p.locator('.reto .etiqueta').first().textContent());
    const como = await responderReto(p);
    await p.waitForSelector('.respuesta');
    if (i === 3) await p.screenshot({ path: path.join(CAPTURAS, '03-reto.png'), fullPage: true });
    if (como === 'nada') { ok('reto sin forma de responder', false, await p.locator('.reto').innerHTML()); break; }
    await p.locator('#siguiente').click(); await p.waitForSelector('.reto');
  }
  ok('se respondieron 16 retos', await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).porLang.py.retos) === 16);
  ok('el repaso espaciado anota tarjetas', await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('dojo-progreso')).tarjetas).length) > 0);
  console.log('     clases vistas:', [...vistos].join(', '));
  // un reto respondido con «Ver paso a paso»
  for (let i = 0; i < 10; i++) { await responderReto(p); await p.waitForSelector('.respuesta'); if (await p.getByRole('button', { name: 'Ver paso a paso' }).count()) break; await p.locator('#siguiente').click(); await p.waitForSelector('.reto'); }
  await p.getByRole('button', { name: 'Ver paso a paso' }).click();
  await p.waitForSelector('.traza .controles-traza', { timeout: 8000 });
  ok('desde un reto se abre el paso a paso', await p.locator('.traza').isVisible());
  await p.getByRole('button', { name: 'Claude ya respondió' }).click();
  ok('terminar la espera la anota', await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('dojo-progreso')).dias)[0].esperas) === 1);

  console.log('3. Laboratorio: hilo aparte, datos, detener, avisos');
  await p.locator('#menu-lateral a[href="#lab"]').click(); await p.waitForSelector('#editor-codigo');
  ok('el menú lleva al editor aunque estuviera el paso a paso', true);
  await p.locator('#v-lab .chip', { hasText: 'Python' }).click();
  await p.fill('#editor-codigo', 'nombre = input("¿Nombre? ")\nd = {"a": 1}\nfor i in range(2):\n    print(i, nombre, d["a"])\n');
  await p.click('#btn-ejecutar'); await p.waitForSelector('.consola input');
  await p.fill('.consola input', 'Ana'); await p.press('.consola input', 'Enter');
  await p.locator('#consola', { hasText: /fin del programa/ }).waitFor({ timeout: 15000 });
  ok('programa con dato y diccionario', /0 Ana 1\n1 Ana 1/.test(await p.textContent('#consola')), await p.textContent('#consola'));
  ok('el editor pinta colores', await p.locator('.editor .pintado .kw').count() > 0);
  await p.fill('#editor-codigo', 'i = 0\nwhile True:\n    i += 1\n');
  await p.click('#btn-ejecutar'); await pausa(400);
  ok('mientras corre, el botón dice Detener', (await p.textContent('#btn-ejecutar')) === 'Detener');
  const clicable = await p.evaluate(() => { const t = performance.now(); return new Promise(r => setTimeout(() => r(performance.now() - t), 50)); });
  ok('la pantalla no se congela durante un bucle infinito', clicable < 400, clicable);
  await p.click('#btn-ejecutar'); await p.locator('#consola', { hasText: /detenido/ }).waitFor({ timeout: 15000 });
  ok('Detener para el programa', true);
  await p.locator('#v-lab .chip', { hasText: 'C++' }).click();
  await p.fill('#editor-codigo', '#include <iostream>\n#include <iomanip>\nusing namespace std;\nint main() {\n    int a = 5;\n    if (a = 3) cout << fixed << setprecision(2) << 10.0 / 3 << endl;\n    return 0;\n}\n');
  await p.click('#btn-ejecutar'); await p.locator('#consola', { hasText: /fin del programa/ }).waitFor({ timeout: 15000 });
  ok('C++ con setprecision', /3\.33/.test(await p.textContent('#consola')));
  ok('aviso de «=» en el if', /Aviso, línea 6/.test(await p.textContent('#avisos-lab')), await p.textContent('#avisos-lab'));
  await p.fill('#editor-codigo', '#include <iostream>\nusing namespace std;\nint main() {\n    int x = 5\n    cout << x;\n}\n');
  await p.click('#btn-ejecutar'); await p.waitForSelector('#consola .err');
  ok('error con su línea marcada en el editor', /Línea 4/.test(await p.textContent('#consola .err')) && await p.locator('.editor .numeros .err').textContent() === '4');
  await p.screenshot({ path: path.join(CAPTURAS, '04-lab-error.png'), fullPage: true });

  console.log('4. Paso a paso');
  await p.locator('#v-lab .chip', { hasText: 'Python' }).click();
  await p.fill('#editor-codigo', 'def doble(x):\n    y = x * 2\n    return y\n\nn = int(input())\nm = doble(n)\nprint("Resultado:", m)\n');
  await p.getByRole('button', { name: 'Paso a paso' }).click(); await p.waitForSelector('.traza, #datos-traza');
  ok('pide los datos que necesita', await p.locator('#datos-traza').count() === 1);
  await p.fill('#datos-traza', '21'); await p.getByRole('button', { name: 'Repetir con estos datos' }).click();
  await p.waitForSelector('.controles-traza');
  for (let i = 0; i < 4; i++) await p.keyboard.press('ArrowRight');
  ok('dentro de la función se ve la pila', /Dentro de doble\(\)/.test(await p.textContent('.estado-traza')), await p.textContent('.estado-traza'));
  ok('la variable x vale 21', await p.locator('.variables tr', { hasText: 'x' }).locator('td.valor').first().textContent() === '21');
  await p.screenshot({ path: path.join(CAPTURAS, '05-paso-a-paso.png'), fullPage: true });
  await p.getByRole('button', { name: 'Último paso' }).click();
  ok('al final: terminó y la salida completa', /terminó/.test(await p.textContent('.estado-traza')) && /Resultado: 42/.test(await p.locator('.traza .salida').last().textContent()));
  await p.getByRole('button', { name: '← Volver al editor' }).click();
  ok('vuelve al editor con el código', (await p.inputValue('#editor-codigo')).includes('def doble'));
  await p.locator('#menu-lateral a[href="#ruta"]').click(); await p.locator('.tema').nth(1).click();
  await p.locator('#v-ruta .chip', { hasText: 'PSeInt' }).click(); await p.getByRole('button', { name: 'Ver paso a paso' }).click();
  await p.waitForSelector('.controles-traza');
  ok('el paso a paso desde la Ruta muestra el ejemplo, no el código viejo del editor', /manzanas/.test(await p.textContent('.traza .codigo')) && !/doble/.test(await p.textContent('.traza .codigo')));

  console.log('5. Ejercicio y celebración de cinturón');
  await c.close();
  const casi = { v: 2, bienvenida: true, dias: { [clave(hoy)]: { retos: 9, aciertos: 9 } }, temas: { salida: { ultimos: [1, 1, 1, 1, 1, 1, 1, 1, 1], intentos: 9, aciertos: 9 } }, ajustes: { lang: 'py' } };
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 860 } }, casi));
  await p.goto(URL + '#ruta'); await p.locator('.tema').first().click();
  await p.locator('section.tarjeta', { hasText: 'Ejercicio 2: escríbelo tú' }).getByRole('button', { name: 'Resolver en Python' }).click();
  await p.fill('#editor-codigo', 'for i in range(3):\n    print("***")\n');
  await p.getByRole('button', { name: 'Comprobar el ejercicio' }).click();
  await p.waitForSelector('.capa .celebra');
  ok('celebración de cinturón nuevo', /9\.º kyū/.test(await p.textContent('.celebra h2')));
  await pausa(900); ok('el cinturón grande se ve', await p.locator('.celebra .cinturon.grande').isVisible()); await p.screenshot({ path: path.join(CAPTURAS, '06-cinturon.png') });
  await p.keyboard.press('Escape');
  ok('la celebración se cierra con Escape', await p.locator('.capa').count() === 0);
  await p.goto(URL + '#hoy');
  ok('el tema actual pasa a Variables', /Variables/.test(await p.textContent('.siguiente')));

  console.log('6. Migración del progreso de la versión 1.1');
  await c.close();
  const v1 = { v: 1, actualizado: 5, puntos: 120, dias: { [clave(ayer)]: { retos: 12, aciertos: 9, foco: 25, esperas: 3, perdidas: 1, segEspera: 300 } },
    temas: { salida: { ultimos: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], intentos: 10, aciertos: 9, ejercicio: { py: true } } },
    repaso: [{ tpl: 'sin-salto', lang: 'ps', tipo: 'salida', seed: 3, desde: 4, dia: clave(ayer) }], html: {}, ajustes: { meta: 20, foco: 25, lang: 'mezcla', tema: 'auto' }, plan: { checks: {}, regla: 'Mi regla' } };
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 860 } }, v1));
  await p.goto(URL);
  ok('sin bienvenida para quien ya usaba la app', await p.locator('.bienvenida').count() === 0);
  ok('conserva el cinturón (9.º kyū)', /9\.º kyū/.test(await p.textContent('#rango-lateral')));
  ok('conserva puntos y racha', /120 puntos/.test(await p.textContent('#v-hoy')) && /1 día/.test(await p.textContent('#rango-lateral')));
  await p.goto(URL + '#plan');
  ok('conserva la regla', (await p.inputValue('#regla')) === 'Mi regla');

  console.log('7. Plan: aspecto, código de progreso, borrar');
  await p.selectOption('#aj-aspecto', 'oscuro');
  ok('aspecto oscuro', await p.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'dark');
  await p.screenshot({ path: path.join(CAPTURAS, '07-plan-oscuro.png'), fullPage: true });
  await c.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new globalThis.URL(URL).origin });
  await p.getByRole('button', { name: 'Copiar mi progreso' }).click(); await pausa(200);
  const codigo = await p.evaluate(() => navigator.clipboard.readText());
  ok('código de progreso copiado', codigo.startsWith('DOJO1:'));
  const borrar = p.getByRole('button', { name: 'Borrar mi progreso' }); await borrar.click(); await p.getByRole('button', { name: /Toca otra vez/ }).click();
  ok('borrar vuelve a la bienvenida', !!(await p.waitForSelector('.bienvenida', { timeout: 3000 }).catch(() => null)));
  await p.goto(URL + '#plan'); await p.fill('#pegar-progreso', codigo);
  await p.getByRole('button', { name: 'Cargar este progreso' }).click(); await p.getByRole('button', { name: /Toca otra vez/ }).click();
  ok('el código lo devuelve todo', /120 puntos/.test(await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).puntos + ' puntos')));

  console.log('8. HTML');
  const erroresAntesHtml = errores.length;
  await p.goto(URL + '#lab'); await p.locator('#v-lab .chip', { hasText: 'HTML' }).click();
  await p.fill('#editor-codigo', '<h1>Ana</h1><p>Hola</p><p>Aprendo</p><img src=x onerror="document.title=\'hackeado\'"><img/onerror="document.title=\'hackeado2\'" src=y><svg><a xlink:href="javascript:alert(1)">s</a></svg><a href="javascript:alert(1)">x</a>');
  await pausa(600);
  ok('la vista previa se pinta', await p.evaluate(() => document.querySelector('#vista-html').shadowRoot.querySelector('h1').textContent) === 'Ana');
  ok('no ejecuta código metido en el HTML', !/hackeado/.test(await p.title()) && await p.evaluate(() => { const r = document.querySelector('#vista-html').shadowRoot; return ![...r.querySelectorAll('*')].some(n => [...n.attributes].some(a => /^on/i.test(a.name) || /javascript:/i.test(a.value))); }));

  // las imágenes x / y no existen a propósito (para provocar onerror): sus 404 son esperados
  for (let k = errores.length - 1; k >= erroresAntesHtml; k--) if (/404/.test(errores[k])) errores.splice(k, 1);
  console.log('9. Sin internet y actualización');
  await c.close();
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 860 } }, { v: 2, bienvenida: true }));
  await p.goto(URL); await pausa(1500); await p.reload(); await pausa(700);
  ok('el service worker controla la página', await p.evaluate(() => !!navigator.serviceWorker.controller));
  const cdp = await c.newCDPSession(p);
  ok('el navegador la acepta como instalable', (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors.length === 0);
  await c.setOffline(true); await p.reload(); await p.waitForSelector('.portada');
  await p.goto(URL + '#lab'); await p.locator('#v-lab .chip', { hasText: 'PSeInt' }).click();
  await p.click('#btn-ejecutar'); await p.locator('#consola', { hasText: /fin del programa/ }).waitFor({ timeout: 15000 });
  ok('sin internet: carga y ejecuta código (hilo aparte incluido)', /Hola desde PSeInt/.test(await p.textContent('#consola')));
  ok('sin internet: usa las fuentes propias', await p.evaluate(() => document.fonts.check('16px "IBM Plex Sans"')));
  await c.setOffline(false);
  await c.close();

  console.log('10. Móvil (claro y oscuro): nada se sale de la pantalla');
  for (const esquema of ['light', 'dark']) {
    ({ c, p } = await nueva(b, { ...devices['iPhone 13'], colorScheme: esquema }, { v: 2, bienvenida: true }));
    for (const v of ['hoy', 'retos', 'ruta', 'lab', 'plan']) {
      await p.goto(URL + '#' + v); await pausa(250);
      ok(`móvil ${esquema} · ${v} sin desbordar`, await sinDesbordar(p));
      if (esquema === 'dark' && (v === 'hoy' || v === 'retos' || v === 'lab')) await p.screenshot({ path: path.join(CAPTURAS, `08-movil-${v}.png`) });
    }
    await c.close();
  }
  ok('sin errores en la consola ni violaciones de seguridad', errores.length === 0, errores);
  await b.close();
  console.log(`\n${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
