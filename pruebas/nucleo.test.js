// Pruebas del núcleo (sin navegador): node pruebas/nucleo.test.js
globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
const I = require('../ingles.js');
const J = require('../habla.js');
const E = require('../escribir.js');
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
const e = N.normaliza({ v: 2, puntos: 22000, rangoMax: 8, examenes: {} }, D, I, J);   // rango alto: hay sitio de sobra para medir lo que da cada cosa
for (let i = 0; i < 8; i++) N.registraReto(e, D, { tema: 'salida', tpl: 'comas', lang: 'cpp', ok: true });
ok('8 aciertos sin ejercicio: aún no hay cinturón', N.dominados(e, D) === 0 && N.estadoTema(e, D, 'salida').retos);
ok('el siguiente paso pide el ejercicio', N.siguientePaso(e, D).id === 'ejercicio', N.siguientePaso(e, D));
const r = N.registraEjercicio(e, D, 'salida-2', 'ps');
ok('el ejercicio 2 también cuenta y sube el cinturón', r.nuevo && r.cinturon === 1 && N.temaActual(e, D).id === 'variables', r);
ok('puntos: 8 aciertos con racha (10…15) + ejercicio + cinturón', e.puntos - 22000 === (10 + 11 + 12 + 13 + 14 + 15 + 15 + 15) + 50 + 100, e.puntos);
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


// 6. Puntos y rangos
ok('diez rangos, de Aprendiz a Ingeniero de élite', N.RANGOS.length === 10 && N.RANGOS[0].n === 'Aprendiz' && N.RANGOS[9].n === 'Ingeniero de élite');
ok('mínimos crecientes', N.RANGOS.every((r, k) => k === 0 ? r.min === 0 : r.min > N.RANGOS[k - 1].min));
ok('rango con 0 puntos', N.rangoDe(0).i === 0 && N.rangoDe(299).i === 0 && N.rangoDe(300).i === 1, N.rangoDe(300));
ok('rango máximo', N.rangoDe(30000).i === 9 && N.rangoDe(1e7).siguiente === null && N.rangoDe(1e7).prop === 1);
ok('faltan y progreso', N.rangoDe(650).faltan === 350 && Math.abs(N.rangoDe(650).prop - 0.5) < 1e-9, N.rangoDe(650));
// Para probar el examen: dominar todo lo que entra en él (temas, unidades y bloques)
const dominaExamen = (d, k) => {
  const E = N.RANGOS[k].examen, diez = () => Array(10).fill(1);
  for (const t of D.temas.slice(0, E.temas)) { d.temas[t.id] = { ultimos: diez(), intentos: 10, aciertos: 10 }; d.ejercicios[t.ejercicios[0].id] = { ps: true }; }
  for (const u of I.unidades.slice(0, E.unidades)) d.ingles.unidades[u.id] = { ultimos: diez(), intentos: 10, aciertos: 10, conversa: 1 };
  for (const b of J.bloques.slice(0, E.bloques)) d.jerga.bloques[b.id] = { ultimos: diez(), intentos: 10, aciertos: 10 };
};
// Topes por parte: el tramo hacia el rango 2 (300 puntos) se reparte 120 código, 105 inglés y 75 habla
ok('topes del rango 2: 120 / 105 / 75', JSON.stringify(N.topes(1)) === JSON.stringify({ codigo: 120, ingles: 105, habla: 75 }), N.topes(1));
ok('los topes de cada tramo suman lo que separa un rango del siguiente', N.RANGOS.every((R, k) => !k || Object.values(N.topes(k)).reduce((a, b) => a + b) === R.min - N.RANGOS[k - 1].min));
const soloIngles = N.normaliza({ v: 2, bienvenida: true, examenes: {} }, D, I, J);
for (let k = 0; k < 40; k++) N.registraIngles(soloIngles, I, { unidad: 'u1', item: 'u1:hello', ok: true });
ok('solo con inglés no se llega al examen: el inglés se para en su tope (105)', soloIngles.puntos === 105 && soloIngles.tramo.ingles === 105 && !N.estadoExamen(soloIngles).puntosOk, soloIngles.tramo);
ok('al llenarse, el inglés avisa con «tope»', N.registraIngles(soloIngles, I, { unidad: 'u1', item: 'u1:hello', ok: true }).tope === 'ingles');
ok('un fallo de inglés sí resta aunque la parte esté llena', N.registraIngles(soloIngles, I, { unidad: 'u1', item: 'u1:hello', ok: false }).puntos === -4 && soloIngles.tramo.ingles === 101);
const soloCod = N.normaliza({ v: 2, bienvenida: true, examenes: {} }, D, I, J);
for (let k = 0; k < 30; k++) N.registraReto(soloCod, D, { tema: 'salida', tpl: 'comas', lang: 'py', ok: true });
ok('el código guarda sitio para el proyecto (la mitad de su parte)', soloCod.tramo.codigo === 60 && soloCod.puntos === 60, soloCod.tramo);
ok('el estado de las partes', (() => { const a = N.estadoExamen(soloCod).areas; return a.codigo.tiene === 60 && a.codigo.tope === 120 && !a.codigo.lleno && a.ingles.tiene === 0; })());
ok('los puntos siempre cuadran: mínimo del rango + las tres partes', [soloIngles, soloCod].every(x => x.puntos === N.RANGOS[x.rangoMax].min + x.tramo.codigo + x.tramo.ingles + x.tramo.habla));
const migr = N.normaliza({ v: 2, puntos: 5000, examenes: {} }, D, I, J);
ok('progreso de antes: los puntos de más se recortan al tope del tramo y se reparten', migr.puntos === 300 && migr.tramo.codigo === 120 && migr.tramo.ingles === 105 && migr.tramo.habla === 75, migr.tramo);
const migr2 = N.normaliza({ v: 2, puntos: 1500, rangoMax: 2, examenes: {} }, D, I, J);
ok('progreso de antes en el rango 3: lo que pasa de su mínimo se reparte 40/35/25', migr2.puntos === 1500 && migr2.tramo.k === 3 && migr2.tramo.codigo === 200 && migr2.tramo.ingles === 175 && migr2.tramo.habla === 125, migr2.tramo);
ok('un tramo que no cuadra con los puntos se repara', N.normaliza({ v: 2, puntos: 100, examenes: {}, tramo: { k: 1, codigo: 999, ingles: 0, habla: 0 } }, D, I, J).tramo.codigo === 40);
ok('un tramo bueno se conserva', JSON.stringify(N.normaliza({ v: 2, puntos: 100, examenes: {}, tramo: { k: 1, codigo: 0, ingles: 100, habla: 0 } }, D, I, J).tramo) === JSON.stringify({ k: 1, codigo: 0, ingles: 100, habla: 0 }));

// El proyecto: sus puntos caben siempre en la parte de código
const sinProy = N.normaliza({ v: 2, bienvenida: true, puntos: 180, examenes: {}, tramo: { k: 1, codigo: 0, ingles: 105, habla: 75 } }, D, I, J);
ok('con inglés y habla llenos pero sin código ni proyecto, el examen no se abre', !N.estadoExamen(sinProy).disponible && N.estadoExamen(sinProy).proyecto === 0);
let rpp = N.registraPaso(sinProy, 1, 0, false);
ok('un paso del proyecto mal resta 5', rpp.puntos === -5 && (sinProy.proyectos[1] || 0) === 0 && sinProy.tramo.codigo === -5);
rpp = N.registraPaso(sinProy, 1, 0, true); N.registraPaso(sinProy, 1, 1, true);
ok('cada paso bien +40', rpp.puntos === 40 && sinProy.proyectos[1] === 1 + 1);
rpp = N.registraPaso(sinProy, 1, 2, true);
ok('terminar el proyecto llena el código hasta su tope (120)', rpp.terminado && rpp.puntos === 45 && rpp.tope === 'codigo' && sinProy.tramo.codigo === 120 && sinProy.puntos === 300, rpp);
ok('con los puntos y el proyecto, pero sin dominar los temas, el examen sigue cerrado', N.estadoExamen(sinProy).puntosOk && !N.estadoExamen(sinProy).dominioOk && !N.estadoExamen(sinProy).disponible);
ok('dice qué falta dominar: 2 temas, 1 unidad y 1 bloque', (() => { const f = N.estadoExamen(sinProy).faltan; return f.length === 4 && f[0].area === 'codigo' && f[0].id === 'salida' && /0 de 8 retos/.test(f[0].falta) && f.some(x => x.area === 'ingles' && /conversación/.test(x.falta)) && f.some(x => x.area === 'habla'); })(), N.estadoExamen(sinProy).faltan);
ok('el siguiente paso no manda al proyecto si ya está hecho', N.siguientePaso(sinProy, D, {}, I).id !== 'proyecto');
dominaExamen(sinProy, 1);
ok('dominando lo que entra, el examen se abre', N.estadoExamen(sinProy).disponible && N.estadoExamen(sinProy).faltan.length === 0);
ok('repetir un paso ya hecho no da puntos', N.registraPaso(sinProy, 1, 0, true).puntos === 0);

// El examen del rango 2
const ga = N.normaliza({ v: 2, bienvenida: true, puntos: 290, examenes: {}, proyectos: { 1: 3, 2: 3 }, tramo: { k: 1, codigo: 110, ingles: 105, habla: 75 } }, D, I, J);
dominaExamen(ga, 1);
let rr = N.registraReto(ga, D, { tema: 'salida', tpl: 'comas', lang: 'py', ok: true });
ok('llenar la última parte NO sube: abre el examen', rr.cambio && rr.cambio.tipo === 'examen' && rr.cambio.i === 1 && ga.rangoMax === 0 && N.rangoActual(ga).i === 0 && ga.puntos === 300, rr);
ok('equivocarse resta 5 y corta la racha', N.registraReto(ga, D, { tema: 'salida', tpl: 'comas', lang: 'py', ok: false }).puntos === -5 && ga.combo === 0 && ga.puntos === 295);
rr = N.registraReto(ga, D, { tema: 'salida', tpl: 'comas', lang: 'py', ok: true });
ok('con la parte llena, un acierto solo recupera hasta el tope', rr.puntos === 5 && rr.tope === 'codigo' && ga.puntos === 300, rr);
ok('el examen del rango 2 está disponible', N.estadoExamen(ga).disponible && N.estadoExamen(ga).preguntas === 12 && N.estadoExamen(ga).nota === 1 && N.estadoExamen(ga).sabe.length === 3);
const fallosEj = [{ area: 'codigo', spec: { tpl: 'comas', lang: 'py', tipo: 'salida', seed: 7 } }, { area: 'habla', spec: { bloque: 'b1', tipo: 'definicion', seed: 9 } }];
let rx = N.registraExamen(ga, 1, { bien: 7, total: 12, fallos: fallosEj });
ok('suspender resta puntos (−50 en el rango 2, repartidos entre las partes) y no sube', !rx.aprobado && rx.puntos === -50 && ga.puntos === 250 && ga.rangoMax === 0 && ga.tramo.codigo < 120 && ga.tramo.ingles < 105 && ga.tramo.habla < 75, rx);
ok('suspender deja lo fallado para repasar y pide volver a los puntos de antes', N.estadoExamen(ga).repaso === 2 && N.estadoExamen(ga).objetivo === 300 && N.estadoExamen(ga).espera === 50 && !N.estadoExamen(ga).disponible, N.estadoExamen(ga));
let rp = N.registraRepasoExamen(ga, 0, false);
ok('repasar mal resta (en su parte) y la pregunta se queda', rp.puntos === -5 && rp.quedan === 2 && ga.tramo.codigo === 120 - 20 - 5, ga.tramo);
rp = N.registraRepasoExamen(ga, 0, true); N.registraRepasoExamen(ga, 0, true);
ok('repasar bien la quita (+5)', rp.puntos === 5 && ga.examenes.repaso.length === 0);
ok('sin los puntos de antes todavía no se puede repetir', !N.estadoExamen(ga).disponible && N.estadoExamen(ga).espera > 0);
let avisos = [];
for (const a of N.AREAS) { const x = N.estadoAreas(ga)[a]; if (x.tope > x.tiene) avisos.push(N.sumaPuntos(ga, x.tope - x.tiene, a).cambio); }
ok('al llenar otra vez las tres partes (y con el repaso hecho) avisa: examen disponible', N.estadoExamen(ga).disponible && avisos.some(c => c && c.tipo === 'examen'), avisos);
const areasExamen = (cod, ing, hab) => [...Array(cod[1]).keys()].map(i => ({ area: 'codigo', ok: i < cod[0] })).concat([...Array(ing[1]).keys()].map(i => ({ area: 'ingles', ok: i < ing[0] })), [...Array(hab[1]).keys()].map(i => ({ area: 'habla', ok: i < hab[0] })));
const gx = JSON.parse(JSON.stringify(ga));
rx = N.registraExamen(gx, 1, { bien: 10, total: 12, areas: areasExamen([3, 5], [4, 4], [3, 3]) });
ok('aprobar por partes: 83 % en total pero solo 3 de 5 en código → suspendido', !rx.aprobado && JSON.stringify(rx.flojas) === '["codigo"]' && rx.porArea.codigo.bien === 3 && rx.porArea.codigo.total === 5, rx);
rx = N.registraExamen(JSON.parse(JSON.stringify(ga)), 1, { bien: 11, total: 12, areas: areasExamen([5, 5], [3, 4], [3, 3]) });
ok('el examen pide el 100 %: con 11 de 12 se suspende', !rx.aprobado && rx.puntos === -50, rx);
ok('todos los exámenes piden el 100 %', N.RANGOS.slice(1).every(R => R.examen.nota === 1));
rx = N.registraExamen(ga, 1, { bien: 12, total: 12, areas: areasExamen([5, 5], [4, 4], [3, 3]) });
ok('aprobar (12 de 12) sube de rango y da +150', rx.aprobado && rx.cambio.tipo === 'sube' && ga.rangoMax === 1 && N.rangoActual(ga).i === 1 && rx.puntos === 150 && !rx.flojas.length, rx);
ok('el premio empieza el tramo siguiente, repartido entre las tres partes', ga.tramo.k === 2 && ga.tramo.codigo === 60 && ga.tramo.ingles === 53 && ga.tramo.habla === 37 && ga.puntos === 450, ga.tramo);
ok('el historial guarda los dos intentos', ga.examenes.historial.length === 2 && ga.examenes.historial[1].aprobado);
ok('la multa crece con el rango (10 % del mínimo, al menos 50)', N.multaExamen(1) === 50 && N.multaExamen(2) === 100 && N.multaExamen(9) === 3000);
const gm = N.normaliza({ puntos: 5000, rangoMax: 0, examenes: {}, proyectos: { 1: 3 } }, D, I, J); N.registraExamen(gm, 1, { bien: 0, total: 12 });
ok('con puntos de antes de sobra, se recortan al tope y suspender obliga a recuperarlos', gm.puntos === 250 && N.estadoExamen(gm).objetivo === 300 && N.estadoExamen(gm).espera === 50);
ok('en el último rango no hay topes', (() => { const x = N.normaliza({ puntos: 40000, rangoMax: 9, examenes: {} }, D, I, J); N.sumaPuntos(x, 500, 'ingles'); return x.puntos === 40500 && !x.tramo && !N.estadoExamen(x); })());
ok('abandonar cuenta como suspenso', !N.registraExamen(N.normaliza({ puntos: 400, examenes: {} }, D, I), 1, { bien: 10, total: 10, abandonado: true }).aprobado);
const gb = N.normaliza({ v: 2, puntos: 302, rangoMax: 1, examenes: {} }, D, I);
let rb = N.sumaPuntos(gb, -5);
ok('bajar de los puntos del rango avisa «baja»', rb.cambio && rb.cambio.tipo === 'baja' && rb.cambio.i === 0 && gb.rangoMax === 1, rb);
rb = N.sumaPuntos(gb, 10);
ok('volver a subir avisa «recupera», sin repetir el examen', rb.cambio && rb.cambio.tipo === 'recupera' && N.rangoActual(gb).i === 1, rb);
ok('quien venía de antes conserva su rango sin examen', N.normaliza({ puntos: 5000 }, D, I).rangoMax === 4 && N.normaliza({ puntos: 5000, examenes: {} }, D, I).rangoMax === 0);
ok('con 5000 puntos y sin exámenes aprobados eres Aprendiz con el examen 2 pendiente', (() => { const x = N.normaliza({ puntos: 5000, examenes: {}, proyectos: { 1: 3 } }, D, I, J); dominaExamen(x, 1); return N.rangoActual(x).i === 0 && N.estadoExamen(x).rango === 1 && N.estadoExamen(x).disponible; })());
ok('cada rango dice qué debe saber (código, inglés y habla)', N.RANGOS.every(R => Array.isArray(R.sabe) && R.sabe.length === 3));
ok('el repaso guardado se limpia al normalizar', N.normaliza({ examenes: { repaso: [{ area: 'codigo', spec: { tpl: 'comas', lang: 'py', seed: 3 } }, { area: 'x', spec: {} }, { area: 'habla', spec: { bloque: 'b9', seed: 1 } }] } }, D, I, J).examenes.repaso.length === 1);
ok('cada rango (2 a 10) tiene examen, cada vez más grande y exigente', N.RANGOS.slice(1).every((R, k, a) => R.examen && (k === 0 || (R.examen.preguntas >= a[k - 1].examen.preguntas && R.examen.nota >= a[k - 1].examen.nota && R.examen.temas >= a[k - 1].examen.temas && R.examen.unidades >= a[k - 1].examen.unidades))));
ok('el último examen cubre todo: 10 temas, todas las unidades y todos los bloques', N.RANGOS[9].examen.temas === D.temas.length && N.RANGOS[9].examen.unidades === I.unidades.length && N.RANGOS[9].examen.bloques === J.bloques.length);
for (let k = 1; k < 10; k++) {
  for (const sale of [false, true]) {
    const plan = N.planExamen(D, I, k, 1234 + k, { sale }, J, E), R = N.RANGOS[k].examen;
    const esc = plan.filter(x => x.area === 'escribe');
    ok(`examen ${k + 1}: hay que escribir código desde cero (${k <= 2 ? 1 : 2}) de los temas que entran`, esc.length === (k <= 2 ? 1 : 2) && esc.every(x => E.porId[x.spec.tarea] && D.temas.findIndex(t => t.id === x.tema) < R.temas));
    const cod = plan.filter(x => x.area === 'codigo' || x.area === 'escribe'), ing = plan.filter(x => x.area === 'ingles'), hab = plan.filter(x => x.area === 'habla');
    const temas = new Set(cod.map(x => x.tema)), unidades = new Set(ing.map(x => x.unidad)), bloques = new Set(hab.map(x => x.bloque));
    ok(`examen ${k + 1}: ${R.preguntas} preguntas de código, inglés y habla`, plan.length === R.preguntas && cod.length && ing.length && hab.length);
    ok(`examen ${k + 1}: entra todo lo de ese rango y nada de más`, temas.size >= Math.min(R.temas, cod.length - 1) && unidades.size >= Math.min(R.unidades, ing.length - 1) && bloques.size >= Math.min(R.bloques, hab.length - 1)
      && cod.every(x => D.temas.findIndex(t => t.id === x.tema) < R.temas) && ing.every(x => I.porId[x.unidad].n <= R.unidades) && hab.every(x => J.porId[x.bloque].n <= R.bloques), [temas.size, unidades.size, bloques.size]);
    ok(`examen ${k + 1}: lo más nuevo del rango siempre entra`, temas.has(D.temas[R.temas - 1].id) && unidades.has(I.unidades[R.unidades - 1].id) && bloques.has(J.bloques[R.bloques - 1].id));
    ok(`examen ${k + 1}: escuchar solo si hay voz; nunca hablar`, plan.every(x => x.area !== 'ingles' || x.spec.tipo !== 'habla') && (sale || plan.every(x => !['escucha', 'dictado'].includes(x.spec.tipo))));
    let generadas = 0; for (const x of plan) { try { const g = x.area === 'escribe' ? E.porId[x.spec.tarea] : x.area === 'codigo' ? (D.generar(x.spec) || D.generar({ ...x.spec, tipo: 'salida' })) : x.area === 'ingles' ? I.generar(x.spec, { sale, entra: false }) : J.generar(x.spec); if (g) generadas++; } catch (e) {} }
    ok(`examen ${k + 1}: todas las preguntas se generan`, generadas === plan.length, generadas);
  }
}
// Habla de programador y fallos que ahora restan
const hj = N.normaliza({ v: 2, bienvenida: true, puntos: 100 }, D, I, J);
ok('Habla empieza en el bloque 1', N.bloqueActual(hj, J).id === 'b1');
let rj = N.registraJerga(hj, J, { bloque: 'b1', item: 'b1:variable', ok: true });
ok('acierto de habla +8', rj.puntos === 8 && N.leeDia(hj).jerga === 1);
rj = N.registraJerga(hj, J, { bloque: 'b1', item: 'b1:variable', ok: false });
ok('fallo de habla −4 y vuelve a repasarse', rj.puntos === -4 && hj.jerga.tarjetas['b1:variable'].caja === 0);
for (let k = 0; k < 9; k++) N.registraJerga(hj, J, { bloque: 'b1', item: 'b1:bucle', ok: true });
ok('dominar un bloque pasa al siguiente', N.estadoBloque(hj, J, 'b1').dominado && N.bloqueActual(hj, J).id === 'b2');
ok('fallar un ejercicio del laboratorio resta 5', N.registraFallo(hj, N.PUNTOS.ejercicioFallo).delta === -5);
ok('un turno de conversación no entendido resta 2', N.registraFallo(hj, N.PUNTOS.conversaFallo).delta === -2);
const ew = N.normaliza({ puntos: 50 }, D, I, J);
ok('escribir bien vale 15', N.registraReto(ew, D, { tema: 'leer', tarea: 'doble', lang: 'py', ok: true, tipo: 'escribe' }).puntos === 15 && ew.escritos.doble.aciertos === 1);
ok('completar una línea vale 12 (+racha)', N.registraReto(ew, D, { tema: 'leer', tpl: 'suma-dos', lang: 'py', ok: true, tipo: 'completa' }).puntos === 13);
ok('escribir mal resta 5', N.registraReto(ew, D, { tema: 'leer', tarea: 'doble', lang: 'py', ok: false, tipo: 'escribe' }).puntos === -5 && ew.escritos.doble.fallos === 1);
ok('normaliza escritos y proyectos', (() => { const z = N.normaliza({ escritos: { doble: { aciertos: 2 }, 'MAL ID': {} }, proyectos: { 1: 9, x: 2, 3: 1 } }, D, I, J); return z.escritos.doble.aciertos === 2 && !z.escritos['MAL ID'] && z.proyectos[1] === 3 && z.proyectos[3] === 1 && !z.proyectos.x; })());
ok('el código de progreso lleva la habla y los exámenes', JSON.stringify(N.leeCodigoProgreso(N.codigoProgreso(hj), D, I, J).jerga) === JSON.stringify(hj.jerga));
const g3 = N.normaliza({ v: 2, puntos: 3 }, D, I);
ok('los puntos nunca bajan de 0', N.sumaPuntos(g3, -50).delta === -3 && g3.puntos === 0);
ok('un día guardado sin puntos (de antes de los puntos) queda en 0, no en −1.000.000.000', N.normaliza({ v: 2, dias: { '2026-11-24': { retos: 3 } } }, D, I, J).dias['2026-11-24'].puntos === 0 && N.normaliza({ v: 2, dias: { '2026-11-24': { retos: 3, puntos: -1e9 } } }, D, I, J).dias['2026-11-24'].puntos === -1e9);
ok('el día guarda los puntos netos', N.leeDia(g3).puntos === -3, N.leeDia(g3));
const g4 = N.normaliza({ v: 2, puntos: 22000, rangoMax: 8, examenes: {}, ajustes: { meta: 10 } }, D, I); let tot = 0;
for (let k = 0; k < 10; k++) tot += N.registraReto(g4, D, { tema: 'salida', tpl: 'comas', lang: 'ps', ok: true }).puntos;
ok('cumplir la meta da +50', tot === 10 + 11 + 12 + 13 + 14 + 15 * 5 + 50, tot);
ok('sin exámenes guardados (versión anterior), rangoMax no queda por debajo de los puntos', N.normaliza({ puntos: 5000, rangoMax: 0 }, D, I).rangoMax === 4);
ok('rangoMax dañado', N.normaliza({ puntos: 0, rangoMax: 99 }, D, I).rangoMax === 9 && N.normaliza({ rangoMax: 'x' }, D, I).rangoMax === 0);

// 7. Inglés
const en = N.normaliza({ v: 2, bienvenida: true, puntos: 22000, rangoMax: 8, examenes: {} }, D, I);
ok('empieza en la unidad 1', N.unidadActual(en, I).id === 'u1' && N.unidadesDominadas(en, I) === 0);
let ri = N.registraIngles(en, I, { unidad: 'u1', item: 'u1:hello', ok: true });
ok('acierto de inglés +8', ri.puntos === 8 && N.leeDia(en).ingles === 1 && N.leeDia(en).inglesOk === 1, ri);
ri = N.registraIngles(en, I, { unidad: 'u1', item: 'u1:hello', ok: false });
ok('fallo de inglés −4 y vuelve a la caja 0', ri.puntos === -4 && en.ingles.tarjetas['u1:hello'].caja === 0, ri);
ri = N.registraIngles(en, I, { unidad: 'u1', item: 'u1:f2', ok: false, habla: true, casi: true });
ok('pronunciar casi bien suma poco (+3)', ri.puntos === 3, ri);
ri = N.registraIngles(en, I, { unidad: 'u1', item: 'u1:f2', ok: false, habla: true });
ok('pronunciar mal resta poco (−2)', ri.puntos === -2, ri);
ri = N.registraIngles(en, I, { unidad: 'u1', item: 'u1:f2', ok: true, habla: true });
ok('pronunciar bien +12', ri.puntos === 12, ri);
for (let k = 0; k < 9; k++) N.registraIngles(en, I, { unidad: 'u1', item: 'u1:code', ok: true });
ok('retos de la unidad dominados, falta conversar', N.estadoUnidad(en, I, 'u1').retos && !N.estadoUnidad(en, I, 'u1').dominada);
ok('una conversación a medias no cuenta', N.registraConversacion(en, I, 'u1', { turnos: 4, bien: 2 }).completa === false);
const rc = N.registraConversacion(en, I, 'u1', { turnos: 4, bien: 3 });
ok('conversar domina la unidad: +40 y +100', rc.completa && rc.unidad === 1 && rc.puntos === 140 && N.unidadActual(en, I).id === 'u2', rc);
ok('otra conversación +15', N.registraConversacion(en, I, 'u1', { turnos: 4, bien: 4 }).puntos === 15);
ok('la meta de inglés se apunta', N.leeDia(en).ingles === 14);
en.ingles.tarjetas['u1:hello'].visto = N.diasAtras(1); en.ingles.tarjetas['u1:hello'].vence = hoy;
ok('repaso de inglés pendiente', N.pendientesIngles(en, I).some(x => x.clave === 'u1:hello'), N.pendientesIngles(en, I));
en.ingles.tarjetas['u9:f1'] = { caja: 0, vence: hoy, aciertos: 0, fallos: 1, visto: N.diasAtras(2) };
ok('no repasa unidades que aún no tocan', !N.pendientesIngles(en, I).some(x => x.clave === 'u9:f1'));
const enLimpio = N.normaliza({ ingles: { unidades: { u1: { ultimos: [1, 'x', 0], intentos: '3', conversa: -2 }, u99: {}, __proto__: {} }, tarjetas: { 'u1:hello': { caja: 9 }, 'u1:nada': {}, 'x': 1 } } }, D, I);
ok('normaliza el inglés', enLimpio.ingles.unidades.u1.ultimos.join() === '1,1,0' && enLimpio.ingles.unidades.u1.conversa === 0 && !enLimpio.ingles.unidades.u99 && enLimpio.ingles.tarjetas['u1:hello'].caja === 5 && !enLimpio.ingles.tarjetas['u1:nada'], enLimpio.ingles);
const vueltaEn = N.leeCodigoProgreso(N.codigoProgreso(en), D, I);
ok('el código de progreso lleva el inglés y los rangos', JSON.stringify(vueltaEn.ingles) === JSON.stringify(en.ingles) && vueltaEn.puntos === en.puntos && vueltaEn.rangoMax === en.rangoMax);
const sp = N.siguientePaso(N.normaliza({ v: 2, bienvenida: true, dias: { [hoy]: { retos: 20, aciertos: 18 } } }, D, I), D, {}, I);
ok('tras la meta de retos, toca inglés', sp.id === 'ingles' && sp.accion === 'ingles', sp);
ok('la racha cuenta los días de inglés', N.racha(N.normaliza({ dias: { [ayer]: { ingles: 6 } } }, D, I)) === 1);
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
