globalThis.Motor = require('../motor.js');
const D = require('../contenido.js');
const C = c => '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n' + c + '\nreturn 0;\n}';
const CS = C;
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
const S2 = {
  salida: { ps: 'Escribir "***"\nEscribir "***"\nEscribir "***"', py: 'for i in range(3):\n    print("***")', cpp: C('for (int i = 0; i < 3; i++) cout << "***" << endl;') },
  variables: { ps: 'a <- 5\nb <- 9\naux <- a\na <- b\nb <- aux\nEscribir a\nEscribir b', py: 'a = 5\nb = 9\naux = a\na = b\nb = aux\nprint(a)\nprint(b)', cpp: C('int a = 5, b = 9;\nint aux = a;\na = b;\nb = aux;\ncout << a << endl << b << endl;') },
  operaciones: { ps: 'n <- 47\nEscribir n MOD 10\nEscribir TRUNC(n / 10) MOD 10', py: 'n = 47\nprint(n % 10)\nprint(n // 10 % 10)', cpp: C('int n = 47;\ncout << n % 10 << endl << n / 10 % 10 << endl;') },
  leer: { ps: 'Definir precio, cantidad Como Entero\nLeer precio\nLeer cantidad\nEscribir precio * cantidad', py: 'precio = int(input("Precio: "))\ncantidad = int(input("Cantidad: "))\nprint("Total:", precio * cantidad)', cpp: C('int precio, cantidad;\ncin >> precio >> cantidad;\ncout << precio * cantidad << endl;') },
  decisiones: { ps: 'Leer a\nLeer b\nLeer c\nm <- a\nSi b > m Entonces\nm <- b\nFinSi\nSi c > m Entonces\nm <- c\nFinSi\nEscribir m', py: 'a = int(input())\nb = int(input())\nc = int(input())\nif a >= b and a >= c:\n    print(a)\nelif b >= c:\n    print(b)\nelse:\n    print(c)', cpp: C('int a, b, c;\ncin >> a >> b >> c;\nint m = a;\nif (b > m) m = b;\nif (c > m) m = c;\ncout << m << endl;') },
  mientras: { ps: 'suma <- 0\nLeer n\nMientras n <> 0 Hacer\nsuma <- suma + n\nLeer n\nFinMientras\nEscribir suma', py: 'suma = 0\nwhile True:\n    n = int(input())\n    if n == 0:\n        break\n    suma += n\nprint(suma)', cpp: C('int n, suma = 0;\ncin >> n;\nwhile (n != 0) {\n    suma += n;\n    cin >> n;\n}\ncout << suma << endl;') },
  para: { ps: 'Leer n\nsuma <- 0\nPara i <- 2 Hasta n Con Paso 2 Hacer\nsuma <- suma + i\nFinPara\nEscribir suma', py: 'n = int(input())\nprint(sum(range(2, n + 1, 2)))', cpp: C('int n, suma = 0;\ncin >> n;\nfor (int i = 2; i <= n; i += 2) suma += i;\ncout << suma << endl;') },
  arreglos: { ps: 'Dimension a[5]\nPara i <- 1 Hasta 5 Hacer\nLeer a[i]\nFinPara\nPara i <- 5 Hasta 1 Con Paso -1 Hacer\nEscribir a[i]\nFinPara', py: 'a = [int(input()) for i in range(5)]\nfor x in reversed(a):\n    print(x)', cpp: C('int a[5];\nfor (int i = 0; i < 5; i++) cin >> a[i];\nfor (int i = 4; i >= 0; i--) cout << a[i] << endl;') },
  funciones: { ps: 'Funcion r <- es_primo(n)\nr <- n > 1\nPara d <- 2 Hasta n - 1 Hacer\nSi n MOD d = 0 Entonces\nr <- FALSO\nFinSi\nFinPara\nFinFuncion\nAlgoritmo p\nLeer x\nSi es_primo(x) Entonces\nEscribir "primo"\nSiNo\nEscribir "no primo"\nFinSi\nFinAlgoritmo', py: 'def es_primo(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\nx = int(input())\nprint("primo" if es_primo(x) else "no primo")', cpp: '#include <iostream>\nusing namespace std;\nbool es_primo(int n) {\n    if (n < 2) return false;\n    for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;\n    return true;\n}\nint main() {\n    int x; cin >> x;\n    if (es_primo(x)) cout << "primo"; else cout << "no primo";\n    return 0;\n}' },
  texto: { ps: 'Leer s\nc <- 0\nPara i <- 1 Hasta Longitud(s) Hacer\nl <- Subcadena(s, i, i)\nSi l = "a" O l = "e" O l = "i" O l = "o" O l = "u" Entonces\nc <- c + 1\nFinSi\nFinPara\nEscribir c', py: 's = input()\nprint(sum(1 for letra in s if letra in "aeiou"))', cpp: CS('string s; cin >> s;\nint c = 0;\nfor (char l : s) if (l == \'a\' || l == \'e\' || l == \'i\' || l == \'o\' || l == \'u\') c++;\ncout << c << endl;') }
};
let bien = 0, mal = 0;
for (const t of D.temas) for (const l of ['ps', 'py', 'cpp']) {
  const res = D.compruebaEjercicio(S[t.id][l], l, t.ejercicios[0].pruebas);
  if (res.every(x => x.ok)) bien++; else { mal++; console.log('✗', t.id, l, JSON.stringify(res.find(x => !x.ok), (k, v) => k === 'error' && v ? v.message : v)); }
}
for (const t of D.temas) for (const l of ['ps', 'py', 'cpp']) {
  const res = D.compruebaEjercicio(S2[t.id][l], l, t.ejercicios[1].pruebas);
  if (res.every(x => x.ok)) bien++; else { mal++; console.log('✗ ejercicio 2', t.id, l, JSON.stringify(res.find(x => !x.ok), (k, v) => k === 'error' && v ? v.message : v)); }
  // el esqueleto vacío NO puede pasar las pruebas
  const vacio = D.compruebaEjercicio(t.ejercicios[1].inicio[l], l, t.ejercicios[1].pruebas);
  if (!vacio.every(x => x.ok)) bien++; else { mal++; console.log('✗ el esqueleto ya pasa', t.id, l); }
}
// la solución típica mala (máximo empezando en 0) tiene que suspender con los negativos
const m = D.compruebaEjercicio(MALAS.arreglos.py, 'py', D.temas[7].ejercicios[0].pruebas);
if (m[0].ok && !m[1].ok) bien++; else { mal++; console.log('✗ la solución mala del mayor no se detecta'); }
console.log(`${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
