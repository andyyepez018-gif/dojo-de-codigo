/* Dojo de código · la pantalla «Habla»: hablar como programador, en español y en inglés.
   Seis bloques con sus términos (español, inglés, definición y ejemplo) y situaciones del trabajo
   (lo que no se dice y lo que dice un profesional). Práctica con repaso espaciado: acertar suma, fallar resta. */
(function (raiz) {
'use strict';
raiz.VistaHabla = function (ctx) {
  const { P, N, J, U, Voz, ir, aviso, botonTutor, trataPuntos, chipPuntos, vista } = ctx;
  const { $, h } = U;
  const st = { modo: 'inicio', abierto: null, fijo: null, repaso: false, ej: null, respondido: false, elegida: null, res: null, cola: [], ultimo: null, pintado: null };
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const semilla = () => Math.floor(Math.random() * 2147483647);
  function sorteo(items, peso) { const ps = items.map(peso), t = ps.reduce((a, b) => a + b, 0); let x = Math.random() * t; for (let k = 0; k < items.length; k++) { if ((x -= ps[k]) < 0) return items[k]; } return items[items.length - 1]; }
  const oir = (t, etq) => (Voz.sale ? h('button', { class: 'btn chico oir', type: 'button', 'aria-label': (etq || 'Escuchar en inglés') + ': ' + t, onclick: () => Voz.decir(t) }, '▶') : null);

  /* ── Elegir el ejercicio ── */
  const TIPOS_T = ['definicion', 'termino', 'ingles', 'hueco'], TIPOS_S = ['profesional', 'frase-en'];
  function elegirSpec() {
    st.cola.forEach(x => { x.tras++; });
    const k = st.cola.findIndex(x => x.tras >= 3);
    if (k >= 0 && Math.random() < 0.6) { const x = st.cola.splice(k, 1)[0]; return Object.assign({}, x, { seed: (x.seed + 7919) % 2147483647, marca: 'Otra vez' }); }
    const pend = N.pendientesJerga(P.d, J);
    if (st.repaso) { if (pend.length) return deItem(pend[0].clave, 'Repaso'); st.repaso = false; aviso('No quedan repasos de habla para hoy.'); }
    else if (!st.fijo && pend.length && Math.random() < 0.3) return deItem(azar(pend.slice(0, 5)).clave, 'Repaso');
    const actual = N.bloqueActual(P.d, J);
    const b = st.fijo ? J.porId[st.fijo] : actual.n > 1 && Math.random() < 0.25 ? J.bloques[Math.floor(Math.random() * (actual.n - 1))] : actual;
    const situacion = N.estadoBloque(P.d, J, b.id).n >= 3 && Math.random() < 0.4;   // primero los términos
    const cands = J.items(b).filter(it => it.tipo === (situacion ? 'situacion' : 'termino'));
    const caja = it => (P.d.jerga.tarjetas[it.clave] || { caja: -1 }).caja;
    const it = sorteo(cands, x => (x.clave === st.ultimo && cands.length > 1 ? 0.1 : caja(x) < 0 ? 4 : 1 + (5 - caja(x)) * 0.6)); st.ultimo = it.clave;
    return { bloque: b.id, item: it.clave, tipo: azar(situacion ? TIPOS_S : TIPOS_T), seed: semilla() };
  }
  function deItem(clave, marca) { const it = J.itemPorClave(clave); return { bloque: it.b.id, item: clave, tipo: azar(it.tipo === 'termino' ? TIPOS_T : TIPOS_S), seed: semilla(), marca }; }
  function nuevo() { const spec = elegirSpec(); const e = J.generar(spec); e.marca = spec.marca || ''; e.spec = spec; Object.assign(st, { ej: e, respondido: false, elegida: null, res: null }); }
  function siguiente() { nuevo(); pinta(); const t = $('#v-habla .ejercicio'); if (t && t.scrollIntoView && window.innerWidth < 900) t.scrollIntoView({ block: 'nearest' }); }
  function responde(k) {
    if (st.respondido) return; const e = st.ej, ok = k === e.correcta;
    st.elegida = k; st.respondido = true;
    st.res = N.registraJerga(P.d, J, { bloque: e.bloque, item: e.item, ok });
    if (!ok) st.cola.push(Object.assign({}, e.spec, { tras: 0 }));
    trataPuntos(st.res, ok);
    if (st.res.bloque) { const b = J.porId[e.bloque], sig = N.bloqueActual(P.d, J); U.celebra(0, `+${N.PUNTOS.unidad} puntos. ${sig !== b ? `Siguiente: «${sig.titulo}».` : ''}`, { figura: h('span', { class: 'sello-en grande', 'aria-hidden': 'true' }, 'PRO'), etiqueta: 'Bloque de habla dominado', titulo: b.titulo }); }
    if (Voz.sale && e.en && (e.tipo === 'ingles' || e.tipo === 'frase-en')) Voz.decir(e.en);
    pinta();
  }

  /* ── Pintar ── */
  function opciones(e, ingles) {
    const g = h('div', { class: 'opciones una', role: 'group', 'aria-label': 'Opciones' });
    e.opciones.forEach((t, k) => {
      const b = h('button', { class: 'opcion', disabled: st.respondido || null, onclick: () => responde(k), 'aria-label': `Opción ${k + 1}: ${t}` }, h('span', { class: 'letra', 'aria-hidden': 'true' }, String(k + 1)), h('span', { class: 'texto-opcion', lang: ingles ? 'en' : null }, t));
      if (st.respondido) { if (k === e.correcta) b.classList.add('correcta'); else if (k === st.elegida) b.classList.add('fallada'); }
      g.append(b);
    });
    return g;
  }
  function cuerpo(e) {
    if (e.tipo === 'definicion') return [h('h2', null, '¿Qué término es?'), h('p', { class: 'es-grande' }, e.def), opciones(e)];
    if (e.tipo === 'termino') return [h('h2', null, `¿Qué significa «${e.es}»?`), opciones(e)];
    if (e.tipo === 'ingles') return [h('h2', null, `¿Cómo se dice «${e.es}» en inglés?`), opciones(e, true)];
    if (e.tipo === 'hueco') return [h('h2', null, 'Completa con el término correcto'), h('p', { class: 'frase-en' }, e.conHueco), opciones(e)];
    if (e.tipo === 'profesional') return [h('h2', null, '¿Cómo lo dice un profesional?'), h('p', { class: 'situacion' }, e.situacion), opciones(e)];
    return [h('h2', null, 'Dilo en inglés profesional'), h('p', { class: 'situacion' }, e.situacion), h('p', { class: 'es-grande' }, '«' + e.es + '»'), opciones(e, true)];
  }
  function respuesta() {
    const e = st.ej, ok = st.elegida === e.correcta;
    const caja = h('div', { class: 'respuesta ' + (ok ? 'si' : 'no'), role: 'status' }, h('div', { class: 'entre' }, h('h3', null, ok ? 'Correcto' : 'No era esa'), chipPuntos(st.res)));
    if (e.tipo === 'profesional' || e.tipo === 'frase-en') {
      const s = J.itemPorClave(e.item).x;
      caja.append(h('p', null, h('b', null, 'Profesional: '), s.profesional), h('p', { class: 'fila', style: 'gap:6px' }, h('b', null, 'En inglés: '), h('span', { lang: 'en' }, s.en), oir(s.en)),
        h('p', { class: 'tenue' }, h('b', null, 'Así no: '), `«${s.informal}»`, ' Es vago o suena mal: el profesional dice qué pasa, qué hace y cuándo.'));
    } else caja.append(h('p', null, h('b', null, e.es), ' · ', h('span', { lang: 'en' }, e.en), ' ', oir(e.en)), h('p', null, e.def), h('p', { class: 'tenue' }, 'Ejemplo: ' + e.ej));
    caja.append(h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'hab-siguiente', onclick: siguiente }, 'Siguiente')));
    caja.append(botonTutor('Explícamelo mejor', () => `Eres un programador con experiencia que enseña a un principiante a hablar como profesional. En español sencillo, de tú, frases cortas, sin Markdown.\n\n${e.tipo === 'profesional' || e.tipo === 'frase-en' ? `Situación: ${e.situacion}\nForma profesional: ${J.itemPorClave(e.item).x.profesional}\nExplica en 3 o 4 frases por qué esa forma es mejor y da otra forma profesional de decirlo, también en inglés.` : `Explica el término «${e.es}» (en inglés «${e.en}») en 3 o 4 frases, con un ejemplo de código o de trabajo real, y cómo se pronuncia en inglés escrito como se leería en español.`}`));
    return caja;
  }
  function vistaPractica() {
    if (!st.ej) nuevo();
    const e = st.ej, b = J.porId[e.bloque], d = N.leeDia(P.d), pend = N.pendientesJerga(P.d, J).length;
    const sel = h('select', { class: 'campo', id: 'hab-bloque', 'aria-label': 'Qué practicar', onchange: ev => { const v = ev.target.value; st.repaso = v === 'repaso'; st.fijo = v === 'auto' || v === 'repaso' ? null : v; siguiente(); } },
      h('option', { value: 'auto' }, `Tu bloque (${N.bloqueActual(P.d, J).titulo})`), h('option', { value: 'repaso' }, `Solo repasos de hoy (${pend})`), ...J.bloques.map(x => h('option', { value: x.id }, `${x.n}. ${x.titulo}`)));
    sel.value = st.repaso ? 'repaso' : st.fijo || 'auto';
    const tarjeta = h('article', { class: 'tarjeta reto ejercicio' + (st.pintado !== e ? ' entra' : ''), 'aria-live': 'polite' },
      h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, J.NOMBRE_TIPO[e.tipo]), h('span', { class: 'fila', style: 'gap:6px' }, e.marca ? h('span', { class: 'insignia kihada' }, e.marca) : null, h('span', { class: 'insignia' }, `Bloque ${b.n}`))),
      ...cuerpo(e), st.respondido ? respuesta() : null);
    st.pintado = e;
    return h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Practicar habla de programador'),
      h('div', { class: 'entre' }, h('button', { class: 'btn plano', onclick: () => { st.modo = 'inicio'; pinta(); } }, '← Habla'), sel), tarjeta,
      h('p', { class: 'tenue num', style: 'font-size:13.5px' }, `Hoy: ${d.jerga} ${d.jerga === 1 ? 'ejercicio' : 'ejercicios'} de habla${d.jerga ? ` · ${Math.round(d.jergaOk / d.jerga * 100)} % bien` : ''}${pend ? ` · ${pend} repasos` : ''}`));
  }
  function vistaBloque(b) {
    const e = N.estadoBloque(P.d, J, b.id);
    return h('div', { class: 'columna' },
      h('div', null, h('button', { class: 'btn plano', onclick: () => { st.modo = 'inicio'; pinta(); } }, '← Todos los bloques')),
      h('section', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Bloque ${b.n} de ${J.bloques.length}`), h('span', { class: 'insignia' + (e.dominado ? ' bien' : '') }, e.dominado ? 'Dominado' : e.visto ? 'Empezado' : 'Por ver')),
        h('h1', null, b.titulo), h('p', { class: 'tenue' }, b.tema),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => { st.fijo = b.id; st.repaso = false; st.modo = 'practica'; siguiente(); } }, 'Practicar este bloque'))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Términos'),
        h('ul', { class: 'glosario' }, ...b.terminos.map(t => h('li', null, h('div', { class: 'fila', style: 'gap:8px' }, h('b', null, t.es), h('span', { class: 'insignia ai', lang: 'en' }, t.en), oir(t.en)), h('span', null, t.def), h('small', { class: 'tenue' }, 'Ejemplo: ' + t.ej))))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Cómo lo dice un profesional'),
        h('ul', { class: 'situaciones' }, ...b.situaciones.map(s => h('li', null, h('b', null, s.situacion),
          h('p', { class: 'mal-dicho' }, h('span', { class: 'sr-only' }, 'Así no: '), '«' + s.informal + '»'),
          h('p', { class: 'bien-dicho' }, h('span', { class: 'sr-only' }, 'Así sí: '), '«' + s.profesional + '»'),
          h('p', { class: 'fila', style: 'gap:6px' }, h('span', { lang: 'en', class: 'tenue' }, s.en), oir(s.en)))))));
  }
  function vistaInicio() {
    const actual = N.bloqueActual(P.d, J), e = N.estadoBloque(P.d, J, actual.id), pend = N.pendientesJerga(P.d, J).length, dom = N.bloquesDominados(P.d, J);
    return h('div', { class: 'columna' },
      h('section', { class: 'tarjeta portada-habla' },
        h('span', { class: 'etiqueta' }, 'Habla de programador · español e inglés'),
        h('h1', null, 'Habla como un profesional'),
        h('p', { class: 'tenue' }, 'Los términos del oficio y la forma de decir las cosas en el trabajo: reportar un fallo, pedir una revisión, estimar, avisar de un bloqueo. En español y en inglés. Entra en los exámenes de rango.'),
        h('div', { class: 'fila' }, h('span', { class: 'insignia num' }, `${dom} de ${J.bloques.length} bloques`), h('span', { class: 'insignia ai' }, `Ahora: ${actual.titulo}`)),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario grande', onclick: () => practicar() }, 'Practicar'), pend ? h('button', { class: 'btn', onclick: () => { st.repaso = true; st.fijo = null; st.modo = 'practica'; siguiente(); } }, `Repasar (${pend})`) : null),
        h('small', { class: 'tenue' }, e.n ? `Bloque actual: ${Math.round(e.prop * 100)} % de los últimos ${e.n}. Se domina con 8 de los últimos 10.` : 'Empieza por los términos del primer bloque.')),
      h('ol', { class: 'temas' }, ...J.bloques.map(b => {
        const x = N.estadoBloque(P.d, J, b.id), es = b === actual;
        return h('li', null, h('button', { class: 'tema' + (x.dominado ? ' hecho' : es ? ' actual' : ''), onclick: () => { st.abierto = b.id; st.modo = 'bloque'; pinta(); window.scrollTo(0, 0); } },
          h('span', { class: 'n', 'aria-hidden': 'true' }, x.dominado ? '✓' : String(b.n)),
          h('span', { class: 'detalle' }, h('b', null, b.titulo), h('span', { class: 'tenue', style: 'font-size:13.5px' }, b.tema), h('span', { class: 'barra', style: 'max-width:220px' }, h('i', { style: `width:${Math.round(x.prop * 100)}%` }))),
          h('span', { class: 'lado' }, h('span', { class: 'insignia' + (x.dominado ? ' bien' : es ? ' ai' : '') }, x.dominado ? 'Dominado' : es ? 'Tu bloque ahora' : x.visto ? 'Empezado' : 'Por ver'), h('span', { class: 'tenue', style: 'font-size:12px' }, `${b.terminos.length} términos · ${b.situaciones.length} situaciones`))));
      })));
  }
  function pinta() {
    const el = $('#v-habla'); if (!el) return; el.textContent = '';
    if (st.modo === 'practica') el.append(vistaPractica());
    else if (st.modo === 'bloque' && st.abierto) el.append(vistaBloque(J.porId[st.abierto]));
    else { st.modo = 'inicio'; el.append(vistaInicio()); }
    const s = $('#hab-siguiente'); if (st.modo === 'practica' && st.respondido && s) s.focus({ preventScroll: true });
  }
  function practicar() { st.fijo = null; st.repaso = false; st.modo = 'practica'; if (vista() !== 'habla') ir('habla'); siguiente(); }
  document.addEventListener('keydown', ev => {
    if (vista() !== 'habla' || st.modo !== 'practica' || !st.ej || ev.ctrlKey || ev.metaKey || ev.altKey || document.querySelector('.capa')) return;
    if (ev.target.closest && ev.target.closest('input, textarea, select')) return;
    if (!st.respondido && /^[1-4]$/.test(ev.key)) { ev.preventDefault(); responde(+ev.key - 1); }
    else if (st.respondido && ev.key === 'Enter' && !(ev.target.closest && ev.target.closest('button'))) { ev.preventDefault(); siguiente(); }
  });
  return { pinta, practicar, inicio: () => { st.modo = 'inicio'; }, estado: st };
};
})(window);
