/* Contenido del Dojo: la ruta (10 temas, un concepto en tres lenguajes), las plantillas de retos
   y la rama de HTML. Las plantillas generan retos nuevos cada vez; el motor calcula la salida real. */
(function (raiz) {
'use strict';
const C = cuerpo => '#include <iostream>\nusing namespace std;\n\nint main() {\n' + cuerpo.split('\n').map(l => l ? '    ' + l : l).join('\n') + '\n    return 0;\n}\n';
const CS = cuerpo => '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n' + cuerpo.split('\n').map(l => l ? '    ' + l : l).join('\n') + '\n    return 0;\n}\n';
const PS = (nombre, cuerpo) => 'Algoritmo ' + nombre + '\n' + cuerpo.split('\n').map(l => l ? '    ' + l : l).join('\n') + '\nFinAlgoritmo\n';

const temas = [
  {
    id: 'salida', titulo: 'Mostrar en pantalla', corto: 'Escribir · print · cout',
    idea: [
      'Un programa es una lista de órdenes que la computadora cumple de arriba abajo, una por una.',
      'La primera orden que hay que saber es mostrar algo en pantalla. Lo que va entre comillas es texto y sale tal cual. Lo que va sin comillas, la computadora lo calcula.',
      'En PSeInt se escribe Escribir, en Python print(...) y en C++ cout << ... . En C++, además, todo va dentro de main y cada orden termina en punto y coma.'
    ],
    ejemplo: {
      ps: PS('Saludo', 'Escribir "Hola, mundo"\nEscribir "2 + 3 = ", 2 + 3'),
      py: 'print("Hola, mundo")\nprint("2 + 3 =", 2 + 3)\n',
      cpp: C('cout << "Hola, mundo" << endl;\ncout << "2 + 3 = " << 2 + 3 << endl;')
    },
    diferencias: [
      'Python pone un espacio entre las cosas que separas con comas. PSeInt y C++ las pegan tal cual, por eso el espacio va dentro de las comillas.',
      'En C++, endl es el salto de línea. Sin él, lo siguiente sale en la misma línea.',
      'Para no bajar de línea: en PSeInt, Escribir ... Sin Saltar; en Python, print(..., end="").'
    ],
    ejercicio: {
      enunciado: 'Haz que el programa muestre exactamente estas dos líneas:\n¡Hola, mundo!\nMi primer programa',
      pruebas: [{ entradas: [], salida: '¡Hola, mundo!\nMi primer programa' }],
      inicio: { ps: PS('PrimerPrograma', '// Escribe aquí las dos órdenes'), py: '# Escribe aquí las dos órdenes\n', cpp: C('// Escribe aquí las dos órdenes') }
    }
  },
  {
    id: 'variables', titulo: 'Variables', corto: 'cajas con nombre',
    idea: [
      'Una variable es una caja con nombre donde guardas un dato para usarlo después. Si guardas algo nuevo, lo de antes se pierde.',
      'En PSeInt se guarda con <- (una flecha que apunta a la caja). En Python y C++ con =. Ese = no significa «igual a», significa «guarda en».',
      'C++ exige decir qué tipo de dato guarda la caja: int para enteros, double para decimales, string para texto y bool para verdadero o falso. Python lo deduce solo. En PSeInt se dice con Definir.'
    ],
    ejemplo: {
      ps: PS('Cajas', 'Definir manzanas Como Entero\nmanzanas <- 5\nmanzanas <- manzanas + 2\nEscribir "Tengo ", manzanas, " manzanas"'),
      py: 'manzanas = 5\nmanzanas = manzanas + 2\nprint("Tengo", manzanas, "manzanas")\n',
      cpp: C('int manzanas = 5;\nmanzanas = manzanas + 2;\ncout << "Tengo " << manzanas << " manzanas" << endl;')
    },
    diferencias: [
      'x = x + 2 no es una ecuación: significa «calcula x + 2 y guárdalo otra vez en x».',
      'Los nombres no llevan espacios ni empiezan con número: total_puntos o edad2 sirven.',
      'Python y C++ distinguen mayúsculas: Edad y edad son dos variables distintas. PSeInt no las distingue.'
    ],
    ejercicio: {
      enunciado: 'Guarda 12 en una variable manzanas y 7 en otra variable peras. Muestra el total así:\nTotal: 19',
      pruebas: [{ entradas: [], salida: 'Total: 19' }],
      inicio: { ps: PS('Frutas', '// Guarda las dos cantidades y muestra el total'), py: '# Guarda las dos cantidades y muestra el total\n', cpp: C('// Guarda las dos cantidades y muestra el total') }
    }
  },
  {
    id: 'operaciones', titulo: 'Operaciones', corto: 'cuentas y la división tramposa',
    idea: [
      '+ - * / funcionan como en la calculadora, y la multiplicación y la división se hacen antes que la suma y la resta. Los paréntesis cambian ese orden.',
      'El resto de una división (lo que sobra) se saca con MOD en PSeInt y con % en Python y C++. 17 MOD 5 da 2. Sirve, por ejemplo, para saber si un número es par: n MOD 2 = 0.',
      'La trampa: en C++, si divides dos enteros el resultado es entero y los decimales se pierden: 7 / 2 da 3. En Python, / siempre da decimales (3.5) y // es la división entera. En PSeInt, / da 3.5.'
    ],
    ejemplo: {
      ps: PS('Cuentas', 'Escribir 2 + 3 * 4\nEscribir (2 + 3) * 4\nEscribir 17 MOD 5\nEscribir 7 / 2'),
      py: 'print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(17 % 5)\nprint(7 / 2)\nprint(7 // 2)\n',
      cpp: C('cout << 2 + 3 * 4 << endl;\ncout << (2 + 3) * 4 << endl;\ncout << 17 % 5 << endl;\ncout << 7 / 2 << endl;\ncout << 7.0 / 2 << endl;')
    },
    diferencias: [
      '7 / 2 da 3.5 en PSeInt y en Python, pero 3 en C++ (porque los dos son enteros).',
      'División entera: TRUNC(7 / 2) en PSeInt, 7 // 2 en Python y 7 / 2 en C++.',
      'Potencia: 2 ^ 3 en PSeInt, 2 ** 3 en Python y pow(2, 3) en C++ (con #include <cmath>).'
    ],
    ejercicio: {
      enunciado: 'La variable minutos vale 135. Muestra cuántas horas y minutos son, así:\n2 h 15 min',
      pruebas: [{ entradas: [], salida: '2 h 15 min' }],
      inicio: { ps: PS('Horas', 'minutos <- 135\n// Calcula las horas y los minutos que sobran'), py: 'minutos = 135\n# Calcula las horas y los minutos que sobran\n', cpp: C('int minutos = 135;\n// Calcula las horas y los minutos que sobran') }
    }
  },
  {
    id: 'leer', titulo: 'Pedir datos', corto: 'Leer · input · cin',
    idea: [
      'Un programa útil pregunta. PSeInt usa Leer variable, Python usa input() y C++ usa cin >> variable.',
      'La trampa de Python: input() siempre devuelve texto. Si quieres un número, conviértelo: int(input()) para enteros y float(input()) para decimales. Si no, "5" * 2 da "55".',
      'En C++ la variable se declara antes con su tipo, y cin convierte lo que escribe el usuario según ese tipo.'
    ],
    ejemplo: {
      ps: PS('Edad', 'Definir edad Como Entero\nEscribir "¿Cuántos años tienes?"\nLeer edad\nEscribir "El año que viene tendrás ", edad + 1'),
      py: 'edad = int(input("¿Cuántos años tienes? "))\nprint("El año que viene tendrás", edad + 1)\n',
      cpp: C('int edad;\ncout << "¿Cuántos años tienes? ";\ncin >> edad;\ncout << "El año que viene tendrás " << edad + 1 << endl;')
    },
    diferencias: [
      'Python: int(input()) para números enteros. Sin el int, es texto.',
      'C++: cin >> a >> b; lee dos datos seguidos, separados por un espacio o por Enter.',
      'C++: cin >> lee una sola palabra. Para una frase con espacios se usa getline(cin, frase).'
    ],
    ejercicio: {
      enunciado: 'Pide una edad y muestra cuántos años tendrá dentro de 10 años, así:\nEn 10 años tendrás 27',
      pruebas: [{ entradas: ['17'], salida: 'En 10 años tendrás 27' }, { entradas: ['30'], salida: 'En 10 años tendrás 40' }],
      inicio: { ps: PS('Futuro', 'Definir edad Como Entero\n// Lee la edad y muestra la frase'), py: '# Pide la edad y muestra la frase\n', cpp: C('int edad;\n// Lee la edad y muestra la frase') }
    }
  },
  {
    id: 'decisiones', titulo: 'Decisiones', corto: 'Si · if',
    idea: [
      'Con Si / if el programa elige: si la condición es verdadera hace una cosa; si no (SiNo / else), hace otra.',
      'Para comparar se usa > < >= <=. «Igual» es = en PSeInt pero == en Python y C++ (un solo = guarda un valor). «Distinto» es <> en PSeInt y != en Python y C++.',
      'Para juntar condiciones: Y / and / && (tienen que cumplirse las dos) y O / or / || (basta con una).'
    ],
    ejemplo: {
      ps: PS('ParImpar', 'Definir n Como Entero\nLeer n\nSi n MOD 2 = 0 Entonces\n    Escribir "par"\nSiNo\n    Escribir "impar"\nFinSi'),
      py: 'n = int(input())\nif n % 2 == 0:\n    print("par")\nelse:\n    print("impar")\n',
      cpp: C('int n;\ncin >> n;\nif (n % 2 == 0) {\n    cout << "par" << endl;\n} else {\n    cout << "impar" << endl;\n}')
    },
    diferencias: [
      'PSeInt cierra con FinSi; C++ usa llaves { }; Python usa los dos puntos y la sangría (4 espacios).',
      'Varias opciones seguidas: elif en Python, else if en C++. En PSeInt se pone otro Si dentro del SiNo.',
      'En C++ la condición va siempre entre paréntesis: if (x > 5).'
    ],
    ejercicio: {
      enunciado: 'Pide un número entero y muestra «par» si es par o «impar» si no lo es.',
      pruebas: [{ entradas: ['4'], salida: 'par' }, { entradas: ['7'], salida: 'impar' }, { entradas: ['0'], salida: 'par' }],
      inicio: { ps: PS('ParImpar', 'Definir n Como Entero\nLeer n\n// Decide si es par o impar'), py: 'n = int(input())\n# Decide si es par o impar\n', cpp: C('int n;\ncin >> n;\n// Decide si es par o impar') }
    }
  },
  {
    id: 'mientras', titulo: 'Repetir mientras', corto: 'Mientras · while',
    idea: [
      'Un bucle repite instrucciones. Mientras / while repite mientras la condición sea verdadera, y la revisa antes de cada vuelta.',
      'Dentro del bucle algo tiene que cambiar para que la condición llegue a ser falsa. Si no, el bucle no termina nunca: es un bucle infinito. El Dojo lo detiene y te avisa.',
      'Repetir ... Hasta Que (PSeInt) y do ... while (C++) dan siempre al menos una vuelta, porque miran la condición al final. Python no tiene esa forma.'
    ],
    ejemplo: {
      ps: PS('Cuenta', 'n <- 3\nMientras n > 0 Hacer\n    Escribir n\n    n <- n - 1\nFinMientras\nEscribir "Despegue"'),
      py: 'n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1\nprint("Despegue")\n',
      cpp: C('int n = 3;\nwhile (n > 0) {\n    cout << n << endl;\n    n = n - 1;\n}\ncout << "Despegue" << endl;')
    },
    diferencias: [
      'PSeInt: Mientras ... Hacer ... FinMientras. Python: while condición: con sangría. C++: while (condición) { ... }.',
      'n = n - 1 se puede abreviar: n -= 1 en Python, n-- o n -= 1 en C++.'
    ],
    ejercicio: {
      enunciado: 'Pide un número n y haz la cuenta atrás desde n hasta 1, un número por línea. Al final muestra «Despegue».',
      pruebas: [{ entradas: ['3'], salida: '3\n2\n1\nDespegue' }, { entradas: ['1'], salida: '1\nDespegue' }],
      inicio: { ps: PS('Despegue', 'Definir n Como Entero\nLeer n\n// Haz la cuenta atrás'), py: 'n = int(input())\n# Haz la cuenta atrás\n', cpp: C('int n;\ncin >> n;\n// Haz la cuenta atrás') }
    }
  },
  {
    id: 'para', titulo: 'Repetir contando', corto: 'Para · for',
    idea: [
      'Cuando sabes cuántas vueltas dar, usas Para / for: una variable cuenta sola desde un número hasta otro.',
      'PSeInt: Para i <- 1 Hasta 5 Hacer cuenta 1, 2, 3, 4, 5 (incluye el 5). Python: for i in range(1, 6), porque range no incluye el final. C++: for (int i = 1; i <= 5; i++).',
      'range(5) en Python cuenta 0, 1, 2, 3, 4: empieza en 0 y da 5 vueltas.'
    ],
    ejemplo: {
      ps: PS('Tabla', 'Para i <- 1 Hasta 5 Hacer\n    Escribir "3 x ", i, " = ", 3 * i\nFinPara'),
      py: 'for i in range(1, 6):\n    print("3 x", i, "=", 3 * i)\n',
      cpp: C('for (int i = 1; i <= 5; i++) {\n    cout << "3 x " << i << " = " << 3 * i << endl;\n}')
    },
    diferencias: [
      'Contar de 2 en 2: Con Paso 2 en PSeInt, range(1, 10, 2) en Python, i += 2 en C++.',
      'Hacia atrás: Para i <- 5 Hasta 1 Con Paso -1 en PSeInt, range(5, 0, -1) en Python, for (int i = 5; i >= 1; i--) en C++.'
    ],
    ejercicio: {
      enunciado: 'Pide un número n y muestra su tabla de multiplicar del 1 al 10 con este formato:\n7 x 1 = 7\n7 x 2 = 14\n...',
      pruebas: [{ entradas: ['7'], salida: Array.from({ length: 10 }, (_, k) => `7 x ${k + 1} = ${7 * (k + 1)}`).join('\n') }, { entradas: ['2'], salida: Array.from({ length: 10 }, (_, k) => `2 x ${k + 1} = ${2 * (k + 1)}`).join('\n') }],
      inicio: { ps: PS('Tabla', 'Definir n Como Entero\nLeer n\n// Muestra la tabla del 1 al 10'), py: 'n = int(input())\n# Muestra la tabla del 1 al 10\n', cpp: C('int n;\ncin >> n;\n// Muestra la tabla del 1 al 10') }
    }
  },
  {
    id: 'arreglos', titulo: 'Arreglos y listas', corto: 'muchos datos, un nombre',
    idea: [
      'Un arreglo (en Python, una lista) guarda muchos datos bajo un solo nombre. Cada dato ocupa una posición numerada.',
      'La gran diferencia: en PSeInt las posiciones empiezan en 1; en Python y C++ empiezan en 0. En la lista 10, 20, 30, el 20 está en la posición 1 de Python y C++, y en la posición 2 de PSeInt.',
      'Para recorrerlo se usa un Para / for que va de la primera posición a la última.'
    ],
    ejemplo: {
      ps: PS('Notas', 'Dimension notas[3]\nnotas[1] <- 7\nnotas[2] <- 9\nnotas[3] <- 5\nsuma <- 0\nPara i <- 1 Hasta 3 Hacer\n    suma <- suma + notas[i]\nFinPara\nEscribir "Suma: ", suma'),
      py: 'notas = [7, 9, 5]\nsuma = 0\nfor n in notas:\n    suma = suma + n\nprint("Suma:", suma)\n',
      cpp: C('int notas[] = {7, 9, 5};\nint suma = 0;\nfor (int i = 0; i < 3; i++) {\n    suma = suma + notas[i];\n}\ncout << "Suma: " << suma << endl;')
    },
    diferencias: [
      'Crear: Dimension a[5] en PSeInt, a = [] o a = [1, 2] en Python, int a[5]; o vector<int> a; en C++.',
      'Añadir al final: a.append(x) en Python, a.push_back(x) en C++ (con vector). En PSeInt el tamaño es fijo.',
      'Cuántos hay: len(a) en Python, a.size() en C++ con vector.'
    ],
    ejercicio: {
      enunciado: 'Pide 5 números, uno por línea, y muestra el mayor. Cuidado con los negativos.',
      pruebas: [{ entradas: ['3', '9', '2', '7', '5'], salida: '9' }, { entradas: ['-1', '-5', '-3', '-2', '-4'], salida: '-1' }],
      inicio: { ps: PS('Mayor', 'Dimension a[5]\n// Lee los 5 números y busca el mayor'), py: '# Lee 5 números en una lista y busca el mayor\n', cpp: C('int a[5];\n// Lee los 5 números y busca el mayor') }
    }
  },
  {
    id: 'funciones', titulo: 'Funciones', corto: 'tus propias órdenes',
    idea: [
      'Una función es un trozo de programa con nombre que puedes usar muchas veces. Recibe datos (parámetros) y puede devolver un resultado.',
      'Python: def nombre(parámetros): y return. C++: el tipo de lo que devuelve, el nombre y cada parámetro con su tipo, como int doble(int x) { return x * 2; }. PSeInt: Funcion resultado <- nombre(x) ... FinFuncion, guardando el resultado en esa variable.',
      'Los parámetros normales son copias: si la función los cambia, la variable de fuera no cambia. Para cambiarla de verdad: Por Referencia en PSeInt y & en C++.'
    ],
    ejemplo: {
      ps: 'Funcion r <- doble(x)\n    r <- x * 2\nFinFuncion\n\n' + PS('Funciones', 'Escribir doble(4)\nEscribir doble(10) + 1'),
      py: 'def doble(x):\n    return x * 2\n\nprint(doble(4))\nprint(doble(10) + 1)\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nint doble(int x) {\n    return x * 2;\n}\n\nint main() {\n    cout << doble(4) << endl;\n    cout << doble(10) + 1 << endl;\n    return 0;\n}\n'
    },
    diferencias: [
      'En C++ la función se escribe antes de main (o se avisa arriba con su prototipo).',
      'Una función que no devuelve nada: SubProceso en PSeInt, void en C++, y en Python simplemente sin return.'
    ],
    ejercicio: {
      enunciado: 'Escribe una función mayor(a, b) que devuelva el mayor de dos números. Después pide dos números y muestra el mayor usando tu función.',
      pruebas: [{ entradas: ['3', '8'], salida: '8' }, { entradas: ['10', '2'], salida: '10' }, { entradas: ['5', '5'], salida: '5' }],
      inicio: {
        ps: '// Escribe aquí tu Funcion m <- mayor(a, b)\n\n' + PS('Mayor', 'Definir x, y Como Entero\nLeer x\nLeer y\n// Muestra el mayor usando tu función'),
        py: '# Escribe aquí tu función def mayor(a, b):\n\n\nx = int(input())\ny = int(input())\n# Muestra el mayor usando tu función\n',
        cpp: '#include <iostream>\nusing namespace std;\n\n// Escribe aquí tu función int mayor(int a, int b)\n\nint main() {\n    int x, y;\n    cin >> x >> y;\n    // Muestra el mayor usando tu función\n    return 0;\n}\n'
      }
    }
  },
  {
    id: 'texto', titulo: 'Trabajar con texto', corto: 'cadenas y letras',
    idea: [
      'Un texto (cadena o string) es una fila de letras. Puedes saber cuántas tiene, sacar un trozo, pasarlo a mayúsculas o recorrerlo letra por letra.',
      'Longitud: Longitud(s) en PSeInt, len(s) en Python y s.length() en C++.',
      'Sacar un trozo: Subcadena(s, 2, 4) en PSeInt (de la letra 2 a la 4, contando desde 1), s[1:4] en Python (desde la posición 1 hasta antes de la 4) y s.substr(1, 3) en C++ (desde la posición 1, tres letras). Las tres dan lo mismo.'
    ],
    ejemplo: {
      ps: PS('Texto', 's <- "Teclado"\nEscribir Longitud(s)\nEscribir Mayusculas(s)\nEscribir Subcadena(s, 2, 4)'),
      py: 's = "Teclado"\nprint(len(s))\nprint(s.upper())\nprint(s[1:4])\n',
      cpp: CS('string s = "Teclado";\ncout << s.length() << endl;\ncout << s.substr(1, 3) << endl;')
    },
    diferencias: [
      'Una letra suelta: Subcadena(s, i, i) en PSeInt, s[i] en Python y C++ (desde 0).',
      'En C++ una letra (char) va con comillas simples: \'a\'. Un texto, con comillas dobles: "a".',
      'Recorrer letra por letra: for letra in s: en Python y for (char letra : s) en C++.'
    ],
    ejercicio: {
      enunciado: 'Pide una palabra y muéstrala al revés. Por ejemplo, «hola» se convierte en «aloh».',
      pruebas: [{ entradas: ['hola'], salida: 'aloh' }, { entradas: ['Python'], salida: 'nohtyP' }],
      inicio: { ps: PS('AlReves', 'Definir s Como Caracter\nLeer s\n// Muestra s al revés'), py: 's = input()\n# Muestra s al revés\n', cpp: CS('string s;\ncin >> s;\n// Muestra s al revés') }
    }
  }
];

/* ───────────── Plantillas de retos ─────────────
   gen(r) → parámetros; ps/py/cpp(p) → código (fragmento: sin Algoritmo ni main);
   dis(p, lang) → salidas equivocadas típicas; explica(p, lang) → por qué sale lo que sale. */
const PAL = ['Hola', 'Mundo', 'Sol', 'Luna', 'Río', 'Mar', 'Bosque', 'Nube', 'Faro', 'Puente', 'Niebla', 'Camino'];
const NOMBRES = ['Ana', 'Leo', 'Luis', 'Mia', 'Eva', 'Sara', 'Hugo', 'Iván'];
const sec = (a, b, s) => { const r = []; if (s > 0) for (let i = a; i <= b; i += s) r.push(i); else for (let i = a; i >= b; i += s) r.push(i); return r.join('\n'); };
const L = { ps: 'PSeInt', py: 'Python', cpp: 'C++' };

const plantillas = [
  // 1 · Mostrar en pantalla
  { id: 'dos-lineas', tema: 'salida',
    gen: r => { const [a, b] = r.distintos(PAL, 2); return { a, b }; },
    ps: p => `Escribir "${p.a}"\nEscribir "${p.b}"`,
    py: p => `print("${p.a}")\nprint("${p.b}")`,
    cpp: p => `cout << "${p.a}" << endl;\ncout << "${p.b}" << endl;`,
    dis: p => [`${p.a} ${p.b}`, `${p.b}\n${p.a}`, `"${p.a}"\n"${p.b}"`, `${p.a}${p.b}`],
    explica: (p, l) => `Cada orden muestra su texto y baja de línea${l === 'cpp' ? ' (eso hace endl)' : ''}, así que salen en dos líneas y en el mismo orden en que están escritas. Las comillas no se muestran.` },
  { id: 'sin-salto', tema: 'salida',
    gen: r => { const [a, b] = r.distintos(PAL, 2); return { a, b }; },
    ps: p => `Escribir "${p.a}" Sin Saltar\nEscribir "${p.b}"`,
    py: p => `print("${p.a}", end="")\nprint("${p.b}")`,
    cpp: p => `cout << "${p.a}";\ncout << "${p.b}" << endl;`,
    dis: p => [`${p.a}\n${p.b}`, `${p.a} ${p.b}`, `${p.b}${p.a}`],
    explica: (p, l) => l === 'ps' ? 'Sin Saltar hace que el siguiente Escribir siga en la misma línea, pegado.' : l === 'py' ? 'end="" cambia el salto de línea del final por nada, así que el siguiente print sigue pegado.' : 'Sin endl no hay salto de línea: el segundo cout sigue pegado al primero.' },
  { id: 'texto-o-cuenta', tema: 'salida',
    gen: r => ({ n: r.int(2, 9), m: r.int(2, 9) }),
    ps: p => `Escribir "${p.n} + ${p.m}"\nEscribir ${p.n} + ${p.m}`,
    py: p => `print("${p.n} + ${p.m}")\nprint(${p.n} + ${p.m})`,
    cpp: p => `cout << "${p.n} + ${p.m}" << endl;\ncout << ${p.n} + ${p.m} << endl;`,
    dis: p => [`${p.n + p.m}\n${p.n + p.m}`, `${p.n} + ${p.m}\n${p.n} + ${p.m}`, `${p.n}${p.m}\n${p.n + p.m}`],
    explica: p => `Entre comillas es texto y sale tal cual: «${p.n} + ${p.m}». Sin comillas, la computadora hace la cuenta y muestra ${p.n + p.m}.` },
  { id: 'comas', tema: 'salida',
    gen: r => ({ n: r.int(2, 12), cosa: r.pick(['gatos', 'libros', 'lápices', 'plantas', 'monedas']) }),
    ps: p => `Escribir "Tengo ", ${p.n}, " ${p.cosa}"`,
    py: p => `print("Tengo", ${p.n}, "${p.cosa}")`,
    cpp: p => `cout << "Tengo " << ${p.n} << " ${p.cosa}" << endl;`,
    dis: p => [`Tengo${p.n}${p.cosa}`, `Tengo , ${p.n} , ${p.cosa}`, `"Tengo" ${p.n} "${p.cosa}"`, `Tengo  ${p.n}  ${p.cosa}`],
    explica: (p, l) => l === 'py' ? 'print pone un espacio entre cada cosa que separas con comas. Las comas no se muestran.' : l === 'ps' ? 'Escribir pega tal cual lo que va entre comas; por eso los espacios están dentro de las comillas.' : 'cout pega cada trozo tal cual; por eso los espacios están dentro de las comillas.' },

  // 2 · Variables
  { id: 'reasignar', tema: 'variables',
    gen: r => { const [a, b] = r.distintos([3, 4, 5, 6, 7, 8, 9, 12, 15, 20], 2); return { a, b }; },
    ps: p => `x <- ${p.a}\nx <- ${p.b}\nEscribir x`,
    py: p => `x = ${p.a}\nx = ${p.b}\nprint(x)`,
    cpp: p => `int x = ${p.a};\nx = ${p.b};\ncout << x << endl;`,
    dis: p => [String(p.a), String(p.a + p.b), 'x', `${p.a}\n${p.b}`],
    explica: p => `Una variable guarda un solo valor: al guardar ${p.b}, el ${p.a} se pierde.` },
  { id: 'cambio', tema: 'variables',
    gen: r => { const [x, y] = r.distintos([1, 2, 3, 4, 5, 6, 7, 8, 9], 2); return { x, y }; },
    ps: p => `a <- ${p.x}\nb <- ${p.y}\na <- b\nb <- a\nEscribir a\nEscribir b`,
    py: p => `a = ${p.x}\nb = ${p.y}\na = b\nb = a\nprint(a)\nprint(b)`,
    cpp: p => `int a = ${p.x};\nint b = ${p.y};\na = b;\nb = a;\ncout << a << endl;\ncout << b << endl;`,
    dis: p => [`${p.y}\n${p.x}`, `${p.x}\n${p.y}`, `${p.x}\n${p.x}`],
    explica: p => `Al hacer a = b, el valor viejo de a (${p.x}) se pierde. Después b = a copia otra vez ${p.y}. Para intercambiar de verdad hace falta una tercera variable de apoyo.` },
  { id: 'acumular', tema: 'variables',
    gen: r => ({ a: r.int(2, 9), b: r.int(2, 9) }),
    ps: p => `x <- ${p.a}\nx <- x + ${p.b}\nx <- x * 2\nEscribir x`,
    py: p => `x = ${p.a}\nx = x + ${p.b}\nx = x * 2\nprint(x)`,
    cpp: p => `int x = ${p.a};\nx = x + ${p.b};\nx = x * 2;\ncout << x << endl;`,
    dis: p => [String(p.a + p.b * 2), String(p.a * 2 + p.b), String(p.a + p.b), String(p.a * 2)],
    explica: p => `Cada línea usa el valor que x tiene en ese momento: empieza en ${p.a}, luego vale ${p.a + p.b} y al final ${(p.a + p.b) * 2}.` },
  { id: 'comillas', tema: 'variables',
    gen: r => ({ n: r.pick(NOMBRES) }),
    ps: p => `nombre <- "${p.n}"\nEscribir "nombre"\nEscribir nombre`,
    py: p => `nombre = "${p.n}"\nprint("nombre")\nprint(nombre)`,
    cpp: p => `string nombre = "${p.n}";\ncout << "nombre" << endl;\ncout << nombre << endl;`,
    dis: p => [`${p.n}\n${p.n}`, 'nombre\nnombre', `${p.n}\nnombre`],
    explica: p => `Con comillas es la palabra «nombre» tal cual. Sin comillas es lo que guarda la variable: ${p.n}.` },

  // 3 · Operaciones
  { id: 'precedencia', tema: 'operaciones',
    gen: r => ({ a: r.int(1, 9), b: r.int(2, 6), c: r.int(2, 6) }),
    ps: p => `Escribir ${p.a} + ${p.b} * ${p.c}`,
    py: p => `print(${p.a} + ${p.b} * ${p.c})`,
    cpp: p => `cout << ${p.a} + ${p.b} * ${p.c} << endl;`,
    dis: p => [String((p.a + p.b) * p.c), String(p.a + p.b + p.c), String(p.a * p.b + p.c)],
    explica: p => `La multiplicación va antes que la suma: primero ${p.b} × ${p.c} = ${p.b * p.c}, y luego ${p.a} + ${p.b * p.c} = ${p.a + p.b * p.c}.` },
  { id: 'parentesis', tema: 'operaciones',
    gen: r => ({ a: r.int(1, 9), b: r.int(2, 6), c: r.int(2, 6) }),
    ps: p => `Escribir (${p.a} + ${p.b}) * ${p.c}`,
    py: p => `print((${p.a} + ${p.b}) * ${p.c})`,
    cpp: p => `cout << (${p.a} + ${p.b}) * ${p.c} << endl;`,
    dis: p => [String(p.a + p.b * p.c), String(p.a * p.b + p.c), String(p.a + p.b + p.c)],
    explica: p => `Lo que está entre paréntesis va primero: ${p.a} + ${p.b} = ${p.a + p.b}, y luego × ${p.c} = ${(p.a + p.b) * p.c}.` },
  { id: 'modulo', tema: 'operaciones',
    gen: r => { let a, b; do { a = r.int(10, 40); b = r.int(3, 7); } while (a % b === 0); return { a, b }; },
    ps: p => `Escribir ${p.a} MOD ${p.b}`,
    py: p => `print(${p.a} % ${p.b})`,
    cpp: p => `cout << ${p.a} % ${p.b} << endl;`,
    dis: p => [String(Math.floor(p.a / p.b)), String(p.b - p.a % p.b), String(p.a % p.b + 1), String(p.b)],
    explica: (p, l) => `${l === 'ps' ? 'MOD' : '%'} da lo que sobra al dividir: ${p.a} = ${p.b} × ${Math.floor(p.a / p.b)} + ${p.a % p.b}, así que sobra ${p.a % p.b}.` },
  { id: 'division', tema: 'operaciones', mismaSalida: false,
    gen: r => { let a, b; do { a = r.int(7, 25); b = r.pick([2, 4]); } while (a % b === 0); return { a, b }; },
    ps: p => `Escribir ${p.a} / ${p.b}`,
    py: p => `print(${p.a} / ${p.b})`,
    cpp: p => `cout << ${p.a} / ${p.b} << endl;`,
    dis: p => [String(Math.trunc(p.a / p.b)), String(p.a / p.b), String(Math.round(p.a / p.b)), String(p.a % p.b), Math.trunc(p.a / p.b) + '.0'],
    explica: (p, l) => l === 'cpp' ? `En C++, entero entre entero da entero: los decimales se pierden y queda ${Math.trunc(p.a / p.b)}. Para tener ${p.a / p.b} habría que escribir ${p.a}.0 / ${p.b}.` : l === 'py' ? `En Python, / siempre da decimales: ${p.a / p.b}. La división entera sería ${p.a} // ${p.b}.` : `En PSeInt, / da el resultado con decimales: ${p.a / p.b}.` },
  { id: 'division-entera', tema: 'operaciones',
    gen: r => { let a, b; do { a = r.int(7, 30); b = r.int(2, 5); } while (a % b === 0); return { a, b }; },
    ps: p => `Escribir TRUNC(${p.a} / ${p.b})`,
    py: p => `print(${p.a} // ${p.b})`,
    cpp: p => `int a = ${p.a};\nint b = ${p.b};\ncout << a / b << endl;`,
    dis: p => [String(+(p.a / p.b).toFixed(4)), String(Math.trunc(p.a / p.b) + 1), String(p.a % p.b)],
    explica: (p, l) => `${l === 'ps' ? 'TRUNC corta los decimales' : l === 'py' ? '// es la división entera: corta los decimales' : 'Entre dos int, / ya es división entera'}: ${p.a} / ${p.b} = ${+(p.a / p.b).toFixed(4)} y se queda en ${Math.trunc(p.a / p.b)}.` },

  // 4 · Pedir datos
  { id: 'leer-doble', tema: 'leer',
    gen: r => ({ n: r.int(3, 15) }), entradas: p => [p.n],
    ps: p => `Leer n\nEscribir n * 2`,
    py: p => `n = int(input())\nprint(n * 2)`,
    cpp: p => `int n;\ncin >> n;\ncout << n * 2 << endl;`,
    dis: p => [String(p.n), String(p.n + 2), String(p.n * p.n), 'n * 2'],
    explica: p => `Lo que escribe el usuario (${p.n}) se guarda en n, y se muestra n × 2 = ${p.n * 2}.` },
  { id: 'input-texto', tema: 'leer', solo: ['py'],
    gen: r => ({ n: r.int(2, 9) }), entradas: p => [p.n],
    py: p => `n = input()\nprint(n * 2)`,
    dis: p => [String(p.n * 2), `${p.n} ${p.n}`, `${p.n}\n${p.n}`],
    explica: p => `input() devuelve TEXTO. Un texto por 2 se repite: "${p.n}" * 2 = "${p.n}${p.n}". Para multiplicar el número hay que convertirlo: int(input()).` },
  { id: 'saludo', tema: 'leer',
    gen: r => ({ n: r.pick(NOMBRES) }), entradas: p => [p.n],
    ps: p => `Leer nombre\nEscribir "Hola, ", nombre`,
    py: p => `nombre = input()\nprint("Hola,", nombre)`,
    cpp: p => `string nombre;\ncin >> nombre;\ncout << "Hola, " << nombre << endl;`,
    dis: p => ['Hola, nombre', `Hola,${p.n}`, p.n, `Hola, "${p.n}"`],
    explica: p => `El nombre que escribe el usuario se guarda en la variable nombre, y se muestra su valor (${p.n}), no la palabra «nombre».` },
  { id: 'suma-dos', tema: 'leer',
    gen: r => ({ a: r.int(2, 20), b: r.int(2, 20) }), entradas: p => [p.a, p.b],
    ps: p => `Leer a\nLeer b\nEscribir a + b`,
    py: p => `a = int(input())\nb = int(input())\nprint(a + b)`,
    cpp: p => `int a, b;\ncin >> a >> b;\ncout << a + b << endl;`,
    dis: p => [`${p.a}${p.b}`, 'a + b', String(p.a * p.b)],
    explica: (p, l) => `Los dos datos se guardan como números y se suman: ${p.a} + ${p.b} = ${p.a + p.b}.${l === 'py' ? ' Sin int(), serían textos y se pegarían: "' + p.a + p.b + '".' : ''}` },

  // 5 · Decisiones
  { id: 'si-sino', tema: 'decisiones',
    gen: r => { const lim = r.int(4, 9); return { lim, x: lim + r.int(-2, 2) }; },
    ps: p => `x <- ${p.x}\nSi x > ${p.lim} Entonces\n    Escribir "grande"\nSiNo\n    Escribir "pequeño"\nFinSi`,
    py: p => `x = ${p.x}\nif x > ${p.lim}:\n    print("grande")\nelse:\n    print("pequeño")`,
    cpp: p => `int x = ${p.x};\nif (x > ${p.lim}) {\n    cout << "grande" << endl;\n} else {\n    cout << "pequeño" << endl;\n}`,
    dis: p => [p.x > p.lim ? 'pequeño' : 'grande', 'grande\npequeño', ''],
    explica: p => p.x > p.lim ? `${p.x} es mayor que ${p.lim}: la condición se cumple y sale «grande».` : p.x === p.lim ? `${p.x} no es MAYOR que ${p.lim} (es igual), así que va por el otro camino. Para incluir el igual haría falta >=.` : `${p.x} no es mayor que ${p.lim}, así que va por el otro camino: «pequeño».` },
  { id: 'y-o', tema: 'decisiones',
    gen: r => { const a = r.int(2, 5), b = a + r.int(3, 6); return { a, b, x: r.int(a - 2, b + 2), o: r.int(0, 1) === 1 }; },
    ps: p => `x <- ${p.x}\nSi x > ${p.a} ${p.o ? 'O' : 'Y'} x < ${p.b} Entonces\n    Escribir "sí"\nSiNo\n    Escribir "no"\nFinSi`,
    py: p => `x = ${p.x}\nif x > ${p.a} ${p.o ? 'or' : 'and'} x < ${p.b}:\n    print("sí")\nelse:\n    print("no")`,
    cpp: p => `int x = ${p.x};\nif (x > ${p.a} ${p.o ? '||' : '&&'} x < ${p.b}) {\n    cout << "sí" << endl;\n} else {\n    cout << "no" << endl;\n}`,
    dis: p => { const r = p.o ? (p.x > p.a || p.x < p.b) : (p.x > p.a && p.x < p.b); return [r ? 'no' : 'sí', 'sí\nno', '']; },
    explica: (p, l) => { const c1 = p.x > p.a, c2 = p.x < p.b; const y = { ps: p.o ? 'O' : 'Y', py: p.o ? 'or' : 'and', cpp: p.o ? '||' : '&&' }[l]; return `${p.x} > ${p.a} es ${c1 ? 'verdad' : 'falso'} y ${p.x} < ${p.b} es ${c2 ? 'verdad' : 'falso'}. Con ${y} ${p.o ? 'basta con que se cumpla una' : 'tienen que cumplirse las dos'}.`; } },
  { id: 'notas', tema: 'decisiones',
    gen: r => ({ nota: r.pick([45, 55, 69, 70, 75, 85, 89, 90, 95]) }),
    ps: p => `nota <- ${p.nota}\nSi nota >= 90 Entonces\n    Escribir "A"\nSiNo\n    Si nota >= 70 Entonces\n        Escribir "B"\n    SiNo\n        Escribir "C"\n    FinSi\nFinSi`,
    py: p => `nota = ${p.nota}\nif nota >= 90:\n    print("A")\nelif nota >= 70:\n    print("B")\nelse:\n    print("C")`,
    cpp: p => `int nota = ${p.nota};\nif (nota >= 90) {\n    cout << "A" << endl;\n} else if (nota >= 70) {\n    cout << "B" << endl;\n} else {\n    cout << "C" << endl;\n}`,
    dis: p => ['A', 'B', 'C', 'A\nB', 'B\nC'],
    explica: p => `Las condiciones se revisan en orden y solo se ejecuta la primera que se cumple. Con ${p.nota}: ${p.nota >= 90 ? '≥ 90, «A»' : p.nota >= 70 ? 'no llega a 90 pero sí a 70, «B»' : 'no llega ni a 70, «C»'}.` },
  { id: 'dos-si', tema: 'decisiones',
    gen: r => ({ x: r.pick([3, 4, 6, 8, 11, 12, 14]) }),
    ps: p => `x <- ${p.x}\nSi x > 5 Entonces\n    Escribir "A"\nFinSi\nSi x > 10 Entonces\n    Escribir "B"\nFinSi`,
    py: p => `x = ${p.x}\nif x > 5:\n    print("A")\nif x > 10:\n    print("B")`,
    cpp: p => `int x = ${p.x};\nif (x > 5) {\n    cout << "A" << endl;\n}\nif (x > 10) {\n    cout << "B" << endl;\n}`,
    dis: () => ['', 'A', 'B', 'A\nB'],
    explica: p => `Son dos decisiones separadas (no hay SiNo / else): se revisan las dos. Con x = ${p.x}: ${p.x > 5 ? 'la primera se cumple' : 'la primera no se cumple'} y ${p.x > 10 ? 'la segunda también' : 'la segunda no'}.` },
  { id: 'par-impar', tema: 'decisiones',
    gen: r => ({ n: r.int(2, 30) }),
    ps: p => `n <- ${p.n}\nSi n MOD 2 = 0 Entonces\n    Escribir "par"\nSiNo\n    Escribir "impar"\nFinSi`,
    py: p => `n = ${p.n}\nif n % 2 == 0:\n    print("par")\nelse:\n    print("impar")`,
    cpp: p => `int n = ${p.n};\nif (n % 2 == 0) {\n    cout << "par" << endl;\n} else {\n    cout << "impar" << endl;\n}`,
    dis: p => [p.n % 2 ? 'par' : 'impar', 'par\nimpar', String(p.n % 2)],
    explica: p => `${p.n} entre 2 sobra ${p.n % 2}. Si sobra 0, es par.` },

  // 6 · Repetir mientras
  { id: 'cuenta-atras', tema: 'mientras',
    gen: r => ({ a: r.int(3, 6), s: r.pick([1, 1, 2]) }),
    ps: p => `n <- ${p.a}\nMientras n > 0 Hacer\n    Escribir n\n    n <- n - ${p.s}\nFinMientras`,
    py: p => `n = ${p.a}\nwhile n > 0:\n    print(n)\n    n = n - ${p.s}`,
    cpp: p => `int n = ${p.a};\nwhile (n > 0) {\n    cout << n << endl;\n    n = n - ${p.s};\n}`,
    dis: p => [sec(p.a, 0, -p.s), sec(p.a - p.s, 1, -p.s), sec(p.a, 1, -1) === sec(p.a, 1, -p.s) ? sec(1, p.a, 1) : sec(p.a, 1, -1), sec(p.a - p.s, 0, -p.s)],
    explica: p => `Muestra n y le resta ${p.s}, mientras n siga siendo mayor que 0. Cuando n deja de ser mayor que 0, la condición es falsa y el bucle para: ${sec(p.a, 1, -p.s).split('\n').join(', ')}.` },
  { id: 'duplicar', tema: 'mientras',
    gen: r => ({ lim: r.int(10, 70) }),
    ps: p => `c <- 0\nx <- 1\nMientras x < ${p.lim} Hacer\n    x <- x * 2\n    c <- c + 1\nFinMientras\nEscribir c`,
    py: p => `c = 0\nx = 1\nwhile x < ${p.lim}:\n    x = x * 2\n    c = c + 1\nprint(c)`,
    cpp: p => `int c = 0;\nint x = 1;\nwhile (x < ${p.lim}) {\n    x = x * 2;\n    c = c + 1;\n}\ncout << c << endl;`,
    dis: p => { let x = 1, c = 0; while (x < p.lim) { x *= 2; c++; } return [String(c - 1), String(c + 1), String(x)]; },
    explica: p => { let x = 1; const v = [1]; while (x < p.lim) { x *= 2; v.push(x); } return `x va valiendo ${v.join(', ')}. c cuenta las vueltas: ${v.length - 1}.`; } },
  { id: 'digitos', tema: 'mientras',
    gen: r => ({ num: r.int(102, 987) }),
    ps: p => `n <- ${p.num}\ns <- 0\nMientras n > 0 Hacer\n    s <- s + n MOD 10\n    n <- TRUNC(n / 10)\nFinMientras\nEscribir s`,
    py: p => `n = ${p.num}\ns = 0\nwhile n > 0:\n    s = s + n % 10\n    n = n // 10\nprint(s)`,
    cpp: p => `int n = ${p.num};\nint s = 0;\nwhile (n > 0) {\n    s = s + n % 10;\n    n = n / 10;\n}\ncout << s << endl;`,
    dis: p => { const d = String(p.num).split('').map(Number); const s = d.reduce((a, b) => a + b, 0); return [String(d.length), String(s - d[0]), String(p.num % 10), String(s + 1)]; },
    explica: (p, l) => { const d = String(p.num).split(''); return `${l === 'ps' ? 'n MOD 10' : 'n % 10'} saca la última cifra y ${l === 'ps' ? 'TRUNC(n / 10)' : l === 'py' ? 'n // 10' : 'n / 10 (división entera entre int)'} la quita. Así se suman las cifras: ${d.join(' + ')} = ${d.reduce((a, b) => a + +b, 0)}.`; } },
  { id: 'repetir-una-vez', tema: 'mientras', solo: ['ps', 'cpp'],
    gen: r => { const b = r.int(2, 5); return { a: b + r.int(2, 4), b }; },
    ps: p => `x <- ${p.a}\nRepetir\n    Escribir x\n    x <- x + 1\nHasta Que x > ${p.b}`,
    cpp: p => `int x = ${p.a};\ndo {\n    cout << x << endl;\n    x++;\n} while (x <= ${p.b});`,
    dis: p => ['', `${p.a}\n${p.a + 1}`, sec(p.b, p.a, 1)],
    explica: (p, l) => `${l === 'ps' ? 'Repetir ... Hasta Que' : 'do ... while'} revisa la condición AL FINAL, así que da una vuelta aunque x (${p.a}) ya sea mayor que ${p.b}. Por eso se muestra ${p.a} una vez.` },
  { id: 'mientras-nunca', tema: 'mientras',
    gen: r => { const b = r.int(2, 6); return { a: b + r.int(1, 4), b }; },
    ps: p => `x <- ${p.a}\nMientras x < ${p.b} Hacer\n    Escribir x\n    x <- x + 1\nFinMientras\nEscribir "fin"`,
    py: p => `x = ${p.a}\nwhile x < ${p.b}:\n    print(x)\n    x = x + 1\nprint("fin")`,
    cpp: p => `int x = ${p.a};\nwhile (x < ${p.b}) {\n    cout << x << endl;\n    x++;\n}\ncout << "fin" << endl;`,
    dis: p => [`${p.a}\nfin`, '', sec(p.b, p.a, 1) + '\nfin'],
    explica: p => `La condición se revisa ANTES de entrar: ${p.a} < ${p.b} ya es falso, así que el bucle no da ni una vuelta y solo se muestra «fin».` },

  // 7 · Repetir contando
  { id: 'suma-1-n', tema: 'para',
    gen: r => ({ n: r.int(3, 7) }),
    ps: p => `suma <- 0\nPara i <- 1 Hasta ${p.n} Hacer\n    suma <- suma + i\nFinPara\nEscribir suma`,
    py: p => `suma = 0\nfor i in range(1, ${p.n + 1}):\n    suma = suma + i\nprint(suma)`,
    cpp: p => `int suma = 0;\nfor (int i = 1; i <= ${p.n}; i++) {\n    suma = suma + i;\n}\ncout << suma << endl;`,
    dis: p => [String((p.n - 1) * p.n / 2), String((p.n + 1) * (p.n + 2) / 2), String(p.n), String(p.n * (p.n + 1) / 2 - 1)],
    explica: (p, l) => `Suma 1 + 2 + … + ${p.n} = ${p.n * (p.n + 1) / 2}.${l === 'py' ? ` Ojo: range(1, ${p.n + 1}) llega hasta ${p.n}, porque range no incluye el final.` : ''}` },
  { id: 'paso', tema: 'para',
    gen: r => ({ a: r.int(1, 3), b: r.int(8, 12), s: r.pick([2, 3]) }),
    ps: p => `Para i <- ${p.a} Hasta ${p.b} Con Paso ${p.s} Hacer\n    Escribir i\nFinPara`,
    py: p => `for i in range(${p.a}, ${p.b + 1}, ${p.s}):\n    print(i)`,
    cpp: p => `for (int i = ${p.a}; i <= ${p.b}; i += ${p.s}) {\n    cout << i << endl;\n}`,
    dis: p => [sec(p.a, p.b - 1, p.s) === sec(p.a, p.b, p.s) ? sec(p.a, p.b + p.s, p.s) : sec(p.a, p.b - 1, p.s), sec(p.a + p.s, p.b, p.s), sec(p.a, Math.min(p.b, p.a + 4), 1)],
    explica: p => `Empieza en ${p.a} y suma ${p.s} cada vuelta mientras no pase de ${p.b}: ${sec(p.a, p.b, p.s).split('\n').join(', ')}.` },
  { id: 'range-cero', tema: 'para',
    gen: r => ({ n: r.int(3, 5) }),
    ps: p => `Para i <- 0 Hasta ${p.n} - 1 Hacer\n    Escribir i\nFinPara`,
    py: p => `for i in range(${p.n}):\n    print(i)`,
    cpp: p => `for (int i = 0; i < ${p.n}; i++) {\n    cout << i << endl;\n}`,
    dis: p => [sec(1, p.n, 1), sec(0, p.n, 1), sec(1, p.n - 1, 1)],
    explica: (p, l) => l === 'py' ? `range(${p.n}) empieza en 0 y se detiene ANTES de ${p.n}: da ${p.n} vueltas, de 0 a ${p.n - 1}.` : l === 'cpp' ? `Empieza en 0 y sigue mientras i < ${p.n}: de 0 a ${p.n - 1}, ${p.n} vueltas. Es la forma típica de recorrer un arreglo de ${p.n} elementos.` : `Va de 0 hasta ${p.n} - 1 = ${p.n - 1}: ${p.n} vueltas.` },
  { id: 'anidados', tema: 'para',
    gen: r => ({ a: r.int(2, 4), b: r.int(2, 5) }),
    ps: p => `c <- 0\nPara i <- 1 Hasta ${p.a} Hacer\n    Para j <- 1 Hasta ${p.b} Hacer\n        c <- c + 1\n    FinPara\nFinPara\nEscribir c`,
    py: p => `c = 0\nfor i in range(${p.a}):\n    for j in range(${p.b}):\n        c = c + 1\nprint(c)`,
    cpp: p => `int c = 0;\nfor (int i = 0; i < ${p.a}; i++) {\n    for (int j = 0; j < ${p.b}; j++) {\n        c++;\n    }\n}\ncout << c << endl;`,
    dis: p => [String(p.a + p.b), String(p.a * p.b + 1), String(p.a), String(p.b)],
    explica: p => `Por cada una de las ${p.a} vueltas de fuera, el de dentro da ${p.b}: ${p.a} × ${p.b} = ${p.a * p.b}.` },
  { id: 'factorial', tema: 'para',
    gen: r => ({ n: r.int(3, 6) }),
    ps: p => `f <- 1\nPara i <- 1 Hasta ${p.n} Hacer\n    f <- f * i\nFinPara\nEscribir f`,
    py: p => `f = 1\nfor i in range(1, ${p.n + 1}):\n    f = f * i\nprint(f)`,
    cpp: p => `int f = 1;\nfor (int i = 1; i <= ${p.n}; i++) {\n    f = f * i;\n}\ncout << f << endl;`,
    dis: p => { let f = 1; for (let i = 1; i <= p.n; i++) f *= i; return [String(f / p.n), String(f * (p.n + 1)), String(p.n * (p.n + 1) / 2)]; },
    explica: p => `Multiplica 1 × 2 × … × ${p.n}. Si f empezara en 0, todo daría 0.` },
  { id: 'hacia-atras', tema: 'para',
    gen: r => ({ n: r.int(3, 5) }),
    ps: p => `Para i <- ${p.n} Hasta 1 Con Paso -1 Hacer\n    Escribir i\nFinPara`,
    py: p => `for i in range(${p.n}, 0, -1):\n    print(i)`,
    cpp: p => `for (int i = ${p.n}; i >= 1; i--) {\n    cout << i << endl;\n}`,
    dis: p => [sec(p.n, 0, -1), sec(1, p.n, 1), sec(p.n - 1, 1, -1)],
    explica: (p, l) => `Cuenta hacia atrás desde ${p.n} hasta 1.${l === 'py' ? ' range(' + p.n + ', 0, -1) se detiene antes del 0.' : ''}` },

  // 8 · Arreglos y listas
  { id: 'indice', tema: 'arreglos',
    gen: r => { const [x, y, z] = r.distintos([10, 20, 30, 40, 50, 60, 70, 80], 3); return { x, y, z }; },
    ps: p => `Dimension a[3]\na[1] <- ${p.x}\na[2] <- ${p.y}\na[3] <- ${p.z}\nEscribir a[2]`,
    py: p => `a = [${p.x}, ${p.y}, ${p.z}]\nprint(a[1])`,
    cpp: p => `int a[] = {${p.x}, ${p.y}, ${p.z}};\ncout << a[1] << endl;`,
    dis: p => [String(p.x), String(p.z), String(p.x + p.y)],
    explica: (p, l) => l === 'ps' ? `En PSeInt las posiciones empiezan en 1: a[2] es el segundo, ${p.y}.` : `En ${L[l]} las posiciones empiezan en 0: a[0] es ${p.x} y a[1] es el segundo, ${p.y}.` },
  { id: 'suma-lista', tema: 'arreglos',
    gen: r => ({ v: [r.int(1, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)] }),
    ps: p => `Dimension a[4]\n${p.v.map((x, k) => `a[${k + 1}] <- ${x}`).join('\n')}\ns <- 0\nPara i <- 1 Hasta 4 Hacer\n    s <- s + a[i]\nFinPara\nEscribir s`,
    py: p => `a = [${p.v.join(', ')}]\ns = 0\nfor x in a:\n    s = s + x\nprint(s)`,
    cpp: p => `int a[] = {${p.v.join(', ')}};\nint s = 0;\nfor (int i = 0; i < 4; i++) {\n    s = s + a[i];\n}\ncout << s << endl;`,
    dis: p => { const s = p.v.reduce((a, b) => a + b, 0); return [String(s - p.v[3]), String(s - p.v[0]), String(Math.max(...p.v)), String(s + 1)]; },
    explica: p => `El bucle pasa por los 4 elementos y los va sumando: ${p.v.join(' + ')} = ${p.v.reduce((a, b) => a + b, 0)}.` },
  { id: 'mayor', tema: 'arreglos',
    gen: r => ({ v: r.distintos([3, 5, 7, 8, 11, 12, 15, 19, 21], 4) }),
    ps: p => `Dimension a[4]\n${p.v.map((x, k) => `a[${k + 1}] <- ${x}`).join('\n')}\nm <- a[1]\nPara i <- 2 Hasta 4 Hacer\n    Si a[i] > m Entonces\n        m <- a[i]\n    FinSi\nFinPara\nEscribir m`,
    py: p => `a = [${p.v.join(', ')}]\nm = a[0]\nfor x in a:\n    if x > m:\n        m = x\nprint(m)`,
    cpp: p => `int a[] = {${p.v.join(', ')}};\nint m = a[0];\nfor (int i = 1; i < 4; i++) {\n    if (a[i] > m) {\n        m = a[i];\n    }\n}\ncout << m << endl;`,
    dis: p => [String(p.v[0]), String(p.v[3]), String(Math.min(...p.v))],
    explica: p => `m empieza con el primero y, cada vez que aparece uno más grande, se queda con él. Al final m es el mayor: ${Math.max(...p.v)}.` },
  { id: 'agregar', tema: 'arreglos', solo: ['py', 'cpp'],
    gen: r => { const [x, y, z] = r.distintos([2, 3, 4, 5, 6, 7, 8, 9], 3); return { x, y, z }; },
    py: p => `a = [${p.x}, ${p.y}]\na.append(${p.z})\nprint(len(a), a[len(a) - 1])`,
    cpp: p => `vector<int> a = {${p.x}, ${p.y}};\na.push_back(${p.z});\ncout << a.size() << " " << a[a.size() - 1] << endl;`,
    dis: p => [`2 ${p.z}`, `3 ${p.y}`, `3 ${p.x}`],
    explica: (p, l) => `${l === 'py' ? 'append' : 'push_back'} añade al final: ahora hay 3 elementos y el último (posición ${'2'}) es ${p.z}.` },
  { id: 'negativo', tema: 'arreglos', solo: ['py'],
    gen: r => ({ v: r.distintos([1, 2, 3, 4, 5, 6, 7, 8, 9], 4) }),
    py: p => `a = [${p.v.join(', ')}]\nprint(a[-1] + a[0])`,
    dis: p => [String(p.v[0] * 2), String(p.v[2] + p.v[0]), String(p.v[3] + p.v[1])],
    explica: p => `En Python, a[-1] es el ÚLTIMO elemento (${p.v[3]}). Más a[0], el primero (${p.v[0]}): ${p.v[3] + p.v[0]}.` },

  // 9 · Funciones
  { id: 'doble', tema: 'funciones',
    gen: r => ({ a: r.int(2, 12) }),
    ps: p => `Funcion r <- doble(x)\n    r <- x * 2\nFinFuncion\nEscribir doble(${p.a}) + 1`,
    py: p => `def doble(x):\n    return x * 2\n\nprint(doble(${p.a}) + 1)`,
    cpp: p => `int doble(int x) {\n    return x * 2;\n}\ncout << doble(${p.a}) + 1 << endl;`,
    dis: p => [String(p.a * 2), String((p.a + 1) * 2), String(p.a + 1)],
    explica: p => `doble(${p.a}) devuelve ${p.a * 2}, y a eso se le suma 1: ${p.a * 2 + 1}.` },
  { id: 'copia', tema: 'funciones',
    gen: r => ({ a: r.int(2, 12) }),
    ps: p => `SubProceso sube(x)\n    x <- x + 1\nFinSubProceso\nn <- ${p.a}\nsube(n)\nEscribir n`,
    py: p => `def sube(x):\n    x = x + 1\n\nn = ${p.a}\nsube(n)\nprint(n)`,
    cpp: p => `void sube(int x) {\n    x = x + 1;\n}\nint n = ${p.a};\nsube(n);\ncout << n << endl;`,
    dis: p => [String(p.a + 1), String(p.a + 2), '0'],
    explica: p => `El parámetro x recibe una COPIA del valor de n. Cambiar la copia no cambia n, que sigue valiendo ${p.a}.` },
  { id: 'referencia', tema: 'funciones', solo: ['ps', 'cpp'],
    gen: r => ({ a: r.int(2, 12) }),
    ps: p => `SubProceso sube(x Por Referencia)\n    x <- x + 1\nFinSubProceso\nn <- ${p.a}\nsube(n)\nEscribir n`,
    cpp: p => `void sube(int &x) {\n    x = x + 1;\n}\nint n = ${p.a};\nsube(n);\ncout << n << endl;`,
    dis: p => [String(p.a), String(p.a + 2), '1'],
    explica: (p, l) => `${l === 'ps' ? 'Por Referencia' : 'Con &'}, x no es una copia: es la misma variable n con otro nombre. Lo que le pasa a x le pasa a n: ${p.a + 1}.` },
  { id: 'mayor-de-dos', tema: 'funciones',
    gen: r => { const [x, y] = r.distintos([2, 3, 5, 7, 9, 11, 13], 2); return { x, y }; },
    ps: p => `Funcion m <- mayor(a, b)\n    Si a > b Entonces\n        m <- a\n    SiNo\n        m <- b\n    FinSi\nFinFuncion\nEscribir mayor(${p.x}, ${p.y}) * 2`,
    py: p => `def mayor(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(mayor(${p.x}, ${p.y}) * 2)`,
    cpp: p => `int mayor(int a, int b) {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\ncout << mayor(${p.x}, ${p.y}) * 2 << endl;`,
    dis: p => [String(Math.min(p.x, p.y) * 2), String(Math.max(p.x, p.y)), String(p.x * 2)],
    explica: p => `mayor(${p.x}, ${p.y}) devuelve ${Math.max(p.x, p.y)}, y luego se multiplica por 2: ${Math.max(p.x, p.y) * 2}.` },
  { id: 'return-corta', tema: 'funciones', solo: ['py', 'cpp'],
    gen: r => ({ n: r.int(1, 7) }),
    py: p => `def f(n):\n    if n > 3:\n        return "grande"\n    return "chico"\n\nprint(f(${p.n}))`,
    cpp: p => `string f(int n) {\n    if (n > 3) {\n        return "grande";\n    }\n    return "chico";\n}\ncout << f(${p.n}) << endl;`,
    dis: p => [p.n > 3 ? 'chico' : 'grande', 'grande\nchico', ''],
    explica: p => `return termina la función en el acto; lo de abajo ya no se ejecuta. Con n = ${p.n}, ${p.n > 3 ? 'n > 3 y sale «grande»' : 'n no es mayor que 3, así que llega al último return: «chico»'}.` },

  // 10 · Texto
  { id: 'longitud', tema: 'texto',
    gen: r => ({ w: r.pick(['Python', 'puente', 'camino', 'teclado', 'código', 'ventana', 'sol']) }),
    ps: p => `s <- "${p.w}"\nEscribir Longitud(s)`,
    py: p => `s = "${p.w}"\nprint(len(s))`,
    cpp: p => `string s = "${p.w}";\ncout << s.length() << endl;`,
    dis: p => [String(p.w.length - 1), String(p.w.length + 1), p.w],
    explica: p => `«${p.w}» tiene ${p.w.length} letras.` },
  { id: 'mayusculas', tema: 'texto', solo: ['ps', 'py'],
    gen: r => ({ w: r.pick(['nube', 'valle', 'gato', 'luna', 'niebla']) }),
    ps: p => `s <- "${p.w}"\nEscribir Mayusculas(s)`,
    py: p => `s = "${p.w}"\nprint(s.upper())`,
    dis: p => [p.w, p.w[0].toUpperCase() + p.w.slice(1), 's'],
    explica: (p, l) => `${l === 'ps' ? 'Mayusculas(s)' : 's.upper()'} devuelve el mismo texto en mayúsculas.` },
  { id: 'concatenar', tema: 'texto',
    gen: r => { const [a, b] = r.distintos(PAL, 2); return { a, b }; },
    ps: p => `a <- "${p.a}"\nb <- "${p.b}"\nEscribir a, " ", b`,
    py: p => `a = "${p.a}"\nb = "${p.b}"\nprint(a + " " + b)`,
    cpp: p => `string a = "${p.a}";\nstring b = "${p.b}";\ncout << a + " " + b << endl;`,
    dis: p => [`${p.a}${p.b}`, 'a b', `${p.b} ${p.a}`],
    explica: (p, l) => l === 'ps' ? 'Escribir pega lo que va entre comas: el texto de a, un espacio y el texto de b.' : 'Con + los textos se pegan: el de a, un espacio y el de b.' },
  { id: 'subcadena', tema: 'texto',
    gen: r => ({ w: r.pick(['programa', 'ventana', 'montaña', 'teclado', 'linterna']), i: r.int(2, 3), k: r.int(2, 3) }),
    ps: p => `s <- "${p.w}"\nEscribir Subcadena(s, ${p.i}, ${p.i + p.k - 1})`,
    py: p => `s = "${p.w}"\nprint(s[${p.i - 1}:${p.i - 1 + p.k}])`,
    cpp: p => `string s = "${p.w}";\ncout << s.substr(${p.i - 1}, ${p.k}) << endl;`,
    dis: p => [p.w.substr(p.i, p.k), p.w.substr(p.i - 1, p.k + 1), p.w.substr(p.i - 2, p.k)],
    explica: (p, l) => l === 'ps' ? `Subcadena(s, ${p.i}, ${p.i + p.k - 1}) va de la letra ${p.i} a la ${p.i + p.k - 1}, contando desde 1.` : l === 'py' ? `s[${p.i - 1}:${p.i - 1 + p.k}] va desde la posición ${p.i - 1} hasta ANTES de la ${p.i - 1 + p.k}, contando desde 0.` : `s.substr(${p.i - 1}, ${p.k}) empieza en la posición ${p.i - 1} (desde 0) y toma ${p.k} letras.` },
  { id: 'contar-letra', tema: 'texto',
    gen: r => ({ w: r.pick(['banana', 'manzana', 'arena', 'casa', 'pantalla', 'palabra', 'mañana']) }),
    ps: p => `s <- "${p.w}"\nc <- 0\nPara i <- 1 Hasta Longitud(s) Hacer\n    Si Subcadena(s, i, i) = "a" Entonces\n        c <- c + 1\n    FinSi\nFinPara\nEscribir c`,
    py: p => `s = "${p.w}"\nc = 0\nfor letra in s:\n    if letra == "a":\n        c = c + 1\nprint(c)`,
    cpp: p => `string s = "${p.w}";\nint c = 0;\nfor (char letra : s) {\n    if (letra == 'a') {\n        c = c + 1;\n    }\n}\ncout << c << endl;`,
    dis: p => { const c = p.w.split('a').length - 1; return [String(c - 1), String(c + 1), String(p.w.length)]; },
    explica: p => `Recorre «${p.w}» letra por letra y cuenta las «a»: hay ${p.w.split('a').length - 1}.` }
];

/* ───────────── HTML: la rama corta ───────────── */
const html = [
  { id: 'html-1', titulo: 'Tu primera página',
    idea: ['HTML no es un lenguaje de programación: es la forma de decirle al navegador qué es cada cosa de una página. Cada cosa va entre una etiqueta que abre y otra que cierra: <h1>Título</h1>, <p>Párrafo</p>.', 'h1 es el título principal; p es un párrafo. Lo que escribas aquí se ve al momento a la derecha (o abajo en el móvil).'],
    tarea: 'Pon tu nombre en el título (h1) y añade un segundo párrafo (p) que diga qué estás aprendiendo.',
    inicio: '<h1>Escribe aquí tu nombre</h1>\n<p>Escribe aquí una frase sobre ti.</p>\n',
    comprobar: d => { const h = d.querySelector('h1'); const ps = d.querySelectorAll('p'); return [
      { ok: !!h && h.textContent.trim() !== '' && !/Escribe aquí/.test(h.textContent), texto: 'Hay un título h1 con tu nombre' },
      { ok: ps.length >= 2, texto: 'Hay al menos dos párrafos p' }]; } },
  { id: 'html-2', titulo: 'Listas y negrita',
    idea: ['Una lista con viñetas es <ul> y cada elemento va en <li>. Para resaltar se usa <strong> (negrita) o <em> (cursiva).', 'Las etiquetas se pueden meter unas dentro de otras, como cajas: <li><strong>Python</strong></li>.'],
    tarea: 'Haz una lista (ul) con al menos 3 lenguajes que vas a aprender, y pon uno de ellos en negrita con <strong>.',
    inicio: '<h2>Lo que voy a aprender</h2>\n<ul>\n  <li>PSeInt</li>\n</ul>\n',
    comprobar: d => [
      { ok: d.querySelectorAll('ul li').length >= 3, texto: 'La lista tiene al menos 3 elementos li' },
      { ok: !!d.querySelector('li strong, strong li'), texto: 'Uno de ellos está en negrita con strong' }] },
  { id: 'html-3', titulo: 'Enlaces y estilo',
    idea: ['Un enlace es <a href="https://…">texto</a>: href dice adónde lleva.', 'El aspecto se cambia con CSS dentro de <style>. Por ejemplo, h1 { color: steelblue; } pinta todos los h1.'],
    tarea: 'Añade un enlace a https://www.python.org y dale un color al título con <style>.',
    inicio: '<style>\n  /* escribe aquí: h1 { color: ...; } */\n</style>\n<h1>Mis enlaces</h1>\n<p>Aquí va el enlace:</p>\n',
    comprobar: (d, src) => [
      { ok: !!d.querySelector('a[href^="https://"]'), texto: 'Hay un enlace a con href que empieza por https://' },
      { ok: /h1\s*\{[^}]*color\s*:/i.test(src), texto: 'En <style> hay una regla h1 con color' }] }
];

/* ───────────── Generador de retos ───────────── */
function rng(semilla) {
  let a = semilla >>> 0;
  const f = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = {
    f, int: (x, y) => x + Math.floor(f() * (y - x + 1)), pick: arr => arr[Math.floor(f() * arr.length)],
    shuffle: arr => { const c = arr.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
  };
  r.distintos = (arr, k) => r.shuffle(arr).slice(0, k);
  return r;
}
const limpia = s => String(s).split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
const porId = {}; plantillas.forEach(t => { porId[t.id] = t; });
const langsDe = t => t.solo || ['ps', 'py', 'cpp'];
const TIPOS = ['salida', 'hueco', 'ordenar', 'error', 'traducir'];
const NOMBRE_TIPO = { salida: '¿Qué muestra?', hueco: 'Completa el hueco', ordenar: 'Ordena las líneas', error: 'Encuentra el error', traducir: 'Traduce' };

function ejecuta(codigo, lang, entradas) {
  const r = raiz.Motor.correr(codigo, lang, entradas);
  return { salida: limpia(r.salida), error: r.error };
}
function mascaraTexto(ln) {
  const m = []; let q = null;
  for (let i = 0; i < ln.length; i++) { const c = ln[i]; if (q) { m[i] = true; if (c === q) q = null; } else if (c === '"' || c === "'") { q = c; m[i] = true; } else m[i] = false; }
  return m;
}
const quitaComilla = l => { const k = l.lastIndexOf('"'); return l.slice(0, k) + l.slice(k + 1); };
const MUTADORES = {
  py: [
    { aplica: l => /:\s*$/.test(l), muta: l => l.replace(/:\s*$/, ''), explica: 'Falta «:» al final de esa línea. En Python, if, elif, else, for, while y def terminan con dos puntos.' },
    { aplica: l => /^\s*(if|elif|while) .* == /.test(l), muta: l => l.replace(' == ', ' = '), explica: 'Para comparar se usan dos iguales, «==». Un solo «=» guarda un valor.' },
    { aplica: l => /\bprint\(/.test(l), muta: l => l.replace('print(', 'Print('), explica: 'print va en minúsculas: Python distingue mayúsculas y Print no existe.' },
    { aplica: l => /\(/.test(l) && /\)\s*$/.test(l) && !/:\s*$/.test(l), muta: l => l.replace(/\)\s*$/, ''), explica: 'Falta cerrar el paréntesis al final de la línea.' },
    { aplica: l => /"[^"]*"/.test(l), muta: quitaComilla, explica: 'Falta cerrar las comillas del texto.' },
    { sangria: true, explica: 'Lo que va dentro de un if, for, while o def necesita sangría: 4 espacios al inicio de la línea.' }
  ],
  ps: [
    { aplica: l => /\sEntonces\s*$/.test(l), muta: l => l.replace(/\s+Entonces\s*$/, ''), explica: 'Falta «Entonces» al final de la línea del Si.' },
    { aplica: l => /\sHacer\s*$/.test(l), muta: l => l.replace(/\s+Hacer\s*$/, ''), explica: 'Falta «Hacer» al final de la línea del Mientras o del Para.' },
    { aplica: l => /\bEscribir\b/.test(l), muta: l => l.replace('Escribir', 'Escrbir'), explica: 'La instrucción se escribe «Escribir».' },
    { aplica: l => / <- /.test(l) && !/^\s*Para\b/.test(l), muta: l => l.replace(' <- ', ' -> '), explica: 'Para guardar un valor se usa «<-»: la flecha apunta a la variable.' },
    { aplica: l => /"[^"]*"/.test(l), muta: quitaComilla, explica: 'Falta cerrar las comillas del texto.' }
  ],
  cpp: [
    { aplica: l => /;\s*$/.test(l) && !/^\s*for\b/.test(l), muta: l => l.replace(/;\s*$/, ''), explica: 'Falta «;» al final de la línea. En C++ casi todas las instrucciones terminan en punto y coma.' },
    { aplica: l => /\bcout <</.test(l), muta: l => l.replace('cout <<', 'cout >>'), explica: 'Con cout se usa «<<»: las flechas apuntan hacia cout. «>>» es para cin.' },
    { aplica: l => /^\s*(if|while) \(.*\) \{\s*$/.test(l), muta: l => l.replace(/(if|while) \((.*)\) \{/, '$1 $2 {'), explica: 'En C++ la condición del if o del while va entre paréntesis.' },
    { aplica: l => /\bcout\b/.test(l), muta: l => l.replace('cout', 'Cout'), explica: 'cout va en minúsculas: C++ distingue mayúsculas.' },
    { aplica: l => /"[^"]*"/.test(l), muta: quitaComilla, explica: 'Falta cerrar las comillas del texto.' }
  ]
};
function mutaciones(codigo, lang) {
  const ls = codigo.split('\n'); const res = [];
  MUTADORES[lang].forEach(mu => ls.forEach((l, i) => {
    if (mu.sangria) { if (i > 0 && /:\s*$/.test(ls[i - 1]) && /^\s+\S/.test(l)) res.push({ i, nueva: l.trimStart(), explica: mu.explica }); return; }
    if (mu.aplica(l)) res.push({ i, nueva: mu.muta(l), explica: mu.explica });
  }));
  return res;
}
function distractoresSalida(t, p, lang, salida, r) {
  let ds = (t.dis ? t.dis(p, lang) : []).map(limpia);
  const m = /-?\d+/.exec(salida);
  if (m) { const n = +m[0]; [n + 1, n - 1, n + 2, n * 2].forEach(x => ds.push(salida.replace(m[0], String(x)))); }
  ds = [...new Set(ds)].filter(d => d !== salida);
  const fijos = ds.slice(0, 2), resto = r.shuffle(ds.slice(2));
  return [...fijos, ...resto].slice(0, 3);
}

function generar(spec) {
  const t = porId[spec.tpl]; if (!t) return null;
  const lang = spec.lang; const r = rng(spec.seed); const p = t.gen(r);
  const codigo = t[lang](p); const entradas = t.entradas ? t.entradas(p).map(String) : [];
  const base = ejecuta(codigo, lang, entradas);
  if (base.error) throw new Error(`La plantilla ${t.id} (${lang}) falla: ${base.error.message}`);
  const reto = { spec: { ...spec }, tema: t.tema, lang, codigo, entradas, salida: base.salida, explica: t.explica(p, lang), tipo: spec.tipo };
  const conTipo = tipo => { reto.tipo = tipo; reto.spec.tipo = tipo; };
  if (spec.tipo === 'hueco') { const h = hueco(reto, r); if (h) return Object.assign(reto, h); conTipo('salida'); }
  if (spec.tipo === 'ordenar') { const o = ordenar(reto, r); if (o) return Object.assign(reto, o); conTipo('salida'); }
  if (spec.tipo === 'error') { const e = error(reto, r); if (e) return Object.assign(reto, e); conTipo('salida'); }
  if (spec.tipo === 'traducir') { const x = traducir(reto, t, p, spec, r); if (x) return Object.assign(reto, x); conTipo('salida'); }
  const opc = r.shuffle([reto.salida, ...distractoresSalida(t, p, lang, reto.salida, r)]);
  return Object.assign(reto, { opciones: opc, correcta: opc.indexOf(reto.salida) });
}
function hueco(reto, r) {
  const ls = reto.codigo.split('\n'); const cands = [];
  ls.forEach((ln, i) => {
    const mk = mascaraTexto(ln); let m;
    const reOp = / (<=|>=|<|>|\+|-|\*) /g;
    while ((m = reOp.exec(ln))) { const pos = m.index + 1; if (!mk[pos]) cands.push({ i, pos, tok: m[1], fam: /[<>]/.test(m[1]) ? ['<', '<=', '>', '>='] : ['+', '-', '*'] }); }
    const reN = /\d+/g;
    while ((m = reN.exec(ln))) {
      if (mk[m.index] || /[\w.]/.test(ln[m.index - 1] || '') || /[\w.]/.test(ln[m.index + m[0].length] || '')) continue;
      const v = +m[0]; cands.push({ i, pos: m.index, tok: m[0], fam: [v + 1, v - 1, v + 2, v * 2].filter(x => x >= 0).map(String) });
    }
  });
  for (const c of r.shuffle(cands)) {
    const ln = ls[c.i];
    const prueba = op => { const nl = ln.slice(0, c.pos) + op + ln.slice(c.pos + c.tok.length); const cod = ls.map((l, k) => k === c.i ? nl : l).join('\n'); return ejecuta(cod, reto.lang, reto.entradas); };
    const otros = [];
    for (const op of [...new Set(c.fam)]) { if (op === c.tok) continue; const res = prueba(op); if (!res.error && res.salida === reto.salida) { otros.length = 0; otros.push(null); break; } otros.push({ op, res }); }
    if (otros[0] === null || otros.length < 2) continue;
    const elegidos = r.shuffle(otros).slice(0, 3);
    const opciones = r.shuffle([{ op: c.tok, res: { salida: reto.salida, error: null } }, ...elegidos]);
    return {
      hueco: { i: c.i, pos: c.pos, len: c.tok.length },
      opciones: opciones.map(o => o.op), correcta: opciones.findIndex(o => o.op === c.tok),
      consecuencias: opciones.map(o => o.res.error ? { error: o.res.error.message } : { salida: o.res.salida })
    };
  }
  return null;
}
function ordenar(reto, r) {
  const ls = reto.codigo.split('\n').filter(l => l.trim() !== '');
  if (ls.length < 3 || ls.length > 9) return null;
  let orden = r.shuffle(ls.map((_, k) => k));
  for (let k = 0; k < 5 && orden.every((v, j) => ls[v] === ls[j]); k++) orden = r.shuffle(orden);
  return { piezas: orden.map(k => ls[k]) };
}
function compruebaOrden(reto, textos) {
  const res = ejecuta(textos.join('\n'), reto.lang, reto.entradas);
  return { ok: !res.error && res.salida === reto.salida, salida: res.salida, error: res.error };
}
function error(reto, r) {
  for (const mu of r.shuffle(mutaciones(reto.codigo, reto.lang))) {
    const ls = reto.codigo.split('\n'); ls[mu.i] = mu.nueva; const cod = ls.join('\n');
    const res = ejecuta(cod, reto.lang, reto.entradas);
    if (res.error) return { codigoMal: cod, lineaMal: mu.i, explicaError: mu.explica, mensajeMotor: res.error.message, pistaMotor: res.error.pista };
  }
  return null;
}
function traducir(reto, t, p, spec, r) {
  if (t.mismaSalida === false) return null;
  const ls = langsDe(t); const destino = reto.lang;
  const origen = destino === 'ps' ? (ls.includes('py') ? 'py' : 'cpp') : (ls.includes('ps') ? 'ps' : ls.find(x => x !== destino));
  if (!origen || origen === destino || !ls.includes(origen)) return null;
  const correcto = t[destino](p); const otros = [];
  for (let k = 1; k <= 14 && otros.length < 2; k++) {
    const p2 = t.gen(rng(spec.seed + k * 7919)); const c2 = t[destino](p2);
    if (c2 === correcto || otros.some(o => o.codigo === c2)) continue;
    const res = ejecuta(c2, destino, t.entradas ? t.entradas(p2).map(String) : []);
    if (!res.error && res.salida !== reto.salida) otros.push({ codigo: c2, motivo: 'Hace lo mismo pero con otros valores: mostraría\n' + (res.salida || '(nada)') });
  }
  const mus = r.shuffle(mutaciones(correcto, destino));
  for (const mu of mus) { const l2 = correcto.split('\n'); l2[mu.i] = mu.nueva; const c3 = l2.join('\n'); if (ejecuta(c3, destino, reto.entradas).error) { otros.push({ codigo: c3, motivo: 'Tiene un error: ' + mu.explica }); break; } }
  if (otros.length < 2) return null;
  const opciones = r.shuffle([{ codigo: correcto, motivo: '' }, ...otros.slice(0, 3)]);
  return { origen, codigoOrigen: t[origen](p), opciones: opciones.map(o => o.codigo), motivos: opciones.map(o => o.motivo), correcta: opciones.findIndex(o => o.codigo === correcto) };
}
function completo(codigo, lang) {
  if (lang === 'py') return codigo + '\n';
  const ls = codigo.split('\n'); const fuera = [], dentro = [];
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    const abre = lang === 'cpp' ? /^(int|void|string|double|bool)\s+\w+\(.*\)\s*\{\s*$/.test(l) : /^(Funcion|SubProceso)\b/.test(l);
    if (abre) { const cierra = lang === 'cpp' ? (x => x === '}') : (x => /^Fin(Funcion|SubProceso)\b/.test(x)); while (i < ls.length) { fuera.push(ls[i]); if (cierra(ls[i])) break; i++; } fuera.push(''); continue; }
    dentro.push(l);
  }
  const sangra = arr => arr.map(l => l ? '    ' + l : l).join('\n');
  if (lang === 'ps') return (fuera.length ? fuera.join('\n') + '\n' : '') + 'Algoritmo Reto\n' + sangra(dentro) + '\nFinAlgoritmo\n';
  const inc = ['#include <iostream>']; if (/\bstring\b/.test(codigo)) inc.push('#include <string>'); if (/\bvector\b/.test(codigo)) inc.push('#include <vector>');
  return inc.join('\n') + '\nusing namespace std;\n\n' + (fuera.length ? fuera.join('\n') + '\n' : '') + 'int main() {\n' + sangra(dentro) + '\n    return 0;\n}\n';
}

function compruebaEjercicio(codigo, lang, pruebas) {
  return pruebas.map(pr => {
    const r = raiz.Motor.correr(codigo, lang, pr.entradas); const out = limpia(r.salida);
    const esp = pr.salida.split('\n'), lin = out.split('\n'), ult = lin.slice(-esp.length);
    const coincide = (x, e) => { x = x.trim(); e = e.trim(); return x === e || (x.endsWith(e) && /[\s:?¿]/.test(x[x.length - e.length - 1] || '')); };
    const ok = !r.error && ult.length === esp.length && esp.every((e, k) => coincide(ult[k], e));
    return { ok, entradas: pr.entradas, esperado: pr.salida, salida: out, error: r.error };
  });
}

raiz.Dojo = { compruebaEjercicio, temas, plantillas, html, porId, langsDe, generar, compruebaOrden, completo, limpia, rng, TIPOS, NOMBRE_TIPO, NOMBRE_LANG: L };
if (typeof module !== 'undefined' && module.exports) module.exports = raiz.Dojo;
})(typeof window !== 'undefined' ? window : globalThis);
