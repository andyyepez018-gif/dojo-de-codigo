// Comprueba que TODO el contenido funciona con el motor: ejemplos, ejercicios (con una solución
// de referencia), y miles de retos generados de las cinco clases en los tres lenguajes.
globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
let bien = 0, mal = 0; const fallo = m => { mal++; if (mal < 40) console.log('✗ ' + m); };
// 1. Los ejemplos de cada tema corren sin error
for (const t of D.temas) for (const l of ['ps', 'py', 'cpp']) {
  const ent = { leer: ['16'], decisiones: ['4'] }[t.id] || [];
  const r = Motor.correr(t.ejemplo[l], l, ent);
  if (r.error) fallo(`ejemplo ${t.id} [${l}]: línea ${r.error.linea} ${r.error.message}`); else bien++;
}
// 2. Los esqueletos de los ejercicios se pueden leer (no tienen errores de sintaxis)
for (const t of D.temas) for (const l of ['ps', 'py', 'cpp']) {
  try { Motor.leer(t.ejercicio.inicio[l], l); bien++; } catch (e) { fallo(`inicio ${t.id} [${l}]: ${e.message}`); }
}
// 3. Miles de retos
const cuenta = {};
for (const t of D.plantillas) for (const l of D.langsDe(t)) for (const tipo of D.TIPOS) for (let s = 1; s <= 12; s++) {
  try {
    const r = D.generar({ tpl: t.id, lang: l, tipo, seed: s * 1013 + 7 });
    cuenta[r.tipo] = (cuenta[r.tipo] || 0) + 1;
    if (r.opciones) {
      if (r.correcta < 0) { fallo(`${t.id} ${l} ${tipo}: sin respuesta correcta`); continue; }
      if (new Set(r.opciones).size !== r.opciones.length) { fallo(`${t.id} ${l} ${r.tipo}: opciones repetidas ${JSON.stringify(r.opciones)}`); continue; }
      if (r.opciones.length < 3) { fallo(`${t.id} ${l} ${r.tipo}: solo ${r.opciones.length} opciones`); continue; }
    }
    if (r.tipo === 'ordenar') { const ok = D.compruebaOrden(r, r.codigo.split('\n').filter(x => x.trim())); if (!ok.ok) { fallo(`${t.id} ${l} ordenar: el orden original no vale`); continue; } }
    if (r.tipo === 'traducir') { const o = Motor.correr(r.codigoOrigen, r.origen, r.entradas); if (o.error || D.limpia(o.salida) !== r.salida) { fallo(`${t.id} ${l} traducir: el original (${r.origen}) no da lo mismo: ${o.error ? o.error.message : JSON.stringify(D.limpia(o.salida)) + ' vs ' + JSON.stringify(r.salida)}`); continue; } }
    bien++;
  } catch (e) { fallo(`${t.id} ${l} ${tipo} semilla ${s}: ${e.message}`); }
}
// 4. Los programas completos (para «Probar en el laboratorio») también funcionan
for (const t of D.plantillas) for (const l of D.langsDe(t)) {
  const p = t.gen(D.rng(99)); const frag = t[l](p); const ent = t.entradas ? t.entradas(p).map(String) : [];
  const a = Motor.correr(frag, l, ent), b = Motor.correr(D.completo(frag, l), l, ent);
  if (b.error || a.salida !== b.salida) fallo(`completo ${t.id} [${l}]: ${b.error ? b.error.message : 'otra salida'}\n${D.completo(frag, l)}`); else bien++;
}
console.log('Retos por clase:', JSON.stringify(cuenta));
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
