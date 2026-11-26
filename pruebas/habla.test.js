// Pruebas de «Habla de programador» (sin navegador): node pruebas/habla.test.js
const H = require('../habla.js');
let bien = 0, mal = 0; const ok = (n, c, d) => { if (c) bien++; else { mal++; if (mal < 30) console.log('✗ ' + n + (d !== undefined ? ' → ' + JSON.stringify(d).slice(0, 240) : '')); } };
const claves = new Set();
for (const b of H.bloques) {
  ok(`${b.id}: 8 términos y 4 situaciones`, b.terminos.length === 8 && b.situaciones.length === 4);
  for (const it of H.items(b)) { ok('clave única ' + it.clave, !claves.has(it.clave)); claves.add(it.clave); ok('ítem por clave ' + it.clave, H.itemPorClave(it.clave).x === it.x); }
  for (const t of b.terminos) {
    ok(`${b.id}:${t.id} completo`, t.es && t.en && t.def && t.ej);
    ok(`${b.id}:${t.id}: el ejemplo usa el término («${t.es}»)`, t.ej.toLowerCase().includes(t.es.toLowerCase()), t.ej);
  }
  for (const s of b.situaciones) ok(`${b.id}:${s.id} completa y sin repetir`, s.situacion && s.profesional && s.en && s.informal && s.malas.length === 2 && new Set([s.profesional, s.informal, ...s.malas]).size === 4);
}
const cuenta = {};
for (const b of H.bloques) for (const tipo of H.TIPOS) for (let s = 1; s <= 40; s++) {
  const e = H.generar({ bloque: b.id, tipo, seed: s * 7919 + b.n }); cuenta[e.tipo] = (cuenta[e.tipo] || 0) + 1;
  ok(`${b.id} ${tipo}: 4 opciones distintas con la correcta`, e.opciones.length === 4 && new Set(e.opciones).size === 4 && e.correcta >= 0 && e.correcta < 4, e);
  if (e.tipo === 'hueco') ok(`${b.id} hueco: rellenar da el ejemplo`, e.conHueco.includes('____') && e.conHueco.replace('____', e.opciones[e.correcta]).toLowerCase() === e.ej.toLowerCase(), e);
  if (e.tipo === 'profesional') ok(`${b.id} profesional: la buena es la profesional`, e.opciones[e.correcta] === e.explica);
}
for (const b of H.bloques) for (const it of H.items(b)) { const e = H.generar({ bloque: b.id, tipo: 'definicion', seed: 5, item: it.clave }); ok('ítem dirigido ' + it.clave, e.item === it.clave, e); }
console.log('Ejercicios por tipo:', JSON.stringify(cuenta));
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
