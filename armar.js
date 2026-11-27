/* Dojo de código · «Cómo armar un programa»: el método para pasar de un enunciado a un programa completo,
   en PSeInt, Python y C++. Para quien sabe las instrucciones pero se queda en blanco ante un programa entero.
   El método (6 pasos), las piezas que se repiten en casi todos los ejercicios y programas guiados paso a paso:
   qué entra y qué sale → hacerlo a mano → la receta en español → qué pieza es cada paso → escribirlo → probarlo.
   Sin DOM: las pruebas ejecutan todas las piezas y soluciones con el motor. No da ni quita puntos. */
(function (raiz) {
'use strict';

const METODO = [
  { t: '¿Qué entra y qué sale?', p: 'Antes de escribir nada: qué datos te dan (o tienes que pedir) y qué tiene que mostrar el programa al final.' },
  { t: 'Hazlo tú a mano', p: 'Inventa datos pequeños y resuélvelo con papel o en tu cabeza. Fíjate en lo que haces: ¿cuentas?, ¿sumas?, ¿comparas?, ¿repites?' },
  { t: 'Escribe la receta en español', p: 'Los pasos que hiciste a mano, uno por línea y en orden, como una receta de cocina. Todavía sin código.' },
  { t: 'Reconoce las piezas', p: 'Cada paso de la receta es una pieza que ya conoces: repetir N veces, ir sumando, contar, decidir, buscar el mayor… Casi todos los ejercicios se arman con las mismas.' },
  { t: 'Traduce paso a paso', p: 'Pon la receta como comentarios dentro del programa y debajo de cada uno escribe su código. Un paso cada vez: no hace falta escribirlo todo de golpe.' },
  { t: 'Pruébalo con tus datos', p: 'Ejecútalo con los datos que usaste a mano: tiene que dar lo mismo. Si no, mira el paso a paso para ver en qué línea se separa de lo que esperabas.' }
];

/* Las piezas: lo que se repite en casi todos los programas de clase */
const P = (id, nombre, para, como, codigo, entradas) => ({ id, nombre, para, como, codigo, entradas: (entradas || []).map(String) });
const PIEZAS = [
  P('pedirN', 'Repetir N veces (y pedir datos)', 'Hacer algo un número de veces: pedir N notas, mostrar una tabla…', 'Un Para que cuenta de 1 a N; lo que va dentro se hace en cada vuelta.', {
    ps: 'Definir n, i, x Como Entero\nEscribir "¿Cuántos datos?"\nLeer n\nPara i <- 1 Hasta n Hacer\n    Escribir "Dato ", i, ":"\n    Leer x\nFinPara\nEscribir "Leí ", n, " datos"',
    py: 'n = int(input("¿Cuántos datos? "))\nfor i in range(1, n + 1):\n    x = int(input(f"Dato {i}: "))\nprint("Leí", n, "datos")',
    cpp: 'int n, x;\ncout << "¿Cuántos datos? ";\ncin >> n;\nfor (int i = 1; i <= n; i++) {\n    cout << "Dato " << i << ": ";\n    cin >> x;\n}\ncout << "Leí " << n << " datos" << endl;' }, [3, 5, 8, 2]),
  P('acumulador', 'Acumulador (ir sumando)', 'Sumar muchos datos: el total, la suma de las notas para un promedio…', 'La suma empieza en 0 ANTES de repetir; DENTRO, a la suma se le añade cada dato. Se usa DESPUÉS.', {
    ps: 'Definir i, x, suma Como Entero\nsuma <- 0\nPara i <- 1 Hasta 3 Hacer\n    Leer x\n    suma <- suma + x\nFinPara\nEscribir "Suma: ", suma',
    py: 'suma = 0\nfor i in range(3):\n    x = int(input())\n    suma = suma + x\nprint("Suma:", suma)',
    cpp: 'int x, suma = 0;\nfor (int i = 1; i <= 3; i++) {\n    cin >> x;\n    suma = suma + x;\n}\ncout << "Suma: " << suma << endl;' }, [4, 6, 10]),
  P('contador', 'Contador (contar cuántos cumplen algo)', 'Contar cuántos aprobaron, cuántos son pares, cuántos datos se escribieron…', 'Empieza en 0 antes de repetir; dentro, suma 1 cada vez que se cumple la condición.', {
    ps: 'Definir i, nota, aprobados Como Entero\naprobados <- 0\nPara i <- 1 Hasta 4 Hacer\n    Leer nota\n    Si nota >= 3 Entonces\n        aprobados <- aprobados + 1\n    FinSi\nFinPara\nEscribir "Aprobados: ", aprobados',
    py: 'aprobados = 0\nfor i in range(4):\n    nota = int(input())\n    if nota >= 3:\n        aprobados = aprobados + 1\nprint("Aprobados:", aprobados)',
    cpp: 'int nota, aprobados = 0;\nfor (int i = 1; i <= 4; i++) {\n    cin >> nota;\n    if (nota >= 3) {\n        aprobados = aprobados + 1;\n    }\n}\ncout << "Aprobados: " << aprobados << endl;' }, [4, 2, 5, 3]),
  P('decidir', 'Decidir con cada dato', 'Decir algo distinto de cada dato: aprobado o reprobado, par o impar…', 'Un Si (if) DENTRO de la repetición: se decide una vez por cada dato.', {
    ps: 'Definir i, x Como Entero\nPara i <- 1 Hasta 3 Hacer\n    Leer x\n    Si x MOD 2 = 0 Entonces\n        Escribir x, " es par"\n    SiNo\n        Escribir x, " es impar"\n    FinSi\nFinPara',
    py: 'for i in range(3):\n    x = int(input())\n    if x % 2 == 0:\n        print(x, "es par")\n    else:\n        print(x, "es impar")',
    cpp: 'int x;\nfor (int i = 1; i <= 3; i++) {\n    cin >> x;\n    if (x % 2 == 0) {\n        cout << x << " es par" << endl;\n    } else {\n        cout << x << " es impar" << endl;\n    }\n}' }, [8, 3, 10]),
  P('mayor', 'El mayor (o el menor)', 'Encontrar la nota más alta, el precio más barato…', 'El primer dato es el mayor «por ahora»; con cada dato nuevo, si es más grande, pasa a ser el mayor.', {
    ps: 'Definir i, x, mayor Como Entero\nLeer x\nmayor <- x\nPara i <- 2 Hasta 4 Hacer\n    Leer x\n    Si x > mayor Entonces\n        mayor <- x\n    FinSi\nFinPara\nEscribir "El mayor es: ", mayor',
    py: 'x = int(input())\nmayor = x\nfor i in range(3):\n    x = int(input())\n    if x > mayor:\n        mayor = x\nprint("El mayor es:", mayor)',
    cpp: 'int x, mayor;\ncin >> x;\nmayor = x;\nfor (int i = 2; i <= 4; i++) {\n    cin >> x;\n    if (x > mayor) {\n        mayor = x;\n    }\n}\ncout << "El mayor es: " << mayor << endl;' }, [7, 3, 12, 9]),
  P('centinela', 'Repetir hasta una señal', 'Cuando no sabes cuántos datos habrá: pedir hasta que escriban 0, hasta que elijan «salir»…', 'Pide el primer dato ANTES; MIENTRAS no sea la señal, úsalo y pide el siguiente al final de la vuelta.', {
    ps: 'Definir x, suma Como Entero\nsuma <- 0\nEscribir "Número (0 para terminar):"\nLeer x\nMientras x <> 0 Hacer\n    suma <- suma + x\n    Escribir "Número (0 para terminar):"\n    Leer x\nFinMientras\nEscribir "Suma: ", suma',
    py: 'suma = 0\nx = int(input("Número (0 para terminar): "))\nwhile x != 0:\n    suma = suma + x\n    x = int(input("Número (0 para terminar): "))\nprint("Suma:", suma)',
    cpp: 'int x, suma = 0;\ncout << "Número (0 para terminar): ";\ncin >> x;\nwhile (x != 0) {\n    suma = suma + x;\n    cout << "Número (0 para terminar): ";\n    cin >> x;\n}\ncout << "Suma: " << suma << endl;' }, [5, 8, 2, 0])
];
const SUELTA = { id: 'suelta', nombre: 'Una instrucción suelta (pedir, mostrar o calcular)' };

/* Programas guiados: cada uno se arma con el método, paso a paso.
   receta: [texto, grupo, piezas válidas]. Los pasos del mismo grupo pueden ir en cualquier orden entre sí. */
const G = (o) => o;
const GUIADOS = [
  G({ id: 'promedio', titulo: 'Promedio de notas', piezas: ['pedirN', 'acumulador'],
    enunciado: 'Pide cuántas notas vas a ingresar, después pide cada nota y muestra el promedio (la suma de las notas dividida entre cuántas son).',
    entra: ['Cuántas notas hay y después cada una de las notas', 'Solo el promedio', 'Nada: las notas ya están escritas en el programa'], sale: ['El promedio de las notas', 'La nota más alta', 'Cada nota multiplicada por 2'],
    aMano: { datos: 'Cuántas notas: 4. Las notas: 3.5, 2.5, 4.5 y 3.5', pregunta: '¿Qué promedio debe mostrar?', respuesta: 3.5, explica: '3.5 + 2.5 + 4.5 + 3.5 = 14, y 14 ÷ 4 = 3.5. Lo que hiciste: ir sumando las notas una por una y al final dividir entre cuántas son.' },
    receta: [['Preguntar cuántas notas hay', 1, ['suelta']], ['Empezar la suma en 0', 1, ['acumulador']], ['Repetir tantas veces como notas: pedir una nota y sumarla', 2, ['pedirN', 'acumulador']], ['Dividir la suma entre el número de notas', 3, ['suelta']], ['Mostrar el promedio', 4, ['suelta']]],
    pruebas: [{ entradas: ['4', '3.5', '2.5', '4.5', '3.5'], salida: '3.5' }, { entradas: ['3', '1', '2', '4.5'], salida: '2.5' }],
    sol: {
      ps: 'Algoritmo PromedioDeNotas\n    Definir n, i Como Entero\n    Definir nota, suma, promedio Como Real\n    // 1. Preguntar cuántas notas hay\n    Escribir "¿Cuántas notas vas a ingresar?"\n    Leer n\n    // 2. Empezar la suma en 0\n    suma <- 0\n    // 3. Repetir: pedir una nota y sumarla\n    Para i <- 1 Hasta n Hacer\n        Escribir "Nota ", i, ":"\n        Leer nota\n        suma <- suma + nota\n    FinPara\n    // 4. Dividir y 5. mostrar\n    promedio <- suma / n\n    Escribir "El promedio es: ", promedio\nFinAlgoritmo',
      py: '# 1. Preguntar cuántas notas hay\nn = int(input("¿Cuántas notas vas a ingresar? "))\n# 2. Empezar la suma en 0\nsuma = 0\n# 3. Repetir: pedir una nota y sumarla\nfor i in range(1, n + 1):\n    nota = float(input(f"Nota {i}: "))\n    suma = suma + nota\n# 4. Dividir y 5. mostrar\npromedio = suma / n\nprint("El promedio es:", promedio)',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    double nota, suma, promedio;\n    // 1. Preguntar cuántas notas hay\n    cout << "¿Cuántas notas vas a ingresar? ";\n    cin >> n;\n    // 2. Empezar la suma en 0\n    suma = 0;\n    // 3. Repetir: pedir una nota y sumarla\n    for (int i = 1; i <= n; i++) {\n        cout << "Nota " << i << ": ";\n        cin >> nota;\n        suma = suma + nota;\n    }\n    // 4. Dividir y 5. mostrar\n    promedio = suma / n;\n    cout << "El promedio es: " << promedio << endl;\n    return 0;\n}' } }),
  G({ id: 'aprobados', titulo: 'Cuántos aprobaron', piezas: ['pedirN', 'contador', 'decidir'],
    enunciado: 'Pide cuántas notas hay y después cada nota (de 0 a 5). Muestra cuántas notas aprobaron: una nota aprueba si es 3.0 o más.',
    entra: ['Cuántas notas hay y cada una de las notas', 'Solo la nota mínima para aprobar', 'Cuántos aprobaron'], sale: ['Cuántas notas aprobaron', 'Todas las notas ordenadas', 'El promedio'],
    aMano: { datos: 'Cuántas notas: 5. Las notas: 4, 2.5, 3, 1 y 5', pregunta: '¿Cuántas aprobaron?', respuesta: 3, explica: 'Aprueban 4, 3 y 5 (3 o más): son 3. Lo que hiciste: mirar cada nota, decidir si aprueba y, si aprueba, contar uno más.' },
    receta: [['Preguntar cuántas notas hay', 1, ['suelta']], ['Empezar el contador de aprobados en 0', 1, ['contador']], ['Repetir tantas veces como notas: pedir una nota', 2, ['pedirN']], ['Si esa nota es 3.0 o más, sumar 1 al contador', 3, ['decidir', 'contador']], ['Mostrar cuántas aprobaron', 4, ['suelta']]],
    pruebas: [{ entradas: ['5', '4', '2.5', '3', '1', '5'], salida: '3' }, { entradas: ['3', '2', '2.9', '1'], salida: '0' }],
    sol: {
      ps: 'Algoritmo CuantosAprobaron\n    Definir n, i, aprobados Como Entero\n    Definir nota Como Real\n    Escribir "¿Cuántas notas hay?"\n    Leer n\n    aprobados <- 0\n    Para i <- 1 Hasta n Hacer\n        Escribir "Nota ", i, ":"\n        Leer nota\n        Si nota >= 3.0 Entonces\n            aprobados <- aprobados + 1\n        FinSi\n    FinPara\n    Escribir "Aprobaron: ", aprobados\nFinAlgoritmo',
      py: 'n = int(input("¿Cuántas notas hay? "))\naprobados = 0\nfor i in range(1, n + 1):\n    nota = float(input(f"Nota {i}: "))\n    if nota >= 3.0:\n        aprobados = aprobados + 1\nprint("Aprobaron:", aprobados)',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, aprobados = 0;\n    double nota;\n    cout << "¿Cuántas notas hay? ";\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        cout << "Nota " << i << ": ";\n        cin >> nota;\n        if (nota >= 3.0) {\n            aprobados = aprobados + 1;\n        }\n    }\n    cout << "Aprobaron: " << aprobados << endl;\n    return 0;\n}' } }),
  G({ id: 'mayor', titulo: 'El número mayor', piezas: ['pedirN', 'mayor'],
    enunciado: 'Pide cuántos números vas a ingresar y después cada número. Muestra el mayor de todos.',
    entra: ['Cuántos números hay y cada uno de los números', 'Solo el número mayor', 'Dos números para comparar'], sale: ['El mayor de los números', 'Todos los números de mayor a menor', 'La suma de los números'],
    aMano: { datos: 'Cuántos números: 4. Los números: 7, 3, 12 y 9', pregunta: '¿Cuál es el mayor?', respuesta: 12, explica: 'Empiezas creyendo que 7 es el mayor; 3 no lo supera; 12 sí, así que ahora el mayor es 12; 9 no lo supera. Lo que hiciste: recordar el mayor hasta ahora y compararlo con cada número nuevo.' },
    receta: [['Preguntar cuántos números hay', 1, ['suelta']], ['Pedir el primer número y recordarlo como el mayor hasta ahora', 2, ['mayor']], ['Repetir con los demás números: pedir uno', 3, ['pedirN']], ['Si es más grande que el mayor, pasa a ser el mayor', 4, ['mayor', 'decidir']], ['Mostrar el mayor', 5, ['suelta']]],
    pruebas: [{ entradas: ['4', '7', '3', '12', '9'], salida: '12' }, { entradas: ['3', '-5', '-2', '-9'], salida: '-2' }],
    sol: {
      ps: 'Algoritmo ElMayor\n    Definir n, i, x, mayor Como Entero\n    Escribir "¿Cuántos números?"\n    Leer n\n    Escribir "Número 1:"\n    Leer x\n    mayor <- x\n    Para i <- 2 Hasta n Hacer\n        Escribir "Número ", i, ":"\n        Leer x\n        Si x > mayor Entonces\n            mayor <- x\n        FinSi\n    FinPara\n    Escribir "El mayor es: ", mayor\nFinAlgoritmo',
      py: 'n = int(input("¿Cuántos números? "))\nx = int(input("Número 1: "))\nmayor = x\nfor i in range(2, n + 1):\n    x = int(input(f"Número {i}: "))\n    if x > mayor:\n        mayor = x\nprint("El mayor es:", mayor)',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, x, mayor;\n    cout << "¿Cuántos números? ";\n    cin >> n;\n    cout << "Número 1: ";\n    cin >> x;\n    mayor = x;\n    for (int i = 2; i <= n; i++) {\n        cout << "Número " << i << ": ";\n        cin >> x;\n        if (x > mayor) {\n            mayor = x;\n        }\n    }\n    cout << "El mayor es: " << mayor << endl;\n    return 0;\n}' } }),
  G({ id: 'paresimpares', titulo: 'Sumar pares e impares por separado', piezas: ['pedirN', 'acumulador', 'decidir'],
    enunciado: 'Pide cuántos números vas a ingresar y después cada número. Muestra la suma de los pares y, en la línea siguiente, la suma de los impares.',
    entra: ['Cuántos números hay y cada uno de los números', 'Solo los números pares', 'La suma total'], sale: ['La suma de los pares y la suma de los impares', 'Cuántos números son pares', 'El número mayor'],
    aMano: { datos: 'Cuántos números: 5. Los números: 4, 7, 8, 3 y 1', pregunta: '¿Cuánto suman los pares?', respuesta: 12, explica: 'Pares: 4 + 8 = 12. Impares: 7 + 3 + 1 = 11. Lo que hiciste: dos sumas a la vez, y con cada número decidir a cuál de las dos va.' },
    receta: [['Preguntar cuántos números hay', 1, ['suelta']], ['Empezar las dos sumas (pares e impares) en 0', 1, ['acumulador']], ['Repetir tantas veces como números: pedir uno', 2, ['pedirN']], ['Si es par, sumarlo a los pares; si no, a los impares', 3, ['decidir', 'acumulador']], ['Mostrar las dos sumas', 4, ['suelta']]],
    pruebas: [{ entradas: ['5', '4', '7', '8', '3', '1'], salida: '12\n11' }, { entradas: ['3', '2', '4', '6'], salida: '12\n0' }],
    sol: {
      ps: 'Algoritmo ParesEImpares\n    Definir n, i, x, pares, impares Como Entero\n    Escribir "¿Cuántos números?"\n    Leer n\n    pares <- 0\n    impares <- 0\n    Para i <- 1 Hasta n Hacer\n        Escribir "Número ", i, ":"\n        Leer x\n        Si x MOD 2 = 0 Entonces\n            pares <- pares + x\n        SiNo\n            impares <- impares + x\n        FinSi\n    FinPara\n    Escribir "Suma de los pares: ", pares\n    Escribir "Suma de los impares: ", impares\nFinAlgoritmo',
      py: 'n = int(input("¿Cuántos números? "))\npares = 0\nimpares = 0\nfor i in range(1, n + 1):\n    x = int(input(f"Número {i}: "))\n    if x % 2 == 0:\n        pares = pares + x\n    else:\n        impares = impares + x\nprint("Suma de los pares:", pares)\nprint("Suma de los impares:", impares)',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, x, pares = 0, impares = 0;\n    cout << "¿Cuántos números? ";\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        cout << "Número " << i << ": ";\n        cin >> x;\n        if (x % 2 == 0) {\n            pares = pares + x;\n        } else {\n            impares = impares + x;\n        }\n    }\n    cout << "Suma de los pares: " << pares << endl;\n    cout << "Suma de los impares: " << impares << endl;\n    return 0;\n}' } }),
  G({ id: 'tabla', titulo: 'Tabla de multiplicar', piezas: ['pedirN'],
    enunciado: 'Pide un número y muestra su tabla de multiplicar del 1 al 10, una línea por cada multiplicación (por ejemplo: 7 x 3 = 21).',
    entra: ['Un número', 'Diez números', 'El resultado de cada multiplicación'], sale: ['Diez líneas: el número por 1, por 2… hasta por 10', 'Un solo resultado', 'Los números del 1 al 10'],
    aMano: { datos: 'El número: 7', pregunta: '¿Qué resultado sale en la línea 3 (7 x 3)?', respuesta: 21, explica: '7 x 3 = 21. Lo que haces es lo mismo diez veces, cambiando solo el número por el que multiplicas: 1, 2, 3… 10. Eso es repetir contando.' },
    receta: [['Pedir el número', 1, ['suelta']], ['Repetir contando con i del 1 al 10', 2, ['pedirN']], ['En cada vuelta, mostrar: número x i = número por i', 3, ['suelta']]],
    pruebas: [{ entradas: ['7'], salida: '7\n14\n21\n28\n35\n42\n49\n56\n63\n70' }, { entradas: ['3'], salida: '3\n6\n9\n12\n15\n18\n21\n24\n27\n30' }],
    sol: {
      ps: 'Algoritmo Tabla\n    Definir n, i Como Entero\n    Escribir "Número:"\n    Leer n\n    Para i <- 1 Hasta 10 Hacer\n        Escribir n, " x ", i, " = ", n * i\n    FinPara\nFinAlgoritmo',
      py: 'n = int(input("Número: "))\nfor i in range(1, 11):\n    print(n, "x", i, "=", n * i)',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cout << "Número: ";\n    cin >> n;\n    cout << endl;\n    for (int i = 1; i <= 10; i++) {\n        cout << n << " x " << i << " = " << n * i << endl;\n    }\n    return 0;\n}' } }),
  G({ id: 'hastacero', titulo: 'Sumar hasta que escriban 0', piezas: ['centinela', 'contador', 'acumulador'],
    enunciado: 'Pide números uno por uno hasta que escriban 0. Al final muestra cuántos números se escribieron (sin contar el 0) y, en la línea siguiente, cuánto suman.',
    entra: ['Números, uno por uno, hasta un 0', 'Cuántos números habrá', 'Solo un número'], sale: ['Cuántos números se escribieron y cuánto suman', 'El número más grande', 'Solo la suma'],
    aMano: { datos: 'Escriben: 5, 8, 2 y 0', pregunta: '¿Cuántos números cuentan?', respuesta: 3, explica: 'Cuentan 5, 8 y 2: son 3 (el 0 solo dice «ya está»), y suman 15. Aquí no sabes cuántos habrá: por eso se repite MIENTRAS no llegue el 0.' },
    receta: [['Empezar el contador y la suma en 0', 1, ['contador', 'acumulador']], ['Pedir el primer número', 1, ['centinela', 'suelta']], ['Mientras el número no sea 0: contarlo, sumarlo y pedir el siguiente', 2, ['centinela']], ['Mostrar cuántos y cuánto suman', 3, ['suelta']]],
    pruebas: [{ entradas: ['5', '8', '2', '0'], salida: '3\n15' }, { entradas: ['0'], salida: '0\n0' }],
    sol: {
      ps: 'Algoritmo HastaCero\n    Definir x, cantidad, suma Como Entero\n    cantidad <- 0\n    suma <- 0\n    Escribir "Número (0 para terminar):"\n    Leer x\n    Mientras x <> 0 Hacer\n        cantidad <- cantidad + 1\n        suma <- suma + x\n        Escribir "Número (0 para terminar):"\n        Leer x\n    FinMientras\n    Escribir "Cantidad: ", cantidad\n    Escribir "Suma: ", suma\nFinAlgoritmo',
      py: 'cantidad = 0\nsuma = 0\nx = int(input("Número (0 para terminar): "))\nwhile x != 0:\n    cantidad = cantidad + 1\n    suma = suma + x\n    x = int(input("Número (0 para terminar): "))\nprint("Cantidad:", cantidad)\nprint("Suma:", suma)',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x, cantidad = 0, suma = 0;\n    cout << "Número (0 para terminar): ";\n    cin >> x;\n    while (x != 0) {\n        cantidad = cantidad + 1;\n        suma = suma + x;\n        cout << "Número (0 para terminar): ";\n        cin >> x;\n    }\n    cout << endl << "Cantidad: " << cantidad << endl;\n    cout << "Suma: " << suma << endl;\n    return 0;\n}' } })
];

/* ¿El orden de la receta vale? Los pasos del mismo grupo pueden ir en cualquier orden entre sí */
function recetaBien(g, orden) {
  if (!Array.isArray(orden) || orden.length !== g.receta.length || new Set(orden).size !== orden.length) return false;
  let antes = 0;
  for (const k of orden) { const grupo = g.receta[k] && g.receta[k][1]; if (!grupo || grupo < antes) return false; antes = grupo; }
  return true;
}
/* La pieza elegida para un paso: vale cualquiera de las que lo describen */
const piezaBien = (g, k, pieza) => !!g.receta[k] && g.receta[k][2].includes(pieza);
/* «A mano»: vale si en lo que escribió aparece el número correcto */
function aManoBien(g, texto) {
  const nums = String(texto || '').replace(/,/g, '.').match(/-?\d+(\.\d+)?/g) || [];
  return nums.some(n => Math.abs(parseFloat(n) - g.aMano.respuesta) < 1e-9);
}
/* La receta como comentarios, para escribir el código debajo de cada paso */
function esqueleto(g, lang, orden) {
  const c = lang === 'py' ? '# ' : '// ', pasos = (orden && orden.length === g.receta.length ? orden : g.receta.map((_, k) => k)).map((k, n) => `${c}${n + 1}. ${g.receta[k][0]}`);
  if (lang === 'ps') return `Algoritmo ${g.titulo.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ]/g, '')}\n    ${pasos.join('\n    \n    ')}\n    \nFinAlgoritmo`;
  if (lang === 'cpp') return `#include <iostream>\nusing namespace std;\n\nint main() {\n    ${pasos.join('\n    \n    ')}\n    \n    return 0;\n}`;
  return pasos.join('\n\n') + '\n';
}
/* Desordenar la receta siempre igual para un mismo ejercicio (y nunca en el orden correcto) */
function desordena(g) {
  const idx = g.receta.map((_, k) => k); let s = [...g.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const r = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  for (let n = 0; n < 6; n++) { for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; } if (!recetaBien(g, idx)) break; }
  return idx;
}
const porId = id => GUIADOS.find(g => g.id === id) || null;
const pieza = id => (id === 'suelta' ? SUELTA : PIEZAS.find(p => p.id === id) || null);
const Armar = { METODO, PIEZAS, SUELTA, GUIADOS, porId, pieza, recetaBien, piezaBien, aManoBien, esqueleto, desordena };
if (typeof module !== 'undefined' && module.exports) module.exports = Armar; else raiz.Armar = Armar;
})(typeof window !== 'undefined' ? window : globalThis);
