/* Dojo de código · el examen de ascenso de rango.
   Evalúa lo que debe saber ese rango: código, inglés y habla de programador. Sin ninguna ayuda: ni tutor, ni
   pistas, ni pronunciación escrita, ni «paso a paso», y no se sabe si una respuesta está bien hasta el final.
   Salir de la pantalla o cerrar la app a mitad cuenta como suspenso. Suspender resta puntos y deja lo fallado
   en un repaso obligatorio (con explicaciones); al terminarlo y recuperar los puntos, se puede repetir.
   La lógica (qué entra, la nota, subir de rango) está en nucleo.js; aquí solo la pantalla. */
(function (raiz) {
'use strict';
raiz.VistaExamen = function (ctx) {
  const { P, N, D, I, J, U, Voz, ir, aviso, trataPuntos, chipPuntos, vista } = ctx;
  const { $, h, ls, NL, bloqueCodigo, salidaBloque } = U;
  const st = { fase: 'intro', k: 0, preguntas: [], i: 0, resp: null, armado: [], res: null };
  const EN_CURSO = 'examen-en-curso';
  // Solo para las pruebas automáticas: deja ver el examen en curso
  try { if (localStorage.getItem('dojo-pruebas') === '1') raiz.__examen = () => st; } catch (e) { /* sin almacenamiento */ }

  /* Si la app se cerró a mitad de un examen, cuenta como suspenso (si no, bastaría con recargar para huir de él) */
  function revisaAbandono() {
    const x = ls.get(EN_CURSO, null); if (!x) return;
    ls.set(EN_CURSO, null);
    // al abrir la app no se vibra ni se celebra nada: solo se anota (el rango se repinta al arrancar)
    if (P.d.rangoMax < x.rango) { N.registraExamen(P.d, x.rango, { bien: 0, total: x.total || 1, abandonado: true, fallos: Array.isArray(x.plan) ? x.plan : [] }); P.cambio(); aviso('El último examen se quedó a medias: cuenta como suspendido y resta puntos.', 5500); }
  }

  function generaPregunta(x) {
    if (x.area === 'codigo') {
      let r = null;
      try { r = D.generar(x.spec); } catch (e) { r = null; }
      let spec = x.spec;
      if (!r) { spec = Object.assign({}, x.spec, { tipo: 'salida' }); try { r = D.generar(spec); } catch (e) { r = null; } }
      return r ? { area: 'codigo', r, spec } : null;
    }
    let e = null; try { e = x.area === 'habla' ? J.generar(x.spec) : I.generar(x.spec, { sale: Voz.sale, entra: false }); } catch (err) { e = null; }
    return e ? { area: x.area, e, spec: x.spec } : null;
  }
  function empezar() {
    const ex = N.estadoExamen(P.d); if (!ex || !ex.disponible) { aviso('Este examen todavía no está disponible.'); return; }
    const plan = N.planExamen(D, I, ex.rango, Math.floor(Math.random() * 2147483647), { sale: Voz.sale }, J);
    const preguntas = plan.map(generaPregunta).filter(Boolean);
    Object.assign(st, { fase: 'preguntas', k: ex.rango, preguntas, i: 0, resp: null, armado: [], res: null });
    ls.set(EN_CURSO, { rango: ex.rango, total: preguntas.length, inicio: Date.now(), plan: preguntas.map(q => ({ area: q.area, spec: q.spec })) });
    pinta(); window.scrollTo(0, 0); hablaSiToca();
  }
  const actual = () => st.preguntas[st.i];
  function hablaSiToca() { const q = actual(); if (q && q.area === 'ingles' && q.e.audio && Voz.sale) Voz.decir(q.e.audio); }

  /* ── Corregir (solo al final) ── */
  function esCorrecta(q) {
    const v = q.resp; if (v === null || v === undefined) return false;
    if (q.area === 'codigo') {
      const r = q.r;
      if (r.tipo === 'error') return v === r.lineaMal;
      if (r.tipo === 'ordenar') return D.compruebaOrden(r, v).ok;
      return v === r.correcta;
    }
    const e = q.e;
    if (q.area === 'habla') return v === e.correcta;
    if (e.tipo === 'ordenar') return I.compruebaOrden(e, v);
    if (e.tipo === 'traducir' || e.tipo === 'dictado') return I.comparaTexto(v, e.en, e.alt).ok;
    return v === e.correcta;
  }
  function siguiente() {
    const q = actual(); q.resp = st.resp;
    Voz.callar();
    if (st.i + 1 < st.preguntas.length) { st.i++; st.resp = null; st.armado = []; pinta(); hablaSiToca(); const t = $('#v-examen .pregunta'); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest' }); return; }
    terminar();
  }
  function terminar(abandonado = false) {
    st.preguntas.forEach(q => { q.ok = esCorrecta(q); });
    const bien = abandonado ? 0 : st.preguntas.filter(q => q.ok).length, total = st.preguntas.length;
    ls.set(EN_CURSO, null);
    const fallos = st.preguntas.filter(q => abandonado || !q.ok).map(q => ({ area: q.area, spec: q.spec }));
    st.res = N.registraExamen(P.d, st.k, { bien, total, abandonado, fallos });
    st.res.bien = bien; st.res.total = total; st.fase = abandonado ? 'intro' : 'resultado';
    trataPuntos(st.res, st.res.aprobado);
    if (!abandonado) { pinta(); window.scrollTo(0, 0); }
  }
  /* Llamada por la app al cambiar de pantalla: salir a mitad es abandonar */
  function salir() {
    if (st.fase === 'resultado' || st.fase === 'repaso') { st.fase = 'intro'; return; }
    if (st.fase !== 'preguntas') return;
    Voz.callar(); terminar(true);
    aviso('Saliste del examen: cuenta como suspendido y resta puntos. Repasa y vuelve a intentarlo.', 5500);
  }

  /* ── Pintar una pregunta ── */
  function opciones(textos, enCodigo, lang, esIngles) {
    const g = h('div', { class: 'opciones' + (enCodigo || textos.some(t => t.length > 28 || t.split('\n').length > 3) ? ' una' : ''), role: 'group', 'aria-label': 'Opciones' });
    textos.forEach((t, k) => g.append(h('button', { class: 'opcion', 'aria-pressed': String(st.resp === k), 'aria-label': `Opción ${k + 1}`, onclick: () => { st.resp = k; pinta(); } },
      h('span', { class: 'letra', 'aria-hidden': 'true' }, String(k + 1)),
      enCodigo ? bloqueCodigo(t, lang) : h('pre', { class: esIngles ? 'texto-opcion' : null, lang: esIngles ? 'en' : null }, t === '' ? '(no muestra nada)' : t))));
    return g;
  }
  function entradas(r) { return r.entradas && r.entradas.length ? h('p', { class: 'fila' }, h('span', { class: 'tenue' }, 'El usuario escribe:'), ...r.entradas.map(e => h('span', { class: 'insignia ai mono' }, e))) : null; }
  function cuerpoCodigo(r) {
    const l = r.lang;
    if (r.tipo === 'salida') return [h('h2', null, '¿Qué muestra este programa?'), entradas(r), bloqueCodigo(r.codigo, l), opciones(r.opciones)];
    if (r.tipo === 'hueco') return [h('h2', null, '¿Qué va en el hueco?'), h('p', { class: 'tenue' }, 'Para que muestre exactamente esto:'), salidaBloque(r.salida), entradas(r), bloqueCodigo(r.codigo, l, { hueco: r.hueco, relleno: st.resp !== null ? r.opciones[st.resp] : null }), opciones(r.opciones)];
    if (r.tipo === 'traducir') return [h('h2', null, `¿Cuál es este programa en ${NL[l]}?`), h('span', { class: 'etiqueta' }, 'En ' + NL[r.origen]), bloqueCodigo(r.codigoOrigen, r.origen), entradas(r), opciones(r.opciones, true, l)];
    if (r.tipo === 'error') {
      const b = bloqueCodigo(r.codigoMal, l, { tocar: i => { st.resp = i; pinta(); } });
      if (st.resp !== null) { const li = b.querySelectorAll('li')[st.resp]; if (li) { li.classList.add('elegida'); li.setAttribute('aria-selected', 'true'); } }
      return [h('h2', null, 'Encuentra el error'), h('p', { class: 'tenue' }, 'Toca la línea donde está el error.'), entradas(r), b];
    }
    // ordenar
    const quedan = r.piezas.map((t, k) => k).filter(k => !st.armado.includes(k));
    st.resp = quedan.length ? null : st.armado.map(k => r.piezas[k]);
    return [h('h2', null, 'Ordena las líneas'), h('p', { class: 'tenue' }, 'Para que muestre exactamente esto:'), salidaBloque(r.salida), entradas(r),
      h('div', { class: 'armado', role: 'group', 'aria-label': 'Tu programa' }, ...st.armado.map((k, j) => h('button', { class: 'pieza', 'aria-label': 'Quitar ' + r.piezas[k].trim(), onclick: () => { st.armado.splice(j, 1); pinta(); } }, r.piezas[k]))),
      h('div', { class: 'piezas' }, ...quedan.map(k => h('button', { class: 'pieza', 'aria-label': 'Añadir ' + r.piezas[k].trim(), onclick: () => { st.armado.push(k); pinta(); } }, r.piezas[k])))];
  }
  function campo(placeholder) {
    const c = h('input', { class: 'campo respuesta-en', id: 'ex-texto', type: 'text', lang: 'en', autocomplete: 'off', spellcheck: 'false', placeholder, 'aria-label': 'Tu respuesta en inglés',
      oninput: () => { st.resp = c.value.trim() ? c.value : null; const b = $('#ex-siguiente'); if (b) b.disabled = !st.resp; },
      onkeydown: ev => { if (ev.key === 'Enter' && st.resp) { ev.preventDefault(); if (st.fase === 'repaso') corrigeRepaso(); else siguiente(); } } });
    c.value = st.resp || ''; return c;
  }
  const botonOir = (t, texto) => (Voz.sale ? h('button', { class: 'btn oir grande', type: 'button', onclick: () => Voz.decir(t) }, texto) : null);
  function cuerpoIngles(e) {
    if (e.tipo === 'significado') return [h('h2', null, '¿Qué significa?'), h('p', { class: 'en-grande', lang: 'en' }, e.en), opciones(e.opciones)];
    if (e.tipo === 'palabra') return [h('h2', null, '¿Cómo se dice en inglés?'), h('p', { class: 'es-grande' }, e.es), opciones(e.opciones, false, null, true)];
    if (e.tipo === 'escucha') return [h('h2', null, 'Escucha y elige lo que oíste'), botonOir(e.audio, 'Escuchar'), opciones(e.opciones, false, null, true)];
    if (e.tipo === 'hueco') return [h('h2', null, 'Completa la frase'), h('p', { class: 'frase-en', lang: 'en' }, e.conHueco), opciones(e.opciones, false, null, true)];
    if (e.tipo === 'error') return [h('h2', null, '¿Qué te dice este error?'), h('div', { class: 'salida mono', lang: 'en' }, e.mensaje), opciones(e.opciones)];
    if (e.tipo === 'traducir') return [h('h2', null, 'Escríbelo en inglés'), h('p', { class: 'es-grande' }, e.es), campo('En inglés')];
    if (e.tipo === 'dictado') return [h('h2', null, 'Escucha y escríbelo'), botonOir(e.audio, 'Escuchar'), campo('Lo que oyes')];
    // ordenar
    const quedan = e.fichas.map((t, k) => k).filter(k => !st.armado.includes(k));
    st.resp = st.armado.length ? st.armado.map(k => e.fichas[k]) : null;
    return [h('h2', null, 'Ordena la frase'), h('p', null, 'En inglés: «', h('b', null, e.es), '»'),
      h('div', { class: 'armado fichas-armadas', role: 'group', lang: 'en', 'aria-label': 'Tu frase' }, ...st.armado.map((k, j) => h('button', { class: 'ficha', 'aria-label': 'Quitar ' + e.fichas[k], onclick: () => { st.armado.splice(j, 1); pinta(); } }, e.fichas[k]))),
      h('div', { class: 'fichas', lang: 'en' }, ...quedan.map(k => h('button', { class: 'ficha', 'aria-label': 'Añadir ' + e.fichas[k], onclick: () => { st.armado.push(k); pinta(); } }, e.fichas[k])))];
  }
  function cuerpoHabla(e) {
    const ing = e.tipo === 'ingles' || e.tipo === 'frase-en';
    if (e.tipo === 'definicion') return [h('h2', null, '¿Qué término es?'), h('p', { class: 'es-grande' }, e.def), opciones(e.opciones)];
    if (e.tipo === 'termino') return [h('h2', null, `¿Qué significa «${e.es}»?`), opciones(e.opciones)];
    if (e.tipo === 'ingles') return [h('h2', null, `¿Cómo se dice «${e.es}» en inglés?`), opciones(e.opciones, false, null, true)];
    if (e.tipo === 'hueco') return [h('h2', null, 'Completa con el término correcto'), h('p', { class: 'frase-en' }, e.conHueco), opciones(e.opciones)];
    if (e.tipo === 'profesional') return [h('h2', null, '¿Cómo lo dice un profesional?'), h('p', { class: 'situacion' }, e.situacion), opciones(e.opciones)];
    return [h('h2', null, 'Dilo en inglés profesional'), h('p', { class: 'situacion' }, e.situacion), h('p', { class: 'es-grande' }, '«' + e.es + '»'), opciones(e.opciones, false, null, ing)];
  }
  const NOMBRE_AREA = { codigo: 'Código', ingles: 'Inglés', habla: 'Habla de programador' };
  function vistaPregunta() {
    const q = actual(), n = st.preguntas.length, R = N.RANGOS[st.k];
    const partes = q.area === 'codigo' ? cuerpoCodigo(q.r) : q.area === 'habla' ? cuerpoHabla(q.e) : cuerpoIngles(q.e);
    const ultima = st.i + 1 === n;
    return h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Examen'),
      h('div', { class: 'tarjeta examen-cab' },
        h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Examen para «${R.n}»`), h('span', { class: 'insignia num' }, `Pregunta ${st.i + 1} de ${n}`)),
        h('div', { class: 'barra', role: 'progressbar', 'aria-label': 'Avance del examen', 'aria-valuemin': '0', 'aria-valuemax': String(n), 'aria-valuenow': String(st.i) }, h('i', { style: `width:${Math.round(st.i / n * 100)}%` })),
        h('p', { class: 'tenue', style: 'font-size:13px' }, 'Sin ayuda: no verás si aciertas hasta el final. Si sales de esta pantalla, el examen cuenta como suspendido.')),
      h('article', { class: 'tarjeta reto pregunta' + (st.pintada !== q ? ' entra' : '') },
        h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, NOMBRE_AREA[q.area]), q.area === 'codigo' ? h('span', { class: 'insignia ai' }, NL[q.r.lang]) : null),
        ...partes,
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'ex-siguiente', disabled: st.resp === null ? true : null, onclick: siguiente }, ultima ? 'Terminar y ver la nota' : 'Siguiente'))));
  }

  /* ── Resultado ── */
  function correctaTexto(q) {
    if (q.area === 'codigo') {
      const r = q.r;
      if (r.tipo === 'error') return `El error estaba en la línea ${r.lineaMal + 1}: ${r.explicaError}`;
      if (r.tipo === 'ordenar') return 'Un orden que funciona:\n' + r.codigo;
      if (r.tipo === 'traducir') return 'Era:\n' + r.opciones[r.correcta];
      return 'Era: ' + (r.opciones[r.correcta] === '' ? '(no muestra nada)' : r.opciones[r.correcta]);
    }
    const e = q.e;
    if (q.area === 'habla') return 'Era: ' + e.opciones[e.correcta] + (e.tipo === 'profesional' ? `\nEn inglés: ${e.en}` : e.es && e.tipo !== 'definicion' ? `\n(${e.es} = ${e.en}: ${e.def || ''})` : '');
    if (['ordenar', 'traducir', 'dictado'].includes(e.tipo)) return 'Era: ' + e.en;
    return 'Era: ' + e.opciones[e.correcta] + (e.en && e.tipo !== 'palabra' && e.tipo !== 'escucha' ? ` (${e.en})` : '');
  }
  function queEra(q) {
    if (q.area === 'codigo') return `${D.NOMBRE_TIPO[q.r.tipo]} · ${NL[q.r.lang]} · ${D.temas.find(t => t.id === q.r.tema).titulo}`;
    if (q.area === 'habla') return `${J.NOMBRE_TIPO[q.e.tipo]} · habla de programador, bloque ${J.porId[q.e.bloque].n}`;
    return `${I.NOMBRE_TIPO[q.e.tipo]} · inglés, unidad ${I.porId[q.e.unidad].n}`;
  }
  function vistaResultado() {
    const r = st.res, R = N.RANGOS[st.k], nota = Math.round(r.bien / r.total * 100), minimo = Math.round(R.examen.nota * 100);
    const fallos = st.preguntas.filter(q => !q.ok);
    const cod = st.preguntas.filter(q => q.area === 'codigo'), ing = st.preguntas.filter(q => q.area === 'ingles'), hab = st.preguntas.filter(q => q.area === 'habla');
    const ex = N.estadoExamen(P.d);
    return h('div', { class: 'columna' },
      h('section', { class: 'tarjeta resultado-examen ' + (r.aprobado ? 'aprobado' : 'suspendido'), role: 'status' },
        h('span', { class: 'etiqueta' }, `Examen para «${R.n}»`),
        h('h1', null, r.aprobado ? `Aprobado: ya eres ${R.n}` : 'Suspendido'),
        h('p', { class: 'nota-examen num' }, `${nota} %`, h('small', null, ` · ${r.bien} de ${r.total} bien · hacía falta el ${minimo} %`)),
        h('p', { class: 'tenue' }, `Código: ${cod.filter(q => q.ok).length} de ${cod.length} · Inglés: ${ing.filter(q => q.ok).length} de ${ing.length} · Habla: ${hab.filter(q => q.ok).length} de ${hab.length}`),
        r.aprobado ? h('p', null, `+${N.PUNTOS.examen} puntos. ${ex ? `El siguiente examen, el de «${ex.nombre}», se abre con ${U.miles(ex.min)} puntos.` : 'Era el último: estás en la cima.'}`)
          : h('p', null, `${r.puntos ? `−${U.miles(-r.puntos)} puntos. ` : ''}Ahora toca repasar las ${r.repaso} preguntas que fallaste, con su explicación, y volver a tener ${U.miles(ex ? ex.objetivo : 0)} puntos. Entonces podrás repetirlo.`),
        h('div', { class: 'fila' }, r.aprobado ? h('button', { class: 'btn primario', onclick: () => { st.fase = 'intro'; ir('hoy'); } }, 'Volver a Hoy')
          : h('button', { class: 'btn primario', onclick: empiezaRepaso }, 'Repasar lo que fallé'))),
      fallos.length ? h('section', { class: 'tarjeta' }, h('h2', null, `Lo que fallaste (${fallos.length})`),
        h('ol', { class: 'repaso-examen' }, ...fallos.map(q => h('li', null, h('b', null, queEra(q)), h('span', { class: 'tenue', style: 'white-space:pre-wrap' }, correctaTexto(q)))))) : null);
  }

  /* ── La portada del examen: qué entra, las reglas y si está disponible ── */
  function vistaIntro() {
    const ex = N.estadoExamen(P.d), rg = N.rangoActual(P.d);
    if (!ex) return h('div', { class: 'columna' }, h('section', { class: 'tarjeta' }, h('h1', null, 'No quedan exámenes'), h('p', null, 'Aprobaste los nueve. Eres Ingeniero de élite: mantén los puntos practicando.'), h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => ir('hoy') }, 'Volver a Hoy'))));
    const temas = D.temas.slice(0, ex.temas), unidades = I.unidades.slice(0, ex.unidades), hist = P.d.examenes.historial.filter(x => x.rango === ex.rango);
    const estado = ex.disponible ? h('div', { class: 'fila' }, h('button', { class: 'btn primario grande', id: 'ex-empezar', onclick: empezar }, 'Empezar el examen'), h('button', { class: 'btn', onclick: () => ir('hoy') }, 'Ahora no'))
      : rg.i < P.d.rangoMax ? h('p', { class: 'insignia mal', style: 'white-space:normal' }, `Primero recupera tu rango: te faltan ${U.miles(N.RANGOS[P.d.rangoMax].min - P.d.puntos)} puntos.`)
      : ex.repaso ? h('div', { class: 'pila' }, h('p', { class: 'insignia mal', style: 'white-space:normal' }, `Suspendiste: primero repasa las ${ex.repaso} ${ex.repaso === 1 ? 'pregunta que fallaste' : 'preguntas que fallaste'}${ex.espera ? ` y recupera ${U.miles(ex.espera)} puntos` : ''}.`), h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'ex-repasar', onclick: empiezaRepaso }, 'Repasar lo que fallé')))
      : ex.espera && ex.objetivo > ex.min ? h('p', { class: 'insignia kihada', style: 'white-space:normal' }, `Repaso hecho. Vuelve a tus ${U.miles(ex.objetivo)} puntos para repetirlo: te faltan ${U.miles(ex.espera)}.`)
      : h('p', { class: 'insignia kihada', style: 'white-space:normal' }, `Se abre con ${U.miles(ex.min)} puntos: te faltan ${U.miles(ex.espera)}.`);
    return h('div', { class: 'columna' },
      h('section', { class: 'tarjeta examen-intro' },
        h('div', { class: 'cabeza-rango' }, U.emblema(ex.rango, 58, ex.nombre), h('div', { class: 'pila', style: 'gap:2px' }, h('span', { class: 'etiqueta' }, `Examen de ascenso · rango ${ex.rango + 1} de ${N.RANGOS.length}`), h('h1', null, ex.nombre), h('span', { class: 'tenue' }, N.RANGOS[ex.rango].lema))),
        h('ul', { class: 'lista' },
          h('li', null, h('b', null, `${ex.preguntas} preguntas`), ` mezcladas: código (PSeInt, Python y C++), inglés y habla de programador.`),
          h('li', null, h('b', null, `Para aprobar: el ${Math.round(ex.nota * 100)} %`), ` (${Math.ceil(ex.preguntas * ex.nota)} bien como mínimo).`),
          h('li', null, h('b', null, 'Sin ninguna ayuda: '), 'ni tutor, ni pistas, ni pronunciación escrita, ni paso a paso. No sabrás si aciertas hasta el final.'),
          h('li', null, h('b', null, 'Sin salir: '), 'si cambias de pantalla o cierras la app, cuenta como suspendido.'),
          h('li', null, h('b', null, `Si suspendes, pierdes ${U.miles(ex.multa)} puntos`), ', repasas lo que fallaste y, cuando recuperes los puntos, lo repites. Aprobar da +' + N.PUNTOS.examen + ' puntos.')),
        estado),
      h('section', { class: 'tarjeta' }, h('h2', null, `Lo que debe saber un ${ex.nombre}`), h('ul', { class: 'lista sabe' }, ...ex.sabe.map(x => h('li', null, x)))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Lo que entra'),
        h('div', { class: 'tres-col' },
          h('div', { class: 'pila' }, h('span', { class: 'etiqueta' }, `Programación · temas 1 a ${ex.temas}`), h('ol', { class: 'lista' }, ...temas.map(t => h('li', null, t.titulo)))),
          h('div', { class: 'pila' }, h('span', { class: 'etiqueta' }, `Inglés · unidades 1 a ${ex.unidades}`), h('ol', { class: 'lista' }, ...unidades.map(u => h('li', null, u.titulo)))),
          h('div', { class: 'pila' }, h('span', { class: 'etiqueta' }, `Habla · bloques 1 a ${ex.bloques}`), h('ol', { class: 'lista' }, ...J.bloques.slice(0, ex.bloques).map(b => h('li', null, b.titulo)))))),
      hist.length ? h('section', { class: 'tarjeta' }, h('h2', null, 'Tus intentos'), h('ul', { class: 'lista' }, ...hist.slice(-5).reverse().map(x => h('li', { class: 'num' }, `${x.dia}: ${x.abandonado ? 'abandonado' : `${x.bien} de ${x.total} (${Math.round(x.bien / x.total * 100)} %)`} · ${x.aprobado ? 'aprobado' : 'suspendido'}`)))) : null);
  }

  /* ── El repaso obligatorio de lo fallado: con corrección y explicación en cada pregunta ── */
  function preparaRepaso() {
    const x = P.d.examenes.repaso[0]; if (!x) { st.fase = 'intro'; return false; }
    const q = generaPregunta(x); if (!q) { P.d.examenes.repaso.shift(); P.cambio(); return preparaRepaso(); }
    Object.assign(st, { fase: 'repaso', preguntas: [q], i: 0, resp: null, armado: [], corregida: null }); return true;
  }
  function empiezaRepaso() { if (vista() !== 'examen') ir('examen'); if (preparaRepaso()) { pinta(); window.scrollTo(0, 0); hablaSiToca(); } else pinta(); }
  function corrigeRepaso() {
    const q = actual(); q.resp = st.resp; q.ok = esCorrecta(q);
    const r = N.registraRepasoExamen(P.d, 0, q.ok); st.corregida = r; trataPuntos(r, q.ok); pinta();
  }
  function vistaRepaso() {
    const q = actual(), quedan = P.d.examenes.repaso.length + (st.corregida && q.ok ? 1 : 0), ex = N.estadoExamen(P.d);
    const partes = q.area === 'codigo' ? cuerpoCodigo(q.r) : q.area === 'habla' ? cuerpoHabla(q.e) : cuerpoIngles(q.e);
    const c = st.corregida;
    return h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Repaso del examen'),
      h('div', { class: 'tarjeta examen-cab' }, h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Repaso del examen de «${ex ? ex.nombre : ''}»`), h('span', { class: 'insignia num' }, `Quedan ${quedan}`)),
        h('p', { class: 'tenue', style: 'font-size:13px' }, 'Lo que fallaste en el examen. Aquí sí ves la respuesta: acierta cada una para quitarla. Fallar resta puntos.')),
      h('article', { class: 'tarjeta reto pregunta' + (st.pintada !== q ? ' entra' : '') },
        h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, NOMBRE_AREA[q.area]), q.area === 'codigo' ? h('span', { class: 'insignia ai' }, NL[q.r.lang]) : null),
        ...(c ? [h('div', { class: 'tapa-pregunta', inert: true }, ...partes)] : partes),
        c ? h('div', { class: 'respuesta ' + (q.ok ? 'si' : 'no'), role: 'status' }, h('div', { class: 'entre' }, h('h3', null, q.ok ? 'Correcto: quitada del repaso' : 'No era esa: se queda en el repaso'), chipPuntos(c)),
            h('p', { style: 'white-space:pre-wrap' }, correctaTexto(q)), q.area === 'codigo' && q.r.explica ? h('p', { class: 'tenue' }, q.r.explica) : null,
            h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'ex-siguiente', onclick: () => { if (P.d.examenes.repaso.length && preparaRepaso()) { pinta(); hablaSiToca(); } else { st.fase = 'intro'; pinta(); aviso(N.estadoExamen(P.d) && N.estadoExamen(P.d).disponible ? '¡Repaso hecho! Ya puedes repetir el examen.' : 'Repaso hecho. Ahora recupera los puntos para repetir el examen.', 5000); } } }, P.d.examenes.repaso.length ? 'Siguiente' : 'Terminar el repaso')))
          : h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'ex-siguiente', disabled: st.resp === null ? true : null, onclick: corrigeRepaso }, 'Comprobar'))));
  }

  function pinta() {
    const el = $('#v-examen'); if (!el) return;
    const foco = document.activeElement && document.activeElement.id;
    el.textContent = '';
    if (st.fase === 'preguntas' && actual()) { el.append(vistaPregunta()); st.pintada = actual(); }
    else if (st.fase === 'resultado' && st.res) el.append(vistaResultado());
    else if (st.fase === 'repaso' && actual()) { el.append(vistaRepaso()); st.pintada = actual(); }
    else { st.fase = 'intro'; el.append(vistaIntro()); }
    if (foco && document.getElementById(foco) && el.contains(document.getElementById(foco))) document.getElementById(foco).focus({ preventScroll: true });
  }
  // Teclado: 1 a 4 eligen, Enter pasa a la siguiente
  document.addEventListener('keydown', ev => {
    if (vista() !== 'examen' || (st.fase !== 'preguntas' && !(st.fase === 'repaso' && !st.corregida)) || ev.ctrlKey || ev.metaKey || ev.altKey || document.querySelector('.capa')) return;
    if (ev.target.closest && ev.target.closest('input, textarea, select')) return;
    const q = actual(); if (!q) return; const ops = q.area === 'codigo' ? (q.r.tipo !== 'error' && q.r.tipo !== 'ordenar' ? q.r.opciones : null) : q.e.opciones;
    if (ops && /^[1-4]$/.test(ev.key) && +ev.key <= ops.length) { ev.preventDefault(); st.resp = +ev.key - 1; pinta(); }
    else if (ev.key === 'Enter' && st.resp !== null && !(ev.target.closest && ev.target.closest('button'))) { ev.preventDefault(); if (st.fase === 'repaso') corrigeRepaso(); else siguiente(); }
  });

  return { pinta, salir, revisaAbandono, empiezaRepaso, enCurso: () => st.fase === 'preguntas', estado: st };
};
})(window);
