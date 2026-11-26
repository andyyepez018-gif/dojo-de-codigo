// Pruebas de «escribir código» (sin navegador): node pruebas/escribir.test.js
globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
const E = require('../escribir.js');
let bien = 0, mal = 0; const ok = (n, c, d) => { if (c) bien++; else { mal++; if (mal < 40) console.log('✗ ' + n + (d !== undefined ? ' → ' + JSON.stringify(d, (k, v) => (k === 'error' && v ? v.message : v)).slice(0, 300) : '')); } };
const LANGS = ['ps', 'py', 'cpp'];
const trampa = (salida, lang) => salida.split('\n').map(l => (lang === 'ps' ? `Escribir "${l}"` : lang === 'py' ? `print("${l}")` : `cout << "${l}" << endl;`)).join('\n');
const revisa = (nombre, x) => {
  for (const l of LANGS) {
    const r = E.corrige(x.sol[l], l, x.pruebas, D);
    ok(`${nombre} · la solución en ${l} pasa`, r.ok, r.resultados.find(y => !y.ok));
    ok(`${nombre} · vacío no pasa (${l})`, !E.corrige('', l, x.pruebas, D).ok);
    const distintas = new Set(x.pruebas.map(p => p.salida)).size > 1;
    if (distintas) ok(`${nombre} · copiar la salida de una prueba no pasa (${l})`, !E.corrige(trampa(x.pruebas[0].salida, l), l, x.pruebas, D).ok);
  }
  ok(`${nombre} · tiene enunciado`, x.enunciado && x.enunciado.length > 15);
};
ok('20 tareas, 2 por tema', E.tareas.length === 20 && D.temas.every(t => E.tareas.filter(x => x.tema === t.id).length === 2));
for (const t of E.tareas) revisa('tarea ' + t.id, t);
ok('un proyecto por rango del 2 al 10', E.proyectos.length === 9 && E.proyectos.every((p, k) => p.k === k + 1 && p.pasos.length === 3));
for (const p of E.proyectos) p.pasos.forEach((x, k) => revisa(`proyecto ${p.id} paso ${k + 1}`, x));
// el paso 1 no basta para el paso 3 (los pasos piden cosas nuevas)
for (const p of E.proyectos) ok(`proyecto ${p.id}: el paso 1 no aprueba el paso 3`, !E.corrige(p.pasos[0].sol.py, 'py', p.pasos[2].pruebas, D).ok);
ok('C++ sin main funciona', E.corrige('int n; cin >> n; cout << n * 2 << endl;', 'cpp', [{ entradas: ['4'], salida: '8' }], D).ok);
ok('C++ con main también', E.corrige('#include <iostream>\nusing namespace std;\nint main() { int n; cin >> n; cout << n * 2 << endl; return 0; }', 'cpp', [{ entradas: ['4'], salida: '8' }], D).ok);
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
