const M = require('../motor.js');
let bien = 0, mal = 0;
function ok(nombre, lang, src, esperado, entradas) {
  const r = M.correr(src, lang, entradas);
  if (r.error) { mal++; console.log(`✗ ${nombre} [${lang}] ERROR línea ${r.error.linea}: ${r.error.message}`); return; }
  if (r.salida !== esperado) { mal++; console.log(`✗ ${nombre} [${lang}]\n   esperaba ${JSON.stringify(esperado)}\n   salió    ${JSON.stringify(r.salida)}`); return; }
  bien++;
}
function falla(nombre, lang, src, linea, trozo, entradas) {
  const r = M.correr(src, lang, entradas);
  if (!r.error) { mal++; console.log(`✗ ${nombre} [${lang}] debía fallar y dio ${JSON.stringify(r.salida)}`); return; }
  if (linea && r.error.linea !== linea) { mal++; console.log(`✗ ${nombre} [${lang}] falló en la línea ${r.error.linea}, esperaba ${linea}: ${r.error.message}`); return; }
  if (trozo && !(r.error.message + ' ' + r.error.pista).includes(trozo)) { mal++; console.log(`✗ ${nombre} [${lang}] mensaje: ${r.error.message}`); return; }
  bien++;
}
/* ── Python ── */
ok('suma', 'py', 'a = 3\nb = 4\nprint(a + b)', '7\n');
ok('div', 'py', 'print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(6 / 2)\nprint(-7 // 2)\nprint(-7 % 3)', '3.5\n3\n1\n3.0\n-4\n2\n');
ok('float', 'py', 'print(0.1 + 0.2)\nprint(2 ** 10)\nprint(2 ** -1)\nprint(1e20)', '0.30000000000000004\n1024\n0.5\n1e+20\n');
ok('if', 'py', 'x = 7\nif x > 5:\n    print("grande")\nelif x > 2:\n    print("medio")\nelse:\n    print("chico")', 'grande\n');
ok('elif', 'py', 'nota = 75\nif nota >= 90:\n    print("A")\nelif nota >= 70:\n    print("B")\nelse:\n    print("C")', 'B\n');
ok('while', 'py', 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Despegue")', '3\n2\n1\nDespegue\n');
ok('for range', 'py', 'for i in range(3):\n    print(i)\nfor i in range(1, 10, 4):\n    print(i, end=" ")\nprint()', '0\n1\n2\n1 5 9 \n');
ok('lista', 'py', 'a = [3, 1, 2]\na.append(5)\nprint(a, len(a), a[-1])\na.sort()\nprint(a)\nprint(sum(a), max(a), min(a))', '[3, 1, 2, 5] 4 5\n[1, 2, 3, 5]\n11 5 1\n');
ok('strings', 'py', 's = "Hola Mundo"\nprint(s.upper(), s.lower(), len(s))\nprint(s[0], s[-1], s[0:4], s[::-1])\nprint(s.split())\nprint("o" in s)', 'HOLA MUNDO hola mundo 10\nH o Hola odnuM aloH\n[\'Hola\', \'Mundo\']\nTrue\n');
ok('fstring', 'py', 'n = "Ana"\nx = 3.14159\nprint(f"Hola {n}, pi vale {x:.2f} y {1+1}")', 'Hola Ana, pi vale 3.14 y 2\n');
ok('def', 'py', 'def doble(x):\n    return x * 2\n\ndef saluda(n="tú"):\n    print("Hola", n)\nprint(doble(4))\nsaluda()\nsaluda("Leo")', '8\nHola tú\nHola Leo\n');
ok('recursión', 'py', 'def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n - 1)\nprint(f(5))', '120\n');
ok('input', 'py', 'n = int(input("Número: "))\nprint(n * 2)', 'Número: 10\n', ['5']);
ok('input texto', 'py', 'n = input()\nprint(n * 2)', '55\n', ['5']);
ok('swap', 'py', 'a, b = 1, 2\na, b = b, a\nprint(a, b)', '2 1\n');
ok('break', 'py', 'for i in range(10):\n    if i == 3:\n        break\n    if i == 1:\n        continue\n    print(i)', '0\n2\n');
ok('global', 'py', 'c = 0\ndef sube():\n    global c\n    c += 1\nsube()\nsube()\nprint(c)', '2\n');
ok('math', 'py', 'import math\nprint(math.sqrt(16), math.pi > 3, math.floor(2.7))', '4.0 True 2\n');
ok('bool', 'py', 'print(3 > 2 and 2 > 1, not True, 1 < 2 < 3)\nprint(True + 1)', 'True False True\n2\n');
ok('round', 'py', 'print(round(2.5), round(3.5), round(2.567, 2))', '2 4 2.57\n');
ok('for str', 'py', 'c = 0\nfor letra in "banana":\n    if letra == "a":\n        c += 1\nprint(c)', '3\n');
ok('listas anidadas', 'py', 'm = [[1, 2], [3, 4]]\nprint(m[1][0])\nm[0][1] = 9\nprint(m)', '3\n[[1, 9], [3, 4]]\n');
ok('str()', 'py', 'print("Total: " + str(5) + " " + str(2.0))', 'Total: 5 2.0\n');
ok('ternario', 'py', 'x = 4\nprint("par" if x % 2 == 0 else "impar")', 'par\n');
ok('una línea', 'py', 'x = 2\nif x > 1: print("sí")', 'sí\n');
ok('comentarios', 'py', '# hola\nx = 1  # uno\n\n\nprint(x)', '1\n');
falla('nameerror', 'py', 'nombre = "Ana"\nprint(nombre2)', 2, 'no existe');
falla('dos puntos', 'py', 'x = 1\nif x > 0\n    print(x)', 2, 'Falta «:»');
falla('igual', 'py', 'x = 1\nif x = 1:\n    print(x)', 2, '==');
falla('sangría', 'py', 'x = 1\nif x > 0:\nprint(x)', 3, 'sangría');
falla('str+int', 'py', 'edad = input()\nprint(edad + 1)', 2, 'sumar', ['5']);
falla('index', 'py', 'a = [1, 2, 3]\nprint(a[3])', 2, 'IndexError');
falla('paréntesis', 'py', 'print("hola"', 1, 'paréntesis');
falla('print2', 'py', 'print "hola"', 1, 'No entiendo');
falla('int()', 'py', 'x = int("abc")', 1, 'ValueError');
falla('bucle infinito', 'py', 'x = 1\nwhile x > 0:\n    x = x + 1', 0, 'pasos');
falla('div0', 'py', 'print(5 / 0)', 1, 'cero');
falla('true minúscula', 'py', 'x = true', 1, 'True');
/* ── PSeInt ── */
ok('hola', 'ps', 'Algoritmo hola\n    Escribir "Hola mundo"\nFinAlgoritmo', 'Hola mundo\n');
ok('variables', 'ps', 'Algoritmo v\n  Definir a, b Como Entero\n  a <- 3\n  b <- 4\n  Escribir "Suma: ", a + b\nFinAlgoritmo', 'Suma: 7\n');
ok('división', 'ps', 'Escribir 7 / 2\nEscribir 7 MOD 2\nEscribir 2 ^ 3\nEscribir 10 / 3\nEscribir TRUNC(7 / 2)', '3.5\n1\n8\n3.3333333333\n3\n');
ok('si', 'ps', 'x <- 7\nSi x > 5 Entonces\n    Escribir "grande"\nSiNo\n    Escribir "chico"\nFinSi', 'grande\n');
ok('si anidado', 'ps', 'nota <- 75\nSi nota >= 90 Entonces\n  Escribir "A"\nSiNo\n  Si nota >= 70 Entonces\n    Escribir "B"\n  SiNo\n    Escribir "C"\n  FinSi\nFinSi', 'B\n');
ok('y/o', 'ps', 'x <- 5\nSi x > 1 Y x < 10 Entonces\n Escribir "dentro"\nFinSi\nSi x = 3 O NO x = 4 Entonces\n Escribir "ok"\nFinSi', 'dentro\nok\n');
ok('mientras', 'ps', 'n <- 3\nMientras n > 0 Hacer\n    Escribir n\n    n <- n - 1\nFinMientras\nEscribir "Despegue"', '3\n2\n1\nDespegue\n');
ok('para', 'ps', 'suma <- 0\nPara i <- 1 Hasta 5 Hacer\n    suma <- suma + i\nFinPara\nEscribir suma\nPara i <- 10 Hasta 1 Con Paso -3 Hacer\n Escribir i Sin Saltar\n Escribir " " Sin Saltar\nFinPara\nEscribir ""', '15\n10 7 4 1 \n');
ok('repetir', 'ps', 'x <- 5\nRepetir\n    Escribir x\n    x <- x + 1\nHasta Que x > 3', '5\n');
ok('leer', 'ps', 'Algoritmo l\n Definir n Como Entero\n Escribir "Número:"\n Leer n\n Escribir n * 2\nFinAlgoritmo', 'Número:\n10\n', ['5']);
ok('leer texto', 'ps', 'Leer nombre\nEscribir "Hola, ", nombre', 'Hola, Ana\n', ['Ana']);
ok('arreglo', 'ps', 'Dimension a[3]\na[1] <- 10\na[2] <- 20\na[3] <- 30\nEscribir a[2]\ns <- 0\nPara i <- 1 Hasta 3 Hacer\n s <- s + a[i]\nFinPara\nEscribir s', '20\n60\n');
ok('matriz', 'ps', 'Dimension m[2,2]\nm[1,1] <- 1\nm[2,2] <- 5\nEscribir m[1,1] + m[2,2]', '6\n');
ok('funcion', 'ps', 'Funcion r <- doble(x)\n    r <- x * 2\nFinFuncion\nAlgoritmo f\n    Escribir doble(4) + 1\nFinAlgoritmo', '9\n');
ok('subproceso ref', 'ps', 'SubProceso sube(x Por Referencia)\n  x <- x + 1\nFinSubProceso\nSubProceso nada(x)\n  x <- x + 1\nFinSubProceso\nAlgoritmo s\n  n <- 5\n  nada(n)\n  Escribir n\n  sube(n)\n  Escribir n\nFinAlgoritmo', '5\n6\n');
ok('segun', 'ps', 'op <- 2\nSegun op Hacer\n    1:\n        Escribir "uno"\n    2, 3:\n        Escribir "dos o tres"\n    De Otro Modo:\n        Escribir "otro"\nFinSegun', 'dos o tres\n');
ok('textos', 'ps', 's <- "Teclado"\nEscribir Longitud(s)\nEscribir Mayusculas(s)\nEscribir Subcadena(s, 2, 4)\nEscribir Concatenar("a", "b")', '7\nTECLADO\necl\nab\n');
ok('lógicos', 'ps', 'x <- 3 > 2\nEscribir x\nEscribir NO x', 'VERDADERO\nFALSO\n');
ok('mayúsculas', 'ps', 'ALGORITMO x\nescribir "a"\nfinalgoritmo', 'a\n');
ok('fin si separado', 'ps', 'x <- 1\nSi x = 1 Entonces\nEscribir "uno"\nFin Si', 'uno\n');
ok('punto y coma', 'ps', 'x <- 1;\nEscribir x;', '1\n');
falla('sin entonces', 'ps', 'x <- 1\nSi x > 0\n  Escribir x\nFinSi', 2, 'Entonces');
falla('sin finsi', 'ps', 'Algoritmo a\nx <- 1\nSi x > 0 Entonces\n  Escribir x\nFinAlgoritmo', 3, 'FinSi');
falla('typo', 'ps', 'Escrbir "hola"', 1, 'Escribir');
falla('sin valor', 'ps', 'Escribir total', 1, 'no tiene valor');
falla('entero', 'ps', 'Definir x Como Entero\nx <- 7 / 2', 2, 'decimales');
falla('base 1', 'ps', 'Dimension a[3]\na[0] <- 1', 2, 'no existe');
falla('leer entero', 'ps', 'Definir n Como Entero\nLeer n', 2, 'entero', ['hola']);
falla('condición numérica', 'ps', 'x <- 1\nSi x Entonces\nEscribir 1\nFinSi', 2, 'verdadera o falsa');
/* ── C++ ── */
const C = c => '#include <iostream>\nusing namespace std;\n\nint main() {\n' + c + '\n    return 0;\n}';
ok('hola', 'cpp', C('    cout << "Hola mundo" << endl;'), 'Hola mundo\n');
ok('enteros', 'cpp', C('    int a = 7, b = 2;\n    cout << a / b << " " << a % b << " " << 7.0 / 2 << endl;\n    double d = 10;\n    cout << d / 4 << " " << d << endl;'), '3 1 3.5\n2.5 10\n');
ok('formato g', 'cpp', C('    cout << 3.14159265 << " " << 1.0/3 << " " << 1234567.0 << " " << 0.0001 << endl;'), '3.14159 0.333333 1.23457e+06 0.0001\n');
ok('if', 'cpp', C('    int x = 7;\n    if (x > 5) {\n        cout << "grande" << endl;\n    } else if (x > 2) {\n        cout << "medio" << endl;\n    } else {\n        cout << "chico" << endl;\n    }'), 'grande\n');
ok('while', 'cpp', C('    int n = 3;\n    while (n > 0) {\n        cout << n << endl;\n        n--;\n    }'), '3\n2\n1\n');
ok('for', 'cpp', C('    int s = 0;\n    for (int i = 1; i <= 5; i++) {\n        s += i;\n    }\n    cout << s << endl;\n    for (int i = 0; i < 3; i++) cout << i;\n    cout << endl;'), '15\n012\n');
ok('do while', 'cpp', C('    int x = 5;\n    do {\n        cout << x << endl;\n        x++;\n    } while (x <= 3);'), '5\n');
ok('cin', 'cpp', C('    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;'), '7\n', ['3 4']);
ok('cin líneas', 'cpp', C('    int a, b;\n    cin >> a;\n    cin >> b;\n    cout << a * b << endl;'), '12\n', ['3', '4']);
ok('string', 'cpp', '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s = "Hola";\n    s = s + " mundo";\n    cout << s << " " << s.length() << " " << s.substr(0, 4) << " " << s[1] << endl;\n    return 0;\n}', 'Hola mundo 10 Hola o\n');
ok('arreglo', 'cpp', C('    int a[] = {3, 1, 4};\n    int s = 0;\n    for (int i = 0; i < 3; i++) s += a[i];\n    cout << s << " " << a[1] << endl;\n    int z[3] = {0};\n    cout << z[2] << endl;'), '8 1\n0\n');
ok('vector', 'cpp', '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    vector<int> v = {5, 2, 8};\n    v.push_back(1);\n    sort(v.begin(), v.end());\n    for (int x : v) cout << x << " ";\n    cout << endl << v.size() << endl;\n    return 0;\n}', '1 2 5 8 \n4\n');
ok('funciones', 'cpp', '#include <iostream>\nusing namespace std;\nint doble(int x) {\n    return x * 2;\n}\nvoid sube(int &x) {\n    x++;\n}\nvoid nada(int x) {\n    x++;\n}\nint main() {\n    int n = 5;\n    nada(n);\n    cout << n << endl;\n    sube(n);\n    cout << n << " " << doble(n) << endl;\n    return 0;\n}', '5\n6 12\n');
ok('switch', 'cpp', C('    int op = 2;\n    switch (op) {\n        case 1: cout << "uno"; break;\n        case 2: cout << "dos";\n        case 3: cout << "tres"; break;\n        default: cout << "otro";\n    }\n    cout << endl;'), 'dostres\n');
ok('bool', 'cpp', C('    bool b = 3 > 2;\n    cout << b << " " << (b && false) << endl;'), '1 0\n');
ok('char', 'cpp', C("    string s = \"abc\";\n    int c = 0;\n    for (char ch : s) {\n        if (ch == 'b') c++;\n    }\n    cout << c << \" \" << s[0] << endl;\n    char d = '7';\n    cout << d - '0' + 1 << endl;"), '1 a\n8\n');
ok('getline', 'cpp', C('    string nombre;\n    getline(cin, nombre);\n    cout << "Hola, " << nombre << endl;'), 'Hola, Ana María\n', ['Ana María']);
ok('fragmento', 'cpp', 'int x = 3;\ncout << x * 2 << endl;', '6\n');
ok('fragmento func', 'cpp', 'int doble(int x) {\n    return x * 2;\n}\ncout << doble(5) + 1 << endl;', '11\n');
ok('math', 'cpp', '#include <cmath>\n' + C('    cout << sqrt(16) << " " << pow(2, 10) << " " << abs(-3) << endl;'), '4 1024 3\n');
ok('cast', 'cpp', C('    int a = 7, b = 2;\n    cout << (double)a / b << " " << static_cast<int>(3.9) << endl;'), '3.5 3\n');
ok('to_string', 'cpp', C('    int n = 5;\n    string s = "n=" + to_string(n);\n    cout << s << endl;'), 'n=5\n');
ok('2d', 'cpp', C('    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    cout << m[1][2] << endl;'), '6\n');
ok('std::', 'cpp', '#include <iostream>\nint main() {\n    std::cout << "x" << std::endl;\n    return 0;\n}', 'x\n');
ok('ternario', 'cpp', C('    int x = 4;\n    cout << (x % 2 == 0 ? "par" : "impar") << endl;'), 'par\n');
falla('punto y coma', 'cpp', C('    int x = 5\n    cout << x << endl;'), 5, '«;»');
falla('no declarada', 'cpp', C('    x = 5;'), 5, 'no está declarada');
falla('sin valor', 'cpp', C('    int x;\n    cout << x << endl;'), 6, 'sin haberle dado');
falla('cout al revés', 'cpp', C('    cout >> "hola";'), 5, '«<<»');
falla('fuera', 'cpp', C('    int a[3] = {1, 2, 3};\n    cout << a[3];'), 6, 'se sale');
falla('if sin paréntesis', 'cpp', C('    int x = 1;\n    if x > 0 {\n    }'), 6, '(');
falla('string+int', 'cpp', C('    string s = "a";\n    s = s + 5;'), 6, 'sumar');
falla('llave', 'cpp', '#include <iostream>\nusing namespace std;\nint main() {\n    cout << 1;\n', 3, '«}»');
falla('cin texto', 'cpp', C('    int n;\n    cin >> n;'), 6, 'entero', ['hola']);
falla('tipo raro', 'cpp', C('    entero x = 5;'), 5, 'tipo');
/* ── Ampliaciones (v1.2) ── */
ok('dict', 'py', 'd = {"ana": 3, "leo": 5}\nd["mia"] = 7\nprint(d)\nprint(d["leo"], len(d), "ana" in d, d.get("x", 0))\nfor k, v in d.items():\n    print(k, v)\ndel d["ana"]\nprint(list(d.keys()), sum(d.values()))', "{'ana': 3, 'leo': 5, 'mia': 7}\n5 3 True 0\nana 3\nleo 5\nmia 7\n['leo', 'mia'] 12\n");
ok('dict contar', 'py', 'c = {}\nfor letra in "banana":\n    c[letra] = c.get(letra, 0) + 1\nprint(c)', "{'b': 1, 'a': 3, 'n': 2}\n");
ok('comprensión', 'py', 'a = [1, 2, 3, 4]\nprint([x * x for x in a if x % 2 == 0])\nprint(" ".join(str(n) for n in a))\nprint(sum(x for x in range(5)))', '[4, 16]\n1 2 3 4\n10\n');
ok('del lista', 'py', 'a = [5, 6, 7]\ndel a[0]\nprint(a)', '[6, 7]\n');
ok('type', 'py', 'print(type(5), type(2.5), type("a"), type([1]), type({}))', "<class 'int'> <class 'float'> <class 'str'> <class 'list'> <class 'dict'>\n");
falla('else if', 'py', 'x = 1\nif x > 3:\n    print(1)\nelse if x > 0:\n    print(2)', 4, 'elif');
falla('keyerror', 'py', 'd = {"a": 1}\nprint(d["b"])', 2, 'KeyError');
falla('lista como clave', 'py', 'd = {}\nd[[1, 2]] = 3', 2, 'TypeError');
ok('setprecision', 'cpp', '#include <iomanip>\n' + C('    double p = 10.0 / 3;\n    cout << fixed << setprecision(2) << p << endl;\n    cout << setw(5) << 42 << "|" << endl;\n    cout << left << setw(5) << "ab" << "|" << endl;'), '3.33\n   42|\nab   |\n');
ok('precisión sin fixed', 'cpp', C('    cout << setprecision(3) << 3.14159 << endl;'), '3.14\n');
falla('fuera del for', 'cpp', C('    for (int i = 0; i < 3; i++) {\n    }\n    cout << i;'), 7, 'bloque');
{ const r = M.correr(C('    int a = 5;\n    if (a = 3) cout << "x";\n    while (a > 9);'), 'cpp');
  if (r.avisos.length === 2 && r.avisos[0].linea === 6 && /==/.test(r.avisos[0].texto) && r.avisos[1].linea === 7) bien++; else { mal++; console.log('✗ avisos C++', JSON.stringify(r.avisos)); } }
{ const r = M.correr('def doble(x):\n    y = x * 2\n    return y\nn = 4\nm = doble(n)\nprint(m)', 'py', [], { traza: true });
  const lineas = r.traza.map(t => t.linea).join(','); const enFuncion = r.traza.find(t => t.pila.length === 1 && t.vars.some(v => v.n === 'y'));
  const ultimo = r.traza[r.traza.length - 1];
  if (lineas === '1,4,5,2,3,6,0' && enFuncion && enFuncion.vars.find(v => v.n === 'y').v === '8' && ultimo.fin && ultimo.salida === 2) bien++; else { mal++; console.log('✗ traza py', lineas, JSON.stringify(r.traza.slice(-2))); } }
{ const r = M.correr('Para i <- 1 Hasta 3 Hacer\n    Escribir i\nFinPara', 'ps', [], { traza: true });
  const l = r.traza.map(t => t.linea).join(','); const v = r.traza.filter(t => t.linea === 2).map(t => t.vars.find(x => x.n === 'i').v).join(',');
  if (l === '1,2,1,2,1,2,0' && v === '1,2,3') bien++; else { mal++; console.log('✗ traza ps', l, v); } }
{ const r = M.correr('int a[3] = {1, 2, 3};\nint s = 0;\nfor (int i = 0; i < 3; i++) s += a[i];\ncout << s;', 'cpp', [], { traza: true });
  const ult = r.traza[r.traza.length - 2]; const a = ult.vars.find(x => x.n === 'a');
  if (a && a.v === '{1, 2, 3}' && a.t === 'int[3]' && r.traza[r.traza.length - 1].fin) bien++; else { mal++; console.log('✗ traza cpp', JSON.stringify(r.traza.slice(-2))); } }
{ const r = M.correr('x = 1\nprint(y)', 'py', [], { traza: true }); const u = r.traza[r.traza.length - 1];
  if (u.error && u.linea === 2) bien++; else { mal++; console.log('✗ traza con error', JSON.stringify(u)); } }
{ const r = M.correr('while True:\n    x = 1', 'py', [], { limite: 10000 }); if (r.error && /10\.000 pasos/.test(r.error.message)) bien++; else { mal++; console.log('✗ límite', r.error && r.error.message); } }
console.log(`\n${bien} bien, ${mal} mal`);
process.exit(mal ? 1 : 0);
