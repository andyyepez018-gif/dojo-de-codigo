// Pruebas del curso de inglés (sin navegador): node pruebas/ingles.test.js
const I = require('../ingles.js');
let bien = 0, mal = 0; const ok = (n, c, d) => { if (c) bien++; else { mal++; if (mal < 40) console.log('✗ ' + n + (d !== undefined ? ' → ' + JSON.stringify(d).slice(0, 240) : '')); } };
// 1. Contenido completo y coherente
const ids = new Set();
for (const u of I.unidades) {
  ok(`${u.id}: ≥10 palabras, 6 frases, ≥3 turnos, 3 notas`, u.palabras.length >= 10 && u.frases.length === 6 && u.dialogo.length >= 3 && u.gramatica.length === 3);
  for (const it of I.items(u)) { ok('clave única ' + it.clave, !ids.has(it.clave)); ids.add(it.clave); }
  for (const p of u.palabras) ok(`palabra ${u.id}:${p.id} completa`, p.en && p.es && p.pr);
  for (const f of u.frases) {
    ok(`frase ${u.id}:${f.id} termina con signo`, /[.!?]$/.test(f.en), f.en);
    ok(`frase ${u.id}:${f.id} se acepta a sí misma`, I.comparaTexto(f.en, f.en, f.alt).exacto);
    for (const a of f.alt) ok(`alternativa «${a}» aceptada`, I.comparaTexto(a, f.en, f.alt).ok);
    ok(`decir «${f.en}» saca 100 %`, I.puntuaHabla([f.en], f.en).score === 1, I.puntuaHabla([f.en], f.en));
  }
  for (const t of u.dialogo) {
    const r = I.puntuaRespuesta([t.ejemplo], t.respuestas);
    ok(`${u.id}: el ejemplo «${t.ejemplo}» se acepta en la conversación`, r.score >= 0.7, r);
    ok(`${u.id}: una respuesta sin sentido no se acepta («${t.app}»)`, I.puntuaRespuesta(['banana pizza'], t.respuestas).score < 0.5);
  }
}
// 2. Comparadores
ok('contracciones', I.normalizaEn("I'm learning C++") === 'i am learning c plus plus');
ok('sin apóstrofo', I.normalizaEn('my code doesnt work') === 'my code does not work');
ok('números', I.normalizaEn('x equals 5') === 'x equals five');
ok('errata pequeña = casi', I.comparaTexto('I want to lern C++', 'I want to learn C++.').ok);
ok('otra frase = mal', !I.comparaTexto('Open the file', 'Close the parentheses.').ok);
ok('vacío = mal', !I.comparaTexto('', 'Run the program.').ok);
ok('hablar a medias', Math.abs(I.puntuaHabla(['I need to fix this'], 'I need to fix this bug.').score - 5 / 6) < 1e-9);
ok('hablar elige la mejor alternativa', I.puntuaHabla(['click the bottom', 'click the button'], 'Click the button.').score === 1);
ok('palabras marcadas', JSON.stringify(I.puntuaHabla(['click the'], 'Click the button.').palabras.map(p => p.ok)) === '[true,true,false]');
ok('comodín exige algo más', I.puntuaRespuesta(['my name is'], ['my name is *']).score < I.puntuaRespuesta(['my name is Ana'], ['my name is *']).score);
// 3. Miles de ejercicios generados
const cuenta = {};
for (const u of I.unidades) for (const tipo of I.TIPOS) for (let s = 1; s <= 25; s++) for (const voz of [{ sale: true, entra: true }, { sale: false, entra: false }]) {
  const e = I.generar({ unidad: u.id, tipo, seed: s * 7919 + u.n }, voz); cuenta[e.tipo] = (cuenta[e.tipo] || 0) + 1;
  if (!voz.sale) ok('sin audio no hay escucha ni dictado', e.tipo !== 'escucha' && e.tipo !== 'dictado');
  if (!voz.entra) ok('sin micrófono no hay habla', e.tipo !== 'habla');
  if (e.opciones) {
    ok(`${u.id} ${e.tipo}: 4 opciones distintas con la correcta`, e.opciones.length === 4 && new Set(e.opciones).size === 4 && e.correcta >= 0, e);
  }
  if (e.tipo === 'ordenar') {
    const buenas = e.en.replace(/[.!?]$/, '').split(/\s+/);
    ok(`${u.id} ordenar: el orden correcto vale`, I.compruebaOrden(e, buenas), e);
    ok(`${u.id} ordenar: con una ficha que sobra no vale`, !e.sobran || !I.compruebaOrden(e, [...buenas, e.fichas.find(f => !buenas.map(x => x.toLowerCase()).includes(f.toLowerCase()))]), e);
    ok(`${u.id} ordenar: hay ficha para cada palabra`, buenas.every(w => e.fichas.some(f => f.toLowerCase() === w.toLowerCase())), e);
  }
  if (e.tipo === 'hueco') ok(`${u.id} hueco: rellenar con la correcta da la frase`, I.comparaTexto(e.conHueco.replace('____', e.opciones[e.correcta]), e.en, e.alt).exacto, e);
  if (e.tipo === 'traducir' || e.tipo === 'dictado') ok(`${u.id} ${e.tipo}: la frase se acepta`, I.comparaTexto(e.en, e.en, e.alt).ok);
}
// 4. Repaso dirigido: un ítem concreto sale con un tipo que le encaja
for (const u of I.unidades) for (const it of I.items(u)) {
  const e = I.generar({ unidad: u.id, tipo: 'significado', seed: 3, item: it.clave });
  ok('ítem dirigido ' + it.clave, e.item === it.clave, e);
}
console.log('Ejercicios por tipo:', JSON.stringify(cuenta));
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
