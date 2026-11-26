/* Estudio intensivo: una guía completa de cada lenguaje, desde cero, para estudiar a fondo (por ejemplo, la
   víspera de una evaluación). No da ni quita puntos. Cada capítulo trae: la explicación por partes, ejemplos
   que se pueden ejecutar, las palabras del lenguaje explicadas una a una, los errores típicos y una chuleta.
   Sin DOM: las pruebas ejecutan todos los ejemplos con el motor. En C++ los ejemplos sin main se completan solos. */
(function (raiz) {
'use strict';
const S = (t, p, ej) => ({ t, p: [].concat(p), ej: ej || null });
const E = (codigo, nota, entradas) => ({ codigo, nota: nota || '', entradas: (entradas || []).map(String) });
const W = (palabra, que, ejemplo) => ({ palabra, que, ejemplo });
const X = (pasa, porque, arreglo) => ({ pasa, porque, arreglo });
const C = (id, titulo, objetivo, secciones, palabras, errores, practica) => ({ id, titulo, objetivo, secciones, palabras, errores, practica: practica || null });

/* ═══════════════════════════ PSeInt ═══════════════════════════ */
const ps = {
  lang: 'ps', nombre: 'PSeInt',
  intro: 'PSeInt es un lenguaje en español pensado para aprender a programar: escribes algoritmos con palabras como Escribir, Leer, Si o Mientras. Lo que aprendes aquí (la lógica) sirve igual para Python, C++ o cualquier otro lenguaje.',
  capitulos: [
    C('empezar', 'Qué es programar y tu primer algoritmo', 'Saber qué es un programa, cómo se escribe uno en PSeInt y cómo se ejecuta.', [
      S('Qué es un programa', ['Un programa es una lista de instrucciones que la computadora sigue en orden, de arriba abajo, una por una. Programar es escribir esas instrucciones sin ambigüedad: la computadora hace exactamente lo que dices, ni más ni menos.', 'Un algoritmo es esa lista de pasos para resolver un problema. PSeInt se llama así porque es un «pseudo intérprete»: entiende pseudocódigo en español.']),
      S('La forma de un algoritmo', ['Todo algoritmo empieza con Algoritmo y un nombre, y termina con FinAlgoritmo. Lo de dentro son las instrucciones. En el Dojo puedes omitir esas dos líneas en los ejemplos cortos; en tu evaluación, ponlas siempre.'],
        E('Algoritmo saludo\n    Escribir "Hola, mundo"\nFinAlgoritmo', 'Escribir muestra un texto en la pantalla. Lo de dentro de las comillas sale tal cual.')),
      S('Comentarios', ['Un comentario es una nota para personas: empieza con // y la computadora lo ignora. Sirven para explicar qué hace cada parte.'],
        E('// Este algoritmo saluda\nEscribir "Hola" // esto también es un comentario', 'Solo se muestra «Hola».')),
      S('Cómo se ejecuta', ['En el programa PSeInt de tu PC: escribes el algoritmo y pulsas Ejecutar (el botón verde o F9). En el Dojo: pulsa «Ejecutar» en el ejemplo o llévalo al laboratorio de estudio.', 'Si hay un error, PSeInt te dice en qué línea está. Lee el mensaje: casi siempre dice exactamente qué falta.'])
    ], [W('Algoritmo', 'Empieza el algoritmo; va seguido de su nombre (sin espacios).', 'Algoritmo calculadora'), W('FinAlgoritmo', 'Marca el final del algoritmo.', 'FinAlgoritmo'), W('Proceso / FinProceso', 'Lo mismo que Algoritmo / FinAlgoritmo (forma antigua; PSeInt acepta las dos).', 'Proceso suma'), W('//', 'Comentario: lo que va detrás no se ejecuta.', '// pide la edad')],
    [X('«Falta FinAlgoritmo»', 'Abriste el algoritmo y no lo cerraste.', 'Añade FinAlgoritmo al final.'), X('El nombre del algoritmo tiene espacios', 'Los nombres no pueden llevar espacios.', 'Usa mi_algoritmo o miAlgoritmo.')], 'salida'),

    C('mostrar', 'Mostrar en pantalla: Escribir', 'Mostrar textos, números y resultados, en una línea o en varias.', [
      S('Escribir', ['Escribir muestra lo que le pongas y después baja de línea. Cada Escribir es una línea nueva.'],
        E('Escribir "Primera línea"\nEscribir "Segunda línea"')),
      S('Texto o cuenta', ['Entre comillas es TEXTO: se muestra literal. Sin comillas, PSeInt lo CALCULA. «3 + 4» entre comillas es un texto; 3 + 4 sin comillas es 7.'],
        E('Escribir "3 + 4"\nEscribir 3 + 4', 'Primero sale el texto tal cual; después, el resultado.')),
      S('Varias cosas en una línea', ['Separa con comas lo que quieras mostrar junto. PSeInt lo pega tal cual: los espacios los pones tú dentro de las comillas.'],
        E('Escribir "Tengo ", 3, " gatos"', 'Fíjate en los espacios dentro de las comillas.')),
      S('Sin Saltar', ['Si escribes Sin Saltar al final, el siguiente Escribir sigue en la misma línea.'],
        E('Escribir "Hola " Sin Saltar\nEscribir "Ana"')),
      S('Borrar la pantalla y esperar', ['Borrar Pantalla (o Limpiar Pantalla) quita todo lo que se había mostrado: lo siguiente aparece en una pantalla limpia. Sirve para menús y juegos.', 'Esperar Tecla detiene el algoritmo hasta que se pulsa una tecla; Esperar 2 Segundos (o 500 Milisegundos) hace una pausa. En el Dojo las esperas no detienen nada, pero en PSeInt sí.'],
        E('Escribir "Cargando…"\nEsperar 1 Segundos\nBorrar Pantalla\nEscribir "¡Listo!"', 'Solo queda «¡Listo!»: lo de antes se borró.'))
    ], [W('Escribir', 'Muestra en pantalla y baja de línea. También vale Imprimir o Mostrar.', 'Escribir "Hola"'), W('Sin Saltar', 'Al final de un Escribir: no baja de línea. También vale Sin Bajar.', 'Escribir "a" Sin Saltar'), W('Borrar Pantalla', 'Limpia todo lo mostrado (igual que Limpiar Pantalla).', 'Borrar Pantalla'), W('Esperar', 'Pausa: Esperar Tecla, Esperar 2 Segundos, Esperar 500 Milisegundos.', 'Esperar Tecla'), W('" "', 'Las comillas marcan un texto (cadena).', '"Buenos días"'), W(',', 'En Escribir, separa las cosas que se muestran juntas.', 'Escribir "Edad: ", 20')],
    [X('Sale la palabra en vez del valor', 'Pusiste comillas a una variable: "x" es el texto x, no la variable.', 'Quita las comillas: Escribir x'), X('Sale todo pegado', 'Escribir no pone espacios entre las cosas separadas por comas.', 'Pon el espacio dentro de las comillas: "Total: "'), X('Error de comillas', 'Abriste unas comillas y no las cerraste.', 'Cierra siempre las comillas en la misma línea.')], 'salida'),

    C('variables', 'Variables y tipos de datos', 'Guardar datos en variables, entender los tipos y declararlas con Definir.', [
      S('Qué es una variable', ['Una variable es una caja con nombre donde guardas un valor. Con <- (flecha) metes un valor en la caja; si ya había uno, el viejo se pierde.'],
        E('edad <- 20\nEscribir edad\nedad <- 21\nEscribir edad', 'La caja edad guarda solo el último valor.')),
      S('Los tipos', ['Cada dato tiene un tipo: Entero (números sin decimales: 7), Real (con decimales: 7.5), Caracter o Texto (letras: "Ana") y Logico (Verdadero o Falso).', 'Definir declara la variable y su tipo antes de usarla. Muchos profesores lo piden siempre: acostúmbrate.'],
        E('Definir nombre Como Caracter\nDefinir edad Como Entero\nDefinir altura Como Real\nnombre <- "Ana"\nedad <- 20\naltura <- 1.65\nEscribir nombre, " tiene ", edad, " años y mide ", altura')),
      S('Nombres válidos', ['Un nombre de variable empieza por letra, no lleva espacios ni tildes ni símbolos raros: total, precio_final, nota2. Elige nombres que digan lo que guardan.']),
      S('Cambiar una variable usando su valor', ['Puedes calcular el nuevo valor a partir del viejo: contador <- contador + 1 suma uno a lo que había.'],
        E('puntos <- 10\npuntos <- puntos + 5\nEscribir puntos'))
    ], [W('<-', 'Asignación: guarda el valor de la derecha en la variable de la izquierda. También se acepta =.', 'x <- 5'), W('Definir … Como …', 'Declara una o varias variables y su tipo.', 'Definir a, b Como Entero'), W('Entero', 'Tipo para números sin decimales.', 'Definir n Como Entero'), W('Real', 'Tipo para números con decimales.', 'Definir precio Como Real'), W('Caracter / Texto / Cadena', 'Tipo para textos.', 'Definir nombre Como Caracter'), W('Logico', 'Tipo que solo vale Verdadero o Falso.', 'Definir listo Como Logico'), W('Verdadero / Falso', 'Los dos valores lógicos.', 'listo <- Falso')],
    [X('«Variable no definida» o sin valor', 'Usaste una variable antes de darle valor.', 'Asígnale algo antes de usarla.'), X('Se guarda el texto "x" en vez del valor', 'Pusiste comillas al asignar.', 'precio <- 10, no precio <- "10".'), X('Tipo incompatible', 'Guardaste un texto en una variable Entero.', 'Revisa el Definir.')], 'variables'),

    C('operaciones', 'Operaciones y funciones matemáticas', 'Calcular con operadores, saber qué va primero y usar MOD, TRUNC, RC…', [
      S('Operadores', ['Suma +, resta -, multiplicación *, división /, potencia ^ y resto MOD. Primero se hacen ^, luego * / MOD, y al final + -. Los paréntesis mandan sobre todo.'],
        E('Escribir 2 + 3 * 4\nEscribir (2 + 3) * 4\nEscribir 2 ^ 3', '2 + 3 * 4 es 14, no 20.')),
      S('División y resto', ['/ da el resultado con decimales. Para quedarte con la parte entera usa TRUNC. MOD da el resto: 17 MOD 5 es 2.'],
        E('Escribir 17 / 5\nEscribir TRUNC(17 / 5)\nEscribir 17 MOD 5', 'Truco: n MOD 2 = 0 significa que n es par.')),
      S('Funciones matemáticas', ['RC(x) es la raíz cuadrada, ABS(x) el valor absoluto, REDON(x) redondea, TRUNC(x) corta los decimales, AZAR(n) da un entero al azar entre 0 y n-1.'],
        E('Escribir RC(16)\nEscribir ABS(-7)\nEscribir REDON(2.6)')),
      S('Más funciones y PI', ['LN(x) es el logaritmo natural y EXP(x) la exponencial. SEN, COS y TAN trabajan con ángulos en radianes; ASEN, ACOS y ATAN hacen lo contrario. PI vale 3.1415926536. ALEATORIO(a, b) da un entero al azar entre a y b (los dos incluidos).', 'Para pasar grados a radianes: grados * PI / 180.'],
        E('Escribir TRUNC(PI * 100)\nEscribir REDON(SEN(90 * PI / 180))\nEscribir RAIZ(2 ^ 2 + 3 ^ 2 + 6 ^ 2)', 'RAIZ es lo mismo que RC.'))
    ], [W('+ - * /', 'Suma, resta, multiplicación y división (con decimales).', 'total <- precio * 2'), W('^', 'Potencia.', '2 ^ 10'), W('MOD', 'Resto de la división entera.', '17 MOD 5 (da 2)'), W('TRUNC(x)', 'Parte entera (corta los decimales).', 'TRUNC(7 / 2) (da 3)'), W('REDON(x)', 'Redondea al entero más cercano.', 'REDON(2.6) (da 3)'), W('RC(x)', 'Raíz cuadrada.', 'RC(25) (da 5)'), W('ABS(x)', 'Valor absoluto.', 'ABS(-3) (da 3)'), W('AZAR(n)', 'Entero al azar de 0 a n-1.', 'AZAR(6) + 1 (un dado)'), W('ALEATORIO(a, b)', 'Entero al azar de a a b.', 'ALEATORIO(1, 6) (un dado)'), W('LN(x) · EXP(x)', 'Logaritmo natural y exponencial.', 'EXP(1) (da 2.7182818285)'), W('SEN · COS · TAN', 'Seno, coseno y tangente (en radianes).', 'COS(0) (da 1)'), W('ASEN · ACOS · ATAN', 'Las inversas: devuelven el ángulo en radianes.', 'ATAN(1) * 4 (da PI)'), W('PI', 'El número π.', 'area <- PI * r ^ 2')],
    [X('El resultado sale distinto', 'Olvidaste que * y / van antes que + y -.', 'Usa paréntesis: (a + b) / 2.'), X('Sale 3.5 y querías 3', '/ deja decimales.', 'Usa TRUNC(a / b).')], 'operaciones'),

    C('leer', 'Pedir datos: Leer', 'Pedir datos al usuario y usarlos en el algoritmo.', [
      S('Leer', ['Leer detiene el algoritmo hasta que el usuario escribe un valor y pulsa Enter; ese valor se guarda en la variable. Antes de Leer, muestra un mensaje para que sepa qué escribir.'],
        E('Definir edad Como Entero\nEscribir "¿Cuántos años tienes?"\nLeer edad\nEscribir "El año que viene tendrás ", edad + 1', 'En el Dojo, el dato se pone en «Datos» (uno por línea).', [20])),
      S('Leer varios datos', ['Puedes leer varias variables, una después de otra.'],
        E('Definir a, b Como Entero\nLeer a\nLeer b\nEscribir "Suma: ", a + b', '', [4, 6])),
      S('Textos', ['Para leer un nombre, declara la variable como Caracter.'],
        E('Definir nombre Como Caracter\nLeer nombre\nEscribir "Hola, ", nombre', '', ['Ana']))
    ], [W('Leer', 'Espera a que el usuario escriba y lo guarda en la variable.', 'Leer edad'), W('Escribir (antes de Leer)', 'El mensaje que dice qué hay que escribir.', 'Escribir "Precio:"')],
    [X('El usuario no sabe qué escribir', 'No mostraste ningún mensaje antes de Leer.', 'Pon un Escribir explicativo antes.'), X('Se lee un texto en una variable Entero', 'El tipo no coincide con lo que se escribe.', 'Declara Caracter para textos.')], 'leer'),

    C('decisiones', 'Decisiones: Si, SiNo y Segun', 'Hacer que el algoritmo elija qué hacer según una condición.', [
      S('Si … Entonces … FinSi', ['Si la condición es verdadera, se ejecuta lo de dentro; si no, se salta. La condición compara valores: = igual, <> distinto, <, >, <=, >=.'],
        E('Leer edad\nSi edad >= 18 Entonces\n    Escribir "Mayor de edad"\nFinSi', '', [20])),
      S('SiNo', ['SiNo es el camino cuando la condición es falsa. Siempre se ejecuta uno de los dos caminos, nunca los dos.'],
        E('Leer n\nSi n MOD 2 = 0 Entonces\n    Escribir "par"\nSiNo\n    Escribir "impar"\nFinSi', '', [7])),
      S('Varias opciones', ['Para varias opciones, pon un Si dentro del SiNo (anidados). Cada Si necesita su FinSi.'],
        E('Leer nota\nSi nota >= 9 Entonces\n    Escribir "sobresaliente"\nSiNo\n    Si nota >= 5 Entonces\n        Escribir "aprobado"\n    SiNo\n        Escribir "suspendido"\n    FinSi\nFinSi', '', [6])),
      S('Y, O, NO', ['Y: las dos condiciones deben cumplirse. O: basta con una. NO: invierte la condición.'],
        E('Leer edad\nSi edad >= 13 Y edad <= 17 Entonces\n    Escribir "adolescente"\nSiNo\n    Escribir "no adolescente"\nFinSi', '', [15])),
      S('Segun', ['Segun elige entre valores concretos de una variable, como un menú. De Otro Modo es para el resto de casos.'],
        E('Leer opcion\nSegun opcion Hacer\n    1: Escribir "Jugar"\n    2: Escribir "Salir"\n    De Otro Modo: Escribir "Opción no válida"\nFinSegun', '', [2]))
    ], [W('Si … Entonces', 'Empieza una decisión.', 'Si x > 0 Entonces'), W('SiNo', 'El camino si la condición es falsa.', 'SiNo'), W('FinSi', 'Cierra el Si.', 'FinSi'), W('= <> < > <= >=', 'Comparaciones: igual, distinto, menor, mayor, menor o igual, mayor o igual.', 'Si a <> b Entonces'), W('Y / O / NO', 'Unen o invierten condiciones.', 'Si a > 0 Y b > 0 Entonces'), W('Segun … Hacer', 'Elige un caso según el valor de una variable.', 'Segun dia Hacer'), W('De Otro Modo', 'En Segun: cualquier otro valor.', 'De Otro Modo: Escribir "?"'), W('FinSegun', 'Cierra el Segun.', 'FinSegun')],
    [X('«Falta FinSi»', 'Cada Si necesita su FinSi.', 'Cuenta los Si y los FinSi: deben ser los mismos.'), X('Nunca entra en el Si', 'La condición está al revés (< en vez de >).', 'Prueba la condición con un ejemplo a mano.'), X('Entra en los dos casos', 'Pusiste dos Si separados en vez de Si … SiNo.', 'Usa SiNo cuando los casos se excluyen.')], 'decisiones'),

    C('mientras', 'Repetir: Mientras y Repetir…Hasta Que', 'Repetir mientras se cumpla una condición, con contadores y acumuladores.', [
      S('Mientras', ['Mientras la condición sea verdadera, repite lo de dentro. Se comprueba ANTES de cada vuelta: si es falsa desde el principio, no entra nunca.'],
        E('i <- 1\nMientras i <= 5 Hacer\n    Escribir i\n    i <- i + 1\nFinMientras')),
      S('Contador y acumulador', ['Un contador suma 1 en cada vuelta (cuenta cuántas veces). Un acumulador suma valores (va guardando el total). Ambos empiezan en 0 antes del bucle.'],
        E('suma <- 0\nLeer n\nMientras n <> 0 Hacer\n    suma <- suma + n\n    Leer n\nFinMientras\nEscribir "Total: ", suma', 'Lee números hasta que escriban 0.', [5, 3, 2, 0])),
      S('Repetir … Hasta Que', ['Repite y comprueba la condición AL FINAL: siempre se ejecuta al menos una vez. Ojo: termina cuando la condición se CUMPLE (al revés que Mientras).'],
        E('i <- 1\nRepetir\n    Escribir i\n    i <- i + 1\nHasta Que i > 3')),
      S('El bucle infinito', ['Si la condición nunca se vuelve falsa, el bucle no termina. Casi siempre es porque olvidaste cambiar la variable dentro (por ejemplo, el i <- i + 1).'])
    ], [W('Mientras … Hacer', 'Repite mientras la condición sea verdadera.', 'Mientras x < 10 Hacer'), W('FinMientras', 'Cierra el Mientras.', 'FinMientras'), W('Repetir', 'Empieza un bucle que se comprueba al final.', 'Repetir'), W('Hasta Que', 'Termina el Repetir cuando la condición se cumple.', 'Hasta Que n = 0'), W('contador', 'Variable que suma 1 en cada vuelta.', 'c <- c + 1'), W('acumulador', 'Variable que va sumando valores.', 'total <- total + precio')],
    [X('El algoritmo no termina', 'Bucle infinito: la variable de la condición no cambia dentro.', 'Asegúrate de cambiarla en cada vuelta.'), X('El total sale mal', 'El acumulador no empezaba en 0, o se reinicia dentro del bucle.', 'Pon suma <- 0 ANTES del Mientras.')], 'mientras'),

    C('para', 'Repetir contando: Para', 'Repetir un número exacto de veces con Para.', [
      S('Para', ['Para repite contando: la variable empieza en un valor y llega hasta otro, sumando 1 en cada vuelta. Úsalo cuando sabes cuántas veces repetir.'],
        E('Para i <- 1 Hasta 5 Hacer\n    Escribir "Vuelta ", i\nFinPara')),
      S('Con Paso', ['Con Paso cambias cuánto avanza: de 2 en 2, o hacia atrás con Paso -1.'],
        E('Para i <- 10 Hasta 0 Con Paso -2 Hacer\n    Escribir i\nFinPara')),
      S('Tabla de multiplicar y sumas', ['Para se combina con acumuladores: sumar del 1 al n, la tabla de un número…'],
        E('Leer n\nPara i <- 1 Hasta 10 Hacer\n    Escribir n, " x ", i, " = ", n * i\nFinPara', '', [7])),
      S('Bucles dentro de bucles', ['Un Para dentro de otro: por cada vuelta del de fuera, el de dentro hace todas las suyas.'],
        E('Para fila <- 1 Hasta 3 Hacer\n    linea <- ""\n    Para col <- 1 Hasta fila Hacer\n        linea <- linea + "*"\n    FinPara\n    Escribir linea\nFinPara'))
    ], [W('Para … <- … Hasta … Hacer', 'Repite contando desde un valor hasta otro.', 'Para i <- 1 Hasta 10 Hacer'), W('Con Paso', 'Cuánto suma la variable en cada vuelta.', 'Con Paso 2'), W('FinPara', 'Cierra el Para.', 'FinPara')],
    [X('Hace una vuelta de menos o de más', 'Confundiste el inicio o el final (0 o 1, < o <=).', 'Cuenta las vueltas a mano con un caso pequeño.'), X('Hacia atrás no entra nunca', 'Sin «Con Paso», el Para suma 1: si empieza por encima del final, no da ninguna vuelta. El Dojo te avisa cuando lo ve.', 'Para contar hacia atrás: Para i <- 5 Hasta 1 Con Paso -1 Hacer')], 'para'),

    C('arreglos', 'Arreglos (Dimension)', 'Guardar muchos datos en una sola variable y recorrerlos.', [
      S('Qué es un arreglo', ['Un arreglo es una fila de cajas con un solo nombre. Con Dimension dices cuántas cajas tiene. Cada caja se usa con su posición entre corchetes. En PSeInt, la primera posición es la 1.'],
        E('Dimension notas[3]\nnotas[1] <- 7\nnotas[2] <- 9\nnotas[3] <- 5\nEscribir notas[2]')),
      S('Recorrer con Para', ['Para leer, mostrar o sumar todas las posiciones se usa un Para de 1 hasta el tamaño.'],
        E('Dimension a[4]\nsuma <- 0\nPara i <- 1 Hasta 4 Hacer\n    Leer a[i]\n    suma <- suma + a[i]\nFinPara\nEscribir "Suma: ", suma', '', [3, 8, 1, 4])),
      S('Buscar el mayor', ['Se supone que el primero es el mayor y se compara con los demás.'],
        E('Dimension a[5]\nPara i <- 1 Hasta 5 Hacer\n    Leer a[i]\nFinPara\nmayor <- a[1]\nPara i <- 2 Hasta 5 Hacer\n    Si a[i] > mayor Entonces\n        mayor <- a[i]\n    FinSi\nFinPara\nEscribir "Mayor: ", mayor', '', [4, 9, 2, 7, 5])),
      S('Matrices (dos dimensiones)', ['Una matriz es una tabla: filas y columnas. Dimension m[2,3] crea 2 filas de 3 columnas, y m[fila, columna] es una casilla. Se recorre con un Para dentro de otro.'],
        E('Dimension m[2,3]\nPara f <- 1 Hasta 2 Hacer\n    Para c <- 1 Hasta 3 Hacer\n        m[f,c] <- f * c\n        Escribir m[f,c], " " Sin Saltar\n    FinPara\n    Escribir ""\nFinPara')),
      S('Para Cada', ['Para Cada x de a Hacer recorre todas las casillas del arreglo sin contar posiciones: en cada vuelta, x es una casilla. Si cambias x dentro, cambia la casilla. En una matriz recorre fila por fila.', 'Es cómodo para sumar o mostrar todo; cuando necesitas la posición (por ejemplo «la nota 3»), usa el Para de siempre.'],
        E('Dimension a[4]\na[1] <- 3\na[2] <- 8\na[3] <- 1\na[4] <- 4\nsuma <- 0\nPara Cada x de a Hacer\n    suma <- suma + x\nFinPara\nEscribir "Suma: ", suma'))
    ], [W('Dimension nombre[n]', 'Crea un arreglo de n posiciones.', 'Dimension edades[10]'), W('Dimension m[f,c]', 'Crea una matriz de f filas y c columnas.', 'Dimension tabla[3,4]'), W('Para Cada x de a Hacer', 'Recorre todas las casillas del arreglo; x es la casilla de cada vuelta.', 'Para Cada n de notas Hacer'), W('nombre[i]', 'La caja de la posición i (en PSeInt, de 1 a n).', 'edades[1] <- 20'), W('índice', 'El número de posición dentro del arreglo.', 'a[i]')],
    [X('«Índice fuera de rango»', 'Usaste una posición que no existe (0 o mayor que el tamaño).', 'En PSeInt las posiciones van de 1 a n.'), X('Se usa el arreglo sin Dimension', 'Hay que crearlo antes.', 'Pon Dimension al principio.')], 'arreglos'),

    C('funciones', 'Funciones y SubProcesos', 'Partir el algoritmo en funciones que reciben datos y devuelven resultados.', [
      S('Función que devuelve un valor', ['Una función es un algoritmo pequeño con nombre que puedes usar muchas veces. Se escribe FUERA del Algoritmo, antes. La variable de antes del <- es la que se devuelve.'],
        E('Funcion r <- doble(n)\n    r <- n * 2\nFinFuncion\n\nAlgoritmo principal\n    Escribir doble(5)\n    Escribir doble(21)\nFinAlgoritmo')),
      S('Parámetros', ['Los datos que recibe van entre paréntesis, separados por comas. Al llamarla, pones los valores en el mismo orden.'],
        E('Funcion m <- mayor(a, b)\n    Si a > b Entonces\n        m <- a\n    SiNo\n        m <- b\n    FinSi\nFinFuncion\n\nAlgoritmo principal\n    Escribir mayor(4, 9)\nFinAlgoritmo')),
      S('SubProceso (no devuelve nada)', ['Un SubProceso hace algo (por ejemplo, mostrar) pero no devuelve un valor.'],
        E('SubProceso saludar(nombre)\n    Escribir "Hola, ", nombre\nFinSubProceso\n\nAlgoritmo principal\n    saludar("Ana")\n    saludar("Leo")\nFinAlgoritmo'))
    ], [W('Funcion r <- nombre(parámetros)', 'Declara una función; r es lo que devuelve.', 'Funcion s <- suma(a, b)'), W('FinFuncion', 'Cierra la función.', 'FinFuncion'), W('SubProceso / FinSubProceso', 'Función que no devuelve valor.', 'SubProceso mostrar(x)'), W('parámetro', 'Dato que recibe la función.', 'doble(n): n es el parámetro'), W('llamar', 'Usar la función escribiendo su nombre y los valores.', 'Escribir doble(3)')],
    [X('La función no devuelve nada', 'No asignaste valor a la variable de retorno.', 'Dentro, haz r <- … antes de FinFuncion.'), X('La función está dentro del Algoritmo', 'Las funciones van fuera, antes del Algoritmo.', 'Muévela arriba.')], 'funciones'),

    C('texto', 'Trabajar con texto', 'Medir, cortar, unir y transformar textos.', [
      S('Longitud y Subcadena', ['Longitud(s) dice cuántos caracteres tiene. Subcadena(s, desde, hasta) saca un trozo (las posiciones empiezan en 1).'],
        E('s <- "programar"\nEscribir Longitud(s)\nEscribir Subcadena(s, 1, 3)')),
      S('Mayúsculas, minúsculas y unir', ['Mayusculas(s) y Minusculas(s) cambian las letras. Concatenar(a, b) une dos textos (también vale a + b).'],
        E('s <- "Hola"\nEscribir Mayusculas(s)\nEscribir Minusculas(s)\nEscribir Concatenar(s, " mundo")')),
      S('Recorrer letra a letra', ['Con un Para de 1 a Longitud(s) y Subcadena(s, i, i) obtienes cada letra.'],
        E('Leer s\nvocales <- 0\nPara i <- 1 Hasta Longitud(s) Hacer\n    l <- Subcadena(s, i, i)\n    Si l = "a" O l = "e" O l = "i" O l = "o" O l = "u" Entonces\n        vocales <- vocales + 1\n    FinSi\nFinPara\nEscribir "Vocales: ", vocales', '', ['murcielago'])),
      S('Números y textos', ['ConvertirANumero("7") pasa un texto a número; ConvertirATexto(7) hace lo contrario.'],
        E('Escribir ConvertirANumero("7") + 1\nEscribir ConvertirATexto(5) + "0"'))
    ], [W('Longitud(s)', 'Número de caracteres de un texto.', 'Longitud("hola") (da 4)'), W('Subcadena(s, i, j)', 'Trozo del texto de la posición i a la j.', 'Subcadena("hola", 2, 3) (da "ol")'), W('Mayusculas(s) / Minusculas(s)', 'Pasa a mayúsculas o minúsculas.', 'Mayusculas("hola")'), W('Concatenar(a, b)', 'Une dos textos.', 'Concatenar("ho", "la")'), W('ConvertirANumero / ConvertirATexto', 'Convierte entre texto y número.', 'ConvertirANumero("12")')],
    [X('Subcadena saca otra cosa', 'Las posiciones empiezan en 1, no en 0.', 'La primera letra es Subcadena(s, 1, 1).'), X('No coincide una comparación de letras', 'Mayúsculas y minúsculas son distintas: "A" no es "a".', 'Pasa todo a minúsculas antes de comparar.')], 'texto'),

    C('errores', 'Errores típicos y chuleta para el examen', 'Saber leer los errores de PSeInt y repasar todo de un vistazo.', [
      S('Cómo leer un error', ['PSeInt marca la línea y explica el problema. Ve a esa línea (y a la anterior: a veces el error empieza antes). Los más comunes: falta un FinSi/FinMientras/FinPara, comillas sin cerrar, variable sin valor y Entonces o Hacer olvidados.']),
      S('Antes de entregar', ['1) Cada bloque cerrado (Si/FinSi, Mientras/FinMientras, Para/FinPara). 2) Mensajes antes de cada Leer. 3) Variables declaradas con Definir. 4) Prueba el algoritmo a mano con un ejemplo pequeño: ¿da lo que debe?'])
    ], [], [X('Falta Entonces', 'Todo Si lleva Entonces.', 'Si x > 0 Entonces'), X('Falta Hacer', 'Mientras y Para llevan Hacer.', 'Mientras i <= 5 Hacer'), X('= en vez de <- al asignar', 'PSeInt acepta los dos, pero en la evaluación usa <-.', 'x <- 5')], null)
  ],
  chuleta: [['Mostrar', 'Escribir "texto", variable'], ['Pedir un dato', 'Leer variable'], ['Declarar', 'Definir x Como Entero'], ['Guardar un valor', 'x <- 5'], ['Decidir', 'Si cond Entonces … SiNo … FinSi'], ['Elegir entre casos', 'Segun x Hacer 1: … De Otro Modo: … FinSegun'], ['Repetir mientras', 'Mientras cond Hacer … FinMientras'], ['Repetir al menos una vez', 'Repetir … Hasta Que cond'], ['Repetir n veces', 'Para i <- 1 Hasta n Hacer … FinPara'], ['Contar hacia atrás', 'Para i <- n Hasta 1 Con Paso -1 Hacer … FinPara'], ['Arreglo', 'Dimension a[n]   (posiciones 1..n)  ·  m[f,c]'], ['Recorrer un arreglo', 'Para Cada x de a Hacer … FinPara'], ['Limpiar la pantalla', 'Borrar Pantalla   ·   Esperar Tecla'], ['Resto / parte entera', 'a MOD b   ·   TRUNC(a / b)'], ['Función', 'Funcion r <- nombre(p) … FinFuncion'], ['Texto', 'Longitud(s) · Subcadena(s, i, j) · Mayusculas(s)'], ['Comentario', '// nota']]
};

/* ═══════════════════════════ Python ═══════════════════════════ */
const py = {
  lang: 'py', nombre: 'Python',
  intro: 'Python es uno de los lenguajes más usados del mundo: en inteligencia artificial, ciencia de datos, automatizar tareas y la web. Se lee casi como inglés y no lleva llaves ni puntos y coma: los bloques se marcan con la sangría (los espacios al principio de la línea).',
  capitulos: [
    C('empezar', 'Qué es Python y tu primer programa', 'Escribir y ejecutar un programa en Python y entender la sangría.', [
      S('Tu primer programa', ['En Python no hace falta ninguna estructura alrededor: un programa puede ser una sola línea. print muestra lo que le pongas entre paréntesis.'],
        E('print("Hola, mundo")')),
      S('Cómo se ejecuta', ['En tu PC: instala Python (python.org), guarda el archivo como programa.py y ejecútalo con python programa.py, o con el botón ▶ de VS Code. En el Dojo: «Ejecutar».']),
      S('La sangría', ['Python usa la sangría para saber qué va dentro de un if, un bucle o una función: 4 espacios. Si la sangría está mal, el programa da error. Es la regla más importante de Python.'],
        E('edad = 20\nif edad >= 18:\n    print("dentro del if")\nprint("fuera del if")', 'La línea con 4 espacios pertenece al if.')),
      S('Comentarios', ['Un comentario empieza con #. Python lo ignora.'],
        E('# esto es un comentario\nprint("Hola")  # y esto también'))
    ], [W('print()', 'Muestra en pantalla.', 'print("Hola")'), W('#', 'Comentario.', '# calcula el total'), W('sangría', '4 espacios al principio de la línea: marcan lo que va dentro de un bloque.', '    print(x)'), W(':', 'Los dos puntos abren un bloque (if, for, while, def).', 'if x > 0:')],
    [X('IndentationError', 'La sangría está mal: faltan o sobran espacios.', 'Usa siempre 4 espacios dentro de cada bloque.'), X('SyntaxError', 'Algo mal escrito: un paréntesis o unas comillas sin cerrar, o faltan los dos puntos.', 'Mira la línea que marca y la anterior.')], 'salida'),

    C('mostrar', 'Mostrar en pantalla: print', 'Mostrar textos y valores, juntos o en líneas separadas.', [
      S('print', ['Cada print muestra una línea. Entre comillas va el texto; sin comillas, Python calcula.'],
        E('print("3 + 4")\nprint(3 + 4)')),
      S('Varias cosas con comas', ['Si separas con comas, print pone un espacio entre cada cosa.'],
        E('print("Tengo", 3, "gatos")')),
      S('end y sep', ['end="" cambia lo que se pone al final (por defecto, un salto de línea). sep cambia el separador entre las cosas.'],
        E('print("Hola ", end="")\nprint("Ana")\nprint(1, 2, 3, sep="-")')),
      S('f-strings', ['Una f delante de las comillas permite meter variables entre llaves dentro del texto. Es la forma más cómoda.'],
        E('nombre = "Ana"\nedad = 20\nprint(f"{nombre} tiene {edad} años")'))
    ], [W('print(…)', 'Muestra y baja de línea.', 'print("Total:", total)'), W('end=""', 'Que print no baje de línea.', 'print("a", end="")'), W('sep="…"', 'Separador entre las cosas.', 'print(a, b, sep=", ")'), W('f"…{x}…"', 'Texto con variables dentro (f-string).', 'f"Hola {nombre}"')],
    [X('NameError al mostrar', 'Escribiste un texto sin comillas y Python lo tomó como variable.', 'print("hola"), no print(hola).'), X('Sale la variable entre llaves', 'Olvidaste la f delante de las comillas.', 'f"{x}" en vez de "{x}".')], 'salida'),

    C('variables', 'Variables y tipos', 'Guardar datos y conocer los tipos int, float, str y bool.', [
      S('Variables', ['Una variable se crea al darle valor con =. No hace falta declararla antes. Si le das otro valor, el anterior se pierde.'],
        E('edad = 20\nedad = 21\nprint(edad)')),
      S('Tipos', ['int: enteros (7). float: con decimales (7.5). str: textos ("Ana"). bool: True o False. type(x) te dice el tipo.'],
        E('print(type(7), type(7.5), type("Ana"), type(True))')),
      S('Cambiar usando el valor anterior', ['x = x + 1, o su atajo x += 1. También existen -=, *=, /=.'],
        E('puntos = 10\npuntos += 5\nprint(puntos)')),
      S('Nombres', ['Letras, números y guion bajo; sin espacios; no pueden empezar por número. La costumbre en Python es minúsculas con guion bajo: precio_final.'])
    ], [W('=', 'Asignación: guarda un valor en una variable.', 'x = 5'), W('int / float / str / bool', 'Los tipos básicos: entero, decimal, texto y lógico.', 'n = 3  # int'), W('True / False', 'Los dos valores lógicos (con mayúscula).', 'listo = False'), W('type(x)', 'Dice el tipo de un valor.', 'type(3.5)'), W('+= -= *=', 'Atajos para cambiar una variable usando su valor.', 'total += precio')],
    [X('NameError: name … is not defined', 'Usaste una variable antes de crearla o la escribiste distinto.', 'Revisa el nombre exacto (mayúsculas incluidas).'), X('true con minúscula', 'En Python es True y False, con mayúscula.', 'listo = True')], 'variables'),

    C('operaciones', 'Operaciones', 'Calcular con +, -, *, /, //, %, ** y funciones como round o abs.', [
      S('Operadores', ['+ - * como siempre. / divide con decimales. // es la división entera. % es el resto. ** es la potencia. El orden: ** primero, luego * / // %, luego + -.'],
        E('print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 3)\nprint(2 + 3 * 4)')),
      S('Funciones útiles', ['round(x, n) redondea a n decimales; abs(x) es el valor absoluto; max y min dan el mayor y el menor.'],
        E('print(round(3.14159, 2))\nprint(abs(-5))\nprint(max(3, 9, 4), min(3, 9, 4))')),
      S('Texto y números', ['Con textos, + une y * repite. Pero no puedes sumar un texto con un número: hay que convertir con str().'],
        E('print("ja" * 3)\nprint("Tengo " + str(5) + " años")'))
    ], [W('/', 'División con decimales.', '7 / 2 (da 3.5)'), W('//', 'División entera.', '7 // 2 (da 3)'), W('%', 'Resto.', '17 % 5 (da 2)'), W('**', 'Potencia.', '2 ** 10'), W('round(x, n)', 'Redondea a n decimales.', 'round(2.567, 1)'), W('abs / max / min', 'Valor absoluto, mayor y menor.', 'max(a, b)'), W('str(x)', 'Convierte a texto.', 'str(5)')],
    [X('TypeError: can only concatenate str (not "int") to str', 'Intentaste sumar texto y número.', 'Convierte: "Edad: " + str(edad), o usa una f-string.'), X('Sale 3.0 en vez de 3', '/ siempre da float.', 'Usa // para división entera.')], 'operaciones'),

    C('leer', 'Pedir datos: input', 'Leer lo que escribe el usuario y convertirlo a número.', [
      S('input', ['input("mensaje") muestra el mensaje y espera a que el usuario escriba. SIEMPRE devuelve texto (str).'],
        E('nombre = input("¿Cómo te llamas? ")\nprint("Hola,", nombre)', '', ['Ana'])),
      S('Convertir a número', ['Para hacer cuentas, convierte: int(input()) para enteros y float(input()) para decimales.'],
        E('edad = int(input("Edad: "))\nprint("En 10 años tendrás", edad + 10)', '', [20])),
      S('Leer varios', ['Un input por dato, cada uno en su variable.'],
        E('a = int(input())\nb = int(input())\nprint("Suma:", a + b)', '', [4, 6]))
    ], [W('input("…")', 'Pide un dato; devuelve texto.', 'x = input("Dato: ")'), W('int(…)', 'Convierte a entero.', 'int("12")'), W('float(…)', 'Convierte a decimal.', 'float("2.5")')],
    [X('Suma "4" + "6" y sale 46', 'input devuelve texto: se unieron como textos.', 'Convierte con int(input()).'), X('ValueError: invalid literal for int()', 'El usuario escribió algo que no es un número.', 'Escribe un número, o usa float si lleva decimales.')], 'leer'),

    C('decisiones', 'Decisiones: if, elif, else', 'Elegir qué hacer con if, elif y else, y combinar condiciones.', [
      S('if y else', ['if condición: y debajo, con sangría, lo que se hace si se cumple. else: es el otro camino. Comparaciones: == igual, != distinto, <, >, <=, >=.'],
        E('n = int(input())\nif n % 2 == 0:\n    print("par")\nelse:\n    print("impar")', '', [7])),
      S('elif', ['elif («else if») encadena varias condiciones: se ejecuta solo la primera que se cumpla.'],
        E('nota = int(input())\nif nota >= 9:\n    print("sobresaliente")\nelif nota >= 5:\n    print("aprobado")\nelse:\n    print("suspendido")', '', [6])),
      S('and, or, not', ['and: las dos. or: alguna. not: lo contrario.'],
        E('edad = 15\nif edad >= 13 and edad <= 17:\n    print("adolescente")'))
    ], [W('if …:', 'Empieza una decisión.', 'if x > 0:'), W('elif …:', 'Otra condición si las anteriores no se cumplieron.', 'elif x == 0:'), W('else:', 'El camino si nada se cumplió.', 'else:'), W('== != < > <= >=', 'Comparaciones (== es comparar; = es asignar).', 'if a == b:'), W('and / or / not', 'Unir o invertir condiciones.', 'if a > 0 and b > 0:')],
    [X('SyntaxError en el if', 'Usaste = (asignar) en vez de == (comparar), o faltan los dos puntos.', 'if x == 5:'), X('IndentationError tras el if', 'Lo de dentro del if necesita 4 espacios.', 'Indenta el bloque.')], 'decisiones'),

    C('mientras', 'Repetir: while', 'Repetir mientras se cumpla una condición; contadores, acumuladores y break.', [
      S('while', ['Repite el bloque mientras la condición sea verdadera. Se comprueba antes de cada vuelta.'],
        E('i = 1\nwhile i <= 5:\n    print(i)\n    i += 1')),
      S('Contador y acumulador', ['Lee números hasta que escriban 0 y súmalos.'],
        E('suma = 0\nn = int(input())\nwhile n != 0:\n    suma += n\n    n = int(input())\nprint("Total:", suma)', '', [5, 3, 2, 0])),
      S('break y continue', ['break sale del bucle en el acto. continue salta a la siguiente vuelta. Un truco común: while True con un break dentro.'],
        E('while True:\n    n = int(input())\n    if n == 0:\n        break\n    print(n * 2)', '', [3, 5, 0]))
    ], [W('while …:', 'Repite mientras la condición sea verdadera.', 'while x < 10:'), W('break', 'Sale del bucle.', 'break'), W('continue', 'Pasa a la siguiente vuelta.', 'continue'), W('while True:', 'Bucle que solo termina con break.', 'while True:')],
    [X('El programa no termina', 'Bucle infinito: no cambias la variable de la condición.', 'Añade i += 1 (o lo que toque) dentro.'), X('El total sale mal', 'El acumulador empieza dentro del bucle.', 'Pon suma = 0 antes del while.')], 'mientras'),

    C('para', 'Repetir contando: for y range', 'Repetir un número de veces con for y range, y recorrer textos y listas.', [
      S('for con range', ['range(n) da los números de 0 a n-1. range(a, b) de a a b-1. range(a, b, paso) con saltos. ¡El final nunca se incluye!'],
        E('for i in range(1, 6):\n    print("Vuelta", i)')),
      S('Hacia atrás y de 2 en 2', ['Con un paso negativo cuentas hacia atrás.'],
        E('for i in range(10, -1, -2):\n    print(i)')),
      S('Recorrer un texto o una lista', ['for también recorre cada letra de un texto o cada elemento de una lista, sin range.'],
        E('for letra in "hola":\n    print(letra)')),
      S('Anidados', ['Un for dentro de otro.'],
        E('for fila in range(1, 4):\n    print("*" * fila)'))
    ], [W('for x in …:', 'Repite una vez por cada elemento.', 'for i in range(5):'), W('range(a, b, paso)', 'Números de a hasta b-1, saltando de paso en paso.', 'range(0, 10, 2)'), W('in', 'Recorre una secuencia (en for) o pregunta si algo está dentro.', '"a" in "casa"')],
    [X('Le falta la última vuelta', 'range no incluye el final.', 'Para llegar a n usa range(1, n + 1).'), X('No hace nada hacia atrás', 'range(5, 1) está vacío.', 'Usa paso negativo: range(5, 0, -1).')], 'para'),

    C('arreglos', 'Listas', 'Guardar muchos datos en una lista, recorrerla y usar sus métodos.', [
      S('Crear y usar', ['Una lista va entre corchetes. Las posiciones empiezan en 0. Con [-1] tomas el último.'],
        E('notas = [7, 9, 5]\nprint(notas[0])\nprint(notas[-1])\nprint(len(notas))')),
      S('Añadir y recorrer', ['append añade al final. Con for recorres todos los elementos.'],
        E('a = []\nfor i in range(4):\n    a.append(int(input()))\nprint("Suma:", sum(a))\nprint("Mayor:", max(a))', '', [3, 8, 1, 4])),
      S('Métodos y funciones útiles', ['sum, max, min, len, sorted (ordena), y métodos como append, remove o sort.'],
        E('a = [3, 1, 2]\na.append(9)\nprint(sorted(a))\nfor i, x in enumerate(a):\n    print(i, x)'))
    ], [W('[ … ]', 'Una lista.', 'colores = ["rojo", "azul"]'), W('lista[i]', 'El elemento en la posición i (desde 0).', 'colores[0]'), W('len(lista)', 'Cuántos elementos tiene.', 'len(colores)'), W('.append(x)', 'Añade x al final.', 'colores.append("verde")'), W('sum / max / min / sorted', 'Suma, mayor, menor y lista ordenada.', 'sorted(notas)'), W('enumerate', 'Recorre con la posición y el valor.', 'for i, x in enumerate(a):')],
    [X('IndexError: list index out of range', 'Pediste una posición que no existe.', 'Las posiciones van de 0 a len(a) - 1.'), X('Se salta el primero', 'Empezaste en 1 en vez de 0.', 'La primera posición es la 0.')], 'arreglos'),

    C('funciones', 'Funciones: def y return', 'Crear funciones con parámetros que devuelven resultados.', [
      S('def y return', ['def nombre(parámetros): define una función. return devuelve el resultado y termina la función.'],
        E('def doble(n):\n    return n * 2\n\nprint(doble(5))\nprint(doble(21))')),
      S('Varios parámetros y valores por defecto', ['Los parámetros van separados por comas; uno puede tener un valor por defecto.'],
        E('def saludo(nombre, saludo="Hola"):\n    return saludo + ", " + nombre\n\nprint(saludo("Ana"))\nprint(saludo("Leo", "Buenas"))')),
      S('return no es print', ['print solo muestra; return entrega el valor para usarlo después (sumarlo, guardarlo…). Una función sin return devuelve None.'],
        E('def area(b, h):\n    return b * h\n\ntotal = area(3, 4) + area(2, 5)\nprint(total)'))
    ], [W('def nombre(…):', 'Define una función.', 'def suma(a, b):'), W('return', 'Devuelve un valor y termina la función.', 'return a + b'), W('parámetro', 'Dato que recibe la función.', 'def f(x): x es el parámetro'), W('None', 'Lo que devuelve una función sin return.', 'print(f()) puede mostrar None')],
    [X('Sale None', 'La función usa print en vez de return.', 'Cambia print(x) por return x.'), X('NameError al llamar', 'Llamaste a la función antes de definirla.', 'Define la función arriba del todo.')], 'funciones'),

    C('texto', 'Trabajar con texto (str)', 'Medir, cortar, buscar y transformar textos.', [
      S('len y posiciones', ['len(s) da la longitud. s[0] es la primera letra; s[-1] la última. s[a:b] corta de a a b-1.'],
        E('s = "programar"\nprint(len(s))\nprint(s[0], s[-1])\nprint(s[0:3])\nprint(s[::-1])', 's[::-1] da el texto al revés.')),
      S('Métodos', ['upper, lower, replace, split, find, count… se escriben con punto detrás del texto.'],
        E('s = "Hola Mundo"\nprint(s.upper())\nprint(s.replace("o", "0"))\nprint(s.split())\nprint(s.count("o"))')),
      S('Recorrer letra a letra', ['Con for letra in s: recorres el texto letra por letra, sin necesidad de posiciones.'],
        E('s = input()\nvocales = 0\nfor l in s:\n    if l in "aeiou":\n        vocales += 1\nprint("Vocales:", vocales)', '', ['murcielago']))
    ], [W('len(s)', 'Longitud del texto.', 'len("hola")'), W('s[i] / s[a:b]', 'Una letra o un trozo (desde 0; el final no se incluye).', 's[1:3]'), W('.upper() / .lower()', 'Mayúsculas / minúsculas.', 's.upper()'), W('.replace(a, b)', 'Cambia a por b.', 's.replace(" ", "")'), W('.split()', 'Parte el texto en una lista de palabras.', '"a b".split()'), W('in', '¿Está dentro?', '"o" in s')],
    [X('TypeError: str object does not support item assignment', 'Los textos no se pueden cambiar letra a letra.', 'Crea un texto nuevo: s = s.replace(…).'), X('El corte no incluye la última letra', 's[a:b] llega hasta b-1.', 'Usa s[a:b+1].')], 'texto'),

    C('errores', 'Errores típicos y chuleta para el examen', 'Leer los errores de Python y repasar todo de un vistazo.', [
      S('Cómo leer un error', ['Python muestra «Traceback» y al final el tipo de error y la línea. Lo importante es la ÚLTIMA línea: NameError (nombre que no existe), TypeError (tipos que no encajan), IndentationError (sangría), SyntaxError (algo mal escrito), ValueError (valor que no se puede convertir), IndexError (posición que no existe).']),
      S('Antes de entregar', ['1) Sangría de 4 espacios en cada bloque. 2) Dos puntos al final de if, elif, else, for, while y def. 3) int() o float() en cada input que sea número. 4) == para comparar, = para asignar.'])
    ], [], [X('Olvidar los dos puntos', 'if, for, while, def y else terminan en :', 'if x > 0:'), X('Mezclar tabulador y espacios', 'Python se lía con la sangría.', 'Usa siempre 4 espacios.'), X('input sin convertir', 'input devuelve texto.', 'int(input())')], null)
  ],
  chuleta: [['Mostrar', 'print("texto", variable)  ·  print(f"{x}")'], ['Pedir un número', 'n = int(input("Mensaje: "))'], ['Guardar', 'x = 5   ·   x += 1'], ['Decidir', 'if …: / elif …: / else:'], ['Comparar', '==  !=  <  >  <=  >='], ['Unir condiciones', 'and  or  not'], ['Repetir mientras', 'while cond:'], ['Repetir n veces', 'for i in range(n):   (0 … n-1)'], ['Lista', 'a = [1, 2]  ·  a.append(3)  ·  a[0]  ·  len(a)'], ['División', '/ decimales  ·  // entera  ·  % resto  ·  ** potencia'], ['Función', 'def f(x):\n    return x * 2'], ['Texto', 'len(s) · s[0] · s[1:3] · s.upper() · s[::-1]'], ['Comentario', '# nota']]
};

/* ═══════════════════════════ C++ ═══════════════════════════ */
const cpp = {
  lang: 'cpp', nombre: 'C++',
  intro: 'C++ es un lenguaje rápido y potente: se usa en videojuegos, motores gráficos, sistemas y competiciones de programación. Es más estricto que Python: cada variable tiene un tipo que se declara, las instrucciones terminan en punto y coma y los bloques van entre llaves { }.',
  capitulos: [
    C('empezar', 'Qué es C++ y tu primer programa', 'Entender la estructura mínima de un programa en C++ y cómo se compila.', [
      S('La estructura mínima', ['Todo programa de C++ tiene esta forma. #include <iostream> trae las herramientas para mostrar y leer. using namespace std; te ahorra escribir std:: delante de cout. int main() { … } es donde empieza el programa. return 0; dice que terminó bien.'],
        E('#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hola, mundo" << endl;\n    return 0;\n}')),
      S('Cómo se ejecuta', ['C++ se COMPILA: un programa (el compilador, como g++) traduce tu código a un ejecutable, y luego lo ejecutas. En Code::Blocks o Dev-C++ es el botón «Compilar y ejecutar» (F9). En VS Code necesitas instalar un compilador. En el Dojo: «Ejecutar».', 'En los ejemplos de esta guía, a partir de ahora, verás solo lo de dentro de main: el Dojo pone el resto. En tu evaluación escribe siempre el programa completo.']),
      S('Punto y coma, llaves y comentarios', ['Cada instrucción termina en ;. Las llaves { } agrupan instrucciones en bloques. Los comentarios empiezan con // (una línea) o van entre /* y */ (varias).'],
        E('// comentario de una línea\ncout << "Uno" << endl; /* comentario */\ncout << "Dos" << endl;'))
    ], [W('#include <iostream>', 'Trae cout y cin (mostrar y leer).', '#include <iostream>'), W('using namespace std;', 'Permite escribir cout en vez de std::cout.', 'using namespace std;'), W('int main() { … }', 'La función principal: el programa empieza aquí.', 'int main() {'), W('return 0;', 'Termina main indicando que todo fue bien.', 'return 0;'), W(';', 'Fin de cada instrucción.', 'int x = 5;'), W('{ }', 'Abren y cierran un bloque.', 'if (x > 0) { … }'), W('// y /* */', 'Comentarios.', '// nota')],
    [X('expected \';\' before …', 'Falta un punto y coma en la línea anterior.', 'Termina cada instrucción con ;.'), X('cout was not declared', 'Falta #include <iostream> o using namespace std;.', 'Pon las dos líneas al principio.')], 'salida'),

    C('mostrar', 'Mostrar en pantalla: cout', 'Mostrar textos y valores con cout, << y endl.', [
      S('cout y <<', ['cout es la pantalla y << «manda» cosas hacia ella. Puedes encadenar varios <<. endl baja de línea.'],
        E('cout << "Primera línea" << endl;\ncout << "Segunda línea" << endl;')),
      S('Texto o cuenta', ['Entre comillas, texto literal; sin comillas, se calcula.'],
        E('cout << "3 + 4" << endl;\ncout << 3 + 4 << endl;')),
      S('Varias cosas en una línea', ['C++ no pone espacios: los pones tú dentro de las comillas. Sin endl, lo siguiente sigue en la misma línea.'],
        E('cout << "Tengo " << 3 << " gatos" << endl;\ncout << "Hola ";\ncout << "Ana" << endl;')),
      S('Decimales', ['Para fijar cuántos decimales se muestran: fixed y setprecision(n), con #include <iomanip>.'],
        E('#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    cout << fixed << setprecision(2) << 3.14159 << endl;\n    return 0;\n}'))
    ], [W('cout', 'La salida por pantalla.', 'cout << "Hola";'), W('<<', 'Manda un valor a cout.', 'cout << x << endl;'), W('endl', 'Salto de línea (también vale "\\n").', 'cout << "a" << endl;'), W('fixed << setprecision(n)', 'Muestra n decimales (necesita <iomanip>).', 'cout << fixed << setprecision(1) << x;')],
    [X('Sale todo pegado', 'C++ no pone espacios ni saltos solo.', 'Pon espacios en las comillas y endl al final.'), X('Error con las comillas', 'Las comillas simples son para un solo carácter.', 'Texto con comillas dobles: "hola".')], 'salida'),

    C('variables', 'Variables y tipos', 'Declarar variables con su tipo: int, double, string, bool, char.', [
      S('Declarar', ['En C++ cada variable se declara con su tipo antes de usarla: int (enteros), double (decimales), string (textos), bool (true/false), char (un solo carácter).'],
        E('int edad = 20;\ndouble altura = 1.65;\nstring nombre = "Ana";\nbool listo = true;\ncout << nombre << " tiene " << edad << " años y mide " << altura << endl;')),
      S('Cambiar el valor', ['= asigna. Los atajos += -= *= /= y ++ (sumar 1) y -- (restar 1) son muy usados.'],
        E('int puntos = 10;\npuntos += 5;\npuntos++;\ncout << puntos << endl;')),
      S('Varias del mismo tipo', ['Puedes declarar varias en una línea, separadas por comas.'],
        E('int a = 3, b = 4;\ncout << a + b << endl;'))
    ], [W('int', 'Tipo entero.', 'int n = 5;'), W('double', 'Tipo con decimales.', 'double precio = 9.99;'), W('string', 'Tipo texto.', 'string s = "hola";'), W('bool', 'Verdadero (true) o falso (false).', 'bool ok = false;'), W('char', 'Un solo carácter, entre comillas simples.', "char letra = 'a';"), W('++ / --', 'Suma o resta 1.', 'i++;'), W('+= -= *= /=', 'Atajos para cambiar una variable.', 'total += precio;')],
    [X('was not declared in this scope', 'Usaste una variable sin declararla (o fuera del bloque donde se declaró).', 'Declárala con su tipo antes: int x;'), X('Variable sin inicializar', 'Una variable declarada sin valor tiene basura.', 'Dale valor al declararla: int suma = 0;')], 'variables'),

    C('operaciones', 'Operaciones', 'Calcular, entender la división entera y usar <cmath>.', [
      S('Operadores', ['+ - * / y % (resto). ¡Cuidado! Entre dos int, / es división ENTERA: 7 / 2 da 3. Para decimales, al menos uno debe ser double: 7.0 / 2 da 3.5.'],
        E('cout << 7 / 2 << endl;\ncout << 7.0 / 2 << endl;\ncout << 7 % 2 << endl;\ncout << 2 + 3 * 4 << endl;')),
      S('Funciones matemáticas', ['Con #include <cmath>: sqrt (raíz), pow (potencia), abs (valor absoluto).'],
        E('#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    cout << sqrt(16) << " " << pow(2, 3) << " " << abs(-5) << endl;\n    return 0;\n}'))
    ], [W('/', 'División (entera si los dos son int).', '7 / 2 (da 3)'), W('%', 'Resto (solo con enteros).', '17 % 5 (da 2)'), W('sqrt / pow / abs', 'Raíz, potencia y valor absoluto (#include <cmath>).', 'pow(2, 10)'), W('static_cast<double>(x)', 'Convierte x a double para dividir con decimales.', 'static_cast<double>(a) / b')],
    [X('La media sale sin decimales', 'Dividiste dos int.', 'Usa double o static_cast<double>.'), X('pow o sqrt no se reconocen', 'Falta #include <cmath>.', 'Añádelo arriba.')], 'operaciones'),

    C('leer', 'Pedir datos: cin', 'Leer números y textos con cin y getline.', [
      S('cin y >>', ['cin es el teclado y >> guarda lo que escribe el usuario en la variable. La variable debe estar declarada con su tipo.'],
        E('int edad;\ncout << "Edad: ";\ncin >> edad;\ncout << "En 10 años tendrás " << edad + 10 << endl;', '', [20])),
      S('Varios datos', ['Puedes encadenar: cin >> a >> b;'],
        E('int a, b;\ncin >> a >> b;\ncout << "Suma: " << a + b << endl;', '', [4, 6])),
      S('Textos con espacios: getline', ['cin >> s lee solo hasta el primer espacio. Para una línea entera usa getline(cin, s).'],
        E('string nombre;\ngetline(cin, nombre);\ncout << "Hola, " << nombre << endl;', '', ['Ana María']))
    ], [W('cin', 'La entrada por teclado.', 'cin >> x;'), W('>>', 'Guarda lo leído en la variable.', 'cin >> a >> b;'), W('getline(cin, s)', 'Lee una línea entera (con espacios).', 'getline(cin, frase);')],
    [X('Solo lee la primera palabra', 'cin >> s se para en el espacio.', 'Usa getline(cin, s).'), X('Lee basura', 'El tipo de la variable no coincide con lo escrito.', 'int para enteros, double para decimales.')], 'leer'),

    C('decisiones', 'Decisiones: if, else, switch', 'Elegir con if, else if, else, operadores lógicos y switch.', [
      S('if y else', ['La condición va entre paréntesis y el bloque entre llaves. Comparaciones: == igual, != distinto, <, >, <=, >=.'],
        E('int n;\ncin >> n;\nif (n % 2 == 0) {\n    cout << "par" << endl;\n} else {\n    cout << "impar" << endl;\n}', '', [7])),
      S('else if', ['Encadena varias condiciones.'],
        E('int nota;\ncin >> nota;\nif (nota >= 9) {\n    cout << "sobresaliente" << endl;\n} else if (nota >= 5) {\n    cout << "aprobado" << endl;\n} else {\n    cout << "suspendido" << endl;\n}', '', [6])),
      S('&&, ||, !', ['&& es «y», || es «o», ! es «no».'],
        E('int edad = 15;\nif (edad >= 13 && edad <= 17) {\n    cout << "adolescente" << endl;\n}')),
      S('switch', ['Elige según el valor de un entero o un char. Cada case termina con break; default es para el resto.'],
        E('int opcion;\ncin >> opcion;\nswitch (opcion) {\n    case 1: cout << "Jugar" << endl; break;\n    case 2: cout << "Salir" << endl; break;\n    default: cout << "Opción no válida" << endl;\n}', '', [2]))
    ], [W('if (…) { }', 'Decisión.', 'if (x > 0) { … }'), W('else if / else', 'Otra condición / el resto.', '} else if (x == 0) {'), W('== != < > <= >=', 'Comparaciones.', 'if (a == b)'), W('&& || !', 'Y, o, no.', 'if (a > 0 && b > 0)'), W('switch / case / break / default', 'Elegir entre valores concretos.', 'switch (op) { case 1: …; break; }')],
    [X('Entra siempre en el if', 'Usaste = (asignar) en vez de == (comparar).', 'if (x == 5).'), X('En switch se ejecutan varios casos', 'Falta el break al final de cada case.', 'Termina cada case con break;.')], 'decisiones'),

    C('mientras', 'Repetir: while y do-while', 'Repetir con while y do-while; contadores y acumuladores.', [
      S('while', ['Repite mientras la condición sea verdadera; se comprueba antes de cada vuelta.'],
        E('int i = 1;\nwhile (i <= 5) {\n    cout << i << endl;\n    i++;\n}')),
      S('Acumular hasta un 0', ['Un ejemplo clásico de examen.'],
        E('int n, suma = 0;\ncin >> n;\nwhile (n != 0) {\n    suma += n;\n    cin >> n;\n}\ncout << "Total: " << suma << endl;', '', [5, 3, 2, 0])),
      S('do-while', ['Comprueba la condición al final: siempre hace al menos una vuelta. Lleva punto y coma tras el while.'],
        E('int i = 1;\ndo {\n    cout << i << endl;\n    i++;\n} while (i <= 3);'))
    ], [W('while (…) { }', 'Repite mientras se cumpla.', 'while (x < 10) { … }'), W('do { } while (…);', 'Repite al menos una vez.', 'do { … } while (n != 0);'), W('break / continue', 'Salir del bucle / saltar a la siguiente vuelta.', 'break;')],
    [X('No termina', 'La variable de la condición no cambia dentro.', 'Añade i++ (o lo que toque).'), X('Error tras do-while', 'Falta el ; después del while final.', '} while (cond);')], 'mientras'),

    C('para', 'Repetir contando: for', 'Repetir un número exacto de veces con for.', [
      S('for', ['for (inicio; condición; paso) { … }. Lo más común: for (int i = 1; i <= n; i++).'],
        E('for (int i = 1; i <= 5; i++) {\n    cout << "Vuelta " << i << endl;\n}')),
      S('Otros pasos', ['i += 2 para ir de 2 en 2; i-- para ir hacia atrás.'],
        E('for (int i = 10; i >= 0; i -= 2) {\n    cout << i << endl;\n}')),
      S('Tabla de multiplicar', ['Un clásico de evaluación.'],
        E('int n;\ncin >> n;\nfor (int i = 1; i <= 10; i++) {\n    cout << n << " x " << i << " = " << n * i << endl;\n}', '', [7])),
      S('Anidados', ['Un for dentro de otro.'],
        E('for (int fila = 1; fila <= 3; fila++) {\n    for (int col = 1; col <= fila; col++) {\n        cout << "*";\n    }\n    cout << endl;\n}'))
    ], [W('for (int i = a; i <= b; i++)', 'Repite desde a hasta b.', 'for (int i = 0; i < n; i++)'), W('i++ / i-- / i += 2', 'Cómo avanza la variable.', 'i += 2')],
    [X('Una vuelta de más o de menos', '< o <=, empezar en 0 o en 1.', 'Cuenta a mano con un caso pequeño.'), X('Bucle infinito hacia atrás', 'Usaste i++ cuando querías bajar.', 'i-- con i >= 0.')], 'para'),

    C('arreglos', 'Arreglos y vector', 'Guardar muchos datos con arreglos y con vector, y recorrerlos.', [
      S('Arreglos', ['int a[5]; crea 5 cajas de enteros. Las posiciones van de 0 a 4. El tamaño es fijo.'],
        E('int notas[3] = {7, 9, 5};\ncout << notas[0] << endl;\nint suma = 0;\nfor (int i = 0; i < 3; i++) {\n    suma += notas[i];\n}\ncout << "Suma: " << suma << endl;')),
      S('vector', ['vector (con #include <vector>) es como un arreglo que puede crecer: push_back añade al final y size() dice cuántos hay.'],
        E('#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> v;\n    for (int i = 0; i < 4; i++) {\n        int x;\n        cin >> x;\n        v.push_back(x);\n    }\n    int mayor = v[0];\n    for (int x : v) {\n        if (x > mayor) mayor = x;\n    }\n    cout << "Mayor: " << mayor << endl;\n    return 0;\n}', 'for (int x : v) recorre todos los elementos.', [3, 8, 1, 4]))
    ], [W('tipo nombre[n]', 'Arreglo de n elementos (posiciones 0 a n-1).', 'int a[10];'), W('vector<tipo>', 'Lista que crece (#include <vector>).', 'vector<int> v;'), W('.push_back(x)', 'Añade al final del vector.', 'v.push_back(5);'), W('.size()', 'Cuántos elementos tiene.', 'v.size()'), W('for (int x : v)', 'Recorre todos los elementos.', 'for (int x : v) cout << x;')],
    [X('Resultados raros o el programa se cae', 'Te saliste del arreglo (posición n o negativa).', 'Las posiciones van de 0 a n-1.'), X('vector no se reconoce', 'Falta #include <vector>.', 'Añádelo arriba.')], 'arreglos'),

    C('funciones', 'Funciones', 'Crear funciones con tipo de retorno, parámetros y void.', [
      S('Funciones que devuelven', ['Se escriben ANTES de main: tipo nombre(parámetros) { … return valor; }. El tipo dice qué devuelve.'],
        E('#include <iostream>\nusing namespace std;\n\nint doble(int n) {\n    return n * 2;\n}\n\nint main() {\n    cout << doble(5) << endl;\n    cout << doble(21) << endl;\n    return 0;\n}')),
      S('void', ['Una función void no devuelve nada; solo hace algo.'],
        E('#include <iostream>\nusing namespace std;\n\nvoid saludar(string nombre) {\n    cout << "Hola, " << nombre << endl;\n}\n\nint main() {\n    saludar("Ana");\n    saludar("Leo");\n    return 0;\n}')),
      S('Por referencia (&)', ['Normalmente la función recibe una COPIA. Con & recibe la variable original y puede cambiarla.'],
        E('#include <iostream>\nusing namespace std;\n\nvoid duplicar(int &x) {\n    x = x * 2;\n}\n\nint main() {\n    int n = 4;\n    duplicar(n);\n    cout << n << endl;\n    return 0;\n}'))
    ], [W('tipo nombre(parámetros)', 'Declara una función que devuelve ese tipo.', 'int suma(int a, int b)'), W('return', 'Devuelve el valor y termina la función.', 'return a + b;'), W('void', 'Función que no devuelve nada.', 'void mostrar(int x)'), W('&', 'Parámetro por referencia: cambia la variable original.', 'void f(int &x)')],
    [X('was not declared in this scope (al llamar)', 'La función está escrita después de main.', 'Escríbela antes de main.'), X('La variable no cambia tras llamar', 'Se pasó una copia.', 'Usa & en el parámetro.')], 'funciones'),

    C('texto', 'Trabajar con texto (string)', 'Medir, cortar, recorrer y transformar textos.', [
      S('length, [] y substr', ['s.length() da la longitud. s[i] es el carácter i (desde 0). s.substr(inicio, cantidad) saca un trozo.'],
        E('string s = "programar";\ncout << s.length() << endl;\ncout << s[0] << endl;\ncout << s.substr(0, 3) << endl;')),
      S('Unir y recorrer', ['+ une textos. Con un for recorres cada carácter.'],
        E('string s;\ncin >> s;\nint vocales = 0;\nfor (int i = 0; i < s.length(); i++) {\n    char l = s[i];\n    if (l == \'a\' || l == \'e\' || l == \'i\' || l == \'o\' || l == \'u\') vocales++;\n}\ncout << "Vocales: " << vocales << endl;', '', ['murcielago'])),
      S('Mayúsculas y al revés', ['toupper(c) pasa un carácter a mayúscula. Para darle la vuelta, recórrelo desde el final.'],
        E('string s = "hola", r = "";\nfor (int i = 0; i < s.length(); i++) s[i] = toupper(s[i]);\nfor (int i = s.length() - 1; i >= 0; i--) r += s[i];\ncout << s << " " << r << endl;'))
    ], [W('s.length()', 'Longitud del texto.', 's.length()'), W('s[i]', 'El carácter en la posición i (desde 0).', 's[0]'), W('s.substr(i, n)', 'Trozo de n caracteres desde i.', 's.substr(1, 2)'), W('+ / +=', 'Unir textos.', 's += "!";'), W('toupper / tolower', 'Mayúscula / minúscula de un carácter.', 'toupper(s[0])'), W("'a'", 'Un carácter va con comillas simples.', "if (c == 'a')")],
    [X('Comparar con "a" en vez de \'a\'', 's[i] es un char: se compara con comillas simples.', "s[i] == 'a'"), X('substr saca otra cosa', 'El segundo número es la CANTIDAD, no la posición final.', 's.substr(2, 3) = 3 caracteres desde la posición 2.')], 'texto'),

    C('errores', 'Errores típicos y chuleta para el examen', 'Leer los errores del compilador y repasar todo de un vistazo.', [
      S('Cómo leer un error', ['El compilador dice el archivo, la línea y el problema. Los más comunes: expected \';\' (falta punto y coma, normalmente en la línea anterior), was not declared in this scope (variable o función sin declarar), y llaves sin cerrar (el error aparece al final del archivo).']),
      S('Antes de entregar', ['1) #include y using namespace std; arriba. 2) ; al final de cada instrucción. 3) Llaves bien cerradas (indenta para verlo). 4) Variables declaradas con su tipo y con valor inicial. 5) == para comparar.'])
    ], [], [X('Olvidar return 0;', 'main debe terminar con return 0; (muchos profesores lo piden).', 'return 0; antes de la llave final.'), X('Dividir enteros esperando decimales', '7 / 2 es 3.', '7.0 / 2'), X('Llaves sin cerrar', 'El error sale al final y despista.', 'Indenta: cada { con su }.')], null)
  ],
  chuleta: [['Estructura', '#include <iostream>\nusing namespace std;\nint main() { … return 0; }'], ['Mostrar', 'cout << "texto" << x << endl;'], ['Pedir un dato', 'cin >> x;   ·   getline(cin, s);'], ['Declarar', 'int n = 0; double d; string s; bool b;'], ['Decidir', 'if (…) { … } else if (…) { … } else { … }'], ['Elegir entre casos', 'switch (x) { case 1: …; break; default: …; }'], ['Repetir mientras', 'while (cond) { … }   ·   do { … } while (cond);'], ['Repetir n veces', 'for (int i = 0; i < n; i++) { … }'], ['Arreglo / vector', 'int a[5];   ·   vector<int> v; v.push_back(x);'], ['División', '/ entera si los dos son int  ·  % resto'], ['Función', 'int f(int x) { return x * 2; }   (antes de main)'], ['Texto', 's.length() · s[i] · s.substr(i, n)'], ['Comentario', '// nota   ·   /* nota */']]
};

const guias = { ps, py, cpp };
const LANGS = ['ps', 'py', 'cpp'];
/* Para ejecutar un ejemplo: en C++, si no hay main, se completa (con los include que haga falta) */
function prepara(codigo, lang, D) { return lang === 'cpp' && !/\bmain\s*\(/.test(codigo) ? D.completo(codigo, 'cpp') : codigo; }
/* Todas las palabras de una guía, en orden alfabético, para el diccionario */
function diccionario(lang) {
  const g = guias[lang], out = [];
  g.capitulos.forEach(c => c.palabras.forEach(w => out.push(Object.assign({ capitulo: c.id, tituloCapitulo: c.titulo }, w))));
  return out.sort((a, b) => a.palabra.localeCompare(b.palabra, 'es'));
}
const Estudio = { guias, LANGS, prepara, diccionario };
if (typeof module !== 'undefined' && module.exports) module.exports = Estudio; else raiz.Estudio = Estudio;
})(typeof window !== 'undefined' ? window : globalThis);
