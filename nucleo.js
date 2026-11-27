/* Núcleo del Dojo: la lógica sin pantalla (progreso, puntos y rangos, repaso espaciado, racha, inglés, recomendaciones).
   No toca el DOM, así que se prueba igual en Node que en el navegador. */
(function (raiz) {
'use strict';
const VERSION = '1.15.0';
const LANGS = ['ps', 'py', 'cpp'];
const REGLA = 'Si le mando un mensaje a Claude, entonces abro el Dojo y hago retos hasta que me responda.';
const INTERVALOS = [0, 1, 3, 7, 16, 35];   // días hasta el siguiente repaso según la caja (0 = fallado)

/* Diez rangos, de Aprendiz a Ingeniero de élite. Para subir hacen falta dos cosas: llegar a los puntos
   del rango y aprobar su examen (sin ayuda, sobre todo lo que se debe saber a ese nivel, inglés incluido).
   Equivocarse resta; si los puntos bajan del mínimo de tu rango, bajas, y lo recuperas al volver a subir
   (un examen aprobado no se repite). sabe: lo que debe saber quien tiene ese rango; el examen lo evalúa con
   temas de programación, unidades de inglés y bloques de «Habla de programador». Suspender resta puntos y
   obliga a repasar lo fallado; luego, al recuperar los puntos, se puede repetir. */
const RANGOS = [
  { n: 'Aprendiz', min: 0, lema: 'Empiezas a leer código y a adivinar qué hace.',
    sabe: ['Leer un programa muy corto y decir qué muestra.', 'Saludar en inglés.', 'Saber que existen las variables y las funciones.'] },
  { n: 'Estudiante de código', min: 300, lema: 'Ya sabes qué es una variable, un if y un bucle.', examen: { temas: 2, unidades: 1, bloques: 1, preguntas: 12, nota: 1 },
    sabe: ['Mostrar texto y números y guardar datos en variables, en PSeInt, Python y C++.', 'Presentarte en inglés: quién eres, a qué te dedicas y qué aprendes.', 'Usar bien los términos básicos (variable, función, bucle, condición, algoritmo) y explicar tu código sin rodeos.'] },
  { n: 'Pasante', min: 1000, lema: 'Escribes programas pequeños con ayuda.', examen: { temas: 3, unidades: 2, bloques: 1, preguntas: 14, nota: 1 },
    sabe: ['Calcular: suma, resta, multiplicación, división, división entera, resto y paréntesis.', 'Leer en voz alta números, símbolos y código en inglés.', 'Pedir que te expliquen algo y decir «no lo sé; lo investigo».'] },
  { n: 'Programador junior', min: 2200, lema: 'Resuelves ejercicios tú solo, aunque tardes.', examen: { temas: 4, unidades: 3, bloques: 2, preguntas: 16, nota: 1 },
    sabe: ['Pedir datos al usuario y trabajar con ellos.', 'Seguir instrucciones en inglés: abrir, guardar, ejecutar, la pantalla y el teclado.', 'Hablar de errores con propiedad (excepción, depurar, causa raíz, caso límite) y reportar un fallo con pasos.'] },
  { n: 'Programador', min: 4000, lema: 'Lees y escribes los tres lenguajes sin miedo.', examen: { temas: 5, unidades: 4, bloques: 2, preguntas: 18, nota: 1 },
    sabe: ['Tomar decisiones con si/if, sino/else y condiciones compuestas.', 'Entender las palabras del código en inglés: if, while, return, true, false…', 'Pedir ayuda explicando qué probaste y reconocer cuando rompiste algo.'] },
  { n: 'Programador senior', min: 6500, lema: 'Encuentras los errores rápido y sabes explicar por qué.', examen: { temas: 6, unidades: 6, bloques: 3, preguntas: 20, nota: 1 },
    sabe: ['Repetir con bucles «mientras»: contadores, acumuladores y cuándo terminan.', 'Decir en inglés lo que necesitas hacer y explicar qué hace un código.', 'Trabajar como en un equipo: repositorio, commit, rama, fusionar, solicitud de cambios y revisión de código.'] },
  { n: 'Ingeniero de software', min: 10000, lema: 'Piensas antes de escribir: datos, pasos y pruebas.', examen: { temas: 7, unidades: 7, bloques: 3, preguntas: 22, nota: 1 },
    sabe: ['Repetir contando con «para/for»: rangos, pasos y bucles anidados.', 'Leer y entender mensajes de error reales en inglés.', 'Dar y recibir críticas en una revisión de código de forma profesional.'] },
  { n: 'Ingeniero senior', min: 15000, lema: 'Meses de constancia: practicas casi todos los días.', examen: { temas: 8, unidades: 9, bloques: 4, preguntas: 25, nota: 1 },
    sabe: ['Usar arreglos y listas: recorrerlos, buscar, sumar, el mayor y el menor.', 'Pedir ayuda y contar lo que hiciste en inglés (pasado y commits).', 'Hablar de calidad: pruebas unitarias, refactorizar, deuda técnica, legibilidad y rendimiento.'] },
  { n: 'Arquitecto de software', min: 22000, lema: 'Dominas la base y podrías enseñársela a otros.', examen: { temas: 9, unidades: 10, bloques: 5, preguntas: 28, nota: 1 },
    sabe: ['Diseñar funciones con parámetros y valor de retorno.', 'Hablar de planes en inglés (will y going to).', 'Estimar, negociar plazos y avisar de bloqueos como un profesional.'] },
  { n: 'Ingeniero de élite', min: 30000, lema: 'La cima del Dojo. Pocos llegan hasta aquí.', examen: { temas: 10, unidades: 14, bloques: 8, preguntas: 36, nota: 1 },
    sabe: ['Trabajar con texto (recorrer, contar, cortar y transformar cadenas) y todo lo anterior junto, sin ayuda.', 'Participar en una reunión y una revisión de código en inglés, leer documentación y pasar una entrevista técnica.', 'Hablar de producción y de diseño (desplegar, revertir, incidentes, cuellos de botella, compromisos) y defenderte en una entrevista, en español y en inglés.'] }
];
/* Cuánto vale cada cosa. La racha de aciertos (combo) suma +1 por acierto seguido, hasta +5. */
const PUNTOS = {
  reto: 10, retoFallo: -5, comboMax: 5, meta: 50, cinturon: 100, ejercicio: 50, html: 30, focoMin: 2,
  ingles: 8, inglesFallo: -4, habla: 12, hablaCasi: 3, hablaFallo: -2, metaIngles: 30, conversa: 40, conversaOtra: 15, unidad: 100,
  examen: 150, repasoBien: 5, repasoFallo: -5,   // aprobar un examen da +150; suspender resta (ver multaExamen)
  ejercicioFallo: -5, conversaFallo: -2, jerga: 8, jergaFallo: -4,   // también restan el laboratorio, las conversaciones y la jerga
  completa: 12, escribe: 15, paso: 40, proyecto: 100   // escribir vale más que reconocer; cada paso del proyecto +40 y terminarlo +100
};
const PASOS_PROYECTO = 3;
/* Puntos por partes: los puntos que separan un rango del siguiente se reparten entre código (40 %),
   inglés (35 %) y habla de programador (25 %), lo mismo que pesa cada parte en el examen. Cada parte da
   su porción y ahí se para: para llegar al examen hay que llenar las tres. d.tramo guarda lo que lleva cada
   parte en el tramo actual (puede ser negativo si los fallos te bajan de rango). Siempre se cumple:
   d.puntos = mínimo del rango aprobado + código + inglés + habla. En el último rango no hay tope. */
const AREAS = ['codigo', 'ingles', 'habla'];
const REPARTO = { codigo: 0.4, ingles: 0.35, habla: 0.25 };
const NOMBRE_AREA = { codigo: 'Código', ingles: 'Inglés', habla: 'Habla de programador' };
function topes(k) {
  const G = RANGOS[k].min - RANGOS[k - 1].min, c = Math.round(G * REPARTO.codigo), i = Math.round(G * REPARTO.ingles);
  return { codigo: c, ingles: i, habla: G - c - i };
}
/* Reparte n puntos entre las tres partes según el reparto, sin pasar de los topes */
function reparte(n, T) {
  const c = Math.round(n * REPARTO.codigo), i = Math.round(n * REPARTO.ingles), x = { codigo: c, ingles: i, habla: n - c - i };
  if (T) for (const a of AREAS) x[a] = Math.min(x[a], T[a]);
  return x;
}
/* El tramo hacia el rango siguiente; se crea o se repara si no cuadra con los puntos */
function tramoDe(d) {
  const k = d.rangoMax + 1; if (!RANGOS[k]) { d.tramo = null; return null; }
  const base = RANGOS[k - 1].min, T = topes(k), t = d.tramo;
  const ok = t && t.k === k && AREAS.every(a => Number.isFinite(t[a]) && t[a] <= T[a]) && base + AREAS.reduce((s, a) => s + t[a], 0) === d.puntos;
  if (!ok) {
    // progreso de antes de los topes (o datos que no cuadran): lo que pasa del rango aprobado se reparte entre las partes
    const extra = Math.min(d.puntos - base, RANGOS[k].min - base), x = reparte(extra, T);
    d.tramo = { k, codigo: x.codigo, ingles: x.ingles, habla: x.habla };
    d.puntos = Math.max(0, base + AREAS.reduce((s, a) => s + d.tramo[a], 0));
  }
  return d.tramo;
}
/* Los puntos que el proyecto del rango tiene guardados dentro de la parte de código (para que siempre quepan) */
function reservaProyecto(d, k) {
  const hechos = d.proyectos[k] || 0; if (hechos >= PASOS_PROYECTO) return 0;
  const pendiente = (PASOS_PROYECTO - hechos) * PUNTOS.paso + PUNTOS.proyecto;
  return Math.min(pendiente, Math.round(topes(k).codigo / 2));
}
/* Cómo va cada parte en el tramo actual: { codigo: { tiene, tope, lleno }, … } */
function estadoAreas(d) {
  const t = tramoDe(d); if (!t) return null;
  const T = topes(t.k), out = {};
  for (const a of AREAS) out[a] = { tiene: t[a], tope: T[a], lleno: t[a] >= T[a], nombre: NOMBRE_AREA[a] };
  out.codigo.reserva = reservaProyecto(d, t.k);   // lo que solo puede dar el proyecto
  return out;
}
/* Suspender un examen resta el 10 % de los puntos de ese rango (al menos 50): hay que volver a ganarlos */
/* Aprobar un examen pide el 100 %: ni un fallo (orden de Andy: los fallos que se dejan pasar se acumulan rango a rango) */
const multaExamen = k => Math.max(50, Math.round(RANGOS[k].min * 0.1));

const hoyClave = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumaDias = (clave, n) => { const d = new Date(clave + 'T12:00:00'); d.setDate(d.getDate() + n); return hoyClave(d); };
const diasAtras = n => sumaDias(hoyClave(), -n);
const esFecha = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const entero = (x, min = 0, max = 1e9) => { x = Math.round(Number(x)); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min; };

function NUEVO() {
  return {
    v: 2, actualizado: 0, puntos: 0, rangoMax: 0, combo: 0, dias: {}, temas: {}, ejercicios: {}, tarjetas: {}, html: {}, bienvenida: false,
    ingles: { unidades: {}, tarjetas: {} }, jerga: { bloques: {}, tarjetas: {} }, examenes: { reintento: 0, historial: [], repaso: [] }, escritos: {}, proyectos: {},
    porLang: { ps: { retos: 0, aciertos: 0 }, py: { retos: 0, aciertos: 0 }, cpp: { retos: 0, aciertos: 0 } },
    ajustes: { meta: 20, metaIngles: 10, foco: 25, lang: 'mezcla', tema: 'auto', aspecto: 'sistema', temaCodigo: 'dojo', vibrar: true, voz: 1 },
    plan: { checks: {}, regla: REGLA }
  };
}
const elige = (v, opciones, def) => (opciones.includes(v) ? v : def);

const tarjetaLimpia = (x, hoy) => ({ caja: entero(x.caja, 0, 5), vence: esFecha(x.vence) ? x.vence : hoy, aciertos: entero(x.aciertos), fallos: entero(x.fallos), visto: esFecha(x.visto) ? x.visto : hoy });
const ultimosLimpios = x => (Array.isArray(x) ? x : []).slice(-10).map(v => (v ? 1 : 0));

/* Devuelve un progreso limpio a partir de cualquier cosa guardada (versión 1, versión 2, un código
   pegado o datos dañados). Lo que no se reconoce se descarta; nada puede romper la app.
   I (el curso de inglés) es opcional: sin él, el progreso de inglés se conserva solo si tiene buena forma. */
function normaliza(d, D, I, J) {
  if (D && I && J) CONT = { D, I, J };   // para comprobar lo que hay que dominar antes de cada examen
  const n = NUEVO(); if (!d || typeof d !== 'object' || Array.isArray(d)) { tramoDe(n); return n; }
  const hoy = hoyClave();
  n.actualizado = entero(d.actualizado, 0, 1e15); n.puntos = entero(d.puntos);
  // rangoMax = el rango más alto aprobado. Quien venía de antes de los exámenes conserva el rango que ya tenía.
  const ex = d.examenes && typeof d.examenes === 'object' ? d.examenes : null;
  n.rangoMax = ex ? entero(d.rangoMax, 0, RANGOS.length - 1) : Math.max(rangoDe(n.puntos).i, entero(d.rangoMax, 0, RANGOS.length - 1));
  n.combo = entero(d.combo, 0, 1e6);
  if (ex) {
    n.examenes.reintento = entero(ex.reintento);
    if (Array.isArray(ex.historial)) n.examenes.historial = ex.historial.filter(x => x && typeof x === 'object' && esFecha(x.dia)).slice(-30)
      .map(x => ({ dia: x.dia, rango: entero(x.rango, 1, RANGOS.length - 1), bien: entero(x.bien), total: entero(x.total, 1, 100), aprobado: x.aprobado === true, abandonado: x.abandonado === true }));
    if (Array.isArray(ex.repaso)) n.examenes.repaso = ex.repaso.filter(x => x && x.spec && typeof x.spec === 'object' && Number.isFinite(x.spec.seed) &&
      ((x.area === 'codigo' && D.porId[x.spec.tpl] && LANGS.includes(x.spec.lang)) || (x.area === 'escribe' && /^[a-z0-9-]{1,40}$/.test(x.spec.tarea) && LANGS.includes(x.spec.lang)) || (x.area === 'ingles' && (!I || I.porId[x.spec.unidad])) || (x.area === 'habla' && (!J || J.porId[x.spec.bloque]))))
      .slice(0, 40).map(x => ({ area: x.area, spec: JSON.parse(JSON.stringify(x.spec)) }));
  }
  // los días de antes de los puntos no los tienen: cuentan 0 (no el mínimo permitido)
  if (d.dias && typeof d.dias === 'object') for (const k of Object.keys(d.dias)) {
    if (!esFecha(k)) continue; const x = d.dias[k] || {};
    const retos = entero(x.retos), ingles = entero(x.ingles);
    const jerga = entero(x.jerga);
    n.dias[k] = { retos, aciertos: entero(x.aciertos, 0, retos), foco: entero(x.foco, 0, 1440), esperas: entero(x.esperas), perdidas: entero(x.perdidas), segEspera: entero(x.segEspera),
      puntos: Number.isFinite(Number(x.puntos)) ? entero(x.puntos, -1e9) : 0, ingles, inglesOk: entero(x.inglesOk, 0, ingles), jerga, jergaOk: entero(x.jergaOk, 0, jerga) };
  }
  for (const t of D.temas) {
    const x = d.temas && d.temas[t.id]; if (!x || typeof x !== 'object') continue;
    n.temas[t.id] = { ultimos: ultimosLimpios(x.ultimos), intentos: entero(x.intentos), aciertos: entero(x.aciertos) };
    if (x.ejercicio && typeof x.ejercicio === 'object') {   // versión 1: un solo ejercicio por tema
      const e = n.ejercicios[t.id + '-1'] || (n.ejercicios[t.id + '-1'] = {});
      for (const l of LANGS) if (x.ejercicio[l] === true) e[l] = true;
    }
  }
  if (d.ejercicios && typeof d.ejercicios === 'object') for (const k of Object.keys(d.ejercicios)) {
    if (!D.ejercicioPorId(k)) continue; const x = d.ejercicios[k] || {};
    const e = n.ejercicios[k] || (n.ejercicios[k] = {}); for (const l of LANGS) if (x[l] === true) e[l] = true;
  }
  if (d.tarjetas && typeof d.tarjetas === 'object') for (const k of Object.keys(d.tarjetas)) {
    const [tpl, lang] = k.split('|'); if (!D.porId[tpl] || !LANGS.includes(lang)) continue; const x = d.tarjetas[k] || {};
    n.tarjetas[k] = tarjetaLimpia(x, hoy);
  }
  if (Array.isArray(d.repaso)) for (const r of d.repaso) {   // versión 1: cola de fallos
    if (!r || !D.porId[r.tpl] || !LANGS.includes(r.lang)) continue; const k = r.tpl + '|' + r.lang;
    if (!n.tarjetas[k]) n.tarjetas[k] = { caja: 0, vence: hoy, aciertos: 0, fallos: 1, visto: esFecha(r.dia) ? r.dia : sumaDias(hoy, -1) };
  }
  for (const l of LANGS) { const x = (d.porLang && d.porLang[l]) || {}; const retos = entero(x.retos); n.porLang[l] = { retos, aciertos: entero(x.aciertos, 0, retos) }; }
  for (const x of D.html) if (d.html && d.html[x.id] === true) n.html[x.id] = true;
  const ing = d.ingles && typeof d.ingles === 'object' ? d.ingles : {};
  const unidadValida = id => (I ? !!I.porId[id] : /^u\d{1,2}$/.test(id)), itemValido = k => (I ? !!I.itemPorClave(k) : /^u\d{1,2}:[a-z0-9-]{1,30}$/.test(k));
  if (ing.unidades && typeof ing.unidades === 'object') for (const k of Object.keys(ing.unidades)) {
    const x = ing.unidades[k]; if (!unidadValida(k) || !x || typeof x !== 'object') continue;
    n.ingles.unidades[k] = { ultimos: ultimosLimpios(x.ultimos), intentos: entero(x.intentos), aciertos: entero(x.aciertos), conversa: entero(x.conversa) };
  }
  if (ing.tarjetas && typeof ing.tarjetas === 'object') for (const k of Object.keys(ing.tarjetas)) {
    const x = ing.tarjetas[k]; if (itemValido(k) && x && typeof x === 'object') n.ingles.tarjetas[k] = tarjetaLimpia(x, hoy);
  }
  if (d.escritos && typeof d.escritos === 'object') for (const k of Object.keys(d.escritos)) {
    const x = d.escritos[k]; if (/^[a-z0-9-]{1,40}$/.test(k) && x && typeof x === 'object') n.escritos[k] = { aciertos: entero(x.aciertos), fallos: entero(x.fallos) };
  }
  if (d.proyectos && typeof d.proyectos === 'object') for (const k of Object.keys(d.proyectos)) {
    if (/^[1-9]$/.test(k)) n.proyectos[k] = entero(d.proyectos[k], 0, PASOS_PROYECTO);
  }
  const jg = d.jerga && typeof d.jerga === 'object' ? d.jerga : {};
  if (jg.bloques && typeof jg.bloques === 'object') for (const k of Object.keys(jg.bloques)) {
    const x = jg.bloques[k]; if (!(J ? J.porId[k] : /^b\d$/.test(k)) || !x || typeof x !== 'object') continue;
    n.jerga.bloques[k] = { ultimos: ultimosLimpios(x.ultimos), intentos: entero(x.intentos), aciertos: entero(x.aciertos) };
  }
  if (jg.tarjetas && typeof jg.tarjetas === 'object') for (const k of Object.keys(jg.tarjetas)) {
    const x = jg.tarjetas[k]; if ((J ? J.itemPorClave(k) : /^b\d:[a-z0-9-]{1,30}$/.test(k)) && x && typeof x === 'object') n.jerga.tarjetas[k] = tarjetaLimpia(x, hoy);
  }
  const a = d.ajustes || {};
  n.ajustes = {
    meta: elige(a.meta, [10, 20, 30, 50], 20), metaIngles: elige(a.metaIngles, [5, 10, 15, 20], 10), foco: elige(a.foco, [15, 25, 45, 60], 25), lang: elige(a.lang, ['mezcla', ...LANGS], 'mezcla'),
    tema: a.tema === 'auto' || a.tema === 'todo' || a.tema === 'repaso' || D.temas.some(t => t.id === a.tema) ? a.tema : 'auto',
    aspecto: elige(a.aspecto, ['sistema', 'claro', 'oscuro'], 'sistema'), temaCodigo: elige(a.temaCodigo, ['dojo', 'vscode'], 'dojo'), vibrar: a.vibrar !== false, voz: elige(a.voz, [0.75, 1], 1)
  };
  const pl = d.plan || {};
  if (pl.checks && typeof pl.checks === 'object') for (const k of Object.keys(pl.checks)) if (/^[a-z-]{1,30}$/.test(k) && pl.checks[k] === true) n.plan.checks[k] = true;
  if (typeof pl.regla === 'string' && pl.regla.trim()) n.plan.regla = pl.regla.slice(0, 500);
  n.bienvenida = d.bienvenida === true || Object.keys(n.dias).length > 0;
  const tr = d.tramo && typeof d.tramo === 'object' ? d.tramo : null;
  if (tr) n.tramo = { k: entero(tr.k, 0, RANGOS.length), codigo: Math.round(Number(tr.codigo)) || 0, ingles: Math.round(Number(tr.ingles)) || 0, habla: Math.round(Number(tr.habla)) || 0 };
  tramoDe(n);   // repara el tramo si no cuadra con los puntos (o lo crea si el progreso es de antes)
  return n;
}

/* ── Temas, rango y racha ── */
const ejercicioHecho = (d, id) => !!d.ejercicios[id] && LANGS.some(l => d.ejercicios[id][l]);
function estadoTema(d, D, id) {
  const t = d.temas[id] || { ultimos: [], intentos: 0 }; const u = t.ultimos;
  const prop = u.length ? u.reduce((a, b) => a + b, 0) / u.length : 0;
  const tema = D.temas.find(x => x.id === id);
  const ej = !!tema && tema.ejercicios.some(e => ejercicioHecho(d, e.id));
  const retos = u.length >= 8 && prop >= 0.8;
  return { prop, n: u.length, retos, ej, dominado: retos && ej, visto: t.intentos > 0 };
}
const dominados = (d, D) => D.temas.filter(t => estadoTema(d, D, t.id).dominado).length;
const temaActual = (d, D) => D.temas.find(t => !estadoTema(d, D, t.id).dominado) || D.temas[D.temas.length - 1];
const cuentaDia = (d, k) => { const x = d.dias[k]; return !!x && (x.retos >= 5 || x.foco >= 10 || x.ingles >= 5 || x.jerga >= 5); };
function racha(d) { let n = 0, k = cuentaDia(d, hoyClave()) ? 0 : 1; while (cuentaDia(d, diasAtras(k))) { n++; k++; } return n; }
const diaVacio = () => ({ retos: 0, aciertos: 0, foco: 0, esperas: 0, perdidas: 0, segEspera: 0, puntos: 0, ingles: 0, inglesOk: 0, jerga: 0, jergaOk: 0 });
const dia = (d, k = hoyClave()) => d.dias[k] || (d.dias[k] = diaVacio());
const leeDia = (d, k = hoyClave()) => d.dias[k] || diaVacio();

/* ── Puntos y rangos ── */
function rangoDe(puntos) {
  let i = 0; while (i < RANGOS.length - 1 && puntos >= RANGOS[i + 1].min) i++;
  const r = RANGOS[i], sig = RANGOS[i + 1] || null;
  return { i, n: i + 1, rango: r, siguiente: sig, faltan: sig ? sig.min - puntos : 0, prop: sig ? (puntos - r.min) / (sig.min - r.min) : 1 };
}
/* El rango que tienes: el que aprobaste, salvo que los puntos hayan bajado de su mínimo */
const indiceRango = d => Math.min(d.rangoMax, rangoDe(d.puntos).i);
function rangoActual(d) {
  const i = indiceRango(d), r = RANGOS[i], sig = RANGOS[i + 1] || null;
  return { i, n: i + 1, rango: r, siguiente: sig, faltan: sig ? Math.max(0, sig.min - d.puntos) : 0,
    prop: sig ? Math.max(0, Math.min(1, (d.puntos - r.min) / (sig.min - r.min))) : 1, examen: estadoExamen(d) };
}
/* Lo que entra en el examen hay que dominarlo antes de hacerlo (no basta con los puntos). Necesita el
   contenido (temas, unidades y bloques): normaliza lo recibe y lo recuerda; sin él no se comprueba. */
let CONT = null;
function requisitosDominio(d, k) {
  if (!CONT || !RANGOS[k]) return [];
  const E = RANGOS[k].examen, out = [], pct = x => Math.round(x * 100) + ' %';
  for (const t of CONT.D.temas.slice(0, E.temas)) {
    const e = estadoTema(d, CONT.D, t.id); if (e.dominado) continue;
    const falta = [];
    if (e.n < 8) falta.push(`${e.n} de 8 retos`); else if (e.prop < 0.8) falta.push(`aciertas el ${pct(e.prop)} de los últimos retos (hace falta el 80 %)`);
    if (!e.ej) falta.push('falta un ejercicio de escribir');
    out.push({ area: 'codigo', id: t.id, titulo: t.titulo, falta: falta.join(' · ') });
  }
  if (CONT.I) for (const u of CONT.I.unidades.slice(0, E.unidades)) {
    const e = estadoUnidad(d, CONT.I, u.id); if (e.dominada) continue;
    const falta = [];
    if (e.n < 8) falta.push(`${e.n} de 8 ejercicios`); else if (e.prop < 0.8) falta.push(`aciertas el ${pct(e.prop)} (hace falta el 80 %)`);
    if (!e.conversa) falta.push('falta la conversación de la unidad');
    out.push({ area: 'ingles', id: u.id, titulo: u.titulo, falta: falta.join(' · ') });
  }
  if (CONT.J) for (const b of CONT.J.bloques.slice(0, E.bloques)) {
    const e = estadoBloque(d, CONT.J, b.id); if (e.dominado) continue;
    out.push({ area: 'habla', id: b.id, titulo: b.titulo, falta: e.n < 8 ? `${e.n} de 8 ejercicios` : `aciertas el ${pct(e.prop)} (hace falta el 80 %)` });
  }
  return out;
}
/* El examen del rango siguiente: disponible con los puntos de las tres partes, lo que entra dominado,
   el proyecto hecho y, si lo suspendiste, el repaso terminado */
function estadoExamen(d) {
  const k = d.rangoMax + 1, R = RANGOS[k];
  if (!R) return null;
  const objetivo = Math.max(R.min, d.examenes.reintento), puntosOk = d.puntos >= R.min, espera = Math.max(0, objetivo - d.puntos), repaso = d.examenes.repaso.length;
  const proyecto = d.proyectos[k] || 0, proyectoHecho = proyecto >= PASOS_PROYECTO;
  const faltan = requisitosDominio(d, k), dominioOk = !faltan.length;
  return { rango: k, nombre: R.n, ...R.examen, sabe: R.sabe, min: R.min, objetivo, puntosOk, espera, repaso, multa: multaExamen(k), proyecto, proyectoHecho,
    areas: estadoAreas(d), faltan, dominioOk,
    disponible: espera === 0 && repaso === 0 && proyectoHecho && dominioOk && indiceRango(d) === d.rangoMax };
}
/* Suma (o resta) puntos sin bajar de 0 y dice qué cambió:
   «examen» = ya tienes los puntos del rango siguiente: toca su examen · «recupera» = vuelves a tu rango
   aprobado · «baja» = los puntos bajaron del mínimo de tu rango. Subir de verdad solo pasa al aprobar. */
function sumaPuntos(d, n, area, exAntes) {
  const antes = d.puntos, ra = indiceRango(d); if (exAntes === undefined) exAntes = estadoExamen(d);
  n = Math.round(n); let tope = null;
  const t = tramoDe(d);
  if (!t) d.puntos = Math.max(0, antes + n);   // en el último rango no hay topes
  else {
    const T = topes(t.k), mete = (a, x) => {
      const zona = a === 'proyecto' ? 'codigo' : a;
      const techo = T[zona] - (zona === 'codigo' && a !== 'proyecto' ? reservaProyecto(d, t.k) : 0);
      let v = x > 0 ? Math.max(0, Math.min(x, techo - t[zona])) : Math.max(x, -d.puntos);
      if (x > 0 && v < x) tope = tope || zona;
      t[zona] += v; d.puntos += v;
    };
    if (area && (AREAS.includes(area) || area === 'proyecto')) mete(area, n);
    else { const x = reparte(n); for (const a of AREAS) mete(a, x[a]); }   // sin parte (aprobar o suspender un examen): se reparte
  }
  const delta = d.puntos - antes; dia(d).puntos += delta;
  const ri = indiceRango(d), ex = estadoExamen(d); let cambio = null;
  if (ri > ra) cambio = { tipo: 'recupera', i: ri };
  else if (ri < ra) cambio = { tipo: 'baja', i: ri };
  else if (ex && ex.disponible && !(exAntes && exAntes.disponible)) cambio = { tipo: 'examen', i: ex.rango };
  return { delta, cambio, puntos: d.puntos, tope };
}

/* ── Exámenes de ascenso ──
   Evalúa lo que debe saber ese rango: código (40 %), inglés (35 %) y habla de programador (25 %). La primera
   pregunta de cada parte es de lo más nuevo de ese rango, y el resto se reparte para que salga todo lo anterior.
   Devuelve las especificaciones; la pantalla genera las preguntas con ellas (siempre iguales con la misma semilla). */
function planExamen(D, I, k, semilla, voz = { sale: false }, J = null, E = null) {
  const R = RANGOS[k].examen, r = I.rng(semilla >>> 0 || 1), semillaNueva = () => Math.floor(r.f() * 2147483647);
  const nCod = Math.round(R.preguntas * (J ? 0.4 : 0.6)), nIng = J ? Math.round(R.preguntas * 0.35) : R.preguntas - nCod, nHab = J ? R.preguntas - nCod - nIng : 0;
  const orden = lista => [lista[lista.length - 1], ...r.shuffle(lista.slice(0, -1))];   // lo más nuevo primero, luego todo lo anterior sin repetir
  const temas = orden(D.temas.slice(0, R.temas)), unidades = orden(I.unidades.slice(0, R.unidades)), bloques = J ? orden(J.bloques.slice(0, R.bloques)) : [];
  const tiposCod = ['salida', 'completa', 'hueco', 'error', 'traducir', 'ordenar'];
  // escribir desde cero: 1 pregunta hasta Pasante, 2 después; sale de las preguntas de código
  const nEsc = E ? (k <= 2 ? 1 : 2) : 0, tareas = E ? E.tareas.filter(t => D.temas.findIndex(x => x.id === t.tema) < R.temas) : [];
  const recientes = tareas.filter(t => t.tema === D.temas[R.temas - 1].id);
  const tiposIng = ['significado', 'palabra', 'hueco', 'ordenar', 'traducir', ...(voz.sale ? ['escucha', 'dictado'] : [])];
  const tiposHab = ['profesional', 'definicion', 'ingles', 'hueco', 'frase-en', 'termino'];
  const plan = [];
  for (let q = 0; q < nEsc; q++) {
    const t = q === 0 && recientes.length ? r.pick(recientes) : r.pick(tareas);
    plan.push({ area: 'escribe', tema: t.tema, spec: { tarea: t.id, lang: null, seed: semillaNueva() } });
  }
  for (let q = 0; q < nCod - nEsc; q++) {
    const t = temas[q % temas.length], tpl = r.pick(D.plantillas.filter(x => x.tema === t.id));
    plan.push({ area: 'codigo', tema: t.id, spec: { tpl: tpl.id, lang: r.pick(D.langsDe(tpl)), tipo: tiposCod[(q + k) % tiposCod.length], seed: semillaNueva() } });
  }
  for (let q = 0; q < nIng; q++) {
    const u = unidades[q % unidades.length], tipos = u.n >= 7 ? [...tiposIng, 'error'] : tiposIng;
    plan.push({ area: 'ingles', unidad: u.id, spec: { unidad: u.id, tipo: tipos[(q + k) % tipos.length], seed: semillaNueva() } });
  }
  for (let q = 0; q < nHab; q++) {
    const b = bloques[q % bloques.length];
    plan.push({ area: 'habla', bloque: b.id, spec: { bloque: b.id, tipo: tiposHab[(q + k) % tiposHab.length], seed: semillaNueva() } });
  }
  return r.shuffle(plan);
}
/* Anota un examen terminado (o abandonado, que cuenta como suspenso). Aprobar sube de rango y da puntos. */
/* fallos: las preguntas falladas ({ area, spec }); quedan para repasar antes de poder repetirlo */
function registraExamen(d, k, { bien, total, abandonado = false, fallos = [], areas = [] }) {
  const R = RANGOS[k], porArea = {};
  for (const q of areas) { const x = porArea[q.area] || (porArea[q.area] = { bien: 0, total: 0 }); x.total++; if (q.ok) x.bien++; }
  // hay que llegar a la nota en el total y en cada parte: no vale compensar el código con el inglés
  const flojas = Object.keys(porArea).filter(a => porArea[a].total && porArea[a].bien / porArea[a].total < R.examen.nota);
  const aprobado = !abandonado && total > 0 && bien / total >= R.examen.nota && !flojas.length;
  d.examenes.historial.push({ dia: hoyClave(), rango: k, bien, total, aprobado, abandonado });
  if (d.examenes.historial.length > 30) d.examenes.historial.shift();
  if (!aprobado) {
    // Suspender: resta puntos, deja lo fallado para repasar y pide volver a los puntos de antes para repetirlo
    const antes = d.puntos, objetivo = Math.max(R.min, antes);
    const p = sumaPuntos(d, -multaExamen(k));
    d.examenes.reintento = objetivo; d.examenes.repaso = fallos.slice(0, 40).map(x => ({ area: x.area, spec: JSON.parse(JSON.stringify(x.spec)) }));
    return { aprobado, nota: total ? bien / total : 0, puntos: p.delta, cambio: p.cambio && p.cambio.tipo === 'baja' ? p.cambio : null, repaso: d.examenes.repaso.length, porArea, flojas };
  }
  d.rangoMax = Math.max(d.rangoMax, k); d.examenes.reintento = 0; d.examenes.repaso = [];
  tramoDe(d);   // empieza el tramo hacia el rango siguiente, con las tres partes vacías
  const p = sumaPuntos(d, PUNTOS.examen);   // el premio se reparte entre las tres partes del tramo nuevo
  return { aprobado, nota: bien / total, puntos: p.delta, cambio: { tipo: 'sube', i: k }, porArea, flojas };
}
/* Una pregunta del repaso del examen: bien la quita de la lista (+5); mal resta y se queda */
function registraRepasoExamen(d, i, ok) {
  const exAntes = estadoExamen(d), area = d.examenes.repaso[i] && d.examenes.repaso[i].area;
  if (ok) d.examenes.repaso.splice(i, 1);
  const p = sumaPuntos(d, ok ? PUNTOS.repasoBien : PUNTOS.repasoFallo, area, exAntes), ex = estadoExamen(d);
  let cambio = p.cambio;
  if (!cambio && ex && ex.disponible && !(exAntes && exAntes.disponible)) cambio = { tipo: 'examen', i: ex.rango };
  return { puntos: p.delta, cambio, quedan: d.examenes.repaso.length, tope: p.tope };
}
/* Un paso del proyecto del rango k (0, 1 o 2): bien lo da por hecho (+40, y +100 al terminar); mal resta */
function registraPaso(d, k, paso, ok) {
  const exAntes = estadoExamen(d), hechos = d.proyectos[k] || 0;
  if (!ok) { const f = registraFallo(d, PUNTOS.ejercicioFallo, 'codigo'); return { puntos: f.delta, cambio: f.cambio, hechos, terminado: false }; }
  if (paso !== hechos) return { puntos: 0, cambio: null, hechos, terminado: hechos >= PASOS_PROYECTO };   // ya estaba hecho
  d.proyectos[k] = hechos + 1; const terminado = d.proyectos[k] >= PASOS_PROYECTO;
  const p = sumaPuntos(d, PUNTOS.paso + (terminado ? PUNTOS.proyecto : 0), 'proyecto', exAntes), ex = estadoExamen(d);
  let cambio = p.cambio;
  if (!cambio && ex && ex.disponible && !(exAntes && exAntes.disponible)) cambio = { tipo: 'examen', i: ex.rango };
  return { puntos: p.delta, cambio, hechos: d.proyectos[k], terminado, tope: p.tope };
}
/* Fallos que también restan: comprobar un ejercicio del laboratorio que no pasa, o un turno de conversación no entendido */
function registraFallo(d, cuanto, area) { d.combo = 0; return Object.assign(sumaPuntos(d, cuanto, area), { combo: 0 }); }

/* ── Habla de programador: bloques, repaso y práctica ── */
const progBloque = (d, id) => d.jerga.bloques[id] || (d.jerga.bloques[id] = { ultimos: [], intentos: 0, aciertos: 0 });
function estadoBloque(d, J, id) {
  const b = d.jerga.bloques[id] || { ultimos: [], intentos: 0 }, l = b.ultimos, prop = l.length ? l.reduce((x, y) => x + y, 0) / l.length : 0;
  return { prop, n: l.length, dominado: l.length >= 8 && prop >= 0.8, visto: b.intentos > 0 };
}
const bloquesDominados = (d, J) => J.bloques.filter(b => estadoBloque(d, J, b.id).dominado).length;
const bloqueActual = (d, J) => J.bloques.find(b => !estadoBloque(d, J, b.id).dominado) || J.bloques[J.bloques.length - 1];
function pendientesJerga(d, J, hoy = hoyClave()) {
  const tope = J.bloques.indexOf(bloqueActual(d, J));
  return Object.entries(d.jerga.tarjetas).map(([clave, t]) => ({ clave, t, bloque: clave.split(':')[0] }))
    .filter(x => J.porId[x.bloque] && J.bloques.indexOf(J.porId[x.bloque]) <= tope && x.t.vence <= hoy && x.t.visto < hoy && J.itemPorClave(x.clave))
    .sort((a, b) => (a.t.vence < b.t.vence ? -1 : a.t.vence > b.t.vence ? 1 : a.t.caja - b.t.caja));
}
function registraJerga(d, J, r) {
  const ex0 = estadoExamen(d), antes = bloquesDominados(d, J), x = dia(d);
  x.jerga++; if (r.ok) x.jergaOk++;
  anota(progBloque(d, r.bloque), r.ok);
  if (r.item && J.itemPorClave(r.item)) apunta(d.jerga.tarjetas, r.item, r.ok);
  const base = puntosRespuesta(d, r.ok, PUNTOS.jerga, PUNTOS.jergaFallo);
  const ahora = bloquesDominados(d, J), bloque = ahora > antes ? ahora : 0;
  const p = sumaPuntos(d, base + (bloque ? PUNTOS.unidad : 0), 'habla', ex0);
  return { bloque, puntos: p.delta, cambio: p.cambio, combo: d.combo, tope: p.tope };
}
/* Puntos de una respuesta: el acierto suma más cuanto más larga es la racha de aciertos; el fallo resta y la corta */
function puntosRespuesta(d, ok, base, fallo) {
  if (!ok) { d.combo = 0; return fallo; }
  const extra = Math.min(PUNTOS.comboMax, d.combo); d.combo++; return base + extra;
}

/* ── Repaso espaciado (cajas de Leitner por plantilla y lenguaje, o por palabra y frase de inglés) ── */
function apunta(mapa, k, ok, hoy = hoyClave()) {
  const t = mapa[k] || { caja: 0, vence: hoy, aciertos: 0, fallos: 0, visto: hoy };
  if (ok) { t.aciertos++; t.caja = Math.min(5, t.caja + 1); } else { t.fallos++; t.caja = 0; }
  t.visto = hoy; t.vence = sumaDias(hoy, INTERVALOS[t.caja]); mapa[k] = t;
  return t;
}
const apuntaTarjeta = (d, tpl, lang, ok, hoy = hoyClave()) => apunta(d.tarjetas, tpl + '|' + lang, ok, hoy);
/* Tocan hoy: vencidas y no vistas hoy (lo fallado hoy vuelve por la cola de la sesión) */
function pendientes(d, D, hoy = hoyClave()) {
  const visibles = new Set(D.temas.slice(0, D.temas.indexOf(temaActual(d, D)) + 1).map(t => t.id));
  return Object.entries(d.tarjetas)
    .map(([k, t]) => { const [tpl, lang] = k.split('|'); return { tpl, lang, t, tema: D.porId[tpl] && D.porId[tpl].tema }; })
    .filter(x => x.tema && visibles.has(x.tema) && x.t.vence <= hoy && x.t.visto < hoy)
    .sort((a, b) => (a.t.vence < b.t.vence ? -1 : a.t.vence > b.t.vence ? 1 : a.t.caja - b.t.caja));
}
function debiles(d, D, n = 3) {
  const por = {};
  for (const [k, t] of Object.entries(d.tarjetas)) {
    const [tpl, lang] = k.split('|'); if (!D.porId[tpl]) continue;
    const x = por[tpl] || (por[tpl] = { tpl, aciertos: 0, fallos: 0, langs: {} });
    x.aciertos += t.aciertos; x.fallos += t.fallos; x.langs[lang] = (x.langs[lang] || 0) + t.fallos;
  }
  return Object.values(por)
    .map(x => ({ ...x, prop: x.aciertos / (x.aciertos + x.fallos), titulo: D.porId[x.tpl].titulo, tema: D.porId[x.tpl].tema, peorLang: Object.entries(x.langs).sort((a, b) => b[1] - a[1])[0][0] }))
    .filter(x => x.fallos >= 2 && x.prop < 0.7)
    .sort((a, b) => a.prop - b.prop || b.fallos - a.fallos)
    .slice(0, n);
}

/* ── Registrar un reto respondido ── */
const anota = (t, ok) => { t.intentos++; if (ok) t.aciertos++; t.ultimos.push(ok ? 1 : 0); if (t.ultimos.length > 10) t.ultimos.shift(); };
function registraReto(d, D, r) {
  const ex0 = estadoExamen(d), antes = dominados(d, D), x = dia(d);
  x.retos++; if (r.ok) x.aciertos++;
  anota(d.temas[r.tema] || (d.temas[r.tema] = { ultimos: [], intentos: 0, aciertos: 0 }), r.ok);
  const pl = d.porLang[r.lang]; if (pl) { pl.retos++; if (r.ok) pl.aciertos++; }
  if (r.tpl) apuntaTarjeta(d, r.tpl, r.lang, r.ok);
  if (r.tarea) { const e = d.escritos[r.tarea] || (d.escritos[r.tarea] = { aciertos: 0, fallos: 0 }); if (r.ok) e.aciertos++; else e.fallos++; }
  const base = puntosRespuesta(d, r.ok, r.tipo === 'escribe' ? PUNTOS.escribe : r.tipo === 'completa' ? PUNTOS.completa : PUNTOS.reto, PUNTOS.retoFallo);
  const ahora = dominados(d, D), cinturon = ahora > antes ? ahora : 0, metaCumplida = x.retos === d.ajustes.meta;
  const p = sumaPuntos(d, base + (metaCumplida ? PUNTOS.meta : 0) + (cinturon ? PUNTOS.cinturon : 0), 'codigo', ex0);
  return { cinturon, metaCumplida, puntos: p.delta, cambio: p.cambio, combo: d.combo, tope: p.tope };
}
function registraEjercicio(d, D, id, lang) {
  const ex0 = estadoExamen(d), antes = dominados(d, D); const e = d.ejercicios[id] || (d.ejercicios[id] = {});
  const nuevo = !e[lang]; e[lang] = true;
  const ahora = dominados(d, D), cinturon = ahora > antes ? ahora : 0;
  const p = sumaPuntos(d, (nuevo ? PUNTOS.ejercicio : 0) + (cinturon ? PUNTOS.cinturon : 0), 'codigo', ex0);
  return { nuevo, cinturon, puntos: p.delta, cambio: p.cambio, tope: p.tope };
}

/* ── Inglés: unidades, repaso y conversación ── */
const progUnidad = (d, id) => d.ingles.unidades[id] || (d.ingles.unidades[id] = { ultimos: [], intentos: 0, aciertos: 0, conversa: 0 });
function estadoUnidad(d, I, id) {
  const u = d.ingles.unidades[id] || { ultimos: [], intentos: 0, conversa: 0 }, l = u.ultimos;
  const prop = l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0, retos = l.length >= 8 && prop >= 0.8;
  return { prop, n: l.length, retos, conversa: u.conversa > 0, conversaciones: u.conversa, dominada: retos && u.conversa > 0, visto: u.intentos > 0 };
}
const unidadesDominadas = (d, I) => I.unidades.filter(u => estadoUnidad(d, I, u.id).dominada).length;
const unidadActual = (d, I) => I.unidades.find(u => !estadoUnidad(d, I, u.id).dominada) || I.unidades[I.unidades.length - 1];
function pendientesIngles(d, I, hoy = hoyClave()) {
  const tope = I.unidades.indexOf(unidadActual(d, I));
  return Object.entries(d.ingles.tarjetas)
    .map(([clave, t]) => ({ clave, t, unidad: clave.split(':')[0] }))
    .filter(x => I.porId[x.unidad] && I.unidades.indexOf(I.porId[x.unidad]) <= tope && x.t.vence <= hoy && x.t.visto < hoy && I.itemPorClave(x.clave))
    .sort((a, b) => (a.t.vence < b.t.vence ? -1 : a.t.vence > b.t.vence ? 1 : a.t.caja - b.t.caja));
}
/* r: { unidad, item, ok, habla, casi }. «habla» = ejercicio de pronunciar (resta menos: el micrófono también se equivoca) */
function registraIngles(d, I, r) {
  const ex0 = estadoExamen(d);
  const antes = unidadesDominadas(d, I), x = dia(d);
  x.ingles++; if (r.ok) x.inglesOk++;
  anota(progUnidad(d, r.unidad), r.ok);
  if (r.item && I.itemPorClave(r.item)) apunta(d.ingles.tarjetas, r.item, r.ok);
  const base = r.habla && r.casi && !r.ok ? PUNTOS.hablaCasi
    : puntosRespuesta(d, r.ok, r.habla ? PUNTOS.habla : PUNTOS.ingles, r.habla ? PUNTOS.hablaFallo : PUNTOS.inglesFallo);
  const ahora = unidadesDominadas(d, I), unidad = ahora > antes ? ahora : 0, metaCumplida = x.ingles === d.ajustes.metaIngles;
  const p = sumaPuntos(d, base + (metaCumplida ? PUNTOS.metaIngles : 0) + (unidad ? PUNTOS.unidad : 0), 'ingles', ex0);
  return { unidad, metaCumplida, puntos: p.delta, cambio: p.cambio, combo: d.combo, tope: p.tope };
}
/* Una conversación cuenta si respondiste bien a casi todos los turnos (puedes fallar uno). No resta: es para soltarse. */
function registraConversacion(d, I, id, { turnos, bien }) {
  const ex0 = estadoExamen(d);
  const completa = turnos >= 3 && bien >= turnos - 1;
  if (!completa) return { completa, puntos: 0, cambio: null, unidad: 0 };
  const antes = unidadesDominadas(d, I), u = progUnidad(d, id), primera = u.conversa === 0; u.conversa++;
  const ahora = unidadesDominadas(d, I), unidad = ahora > antes ? ahora : 0;
  const p = sumaPuntos(d, (primera ? PUNTOS.conversa : PUNTOS.conversaOtra) + (unidad ? PUNTOS.unidad : 0), 'ingles', ex0);
  return { completa, primera, puntos: p.delta, cambio: p.cambio, unidad, tope: p.tope };
}

/* ── Qué hacer ahora ── */
function siguientePaso(d, D, estado = {}, I = null) {
  const t = temaActual(d, D), e = estadoTema(d, D, t.id), hoy = leeDia(d), pend = pendientes(d, D).length;
  const ex = estadoExamen(d);
  const retosLlenos = ex && ex.areas && ex.areas.codigo.tiene >= ex.areas.codigo.tope - ex.areas.codigo.reserva;
  if (ex && retosLlenos && !ex.proyectoHecho && !ex.repaso && !estado.foco && indiceRango(d) === d.rangoMax) return { id: 'proyecto', titulo: `Termina tu proyecto para el examen de «${ex.nombre}»`, texto: `Los retos ya dieron su parte de código; el resto lo da el proyecto del rango: llevas ${ex.proyecto} de ${PASOS_PROYECTO} pasos. Se escribe a mano, como en papel.`, accion: 'examen', boton: 'Seguir el proyecto' };
  if (ex && ex.repaso && !estado.foco) return { id: 'repaso-examen', titulo: `Repasa lo que fallaste en el examen`, texto: `Te quedan ${ex.repaso} ${ex.repaso === 1 ? 'pregunta' : 'preguntas'} del examen de «${ex.nombre}». Respóndelas bien para poder repetirlo${ex.espera ? ` (y recupera ${ex.espera} puntos)` : ''}.`, accion: 'examen', boton: 'Repasar' };
  if (ex && ex.puntosOk && ex.proyectoHecho && !ex.repaso && !ex.dominioOk && !estado.foco && indiceRango(d) === d.rangoMax) {
    const f = ex.faltan[0];
    return { id: 'requisito', titulo: `Para el examen te falta dominar «${f.titulo}»`, texto: `${NOMBRE_AREA[f.area]}: ${f.falta}. Ya tienes los puntos y el proyecto; el examen se abre cuando domines todo lo que entra${ex.faltan.length > 1 ? ` (te quedan ${ex.faltan.length} cosas)` : ''}.`, accion: 'requisito', req: f, boton: 'Practicarlo' };
  }
  if (ex && ex.disponible && !estado.foco) return { id: 'examen', titulo: `Examen para «${ex.nombre}»`, texto: `Ya tienes los puntos y dominas lo que entra. Para subir de rango, aprueba el examen: ${ex.preguntas} preguntas sin ayuda de código, inglés y habla; hay que acertarlas todas.`, accion: 'examen', boton: 'Ver el examen' };
  if (estado.foco) return { id: 'foco', titulo: 'Estás en tu bloque de foco', texto: `Lee la lección de «${t.titulo}» y resuelve su ejercicio sin mirar a Claude.`, accion: 'tema', boton: 'Abrir la lección' };
  if (dominados(d, D) >= D.temas.length) return { id: 'fin', titulo: 'Dominaste los diez temas', texto: 'Ya tienes la base de los tres lenguajes. Ahora toca un proyecto tuyo en el laboratorio, y repasar para no olvidar.', accion: 'lab', boton: 'Ir al laboratorio' };
  if (e.retos && !e.ej) return { id: 'ejercicio', titulo: `Te falta el ejercicio de «${t.titulo}»`, texto: 'Ya dominas sus retos. Escribe el ejercicio en el laboratorio para ganar el siguiente cinturón.', accion: 'ejercicio', boton: 'Resolver el ejercicio' };
  if (pend >= 3) return { id: 'repaso', titulo: `Tienes ${pend} repasos para hoy`, texto: 'Son retos que fallaste o aprendiste hace días. Repasarlos a tiempo es lo que hace que no se olviden.', accion: 'repaso', boton: 'Repasar ahora' };
  if (hoy.retos < d.ajustes.meta) { const f = d.ajustes.meta - hoy.retos; return { id: 'retos', titulo: hoy.retos ? `Te faltan ${f} retos para tu meta` : `Hoy toca: ${d.ajustes.meta} retos`, texto: `Tema actual: «${t.titulo}». Unos minutos en cada espera de Claude bastan.`, accion: 'retos', boton: hoy.retos ? 'Seguir con los retos' : 'Empezar' }; }
  if (I && hoy.ingles < d.ajustes.metaIngles) { const u = unidadActual(d, I), f = d.ajustes.metaIngles - hoy.ingles; return { id: 'ingles', titulo: hoy.ingles ? `Te faltan ${f} ejercicios de inglés` : `Ahora, ${d.ajustes.metaIngles} ejercicios de inglés`, texto: `Unidad ${u.n}: «${u.titulo}». Escuchar, leer y hablar el inglés que usan los programadores.`, accion: 'ingles', boton: 'Practicar inglés' }; }
  if (hoy.foco < 10) return { id: 'foco', titulo: 'Meta de retos cumplida: falta el foco', texto: 'Lo nuevo se aprende escribiendo código con calma. Un bloque al día marca la diferencia.', accion: 'foco', boton: 'Empezar el bloque' };
  return { id: 'hecho', titulo: 'Día completo', texto: 'Retos y foco hechos. Si quieres más, prueba algo tuyo en el laboratorio o adelanta el tema siguiente.', accion: 'lab', boton: 'Ir al laboratorio' };
}

/* ── Estadísticas ── */
function semana(d) { const r = []; for (let k = 6; k >= 0; k--) { const c = diasAtras(k); r.push({ k: c, ...leeDia(d, c) }); } return r; }
function totales(d) {
  let retos = 0, aciertos = 0, foco = 0, segEspera = 0, esperas = 0, perdidas = 0, ingles = 0, inglesOk = 0, jerga = 0;
  for (const x of Object.values(d.dias)) { retos += x.retos; aciertos += x.aciertos; foco += x.foco; segEspera += x.segEspera; esperas += x.esperas; perdidas += x.perdidas; ingles += x.ingles || 0; inglesOk += x.inglesOk || 0; jerga += x.jerga || 0; }
  return { retos, aciertos, foco, segEspera, esperas, perdidas, ingles, inglesOk, jerga, dias: Object.values(d.dias).filter(x => x.retos > 0 || x.foco > 0 || x.ingles > 0 || x.jerga > 0).length };
}

/* ── Código para pasar el progreso a otro dispositivo ── */
const aBase64 = s => (typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, 'utf8').toString('base64'));
const deBase64 = s => (typeof atob === 'function' ? decodeURIComponent(escape(atob(s))) : Buffer.from(s, 'base64').toString('utf8'));
const codigoProgreso = d => 'DOJO1:' + aBase64(JSON.stringify(d));
function leeCodigoProgreso(txt, D, I, J) {
  const m = /DOJO1:([A-Za-z0-9+/=]+)/.exec(String(txt).replace(/\s+/g, ''));
  if (!m) throw new Error('Ese texto no es un código de progreso del Dojo. Tiene que empezar por DOJO1:');
  let d; try { d = JSON.parse(deBase64(m[1])); } catch (e) { throw new Error('El código está incompleto. Cópialo entero otra vez.'); }
  if (!d || typeof d !== 'object' || (d.v !== 1 && d.v !== 2) || typeof d.dias !== 'object') throw new Error('El código no tiene el formato del Dojo.');
  return normaliza(d, D, I, J);
}

const Nucleo = { VERSION, LANGS, INTERVALOS, RANGOS, PUNTOS, hoyClave, sumaDias, diasAtras, NUEVO, normaliza, estadoTema, dominados, temaActual, racha, dia, leeDia,
  PASOS_PROYECTO, registraPaso, rangoDe, rangoActual, estadoExamen, planExamen, registraExamen, registraRepasoExamen, registraFallo, multaExamen, sumaPuntos,
  estadoBloque, bloquesDominados, bloqueActual, pendientesJerga, registraJerga, apuntaTarjeta, pendientes, debiles, registraReto, registraEjercicio, ejercicioHecho, siguientePaso, semana, totales, codigoProgreso, leeCodigoProgreso,
  estadoUnidad, unidadesDominadas, unidadActual, pendientesIngles, registraIngles, registraConversacion,
  AREAS, REPARTO, NOMBRE_AREA, topes, estadoAreas, requisitosDominio };
if (typeof module !== 'undefined' && module.exports) module.exports = Nucleo; else raiz.Nucleo = Nucleo;
})(typeof window !== 'undefined' ? window : globalThis);
