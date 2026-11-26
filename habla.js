/* Habla de programador: los términos del oficio y la forma profesional de decir las cosas, en español y
   en inglés. Seis bloques, de lo básico del código a los sistemas en producción. Cada término trae su
   traducción, una definición sencilla y un ejemplo; cada situación trae la forma poco profesional, dos
   malas respuestas típicas y la forma profesional (en español y en inglés). Sin DOM: se prueba en Node. */
(function (raiz) {
'use strict';
const T = (id, es, en, def, ej) => ({ id, es, en, def, ej });
const S = (id, situacion, informal, malas, profesional, en) => ({ id, situacion, informal, malas, profesional, en });

const bloques = [
  { id: 'b1', titulo: 'Lo básico del código', tema: 'Nombrar bien lo que escribes',
    terminos: [
      T('variable', 'variable', 'variable', 'Un nombre que guarda un valor que puede cambiar.', 'Guarda el total en una variable llamada total.'),
      T('funcion', 'función', 'function', 'Un bloque de código con nombre que hace una tarea y se puede reutilizar.', 'Esa función calcula el precio con impuestos.'),
      T('bucle', 'bucle', 'loop', 'Código que se repite mientras se cumple una condición o para cada elemento.', 'El bucle recorre la lista de alumnos.'),
      T('condicion', 'condición', 'condition', 'Una pregunta de sí o no que decide qué camino sigue el programa.', 'Si la condición es falsa, no entra en el if.'),
      T('algoritmo', 'algoritmo', 'algorithm', 'La lista de pasos exactos para resolver un problema.', 'Antes de programar, escribe el algoritmo en pasos.'),
      T('parametro', 'parámetro', 'parameter', 'Un dato que recibe una función para trabajar.', 'La función recibe la edad como parámetro.'),
      T('retorno', 'valor de retorno', 'return value', 'Lo que devuelve una función al terminar.', 'El valor de retorno es la suma de los dos números.'),
      T('lista', 'lista', 'list (array)', 'Una colección ordenada de valores a la que se accede por posición.', 'Las notas están en una lista de diez elementos.')],
    situaciones: [
      S('explicar-funcion', 'Un compañero te pregunta qué hace tu función.', 'Pues hace cosas con los datos, ya sabes.', ['No sé, la copié de internet y funciona.', 'Mírala tú, está ahí.'],
        'Recibe la lista de ventas y devuelve el total del mes.', 'It takes the list of sales and returns the monthly total.'),
      S('no-entiendo', 'No entendiste lo que te explicaron.', 'No te pillé nada.', ['Sí, sí, claro (aunque no entendiste).', 'Eso está muy mal explicado.'],
        '¿Me lo puedes explicar con un ejemplo? No me quedó claro.', 'Could you explain it with an example? It is not clear to me.'),
      S('no-se', 'Te preguntan algo que no sabes.', 'Ni idea.', ['Inventas una respuesta para no quedar mal.', 'Eso no es mi trabajo.'],
        'No lo sé todavía; lo investigo y te respondo hoy.', 'I do not know yet; I will look into it and get back to you today.'),
      S('nombres', 'Revisan tu código y tus variables se llaman a, b y x2.', 'Da igual, funciona.', ['Así escribo más rápido.', 'Cambiarlo es perder el tiempo.'],
        'Tienes razón: les pongo nombres que digan lo que guardan.', 'You are right: I will give them names that say what they store.')] },

  { id: 'b2', titulo: 'Errores y depuración', tema: 'Hablar de fallos sin dramas',
    terminos: [
      T('sintaxis', 'error de sintaxis', 'syntax error', 'Algo mal escrito que impide que el programa se ejecute.', 'Falta un paréntesis: es un error de sintaxis.'),
      T('excepcion', 'excepción', 'exception', 'Un error que aparece mientras el programa se está ejecutando.', 'Dividir entre cero lanza una excepción.'),
      T('depurar', 'depurar', 'debug', 'Buscar y corregir la causa de un error.', 'Voy a depurar el programa paso a paso.'),
      T('registro', 'registro', 'log', 'Mensajes que el programa guarda para saber qué pasó.', 'En el registro aparece la hora exacta del fallo.'),
      T('breakpoint', 'punto de interrupción', 'breakpoint', 'Una marca que detiene el programa en una línea para mirar sus variables.', 'Pon un punto de interrupción antes del bucle.'),
      T('reproducir', 'reproducir el error', 'reproduce the bug', 'Conseguir que el fallo vuelva a pasar a propósito para estudiarlo.', 'Primero hay que reproducir el error en tu equipo.'),
      T('causa', 'causa raíz', 'root cause', 'El motivo real de un problema, no solo su síntoma.', 'La causa raíz era una lista vacía.'),
      T('limite', 'caso límite', 'edge case', 'Una situación extrema o rara: cero, vacío, el número más grande.', 'La lista vacía es un caso límite.')],
    situaciones: [
      S('reportar-bug', 'Encontraste un fallo y tienes que avisar.', 'Esto está roto, no funciona nada.', ['Alguien la ha liado.', 'No digo nada a ver si se arregla solo.'],
        'Al guardar sin nombre, la app se cierra. Pasa siempre; te dejo los pasos.', 'When you save without a name, the app closes. It always happens; here are the steps.'),
      S('pedir-ayuda', 'Llevas una hora atascado con un error.', '¿Alguien me arregla esto?', ['Sigues tres horas más sin decir nada.', 'Pegas el error sin explicar nada.'],
        'Tengo este error al leer el archivo. Probé A y B. ¿Me ayudas diez minutos?', 'I get this error when reading the file. I tried A and B. Can you help me for ten minutes?'),
      S('rompi', 'Subiste un cambio que rompió algo.', 'No fui yo, ya estaba así.', ['Lo arreglas en silencio y no avisas.', 'Culpas a las pruebas.'],
        'Mi cambio de ayer rompió el inicio de sesión. Ya lo estoy revirtiendo.', 'My change from yesterday broke the login. I am already rolling it back.'),
      S('explicar-causa', 'Te preguntan por qué falló.', 'Ni idea, cosas de la informática.', ['Porque el código es malo.', 'Se arregló solo.'],
        'La causa raíz es que no comprobamos si la lista estaba vacía.', 'The root cause is that we did not check whether the list was empty.')] },

  { id: 'b3', titulo: 'El trabajo con código', tema: 'Git y las revisiones',
    terminos: [
      T('repositorio', 'repositorio', 'repository', 'El lugar donde se guarda el código con todo su historial.', 'Sube los cambios al repositorio del equipo.'),
      T('commit', 'commit', 'commit', 'Un paquete de cambios guardado en el historial, con un mensaje.', 'Haz un commit con un mensaje claro.'),
      T('rama', 'rama', 'branch', 'Una línea de trabajo separada para cambiar el código sin tocar la principal.', 'Crea una rama para la nueva función.'),
      T('fusionar', 'fusionar', 'merge', 'Unir los cambios de una rama con otra.', 'Cuando lo aprueben, vamos a fusionar la rama.'),
      T('conflicto', 'conflicto', 'merge conflict', 'Cuando dos cambios tocan las mismas líneas y hay que elegir.', 'Hay un conflicto en el archivo de configuración.'),
      T('pr', 'solicitud de cambios', 'pull request', 'La petición para que revisen y acepten tus cambios.', 'Abrí una solicitud de cambios con el arreglo.'),
      T('revision', 'revisión de código', 'code review', 'Cuando otra persona lee tu código antes de aceptarlo.', 'La revisión de código encontró dos errores.'),
      T('version', 'versión', 'release', 'Una entrega numerada del programa para los usuarios.', 'La versión 2.0 sale el lunes.')],
    situaciones: [
      S('pedir-revision', 'Terminaste un cambio y quieres que lo revisen.', 'Mira esto cuando puedas, porfa.', ['Lo subes directo sin que nadie lo vea.', '¿Me lo apruebas ya?'],
        'Abrí la solicitud de cambios: arregla el cálculo del descuento. ¿Puedes revisarla?', 'I opened the pull request: it fixes the discount calculation. Can you review it?'),
      S('recibir-critica', 'En la revisión te dicen que tu función es demasiado larga.', 'Pues a mí me parece bien.', ['Lo tomas como algo personal.', 'Ignoras el comentario.'],
        'Buena observación: la divido en dos funciones más pequeñas.', 'Good point: I will split it into two smaller functions.'),
      S('dar-critica', 'Revisas el código de otro y ves un problema.', 'Esto está fatal.', ['No dices nada para no molestar.', 'Lo reescribes tú sin avisar.'],
        'Aquí falla si la lista está vacía. ¿Qué te parece comprobarlo al principio?', 'This fails if the list is empty. What do you think about checking it at the start?'),
      S('mensaje-commit', 'Tienes que escribir el mensaje de un commit.', 'cambios', ['asdf', 'arreglos varios'],
        'Corrige el total cuando no hay productos en el carrito.', 'Fix the total when the cart has no products.')] },

  { id: 'b4', titulo: 'Calidad', tema: 'Código que dura',
    terminos: [
      T('prueba', 'prueba unitaria', 'unit test', 'Un programa pequeño que comprueba que una función hace lo que debe.', 'Añade una prueba unitaria para el caso vacío.'),
      T('refactorizar', 'refactorizar', 'refactor', 'Mejorar el código por dentro sin cambiar lo que hace.', 'Antes de seguir, conviene refactorizar esta parte.'),
      T('deuda', 'deuda técnica', 'technical debt', 'Atajos de hoy que habrá que pagar mañana con más trabajo.', 'Copiar y pegar ese bloque crea deuda técnica.'),
      T('legible', 'legible', 'readable', 'Fácil de leer y entender por otra persona.', 'Con buenos nombres, el código es más legible.'),
      T('documentacion', 'documentación', 'documentation', 'Los textos que explican cómo usar y mantener el código.', 'La documentación explica cada parámetro.'),
      T('rendimiento', 'rendimiento', 'performance', 'Lo rápido y eficiente que es un programa.', 'El rendimiento bajó al cargar mil fotos.'),
      T('dependencia', 'dependencia', 'dependency', 'Código de otros que tu programa necesita para funcionar.', 'Esa dependencia está desactualizada.'),
      T('biblioteca', 'biblioteca', 'library', 'Un conjunto de funciones ya hechas que puedes usar.', 'Usamos una biblioteca para leer fechas.')],
    situaciones: [
      S('proponer-refactor', 'Quieres proponer limpiar un código desordenado.', 'Esto es un desastre, hay que tirarlo.', ['Lo cambias todo sin preguntar.', 'Te quejas pero no propones nada.'],
        'Propongo refactorizar este módulo: hoy cuesta mucho añadir cosas. Serían dos días.', 'I propose refactoring this module: today it is hard to add things. It would take two days.'),
      S('defender-pruebas', 'Te dicen que no hay tiempo para escribir pruebas.', 'Vale, pues sin pruebas.', ['Las pruebas son una pérdida de tiempo.', 'Te niegas a trabajar.'],
        'Sin pruebas, cada cambio puede romper algo. Con una hora más lo dejamos protegido.', 'Without tests, every change can break something. With one more hour we keep it safe.'),
      S('retraso-calidad', 'Vas a tardar más porque encontraste un problema.', 'Me va a llevar más, no sé cuánto.', ['No avisas y entregas tarde.', 'Entregas a medias sin decirlo.'],
        'Encontré un problema de datos. Necesito un día más para entregarlo bien.', 'I found a data problem. I need one more day to deliver it properly.'),
      S('error-propio', 'Te das cuenta de que te equivocaste en algo que ya entregaste.', 'Bueno, nadie es perfecto.', ['Esperas a que nadie se dé cuenta.', 'Dices que fue culpa del cliente.'],
        'Me equivoqué en el cálculo del IVA. Ya tengo el arreglo y una prueba para que no vuelva a pasar.', 'I made a mistake in the tax calculation. I already have the fix and a test so it does not happen again.')] },

  { id: 'b5', titulo: 'Producto y equipo', tema: 'Planificar y avisar a tiempo',
    terminos: [
      T('requisito', 'requisito', 'requirement', 'Algo que el programa tiene que cumplir sí o sí.', 'Un requisito es que funcione sin internet.'),
      T('estimacion', 'estimación', 'estimate', 'Cuánto tiempo crees que llevará una tarea.', 'Mi estimación es de tres días.'),
      T('plazo', 'plazo', 'deadline', 'La fecha límite para entregar algo.', 'El plazo es el viernes a mediodía.'),
      T('bloqueo', 'bloqueo', 'blocker', 'Algo que te impide avanzar hasta que otro lo resuelva.', 'Tengo un bloqueo: me falta la clave del servidor.'),
      T('prioridad', 'prioridad', 'priority', 'Qué es más importante hacer primero.', 'La máxima prioridad es el error del pago.'),
      T('entregable', 'entregable', 'deliverable', 'Lo que se entrega al terminar una parte del trabajo.', 'El entregable de esta semana es el formulario.'),
      T('daily', 'reunión diaria', 'daily stand-up', 'Una reunión corta para decir qué hiciste, qué harás y qué te frena.', 'En la reunión diaria conté mi avance.'),
      T('retro', 'retrospectiva', 'retrospective', 'Reunión para ver qué salió bien y qué mejorar.', 'En la retrospectiva decidimos revisar antes.')],
    situaciones: [
      S('hablar-daily', 'Te toca hablar en la reunión diaria.', 'Pues nada, ahí ando con lo mío.', ['Cuentas todo con detalle durante veinte minutos.', 'Dices que todo va bien aunque estás atascado.'],
        'Ayer terminé el formulario. Hoy hago las pruebas. No tengo bloqueos.', 'Yesterday I finished the form. Today I will write the tests. I have no blockers.'),
      S('estimar', 'Te piden cuánto tardarás en una tarea nueva.', 'Ni idea, lo que tarde.', ['Dices «dos horas» para quedar bien.', 'Te niegas a dar ninguna cifra.'],
        'Calculo tres días. Si aparece algo raro con los datos, lo aviso el primer día.', 'I estimate three days. If something strange shows up with the data, I will tell you on day one.'),
      S('negociar-plazo', 'El plazo que te dan es imposible.', 'Eso es imposible, olvídalo.', ['Aceptas y luego no llegas.', 'Trabajas toda la noche sin decir nada.'],
        'Para el viernes llego con el formulario, sin los informes. ¿Te sirve así o movemos la fecha?', 'By Friday I can deliver the form without the reports. Does that work, or should we move the date?'),
      S('bloqueado', 'No puedes seguir porque te falta algo de otra persona.', 'Estoy parado, no es culpa mía.', ['Esperas sin avisar.', 'Te pones con otra cosa y no lo cuentas.'],
        'Estoy bloqueado: necesito el acceso a la base de datos. ¿Quién me lo puede dar?', 'I am blocked: I need access to the database. Who can give it to me?')] },

  { id: 'b6', titulo: 'Sistemas en producción', tema: 'Cuando hay usuarios de verdad',
    terminos: [
      T('servidor', 'servidor', 'server', 'Un ordenador que atiende peticiones de otros programas.', 'El servidor responde en menos de un segundo.'),
      T('api', 'API', 'API', 'La forma acordada en que dos programas se piden datos o acciones.', 'La app pide los precios a la API.'),
      T('bd', 'base de datos', 'database', 'Donde se guardan los datos de forma ordenada y permanente.', 'Los usuarios están en la base de datos.'),
      T('desplegar', 'desplegar', 'deploy', 'Poner una versión nueva en funcionamiento para los usuarios.', 'Vamos a desplegar el arreglo esta tarde.'),
      T('produccion', 'producción', 'production', 'El sistema real que usan los clientes.', 'El error solo pasa en producción.'),
      T('staging', 'entorno de pruebas', 'staging environment', 'Una copia del sistema para probar antes de tocar lo real.', 'Probadlo primero en el entorno de pruebas.'),
      T('revertir', 'revertir', 'roll back', 'Volver a la versión anterior cuando la nueva falla.', 'Si falla, hay que revertir a la versión de ayer.'),
      T('escalabilidad', 'escalabilidad', 'scalability', 'La capacidad de aguantar muchos más usuarios sin caerse.', 'La escalabilidad importa si llegan mil usuarios.')],
    situaciones: [
      S('incidente', 'Ves que producción está fallando.', '¡Se ha caído todo!', ['Esperas a que otro lo vea.', 'Reinicias cosas al azar.'],
        'Producción da errores al pagar desde las 10:05. Lo estoy mirando y aviso cada quince minutos.', 'Production has been failing at checkout since 10:05. I am looking into it and will update every fifteen minutes.'),
      S('no-tecnico', 'Tienes que explicarle un problema a alguien que no programa.', 'Es que el endpoint devuelve un 500 por un null.', ['Es muy técnico, no lo entenderías.', 'Nada, cosas del sistema.'],
        'Algunos pagos fallan por un error nuestro. Ya sabemos cuál es y lo arreglamos hoy.', 'Some payments fail because of a mistake on our side. We know what it is and we will fix it today.'),
      S('proponer-revertir', 'La versión nueva da problemas y quieres volver atrás.', 'Quitad eso ya.', ['Sigues probando arreglos en producción.', 'Culpas al que la subió.'],
        'Propongo revertir a la versión anterior ahora y buscar la causa con calma.', 'I propose rolling back to the previous version now and finding the cause calmly.'),
      S('cerrar-incidente', 'El problema ya está resuelto y tienes que contarlo.', 'Ya va, no preguntéis más.', ['No cuentas nada.', 'Dices que fue mala suerte.'],
        'Resuelto a las 11:20. La causa fue una tabla llena. Para que no vuelva a pasar, añadimos una alerta.', 'Resolved at 11:20. The cause was a full table. To prevent it from happening again, we added an alert.')] }
];

const porId = {}; bloques.forEach((b, k) => { b.n = k + 1; porId[b.id] = b; });
const TIPOS = ['definicion', 'termino', 'ingles', 'hueco', 'profesional', 'frase-en'];
const NOMBRE_TIPO = { definicion: '¿Qué término es?', termino: '¿Qué significa?', ingles: '¿Cómo se dice en inglés?', hueco: 'Completa la frase', profesional: '¿Cómo lo dice un profesional?', 'frase-en': 'Dilo en inglés profesional' };
const items = b => [...b.terminos.map(t => ({ clave: b.id + ':' + t.id, tipo: 'termino', x: t })), ...b.situaciones.map(s => ({ clave: b.id + ':' + s.id, tipo: 'situacion', x: s }))];
function itemPorClave(clave) {
  const [bid, id] = String(clave).split(':'); const b = porId[bid]; if (!b) return null;
  const t = b.terminos.find(x => x.id === id); if (t) return { b, tipo: 'termino', x: t };
  const s = b.situaciones.find(x => x.id === id); return s ? { b, tipo: 'situacion', x: s } : null;
}
function rng(semilla) {
  let a = semilla >>> 0 || 1;
  const f = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { f, pick: arr => arr[Math.floor(f() * arr.length)], shuffle: arr => { const c = arr.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; } };
}
function distintas(r, correcta, pool, n) {
  const vistos = new Set([correcta]), out = [];
  for (const x of r.shuffle(pool)) { if (vistos.has(x)) continue; vistos.add(x); out.push(x); if (out.length === n) break; }
  return out;
}
const escapa = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* Un ejercicio: spec = { bloque, tipo, seed, item? }. Siempre 4 opciones distintas con la buena dentro. */
function generar(spec) {
  const r = rng(spec.seed >>> 0 || 1), b = porId[spec.bloque] || bloques[0], hasta = bloques.slice(0, b.n);
  let tipo = TIPOS.includes(spec.tipo) ? spec.tipo : 'definicion';
  const it = spec.item ? itemPorClave(spec.item) : null;
  if (it && it.tipo === 'termino' && (tipo === 'profesional' || tipo === 'frase-en')) tipo = r.pick(['definicion', 'termino', 'ingles', 'hueco']);
  if (it && it.tipo === 'situacion' && !(tipo === 'profesional' || tipo === 'frase-en')) tipo = r.pick(['profesional', 'frase-en']);
  const terminos = hasta.flatMap(x => x.terminos), situaciones = hasta.flatMap(x => x.situaciones);
  const opciones = (buena, pool) => { const ops = r.shuffle([buena, ...distintas(r, buena, pool, 3)]); return { opciones: ops, correcta: ops.indexOf(buena) }; };
  if (tipo === 'profesional' || tipo === 'frase-en') {
    const s = it && it.tipo === 'situacion' ? it.x : r.pick(b.situaciones), item = b.id + ':' + s.id;
    if (tipo === 'profesional') { const ops = r.shuffle([s.profesional, s.informal, ...s.malas]); return { tipo, bloque: b.id, item, situacion: s.situacion, opciones: ops, correcta: ops.indexOf(s.profesional), explica: s.profesional, en: s.en }; }
    return { tipo, bloque: b.id, item, situacion: s.situacion, es: s.profesional, ...opciones(s.en, situaciones.map(x => x.en)), en: s.en };
  }
  const t = it && it.tipo === 'termino' ? it.x : r.pick(b.terminos), item = b.id + ':' + t.id;
  const base = { tipo, bloque: b.id, item, es: t.es, en: t.en, def: t.def, ej: t.ej };
  if (tipo === 'definicion') return { ...base, ...opciones(t.es, terminos.map(x => x.es)) };
  if (tipo === 'termino') return { ...base, ...opciones(t.def, terminos.map(x => x.def)) };
  if (tipo === 'ingles') return { ...base, ...opciones(t.en, terminos.map(x => x.en)) };
  // hueco: el ejemplo sin el término
  const conHueco = t.ej.replace(new RegExp(escapa(t.es), 'i'), '____');
  return { ...base, conHueco, ...opciones(t.es, terminos.map(x => x.es)) };
}

const Habla = { bloques, porId, TIPOS, NOMBRE_TIPO, items, itemPorClave, generar, rng };
if (typeof module !== 'undefined' && module.exports) module.exports = Habla; else raiz.Habla = Habla;
})(typeof window !== 'undefined' ? window : globalThis);
