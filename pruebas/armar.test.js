// Pruebas de «Cómo armar un programa» (sin navegador): node pruebas/armar.test.js
globalThis.Motor = require('../motor.js');
const D = require('../contenido.js'), W = require('../escribir.js'), G = require('../estudio.js'), A = require('../armar.js');
let bien = 0, mal = 0; const ok = (n, c, d) => { if (c) bien++; else { mal++; console.log('✗ ' + n + (d !== undefined ? ' → ' + JSON.stringify(d).slice(0, 300) : '')); } };
ok('el método tiene 6 pasos', A.METODO.length === 6 && A.METODO.every(m => m.t && m.p.length > 40));
ok('6 piezas, cada una en los 3 lenguajes', A.PIEZAS.length === 6 && A.PIEZAS.every(p => G.LANGS.every(l => p.codigo[l])));
for (const l of G.LANGS) {
  for (const p of A.PIEZAS) { const r = Motor.correr(G.prepara(p.codigo[l], l, D), l, p.entradas); ok(`pieza ${p.id} en ${l} se ejecuta`, !r.error && r.salida.trim().length > 0, r.error && r.error.message); }
  for (const g of A.GUIADOS) {
    const c = W.corrige(g.sol[l], l, g.pruebas, D); ok(`guiado ${g.id}: la solución en ${l} pasa sus pruebas`, c.ok, c.resultados.map(x => x.error ? x.error.message : x.salida.slice(-60)));
    const r = Motor.correr(G.prepara(A.esqueleto(g, l), l, D), l, []); ok(`guiado ${g.id}: la receta como comentarios se ejecuta en ${l} (sin errores)`, !r.error, r.error && r.error.message);
    const sal = Motor.correr(G.prepara(g.sol[l], l, D), l, g.pruebas[0].entradas).salida;
    ok(`guiado ${g.id}: la respuesta «a mano» es lo que da el programa en ${l}`, A.aManoBien(g, sal.split('\n').filter(x => x.trim()).slice(-10).join(' ')), sal.slice(-80));
  }
}
for (const g of A.GUIADOS) {
  ok(`guiado ${g.id}: completo`, g.enunciado && g.entra.length === 3 && g.sale.length === 3 && g.receta.length >= 3 && g.pruebas.length >= 2 && g.piezas.every(p => A.pieza(p)) && g.receta.every(r => r[2].every(p => A.pieza(p))));
  ok(`guiado ${g.id}: la receta en orden vale`, A.recetaBien(g, g.receta.map((_, k) => k)));
  ok(`guiado ${g.id}: desordenada no vale y siempre igual`, !A.recetaBien(g, A.desordena(g)) && JSON.stringify(A.desordena(g)) === JSON.stringify(A.desordena(g)));
  ok(`guiado ${g.id}: al revés no vale`, !A.recetaBien(g, g.receta.map((_, k) => k).reverse()));
  ok(`guiado ${g.id}: «a mano» acepta el número escrito de cualquier forma`, A.aManoBien(g, 'da ' + String(g.aMano.respuesta).replace('.', ',')) && !A.aManoBien(g, String(g.aMano.respuesta + 1)));
}
const pr = A.porId('promedio');
ok('pasos del mismo grupo en cualquier orden (suma en 0 antes o después de preguntar)', A.recetaBien(pr, [1, 0, 2, 3, 4]) && !A.recetaBien(pr, [0, 2, 1, 3, 4]));
ok('la pieza de cada paso: valen las que lo describen', A.piezaBien(pr, 2, 'pedirN') && A.piezaBien(pr, 2, 'acumulador') && !A.piezaBien(pr, 2, 'mayor') && A.piezaBien(pr, 0, 'suelta'));
ok('el esqueleto lleva la receta en el orden del alumno', /\/\/ 1\. Empezar la suma en 0/.test(A.esqueleto(pr, 'ps', [1, 0, 2, 3, 4])) && /^# 1\. Preguntar/.test(A.esqueleto(pr, 'py')) && /int main\(\)/.test(A.esqueleto(pr, 'cpp')));
console.log(`\n${bien} bien, ${mal} mal`);
process.exit(mal ? 1 : 0);
