// Pruebas del núcleo (sin navegador): node pruebas/nucleo.test.js
globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
const N = require('../nucleo.js');
let bien = 0, mal = 0;
const ok = (nombre, cond, detalle) => { if (cond) bien++; else { mal++; console.log('✗ ' + nombre + (detalle !== undefined ? ' → ' + JSON.stringify(detalle) : '')); } };
const hoy = N.hoyClave(), ayer = N.diasAtras(1);

// 1. Migración desde la versión 1 (la que tiene instalada el usuario)
const v1 = { v: 1, actualizado: 5, puntos: 120, dias: { [ayer]: { retos: 12, aciertos: 9, foco: 25, esperas: 3, perdidas: 1, segEspera: 300 } },
  temas: { salida: { ultimos: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1], intentos: 10, aciertos: 9, ejercicio: { py: true } } },
  repaso: [{ tpl: 'sin-salto', lang: 'ps', tipo: 'salida', seed: 3, desde: 4, dia: ayer }, { tpl: 'no-existe', lang: 'py' }],
  html: { 'html-1': true }, ajustes: { meta: 30, foco: 25, lang: 'py', tema: 'auto' }, plan: { checks: { tiktok: true }, regla: 'Mi regla' } };
const m = N.normaliza(v1, D);
ok('migra ejercicio v1', m.ejercicios['salida-1'] && m.ejercicios['salida-1'].py === true, m.ejercicios);
ok('migra repaso v1 a tarjetas', m.tarjetas['sin-salto|ps'] && m.tarjetas['sin-salto|ps'].caja === 0 && !m.tarjetas['no-existe|py'], m.tarjetas);
ok('conserva ajustes y añade los nuevos', m.ajustes.meta === 30 && m.ajustes.lang === 'py' && m.ajustes.aspecto === 'sistema' && m.ajustes.vibrar === true, m.ajustes);
ok('conserva días, puntos, html y plan', m.dias[ayer].retos === 12 && m.puntos === 120 && m.html['html-1'] && m.plan.checks.tiktok && m.plan.regla === 'Mi regla');
ok('un usuario con historial no ve la bienvenida', m.bienvenida === true);
ok('tema 1 dominado tras migrar', N.estadoTema(m, D, 'salida').dominado === true && N.dominados(m, D) === 1);
ok('racha cuenta ayer', N.racha(m) === 1, N.racha(m));
ok('la tarjeta migrada toca hoy', N.pendientes(m, D).some(x => x.tpl === 'sin-salto'), N.pendientes(m, D));

// 2. Datos dañados o maliciosos no rompen nada
for (const basura of [null, 42, 'hola', [], { dias: 'x', temas: [], ajustes: { meta: 'mucho', tema: '<img onerror=alert(1)>' }, puntos: -5, tarjetas: { 'a|b|c': 1, 'doble|py': { caja: 99, vence: 'ayer' } }, plan: { regla: 'x'.repeat(2000), checks: { '__proto__': true, 'ok-1': true } } }]) {
  const n = N.normaliza(basura, D);
  ok('normaliza ' + JSON.stringify(basura).slice(0, 30), n.v === 2 && n.ajustes.meta === 20 && n.ajustes.tema === 'auto' && n.puntos >= 0 && n.plan.regla.length <= 500 && typeof n.dias === 'object', n);
}
const raro = N.normaliza({ tarjetas: { 'doble|py': { caja: 99, vence: 'ayer', aciertos: 'tres' } } }, D);
ok('tarjeta con datos raros se corrige', raro.tarjetas['doble|py'].caja === 5 && raro.tarjetas['doble|py'].vence === hoy && raro.tarjetas['doble|py'].aciertos === 0, raro.tarjetas);

// 3. Repaso espaciado
const d = N.NUEVO();
let t = N.apuntaTarjeta(d, 'doble', 'py', true, '2026-01-01'); ok('acierto 1 → 1 día', t.caja === 1 && t.vence === '2026-01-02', t);
t = N.apuntaTarjeta(d, 'doble', 'py', true, '2026-01-02'); ok('acierto 2 → 3 días', t.caja === 2 && t.vence === '2026-01-05', t);
t = N.apuntaTarjeta(d, 'doble', 'py', false, '2026-01-05'); ok('fallo → vuelve a la caja 0', t.caja === 0 && t.vence === '2026-01-05' && t.fallos === 1, t);
for (let i = 0; i < 9; i++) t = N.apuntaTarjeta(d, 'doble', 'py', true, '2026-02-01');
ok('la caja no pasa de 5 (35 días)', t.caja === 5 && t.vence === N.sumaDias('2026-02-01', 35), t);

// 4. Registrar retos, subir de cinturón, puntos débiles
const e = N.NUEVO();
for (let i = 0; i < 8; i++) N.registraReto(e, D, { tema: 'salida', tpl: 'comas', lang: 'cpp', ok: true });
ok('8 aciertos sin ejercicio: aún no hay cinturón', N.dominados(e, D) === 0 && N.estadoTema(e, D, 'salida').retos);
ok('el siguiente paso pide el ejercicio', N.siguientePaso(e, D).id === 'ejercicio', N.siguientePaso(e, D));
const r = N.registraEjercicio(e, D, 'salida-2', 'ps');
ok('el ejercicio 2 también cuenta y sube el cinturón', r.nuevo && r.cinturon === 1 && N.temaActual(e, D).id === 'variables', r);
ok('puntos', e.puntos === 8 * 10 + 50, e.puntos);
ok('estadística por lenguaje', e.porLang.cpp.retos === 8 && e.porLang.cpp.aciertos === 8 && e.porLang.py.retos === 0);
for (let i = 0; i < 3; i++) N.registraReto(e, D, { tema: 'variables', tpl: 'cambio', lang: 'py', ok: false });
N.registraReto(e, D, { tema: 'variables', tpl: 'cambio', lang: 'ps', ok: true });
const deb = N.debiles(e, D);
ok('puntos débiles', deb.length === 1 && deb[0].tpl === 'cambio' && deb[0].peorLang === 'py' && deb[0].titulo === 'Intercambiar dos variables', deb);

// 5. Siguiente paso
const f = N.NUEVO();
ok('día nuevo: retos', N.siguientePaso(f, D).id === 'retos');
ok('en foco: foco', N.siguientePaso(f, D, { foco: true }).id === 'foco');
N.dia(f).retos = 20;
ok('meta cumplida sin foco: foco', N.siguientePaso(f, D).id === 'foco');
N.dia(f).foco = 25;
ok('día completo', N.siguientePaso(f, D).id === 'hecho');
const g = N.NUEVO(); for (const tpl of ['dos-lineas', 'sin-salto', 'comas']) g.tarjetas[tpl + '|py'] = { caja: 1, vence: ayer, aciertos: 1, fallos: 0, visto: N.diasAtras(2) };
ok('repasos pendientes', N.siguientePaso(g, D).id === 'repaso' && N.pendientes(g, D).length === 3);
g.tarjetas['digitos|py'] = { caja: 1, vence: ayer, aciertos: 1, fallos: 0, visto: N.diasAtras(2) };
ok('no repasa temas que aún no tocan', !N.pendientes(g, D).some(x => x.tpl === 'digitos'));

// 6. Código de progreso: ida y vuelta, también con tildes
e.plan.regla = 'Después de comer, foco. Año, acción, ñ';
const vuelta = N.leeCodigoProgreso(N.codigoProgreso(e), D);
ok('código ida y vuelta', JSON.stringify(vuelta.ejercicios) === JSON.stringify(e.ejercicios) && vuelta.plan.regla === e.plan.regla && vuelta.puntos === e.puntos);
ok('código de la versión 1 también entra', N.leeCodigoProgreso(N.codigoProgreso(v1), D).ejercicios['salida-1'].py === true);
let err = ''; try { N.leeCodigoProgreso('hola', D); } catch (x) { err = x.message; } ok('código malo', /DOJO1/.test(err));
err = ''; try { N.leeCodigoProgreso('DOJO1:abc', D); } catch (x) { err = x.message; } ok('código cortado', /incompleto/.test(err), err);

console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
