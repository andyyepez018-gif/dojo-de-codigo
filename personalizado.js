/* Dojo de código · Capítulos personalizados: capítulos hechos a partir del material de clase del alumno.
   El primero sigue, diapositiva a diapositiva, la presentación «Matrices y condicionales» (PSeInt):
   qué es una matriz, filas/columnas/índices, cómo se declara, cómo se recorre, condicionales, MOD,
   ejemplos cotidianos, la actividad (con su rúbrica de 5 puntos) y el cierre. Sin DOM: las pruebas
   ejecutan todos los ejemplos con el motor. No da ni quita puntos. */
(function (raiz) {
'use strict';
const E = (codigo, nota, entradas) => ({ codigo, nota: nota || '', entradas: (entradas || []).map(String) });
const X = (pasa, porque, arreglo) => ({ pasa, porque, arreglo });

const matrices = {
  id: 'matrices-condicionales', lang: 'ps',
  titulo: 'Matrices y condicionales',
  fuente: 'Hecho con la presentación de tu clase «Matrices y condicionales» (PSeInt) y el ejercicio que hizo tu profesor en la pizarra.',
  objetivo: 'Comprender cómo organizar datos en filas y columnas y tomar decisiones en un algoritmo.',
  metas: [
    ['Matrices', 'Organizar datos en filas y columnas.'],
    ['Recorrido', 'Usar dos ciclos Para para visitar cada posición.'],
    ['Condicionales', 'Tomar decisiones según una condición.'],
    ['Aplicación', 'Combinar matrices, ciclos y decisiones.']
  ],
  secciones: [
    { id: 'que-es', etiqueta: 'Concepto', t: '1. ¿Qué es una matriz?',
      p: ['Una matriz es una estructura de datos que guarda varios valores organizados en filas y columnas, como una tabla o una hoja de cálculo. Tiene un solo nombre, y cada casilla se encuentra por su fila y su columna.',
        'Sirve cuando los datos tienen dos «direcciones». Por ejemplo, las notas de varios estudiantes en varias materias (cada fila es un estudiante y cada columna una materia), o las ventas de varios productos en varios días.',
        'La de abajo es una matriz de 3 × 3: 3 filas por 3 columnas = 9 elementos. Toca una casilla para ver cómo se llama.'],
      visual: { tipo: 'matriz', nombre: 'm', valores: [[10, 20, 30], [40, 50, 60], [70, 80, 90]] },
      clave: 'Una variable guarda un dato; una matriz puede guardar muchos, ordenados en filas y columnas.',
      ejemplos: [E('Algoritmo MatrizDeEjemplo\n    Definir m, i, j, valor Como Entero\n    Dimension m[3,3]\n    valor <- 10\n    Para i <- 1 Hasta 3 Hacer\n        Para j <- 1 Hasta 3 Hacer\n            m[i,j] <- valor\n            valor <- valor + 10\n        FinPara\n    FinPara\n    Escribir "En la fila 2, columna 3 está el ", m[2,3]\n    Escribir "En la fila 3, columna 1 está el ", m[3,1]\n    Escribir "La matriz tiene ", 3 * 3, " casillas"\nFinAlgoritmo', 'Llena la matriz de 3 × 3 de la imagen (10, 20, … 90) y muestra dos casillas. No te preocupes aún por los Para: los verás en el punto 4.')],
      errores: [X('Creer que una matriz es «muchas variables»', 'Es una sola variable con muchas casillas: un solo nombre y dos números para llegar a cada casilla.', 'Piensa en una tabla: el nombre es la tabla, [fila, columna] es la casilla.')],
      claude: 'Explícame qué es una matriz en PSeInt con un ejemplo de la vida real distinto a las notas, y en qué se diferencia de una variable normal.' },

    { id: 'organiza', etiqueta: 'Filas, columnas e índices', t: '2. ¿Cómo se organiza?',
      p: ['Un vector (o arreglo) tiene una sola dimensión: una fila de casillas. Se escribe con un número: vector[i].',
        'Una matriz tiene dos dimensiones: filas y columnas. Se escribe con dos números separados por coma: matriz[i,j]. La i dice la fila y la j dice la columna.',
        'En PSeInt siempre va primero la fila y luego la columna, y las posiciones empiezan en 1. Por ejemplo, matriz[2,3] es la fila 2, columna 3.'],
      visual: { tipo: 'indices', filas: 2, columnas: 3, nombre: 'matriz' },
      clave: 'matriz[fila, columna]: primero la fila (i), después la columna (j). Se empieza a contar en 1.',
      ejemplos: [E('Algoritmo VectorYMatriz\n    Definir v, m Como Entero\n    Dimension v[3]\n    Dimension m[2,3]\n    v[2] <- 7\n    m[2,3] <- 9\n    m[1,2] <- 4\n    Escribir "Vector: la casilla 2 vale ", v[2]\n    Escribir "Matriz: fila 2, columna 3 vale ", m[2,3]\n    Escribir "Matriz: fila 1, columna 2 vale ", m[1,2]\nFinAlgoritmo', 'El vector necesita un número; la matriz, dos.')],
      errores: [X('«La posición 0 no existe»', 'En PSeInt las filas y las columnas empiezan en 1, no en 0.', 'En una matriz de 2 × 2 las posiciones válidas son [1,1], [1,2], [2,1] y [2,2].'),
        X('Confundir fila y columna', 'matriz[2,3] y matriz[3,2] son casillas distintas.', 'Lee siempre: primero fila, luego columna.'),
        X('«Índice fuera de rango»', 'Usaste una fila o columna mayor que el tamaño de la matriz.', 'Si es [2,2], ni la fila ni la columna pueden pasar de 2.')],
      claude: '¿Cómo sé qué número va primero en matriz[i,j]? Dame un truco para no confundir filas y columnas, con un ejemplo en PSeInt.' },

    { id: 'declarar', etiqueta: 'Declaración y tamaño', t: '3. ¿Cómo se declara una matriz?',
      p: ['Antes de usar una matriz hay que hacer dos cosas. Con Definir dices qué tipo de dato guardará cada casilla (Entero, Real, Caracter…). Con Dimension dices su tamaño: cuántas filas y cuántas columnas.',
        'Dimension numeros[2,2] crea una matriz de 2 filas y 2 columnas: cuatro posiciones. Las variables de los ciclos (i, j) también se definen, como Entero.',
        'Elige el tipo según los datos: números sin decimales → Entero; con decimales (como las notas 3.5) → Real; palabras → Caracter.'],
      clave: 'Consejo: antes de programar, identifica cuántas filas y columnas necesitas.',
      ejemplos: [E('Algoritmo Ejemplo\n    Definir numeros Como Entero\n    Definir i, j Como Entero\n    Dimension numeros[2,2]\n    numeros[1,1] <- 5\n    numeros[1,2] <- 8\n    numeros[2,1] <- 3\n    numeros[2,2] <- 6\n    Escribir "Fila 1: ", numeros[1,1], "  ", numeros[1,2]\n    Escribir "Fila 2: ", numeros[2,1], "  ", numeros[2,2]\nFinAlgoritmo', 'Es el ejemplo de la presentación, con las cuatro casillas llenas a mano.'),
        E('Algoritmo NotasConDecimales\n    Definir notas Como Real\n    Dimension notas[2,2]\n    notas[1,1] <- 3.5\n    notas[1,2] <- 4.8\n    notas[2,1] <- 2.9\n    notas[2,2] <- 5\n    Escribir "Primera nota: ", notas[1,1]\nFinAlgoritmo', 'Las notas tienen decimales: por eso la matriz es Real.')],
      errores: [X('Usar la matriz sin Dimension', 'Sin Dimension PSeInt no sabe cuántas casillas tiene.', 'Pon Dimension nombre[filas,columnas] antes de guardar nada.'),
        X('«Se esperaba un número entero» al leer 3.5', 'La matriz es Entero y le diste un número con decimales.', 'Si los datos tienen decimales, Definir notas Como Real.')],
      claude: '¿Por qué hacen falta Definir y Dimension, y qué pasa si me olvido de uno de los dos? Explícamelo con un ejemplo en PSeInt.' },

    { id: 'recorrer', etiqueta: 'Ciclos Para', t: '4. ¿Cómo recorremos una matriz?',
      p: ['Para visitar todas las casillas se usan dos ciclos Para, uno dentro del otro. El de fuera (i) controla las filas y el de dentro (j) recorre las columnas de cada fila.',
        'Por cada vuelta del Para de fuera, el de dentro hace todas las suyas. En una matriz de 2 × 2 el orden es: [1,1], [1,2], [2,1], [2,2]. Pulsa «Siguiente» abajo para verlo.',
        'Cada combinación de i y j es una posición. Dentro de los dos Para puedes leer, mostrar, sumar o comparar matriz[i,j].'],
      visual: { tipo: 'recorrido', filas: 2, columnas: 2, nombre: 'numeros' },
      clave: 'Ciclo de fuera = filas (i). Ciclo de dentro = columnas (j). Juntos visitan todas las casillas, fila por fila.',
      ejemplos: [E('Algoritmo OrdenDelRecorrido\n    Definir i, j Como Entero\n    Para i <- 1 Hasta 2 Hacer\n        Para j <- 1 Hasta 3 Hacer\n            Escribir "i = ", i, "   j = ", j\n        FinPara\n    FinPara\nFinAlgoritmo', 'Una matriz de 2 filas y 3 columnas: fíjate en que j da toda su vuelta antes de que i cambie.'),
        E('Algoritmo Recorrido\n    Definir numeros, i, j Como Entero\n    Dimension numeros[2,2]\n    Para i <- 1 Hasta 2 Hacer\n        Para j <- 1 Hasta 2 Hacer\n            Escribir "Fila ", i, ", columna ", j, ": ingrese un número"\n            Leer numeros[i,j]\n        FinPara\n    FinPara\n    Escribir "Lo que guardaste:"\n    Para i <- 1 Hasta 2 Hacer\n        Escribir numeros[i,1], "  ", numeros[i,2]\n    FinPara\nFinAlgoritmo', 'El de la presentación: lee las cuatro casillas y luego las muestra fila por fila. Pruébalo con «Ver paso a paso».', [4, 9, 2, 7])],
      errores: [X('Usar la misma variable en los dos Para', 'Si los dos usan i, el de dentro le cambia el valor al de fuera.', 'Uno con i (filas) y otro con j (columnas).'),
        X('Falta un FinPara', 'Cada Para se cierra con su FinPara; con dos Para hacen falta dos.', 'Sangra el código: cada FinPara queda alineado con su Para.'),
        X('El Hasta no coincide con el tamaño', 'Si la matriz es [2,2] y el Para llega Hasta 3, se sale de la matriz.', 'El Hasta de i es el número de filas; el de j, el de columnas.')],
      claude: '¿Por qué para recorrer una matriz hacen falta dos Para, uno dentro del otro? Explícame paso a paso qué valores toman i y j en una matriz de 2 × 2.' },

    { id: 'condicionales', etiqueta: 'Toma de decisiones', t: '5. ¿Qué son los condicionales?',
      p: ['Son estructuras que ejecutan unas instrucciones u otras según se cumpla o no una condición. La condición compara: = igual, <> distinto, <, >, <= menor o igual, >= mayor o igual.',
        'Simple: si se cumple, hace algo; si no, no hace nada. Doble: tiene dos caminos, uno con Entonces y otro con SiNo; siempre se ejecuta uno de los dos. Anidado: un condicional dentro de otro, para tres o más casos.',
        'El Entonces puede ir al final de la línea del Si o en la línea de abajo (como lo escribe tu profesor): PSeInt acepta las dos formas.'],
      clave: 'Simple = un camino. Doble = dos caminos (Entonces / SiNo). Anidado = un Si dentro de otro, para más casos.',
      ejemplos: [E('Algoritmo Simple\n    Definir nota Como Real\n    Leer nota\n    Si nota >= 3.0 Entonces\n        Escribir "Aprobado"\n    FinSi\nFinAlgoritmo', 'Simple: con una nota menor de 3.0 no muestra nada.', ['4.2']),
        E('Algoritmo Doble\n    Definir nota Como Real\n    Leer nota\n    Si nota >= 3.0 Entonces\n        Escribir "Aprobado"\n    SiNo\n        Escribir "Reprobado"\n    FinSi\nFinAlgoritmo', 'Doble: el ejemplo de la presentación. Cambia el dato y pruébalo con 2.5.', ['2.5']),
        E('Algoritmo Anidado\n    Definir nota Como Real\n    Leer nota\n    Si nota >= 4.5 Entonces\n        Escribir "Excelente"\n    SiNo\n        Si nota >= 3.0 Entonces\n            Escribir "Aprobado"\n        SiNo\n            Escribir "Reprobado"\n        FinSi\n    FinSi\nFinAlgoritmo', 'Anidado: tres casos. Cada Si tiene su propio FinSi.', ['3.8'])],
      errores: [X('Falta «Entonces» o «FinSi»', 'Todo Si lleva Entonces y se cierra con FinSi.', 'Si condición Entonces … FinSi'),
        X('Usar <- en la condición', '<- guarda un valor; para comparar se usa =.', 'Si x = 5 Entonces'),
        X('En el anidado sobra o falta un FinSi', 'Cada Si abre un bloque: dos Si, dos FinSi.', 'Cuenta los Si y los FinSi: tienen que ser los mismos.')],
      claude: 'Explícame la diferencia entre un condicional simple, uno doble y uno anidado en PSeInt, con un ejemplo de cada uno que no sea de notas.' },

    { id: 'mod', etiqueta: 'Aplicación', t: '6. Matrices + condicionales',
      p: ['Ahora se junta todo: recorres la matriz con dos Para y, en cada casilla, un condicional decide qué hacer con ese valor.',
        'MOD da el residuo (el resto) de una división entera. 8 MOD 2 = 0 porque 8 entre 2 da 4 y no sobra nada: es par. 7 MOD 2 = 1 porque sobra 1: es impar. Por eso, «si numero MOD 2 = 0, es par».',
        'El proceso de cada casilla siempre es el mismo: recorrer la matriz → leer un dato → evaluar la condición → mostrar el resultado. El primer ejemplo es el programa que hizo tu profesor en la pizarra, tal cual.'],
      clave: 'Proceso: recorrer → leer → evaluar → mostrar. Par: numero MOD 2 = 0. Impar: numero MOD 2 = 1.',
      ejemplos: [E('Algoritmo Ejercicio_3\n    Definir matriz como entero\n    Definir i,j Como entero\n    dimension matriz[2,2]\n    Para i <- 1 Hasta 2 Hacer\n        Para j <- 1 Hasta 2 Hacer\n            Escribir " Ingrese un numero : "\n            Leer matriz[i,j]\n            si matriz[i,j] MOD 2 = 0\n                Entonces\n                escribir matriz[i,j]," es par "\n            sino\n                Escribir matriz[i,j]," es impar "\n            FinSi\n        FinPara\n    FinPara\nFinAlgoritmo', 'El de la clase, escrito igual que en la pizarra (minúsculas y el Entonces abajo incluidos).', [4, 7, 10, 3]),
        E('Algoritmo ContarPares\n    Definir numeros, i, j, pares, impares Como Entero\n    Dimension numeros[2,2]\n    pares <- 0\n    impares <- 0\n    Para i <- 1 Hasta 2 Hacer\n        Para j <- 1 Hasta 2 Hacer\n            Leer numeros[i,j]\n            Si numeros[i,j] MOD 2 = 0 Entonces\n                pares <- pares + 1\n            SiNo\n                impares <- impares + 1\n            FinSi\n        FinPara\n    FinPara\n    Escribir "Pares: ", pares, "   Impares: ", impares\nFinAlgoritmo', 'Un paso más: dos contadores que empiezan en 0 y suman 1 cada vez que encuentran un par o un impar.', [6, 11, 8, 2])],
      errores: [X('Escribir MOD 2 == 0', 'En PSeInt se compara con un solo =.', 'Si n MOD 2 = 0 Entonces'),
        X('El contador sale mal', 'No lo pusiste en 0 antes de los Para, o lo reinicias dentro.', 'contador <- 0 antes de los ciclos, y contador <- contador + 1 dentro.')],
      claude: 'Explícame qué hace MOD con varios ejemplos de números, y por qué numero MOD 2 = 0 significa que es par. Después explícame línea por línea el programa del Ejercicio_3 de mi profesor.' },

    { id: 'cotidianos', etiqueta: 'Ejemplos cotidianos', t: '7. ¿Dónde se usa esta combinación?',
      p: ['Matrices + condicionales sirven para analizar datos de verdad: calificaciones (aprobados y reprobados), edades (clasificar por rangos), inventario (detectar cantidades bajas) y números (separar pares, impares y negativos).',
        'Los cuatro tienen la misma forma: una matriz con los datos, dos Para que la recorren y un Si (o varios anidados) que decide qué decir de cada dato. Los ejercicios 4 a 7 de abajo son justo estos casos.',
        'Pregunta de la clase: ¿qué otro problema de la vida real podrías resolver así? Piénsalo y cuéntaselo a Claude al final del capítulo.'],
      clave: 'Misma receta, distintos datos: matriz + dos Para + Si.',
      ejemplos: [E('Algoritmo Calificaciones\n    Definir notas Como Real\n    Definir i, j, aprobados Como Entero\n    Dimension notas[2,2]\n    aprobados <- 0\n    Para i <- 1 Hasta 2 Hacer\n        Para j <- 1 Hasta 2 Hacer\n            Leer notas[i,j]\n            Si notas[i,j] >= 3.0 Entonces\n                aprobados <- aprobados + 1\n            FinSi\n        FinPara\n    FinPara\n    Escribir "Aprobaron ", aprobados, " de 4"\nFinAlgoritmo', 'Cuenta cuántas notas aprueban (≥ 3.0).', ['4.5', '2.0', '3.0', '1.8'])],
      errores: [],
      claude: 'Dame dos ideas de problemas de la vida real que se resuelvan con una matriz y condicionales en PSeInt, y el algoritmo de una de ellas explicado.' }
  ],
  rubrica: [
    ['Declaración y dimensionamiento', 'Definir las variables (con el tipo correcto) y Dimension con el tamaño que pide el ejercicio.'],
    ['Uso correcto de ciclos', 'Dos Para, uno para las filas y otro dentro para las columnas, con el Hasta del tamaño correcto.'],
    ['Almacenamiento de datos', 'Cada dato se guarda en su casilla con Leer matriz[i,j].'],
    ['Uso correcto de condicionales', 'Si … SiNo … FinSi solo cuando el ejercicio pide decidir algo (y MOD para par o impar).'],
    ['Resultado y funcionamiento', 'El programa hace lo que pide el enunciado con cualquier dato.']
  ],
  ejercicios: ['mat-mostrar', 'mat-sumar', 'mat-pares', 'mat-notas', 'mat-edades', 'mat-inventario', 'mat-signos'],
  cierre: ['Una matriz organiza datos en filas y columnas.', 'i representa las filas y j las columnas.', 'Dos ciclos Para permiten recorrer una matriz.', 'Los condicionales permiten tomar decisiones.', 'Podemos combinar matrices y condicionales para analizar datos.'],
  sugerencias: ['¿Qué es i y qué es j?', '¿Por qué hacen falta dos Para?', 'Explícame MOD con ejemplos', 'Ponme un ejercicio nuevo de matrices', 'Revisa cómo lo estoy entendiendo']
};

const capitulos = [matrices];
/* Lo que sabe el profesor-Claude de este capítulo (para que explique con el mismo material de la clase) */
function contexto(c) {
  return `Capítulo «${c.titulo}» (${c.fuente}) Objetivo: ${c.objetivo}\n` +
    c.secciones.map(s => `${s.t}: ${s.p.join(' ')} Idea clave: ${s.clave}`).join('\n') +
    `\nRúbrica del profesor (1 punto cada una, total 5): ${c.rubrica.map(r => r[0] + ' (' + r[1] + ')').join('; ')}.\nLo esencial: ${c.cierre.join(' ')}`;
}
const Personalizado = { capitulos, porId: id => capitulos.find(c => c.id === id) || null, contexto };
if (typeof module !== 'undefined' && module.exports) module.exports = Personalizado; else raiz.Personalizado = Personalizado;
})(typeof window !== 'undefined' ? window : globalThis);
