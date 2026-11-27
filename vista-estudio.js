/* Dojo de código · Estudio intensivo: estudiar un lenguaje a fondo, desde cero, sin puntos ni presión.
   Guía por capítulos (explicación, ejemplos que se ejecutan, palabras, errores típicos), chuleta,
   diccionario, prueba sin puntos y laboratorio libre. Nada de aquí cuenta para el rango ni resta. */
(function (raiz) {
'use strict';
raiz.VistaEstudio = function (ctx) {
  const { D, G, W, M, U, ir, aviso, abrirLab, vista } = ctx;
  const { $, h, ls, NL, bloqueCodigo, salidaBloque } = U;
  const st = { lang: ls.get('estudio-lang', null), modo: 'inicio', cap: 0, busca: '', prueba: null, practica: {} };
  const guia = () => G.guias[st.lang];
  const leidos = () => ls.get('estudio-leidos-' + st.lang, {});
  const marcaLeido = id => { const x = leidos(); if (!x[id]) { x[id] = true; ls.set('estudio-leidos-' + st.lang, x); } };
  /* Cada cambio de pantalla dentro de la guía queda en el historial: el botón «atrás» del móvil o del
     navegador vuelve al capítulo (o a la pantalla) de antes en vez de salir de la sección. */
  const foto = () => ({ modo: st.modo, cap: st.cap, lang: st.lang });
  const ir_ = (modo, extra) => {
    try { if (!(history.state && history.state.estudio)) history.replaceState({ estudio: foto() }, '', location.hash || '#estudio'); } catch (e) { /* sin historial */ }
    Object.assign(st, { modo }, extra || {}); pinta(); window.scrollTo(0, 0);
    try { history.pushState({ estudio: foto() }, '', location.hash || '#estudio'); } catch (e) { /* sin historial */ }
  };
  window.addEventListener('popstate', e => {
    const s = e.state && e.state.estudio; if (!s || location.hash !== '#estudio') return;
    Object.assign(st, s); if (st.modo === 'prueba' && !st.prueba) st.modo = 'idioma';
    if (vista() === 'estudio') { pinta(); window.scrollTo(0, 0); }
  });
  const ejecuta = (codigo, entradas) => { try { return M.correr(G.prepara(codigo, st.lang, D), st.lang, entradas); } catch (e) { return { salida: '', error: { message: String(e.message || e), linea: 0 } }; } };
  const cabecera = (titulo, sub) => h('div', { class: 'entre' }, h('div', { class: 'fila' }, st.modo !== 'idioma' ? h('button', { class: 'btn plano', onclick: () => ir_('idioma') }, `← Guía de ${guia().nombre}`) : h('button', { class: 'btn plano', onclick: () => ir_('inicio', { lang: null }) }, '← Elegir lenguaje')), h('span', { class: 'insignia' }, 'Sin puntos: aquí se estudia'));

  /* ── Un ejemplo que se puede ejecutar aquí mismo ── */
  function ejemplo(ej) {
    const out = h('div', { class: 'pila', hidden: true, 'aria-live': 'polite' });
    return h('div', { class: 'ejemplo-estudio pila' }, bloqueCodigo(ej.codigo, st.lang),
      ej.entradas.length ? h('p', { class: 'fila' }, h('span', { class: 'tenue' }, 'Datos que escribe el usuario:'), ...ej.entradas.map(e => h('span', { class: 'insignia ai mono' }, e))) : null,
      ej.nota ? h('p', { class: 'tenue nota-ejemplo' }, ej.nota) : null,
      h('div', { class: 'fila' }, h('button', { class: 'btn chico', onclick: () => { const r = ejecuta(ej.codigo, ej.entradas); out.hidden = false; out.textContent = ''; out.append(h('span', { class: 'etiqueta' }, 'Lo que muestra'), r.error ? h('p', { class: 'aviso-codigo' }, `Error en la línea ${r.error.linea}: ${r.error.message}`) : salidaBloque((r.salida || '').replace(/\n$/, ''))); } }, '▶ Ejecutar'),
        h('button', { class: 'btn chico plano', onclick: () => { ls.set('estudio-lab-' + st.lang, ej.codigo); ls.set('estudio-datos-' + st.lang, ej.entradas.join('\n')); ir_('lab'); } }, 'Cambiarlo en el laboratorio libre'),
        h('button', { class: 'btn chico plano', onclick: () => abrirLab({ lang: st.lang, codigo: G.prepara(ej.codigo, st.lang, D), entradas: ej.entradas, traza: true }) }, 'Ver paso a paso')),
      out);
  }

  /* ── Un capítulo ── */
  function vistaCapitulo() {
    const g = guia(), c = g.capitulos[st.cap], tareas = c.practica ? W.tareas.filter(t => t.tema === c.practica) : [];
    marcaLeido(c.id);
    return h('div', { class: 'columna' }, cabecera(), navCapitulos(g),
      h('section', { class: 'tarjeta' }, h('span', { class: 'etiqueta' }, `${g.nombre} · capítulo ${st.cap + 1} de ${g.capitulos.length}`), h('h1', null, c.titulo), h('p', { class: 'objetivo' }, h('b', null, 'Al terminar sabrás: '), c.objetivo)),
      ...c.secciones.map(s => h('section', { class: 'tarjeta' }, h('h2', null, s.t), ...s.p.map(x => h('p', null, x)), s.ej ? ejemplo(s.ej) : null)),
      c.palabras.length ? h('section', { class: 'tarjeta' }, h('h2', null, 'Las palabras de este capítulo'),
        h('dl', { class: 'palabras-estudio' }, ...c.palabras.map(w => [h('dt', null, h('code', { class: 'mono' }, w.palabra)), h('dd', null, w.que, h('span', { class: 'mono tenue ejemplo-palabra' }, w.ejemplo))]))) : null,
      c.errores.length ? h('section', { class: 'tarjeta' }, h('h2', null, 'Errores típicos'),
        h('ul', { class: 'errores-estudio' }, ...c.errores.map(x => h('li', null, h('b', null, x.pasa), h('span', null, 'Por qué: ' + x.porque), h('span', { class: 'arreglo' }, 'Cómo se arregla: ', h('span', { class: 'mono' }, x.arreglo)))))) : null,
      tareas.length ? h('section', { class: 'tarjeta' }, h('h2', null, 'Practica escribiendo (sin puntos)'), h('p', { class: 'tenue' }, 'Escríbelo tú. Se comprueba ejecutándolo; aquí no se gana ni se pierde nada, y puedes ver la solución cuando quieras.'), ...tareas.map(practica)) : null,
      c.ejercicios && st.lang === 'ps' ? h('section', { class: 'tarjeta', id: 'ejercicios-matrices' }, h('h2', null, 'Ejercicios de matrices, como los de clase'),
        h('p', { class: 'tenue' }, 'Escríbelos completos, con Algoritmo y FinAlgoritmo. Cada uno se corrige ejecutándolo con datos de prueba y con la rúbrica de 5 puntos de clase. Aquí no se ganan ni se pierden puntos del Dojo.'),
        ...c.ejercicios.map(practicaMatriz)) : null,
      c.id === 'errores' ? h('section', { class: 'tarjeta' }, h('h2', null, 'Chuleta'), chuleta()) : null,
      h('div', { class: 'entre' },
        st.cap > 0 ? h('button', { class: 'btn', onclick: () => ir_('capitulo', { cap: st.cap - 1 }) }, `← Anterior: ${g.capitulos[st.cap - 1].titulo}`) : h('span'),
        st.cap + 1 < g.capitulos.length ? h('button', { class: 'btn primario', onclick: () => ir_('capitulo', { cap: st.cap + 1 }) }, `${g.capitulos[st.cap + 1].titulo} →`) : h('button', { class: 'btn primario', onclick: () => empiezaPrueba() }, 'Ponte a prueba (sin puntos) →')));
  }
  /* Arriba de cada capítulo: anterior, ir a cualquier capítulo y siguiente (sin bajar hasta el final) */
  function navCapitulos(g) {
    const n = g.capitulos.length;
    return h('nav', { class: 'nav-capitulos', 'aria-label': 'Moverse entre capítulos' },
      h('button', { class: 'btn chico', id: 'cap-anterior', disabled: st.cap === 0, onclick: () => ir_('capitulo', { cap: st.cap - 1 }) }, '← Anterior'),
      h('select', { class: 'campo', id: 'cap-ir', 'aria-label': 'Ir al capítulo', onchange: e => ir_('capitulo', { cap: Number(e.target.value) }) },
        ...g.capitulos.map((c, k) => h('option', { value: String(k), selected: k === st.cap }, `${k + 1}. ${c.titulo}`))),
      h('button', { class: 'btn chico', id: 'cap-siguiente', disabled: st.cap + 1 >= n, onclick: () => ir_('capitulo', { cap: st.cap + 1 }) }, 'Siguiente →'));
  }
  function practica(t) {
    const p = st.practica[t.id] || (st.practica[t.id] = { codigo: '', res: null, sol: false });
    const caja = h('div', { class: 'pila practica-estudio' }, h('p', { class: 'enunciado' }, t.enunciado),
      U.hojaPapel({ id: 'est-' + t.id, etiqueta: `Tu programa en ${NL[st.lang]}`, lang: st.lang, valor: p.codigo, filas: 6, alCambiar: v => { p.codigo = v; }, alComprobar: () => comprueba() }),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario chico', onclick: () => comprueba() }, 'Comprobar'), h('button', { class: 'btn chico plano', onclick: () => { p.sol = !p.sol; pinta(); } }, p.sol ? 'Ocultar la solución' : 'Ver una solución')),
      p.res ? h('div', { class: 'respuesta ' + (p.res.ok ? 'si' : 'no') }, h('h3', null, p.res.ok ? 'Funciona' : 'Todavía no'), U.listaPruebas(p.res.resultados)) : null,
      p.sol ? bloqueCodigo(t.sol[st.lang], st.lang) : null);
    function comprueba() { if (!p.codigo.trim()) { aviso('Escribe tu programa primero.'); return; } p.res = W.corrige(p.codigo, st.lang, t.pruebas, D); pinta(); }
    return caja;
  }

  /* Un ejercicio de matrices: se corrige con pruebas y con la rúbrica de clase */
  function practicaMatriz(ej) {
    const p = st.practica[ej.id] || (st.practica[ej.id] = { codigo: '', res: null, sol: false, pista: false });
    const comprueba = () => { if (!p.codigo.trim()) { aviso('Escribe tu programa primero.'); return; } p.res = G.corrigeMatriz(ej, p.codigo, M); pinta(); };
    const r = p.res;
    return h('div', { class: 'pila practica-estudio', id: 'ej-' + ej.id }, h('h3', null, ej.titulo), h('p', { class: 'enunciado' }, ej.enunciado),
      U.hojaPapel({ id: 'est-' + ej.id, etiqueta: `Tu programa en ${NL.ps}`, lang: 'ps', valor: p.codigo, filas: 10, alCambiar: v => { p.codigo = v; }, alComprobar: comprueba }),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario chico', onclick: comprueba }, 'Comprobar'),
        h('button', { class: 'btn chico plano', onclick: () => { p.pista = !p.pista; pinta(); } }, p.pista ? 'Ocultar la pista' : 'Pista'),
        h('button', { class: 'btn chico plano', onclick: () => { p.sol = !p.sol; pinta(); } }, p.sol ? 'Ocultar la solución' : 'Ver una solución'),
        h('button', { class: 'btn chico plano', onclick: () => abrirLab({ lang: 'ps', codigo: p.codigo.trim() ? p.codigo : ej.sol, entradas: ej.pruebas[0].entradas, traza: true }) }, 'Ver paso a paso')),
      p.pista ? h('p', { class: 'tenue' }, 'Pista: ', h('span', { class: 'mono' }, ej.pista)) : null,
      r ? h('div', { class: 'respuesta ' + (r.ok ? 'si' : 'no'), role: 'status' },
        h('div', { class: 'entre' }, h('h3', null, r.ok ? 'Funciona y cumple la rúbrica' : 'Todavía no'), h('span', { class: 'insignia num ' + (r.puntos === 5 ? 'bien' : 'mal') }, `Rúbrica: ${r.puntos}.0 / 5.0`)),
        h('ul', { class: 'rubrica' }, ...r.rubrica.map(x => h('li', { class: x.ok ? 'si' : 'no' }, h('b', null, (x.ok ? '✓ ' : '✗ ') + x.que), h('span', null, x.nota)))),
        h('span', { class: 'etiqueta' }, 'Pruebas con datos (se buscan estas palabras o números en lo que muestra, en este orden)'), U.listaPruebas(r.resultados)) : null,
      p.sol ? bloqueCodigo(ej.sol, 'ps') : null);
  }

  /* ── Chuleta y diccionario ── */
  function chuleta() {
    return h('table', { class: 'chuleta' }, h('thead', null, h('tr', null, h('th', null, 'Quiero…'), h('th', null, 'Se escribe'))),
      h('tbody', null, ...guia().chuleta.map(([q, c]) => h('tr', null, h('td', null, q), h('td', null, h('pre', { class: 'mono' }, c))))));
  }
  function vistaChuleta() {
    return h('div', { class: 'columna' }, cabecera(), h('section', { class: 'tarjeta' }, h('h1', null, `Chuleta de ${guia().nombre}`), h('p', { class: 'tenue' }, 'Todo lo esencial en una pantalla, para repasar justo antes de la evaluación.'), chuleta(), h('p', { class: 'tenue', style: 'font-size:13px' }, 'Úsala para repasar, no en el examen.')));
  }
  function vistaDiccionario() {
    const todas = G.diccionario(st.lang), q = st.busca.trim().toLowerCase();
    const lista = q ? todas.filter(w => (w.palabra + ' ' + w.que).toLowerCase().includes(q)) : todas;
    const campo = h('input', { class: 'campo', id: 'dic-busca', type: 'search', placeholder: 'Busca una palabra: Leer, while, cout…', 'aria-label': 'Buscar en el diccionario', autocomplete: 'off', oninput: e => { st.busca = e.target.value; pinta(); } });
    campo.value = st.busca;
    return h('div', { class: 'columna' }, cabecera(), h('section', { class: 'tarjeta' }, h('h1', null, `Diccionario de ${guia().nombre}`), h('p', { class: 'tenue' }, `${todas.length} palabras y símbolos, cada uno con lo que hace y un ejemplo.`), campo,
      h('dl', { class: 'palabras-estudio' }, ...lista.map(w => [h('dt', null, h('code', { class: 'mono' }, w.palabra)), h('dd', null, w.que, h('span', { class: 'mono tenue ejemplo-palabra' }, w.ejemplo), h('button', { class: 'btn chico plano', onclick: () => ir_('capitulo', { cap: guia().capitulos.findIndex(c => c.id === w.capitulo) }) }, 'Ver en la guía: ' + w.tituloCapitulo))])),
      !lista.length ? h('p', { class: 'tenue' }, 'No hay ninguna palabra con eso.') : null));
  }

  /* ── Ponte a prueba: 10 preguntas de este lenguaje, con corrección al momento, sin puntos ── */
  function empiezaPrueba() {
    const preguntas = []; let intentos = 0;
    while (preguntas.length < 10 && intentos++ < 60) {
      const tpl = D.plantillas.filter(t => D.langsDe(t).includes(st.lang)); const t = tpl[Math.floor(Math.random() * tpl.length)];
      let r = null; try { r = D.generar({ tpl: t.id, lang: st.lang, tipo: Math.random() < 0.6 ? 'salida' : 'hueco', seed: Math.floor(Math.random() * 2e9), estricto: true }); } catch (e) { r = null; }
      if (r && r.opciones) preguntas.push(r);
    }
    st.prueba = { preguntas, i: 0, elegida: null, bien: 0 }; ir_('prueba');
  }
  function vistaPrueba() {
    const pr = st.prueba, r = pr.preguntas[pr.i];
    if (!r) return h('div', { class: 'columna' }, cabecera(), h('section', { class: 'tarjeta' }, h('h1', null, `${pr.bien} de ${pr.preguntas.length}`),
      h('p', null, pr.bien >= 8 ? 'Muy bien: lo tienes. Repasa la chuleta y descansa.' : pr.bien >= 5 ? 'Vas bien. Repasa los capítulos de lo que fallaste y vuelve a probar.' : 'Repasa la guía desde el principio con calma: cada capítulo trae ejemplos para ejecutar.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: empiezaPrueba }, 'Otra prueba'), h('button', { class: 'btn', onclick: () => ir_('idioma') }, 'Volver a la guía'))));
    const resp = pr.elegida !== null, ok = pr.elegida === r.correcta;
    const ops = h('div', { class: 'opciones una', role: 'group', 'aria-label': 'Opciones' }, ...r.opciones.map((o, k) => {
      const b = h('button', { class: 'opcion', disabled: resp || null, onclick: () => { pr.elegida = k; if (k === r.correcta) pr.bien++; pinta(); } }, h('span', { class: 'letra', 'aria-hidden': 'true' }, String(k + 1)), h('pre', null, o === '' ? '(no muestra nada)' : o));
      if (resp) { if (k === r.correcta) b.classList.add('correcta'); else if (k === pr.elegida) b.classList.add('fallada'); }
      return b;
    }));
    return h('div', { class: 'columna' }, cabecera(),
      h('article', { class: 'tarjeta reto' }, h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, `Pregunta ${pr.i + 1} de ${pr.preguntas.length} · sin puntos`), h('span', { class: 'insignia' }, D.temas.find(t => t.id === r.tema).titulo)),
        r.tipo === 'hueco' ? [h('h2', null, '¿Qué va en el hueco?'), h('p', { class: 'tenue' }, 'Para que muestre exactamente esto:'), salidaBloque(r.salida), bloqueCodigo(r.codigo, st.lang, { hueco: r.hueco, relleno: resp ? r.opciones[pr.elegida] : null })]
          : [h('h2', null, '¿Qué muestra este programa?'), bloqueCodigo(r.codigo, st.lang)],
        r.entradas.length ? h('p', { class: 'fila' }, h('span', { class: 'tenue' }, 'El usuario escribe:'), ...r.entradas.map(e => h('span', { class: 'insignia ai mono' }, e))) : null,
        ops,
        resp ? h('div', { class: 'respuesta ' + (ok ? 'si' : 'no') }, h('h3', null, ok ? 'Correcto' : 'No era esa'), h('p', null, r.explica),
          h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'est-siguiente', onclick: () => { pr.i++; pr.elegida = null; pinta(); } }, pr.i + 1 < pr.preguntas.length ? 'Siguiente' : 'Ver el resultado'))) : null));
  }

  /* ── Laboratorio libre ── */
  function vistaLab() {
    const clave = 'estudio-lab-' + st.lang, claveD = 'estudio-datos-' + st.lang;
    const inicial = { ps: 'Algoritmo prueba\n    Escribir "Hola"\nFinAlgoritmo', py: 'print("Hola")', cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hola" << endl;\n    return 0;\n}' }[st.lang];
    const consola = h('div', { class: 'consola', id: 'estudio-consola', 'aria-live': 'polite' }, h('span', { class: 'fin' }, 'Pulsa Ejecutar para ver lo que muestra tu programa.'));
    let ed = null;
    const datos = h('textarea', { class: 'campo mono', id: 'estudio-datos', rows: '3', placeholder: 'Datos que escribe el usuario, uno por línea', 'aria-label': 'Datos de entrada, uno por línea' });
    datos.value = ls.get(claveD, '') || ''; datos.addEventListener('input', () => ls.set(claveD, datos.value));
    const ejecutar = () => {
      const codigo = ed.ta.value, entradas = datos.value.split('\n').filter(x => x !== '');
      const r = ejecuta(codigo, entradas); consola.textContent = '';
      if (r.salida) consola.append(r.salida);
      if (r.error) { consola.append(h('div', { class: 'err' }, `Error en la línea ${r.error.linea}: ${r.error.message}`)); if (r.error.linea) ed.marca(r.error.linea); }
      consola.append(h('div', { class: 'fin' }, '— fin del programa —'));
    };
    ed = U.editor({ id: 'estudio-editor', valor: ls.get(clave, null) || inicial, lang: st.lang, etiqueta: `Tu código en ${NL[st.lang]}`, alCambiar: v => ls.set(clave, v), alEjecutar: ejecutar });
    return h('div', { class: 'columna' }, cabecera(),
      h('section', { class: 'tarjeta lab' }, h('div', { class: 'entre' }, h('h1', null, `Laboratorio libre · ${guia().nombre}`)),
        h('p', { class: 'tenue' }, 'Prueba lo que quieras: cambia los ejemplos, inventa programas, equivócate. Aquí no hay puntos.' + (st.lang === 'cpp' ? ' En C++ puedes escribir el programa completo o solo lo de dentro de main.' : '')),
        ed.el, h('label', { class: 'ajuste', for: 'estudio-datos' }, h('span', { class: 'etiqueta' }, 'Datos (si tu programa pide algo)'), datos),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'estudio-ejecutar', onclick: ejecutar }, '▶ Ejecutar'), h('button', { class: 'btn', onclick: () => abrirLab({ lang: st.lang, codigo: G.prepara(ed.ta.value, st.lang, D), entradas: datos.value.split('\n').filter(x => x !== ''), traza: true }) }, 'Ver paso a paso'),
          h('button', { class: 'btn plano', onclick: () => { ed.pon(inicial); ls.set(clave, inicial); } }, 'Empezar de nuevo'), h('span', { class: 'atajos' }, 'Ctrl+Enter ejecuta')),
        consola));
  }

  /* ── La portada de un lenguaje y la de la sección ── */
  function vistaIdioma() {
    const g = guia(), l = leidos(), hechos = g.capitulos.filter(c => l[c.id]).length;
    return h('div', { class: 'columna' }, cabecera(),
      h('section', { class: 'tarjeta portada-estudio' }, h('span', { class: 'etiqueta' }, 'Estudio intensivo · desde cero'), h('h1', null, `Guía de ${g.nombre}`), h('p', null, g.intro),
        h('div', { class: 'fila' }, h('span', { class: 'insignia num' }, `${hechos} de ${g.capitulos.length} capítulos leídos`), h('span', { class: 'insignia' }, 'No cuenta para los puntos ni para el rango')),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario grande', onclick: () => ir_('capitulo', { cap: Math.max(0, g.capitulos.findIndex(c => !l[c.id])) }) }, hechos ? 'Seguir leyendo' : 'Empezar desde cero'),
          h('button', { class: 'btn', onclick: () => ir_('lab') }, 'Laboratorio libre'))),
      h('div', { class: 'accesos-estudio' },
        h('button', { class: 'tarjeta acceso', onclick: () => ir_('chuleta') }, h('b', null, 'Chuleta'), h('span', { class: 'tenue' }, 'Todo lo esencial en una pantalla')),
        h('button', { class: 'tarjeta acceso', onclick: () => ir_('diccionario', { busca: '' }) }, h('b', null, 'Diccionario'), h('span', { class: 'tenue' }, `${G.diccionario(st.lang).length} palabras explicadas`)),
        h('button', { class: 'tarjeta acceso', onclick: empiezaPrueba }, h('b', null, 'Ponte a prueba'), h('span', { class: 'tenue' }, '10 preguntas, sin puntos'))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Los capítulos'),
        h('ol', { class: 'capitulos' }, ...g.capitulos.map((c, k) => h('li', null, h('button', { class: 'capitulo' + (l[c.id] ? ' leido' : ''), onclick: () => ir_('capitulo', { cap: k }) },
          h('span', { class: 'n', 'aria-hidden': 'true' }, l[c.id] ? '✓' : String(k + 1)), h('span', { class: 'pila', style: 'gap:2px' }, h('b', null, c.titulo), h('span', { class: 'tenue' }, c.objetivo))))))));
  }
  function vistaInicio() {
    return h('div', { class: 'columna' },
      h('section', { class: 'tarjeta portada-estudio' }, h('span', { class: 'etiqueta' }, 'Estudio intensivo'), h('h1', null, '¿Qué quieres estudiar a fondo?'),
        h('p', null, 'Una guía completa de cada lenguaje, desde cero, como si nunca lo hubieras visto: cada instrucción explicada, ejemplos que puedes ejecutar y cambiar, las palabras una a una, los errores típicos, una chuleta y un laboratorio libre. Ideal para la víspera de una evaluación.'),
        h('p', { class: 'tenue' }, 'Aquí no se ganan ni se pierden puntos, ni cuenta para el rango: es solo para aprender.')),
      h('div', { class: 'lenguajes-estudio' }, ...G.LANGS.map(l => { const g = G.guias[l], n = Object.keys(ls.get('estudio-leidos-' + l, {})).length;
        return h('button', { class: 'tarjeta acceso lenguaje-estudio', onclick: () => { st.lang = l; ls.set('estudio-lang', l); ir_('idioma'); } }, h('b', null, g.nombre), h('span', { class: 'tenue' }, g.intro.split('.')[0] + '.'), h('span', { class: 'insignia num' }, `${n} de ${g.capitulos.length} capítulos`)); })));
  }

  function pinta() {
    const el = $('#v-estudio'); if (!el) return;
    const foco = document.activeElement && document.activeElement.id;
    el.textContent = '';
    if (!st.lang || !G.guias[st.lang]) st.modo = 'inicio';
    el.append(st.modo === 'capitulo' ? vistaCapitulo() : st.modo === 'chuleta' ? vistaChuleta() : st.modo === 'diccionario' ? vistaDiccionario() : st.modo === 'prueba' && st.prueba ? vistaPrueba() : st.modo === 'lab' ? vistaLab() : st.modo === 'idioma' ? vistaIdioma() : vistaInicio());
    if (foco && document.getElementById(foco) && el.contains(document.getElementById(foco))) { const x = document.getElementById(foco); x.focus({ preventScroll: true }); if (x.type === 'search') x.setSelectionRange(x.value.length, x.value.length); }
  }
  return { pinta, inicio: () => { if (st.modo !== 'inicio') st.modo = st.lang ? 'idioma' : 'inicio'; }, estado: st };
};
})(window);
