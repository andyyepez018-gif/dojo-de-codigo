/* Dojo de código · Estudio intensivo: estudiar un lenguaje a fondo, desde cero, sin puntos ni presión.
   Guía por capítulos (explicación, ejemplos que se ejecutan, palabras, errores típicos), chuleta,
   diccionario, prueba sin puntos y laboratorio libre. Nada de aquí cuenta para el rango ni resta. */
(function (raiz) {
'use strict';
raiz.VistaEstudio = function (ctx) {
  const { D, G, W, M, U, ir, aviso, abrirLab, vista } = ctx;
  const { $, h, ls, NL, bloqueCodigo, salidaBloque } = U;
  const st = { lang: ls.get('estudio-lang', null), modo: 'inicio', cap: 0, busca: '', prueba: null, practica: {}, personal: null, chat: {}, guiado: null, guias: {} };
  const Pz = ctx.Personalizado || raiz.Personalizado, Ar = ctx.Armar || raiz.Armar;
  const guia = () => G.guias[st.lang];
  const leidos = () => ls.get('estudio-leidos-' + st.lang, {});
  const marcaLeido = id => { const x = leidos(); if (!x[id]) { x[id] = true; ls.set('estudio-leidos-' + st.lang, x); } };
  /* Cada cambio de pantalla dentro de la guía queda en el historial: el botón «atrás» del móvil o del
     navegador vuelve al capítulo (o a la pantalla) de antes en vez de salir de la sección. */
  const foto = () => ({ modo: st.modo, cap: st.cap, lang: st.lang, personal: st.personal, guiado: st.guiado });
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
  const cabecera = (titulo, sub) => h('div', { class: 'entre' }, h('div', { class: 'fila' }, st.modo === 'personal' ? h('button', { class: 'btn plano', onclick: () => ir_('inicio') }, '← Estudio') : st.modo === 'guiado' ? h('button', { class: 'btn plano', onclick: () => ir_('armar') }, '← Cómo armar un programa') : st.modo !== 'idioma' ? h('button', { class: 'btn plano', onclick: () => ir_('idioma') }, `← Guía de ${guia().nombre}`) : h('button', { class: 'btn plano', onclick: () => ir_('inicio', { lang: null }) }, '← Elegir lenguaje')), h('span', { class: 'insignia' }, 'Sin puntos: aquí se estudia'));

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
      c.id === 'arreglos' && st.lang === 'ps' && Pz ? h('p', { class: 'insignia ai', style: 'white-space:normal' }, 'Tienes un capítulo personalizado de matrices hecho con la presentación de tu clase, con Claude explicándote: ', h('button', { class: 'btn chico', onclick: () => ir_('personal', { personal: 'matrices-condicionales' }) }, 'Abrirlo')) : null,
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
  function practicaMatriz(ej, op = {}) {
    const p = st.practica[ej.id] || (st.practica[ej.id] = { codigo: '', res: null, sol: false, pista: false });
    const comprueba = () => { if (!p.codigo.trim()) { aviso('Escribe tu programa primero.'); return; } p.res = G.corrigeMatriz(ej, p.codigo, M); if (p.res.ok && op.alAprobar) op.alAprobar(ej.id); pinta(); };
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
        h('span', { class: 'etiqueta' }, 'Pruebas con datos (se buscan estas palabras o números en lo que muestra, en este orden)'), U.listaPruebas(r.resultados),
        op.tutor && ctx.botonTutor ? ctx.botonTutor(r.ok ? 'Que Claude revise mi programa' : 'Que Claude me ayude a arreglarlo', () => `${REGLAS_PROFE}\n\nEjercicio: ${ej.enunciado}\n\nEl programa del alumno:\n${p.codigo}\n\nRúbrica (${r.puntos}/5): ${r.rubrica.map(x => (x.ok ? 'cumple ' : 'NO cumple ') + x.que + ' (' + x.nota + ')').join('; ')}.\nPruebas: ${r.resultados.map(x => 'con ' + x.entradas.join(', ') + (x.ok ? ' bien' : ' mal: ' + (x.error ? 'error ' + x.error.message : 'mostró ' + JSON.stringify(x.salida)))).join('; ')}.\n\n${r.ok ? 'Funciona. Dile en 3 frases qué hizo bien y una cosa que podría escribir más clara.' : 'Explícale en 3 a 6 frases qué falla y cómo pensarlo, señalando la línea. No le des el programa entero: guíalo.'}`) : null) : null,
      p.sol ? bloqueCodigo(ej.sol, 'ps') : null);
  }

  /* ═══════ Cómo armar un programa: el método (6 pasos), las piezas y programas guiados ═══════ */
  const hechosArmar = () => ls.get('armar-hechos-' + st.lang, {}) || {};
  const nombrePieza = id => (Ar.pieza(id) || {}).nombre || id;
  function accesoArmar() {
    if (!Ar) return null;
    return h('section', { class: 'tarjeta', id: 'armar-inicio' }, h('span', { class: 'etiqueta' }, 'Cómo armar un programa'), h('h2', null, '¿Sabes las instrucciones pero te quedas en blanco?'),
      h('p', { class: 'tenue' }, 'El método para pasar de un enunciado a un programa completo, las piezas que se repiten en casi todos los ejercicios y programas guiados paso a paso. En el lenguaje que quieras.'),
      h('div', { class: 'fila' }, ...G.LANGS.map(l => h('button', { class: 'btn', onclick: () => { st.lang = l; ls.set('estudio-lang', l); ir_('armar'); } }, NL[l]))));
  }
  function vistaArmar() {
    const l = st.lang, hechos = hechosArmar(), g = Ar.porId('promedio'), n = Ar.GUIADOS.filter(x => hechos[x.id]).length;
    const ve = id => { const x = document.getElementById(id); if (x) x.scrollIntoView({ block: 'start' }); };
    return h('div', { class: 'columna' }, cabecera(),
      h('section', { class: 'tarjeta portada-estudio' }, h('span', { class: 'etiqueta' }, `Cómo armar un programa · ${NL[l]}`), h('h1', null, 'De un enunciado a un programa completo'),
        h('p', null, `Saber Escribir, Leer, Si o Para es saber las palabras. Armar un programa es hacer frases con ellas, y para eso hay un método: siempre los mismos seis pasos. Nadie escribe un programa entero de golpe: se piensa, se descompone y se arma pieza a pieza.`),
        h('div', { class: 'fila' }, h('span', { class: 'insignia num' + (n === Ar.GUIADOS.length ? ' bien' : '') }, `${n} de ${Ar.GUIADOS.length} programas armados`), h('span', { class: 'insignia' }, 'Sin puntos: aquí se aprende')),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => ve('armar-metodo') }, 'El método'), h('button', { class: 'btn', onclick: () => ve('armar-piezas') }, 'Las piezas'), h('button', { class: 'btn', onclick: () => ve('armar-practica') }, 'Practicar'))),
      h('section', { class: 'tarjeta', id: 'armar-metodo' }, h('h2', null, 'El método en 6 pasos'),
        h('ol', { class: 'metodo-armar' }, ...Ar.METODO.map(m => h('li', null, h('b', null, m.t), h('span', null, m.p))))),
      h('section', { class: 'tarjeta', id: 'armar-ejemplo' }, h('h2', null, `Un ejemplo completo: ${g.titulo.toLowerCase()}`), h('p', { class: 'enunciado' }, g.enunciado),
        h('ol', { class: 'metodo-armar' },
          h('li', null, h('b', null, 'Qué entra y qué sale'), h('span', null, `Entra: ${g.entra[0].toLowerCase()}. Sale: ${g.sale[0].toLowerCase()}.`)),
          h('li', null, h('b', null, 'A mano'), h('span', null, `${g.aMano.datos}. ${g.aMano.explica}`)),
          h('li', null, h('b', null, 'La receta'), h('ol', { class: 'receta-armada' }, ...g.receta.map(r => h('li', null, r[0])))),
          h('li', null, h('b', null, 'Las piezas'), h('ul', { class: 'lista' }, ...g.receta.map(r => h('li', null, `${r[0]} → `, h('b', null, nombrePieza(r[2][0])))))),
          h('li', null, h('b', null, 'Traducido, con la receta como comentarios'), ejemplo({ codigo: g.sol[l], nota: 'Cada comentario es un paso de la receta, y debajo va su código.', entradas: g.pruebas[0].entradas })),
          h('li', null, h('b', null, 'Probado'), h('span', null, `Con los datos de a mano (${g.aMano.datos.toLowerCase()}) muestra ${g.aMano.respuesta}, lo mismo que en papel. Pulsa «▶ Ejecutar» y compruébalo.`)))),
      h('section', { class: 'tarjeta', id: 'armar-piezas' }, h('h2', null, 'Las piezas que más se repiten'), h('p', { class: 'tenue' }, 'Casi todos los ejercicios de clase se arman combinando estas seis. Cuando leas un enunciado, busca cuáles necesitas.'),
        ...Ar.PIEZAS.map(p => h('div', { class: 'pieza-armar', id: 'pieza-' + p.id }, h('h3', null, p.nombre), h('p', null, h('b', null, 'Para qué: '), p.para), h('p', { class: 'clave-personal' }, h('b', null, 'Cómo: '), p.como),
          ejemplo({ codigo: p.codigo[l], nota: '', entradas: p.entradas })))),
      h('section', { class: 'tarjeta', id: 'armar-practica' }, h('h2', null, 'Practica el método: programas guiados'),
        h('p', { class: 'tenue' }, 'En cada uno, la app te lleva paso a paso: qué entra y qué sale, hacerlo a mano, ordenar la receta, reconocer las piezas y escribirlo. Se corrige solo, y Claude te ayuda en cualquier paso.'),
        h('ol', { class: 'capitulos' }, ...Ar.GUIADOS.map((x, k) => h('li', null, h('button', { class: 'capitulo' + (hechos[x.id] ? ' leido' : ''), onclick: () => ir_('guiado', { guiado: x.id }) },
          h('span', { class: 'n', 'aria-hidden': 'true' }, hechos[x.id] ? '✓' : String(k + 1)), h('span', { class: 'pila', style: 'gap:2px' }, h('b', null, x.titulo), h('span', { class: 'tenue' }, 'Piezas: ' + x.piezas.map(nombrePieza).join(' · ')))))))));
  }
  const mezcla = (n, semilla) => { const a = [...Array(n).keys()]; let s = semilla; for (let k = n - 1; k > 0; k--) { s = (s * 1103515245 + 12345) >>> 0; const j = s % (k + 1); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  function vistaGuiado() {
    const g = Ar.porId(st.guiado), l = st.lang; if (!g) { st.modo = 'armar'; return vistaArmar(); }
    const clave = l + '|' + g.id, sm = [...g.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const s = st.guias[clave] || (st.guias[clave] = { paso: 1, entra: null, sale: null, mano: '', manoFallos: 0, orden: [], ordenMal: false, piezas: {}, piezasMal: false, codigo: ls.get('armar-codigo-' + clave, '') || '', res: null, sol: false, ordenEntra: mezcla(g.entra.length, sm), ordenSale: mezcla(g.sale.length, sm + 7), desorden: Ar.desordena(g) });
    const re = () => pinta(), avanza = p => { s.paso = Math.max(s.paso, p); pinta(); };
    const ayuda = (que, detalle) => ctx.botonTutor ? ctx.botonTutor('Ayúdame con este paso', () => `${l === 'ps' ? REGLAS_PROFE : REGLAS_PROFE.replace('PSeInt desde cero', NL[l] + ' desde cero').replace(/Usa la sintaxis exacta de PSeInt[^.]*\. En PSeInt[^.]*\./, `Usa la sintaxis exacta de ${NL[l]}, la de un primer curso.`)}\n\nEl alumno está aprendiendo a armar programas con un método de 6 pasos: 1) qué entra y qué sale, 2) hacerlo a mano, 3) escribir la receta en español, 4) reconocer las piezas (repetir N veces, acumulador, contador, decidir con cada dato, el mayor, repetir hasta una señal), 5) traducir paso a paso, 6) probar.\nEjercicio: ${g.enunciado}\nLenguaje: ${NL[l]}\nEstá en el paso: ${que}.\n${detalle || ''}\nAyúdale con ESTE paso, sin resolverle los siguientes. 3 a 6 frases.`) : null;
    const hecho = s.paso > 5 && s.res && s.res.ok;
    const pasos = ['Qué entra y sale', 'A mano', 'La receta', 'Las piezas', 'Escribirlo', 'Probarlo'];
    const cabeza = h('section', { class: 'tarjeta portada-estudio' }, h('span', { class: 'etiqueta' }, `Programa guiado · ${NL[l]}`), h('h1', null, g.titulo), h('p', { class: 'enunciado es-grande' }, g.enunciado),
      h('ol', { class: 'pasos-guiado', 'aria-label': 'Pasos del método' }, ...pasos.map((t, k) => h('li', { class: (s.paso > k + 1 || (k === 5 && hecho)) ? 'hecho' : s.paso === k + 1 || (k === 5 && s.paso === 5) ? 'actual' : '' }, h('span', { class: 'n' }, (s.paso > k + 1 || (k === 5 && hecho)) ? '✓' : String(k + 1)), t))));
    const tarjeta = (n, titulo, ...hijos) => h('section', { class: 'tarjeta paso-guiado' + (s.paso > n ? ' hecho' : ''), id: 'guiado-paso-' + n }, h('span', { class: 'etiqueta' }, `Paso ${n} de 6`), h('h2', null, (s.paso > n ? '✓ ' : '') + titulo), ...hijos);
    const opcionesDe = (lista, orden, campo) => h('div', { class: 'opciones una', role: 'group', 'aria-label': 'Opciones' }, ...orden.map(k => h('button', { class: 'opcion', 'aria-pressed': String(s[campo] === k), disabled: s.paso > 1 || null, onclick: () => { s[campo] = k; re(); } }, h('span', { class: 'texto-opcion' }, lista[k]))));
    const bloques = [cabeza];
    // 1. Qué entra y qué sale
    bloques.push(tarjeta(1, '¿Qué entra y qué sale?', h('p', null, h('b', null, '¿Qué datos entran (los que pide o recibe el programa)?')), opcionesDe(g.entra, s.ordenEntra, 'entra'),
      h('p', null, h('b', null, '¿Qué tiene que mostrar al final?')), opcionesDe(g.sale, s.ordenSale, 'sale'),
      s.paso === 1 ? h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'guiado-1-ok', onclick: () => { if (s.entra === null || s.sale === null) { aviso('Elige una respuesta en las dos preguntas.'); return; } if (s.entra === 0 && s.sale === 0) avanza(2); else aviso('Todavía no. Relee el enunciado: ¿qué te dice que pidas? ¿Qué te dice que muestres?', 5000); } }, 'Comprobar')) : null,
      s.paso === 1 ? ayuda('1, qué entra y qué sale', `Ha marcado: entra «${s.entra === null ? 'nada' : g.entra[s.entra]}», sale «${s.sale === null ? 'nada' : g.sale[s.sale]}».`) : null));
    // 2. A mano
    if (s.paso >= 2) {
      const campo = h('input', { class: 'campo', id: 'guiado-mano', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': g.aMano.pregunta, disabled: s.paso > 2 || null });
      campo.value = s.mano; campo.addEventListener('input', () => { s.mano = campo.value; });
      const comprobar = () => { s.mano = campo.value; if (Ar.aManoBien(g, s.mano)) avanza(3); else { s.manoFallos++; re(); aviso('No da eso. Hazlo despacio, con papel, paso a paso.', 4000); } };
      campo.addEventListener('keydown', e => { if (e.key === 'Enter') comprobar(); });
      bloques.push(tarjeta(2, 'Hazlo tú a mano', h('p', null, 'Con estos datos: ', h('b', null, g.aMano.datos)), h('label', { class: 'ajuste', for: 'guiado-mano' }, h('span', null, g.aMano.pregunta), campo),
        s.paso === 2 ? h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'guiado-2-ok', onclick: comprobar }, 'Comprobar'), s.manoFallos >= 2 ? h('button', { class: 'btn plano', onclick: () => { s.mano = String(g.aMano.respuesta); avanza(3); } }, 'Ver la respuesta') : null) : null,
        s.paso > 2 ? h('p', { class: 'clave-personal' }, h('b', null, `Da ${g.aMano.respuesta}. `), g.aMano.explica) : ayuda('2, resolverlo a mano', `Datos: ${g.aMano.datos}. Pregunta: ${g.aMano.pregunta}. Su respuesta: «${s.mano}». No le digas el número: explícale cómo hacerlo a mano.`)));
    }
    // 3. La receta
    if (s.paso >= 3) {
      const usados = new Set(s.orden), listo = s.orden.length === g.receta.length;
      bloques.push(tarjeta(3, 'Escribe la receta en español', h('p', { class: 'tenue' }, 'Estos son los pasos, desordenados. Tócalos en el orden en que los haría el programa.'),
        s.paso === 3 ? h('div', { class: 'opciones una', role: 'group', 'aria-label': 'Pasos sin ordenar' }, ...s.desorden.filter(k => !usados.has(k)).map(k => h('button', { class: 'opcion', onclick: () => { s.orden.push(k); s.ordenMal = false; re(); } }, h('span', { class: 'texto-opcion' }, g.receta[k][0])))) : null,
        h('span', { class: 'etiqueta' }, 'Tu receta'), s.orden.length ? h('ol', { class: 'receta-armada' + (s.ordenMal ? ' mal' : '') }, ...s.orden.map(k => h('li', null, g.receta[k][0]))) : h('p', { class: 'tenue' }, 'Todavía vacía: toca el primer paso.'),
        s.paso === 3 ? h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'guiado-3-ok', disabled: !listo || null, onclick: () => { if (Ar.recetaBien(g, s.orden)) avanza(4); else { s.ordenMal = true; re(); aviso('Ese orden no funciona: ¿qué tiene que existir antes de poder hacer cada paso?', 5000); } } }, 'Comprobar'),
          s.orden.length ? h('button', { class: 'btn plano', onclick: () => { s.orden.pop(); s.ordenMal = false; re(); } }, 'Quitar el último') : null) : null,
        s.paso === 3 ? ayuda('3, ordenar la receta', `Su orden: ${s.orden.map(k => g.receta[k][0]).join(' → ') || '(vacío)'}. Pasos disponibles: ${g.receta.map(r => r[0]).join(' | ')}.`) : null));
    }
    // 4. Las piezas
    if (s.paso >= 4) {
      const opciones = [Ar.SUELTA, ...Ar.PIEZAS];
      bloques.push(tarjeta(4, 'Reconoce las piezas', h('p', { class: 'tenue' }, '¿Qué pieza es cada paso? (Las piezas están explicadas en «Cómo armar un programa».)'),
        h('ol', { class: 'receta-armada piezas-elegir' }, ...s.orden.map(k => {
          const sel = h('select', { class: 'campo', id: 'guiado-pieza-' + k, 'aria-label': 'Pieza del paso: ' + g.receta[k][0], disabled: s.paso > 4 || null, onchange: e => { s.piezas[k] = e.target.value; s.piezasMal = false; } },
            h('option', { value: '' }, 'Elige la pieza…'), ...opciones.map(o => h('option', { value: o.id }, o.nombre)));
          sel.value = s.piezas[k] || '';
          const mal = s.piezasMal && !Ar.piezaBien(g, k, s.piezas[k]);
          return h('li', { class: mal ? 'mal' : '' }, h('span', null, g.receta[k][0]), sel, s.paso > 4 || mal ? h('small', { class: 'tenue' }, mal ? '✗ Esta no. ' + (Ar.pieza(g.receta[k][2][0]) || {}).para : '✓') : null);
        })),
        s.paso === 4 ? h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'guiado-4-ok', onclick: () => { if (s.orden.every(k => Ar.piezaBien(g, k, s.piezas[k]))) avanza(5); else { s.piezasMal = true; re(); } } }, 'Comprobar')) : null,
        s.paso === 4 ? ayuda('4, reconocer las piezas', `Su elección: ${s.orden.map(k => g.receta[k][0] + ' = ' + (s.piezas[k] ? nombrePieza(s.piezas[k]) : '¿?')).join('; ')}.`) : null));
    }
    // 5 y 6. Escribirlo y probarlo
    if (s.paso >= 5) {
      const comprueba = () => { if (!s.codigo.trim()) { aviso('Escribe tu programa primero.'); return; } s.res = W.corrige(s.codigo, l, g.pruebas, D); if (s.res.ok) { const x = hechosArmar(); x[g.id] = true; ls.set('armar-hechos-' + l, x); } s.paso = 6; re(); };
      const pon = () => { s.codigo = Ar.esqueleto(g, l, s.orden); ls.set('armar-codigo-' + clave, s.codigo); re(); };
      const sig = Ar.GUIADOS[Ar.GUIADOS.indexOf(g) + 1];
      bloques.push(tarjeta(5, 'Tradúcelo paso a paso y pruébalo',
        h('p', null, 'Empieza poniendo la receta como comentarios: debajo de cada uno, escribe el código de ese paso. Ve de uno en uno.'),
        h('div', { class: 'fila' }, h('button', { class: 'btn', id: 'guiado-esqueleto', onclick: pon }, s.codigo.trim() ? 'Volver a empezar con la receta como comentarios' : 'Poner la receta como comentarios')),
        U.hojaPapel({ id: 'guiado-hoja', etiqueta: `Tu programa en ${NL[l]}`, lang: l, valor: s.codigo, filas: 14, alCambiar: v => { s.codigo = v; ls.set('armar-codigo-' + clave, v); }, alComprobar: comprueba }),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'guiado-comprobar', onclick: comprueba }, 'Probarlo'),
          h('button', { class: 'btn plano', onclick: () => abrirLab({ lang: l, codigo: W.prepara(s.codigo || g.sol[l], l, D), entradas: g.pruebas[0].entradas, traza: true }) }, 'Ver paso a paso'),
          h('button', { class: 'btn plano', onclick: () => { s.sol = !s.sol; re(); } }, s.sol ? 'Ocultar la solución' : 'Ver una solución')),
        s.res ? h('div', { class: 'respuesta ' + (s.res.ok ? 'si' : 'no'), role: 'status' }, h('h3', null, s.res.ok ? '¡Armado! Lo escribiste tú con el método' : 'Todavía no: mira qué muestra con cada dato'), U.listaPruebas(s.res.resultados),
          s.res.ok && sig ? h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => ir_('guiado', { guiado: sig.id }) }, `Siguiente: ${sig.titulo} →`)) : null) : null,
        s.sol ? bloqueCodigo(g.sol[l], l) : null,
        ayuda('5 y 6, escribir el código y probarlo', `Su receta: ${s.orden.map(k => g.receta[k][0]).join(' → ')}.\nSu programa:\n${s.codigo || '(vacío)'}\n${s.res ? 'Resultado de las pruebas: ' + s.res.resultados.map(x => (x.ok ? 'bien' : 'mal') + ' con ' + x.entradas.join(', ') + (x.ok ? '' : ': ' + (x.error ? 'error ' + x.error.message : 'mostró ' + JSON.stringify(x.salida)))).join('; ') : ''}\nSeñala el paso de la receta que falla y cómo traducirlo; no le des el programa entero.`)));
    }
    return h('div', { class: 'columna' }, cabecera(), ...bloques);
  }

  /* ═══════ Capítulo personalizado: hecho con el material de clase, con Claude de profesor ═══════ */
  const REGLAS_PROFE = 'Eres el profesor particular de un alumno que está aprendiendo PSeInt desde cero, con el material de su clase. Hablas en español sencillo, de tú, con frases cortas, sin saludos ni felicitaciones y sin formato Markdown (nada de asteriscos, almohadillas ni bloques de código con comillas invertidas: el código va en líneas aparte, tal cual). Usa la sintaxis exacta de PSeInt: Algoritmo … FinAlgoritmo, Definir x Como Entero, Dimension m[2,2], Para i <- 1 Hasta 2 Hacer … FinPara, Si … Entonces … SiNo … FinSi, MOD, Leer, Escribir. En PSeInt las posiciones empiezan en 1 y en m[i,j] primero va la fila y luego la columna. Si te pide la solución de un ejercicio, primero dale una pista y pregúntale qué ha probado; si insiste, dásela explicada línea por línea. Responde en 3 a 8 frases salvo que te pida más, y termina, cuando tenga sentido, con una pregunta corta para comprobar que lo entendió.';
  const todosEj = () => [...G.MATRIZ_EJ, ...G.MATRIZ_EXTRA];
  const leidosP = id => ls.get('personal-leidos-' + id, {}) || {};
  const aprobadosP = id => ls.get('personal-ok-' + id, {}) || {};
  function accesoPersonales() {
    if (!Pz || !Pz.capitulos.length) return null;
    return h('section', { class: 'tarjeta', id: 'personales' }, h('span', { class: 'etiqueta' }, 'Capítulo personalizado'), h('h2', null, 'Hecho con el material de tu clase'),
      h('p', { class: 'tenue' }, 'Capítulos a medida de lo que te piden en clase, con Claude a tu lado para explicarte cada parte. Sin puntos.'),
      h('div', { class: 'accesos-estudio' }, ...Pz.capitulos.map(c => {
        const ejs = c.ejercicios.length, ok = Object.keys(aprobadosP(c.id)).filter(id => c.ejercicios.includes(id)).length, leidas = Object.keys(leidosP(c.id)).length;
        return h('button', { class: 'tarjeta acceso personal-acceso', onclick: () => ir_('personal', { personal: c.id }) }, h('b', null, c.titulo), h('span', { class: 'tenue' }, `${NL[c.lang]} · ${c.secciones.length} partes · ${ejs} ejercicios`),
          h('span', { class: 'insignia num' }, `${leidas} de ${c.secciones.length} partes entendidas · ${ok} de ${ejs} ejercicios con 5/5`));
      })));
  }
  function vistaPersonal() {
    const c = Pz && Pz.porId(st.personal); if (!c) { st.modo = 'inicio'; return vistaInicio(); }
    st.lang = c.lang;   // los ejemplos se ejecutan en su lenguaje
    const l = leidosP(c.id), okEj = aprobadosP(c.id), ejs = c.ejercicios.map(id => todosEj().find(e => e.id === id)).filter(Boolean);
    const leidas = c.secciones.filter(s => l[s.id]).length, hechos = ejs.filter(e => okEj[e.id]).length;
    const ve = id => { const x = document.getElementById(id); if (x) x.scrollIntoView({ behavior: U.reduceMovimiento && U.reduceMovimiento() ? 'auto' : 'smooth', block: 'start' }); };
    const entendida = s => h('button', { class: 'btn chico ' + (l[s.id] ? 'hecho' : ''), 'aria-pressed': String(!!l[s.id]), onclick: () => { const x = leidosP(c.id); if (x[s.id]) delete x[s.id]; else x[s.id] = true; ls.set('personal-leidos-' + c.id, x); pinta(); } }, l[s.id] ? '✓ Entendido' : 'Marcar como entendido');
    const explica = s => ctx.botonTutor ? ctx.botonTutor('Explícamelo con Claude', () => `${REGLAS_PROFE}\n\nEl material del capítulo:\n${Pz.contexto(c)}\n\nEl alumno está leyendo la parte «${s.t}». ${s.claude}`) : null;
    return h('div', { class: 'columna personal' }, cabecera(),
      h('section', { class: 'tarjeta portada-estudio' }, h('span', { class: 'etiqueta' }, `Capítulo personalizado · ${NL[c.lang]}`), h('h1', null, c.titulo), h('p', { class: 'tenue' }, c.fuente),
        h('p', { class: 'objetivo' }, h('b', null, 'Objetivo: '), c.objetivo),
        h('div', { class: 'metas-personal' }, ...c.metas.map(([t, d], k) => h('div', { class: 'meta-personal' }, h('b', null, `${k + 1}. ${t}`), h('span', { class: 'tenue' }, d)))),
        h('div', { class: 'fila' }, h('span', { class: 'insignia num' + (leidas === c.secciones.length ? ' bien' : '') }, `${leidas} de ${c.secciones.length} partes entendidas`), h('span', { class: 'insignia num' + (hechos === ejs.length ? ' bien' : '') }, `${hechos} de ${ejs.length} ejercicios con 5/5`)),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => ve('p-' + c.secciones[0].id) }, 'Empezar'), h('button', { class: 'btn', onclick: () => ve('p-actividad') }, 'Ir a los ejercicios'), h('button', { class: 'btn', onclick: () => ve('chat-personal') }, 'Hablar con Claude')),
        h('nav', { 'aria-label': 'Partes del capítulo' }, h('ol', { class: 'indice-personal' }, ...c.secciones.map(s => h('li', null, h('button', { class: 'btn plano chico', onclick: () => ve('p-' + s.id) }, (l[s.id] ? '✓ ' : '') + s.t))),
          h('li', null, h('button', { class: 'btn plano chico', onclick: () => ve('p-actividad') }, '8. Ahora es tu turno: los ejercicios')), h('li', null, h('button', { class: 'btn plano chico', onclick: () => ve('p-evaluacion') }, '9. Cómo se evalúa')), h('li', null, h('button', { class: 'btn plano chico', onclick: () => ve('p-cierre') }, '10. Lo esencial y tus preguntas'))))),
      ...c.secciones.map(s => h('section', { class: 'tarjeta seccion-personal', id: 'p-' + s.id }, h('span', { class: 'etiqueta' }, s.etiqueta), h('h2', null, s.t),
        ...s.p.map(x => h('p', null, x)),
        s.visual ? visualPersonal(s.visual) : null,
        h('p', { class: 'clave-personal' }, h('b', null, 'Idea clave: '), s.clave),
        ...s.ejemplos.map(ejemplo),
        s.errores.length ? h('div', null, h('h3', null, 'Errores típicos'), h('ul', { class: 'errores-estudio' }, ...s.errores.map(x => h('li', null, h('b', null, x.pasa), h('span', null, 'Por qué: ' + x.porque), h('span', { class: 'arreglo' }, 'Cómo se arregla: ', h('span', { class: 'mono' }, x.arreglo)))))) : null,
        h('div', { class: 'fila' }, entendida(s)), explica(s))),
      h('section', { class: 'tarjeta', id: 'p-actividad' }, h('span', { class: 'etiqueta' }, 'Actividad · trabajo individual'), h('h2', null, '8. Ahora es tu turno'),
        h('p', null, 'Resuelve los ejercicios sin copiar una solución. Lee el enunciado, identifica las filas y las columnas y planifica los ciclos antes de escribir. Usa condicionales solo cuando el ejercicio necesite tomar una decisión. Tiempo sugerido: 15 a 20 minutos por ejercicio.'),
        h('p', { class: 'tenue' }, 'Los 4 primeros son los de la presentación; del 5 al 7, los «ejemplos cotidianos» convertidos en ejercicios. Cada uno se corrige ejecutándolo con dos grupos de datos y con la rúbrica de 5 puntos de tu profesor. Escríbelos completos, con Algoritmo y FinAlgoritmo.'),
        ...ejs.map(e => practicaMatriz(e, { tutor: true, alAprobar: id => { const x = aprobadosP(c.id); x[id] = true; ls.set('personal-ok-' + c.id, x); } }))),
      h('section', { class: 'tarjeta', id: 'p-evaluacion' }, h('span', { class: 'etiqueta' }, 'Criterios de evaluación'), h('h2', null, '9. ¿Cómo se revisa la actividad?'),
        h('table', { class: 'chuleta rubrica-tabla' }, h('thead', null, h('tr', null, h('th', null, 'Criterio'), h('th', null, 'Qué se mira'), h('th', null, 'Puntos'))),
          h('tbody', null, ...c.rubrica.map(([t, d]) => h('tr', null, h('td', null, h('b', null, t)), h('td', null, d), h('td', { class: 'num' }, '1.0'))), h('tr', null, h('td', null, h('b', null, 'Total')), h('td', null, ''), h('td', { class: 'num' }, h('b', null, '5.0'))))),
        h('p', { class: 'tenue' }, 'Antes de entregar, repasa: ¿Definir y Dimension con el tamaño correcto? ¿Dos Para (filas y columnas) con su FinPara? ¿Leer matriz[i,j]? ¿El Si solo donde hay que decidir, con su FinSi? ¿Lo probaste con varios datos?')),
      h('section', { class: 'tarjeta', id: 'p-cierre' }, h('span', { class: 'etiqueta' }, 'Cierre'), h('h2', null, '10. Lo esencial que debes recordar'),
        h('ul', { class: 'lista sabe' }, ...c.cierre.map(x => h('li', null, x))),
        h('p', null, '¿Qué pregunta te queda antes de los ejercicios? Házsela a Claude aquí abajo.')),
      chatPersonal(c));
  }
  /* Las imágenes que se pueden tocar: la matriz con sus casillas y el recorrido paso a paso */
  function visualPersonal(v) {
    const nombre = v.nombre, filas = v.valores ? v.valores.length : v.filas, cols = v.valores ? v.valores[0].length : v.columnas;
    const valor = (f, c) => (v.valores ? v.valores[f - 1][c - 1] : null);
    const info = h('p', { class: 'celda-info', 'aria-live': 'polite' });
    const celdas = [];
    const rejilla = h('div', { class: 'matriz-visual', style: `grid-template-columns: auto repeat(${cols}, minmax(0, 1fr))`, role: 'group', 'aria-label': `Matriz ${nombre} de ${filas} filas por ${cols} columnas` },
      h('span', { class: 'esquina', 'aria-hidden': 'true' }), ...Array.from({ length: cols }, (_, c) => h('span', { class: 'cab', 'aria-hidden': 'true' }, `columna ${c + 1}`)));
    for (let f = 1; f <= filas; f++) {
      rejilla.append(h('span', { class: 'cab fila-cab', 'aria-hidden': 'true' }, `fila ${f}`));
      for (let c = 1; c <= cols; c++) {
        const b = h('button', { class: 'celda', type: 'button', 'aria-label': `${nombre}[${f},${c}]` + (v.valores ? ` vale ${valor(f, c)}` : '') }, v.valores ? String(valor(f, c)) : `[${f},${c}]`);
        celdas.push({ b, f, c }); rejilla.append(b);
      }
    }
    const marca = (f, c, visitadas) => celdas.forEach(x => { x.b.classList.toggle('actual', x.f === f && x.c === c); x.b.classList.toggle('visitada', !!visitadas && visitadas.some(([a, d]) => a === x.f && d === x.c)); });
    if (v.tipo === 'recorrido') {
      const orden = []; for (let f = 1; f <= filas; f++) for (let c = 1; c <= cols; c++) orden.push([f, c]);
      let k = -1;
      const muestra = () => {
        if (k < 0) { marca(0, 0, []); info.textContent = 'Pulsa «Siguiente» para empezar el recorrido.'; return; }
        const [f, c] = orden[k]; marca(f, c, orden.slice(0, k));
        info.textContent = `Paso ${k + 1} de ${orden.length}: el Para de fuera tiene i = ${f} (fila ${f}); el de dentro, j = ${c} (columna ${c}). Se visita ${nombre}[${f},${c}].` + (c === cols && f < filas ? ' Al terminar la fila, j vuelve a 1 e i pasa a la siguiente fila.' : k === orden.length - 1 ? ' Fin: se visitaron todas las casillas.' : '');
      };
      celdas.forEach(x => { x.b.disabled = true; });
      const ant = h('button', { class: 'btn chico', type: 'button', onclick: () => { k = Math.max(-1, k - 1); muestra(); } }, '← Anterior');
      const sig = h('button', { class: 'btn chico primario', type: 'button', onclick: () => { k = Math.min(orden.length - 1, k + 1); muestra(); } }, 'Siguiente →');
      muestra();
      return h('div', { class: 'visual-personal' }, rejilla, info, h('div', { class: 'fila' }, ant, sig, h('button', { class: 'btn chico plano', type: 'button', onclick: () => { k = -1; muestra(); } }, 'Volver a empezar')));
    }
    celdas.forEach(x => x.b.addEventListener('click', () => { marca(x.f, x.c); info.textContent = `${nombre}[${x.f},${x.c}]` + (v.valores ? ` = ${valor(x.f, x.c)}` : '') + ` → fila ${x.f}, columna ${x.c}. Primero la fila, después la columna.`; }));
    info.textContent = 'Toca una casilla para ver su nombre.';
    return h('div', { class: 'visual-personal' }, rejilla, info);
  }
  /* Claude de profesor: conversación sobre el capítulo, con el material de la clase */
  function chatPersonal(c) {
    const s = ctx.sample && ctx.sample();
    const ch = st.chat[c.id] || (st.chat[c.id] = { log: (ls.get('personal-chat-' + c.id, []) || []).slice(-30), pensando: false });
    const campo = h('textarea', { class: 'campo', id: 'chat-personal-texto', rows: '2', placeholder: 'Pregúntale lo que quieras: qué es i y j, por qué falla tu programa, que te ponga otro ejercicio…', 'aria-label': 'Tu pregunta para Claude' });
    const prompt = t => `${REGLAS_PROFE}\n\nEl material del capítulo:\n${Pz.contexto(c)}\n\nPregunta del alumno: ${t}`;
    if (!s) {
      return h('section', { class: 'tarjeta', id: 'chat-personal' }, h('span', { class: 'etiqueta' }, 'Tu profesor'), h('h2', null, 'Pregúntale a Claude'),
        h('p', { class: 'tenue' }, 'Claude contesta aquí dentro cuando usas la versión de Claude del Dojo. En esta versión, escribe tu pregunta y cópiala con todo el capítulo: pégala en un chat de Claude y te lo explica con el material de tu clase.'),
        campo, h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: async () => { const t = campo.value.trim() || '¿Qué es lo más importante de este capítulo?'; if (await U.copia(prompt(t))) aviso('Pregunta copiada con el capítulo. Pégala en Claude.', 5000); else aviso('No se pudo copiar.'); } }, 'Copiar mi pregunta para Claude')));
    }
    const lista = h('ol', { class: 'chat' }, ...(ch.log.length ? [] : [h('li', { class: 'nota' }, 'Pregúntale lo que no entiendas. Conoce todo este capítulo y la rúbrica de tu profesor.')]),
      ...ch.log.map(m => h('li', { class: 'burbuja ' + (m.quien === 'yo' ? 'yo' : 'ella') }, h('span', { class: 'quien' }, m.quien === 'yo' ? 'Tú' : 'Claude'), h('span', { class: 'texto-chat' }, m.texto || '…'))));
    const envia = async texto => {
      texto = String(texto || '').trim(); if (!texto || ch.pensando) return;
      const sm = ctx.sample && ctx.sample(); if (!sm) return;
      ch.log.push({ quien: 'yo', texto }); const resp = { quien: 'claude', texto: '' }; ch.log.push(resp); ch.pensando = true; pinta();
      const ultima = () => { const b = document.querySelectorAll('#chat-personal .burbuja .texto-chat'); return b[b.length - 1]; };
      const hist = ch.log.slice(0, -1).slice(-12), mensajes = [];
      for (const m of hist) { const role = m.quien === 'yo' ? 'user' : 'assistant'; if (!m.texto) continue; if (mensajes.length && mensajes[mensajes.length - 1].role === role) mensajes[mensajes.length - 1].content += '\n' + m.texto; else mensajes.push({ role, content: m.texto }); }
      while (mensajes.length && mensajes[0].role !== 'user') mensajes.shift();
      if (mensajes.length) mensajes[0].content = prompt(mensajes[0].content);
      try {
        const { text } = await sm(mensajes, { modelTier: 'quick', cache: false, onText: ({ text: t }) => { resp.texto = t; const b = ultima(); if (b) b.textContent = t; } });
        resp.texto = text;
      } catch (e) {
        ch.log.pop();
        if (e && ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled'].includes(e.code)) { if (ctx.apagaTutor) ctx.apagaTutor(); aviso('Claude no está disponible aquí.'); }
        else aviso(e && e.code === 'rate_limited' ? 'Has usado mucho a Claude ahora mismo. Prueba en un rato.' : 'No se pudo preguntar a Claude. Prueba otra vez.', 4500);
      }
      ch.pensando = false; ls.set('personal-chat-' + c.id, ch.log.slice(-30)); pinta();
      const t = document.getElementById('chat-personal'); if (t) t.scrollIntoView({ block: 'end' });
    };
    campo.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envia(campo.value); } });
    return h('section', { class: 'tarjeta', id: 'chat-personal' }, h('div', { class: 'entre' }, h('div', null, h('span', { class: 'etiqueta' }, 'Tu profesor'), h('h2', null, 'Pregúntale a Claude')), h('span', { class: 'tenue', style: 'font-size:12.5px' }, 'Usa tu cuenta de Claude')),
      lista, ch.pensando ? h('p', { class: 'tenue', 'aria-live': 'polite' }, 'Claude está escribiendo…') : null,
      h('div', { class: 'fila sugerencias' }, ...c.sugerencias.map(t => h('button', { class: 'chip', type: 'button', disabled: ch.pensando || null, onclick: () => envia(t) }, t))),
      campo, h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'chat-personal-enviar', disabled: ch.pensando || null, onclick: () => envia(campo.value) }, 'Preguntar'),
        ch.log.length ? h('button', { class: 'btn plano', onclick: () => { ch.log = []; ls.set('personal-chat-' + c.id, []); pinta(); } }, 'Empezar otra conversación') : null));
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
        Ar ? h('button', { class: 'tarjeta acceso armar-acceso', onclick: () => ir_('armar') }, h('b', null, 'Cómo armar un programa'), h('span', { class: 'tenue' }, 'El método para no quedarte en blanco')) : null,
        h('button', { class: 'tarjeta acceso', onclick: () => ir_('chuleta') }, h('b', null, 'Chuleta'), h('span', { class: 'tenue' }, 'Todo lo esencial en una pantalla')),
        h('button', { class: 'tarjeta acceso', onclick: () => ir_('diccionario', { busca: '' }) }, h('b', null, 'Diccionario'), h('span', { class: 'tenue' }, `${G.diccionario(st.lang).length} palabras explicadas`)),
        h('button', { class: 'tarjeta acceso', onclick: empiezaPrueba }, h('b', null, 'Ponte a prueba'), h('span', { class: 'tenue' }, '10 preguntas, sin puntos'))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Los capítulos'),
        h('ol', { class: 'capitulos' }, ...g.capitulos.map((c, k) => h('li', null, h('button', { class: 'capitulo' + (l[c.id] ? ' leido' : ''), onclick: () => ir_('capitulo', { cap: k }) },
          h('span', { class: 'n', 'aria-hidden': 'true' }, l[c.id] ? '✓' : String(k + 1)), h('span', { class: 'pila', style: 'gap:2px' }, h('b', null, c.titulo), h('span', { class: 'tenue' }, c.objetivo))))))));
  }
  function vistaInicio() {
    return h('div', { class: 'columna' }, accesoPersonales(), accesoArmar(),
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
    if (st.modo === 'personal') { const c = Pz && Pz.porId(st.personal); if (c) st.lang = c.lang; else st.modo = 'inicio'; }
    if (!st.lang || !G.guias[st.lang]) st.modo = 'inicio';
    el.append(st.modo === 'personal' ? vistaPersonal() : st.modo === 'armar' && Ar ? vistaArmar() : st.modo === 'guiado' && Ar ? vistaGuiado() : st.modo === 'capitulo' ? vistaCapitulo() : st.modo === 'chuleta' ? vistaChuleta() : st.modo === 'diccionario' ? vistaDiccionario() : st.modo === 'prueba' && st.prueba ? vistaPrueba() : st.modo === 'lab' ? vistaLab() : st.modo === 'idioma' ? vistaIdioma() : vistaInicio());
    if (foco && document.getElementById(foco) && el.contains(document.getElementById(foco))) { const x = document.getElementById(foco); x.focus({ preventScroll: true }); if (x.type === 'search') x.setSelectionRange(x.value.length, x.value.length); }
  }
  return { pinta, inicio: () => { if (st.modo !== 'inicio') st.modo = st.lang ? 'idioma' : 'inicio'; }, abrePersonal: id => ir_('personal', { personal: id }), estado: st };
};
})(window);
