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
// Ejercicios de matrices como los de clase: las soluciones sacan 5/5 y la corrección detecta los fallos típicos
{ const ejs = G.guias.ps.capitulos.find(c => c.id === 'arreglos').ejercicios;
  ok('4 ejercicios de matrices', ejs && ejs.length === 4, ejs && ejs.length);
  for (const e of ejs) { const r = G.corrigeMatriz(e, e.sol, Motor); ok(`matriz ${e.id}: la solución saca 5/5`, r.ok && r.puntos === 5, r.rubrica.filter(x => !x.ok)); }
  const por = id => ejs.find(e => e.id === id);
  const foto = 'Algoritmo Ejercicio_3\n    Definir matriz como entero\n    Definir i,j Como entero\n    dimension matriz[2,2]\n    Para i <- 1 Hasta 2 Hacer\n        Para j <- 1 Hasta 2 Hacer\n            Escribir " Ingrese un numero : "\n            Leer matriz[i,j]\n            si matriz[i,j] MOD 2 = 0\n                Entonces\n                escribir matriz[i,j]," es par "\n            sino\n                Escribir matriz[i,j]," es impar "\n            FinSi\n        FinPara\n    FinPara\nFinAlgoritmo';
  ok('el programa de la clase (Entonces abajo, minúsculas) saca 5/5', G.corrigeMatriz(por('mat-pares'), foto, Motor).puntos === 5);
  const falla = (n, id, codigo, criterio) => { const r = G.corrigeMatriz(por(id), codigo, Motor); ok(n, !r.ok && r.rubrica.find(x => x.que === criterio && !x.ok), r.rubrica); };
  falla('pares: si dice siempre «par», no funciona', 'mat-pares', foto.replace('MOD 2 = 0', 'MOD 2 = 0 O Verdadero'), 'Resultado y funcionamiento');
  falla('pares: sin MOD no cumple condicionales', 'mat-pares', por('mat-pares').sol.replace('matriz[i,j] MOD 2 = 0', 'TRUNC(matriz[i,j] / 2) * 2 = matriz[i,j]'), 'Uso correcto de condicionales');
  falla('notas: Como Entero no acepta 3.5', 'mat-notas', por('mat-notas').sol.replace('Definir notas Como Real', 'Definir notas Como Entero'), 'Resultado y funcionamiento');
  falla('suma: sin acumular falla', 'mat-sumar', por('mat-sumar').sol.replace('suma <- suma + numeros[i,j]', 'suma <- numeros[i,j]'), 'Resultado y funcionamiento');
  falla('sin Definir no cumple la declaración', 'mat-sumar', por('mat-sumar').sol.replace(/    Definir.*\n/, ''), 'Declaración y dimensionamiento');
  falla('Dimension de otro tamaño no cumple', 'mat-mostrar', por('mat-mostrar').sol.replace('numeros[2,2]', 'numeros[3,3]'), 'Declaración y dimensionamiento');
  ok('«par» no se confunde con «impar»', !G.buscaEnOrden('4 es impar', ['par']) && G.buscaEnOrden('Numero par\nNumero impar', ['par', 'impar']));
  ok('un número no se encuentra dentro de otro', !G.buscaEnOrden('3.15 y 215', ['15']) && G.buscaEnOrden('Total: 15', ['15'])); }
console.log(`Ejemplos ejecutados: ${ejemplos} · palabras explicadas: ${palabras}`);
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
