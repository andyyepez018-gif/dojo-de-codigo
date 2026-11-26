// Pruebas de las guías de estudio (sin navegador): node pruebas/estudio.test.js
globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
const G = require('../estudio.js');
const W = require('../escribir.js');
let bien = 0, mal = 0; const ok = (n, c, d) => { if (c) bien++; else { mal++; if (mal < 40) console.log('✗ ' + n + (d !== undefined ? ' → ' + JSON.stringify(d).slice(0, 300) : '')); } };
let ejemplos = 0, palabras = 0;
for (const l of G.LANGS) {
  const g = G.guias[l];
  ok(`${l}: 12 capítulos, intro y chuleta`, g.capitulos.length === 12 && g.intro.length > 50 && g.chuleta.length >= 10);
  const ids = g.capitulos.map(c => c.id);
  ok(`${l}: los mismos capítulos que las otras guías`, JSON.stringify(ids) === JSON.stringify(G.guias.ps.capitulos.map(c => c.id)));
  for (const c of g.capitulos) {
    ok(`${l}/${c.id}: título, objetivo y secciones`, c.titulo && c.objetivo && c.secciones.length >= 2);
    ok(`${l}/${c.id}: errores típicos`, c.errores.length >= 2 || c.id === 'errores');
    if (c.id !== 'errores') ok(`${l}/${c.id}: palabras explicadas`, c.palabras.length >= 2 && c.palabras.every(w => w.palabra && w.que && w.ejemplo));
    if (c.practica) ok(`${l}/${c.id}: tiene práctica de escribir`, W.tareas.some(t => t.tema === c.practica));
    palabras += c.palabras.length;
    for (const s of c.secciones) {
      ok(`${l}/${c.id}: sección «${s.t}» con texto`, s.p.length && s.p.every(x => x.length > 20));
      if (!s.ej) continue;
      ejemplos++;
      const r = Motor.correr(G.prepara(s.ej.codigo, l, D), l, s.ej.entradas);
      ok(`${l}/${c.id}: el ejemplo de «${s.t}» se ejecuta sin errores`, !r.error, r.error && r.error.message);
      ok(`${l}/${c.id}: el ejemplo de «${s.t}» muestra algo`, r.salida && r.salida.trim().length > 0, r.salida);
    }
  }
  ok(`${l}: diccionario ordenado`, G.diccionario(l).length >= 50 && G.diccionario(l).every(w => w.capitulo));
}
console.log(`Ejemplos ejecutados: ${ejemplos} · palabras explicadas: ${palabras}`);
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
