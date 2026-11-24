globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
const C = c => '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n' + c + '\nreturn 0;\n}';
const S = {
  salida: { ps: 'Algoritmo a\nEscribir "¡Hola, mundo!"\nEscribir "Mi primer programa"\nFinAlgoritmo', py: 'print("¡Hola, mundo!")\nprint("Mi primer programa")', cpp: C('cout << "¡Hola, mundo!" << endl;\ncout << "Mi primer programa" << endl;') },
  variables: { ps: 'manzanas <- 12\nperas <- 7\nEscribir "Total: ", manzanas + peras', py: 'manzanas = 12\nperas = 7\nprint("Total:", manzanas + peras)', cpp: C('int manzanas = 12, peras = 7;\ncout << "Total: " << manzanas + peras << endl;') },
  operaciones: { ps: 'minutos <- 135\nEscribir TRUNC(minutos / 60), " h ", minutos MOD 60, " min"', py: 'minutos = 135\nprint(minutos // 60, "h", minutos % 60, "min")', cpp: C('int minutos = 135;\ncout << minutos / 60 << " h " << minutos % 60 << " min" << endl;') },
  leer: { ps: 'Definir edad Como Entero\nEscribir "Edad:"\nLeer edad\nEscribir "En 10 años tendrás ", edad + 10', py: 'edad = int(input("Edad: "))\nprint("En 10 años tendrás", edad + 10)', cpp: C('int edad;\ncout << "Edad: ";\ncin >> edad;\ncout << "En 10 años tendrás " << edad + 10 << endl;') },
  decisiones: { ps: 'Leer n\nSi n MOD 2 = 0 Entonces\nEscribir "par"\nSiNo\nEscribir "impar"\nFinSi', py: 'n = int(input())\nif n % 2 == 0:\n    print("par")\nelse:\n    print("impar")', cpp: C('int n; cin >> n;\nif (n % 2 == 0) cout << "par"; else cout << "impar";') },
  mientras: { ps: 'Leer n\nMientras n >= 1 Hacer\nEscribir n\nn <- n - 1\nFinMientras\nEscribir "Despegue"', py: 'n = int(input())\nwhile n >= 1:\n    print(n)\n    n -= 1\nprint("Despegue")', cpp: C('int n; cin >> n;\nwhile (n >= 1) { cout << n << endl; n--; }\ncout << "Despegue";') },
  para: { ps: 'Leer n\nPara i <- 1 Hasta 10 Hacer\nEscribir n, " x ", i, " = ", n * i\nFinPara', py: 'n = int(input())\nfor i in range(1, 11):\n    print(n, "x", i, "=", n * i)', cpp: C('int n; cin >> n;\nfor (int i = 1; i <= 10; i++) cout << n << " x " << i << " = " << n * i << endl;') },
  arreglos: { ps: 'Dimension a[5]\nPara i <- 1 Hasta 5 Hacer\nLeer a[i]\nFinPara\nm <- a[1]\nPara i <- 2 Hasta 5 Hacer\nSi a[i] > m Entonces\nm <- a[i]\nFinSi\nFinPara\nEscribir m', py: 'a = []\nfor i in range(5):\n    a.append(int(input()))\nprint(max(a))', cpp: C('int a[5];\nfor (int i = 0; i < 5; i++) cin >> a[i];\nint m = a[0];\nfor (int i = 1; i < 5; i++) if (a[i] > m) m = a[i];\ncout << m << endl;') },
  funciones: { ps: 'Funcion m <- mayor(a, b)\nSi a > b Entonces\nm <- a\nSiNo\nm <- b\nFinSi\nFinFuncion\nAlgoritmo x\nLeer p\nLeer q\nEscribir mayor(p, q)\nFinAlgoritmo', py: 'def mayor(a, b):\n    if a > b:\n        return a\n    return b\nx = int(input())\ny = int(input())\nprint(mayor(x, y))', cpp: '#include <iostream>\nusing namespace std;\nint mayor(int a, int b) { return a > b ? a : b; }\nint main() { int x, y; cin >> x >> y; cout << mayor(x, y) << endl; return 0; }' },
  texto: { ps: 'Definir s, r Como Caracter\nLeer s\nr <- ""\nPara i <- Longitud(s) Hasta 1 Con Paso -1 Hacer\nr <- r + Subcadena(s, i, i)\nFinPara\nEscribir r', py: 's = input()\nprint(s[::-1])', cpp: C('string s; cin >> s;\nfor (int i = s.length() - 1; i >= 0; i--) cout << s[i];\ncout << endl;') }
};
const MALAS = { arreglos: { py: 'm = 0\nfor i in range(5):\n    x = int(input())\n    if x > m:\n        m = x\nprint(m)' }, operaciones: { cpp: C('cout << "2 h 15 min";') } };
let bien = 0, mal = 0;
for (const t of D.temas) for (const l of ['ps', 'py', 'cpp']) {
  const res = D.compruebaEjercicio(S[t.id][l], l, t.ejercicio.pruebas);
  if (res.every(x => x.ok)) bien++; else { mal++; console.log('✗', t.id, l, JSON.stringify(res.find(x => !x.ok), (k, v) => k === 'error' && v ? v.message : v)); }
}
// la solución típica mala (máximo empezando en 0) tiene que suspender con los negativos
const m = D.compruebaEjercicio(MALAS.arreglos.py, 'py', D.temas[7].ejercicio.pruebas);
if (m[0].ok && !m[1].ok) bien++; else { mal++; console.log('✗ la solución mala del mayor no se detecta'); }
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
