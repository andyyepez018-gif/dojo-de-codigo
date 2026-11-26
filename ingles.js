/* Inglés para programar, desde cero: 12 unidades (A1 → B1 técnico) con vocabulario, frases, gramática
   mínima y una conversación guiada cada una. Incluye el generador de ejercicios y los comparadores
   (tolerantes con mayúsculas, signos y contracciones) que usa la app. No toca el DOM: se prueba en Node.
   «pr» es una pronunciación aproximada escrita como se leería en español; el audio real lo da la voz. */
(function (raiz) {
'use strict';
const P = (id, en, es, pr) => ({ id, en, es, pr });
const F = (id, en, es, alt) => ({ id, en, es, alt: alt || [] });
const T = (app, es, ejemplo, respuestas) => ({ app, es, ejemplo, respuestas });

const unidades = [
  { id: 'u1', nivel: 'A1', titulo: 'Hola, soy programador', tema: 'Saludar y presentarte',
    palabras: [P('hello', 'hello', 'hola', 'jelóu'), P('hi', 'hi', 'hola (informal)', 'jái'), P('name', 'name', 'nombre', 'néim'), P('i-am', 'I am', 'yo soy / yo estoy', 'ái am'),
      P('you', 'you', 'tú / usted', 'iú'), P('programmer', 'programmer', 'programador', 'próu-gramer'), P('developer', 'developer', 'desarrollador', 'divélo-per'), P('learn', 'learn', 'aprender', 'lern'),
      P('code', 'code', 'código', 'kóud'), P('thanks', 'thanks', 'gracias', 'zanks'), P('please', 'please', 'por favor', 'plíis'), P('every-day', 'every day', 'todos los días', 'évri déi')],
    frases: [F('f1', 'Hi, my name is Leo.', 'Hola, me llamo Leo.', ["Hi, I'm Leo.", 'Hello, my name is Leo.']), F('f2', 'I am a programmer.', 'Soy programador.', ["I'm a programmer."]),
      F('f3', 'I am learning Python.', 'Estoy aprendiendo Python.', ["I'm learning Python."]), F('f4', 'Nice to meet you.', 'Encantado de conocerte.'),
      F('f5', 'I write code every day.', 'Escribo código todos los días.'), F('f6', 'Thanks, see you tomorrow.', 'Gracias, hasta mañana.', ['Thank you, see you tomorrow.'])],
    gramatica: ['«I am» (o «I\'m») sirve para «soy» y para «estoy»: I am a programmer (soy programador), I am tired (estoy cansado).',
      'En inglés casi siempre se dice quién hace la acción: «I write code», nunca solo «write code» para hablar de ti.',
      '«I am learning» = estoy aprendiendo: verbo + ing para lo que pasa ahora.'],
    dialogo: [T("Hi! What's your name?", 'Di cómo te llamas.', 'My name is Leo.', ['my name is *', 'i am *', 'hi i am *', 'hello my name is *']),
      T('Nice to meet you. What do you do?', 'Di que eres programador o desarrollador.', 'I am a programmer.', ['i am a programmer', 'i am a developer', 'i am learning to program']),
      T('Cool! What are you learning?', 'Di qué lenguaje estás aprendiendo.', 'I am learning Python.', ['i am learning *']),
      T('Great. See you tomorrow!', 'Despídete.', 'Thanks, see you tomorrow.', ['see you tomorrow', 'thanks see you tomorrow', 'bye', 'see you', 'goodbye'])] },

  { id: 'u2', nivel: 'A1', titulo: 'Números y símbolos', tema: 'Leer código en voz alta',
    palabras: [P('number', 'number', 'número', 'námber'), P('zero', 'zero', 'cero', 'síirou'), P('equals', 'equals', 'es igual a', 'íicuals'), P('plus', 'plus', 'más (+)', 'plas'),
      P('minus', 'minus', 'menos (−)', 'máinus'), P('times', 'times', 'por (×)', 'táims'), P('parentheses', 'parentheses', 'paréntesis ( )', 'parénze-siis'), P('brackets', 'brackets', 'corchetes [ ]', 'brákets'),
      P('braces', 'braces', 'llaves { }', 'bréi-sis'), P('semicolon', 'semicolon', 'punto y coma ;', 'sémi-cóulon'), P('colon', 'colon', 'dos puntos :', 'cóulon'), P('quotes', 'quotes', 'comillas " "', 'kuóuts'),
      P('underscore', 'underscore', 'guion bajo _', 'ánder-scor'), P('dot', 'dot', 'punto .', 'dot')],
    frases: [F('f1', 'x equals five.', 'x es igual a cinco.', ['x equals 5.']), F('f2', 'Two plus two equals four.', 'Dos más dos es igual a cuatro.', ['2 plus 2 equals 4.']),
      F('f3', 'Close the parentheses.', 'Cierra los paréntesis.'), F('f4', 'Add a semicolon at the end.', 'Pon un punto y coma al final.'),
      F('f5', 'Ten minus three is seven.', 'Diez menos tres son siete.', ['10 minus 3 is 7.']), F('f6', 'Use quotes for text.', 'Usa comillas para el texto.')],
    gramatica: ['Los números: one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve… twenty, thirty, a hundred.',
      'Así se lee el código: x = 5 → «x equals five»; a[0] → «a, index zero»; f(x) → «f of x».',
      'C++ se dice «C plus plus». Python se dice «páizon».'],
    dialogo: [T('How do you read x = 10?', 'Léelo en inglés.', 'x equals ten.', ['x equals ten', 'x is ten']),
      T('What symbol ends a line in C plus plus?', 'Responde: un punto y coma.', 'A semicolon.', ['a semicolon', 'semicolon', 'the semicolon']),
      T('And what goes after if in Python?', 'Responde: dos puntos.', 'A colon.', ['a colon', 'colon', 'the colon']),
      T('What is two plus two?', 'Responde en inglés.', 'Two plus two equals four.', ['four', 'two plus two equals four', 'it is four'])] },

  { id: 'u3', nivel: 'A1', titulo: 'El teclado y la pantalla', tema: 'Seguir instrucciones',
    palabras: [P('key', 'key', 'tecla', 'kíi'), P('keyboard', 'keyboard', 'teclado', 'kíi-bord'), P('screen', 'screen', 'pantalla', 'scríin'), P('window', 'window', 'ventana', 'uín-dou'),
      P('button', 'button', 'botón', 'bá-ton'), P('click', 'click', 'hacer clic', 'klik'), P('type', 'type', 'escribir (en el teclado)', 'táip'), P('file', 'file', 'archivo', 'fáil'),
      P('folder', 'folder', 'carpeta', 'fóul-der'), P('open', 'open', 'abrir', 'óu-pen'), P('save', 'save', 'guardar', 'séiv'), P('close', 'close', 'cerrar', 'klóus'), P('paste', 'paste', 'pegar', 'péist')],
    frases: [F('f1', 'Click the button.', 'Haz clic en el botón.'), F('f2', 'Open the file.', 'Abre el archivo.'), F('f3', 'Save your work.', 'Guarda tu trabajo.'),
      F('f4', 'Copy and paste the code.', 'Copia y pega el código.'), F('f5', 'Press Enter.', 'Pulsa Enter.'), F('f6', 'The file is in the folder.', 'El archivo está en la carpeta.')],
    gramatica: ['Para dar instrucciones se usa el verbo solo, sin «you»: «Click», «Open», «Save». Así están escritos casi todos los tutoriales.',
      '«The» es «el, la, los, las»: the file (el archivo), the files (los archivos).',
      '«In» es «en, dentro de»: in the folder (en la carpeta).'],
    dialogo: [T('Where is the file?', 'Di que el archivo está en la carpeta.', 'The file is in the folder.', ['the file is in the folder', 'it is in the folder', 'in the folder']),
      T('OK. What do I do now?', 'Dile que haga clic en el botón.', 'Click the button.', ['click the button', 'click on the button']),
      T('Done. And then?', 'Dile que guarde el archivo.', 'Save the file.', ['save the file', 'save it', 'save your work'])] },

  { id: 'u4', nivel: 'A1', titulo: 'Las palabras del código', tema: 'Entender if, while, return…',
    palabras: [P('if', 'if', 'si (condición)', 'if'), P('else', 'else', 'si no', 'els'), P('while', 'while', 'mientras', 'uáil'), P('for', 'for', 'para (bucle)', 'for'),
      P('return', 'return', 'devolver', 'ritérn'), P('print', 'print', 'mostrar / imprimir', 'print'), P('input', 'input', 'entrada', 'ín-put'), P('output', 'output', 'salida', 'áut-put'),
      P('true', 'true', 'verdadero', 'trú'), P('false', 'false', 'falso', 'fóls'), P('loop', 'loop', 'bucle', 'lúup'), P('function', 'function', 'función', 'fánk-shon'),
      P('string', 'string', 'texto (cadena)', 'stríng'), P('greater-than', 'greater than', 'mayor que', 'gréi-ter dan')],
    frases: [F('f1', 'If x is greater than ten, print hello.', 'Si x es mayor que diez, muestra hello.', ['If x is greater than 10, print hello.']),
      F('f2', 'The loop runs five times.', 'El bucle da cinco vueltas.', ['The loop runs 5 times.']), F('f3', 'This function returns a number.', 'Esta función devuelve un número.'),
      F('f4', 'The variable is a string.', 'La variable es un texto.'), F('f5', 'This condition is true.', 'Esta condición es verdadera.'), F('f6', 'A loop repeats code.', 'Un bucle repite código.')],
    gramatica: ['Comparar: greater than (mayor que), less than (menor que), equal to (igual a). «x is greater than y» = x > y.',
      '«This» es «este, esta»: this function (esta función), this line (esta línea).',
      'Las palabras del código son inglés de verdad: while = mientras, return = devolver. Saber lo que significan ayuda a leer cualquier lenguaje.'],
    dialogo: [T('What does a loop do?', 'Responde: un bucle repite código.', 'A loop repeats code.', ['a loop repeats code', 'it repeats code', 'it repeats']),
      T('And what does return do?', 'Responde: devuelve un valor.', 'It returns a value.', ['it returns a value', 'returns a value', 'it returns something']),
      T('Is five greater than three?', 'Responde que sí.', 'Yes, it is.', ['yes it is', 'yes', 'yes five is greater than three'])] },

  { id: 'u5', nivel: 'A2', titulo: 'Verbos de programador', tema: 'Decir lo que necesitas hacer',
    palabras: [P('run', 'run', 'ejecutar', 'ran'), P('write', 'write', 'escribir', 'ráit'), P('read', 'read', 'leer', 'ríid'), P('fix', 'fix', 'arreglar', 'fiks'),
      P('test', 'test', 'probar', 'test'), P('build', 'build', 'construir / compilar', 'bild'), P('install', 'install', 'instalar', 'ins-tól'), P('delete', 'delete', 'borrar', 'dilíit'),
      P('change', 'change', 'cambiar', 'chéinch'), P('add', 'add', 'añadir', 'ad'), P('check', 'check', 'revisar', 'chek'), P('need-to', 'need to', 'necesitar', 'níid tu')],
    frases: [F('f1', 'Run the program.', 'Ejecuta el programa.'), F('f2', 'I need to fix this bug.', 'Necesito arreglar este fallo.'), F('f3', 'Install Python on your computer.', 'Instala Python en tu computadora.'),
      F('f4', 'Test your code.', 'Prueba tu código.'), F('f5', 'Add a new function.', 'Añade una función nueva.'), F('f6', 'I want to learn C++.', 'Quiero aprender C++.', ['I want to learn C plus plus.'])],
    gramatica: ['«I need to + verbo» = necesito…: I need to fix the bug (necesito arreglar el fallo).',
      '«I want to + verbo» = quiero…: I want to learn C++ (quiero aprender C++).',
      '«Bug» es un fallo en el programa; «to debug» es buscar y arreglar fallos.'],
    dialogo: [T('Does your program work?', 'Di que no, que necesitas arreglar un fallo.', 'No, I need to fix a bug.', ['no i need to fix a bug', 'i need to fix a bug', 'no it does not', 'i need to fix it']),
      T('What do you want to learn?', 'Di qué quieres aprender.', 'I want to learn Python.', ['i want to learn *']),
      T('OK. What is the first step?', 'Responde: instalar Python.', 'Install Python.', ['install python', 'first install python', 'i need to install python'])] },

  { id: 'u6', nivel: 'A2', titulo: 'Explicar qué hace el código', tema: 'Presente con -s',
    palabras: [P('does', 'does', 'hace (él/ella/eso)', 'das'), P('works', 'works', 'funciona', 'uerks'), P('returns', 'returns', 'devuelve', 'ritérns'), P('takes', 'takes', 'recibe / toma', 'téiks'),
      P('shows', 'shows', 'muestra', 'shóus'), P('stores', 'stores', 'guarda', 'stors'), P('calculates', 'calculates', 'calcula', 'kál-kiu-leits'), P('value', 'value', 'valor', 'vá-liu'),
      P('list', 'list', 'lista', 'list'), P('sum', 'sum', 'suma', 'sam'), P('result', 'result', 'resultado', 'risált'), P('line', 'line', 'línea', 'láin')],
    frases: [F('f1', 'This function takes two numbers.', 'Esta función recibe dos números.'), F('f2', 'It returns the sum.', 'Devuelve la suma.'), F('f3', 'The program shows the result.', 'El programa muestra el resultado.'),
      F('f4', 'This line checks the password.', 'Esta línea revisa la contraseña.'), F('f5', 'The list stores the names.', 'La lista guarda los nombres.'), F('f6', 'It works!', '¡Funciona!')],
    gramatica: ['Con he, she o it (él, ella, eso) el verbo lleva -s: «it returns», «the function takes».',
      'Para preguntar se usa «does»: «What does it do?» (¿qué hace?), «Does it work?» (¿funciona?).',
      'Respuestas cortas: «Yes, it does.» / «No, it doesn\'t.»'],
    dialogo: [T('What does this function do?', 'Di que devuelve la suma.', 'It returns the sum.', ['it returns the sum', 'returns the sum', 'it calculates the sum']),
      T('What does it take?', 'Di que recibe dos números.', 'It takes two numbers.', ['it takes two numbers', 'two numbers']),
      T('Does it work?', 'Di que sí, que funciona.', 'Yes, it works.', ['yes it works', 'yes it does', 'it works'])] }
];
unidades.push(
  { id: 'u7', nivel: 'A2', titulo: 'Errores en inglés', tema: 'Leer los mensajes de error',
    palabras: [P('error', 'error', 'error', 'é-rror'), P('warning', 'warning', 'aviso', 'uór-ning'), P('bug', 'bug', 'fallo (en el programa)', 'bag'), P('crash', 'crash', 'caerse / colgarse', 'krash'),
      P('missing', 'missing', 'falta', 'mí-sing'), P('expected', 'expected', 'se esperaba', 'iks-pék-tid'), P('undefined', 'undefined', 'no definido', 'andi-fáind'), P('not-found', 'not found', 'no encontrado', 'not fáund'),
      P('invalid', 'invalid', 'no válido', 'in-vá-lid'), P('syntax', 'syntax', 'sintaxis (cómo se escribe)', 'sín-taks'), P('index', 'index', 'índice / posición', 'ín-deks'), P('out-of-range', 'out of range', 'fuera de rango', 'áut of réinch')],
    frases: [F('f1', 'Syntax error: missing semicolon.', 'Error de sintaxis: falta un punto y coma.'), F('f2', 'Index out of range.', 'Posición fuera de rango.'),
      F('f3', 'Variable not defined.', 'Variable no definida.'), F('f4', 'File not found.', 'Archivo no encontrado.'), F('f5', 'Expected an integer.', 'Se esperaba un número entero.'),
      F('f6', 'The program crashed.', 'El programa se cayó.')],
    gramatica: ['Los mensajes de error casi no tienen verbos: «File not found» = (el) archivo (no fue) encontrado.',
      'Busca primero la palabra clave: not found (no existe), missing (falta), expected (se esperaba), invalid (no vale).',
      'Python pone el tipo de error al principio: NameError, IndexError, TypeError. C++ dice «error:» y la línea.'],
    dialogo: [T("What's wrong?", 'Di que tienes un error.', 'I have an error.', ['i have an error', 'i have a bug', 'there is an error']),
      T('What does it say?', 'Di que pone «archivo no encontrado».', 'It says file not found.', ['it says file not found', 'file not found', 'it says the file is not found']),
      T('OK, check the folder.', 'Da las gracias y di que lo revisarás.', 'Thanks, I will check it.', ['thanks i will check it', 'thank you i will check', 'ok thanks', 'thanks'])] },

  { id: 'u8', nivel: 'A2', titulo: 'Pedir ayuda', tema: 'Preguntar sin miedo',
    palabras: [P('help', 'help', 'ayuda / ayudar', 'jelp'), P('problem', 'problem', 'problema', 'pró-blem'), P('question', 'question', 'pregunta', 'kués-chon'), P('understand', 'understand', 'entender', 'ander-stánd'),
      P('doesnt-work', "doesn't work", 'no funciona', 'dá-sent uérk'), P('try', 'try', 'intentar / probar', 'trái'), P('mean', 'mean', 'significar', 'míin'), P('explain', 'explain', 'explicar', 'iks-pléin'),
      P('example', 'example', 'ejemplo', 'ig-sám-pol'), P('again', 'again', 'otra vez', 'e-guén'), P('show', 'show', 'mostrar / enseñar', 'shóu')],
    frases: [F('f1', 'Can you help me, please?', '¿Me puedes ayudar, por favor?'), F('f2', "My code doesn't work.", 'Mi código no funciona.', ['My code does not work.']),
      F('f3', "I don't understand this error.", 'No entiendo este error.', ['I do not understand this error.']), F('f4', 'What does this mean?', '¿Qué significa esto?'),
      F('f5', 'Can you explain it again?', '¿Me lo puedes explicar otra vez?'), F('f6', 'Can you show me an example?', '¿Me puedes enseñar un ejemplo?')],
    gramatica: ['Pedir algo con amabilidad: «Can you + verbo, please?» (¿Puedes…, por favor?).',
      'Negar: «I don\'t + verbo» (I don\'t understand) y con it: «it doesn\'t + verbo» (it doesn\'t work).',
      'Preguntar el significado: «What does X mean?» (¿Qué significa X?).'],
    dialogo: [T('Hi, how can I help you?', 'Di que tu código no funciona.', "My code doesn't work.", ['my code does not work', 'my code doesnt work', 'it does not work', 'i have a problem']),
      T("What's the problem?", 'Di que no entiendes este error.', "I don't understand this error.", ['i do not understand this error', 'i dont understand this error', 'i do not understand the error']),
      T('Let me see. Do you want an example?', 'Di que sí, por favor.', 'Yes, please.', ['yes please', 'yes', 'yes can you show me an example'])] },

  { id: 'u9', nivel: 'B1', titulo: 'Lo que hice', tema: 'El pasado y los commits',
    palabras: [P('fixed', 'fixed', 'arreglé / arreglado', 'fikst'), P('added', 'added', 'añadí', 'á-did'), P('changed', 'changed', 'cambié', 'chéinchd'), P('wrote', 'wrote', 'escribí', 'róut'),
      P('made', 'made', 'hice', 'méid'), P('tried', 'tried', 'intenté', 'tráid'), P('found', 'found', 'encontré', 'fáund'), P('finished', 'finished', 'terminé', 'fí-nisht'),
      P('started', 'started', 'empecé', 'stár-tid'), P('yesterday', 'yesterday', 'ayer', 'iés-ter-dei'), P('today', 'today', 'hoy', 'tu-déi'), P('commit', 'commit', 'guardar un cambio (git)', 'ko-mít')],
    frases: [F('f1', 'I fixed the bug yesterday.', 'Ayer arreglé el fallo.', ['Yesterday I fixed the bug.']), F('f2', 'I added a new feature.', 'Añadí una función nueva.'),
      F('f3', 'I changed the colors.', 'Cambié los colores.'), F('f4', 'I wrote the tests.', 'Escribí las pruebas.'), F('f5', 'I finished the first lesson.', 'Terminé la primera lección.'),
      F('f6', 'I found the problem.', 'Encontré el problema.')],
    gramatica: ['Pasado regular: verbo + ed (fix → fixed, add → added, change → changed).',
      'Irregulares que vas a usar mucho: write → wrote, make → made, find → found, do → did.',
      'Los mensajes de commit en inglés van en imperativo: «Fix login bug», «Add tests», «Update README».'],
    dialogo: [T('What did you do yesterday?', 'Di que arreglaste un fallo.', 'I fixed a bug.', ['i fixed a bug', 'i fixed the bug', 'yesterday i fixed a bug']),
      T('Anything else?', 'Di que añadiste una función nueva.', 'I added a new function.', ['i added a new function', 'i added a function', 'i added a new feature']),
      T('Did you test it?', 'Di que sí, que lo probaste.', 'Yes, I tested it.', ['yes i tested it', 'yes i did', 'yes'])] },

  { id: 'u10', nivel: 'B1', titulo: 'Planes', tema: 'El futuro: will y going to',
    palabras: [P('will', 'will', '(futuro) haré / lo haré', 'uil'), P('going-to', 'going to', 'voy a', 'góu-ing tu'), P('tomorrow', 'tomorrow', 'mañana', 'tu-mó-rou'), P('next', 'next', 'siguiente / después', 'nekst'),
      P('plan', 'plan', 'plan', 'plan'), P('soon', 'soon', 'pronto', 'súun'), P('later', 'later', 'más tarde', 'léi-ter'), P('finish', 'finish', 'terminar', 'fí-nish'),
      P('deploy', 'deploy', 'publicar (en un servidor)', 'di-plói'), P('release', 'release', 'versión / lanzar', 'ri-líis'), P('version', 'version', 'versión', 'vér-shon')],
    frases: [F('f1', 'I will finish it tomorrow.', 'Lo terminaré mañana.', ["I'll finish it tomorrow."]), F('f2', "I'm going to learn C++.", 'Voy a aprender C++.', ['I am going to learn C++.']),
      F('f3', 'Next, I need to test it.', 'Después, necesito probarlo.'), F('f4', 'We will release a new version soon.', 'Pronto sacaremos una versión nueva.'),
      F('f5', "I'll do it later.", 'Lo haré más tarde.', ['I will do it later.']), F('f6', 'We are going to deploy on Friday.', 'Vamos a publicar el viernes.')],
    gramatica: ['«I will + verbo» para decisiones y promesas: I will finish it tomorrow. «I\'ll» = I will.',
      '«I\'m going to + verbo» para planes: I\'m going to learn C++.',
      'Días: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.'],
    dialogo: [T('What are you going to do today?', 'Di que vas a escribir pruebas.', "I'm going to write tests.", ['i am going to write tests', 'i am going to write the tests', 'i will write tests']),
      T('When will you finish?', 'Di que terminarás mañana.', 'I will finish tomorrow.', ['i will finish tomorrow', 'tomorrow', 'i will finish it tomorrow']),
      T('Great. And next?', 'Di que después vas a aprender C++.', "Next, I'm going to learn C++.", ['next i am going to learn *', 'i am going to learn *', 'i will learn *'])] },

  { id: 'u11', nivel: 'B1', titulo: 'En el equipo', tema: 'La reunión diaria (stand-up)',
    palabras: [P('team', 'team', 'equipo', 'tíim'), P('meeting', 'meeting', 'reunión', 'míi-ting'), P('task', 'task', 'tarea', 'task'), P('blocked', 'blocked', 'bloqueado', 'blokt'),
      P('done', 'done', 'hecho / terminado', 'dan'), P('working-on', 'working on', 'trabajando en', 'uér-king on'), P('review', 'review', 'revisión / revisar', 'ri-viú'), P('deadline', 'deadline', 'fecha límite', 'déd-lain'),
      P('feature', 'feature', 'función nueva', 'fíi-cher'), P('issue', 'issue', 'incidencia / problema', 'í-shu')],
    frases: [F('f1', 'Yesterday I fixed two bugs.', 'Ayer arreglé dos fallos.', ['Yesterday I fixed 2 bugs.']), F('f2', "Today I'm working on the login page.", 'Hoy estoy trabajando en la página de acceso.', ['Today I am working on the login page.']),
      F('f3', "I'm blocked by an error.", 'Estoy bloqueado por un error.', ['I am blocked by an error.']), F('f4', 'The task is done.', 'La tarea está terminada.'),
      F('f5', 'Can you review my code?', '¿Puedes revisar mi código?'), F('f6', 'The deadline is on Friday.', 'La fecha límite es el viernes.')],
    gramatica: ['La reunión diaria tiene tres frases: «Yesterday I + pasado», «Today I\'m + verbo-ing», «I\'m blocked by… / No blockers».',
      '«Working on» = trabajando en: I\'m working on a new feature.',
      'Para pedir una revisión: «Can you review my code?» o «Can you take a look?».'],
    dialogo: [T('Good morning. What did you do yesterday?', 'Di que ayer arreglaste un fallo.', 'Yesterday I fixed a bug.', ['yesterday i fixed a bug', 'i fixed a bug', 'yesterday i fixed two bugs']),
      T('And today?', 'Di que hoy trabajas en una función nueva.', "Today I'm working on a new feature.", ['today i am working on a new feature', 'i am working on a new feature', 'today i am working on *']),
      T('Any blockers?', 'Di que no tienes bloqueos.', 'No blockers.', ['no blockers', 'no', 'i am blocked by *', 'no i am not blocked'])] },

  { id: 'u12', nivel: 'B1', titulo: 'Leer documentación', tema: 'Tutoriales y manuales',
    palabras: [P('documentation', 'documentation', 'documentación', 'dokiu-men-téi-shon'), P('parameter', 'parameter', 'parámetro', 'pa-rá-me-ter'), P('argument', 'argument', 'argumento', 'ár-guiu-ment'),
      P('default', 'default', 'por defecto', 'di-fólt'), P('optional', 'optional', 'opcional', 'óp-sho-nal'), P('required', 'required', 'obligatorio', 'ri-kuáierd'), P('command', 'command', 'comando / orden', 'ko-mánd'),
      P('step', 'step', 'paso', 'step'), P('note', 'note', 'nota', 'nóut'), P('library', 'library', 'librería (de código)', 'lái-bre-ri'), P('following', 'following', 'siguiente', 'fó-lou-ing')],
    frases: [F('f1', 'Run the following command.', 'Ejecuta el siguiente comando.'), F('f2', 'This parameter is optional.', 'Este parámetro es opcional.'),
      F('f3', 'The default value is zero.', 'El valor por defecto es cero.', ['The default value is 0.']), F('f4', 'Step one: install the library.', 'Paso uno: instala la librería.', ['Step 1: install the library.']),
      F('f5', 'Returns a list of strings.', 'Devuelve una lista de textos.'), F('f6', 'Note: you need version three or later.', 'Nota: necesitas la versión tres o posterior.', ['Note: you need version 3 or later.'])],
    gramatica: ['Los tutoriales usan imperativo: Run, Install, Click, Open.',
      'La documentación quita el sujeto: «Returns a list» = (esta función) devuelve una lista.',
      '«Library» en programación es una librería de código (aunque en inglés normal es «biblioteca»).'],
    dialogo: [T('How do I install it?', 'Dile que ejecute el siguiente comando.', 'Run the following command.', ['run the following command', 'run this command', 'run the command']),
      T('Is this parameter required?', 'Di que no, que es opcional.', 'No, it is optional.', ['no it is optional', 'it is optional', 'no']),
      T('What is the default value?', 'Di que el valor por defecto es cero.', 'The default value is zero.', ['the default value is zero', 'zero', 'it is zero'])] }
);
/* Rangos altos (B2): revisar código y la entrevista técnica, en inglés */
unidades.push(
  { id: 'u13', nivel: 'B2', titulo: 'Revisiones de código', tema: 'Sugerir, pedir cambios y aprobar con educación',
    palabras: [P('review', 'review', 'revisión / revisar', 'ri-viú'), P('suggest', 'suggest', 'sugerir', 'sa-yést'), P('approve', 'approve', 'aprobar', 'a-prúv'),
      P('request-changes', 'request changes', 'pedir cambios', 'ri-kuést chéin-yes'), P('readable', 'readable', 'legible', 'rí-da-bol'), P('naming', 'naming', 'los nombres (de variables y funciones)', 'néi-ming'),
      P('duplicate', 'duplicate', 'duplicado', 'diú-pli-keit'), P('edge-case', 'edge case', 'caso límite', 'ech kéis'), P('consistent', 'consistent', 'coherente', 'kon-sís-tent'),
      P('nitpick', 'nitpick', 'detalle menor', 'nít-pik'), P('lgtm', 'looks good to me', 'me parece bien (LGTM)', 'luks gud tu mi'), P('catch', 'good catch', 'bien visto', 'gud kach')],
    frases: [F('f1', 'Could you add a test for this?', '¿Podrías añadir una prueba para esto?', ['Can you add a test for this?']), F('f2', 'This name is not clear.', 'Este nombre no está claro.'),
      F('f3', 'I suggest moving this into a function.', 'Sugiero pasar esto a una función.'), F('f4', 'Good catch, I will fix it.', 'Bien visto, lo arreglo.', ["Good catch, I'll fix it."]),
      F('f5', 'What happens if the list is empty?', '¿Qué pasa si la lista está vacía?'), F('f6', 'Looks good to me, approved.', 'Me parece bien, aprobado.')],
    gramatica: ['Para sugerir con educación: «Could you…?», «I suggest…» o «What do you think about…?». Suena mucho mejor que una orden.',
      '«What happens if…?» sirve para preguntar por un caso límite sin acusar a nadie.',
      'LGTM («looks good to me») se escribe al aprobar una revisión; «nit:» delante marca un detalle menor.'],
    dialogo: [T('I left a comment on your pull request.', 'Da las gracias y di que lo miras ahora.', 'Thanks, I will check it now.', ['thanks i will check it now', 'thank you i will look at it now', 'thanks i will check it', 'i will check it now']),
      T('Your function is very long.', 'Sugiere dividirla en dos funciones.', 'I suggest splitting it into two functions.', ['i suggest splitting it into two functions', 'i will split it into two functions', 'i can split it into two functions']),
      T('What happens if the list is empty?', 'Di «bien visto» y que añadirás una prueba.', 'Good catch, I will add a test.', ['good catch i will add a test', 'good catch i will fix it', 'i will add a test']),
      T('Is it ready to merge?', 'Di que sí, que te parece bien y lo apruebas.', 'Yes, it looks good to me.', ['yes it looks good to me', 'looks good to me', 'yes i approve it'])] },

  { id: 'u14', nivel: 'B2', titulo: 'La entrevista técnica', tema: 'Hablar de ti, de tu experiencia y de cómo resuelves problemas',
    palabras: [P('experience', 'experience', 'experiencia', 'ex-pí-riens'), P('skills', 'skills', 'habilidades', 'skils'), P('strength', 'strength', 'punto fuerte', 'strengz'),
      P('weakness', 'weakness', 'punto débil', 'uík-nes'), P('project', 'project', 'proyecto', 'pró-yekt'), P('team', 'team', 'equipo', 'tiim'),
      P('solve', 'solve', 'resolver', 'solv'), P('approach', 'approach', 'enfoque / forma de abordarlo', 'a-próuch'), P('trade-off', 'trade-off', 'ventaja a cambio de otra cosa', 'tréid of'),
      P('salary', 'salary', 'sueldo', 'sá-la-ri'), P('remote', 'remote', 'en remoto', 'ri-móut'), P('hire', 'hire', 'contratar', 'jáier')],
    frases: [F('f1', 'I have been learning to program for one year.', 'Llevo un año aprendiendo a programar.', ['I have been learning to code for one year.', "I've been learning to program for one year."]),
      F('f2', 'My strength is that I never give up.', 'Mi punto fuerte es que nunca me rindo.'), F('f3', 'First, I would understand the problem.', 'Primero, entendería el problema.', ["First, I'd understand the problem."]),
      F('f4', 'I built a small game in Python.', 'Hice un juego pequeño en Python.'), F('f5', 'I do not know, but I would find out.', 'No lo sé, pero lo averiguaría.', ["I don't know, but I would find out.", "I don't know, but I'd find out."]),
      F('f6', 'Do you have any questions for us?', '¿Tienes alguna pregunta para nosotros?')],
    gramatica: ['«I have been learning…» (present perfect continuo) dice desde cuándo haces algo y que sigues haciéndolo.',
      '«I would…» (condicional) sirve para explicar cómo resolverías un problema: «First, I would…, then I would…».',
      'Decir «I do not know, but I would find out» es mejor que inventar: en una entrevista se valora la honestidad.'],
    dialogo: [T('Tell me about yourself.', 'Di tu nombre y cuánto tiempo llevas aprendiendo a programar.', 'I am Leo and I have been learning to program for one year.', ['i am * and i have been learning to program *', 'my name is * and i have been learning *', 'i have been learning to program for *']),
      T('Tell me about a project you built.', 'Di que hiciste un juego pequeño en Python.', 'I built a small game in Python.', ['i built a small game in python', 'i made a small game in python', 'i built a game in *']),
      T('How would you solve a problem you have never seen?', 'Di que primero entenderías el problema y luego lo dividirías en pasos.', 'First, I would understand the problem and then split it into steps.', ['first i would understand the problem and then split it into steps', 'first i would understand the problem', 'i would split it into steps']),
      T('Do you have any questions for us?', 'Pregunta si el trabajo es en remoto.', 'Yes, is the job remote?', ['yes is the job remote', 'is the job remote', 'is it remote'])] }
);
const errores = [
  ["NameError: name 'total' is not defined", 'La variable total no existe (no tiene valor todavía)'],
  ['IndexError: list index out of range', 'La posición pedida no existe en la lista'],
  ['SyntaxError: invalid syntax', 'Algo está mal escrito en esa línea'],
  ["error: expected ';' before 'cout'", 'Falta un punto y coma antes de cout'],
  ['TypeError: can only concatenate str (not "int") to str', 'No se puede sumar un texto con un número'],
  ['ZeroDivisionError: division by zero', 'Se está dividiendo entre cero'],
  ["FileNotFoundError: No such file or directory: 'datos.txt'", 'El archivo datos.txt no existe'],
  ["ValueError: invalid literal for int() with base 10: 'hola'", 'int() no puede convertir «hola» en un número'],
  ['IndentationError: expected an indented block', 'Falta la sangría (los espacios) dentro del bloque'],
  ["error: 'x' was not declared in this scope", 'La variable x no está declarada en esa parte del programa']
];

/* ───────────── Comparar inglés con tolerancia ───────────── */
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const CONTRACCIONES = [[/\bi'm\b/g, 'i am'], [/\bit's\b/g, 'it is'], [/\bwhat's\b/g, 'what is'], [/\bthat's\b/g, 'that is'], [/\bthere's\b/g, 'there is'], [/\bdon't\b/g, 'do not'], [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'], [/\bcan't\b/g, 'cannot'], [/\bwon't\b/g, 'will not'], [/\bisn't\b/g, 'is not'], [/\baren't\b/g, 'are not'], [/\bi'll\b/g, 'i will'], [/\bwe'll\b/g, 'we will'],
  [/\byou'll\b/g, 'you will'], [/\byou're\b/g, 'you are'], [/\bwe're\b/g, 'we are'], [/\bthey're\b/g, 'they are'], [/\blet's\b/g, 'let us'], [/\bi've\b/g, 'i have']];
const SIN_APOSTROFO = [[/\bim\b/g, 'i am'], [/\bdont\b/g, 'do not'], [/\bdoesnt\b/g, 'does not'], [/\bdidnt\b/g, 'did not'], [/\bcant\b/g, 'cannot'], [/\bisnt\b/g, 'is not'], [/\bwont\b/g, 'will not'], [/\bcan not\b/g, 'cannot']];
function normalizaEn(s) {
  let t = String(s || '').toLowerCase().replace(/[’‘`´]/g, "'");
  t = t.replace(/c\s*\+\s*\+/g, ' c plus plus ').replace(/\bcpp\b/g, ' c plus plus ').replace(/\bc plus\b(?! plus)/g, 'c plus plus');
  for (const [a, b] of CONTRACCIONES) t = t.replace(a, b);
  t = t.replace(/\b(\d{1,2})\b/g, (m, n) => (+n <= 20 ? NUM[+n] : m));
  t = t.replace(/[^a-z0-9' ]+/g, ' ').replace(/'/g, '').replace(/\s+/g, ' ').trim();
  for (const [a, b] of SIN_APOSTROFO) t = t.replace(a, b);
  return t;
}
const palabrasEn = s => normalizaEn(s).split(' ').filter(Boolean);
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
const parecidas = (x, y) => x === y || (x.length >= 5 && y.length >= 5 && lev(x, y) <= 1);
/* Qué palabras del objetivo aparecen, en orden, en lo dicho (subsecuencia común más larga) */
function alinea(dichas, objetivo) {
  const n = dichas.length, m = objetivo.length, dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = parecidas(dichas[i - 1], objetivo[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const ok = new Array(m).fill(false); let i = n, j = m;
  while (i > 0 && j > 0) { if (parecidas(dichas[i - 1], objetivo[j - 1])) { ok[j - 1] = true; i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
  return ok;
}
/* Texto escrito: exacto, o «casi» (una palabra de más o de menos, o una errata pequeña) */
function comparaTexto(escrito, objetivo, alt = []) {
  const e = normalizaEn(escrito); if (!e) return { ok: false };
  const cands = [objetivo, ...alt];
  for (const c of cands) if (normalizaEn(c) === e) return { ok: true, exacto: true };
  for (const c of cands) {
    const n = normalizaEn(c), pw = n.split(' ');
    if ((pw.length >= 4 && lev(e.split(' '), pw) <= 1) || lev(e, n) <= Math.max(1, Math.floor(n.length * 0.06))) return { ok: true, exacto: false, correcta: c };
  }
  return { ok: false };
}
/* Hablar: nota de 0 a 1 y qué palabras de la frase se entendieron (con la mejor alternativa oída) */
function puntuaHabla(alternativas, objetivo) {
  const tokens = String(objetivo).split(/\s+/).filter(Boolean);
  const porToken = tokens.map(t => palabrasEn(t));
  const plano = porToken.flat();
  let mejor = { score: 0, oido: '', ok: new Array(plano.length).fill(false) };
  for (const alt of [].concat(alternativas || [])) {
    const ok = alinea(palabrasEn(alt), plano), score = plano.length ? ok.filter(Boolean).length / plano.length : 0;
    if (score > mejor.score || !mejor.oido) mejor = { score, oido: alt, ok };
  }
  let k = 0;
  const palabras = tokens.map((t, i) => { const n = porToken[i].length; const bien = n === 0 || mejor.ok.slice(k, k + n).every(Boolean); k += n; return { w: t, ok: bien }; });
  return { score: mejor.score, oido: mejor.oido, palabras };
}
/* Conversación: ¿la respuesta encaja con alguno de los patrones? («*» = cualquier cosa) */
function puntuaRespuesta(alternativas, patrones) {
  let mejor = { score: 0, oido: '' };
  for (const alt of [].concat(alternativas || [])) {
    const dichas = palabrasEn(alt);
    for (const p of patrones) {
      const pw = p.split(' ').filter(w => w !== '*'), comodin = p.includes('*');
      if (!pw.length) continue;
      let score = alinea(dichas, pw).filter(Boolean).length / pw.length;
      if (comodin && dichas.length <= pw.length) score *= 0.85;   // con comodín hace falta decir algo más (p. ej. el nombre)
      if (!comodin && dichas.length > pw.length + 3) score *= 0.9;
      if (score > mejor.score) mejor = { score, oido: alt, patron: p };
    }
  }
  return mejor;
}

/* ───────────── Generador de ejercicios ───────────── */
function rng(semilla) {
  let a = semilla >>> 0;
  const f = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = { f, int: (x, y) => x + Math.floor(f() * (y - x + 1)), pick: arr => arr[Math.floor(f() * arr.length)],
    shuffle: arr => { const c = arr.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; } };
  return r;
}
const porId = {}; unidades.forEach((u, k) => { u.n = k + 1; porId[u.id] = u; });
const TIPOS = ['significado', 'palabra', 'escucha', 'ordenar', 'hueco', 'traducir', 'dictado', 'habla', 'error'];
const NOMBRE_TIPO = { significado: '¿Qué significa?', palabra: '¿Cómo se dice?', escucha: 'Escucha', ordenar: 'Ordena la frase', hueco: 'Completa la frase', traducir: 'Tradúcelo', dictado: 'Dictado', habla: 'Habla', error: 'Lee el error' };
const PROPIOS = /^(I|Python|PSeInt|Leo|Enter|Friday|Monday|C\+\+|README)$/;
const DE_PALABRA = ['significado', 'palabra'], DE_FRASE = ['escucha', 'ordenar', 'hueco', 'traducir', 'dictado', 'habla'];
const items = u => [...u.palabras.map(p => ({ clave: u.id + ':' + p.id, tipo: 'palabra', x: p })), ...u.frases.map(f => ({ clave: u.id + ':' + f.id, tipo: 'frase', x: f }))];
function itemPorClave(clave) { const [uid, id] = String(clave).split(':'); const u = porId[uid]; if (!u) return null; const p = u.palabras.find(x => x.id === id); if (p) return { u, tipo: 'palabra', x: p }; const f = u.frases.find(x => x.id === id); return f ? { u, tipo: 'frase', x: f } : null; }
function distintas(r, correcta, pool, n, clave = x => x) {
  const vistos = new Set([clave(correcta)]), out = [];
  for (const x of r.shuffle(pool)) { const k = clave(x); if (vistos.has(k)) continue; vistos.add(k); out.push(x); if (out.length === n) break; }
  return out;
}
function generar(spec, voz = { sale: true, entra: true }) {
  const r = rng(spec.seed >>> 0 || 1);
  const u = porId[spec.unidad] || unidades[0], hasta = unidades.slice(0, u.n);
  let tipo = TIPOS.includes(spec.tipo) ? spec.tipo : 'significado';
  if (tipo === 'error' && u.n < 7) tipo = 'traducir';
  if ((tipo === 'escucha' || tipo === 'dictado') && !voz.sale) tipo = r.pick(['traducir', 'ordenar']);
  if (tipo === 'habla' && !voz.entra) tipo = 'ordenar';
  let it = spec.item ? itemPorClave(spec.item) : null;
  if (it && it.tipo === 'palabra' && !DE_PALABRA.includes(tipo)) tipo = r.pick(voz.sale ? ['significado', 'palabra', 'escucha'] : DE_PALABRA);
  if (it && it.tipo === 'frase' && DE_PALABRA.includes(tipo)) tipo = r.pick(['ordenar', 'hueco', 'traducir']);
  if (tipo === 'error') { const [en, es] = r.pick(errores); const ops = r.shuffle([es, ...distintas(r, es, errores.map(e => e[1]), 3)]); return { tipo, unidad: u.id, item: 'u7:error', mensaje: en, opciones: ops, correcta: ops.indexOf(es) }; }
  const palabrasPool = hasta.flatMap(x => x.palabras), frasesPool = hasta.flatMap(x => x.frases);
  if (DE_PALABRA.includes(tipo) || (tipo === 'escucha' && it && it.tipo === 'palabra')) {
    const p = it && it.tipo === 'palabra' ? it.x : r.pick(u.palabras); const item = u.id + ':' + p.id;
    const cercanas = [...u.palabras, ...palabrasPool];
    if (tipo === 'significado') { const ops = r.shuffle([p.es, ...distintas(r, p.es, cercanas.map(x => x.es), 3)]); return { tipo, unidad: u.id, item, en: p.en, pr: p.pr, opciones: ops, correcta: ops.indexOf(p.es) }; }
    const ops = r.shuffle([p.en, ...distintas(r, p.en, cercanas.map(x => x.en), 3)]);
    return { tipo, unidad: u.id, item, es: p.es, en: p.en, pr: p.pr, audio: tipo === 'escucha' ? p.en : null, opciones: ops, correcta: ops.indexOf(p.en) };
  }
  const f = it && it.tipo === 'frase' ? it.x : r.pick(u.frases); const item = u.id + ':' + f.id;
  const base = { tipo, unidad: u.id, item, en: f.en, es: f.es, alt: f.alt };
  if (tipo === 'escucha') { const ops = r.shuffle([f.en, ...distintas(r, f.en, [...u.frases, ...frasesPool].map(x => x.en), 3)]); return Object.assign(base, { audio: f.en, opciones: ops, correcta: ops.indexOf(f.en) }); }
  if (tipo === 'dictado') return Object.assign(base, { audio: f.en });
  if (tipo === 'traducir' || tipo === 'habla') return base;
  const fichas = f.en.replace(/[.!?]$/, '').split(/\s+/);
  if (tipo === 'ordenar') {
    // en minúscula (salvo «I» y nombres propios) para que la mayúscula no delate la primera ficha
    const baja = w => (PROPIOS.test(w.replace(/[.,!?:]/g, '')) ? w : w.toLowerCase());
    const piezas = fichas.map(baja);
    const extra = distintas(r, null, frasesPool.flatMap(x => x.en.replace(/[.!?,:]/g, '').split(/\s+/)).map(baja).filter(w => !piezas.map(x => x.toLowerCase().replace(/[.,!?:]/g, '')).includes(w.toLowerCase())), 2);
    let orden = r.shuffle([...piezas, ...extra]);
    for (let k = 0; k < 4 && orden.slice(0, piezas.length).join(' ') === piezas.join(' '); k++) orden = r.shuffle(orden);
    return Object.assign(base, { fichas: orden, sobran: extra.length });
  }
  // hueco: se quita una palabra con contenido (no «a», «the», «is»…)
  const vacias = new Set(['a', 'an', 'the', 'is', 'to', 'of', 'in', 'on', 'at', 'it', 'i', 'my', 'and', 'or', 'are', 'am', 'for', 'you', 'your', 'this', 'by']);
  const cands = fichas.map((w, i) => ({ w: w.replace(/[.,!?:]$/, ''), i })).filter(x => x.w.length >= 3 && !vacias.has(x.w.toLowerCase()));
  const elegido = cands.length ? r.pick(cands) : { w: fichas[0], i: 0 };
  const pool = [...u.palabras.map(p => p.en), ...palabrasPool.map(p => p.en)].filter(w => !w.includes(' ') && w.toLowerCase() !== elegido.w.toLowerCase());
  const ops = r.shuffle([elegido.w, ...distintas(r, elegido.w, pool, 3, x => x.toLowerCase())]);
  const conHueco = fichas.map((w, i) => (i === elegido.i ? w.replace(elegido.w, '____') : w)).join(' ') + (/[.!?]$/.test(f.en) ? f.en.slice(-1) : '');
  return Object.assign(base, { conHueco, opciones: ops, correcta: ops.indexOf(elegido.w) });
}
function compruebaOrden(ej, fichasElegidas) { return comparaTexto(fichasElegidas.join(' '), ej.en, ej.alt).ok && normalizaEn(fichasElegidas.join(' ')).split(' ').length === normalizaEn(ej.en).split(' ').length; }

/* Instrucción para practicar conversación por voz con Claude (app de Claude, modo de voz) */
function instruccionConversacion(u) {
  return `Quiero practicar inglés hablado para programadores. Soy principiante (nivel ${u.nivel}). Tema: «${u.tema}» (${u.titulo}).\n` +
    `Haz de compañero de equipo que solo habla inglés. Usa frases cortas y sencillas, una pregunta cada vez, y espera mi respuesta.\n` +
    `Después de cada respuesta mía, si me equivoco, corrígeme en una frase en español y sigue la conversación en inglés.\n` +
    `Usa estas palabras cuando puedas: ${u.palabras.slice(0, 8).map(p => p.en).join(', ')}.\nEmpieza tú saludándome.`;
}

const Ingles = { unidades, porId, errores, TIPOS, NOMBRE_TIPO, items, itemPorClave, generar, compruebaOrden, normalizaEn, palabrasEn, comparaTexto, puntuaHabla, puntuaRespuesta, instruccionConversacion, rng };
if (typeof module !== 'undefined' && module.exports) module.exports = Ingles; else raiz.Ingles = Ingles;
})(typeof window !== 'undefined' ? window : globalThis);
