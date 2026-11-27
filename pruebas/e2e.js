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
/* Para probar los exámenes: un progreso que domina todo lo que entra en el examen del rango k */
const Nm = require('../nucleo.js'), Dm = require('../contenido.js'), Im = require('../ingles.js'), Jm = require('../habla.js');
function domina(k, base = {}) {
  const E = Nm.RANGOS[k].examen, diez = () => Array(10).fill(1), o = JSON.parse(JSON.stringify(base));
  o.temas = Object.assign({}, o.temas); o.ejercicios = Object.assign({}, o.ejercicios);
  o.ingles = Object.assign({ unidades: {}, tarjetas: {} }, o.ingles); o.jerga = Object.assign({ bloques: {}, tarjetas: {} }, o.jerga);
  for (const t of Dm.temas.slice(0, E.temas)) { o.temas[t.id] = { ultimos: diez(), intentos: 10, aciertos: 10 }; o.ejercicios[t.ejercicios[0].id] = { ps: true }; }
  for (const u of Im.unidades.slice(0, E.unidades)) o.ingles.unidades[u.id] = { ultimos: diez(), intentos: 10, aciertos: 10, conversa: 1 };
  for (const b of Jm.bloques.slice(0, E.bloques)) o.jerga.bloques[b.id] = { ultimos: diez(), intentos: 10, aciertos: 10 };
  return o;
}
async function nueva(b, opts = {}, progreso, antes) {
  const c = await b.newContext(opts);
  if (antes) await c.addInitScript(antes);
  if (progreso !== undefined) await c.addInitScript(p => { try { if (!localStorage.getItem('dojo-iniciado')) { localStorage.setItem('dojo-progreso', p); localStorage.setItem('dojo-iniciado', '1'); } } catch (e) {} }, JSON.stringify(progreso));
  const p = await c.newPage();
  p.on('pageerror', e => errores.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errores.push('consola: ' + m.text()); });
  return { c, p };
}
async function responderReto(p) {
  if (await p.locator('#linea-escrita:not([disabled])').count()) { await p.fill('#linea-escrita', 'x'); await p.keyboard.press('Enter'); return 'línea escrita'; }
  if (await p.locator('#hoja-escribe:not([disabled])').count()) { await p.fill('#hoja-escribe', 'x'); await p.locator('#v-retos').getByRole('button', { name: 'Comprobar' }).click(); return 'programa escrito'; }
  if (await p.locator('.opcion:not([disabled])').count()) { await p.locator('.opcion:not([disabled])').first().click(); return 'opción'; }
  const n = await p.locator('.codigo li.toca').count(); if (n) { await p.locator('.codigo li.toca').nth(Math.min(1, n - 1)).click(); return 'línea'; }
  if (await p.locator('.piezas .pieza').count()) { while (await p.locator('.piezas .pieza').count()) await p.locator('.piezas .pieza').first().click(); await p.getByRole('button', { name: 'Comprobar' }).click(); return 'orden'; }
  return 'nada';
}
const sinDesbordar = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const { vozFalsa, resuelveIngles, resuelveExamen, cierraFiesta, CURSO } = require('./robot-ingles.js');

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
  await p.getByRole('button', { name: 'Le acabo de escribir a Claude' }).click(); await p.waitForSelector('.reto');
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

  // PSeInt completo en el laboratorio: Borrar Pantalla, Para Cada y el aviso del Para hacia atrás
  await p.locator('#v-lab .chip', { hasText: 'PSeInt' }).click();
  await p.fill('#editor-codigo', 'Algoritmo prueba\n    Escribir "antes"\n    Borrar Pantalla\n    Dimension v[3]\n    v[1] <- 4\n    v[2] <- 5\n    v[3] <- 6\n    Para Cada x de v Hacer\n        Escribir x Sin Saltar\n    FinPara\n    Para i <- 3 Hasta 1 Hacer\n        Escribir i\n    FinPara\nFinAlgoritmo\n');
  await p.click('#btn-ejecutar'); await p.locator('#consola', { hasText: /fin del programa/ }).waitFor({ timeout: 15000 });
  { const c = await p.textContent('#consola'); ok('PSeInt: Borrar Pantalla limpia la consola y Para Cada recorre', /^456/.test(c) && !/antes/.test(c), c); }
  ok('PSeInt: aviso del Para hacia atrás sin Con Paso', /Aviso, línea 11/.test(await p.textContent('#avisos-lab')), await p.textContent('#avisos-lab'));
  await p.getByRole('button', { name: 'Paso a paso' }).click(); await p.waitForSelector('.controles-traza');
  await p.keyboard.press('ArrowRight');   // paso 2: en la línea 3 (Borrar Pantalla), ya se escribió «antes»
  ok('PSeInt paso a paso: antes de borrar se ve lo escrito', /antes/.test(await p.locator('.traza .salida').last().textContent()));
  await p.getByRole('button', { name: 'Último paso' }).click();
  { const t = await p.locator('.traza .salida').last().textContent(); ok('PSeInt paso a paso: al final solo lo de después de borrar', /456/.test(t) && !/antes/.test(t), t); }
  await p.getByRole('button', { name: '← Volver al editor' }).click(); await p.waitForSelector('#editor-codigo');

  // en PSeInt los tipos también valen como nombre de variable: azul solo después de «Como»
  { const c = await p.evaluate(() => ['Definir numero Como Entero', 'Leer texto'].map(l => UI.piezas(l, 'ps').filter(x => x.t.trim()).map(x => x.c).join(' ')));
    ok('«numero» o «texto» como variable no salen como palabra clave', c[0] === 'kw var kw kw' && c[1] === 'kw var', c); }
  // el cuadro crece con el código: la capa donde se escribe y la de colores nunca se separan
  await p.fill('#editor-codigo', Array.from({ length: 30 }, (_, i) => 'Escribir "línea ' + (i + 1) + '"').join('\n'));
  await p.locator('#editor-codigo').press('Control+End'); await pausa(150);
  { const m = await p.evaluate(() => { const ta = document.querySelector('#editor-codigo'), pre = ta.parentElement.querySelector('.pintado'); return { ta: ta.scrollTop, pre: pre.scrollTop, cabe: ta.clientHeight >= ta.scrollHeight - 1, alto: Math.abs(ta.getBoundingClientRect().height - pre.getBoundingClientRect().height) < 2 }; });
    ok('con 30 líneas el cuadro crece: el cursor y el texto de colores van juntos', m.ta === 0 && m.pre === 0 && m.cabe && m.alto, m); }

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
  ok('conserva el cinturón (9.º kyū)', /9\.º kyū/.test(await p.textContent('#v-hoy')));
  ok('con 120 puntos el rango es Aprendiz', /Aprendiz/.test(await p.textContent('#rango-lateral')));
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

  console.log('11. Inglés: práctica con voz, micrófono, puntos y subir de rango');
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, domina(1, { v: 2, bienvenida: true, puntos: 195, examenes: {}, proyectos: { 1: 3 }, tramo: { k: 1, codigo: 120, ingles: 0, habla: 75 } }), vozFalsa));
  await p.goto(URL + '#ingles'); await p.waitForSelector('.portada-en');
  ok('la pestaña Inglés está en el menú', await p.locator('#menu-lateral a[href="#ingles"]').count() === 1);
  ok('dice qué voz y micrófono hay', /voz del dispositivo/.test(await p.textContent('.estado-voz')) && /micrófono del dispositivo/.test(await p.textContent('.estado-voz')));
  ok('las 14 unidades, en cuatro niveles', await p.locator('#v-ingles .temas .tema').count() === CURSO.unidades.length && /A1 · Principiante/.test(await p.textContent('#v-ingles')) && /B2 · Intermedio alto/.test(await p.textContent('#v-ingles')));
  await p.screenshot({ path: path.join(CAPTURAS, '11-ingles.png') });
  await p.locator('#v-ingles').getByRole('button', { name: 'Practicar', exact: true }).click(); await p.waitForSelector('#v-ingles .ejercicio');
  const tiposIngles = new Set(); let puntosAntes = 280, sumaOk = true, fiesta = false;
  for (let k = 0; k < 14; k++) {
    const t = await resuelveIngles(p, true); tiposIngles.add(t);
    if (!(await p.locator('#v-ingles .respuesta.si').count())) { sumaOk = false; console.log('     no aceptó la respuesta buena de', t, await p.textContent('#v-ingles .ejercicio')); }
    if (await p.locator('.capa').count()) { fiesta = fiesta || /Examen de ascenso disponible/.test(await p.textContent('.capa')); if (k === 2 || fiesta) await p.screenshot({ path: path.join(CAPTURAS, '12-nuevo-rango.png') }); await cierraFiesta(p); }
    await p.locator('#ing-siguiente').click(); await p.waitForSelector('#v-ingles .ejercicio');
  }
  console.log('     tipos de inglés vistos:', [...tiposIngles].join(', '));
  ok('el alumno robot acierta todos los tipos que salen', sumaOk);
  ok('al empezar una unidad sale primero el vocabulario', [...tiposIngles].every(t => ['significado', 'palabra', 'escucha'].includes(t)) || tiposIngles.size > 3);
  ok('al responder se oye la palabra o la frase', await p.evaluate(() => window.__dicho.length >= 10));
  ok('llenar la parte de inglés (la última que faltaba) abre el examen de «Estudiante de código», pero no sube solo', fiesta && /Aprendiz/.test(await p.textContent('#rango-lateral')));
  ok('las tres partes se ven llenas junto al rango', await p.locator('#rango-lateral .parte.llena').count() === 3);
  await resuelveIngles(p, true);
  ok('con el inglés lleno, acertar ya no suma y lo dice', /Inglés ya está lleno/.test(await p.textContent('#v-ingles .respuesta')), await p.textContent('#v-ingles .respuesta'));
  await cierraFiesta(p); await p.locator('#ing-siguiente').click(); await p.waitForSelector('#v-ingles .ejercicio');
  // forzar frases (unidad con ejercicios ya hechos): practicar la unidad 1 hasta ver frases y el micrófono
  const vistosFrase = new Set();
  for (let k = 0; k < 80 && !(vistosFrase.has('habla') && vistosFrase.has('ordenar') && vistosFrase.size >= 4); k++) {
    const t = await resuelveIngles(p, true); vistosFrase.add(t); await cierraFiesta(p);
    if (!(await p.locator('#v-ingles .respuesta.si').count())) { sumaOk = false; console.log('     no aceptó la respuesta buena de', t); }
    await p.locator('#ing-siguiente').click(); await p.waitForSelector('#v-ingles .ejercicio');
  }
  console.log('     después:', [...vistosFrase].join(', '));
  ok('salen frases: ordenar, hablar y otras', vistosFrase.has('ordenar') && vistosFrase.has('habla'), [...vistosFrase]);
  ok('el robot sigue acertando con frases y voz', sumaOk);
  // un fallo resta
  let tFallo = await resuelveIngles(p, false);
  ok(`fallar resta puntos (${tFallo})`, await p.locator('#v-ingles .respuesta.no, #v-ingles .respuesta.casi').count() === 1 && /−\d+ puntos/.test(await p.textContent('#v-ingles .respuesta')), await p.textContent('#v-ingles .respuesta'));
  await p.screenshot({ path: path.join(CAPTURAS, '13-ingles-fallo.png') });
  await p.locator('#ing-siguiente').click(); await p.waitForSelector('#v-ingles .ejercicio');
  // hablar: hasta encontrar un ejercicio de hablar y decirlo bien
  for (let k = 0; k < 40; k++) { if ((await p.textContent('#v-ingles .reto-cab .etiqueta')).trim() === 'Habla') break; await resuelveIngles(p, true); await cierraFiesta(p); await p.locator('#ing-siguiente').click(); await p.waitForSelector('#v-ingles .ejercicio'); }
  if ((await p.textContent('#v-ingles .reto-cab .etiqueta')).trim() === 'Habla') {
    await resuelveIngles(p, true);
    ok('hablar bien: palabras en verde y correcto', await p.locator('#v-ingles .palabras-dichas .mal').count() === 0 && /Correcto/.test(await p.textContent('#v-ingles .respuesta')), await p.textContent('#v-ingles .respuesta'));
    await p.screenshot({ path: path.join(CAPTURAS, '14-ingles-habla.png') });
  } else ok('aparece un ejercicio de hablar', false);
  await c.close();

  console.log('12. Conversación guiada, unidad dominada y bajar de rango');
  const u1 = CURSO.unidades[0];
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 1000, rangoMax: 2, ingles: { unidades: { u1: { ultimos: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], intentos: 10, aciertos: 10, conversa: 0 } }, tarjetas: {} } }, vozFalsa));
  await p.goto(URL + '#ingles'); await p.waitForSelector('.portada-en');
  await p.locator('#v-ingles .portada-en').getByRole('button', { name: 'Conversar' }).click(); await p.waitForSelector('#v-ingles .chat');
  ok('la conversación empieza con la voz del compañero', (await p.evaluate(() => window.__dicho.at(-1))) === u1.dialogo[0].app);
  await p.evaluate(() => { window.__oir = 'banana pizza'; }); await p.locator('#v-ingles .microfono').click(); await p.locator('#v-ingles .chat .nota').waitFor();
  ok('una respuesta sin sentido pide repetir', /No te entendí/.test(await p.textContent('#v-ingles .chat')));
  for (const t of u1.dialogo) {
    await p.evaluate(x => { window.__oir = x; }, t.ejemplo);
    await p.locator('#v-ingles .microfono').click(); await pausa(250);
  }
  await p.locator('#v-ingles .conversa .respuesta').waitFor();
  ok('conversación completada: +40 y unidad dominada (+100)', /Conversación completada/.test(await p.textContent('#v-ingles .conversa')) && /\+140 puntos/.test(await p.textContent('#v-ingles .conversa')), await p.textContent('#v-ingles .conversa'));
  ok('celebra la unidad dominada', await p.locator('.capa').count() === 1 && /Unidad de inglés dominada/.test(await p.textContent('.capa')));
  await p.screenshot({ path: path.join(CAPTURAS, '15-conversacion.png') }); await cierraFiesta(p);
  await p.locator('#v-ingles').getByRole('button', { name: '← Inglés' }).click(); await p.waitForSelector('.portada-en');
  ok('ahora toca la unidad 2', /Números y símbolos/.test(await p.textContent('#v-ingles .siguiente')));
  await c.close();
  // bajar de rango: con 302 puntos (rango 2), un fallo de inglés (−4) baja a Aprendiz
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 302, rangoMax: 1 }, vozFalsa));
  await p.goto(URL + '#ingles'); await p.waitForSelector('.portada-en');
  await p.locator('#v-ingles').getByRole('button', { name: 'Practicar', exact: true }).click(); await p.waitForSelector('#v-ingles .ejercicio');
  tFallo = await resuelveIngles(p, false);
  ok('fallar bajo el mínimo baja de rango y lo avisa', /Bajaste a «Aprendiz»/.test(await p.textContent('#aviso')) && /Aprendiz/.test(await p.textContent('#rango-lateral')), [tFallo, await p.textContent('#aviso')]);
  await p.goto(URL + '#hoy'); await p.waitForSelector('.rango-tarjeta');
  ok('Hoy muestra el rango, los puntos de hoy y el inglés', /Tu rango · 1 de 10/.test(await p.textContent('.rango-tarjeta')) && /Hoy −\d/.test(await p.textContent('.rango-tarjeta')) && /Inglés para programar/.test(await p.textContent('#v-hoy')));
  await p.locator('.rango-tarjeta summary').click();
  ok('la escalera tiene los 10 rangos hasta Ingeniero de élite', await p.locator('.rango-tarjeta .escalera li').count() === 10 && /Ingeniero de élite/.test(await p.textContent('.rango-tarjeta .escalera')));
  await p.screenshot({ path: path.join(CAPTURAS, '16-hoy-rango.png'), fullPage: true });
  await p.goto(URL + '#plan'); await p.waitForSelector('#puntos');
  ok('el Plan explica cuánto vale cada cosa', /Reto de código fallado/.test(await p.textContent('#puntos')) && /−5/.test(await p.textContent('#puntos')));
  await c.close();
  // sin voz ni micrófono: no salen ejercicios de escuchar ni de hablar, y se puede conversar escribiendo
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, ingles: { unidades: { u2: { ultimos: [1, 1, 1, 1, 1], intentos: 5, aciertos: 5, conversa: 0 } } } },
    () => { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); window.webkitSpeechRecognition = undefined; window.SpeechRecognition = undefined; }));
  await p.goto(URL + '#ingles'); await p.waitForSelector('.portada-en');
  ok('sin voz lo dice', /sin audio/.test(await p.textContent('.estado-voz')) && /sin micrófono/.test(await p.textContent('.estado-voz')));
  await p.locator('#v-ingles').getByRole('button', { name: 'Practicar', exact: true }).click(); await p.waitForSelector('#v-ingles .ejercicio');
  const sinVoz = new Set();
  for (let k = 0; k < 25; k++) { sinVoz.add(await resuelveIngles(p, true)); await cierraFiesta(p); await p.locator('#ing-siguiente').click(); await p.waitForSelector('#v-ingles .ejercicio'); }
  ok('sin voz no hay escucha, dictado ni habla', !sinVoz.has('escucha') && !sinVoz.has('dictado') && !sinVoz.has('habla') && !(await p.locator('#v-ingles .microfono, #v-ingles .oir').count()), [...sinVoz]);
  await p.locator('#v-ingles').getByRole('button', { name: '← Inglés' }).click();
  await p.locator('#v-ingles .portada-en').getByRole('button', { name: 'Conversar' }).click(); await p.waitForSelector('#v-ingles .chat');
  await p.fill('#conv-texto', CURSO.unidades[0].dialogo[0].ejemplo); await p.keyboard.press('Enter');
  ok('sin micrófono se conversa escribiendo', (await p.locator('#v-ingles .burbuja.yo.bien').count()) === 1);
  ok('fuera de Claude ofrece copiar la instrucción para el modo de voz de Claude', await p.getByRole('button', { name: 'Copiar la instrucción para Claude' }).count() === 1);
  await c.close();

  console.log('13. Examen de ascenso: aprobar, suspender y abandonar');
  const modoPruebas = () => { localStorage.setItem('dojo-pruebas', '1'); };
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, domina(1, { v: 2, bienvenida: true, puntos: 1100, examenes: {}, proyectos: { 1: 3, 2: 3 } }), modoPruebas));
  await p.goto(URL + '#hoy'); await p.waitForSelector('.rango-tarjeta');
  ok('con los puntos pero sin examen sigues en Aprendiz', /Aprendiz/.test(await p.textContent('#rango-lateral')) && /Examen para «Estudiante de código»/.test(await p.textContent('.siguiente')));
  await p.locator('.rango-tarjeta').getByRole('button', { name: /Hacer el examen/ }).click(); await p.waitForSelector('#ex-empezar');
  ok('la portada del examen dice qué debe saber, qué entra y las reglas', /Lo que debe saber un Estudiante de código/.test(await p.textContent('#v-examen')) && /Lo básico del código/.test(await p.textContent('#v-examen')) && /12 preguntas/.test(await p.textContent('#v-examen')) && /Sin ninguna ayuda/.test(await p.textContent('#v-examen')) && /Mostrar en pantalla/.test(await p.textContent('#v-examen')) && /Hola, soy programador/.test(await p.textContent('#v-examen')));
  await p.screenshot({ path: path.join(CAPTURAS, '17-examen-portada.png') });
  await p.click('#ex-empezar'); await p.waitForSelector('#v-examen .pregunta');
  ok('durante el examen no hay tutor, ni paso a paso, ni laboratorio', await p.locator('#v-examen').getByRole('button', { name: /Explícamelo|Copiar la pregunta|Paso a paso|laboratorio/i }).count() === 0);
  const vistosEx = new Set(); let sinPista = true;
  for (let k = 0; k < 12; k++) {
    if (await p.locator('#v-examen .respuesta, #v-examen .correcta, #v-examen .fallada').count()) sinPista = false;
    vistosEx.add(await resuelveExamen(p, true)); if (k === 3) await p.screenshot({ path: path.join(CAPTURAS, '18-examen-pregunta.png') });
  }
  console.log('     preguntas vistas:', [...vistosEx].join(', '));
  ok('no dice si aciertas hasta el final', sinPista);
  ok('mezcla código, inglés y habla de programador', [...vistosEx].some(x => x.startsWith('codigo')) && [...vistosEx].some(x => x.startsWith('ingles')) && [...vistosEx].some(x => x.startsWith('habla')));
  await p.waitForSelector('.resultado-examen');
  ok('todo bien: aprobado con 100 %', /Aprobado/.test(await p.textContent('.resultado-examen')) && /100 %/.test(await p.textContent('.resultado-examen')), await p.textContent('.resultado-examen'));
  ok('al aprobar celebra el rango nuevo', await p.locator('.capa').count() === 1 && /Nuevo rango/.test(await p.textContent('.capa')) && /Estudiante de código/.test(await p.textContent('.capa')));
  await p.screenshot({ path: path.join(CAPTURAS, '19-examen-aprobado.png') }); await cierraFiesta(p);
  ok('ya eres Estudiante de código (300 recortados del progreso de antes + 150)', /Estudiante de código/.test(await p.textContent('#rango-lateral')) && /450 puntos/.test(await p.textContent('#rango-lateral')), await p.textContent('#rango-lateral'));
  await p.locator('#menu-lateral a[href="#hoy"]').click(); await pausa(250); await p.goto(URL + '#examen'); await p.waitForSelector('#ex-requisitos');
  ok('el examen siguiente no se abre solo: pide llenar las tres partes y dominar sus temas', await p.locator('#ex-empezar').count() === 0 && await p.locator('#ex-faltan li').count() >= 1 && /Código: 60 de 280/.test(await p.textContent('#ex-requisitos')), await p.textContent('#ex-requisitos'));
  await p.screenshot({ path: path.join(CAPTURAS, '19b-examen-requisitos.png'), fullPage: true });
  await p.locator('#ex-faltan').getByRole('button', { name: 'Practicar' }).first().click(); await p.waitForSelector('.reto');
  ok('«Practicar» lleva a los retos del tema que falta', await p.inputValue('#tema-retos') === 'operaciones', await p.inputValue('#tema-retos'));
  await c.close();
  // el de Pasante (1000 puntos), con las tres partes llenas y todo dominado: suspenderlo
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, domina(2, { v: 2, bienvenida: true, puntos: 1000, rangoMax: 1, examenes: {}, proyectos: { 1: 3, 2: 3 } }), modoPruebas));
  await p.goto(URL + '#examen'); await p.waitForSelector('#ex-empezar'); await p.click('#ex-empezar'); await p.waitForSelector('#v-examen .pregunta');
  ok('el examen de Pasante tiene 14 preguntas', /Pregunta 1 de 14/.test(await p.textContent('#v-examen')));
  for (let k = 0; k < 14; k++) await resuelveExamen(p, k < 6);
  await p.waitForSelector('.resultado-examen');
  ok('6 de 14: suspendido, sin subir y −100 puntos', /Suspendido/.test(await p.textContent('.resultado-examen')) && /−100 puntos/.test(await p.textContent('.resultado-examen')) && /Estudiante de código/.test(await p.textContent('#rango-lateral')) && /900 puntos/.test(await p.textContent('#rango-lateral')) && /Lo que fallaste \(8\)/.test(await p.textContent('#v-examen')), await p.textContent('#v-examen'));
  await p.screenshot({ path: path.join(CAPTURAS, '20-examen-suspendido.png'), fullPage: true });
  await p.locator('#menu-lateral a[href="#hoy"]').click(); await pausa(250); await p.goto(URL + '#examen'); await p.waitForSelector('#v-examen .examen-intro');
  ok('tras suspender no se puede repetir: primero el repaso de lo fallado', await p.locator('#ex-empezar').count() === 0 && /primero repasa las 8 preguntas/.test(await p.textContent('#v-examen')));
  await p.click('#ex-repasar'); await p.waitForSelector('#v-examen .pregunta');
  ok('el repaso enseña la respuesta (aquí sí hay ayuda)', /Quedan 8/.test(await p.textContent('#v-examen')));
  await resuelveExamen(p, false); await p.waitForSelector('#v-examen .respuesta');
  ok('fallar en el repaso resta y la pregunta se queda', /se queda en el repaso/.test(await p.textContent('#v-examen .respuesta')) && /−5 puntos/.test(await p.textContent('#v-examen .respuesta')));
  await p.screenshot({ path: path.join(CAPTURAS, '21-repaso-examen.png'), fullPage: true });
  for (let k = 0; k < 20 && await p.locator('#v-examen .pregunta').count(); k++) {
    if (await p.locator('#v-examen .respuesta').count()) { await p.click('#ex-siguiente'); await pausa(80); continue; }
    await resuelveExamen(p, true); await p.waitForSelector('#v-examen .respuesta');
  }
  await p.waitForSelector('#v-examen .examen-intro');
  ok('repaso hecho: ahora hay que volver a los puntos de antes', await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).examenes.repaso.length === 0) && /Repaso hecho\. Vuelve a llenar las tres partes \(1000 puntos\): te faltan \d+/.test(await p.textContent('#v-examen')) && await p.locator('#ex-empezar').count() === 0, await p.textContent('#v-examen'));
  await c.close();
  // abandonar: cambiar de pantalla o recargar a mitad cuenta como suspenso
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, domina(1, { v: 2, bienvenida: true, puntos: 400, examenes: {}, proyectos: { 1: 3 } }), modoPruebas));
  await p.goto(URL + '#examen'); await p.click('#ex-empezar'); await p.waitForSelector('#v-examen .pregunta');
  await resuelveExamen(p, true); await p.locator('#menu-lateral a[href="#retos"]').click(); await pausa(300);
  ok('salir a mitad: suspendido, resta puntos y lo avisa', /cuenta como suspendido/.test(await p.textContent('#aviso')) && /Aprendiz/.test(await p.textContent('#rango-lateral')) && /250 puntos/.test(await p.textContent('#rango-lateral')));
  ok('el intento abandonado queda en el historial', await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).examenes.historial.at(-1).abandonado === true));
  await c.close();
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, domina(1, { v: 2, bienvenida: true, puntos: 400, examenes: {}, proyectos: { 1: 3 } }), modoPruebas));
  await p.goto(URL + '#examen'); await p.click('#ex-empezar'); await p.waitForSelector('#v-examen .pregunta');
  await p.reload(); await p.waitForSelector('.portada, .examen-intro, .rango-tarjeta').catch(() => {}); await pausa(400);
  ok('recargar a mitad también cuenta como suspenso', await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('dojo-progreso')); return d.examenes.historial.length === 1 && d.examenes.historial[0].abandonado && d.rangoMax === 0 && d.puntos === 250 && d.examenes.repaso.length === 12; }));
  await c.close();

  console.log('14. Habla de programador y fallos que restan');
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 500, examenes: {} }));
  await p.goto(URL + '#habla'); await p.waitForSelector('.portada-habla');
  ok('la pestaña Habla muestra los 8 bloques', await p.locator('#v-habla .tema').count() === require('../habla.js').bloques.length && await p.locator('#menu-lateral a[href="#habla"]').count() === 1);
  await p.locator('#v-habla .tema').first().click();
  ok('el bloque enseña términos en español e inglés y la forma profesional', /variable/.test(await p.textContent('#v-habla .glosario')) && /return value/.test(await p.textContent('#v-habla .glosario')) && await p.locator('#v-habla .bien-dicho').count() === 4 && await p.locator('#v-habla .mal-dicho').count() === 4);
  await p.screenshot({ path: path.join(CAPTURAS, '22-habla-bloque.png'), fullPage: true });
  await p.getByRole('button', { name: 'Practicar este bloque' }).click(); await p.waitForSelector('#v-habla .ejercicio');
  const J = require('../habla.js'); let bienH = 0, malH = 0;
  for (let k = 0; k < 8; k++) {
    const op = await p.evaluate(() => { const b = [...document.querySelectorAll('#v-habla .opcion')]; return b.length; });
    await p.locator('#v-habla .opcion').nth(k % op).click(); await p.waitForSelector('#v-habla .respuesta');
    if (await p.locator('#v-habla .respuesta.si').count()) bienH++; else malH++;
    await cierraFiesta(p); await p.click('#hab-siguiente'); await p.waitForSelector('#v-habla .ejercicio');
  }
  ok('la práctica de habla corrige, suma y resta', bienH + malH === 8 && await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).dias[Object.keys(JSON.parse(localStorage.getItem('dojo-progreso')).dias)[0]].jerga === 8));
  await p.screenshot({ path: path.join(CAPTURAS, '23-habla-practica.png') });
  await p.goto(URL + '#lab'); await p.waitForSelector('#v-lab');
  const antesLab = await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).puntos);
  const botonComprobar = p.getByRole('button', { name: /Comprobar/ });
  if (!(await botonComprobar.count())) { await p.goto(URL + '#ruta'); await p.locator('.tema').first().click(); await p.getByRole('button', { name: /Resolver/ }).first().click(); await p.waitForSelector('#editor-codigo'); }
  await p.fill('#editor-codigo', 'Escribir "mal"'); await p.getByRole('button', { name: /Comprobar/ }).click(); await pausa(800);
  ok('un ejercicio del laboratorio que no pasa resta 5 puntos', await p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).puntos) === antesLab - 5);
  await c.close();

  console.log('15. Escribir código: completar líneas, escribir desde cero y el proyecto del rango');
  const W = require('../escribir.js'); const G = require('../estudio.js');
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 2000, examenes: {}, ajustes: { lang: 'py' },
    temas: { salida: { ultimos: [1, 1, 1, 1, 1, 1, 1, 1], intentos: 8, aciertos: 8 } } }, modoPruebas));
  await p.goto(URL + '#retos'); await p.waitForSelector('.reto');
  // forzar los dos tipos de escritura: se busca hasta que salgan (en el tema 1 dominado salen a menudo)
  let vioCompleta = false, vioEscribe = false;
  for (let k = 0; k < 150 && !(vioCompleta && vioEscribe); k++) {
    const tipo = (await p.textContent('.reto-cab .etiqueta')).trim();
    if (tipo === 'Escribe la línea que falta' && !vioCompleta) {
      const linea = await p.evaluate(() => null);
      await p.fill('#linea-escrita', 'print(zzz)'); await p.keyboard.press('Enter'); await p.waitForSelector('.respuesta');
      ok('completar mal: lo corrige ejecutándolo y resta', /−5 puntos/.test(await p.textContent('.respuesta')) && /La línea era/.test(await p.textContent('.respuesta')));
      vioCompleta = true; await p.screenshot({ path: path.join(CAPTURAS, '24-completa.png') });
    } else if (tipo === 'Escríbelo tú' && !vioEscribe) {
      const enun = (await p.textContent('.reto .enunciado')).trim(), tarea = W.tareas.find(t => t.enunciado === enun);
      await p.fill('#hoja-escribe', tarea.sol.py); await p.locator('#v-retos').getByRole('button', { name: 'Comprobar' }).click(); await p.waitForSelector('.respuesta');
      ok('escribir desde cero: la solución pasa todas las pruebas (y suma, si a la parte de código le queda sitio)', /Funciona: lo escribiste tú/.test(await p.textContent('.respuesta')) && /\+1[5-9] puntos|\+20 puntos|Código ya está lleno/.test(await p.textContent('.respuesta')), await p.textContent('.respuesta'));
      vioEscribe = true; await p.screenshot({ path: path.join(CAPTURAS, '25-escribe.png'), fullPage: true });
    } else { await responderReto(p); await p.waitForSelector('.respuesta').catch(() => {}); }
    await cierraFiesta(p); await p.click('#siguiente'); await p.waitForSelector('.reto');
  }
  ok('en Retos salen los dos tipos de escritura', vioCompleta && vioEscribe, [vioCompleta, vioEscribe]);
  // el proyecto del rango: requisito para el examen (con lo que entra ya dominado, para que solo falte el proyecto)
  await p.evaluate(o => { const d = JSON.parse(localStorage.getItem('dojo-progreso')); for (const k of ['temas', 'ejercicios']) Object.assign(d[k], o[k]); Object.assign(d.ingles.unidades, o.ingles.unidades); Object.assign(d.jerga.bloques, o.jerga.bloques); d.tramo = { k: 1, codigo: 120, ingles: 105, habla: 75 }; d.puntos = 300; localStorage.setItem('dojo-progreso', JSON.stringify(d)); }, domina(1));
  await p.reload(); await p.goto(URL + '#hoy'); await p.waitForSelector('.siguiente');
  ok('con los puntos pero sin proyecto, Hoy pide terminar el proyecto', /Termina tu proyecto/.test(await p.textContent('.siguiente')), [await p.textContent('.siguiente'), await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('dojo-progreso')); return [d.puntos, d.tramo, d.proyectos]; })]);
  await p.locator('.siguiente').getByRole('button', { name: 'Seguir el proyecto' }).click(); await p.waitForSelector('#proyecto-hoja');
  const proy = W.proyectoDe(1);
  await p.fill('#proyecto-hoja', 'print("hola")'); await p.click('#proy-comprobar'); await p.waitForSelector('#v-examen .respuesta');
  ok('un paso mal resta y enseña las pruebas', /Todavía no/.test(await p.textContent('#v-examen .respuesta')) && /−5 puntos/.test(await p.textContent('#v-examen .respuesta')));
  for (let k = 0; k < 3; k++) {
    await p.fill('#proyecto-hoja', proy.pasos[k].sol.py); await p.click('#proy-comprobar'); await p.waitForSelector('#v-examen .respuesta.si');
    if (k < 2) { await p.getByRole('button', { name: `Paso ${k + 2}` }).click(); await p.waitForSelector('#proyecto-hoja'); }
  }
  ok('terminar el proyecto lo celebra', await p.locator('.capa').count() === 1 && /Proyecto terminado/.test(await p.textContent('.capa')));
  await p.screenshot({ path: path.join(CAPTURAS, '26-proyecto.png'), fullPage: true }); await cierraFiesta(p);
  ok('lo escrito se guarda (cada paso sigue al anterior)', (await p.inputValue('#proyecto-hoja')).includes('Siguiente nivel'));
  await p.getByRole('button', { name: 'Volver al examen' }).first().click(); await p.waitForSelector('#ex-empezar');
  ok('con el proyecto terminado, el examen se abre', await p.locator('#ex-empezar').count() === 1 && /Terminado/.test(await p.textContent('.proyecto-tarjeta')));
  await p.click('#ex-empezar'); await p.waitForSelector('#v-examen .pregunta');
  const vistosEsc = new Set();
  for (let k = 0; k < 12; k++) vistosEsc.add(await resuelveExamen(p, true));
  await p.waitForSelector('.resultado-examen');
  ok('el examen pide escribir código (y el robot lo escribe bien)', vistosEsc.has('escribe:escribe') && /Aprobado/.test(await p.textContent('.resultado-examen')), [...vistosEsc]);
  await cierraFiesta(p);
  // recordatorio diario
  await p.goto(URL + '#plan'); await p.waitForSelector('#recordatorio');
  const [descarga] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Añadir al calendario' }).click()]);
  const ics = fs.readFileSync(await descarga.path(), 'utf8');
  ok('el recordatorio es un evento diario con aviso', /BEGIN:VCALENDAR/.test(ics) && /RRULE:FREQ=DAILY/.test(ics) && /BEGIN:VALARM/.test(ics) && /T180000/.test(ics), ics.slice(0, 200));
  await c.close();

  console.log('16. Los colores del código: lección, tema de VS Code y «¿Qué pieza es?»');
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 50 }));
  await p.goto(URL + '#ruta'); await p.waitForSelector('.leccion-colores-tarjeta');
  await p.locator('.leccion-colores-tarjeta').getByRole('button', { name: 'Abrir la lección' }).click(); await p.waitForSelector('.categorias');
  ok('la lección enseña las seis categorías y VS Code', await p.locator('.categoria').count() === 6 && /resaltado de sintaxis/.test(await p.textContent('#v-ruta')) && /Dark\+/.test(await p.textContent('#v-ruta')));
  const color = sel => p.evaluate(sl => getComputedStyle(document.querySelector(sl)).color, sel);
  ok('con el tema del Dojo, los textos son ámbar', await color('#v-ruta .lenguajes3 .codigo .str') === 'rgb(243, 198, 119)');
  await p.getByRole('button', { name: 'Colores de VS Code' }).click(); await pausa(150);
  ok('con el tema de VS Code: textos naranja, control morado, variables celeste, fondo #1E1E1E', await color('#v-ruta .lenguajes3 .codigo .str') === 'rgb(206, 145, 120)' && await color('#v-ruta .lenguajes3 .codigo .ctl') === 'rgb(197, 134, 192)' && await color('#v-ruta .lenguajes3 .codigo .var') === 'rgb(156, 220, 254)' && await p.evaluate(() => getComputedStyle(document.querySelector('#v-ruta .lenguajes3 .codigo')).backgroundColor) === 'rgb(30, 30, 30)');
  await p.screenshot({ path: path.join(CAPTURAS, '27-leccion-colores.png'), fullPage: true });
  await p.goto(URL + '#plan'); await p.waitForSelector('#aj-tema-codigo');
  ok('el tema elegido se guarda y está en Ajustes', await p.inputValue('#aj-tema-codigo') === 'vscode');
  await p.locator('#menu-lateral a[href="#ruta"]').click(); await p.locator('.leccion-colores-tarjeta').getByRole('button', { name: 'Practicar: ¿qué pieza es?' }).click(); await p.waitForSelector('.reto');
  const NOMBRE_CAT = { kw: 'Palabra clave', str: 'Texto (entre comillas)', nu: 'Número', fn: 'Función', var: 'Variable', com: 'Comentario' };
  let piezasBien = 0, piezasVistas = 0;
  for (let k = 0; k < 30 && piezasVistas < 6; k++) {
    if ((await p.textContent('.reto-cab .etiqueta')).trim() === '¿Qué pieza es?' || await p.locator('.codigo .marcada').count()) {
      piezasVistas++;
      const clase = await p.evaluate(() => document.querySelector('.codigo .marcada').className.split(' ').find(x => ['kw', 'str', 'nu', 'fn', 'var', 'com'].includes(x)));
      const ops = await p.locator('.opcion pre').allTextContents();
      await p.locator('.opcion').nth(ops.indexOf(NOMBRE_CAT[clase])).click(); await p.waitForSelector('.respuesta');
      if (await p.locator('.respuesta.si').count()) piezasBien++;
      if (piezasVistas === 1) await p.screenshot({ path: path.join(CAPTURAS, '28-que-pieza.png') });
    } else { await responderReto(p); await p.waitForSelector('.respuesta').catch(() => {}); }
    await cierraFiesta(p); await p.click('#siguiente'); await p.waitForSelector('.reto');
  }
  ok('«¿Qué pieza es?»: la categoría marcada es la buena (el robot lee el color y acierta)', piezasVistas >= 1 && piezasBien === piezasVistas, [piezasBien, piezasVistas]);
  await c.close();

  console.log('17. ¿Cuánto tiempo tienes? Sesiones de 5 y 20 minutos y una hora');
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 50 }));
  await p.goto(URL + '#hoy'); await p.waitForSelector('.tiempos');
  ok('la portada pregunta cuánto tiempo tienes, con tres opciones y la espera de Claude aparte', /¿Cuánto tiempo tienes\?/.test(await p.textContent('.portada')) && await p.locator('.tiempos .btn').count() === 3 && await p.getByRole('button', { name: 'Le acabo de escribir a Claude' }).count() === 1);
  await p.screenshot({ path: path.join(CAPTURAS, '29-cuanto-tiempo.png') });
  await p.locator('.tiempos .btn', { hasText: '20 minutos' }).click(); await p.waitForSelector('.banda.sesion');
  ok('20 minutos: barra con reloj y las tres partes', /Sesión de 20 minutos/.test(await p.textContent('.banda.sesion')) && /Retos 0\/8/.test(await p.textContent('.banda.sesion')) && /Habla 0\/5/.test(await p.textContent('.banda.sesion')));
  for (let k = 0; k < 3; k++) { await responderReto(p); await p.waitForSelector('.respuesta'); await cierraFiesta(p); await p.click('#siguiente'); await p.waitForSelector('.reto'); }
  await pausa(1100);
  ok('la sesión cuenta lo que haces', /Retos 3\/8/.test(await p.textContent('.banda.sesion')), await p.textContent('.banda.sesion'));
  await p.locator('.banda.sesion').getByRole('button', { name: /^Inglés/ }).click(); await p.waitForSelector('#v-ingles .ejercicio');
  ok('desde la barra se salta a inglés', await p.locator('#v-ingles .ejercicio').count() === 1);
  await p.locator('.banda.sesion').getByRole('button', { name: 'Terminar' }).click();
  ok('al terminar, un resumen', /3 retos/.test(await p.textContent('#aviso')));
  await p.goto(URL + '#hoy'); await p.locator('.tiempos .btn', { hasText: '1 hora' }).click(); await p.waitForSelector('.banda.foco');
  await pausa(400);
  ok('una hora: bloque de foco de 60 minutos con la lección abierta', /^(60|59):/.test(await p.textContent('#reloj-foco')) && await p.locator('#v-ruta').isVisible(), [await p.textContent('#reloj-foco'), await p.evaluate(() => location.hash)]);
  await c.close();

  console.log('18. Estudio intensivo: guía desde cero, laboratorio libre, diccionario, chuleta y prueba, sin puntos');
  ({ c, p } = await nueva(b, { viewport: { width: 1280, height: 900 } }, { v: 2, bienvenida: true, puntos: 777 }));
  const puntosAhora = () => p.evaluate(() => JSON.parse(localStorage.getItem('dojo-progreso')).puntos);
  await p.goto(URL + '#estudio'); await p.waitForSelector('.lenguajes-estudio');
  ok('Estudio está en el menú y ofrece los tres lenguajes', await p.locator('#menu-lateral a[href="#estudio"]').count() === 1 && await p.locator('.lenguaje-estudio').count() === 3);
  await p.locator('.lenguaje-estudio', { hasText: 'PSeInt' }).click(); await p.waitForSelector('.capitulos');
  ok('la guía de PSeInt tiene 12 capítulos', await p.locator('.capitulo').count() === 12);
  await p.getByRole('button', { name: 'Empezar desde cero' }).click(); await p.waitForSelector('.objetivo');
  ok('empieza desde cero: qué es programar', /Qué es programar/.test(await p.textContent('#v-estudio h1')));
  await p.locator('.ejemplo-estudio').first().getByRole('button', { name: '▶ Ejecutar' }).click();
  ok('los ejemplos se ejecutan ahí mismo', /Hola, mundo/.test(await p.textContent('.ejemplo-estudio')));
  await p.screenshot({ path: path.join(CAPTURAS, '30-estudio-capitulo.png'), fullPage: true });
  await p.getByRole('button', { name: /Mostrar en pantalla: Escribir →/ }).click(); await p.waitForSelector('.palabras-estudio');
  ok('cada capítulo explica sus palabras y errores típicos', /Sin Saltar/.test(await p.textContent('.palabras-estudio')) && await p.locator('.errores-estudio li').count() >= 2);
  // moverse entre capítulos desde arriba y con el botón «atrás»
  await p.click('#cap-siguiente'); await p.waitForSelector('.objetivo');
  ok('arriba: «Siguiente →» pasa al capítulo 3', /capítulo 3 de 12/.test(await p.textContent('#v-estudio .etiqueta')));
  await p.click('#cap-anterior'); await p.waitForSelector('.objetivo');
  ok('arriba: «← Anterior» vuelve al capítulo 2', /capítulo 2 de 12/.test(await p.textContent('#v-estudio .etiqueta')));
  await p.selectOption('#cap-ir', '8'); await p.waitForSelector('.objetivo');
  ok('el selector lleva a cualquier capítulo', /Arreglos/.test(await p.textContent('#v-estudio h1')) && await p.inputValue('#cap-ir') === '8');
  await p.goBack(); await p.waitForSelector('.objetivo');
  ok('el botón atrás del navegador vuelve al capítulo de antes', /capítulo 2 de 12/.test(await p.textContent('#v-estudio .etiqueta')), await p.textContent('#v-estudio .etiqueta'));
  const capituloTras = async mover => { await mover(); await p.waitForTimeout(150); return (await p.textContent('#v-estudio .etiqueta')).match(/capítulo (\d+)/)?.[1]; };
  const recorrido = [];
  for (let i = 0; i < 3; i++) recorrido.push(await capituloTras(() => p.goBack()));
  ok('atrás repite el camino al revés (3, 2, 1)', recorrido.join() === '3,2,1', recorrido);
  await p.goBack(); await p.waitForSelector('.capitulos');
  ok('y un atrás más vuelve a la portada de la guía', await p.locator('.capitulo').count() === 12);
  ok('adelante vuelve al capítulo 1', await capituloTras(() => p.goForward()) === '1');
  // ejercicios de matrices como los de clase: corrección con la rúbrica de 5 puntos
  await p.selectOption('#cap-ir', '8'); await p.waitForSelector('#ejercicios-matrices');
  ok('el capítulo de arreglos trae los 4 ejercicios de matrices', await p.locator('#ejercicios-matrices .practica-estudio').count() === 4);
  const ejPares = G.guias.ps.capitulos.find(x => x.id === 'arreglos').ejercicios.find(x => x.id === 'mat-pares');
  await p.fill('#est-mat-pares', ejPares.sol.replace('Definir matriz, i, j Como Entero\n', ''));
  await p.locator('#ej-mat-pares').getByRole('button', { name: 'Comprobar' }).click();
  ok('rúbrica: sin Definir da 4.0 / 5.0 y dice qué falta', /4\.0 \/ 5\.0/.test(await p.textContent('#ej-mat-pares')) && /Falta declarar las variables con Definir/.test(await p.textContent('#ej-mat-pares .rubrica')));
  await p.fill('#est-mat-pares', ejPares.sol); await p.locator('#ej-mat-pares').getByRole('button', { name: 'Comprobar' }).click();
  ok('rúbrica: la solución completa da 5.0 / 5.0', /5\.0 \/ 5\.0/.test(await p.textContent('#ej-mat-pares')) && /Funciona y cumple la rúbrica/.test(await p.textContent('#ej-mat-pares')));
  await p.screenshot({ path: path.join(CAPTURAS, '31-estudio-matrices.png'), fullPage: false });
  { const boton = p.locator('#ej-mat-notas').getByRole('button', { name: 'Ver una solución' }); await boton.scrollIntoViewIfNeeded(); await p.mouse.wheel(0, 120); await pausa(200);
    const antes = await p.evaluate(() => scrollY); await boton.click(); await pausa(300); const despues = await p.evaluate(() => scrollY);
    ok('pulsar un botón de la guía no te lleva al inicio de la página', antes > 500 && Math.abs(antes - despues) < 5, [antes, despues]); }
  await p.selectOption('#cap-ir', '0'); await p.waitForSelector('.objetivo');
  const t = W.tareas.find(x => x.tema === 'salida');
  await p.fill('#est-' + t.id, t.sol.ps); await p.locator('.practica-estudio').first().getByRole('button', { name: 'Comprobar' }).click();
  ok('practicar escribiendo: se corrige', /Funciona/.test(await p.textContent('.practica-estudio')));
  await p.getByRole('button', { name: /← Guía de PSeInt/ }).first().click(); await p.locator('.acceso', { hasText: 'Diccionario' }).click(); await p.waitForSelector('#dic-busca');
  await p.fill('#dic-busca', 'leer');
  ok('el diccionario busca palabras', /Espera a que el usuario escriba/.test(await p.textContent('.palabras-estudio')));
  await p.getByRole('button', { name: /← Guía de PSeInt/ }).first().click(); await p.locator('.acceso', { hasText: 'Chuleta' }).click();
  ok('la chuleta resume todo', await p.locator('.chuleta tbody tr').count() >= 10);
  await p.getByRole('button', { name: /← Guía de PSeInt/ }).first().click(); await p.locator('.acceso', { hasText: 'Ponte a prueba' }).click(); await p.waitForSelector('.reto');
  for (let k = 0; k < 10; k++) { await p.locator('#v-estudio .opcion').first().click(); await p.click('#est-siguiente'); }
  ok('la prueba sin puntos da un resultado', / de 10/.test(await p.textContent('#v-estudio h1')));
  await p.getByRole('button', { name: 'Volver a la guía' }).click(); await p.getByRole('button', { name: 'Laboratorio libre' }).click(); await p.waitForSelector('#estudio-editor');
  await p.fill('#estudio-editor', 'Leer n\nEscribir n * 3'); await p.fill('#estudio-datos', '7'); await p.click('#estudio-ejecutar');
  ok('el laboratorio libre ejecuta con datos', /21/.test(await p.textContent('#estudio-consola')));
  await p.fill('#estudio-editor', 'Escribir "sin cerrar'); await p.click('#estudio-ejecutar');
  ok('y explica los errores', /Error en la línea 1/.test(await p.textContent('#estudio-consola')));
  ok('nada de lo estudiado cambia los puntos', await puntosAhora() === 777);
  await p.screenshot({ path: path.join(CAPTURAS, '31-estudio-lab.png') });
  await c.close();

  console.log('10. Móvil (claro y oscuro): nada se sale de la pantalla');
  for (const esquema of ['light', 'dark']) {
    ({ c, p } = await nueva(b, { ...devices['iPhone 13'], colorScheme: esquema }, { v: 2, bienvenida: true }));
    for (const v of ['hoy', 'retos', 'estudio', 'ingles', 'habla', 'ruta', 'lab', 'plan', 'examen']) {
      await p.goto(URL + '#' + v); await pausa(250);
      ok(`móvil ${esquema} · ${v} sin desbordar`, await sinDesbordar(p));
      if (esquema === 'dark' && (v === 'hoy' || v === 'retos' || v === 'lab' || v === 'ingles')) await p.screenshot({ path: path.join(CAPTURAS, `08-movil-${v}.png`) });
    }
    await c.close();
  }
  ok('sin errores en la consola ni violaciones de seguridad', errores.length === 0, errores);
  await b.close();
  console.log(`\n${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
