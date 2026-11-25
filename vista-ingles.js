/* Dojo de código · la pantalla de Inglés: las 12 unidades, la práctica con repaso espaciado (escuchar, leer,
   escribir y hablar) y la conversación guiada. Si estás en Claude, además, conversación libre con Claude.
   La app (app.js) le pasa lo que comparte: el progreso, los puntos, el tutor y la navegación. */
(function (raiz) {
'use strict';
raiz.VistaIngles = function (ctx) {
  const { P, N, I, U, Voz, ir, aviso, botonTutor, trataPuntos, chipPuntos, sample, vista } = ctx;
  const { $, h, ls } = U;
  const NIVEL = { A1: 'A1 · Principiante', A2: 'A2 · Básico', B1: 'B1 · Intermedio' };
  const ICONO_OIR = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  const ICONO_MIC = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></svg>';
  const REGLAS_PROFE = 'Eres un profesor de inglés paciente para programadores hispanohablantes que empiezan desde cero. Explicas en español sencillo, de tú, con frases cortas, sin saludos ni felicitaciones y sin formato Markdown. Cuando des una palabra en inglés, añade cómo se pronuncia escrita como se leería en español.';

  const st = { modo: 'inicio', abierta: null, fija: null, repaso: false, ej: null, respondido: false, elegida: null, ok: false, casi: false, armado: [], comp: null, habla: null, res: null, cola: [], ultimoItem: null, conv: null, libre: null, oyendo: '', borrador: '' };
  const autoVoz = () => ls.get('ingles-auto', true);
  const lento = () => P.d.ajustes.voz < 1;
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const semilla = () => Math.floor(Math.random() * 2147483647);
  function sorteo(items, peso) { const ps = items.map(peso), t = ps.reduce((a, b) => a + b, 0); let x = Math.random() * t; for (let k = 0; k < items.length; k++) { if ((x -= ps[k]) < 0) return items[k]; } return items[items.length - 1]; }
  const en = (txt, extra) => h('span', Object.assign({ lang: 'en' }, extra || {}), txt);
  const pinta = () => { if (vista() === 'ingles') PINTA(); };
  // Repintar cuando cambia lo que hay (la voz de Claude llega un poco después) o si empieza o acaba de escuchar
  let firmaVoz = '';
  Voz.alCambiar(() => {
    const firma = [Voz.sale, Voz.entra, Voz.origenSale, Voz.origenEntra, Voz.escuchando].join('|');
    if (firma === firmaVoz) return; firmaVoz = firma;
    if (vista() === 'ingles') PINTA();
  });

  /* ── Botones de voz ── */
  function botonOir(texto, etiqueta, opciones = {}) {
    if (!Voz.sale) return null;
    return h('button', { class: 'btn chico oir' + (opciones.grande ? ' grande' : ''), type: 'button', 'aria-label': (etiqueta || 'Escuchar') + ': ' + texto, title: 'Escuchar', html: ICONO_OIR + (opciones.texto ? `<span>${U.esc(opciones.texto)}</span>` : ''),
      onclick: () => Voz.decir(texto, { lento: opciones.lento || lento() }) });
  }
  function botonLento(texto) { return Voz.sale ? h('button', { class: 'btn chico plano', type: 'button', 'aria-label': 'Escuchar despacio: ' + texto, onclick: () => Voz.decir(texto, { lento: true }) }, 'Más despacio') : null; }
  function botonMic(al, texto = 'Toca y habla') {
    if (!Voz.entra) return null;
    const b = h('button', { class: 'microfono' + (Voz.escuchando ? ' escuchando' : ''), type: 'button', 'aria-pressed': String(Voz.escuchando), html: ICONO_MIC + `<span>${Voz.escuchando ? 'Escuchando… toca para terminar' : U.esc(texto)}</span>`,
      onclick: () => {
        if (Voz.escuchando) { Voz.parar(); return; }
        st.oyendo = '';
        // escuchar() se llama aquí mismo, sin esperar nada antes: el dictado lo exige
        Voz.escuchar({ parcial: t => { st.oyendo = t; const o = $('#ing-oyendo'); if (o) { o.textContent = t ? '«' + t + '»' : 'Te escucho…'; o.hidden = false; } } }).then(r => {
          st.oyendo = '';
          if (r.error) { aviso(Voz.mensajeError(r.error), 4500); pinta(); return; }
          al(r.alternativas);
        });
        pinta();
      } });
    return h('div', { class: 'pila-mic' }, b, h('p', { class: 'oyendo', id: 'ing-oyendo', 'aria-live': 'polite', hidden: !Voz.escuchando }, st.oyendo ? '«' + st.oyendo + '»' : 'Te escucho…'));
  }
  function estadoVoz() {
    const d = Voz.descripcion;
    return h('p', { class: 'tenue estado-voz' }, `Audio: ${d.s} · Micrófono: ${d.e}.`,
      !Voz.entra ? ' Sin micrófono aquí: los ejercicios de hablar se cambian por otros y en la conversación escribes.' : '',
      !Voz.sale ? ' Sin audio aquí: no salen ejercicios de escuchar.' : '');
  }

  /* ── Elegir el ejercicio siguiente ── */
  const PESOS = [['significado', 14], ['palabra', 12], ['escucha', 12], ['ordenar', 14], ['hueco', 12], ['traducir', 12], ['dictado', 8], ['habla', 12], ['error', 5]];
  function tipoPara(u) {
    const ok = PESOS.filter(([t]) => ((t !== 'escucha' && t !== 'dictado') || Voz.sale) && (t !== 'habla' || Voz.entra) && (t !== 'error' || u.n >= 7));
    const primeros = N.estadoUnidad(P.d, I, u.id).n < 4;   // al empezar una unidad, primero el vocabulario
    return sorteo(primeros ? ok.filter(([t]) => ['significado', 'palabra', 'escucha'].includes(t)) : ok, x => x[1])[0];
  }
  function itemPara(u, tipo) {
    const cands = I.items(u).filter(it => (tipo === 'escucha' ? true : ['significado', 'palabra'].includes(tipo) ? it.tipo === 'palabra' : it.tipo === 'frase'));
    const caja = it => (P.d.ingles.tarjetas[it.clave] || { caja: -1 }).caja;
    const it = sorteo(cands, x => (x.clave === st.ultimoItem && cands.length > 1 ? 0.1 : caja(x) < 0 ? 4 : 1 + (5 - caja(x)) * 0.6));
    st.ultimoItem = it.clave; return it.clave;
  }
  function specDeItem(clave, marca) {
    const it = I.itemPorClave(clave);
    const tipos = it.tipo === 'palabra' ? ['significado', 'palabra', ...(Voz.sale ? ['escucha'] : [])] : ['ordenar', 'hueco', 'traducir', ...(Voz.sale ? ['escucha', 'dictado'] : []), ...(Voz.entra ? ['habla'] : [])];
    return { unidad: it.u.id, tipo: azar(tipos), item: clave, seed: semilla(), marca };
  }
  function elegirSpec() {
    st.cola.forEach(x => { x.tras++; });
    const k = st.cola.findIndex(x => x.tras >= 3);
    if (k >= 0 && Math.random() < 0.6) { const x = st.cola.splice(k, 1)[0]; return Object.assign({}, x.spec, { seed: (x.spec.seed + 7919) % 2147483647, marca: 'Otra vez' }); }
    const pend = N.pendientesIngles(P.d, I);
    if (st.repaso) { if (pend.length) return specDeItem(pend[0].clave, 'Repaso'); st.repaso = false; aviso('No quedan repasos de inglés para hoy. Seguimos con tu unidad.'); }
    else if (!st.fija && pend.length && Math.random() < 0.3) return specDeItem(azar(pend.slice(0, 5)).clave, 'Repaso');
    const actual = N.unidadActual(P.d, I);
    const u = st.fija ? I.porId[st.fija] : actual.n > 1 && Math.random() < 0.25 ? I.unidades[Math.floor(Math.random() * (actual.n - 1))] : actual;
    const tipo = tipoPara(u);
    return { unidad: u.id, tipo, item: tipo === 'error' ? null : itemPara(u, tipo), seed: semilla() };
  }
  function nuevoEj() {
    for (let k = 0; k < 4; k++) {
      const spec = elegirSpec(); let e = null;
      try { e = I.generar(spec, { sale: Voz.sale, entra: Voz.entra }); } catch (x) { e = null; }
      if (e) { e.marca = spec.marca || ''; e.spec = spec; st.ej = e; break; }
    }
    Object.assign(st, { respondido: false, elegida: null, ok: false, casi: false, armado: [], comp: null, habla: null, res: null, oyendo: '', borrador: '' });
  }
  /* Llamar desde un toque: así el audio de «escucha» y «dictado» puede sonar solo */
  function siguiente() { Voz.callar(); nuevoEj(); PINTA(); if (st.ej && st.ej.audio && Voz.sale) Voz.decir(st.ej.audio, { lento: lento() }); const t = $('#v-ingles .ejercicio'); if (t && t.scrollIntoView && window.innerWidth < 900) t.scrollIntoView({ block: 'nearest' }); }

  /* ── Registrar la respuesta ── */
  function registrar(ok, o = {}) {
    const e = st.ej;
    st.ok = ok; st.casi = !!o.casi; st.respondido = true;
    st.res = N.registraIngles(P.d, I, { unidad: e.unidad, item: e.item, ok, habla: e.tipo === 'habla', casi: !!o.casi });
    if (!ok) st.cola.push({ spec: e.spec, tras: 0 });
    trataPuntos(st.res, ok);
    if (st.res.unidad) { const u = I.porId[e.unidad]; celebraUnidad(N.unidadActual(P.d, I), u); }
    else if (st.res.metaCumplida) aviso(`Meta de inglés de hoy cumplida: +${N.PUNTOS.metaIngles} puntos.`);
    // Al responder, se oye la frase o la palabra correcta (el toque permite hablar)
    if (Voz.sale && autoVoz() && e.tipo !== 'error' && e.tipo !== 'habla' && e.en) Voz.decir(e.en, { lento: lento() });
    PINTA();
  }
  function celebraUnidad(sig, u) {
    const fin = N.unidadesDominadas(P.d, I) >= I.unidades.length;
    U.celebra(0, fin ? 'Terminaste las 12 unidades: ya puedes leer documentación, pedir ayuda y hablar en una reunión en inglés. Sigue repasando.' : `+${N.PUNTOS.unidad} puntos. Siguiente: unidad ${sig.n}, «${sig.titulo}».`,
      { figura: h('span', { class: 'sello-en grande', 'aria-hidden': 'true' }, 'EN'), etiqueta: 'Unidad de inglés dominada', titulo: `Unidad ${u.n}: ${u.titulo}` });
  }
  function responde(k) { if (st.respondido || !st.ej) return; st.elegida = k; registrar(k === st.ej.correcta); }
  function compruebaTexto(valor) {
    const e = st.ej; if (st.respondido) return;
    if (!String(valor || '').trim()) { aviso('Escribe tu respuesta primero.'); return; }
    st.comp = { escrito: valor, ...I.comparaTexto(valor, e.en, e.alt) }; registrar(st.comp.ok);
  }
  function compruebaHabla(alternativas) {
    const e = st.ej; if (st.respondido) return;
    const r = I.puntuaHabla(alternativas, e.en); st.habla = r;
    registrar(r.score >= 0.8, { casi: r.score >= 0.5 });
  }

  /* ── Pintar un ejercicio ── */
  function opciones(textos, esIngles) {
    const g = h('div', { class: 'opciones' + (textos.some(t => t.length > 26) ? ' una' : ''), role: 'group', 'aria-label': 'Opciones' });
    textos.forEach((t, k) => {
      const b = h('button', { class: 'opcion', disabled: st.respondido || null, onclick: () => responde(k), 'aria-label': `Opción ${k + 1}: ${t}` },
        h('span', { class: 'letra', 'aria-hidden': 'true' }, String(k + 1)), h('span', { class: 'texto-opcion', lang: esIngles ? 'en' : null }, t));
      if (st.respondido) { if (k === st.ej.correcta) b.classList.add('correcta'); else if (k === st.elegida) b.classList.add('fallada'); }
      g.append(b);
    });
    return g;
  }
  function campoTexto(id, placeholder) {
    const ta = h('textarea', { class: 'campo respuesta-en', id, rows: '2', lang: 'en', spellcheck: 'false', autocapitalize: 'sentences', autocomplete: 'off', placeholder, 'aria-label': 'Tu respuesta en inglés', disabled: st.respondido || null,
      onkeydown: ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); compruebaTexto(ta.value); } } });
    ta.value = st.comp ? st.comp.escrito : st.borrador;
    ta.addEventListener('input', () => { st.borrador = ta.value; });
    // lo dictado se escribe en el campo (el de ahora: la pantalla puede haberse repintado mientras escuchaba)
    const mic = !st.respondido && Voz.entra ? botonMic(alts => { st.borrador = alts[0] || ''; PINTA(); const c = $('#' + id); if (c) c.focus(); }, 'Dictar') : null;
    return h('div', { class: 'pila' }, ta, st.respondido ? null : h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => compruebaTexto(ta.value) }, 'Comprobar'), mic));
  }
  function cuerpo() {
    const e = st.ej, u = I.porId[e.unidad], partes = [];
    if (e.tipo === 'significado') partes.push(h('h2', null, '¿Qué significa?'),
      h('div', { class: 'palabra-grande' }, en(e.en, { class: 'en-grande' }), botonOir(e.en, 'Escuchar la palabra')), h('p', { class: 'tenue' }, 'Se pronuncia más o menos «', h('b', null, e.pr), '».'), opciones(e.opciones, false));
    else if (e.tipo === 'palabra') partes.push(h('h2', null, '¿Cómo se dice en inglés?'), h('p', { class: 'es-grande' }, e.es), opciones(e.opciones, true));
    else if (e.tipo === 'escucha') partes.push(h('h2', null, 'Escucha y elige lo que oíste'),
      h('div', { class: 'fila' }, botonOir(e.audio, 'Escuchar', { grande: true, texto: 'Escuchar' }), botonLento(e.audio)), opciones(e.opciones, true));
    else if (e.tipo === 'hueco') partes.push(h('h2', null, 'Completa la frase'), h('p', { class: 'frase-en' }, en(st.respondido ? e.en : e.conHueco)), h('p', { class: 'tenue' }, 'Quiere decir: ', e.es), opciones(e.opciones, true));
    else if (e.tipo === 'error') partes.push(h('h2', null, '¿Qué te dice este error?'), h('p', { class: 'tenue' }, 'Es un mensaje real de Python o de C++. Léelo en inglés y elige qué significa.'), h('div', { class: 'salida mono', lang: 'en' }, e.mensaje), opciones(e.opciones, false));
    else if (e.tipo === 'ordenar') {
      const quedan = e.fichas.map((t, k) => k).filter(k => !st.armado.includes(k));
      partes.push(h('h2', null, 'Ordena la frase'), h('p', null, 'En inglés: «', h('b', null, e.es), '»'),
        h('div', { class: 'armado fichas-armadas', 'aria-label': 'Tu frase', lang: 'en' }, ...st.armado.map((k, j) => h('button', { class: 'ficha', disabled: st.respondido || null, 'aria-label': 'Quitar ' + e.fichas[k], onclick: () => { st.armado.splice(j, 1); PINTA(); } }, e.fichas[k]))));
      if (!st.respondido) partes.push(
        h('div', { class: 'fichas', lang: 'en' }, ...quedan.map(k => h('button', { class: 'ficha', 'aria-label': 'Añadir ' + e.fichas[k], onclick: () => { st.armado.push(k); PINTA(); } }, e.fichas[k]))),
        e.sobran ? h('p', { class: 'tenue', style: 'font-size:13px' }, `Sobran ${e.sobran} palabras.`) : null,
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', disabled: st.armado.length ? null : true, onclick: () => registrar(I.compruebaOrden(e, st.armado.map(k => e.fichas[k]))) }, 'Comprobar'),
          st.armado.length ? h('button', { class: 'btn', onclick: () => { st.armado = []; PINTA(); } }, 'Empezar de nuevo') : null));
    } else if (e.tipo === 'traducir') partes.push(h('h2', null, 'Dilo en inglés'), h('p', { class: 'es-grande' }, e.es), campoTexto('ing-escrito', Voz.entra ? 'Escríbelo o díctalo' : 'Escríbelo en inglés'));
    else if (e.tipo === 'dictado') partes.push(h('h2', null, 'Escucha y escríbelo'), h('div', { class: 'fila' }, botonOir(e.audio, 'Escuchar', { grande: true, texto: 'Escuchar' }), botonLento(e.audio)), campoTexto('ing-escrito', 'Escribe lo que oyes'));
    else if (e.tipo === 'habla') {
      partes.push(h('h2', null, 'Dilo en voz alta'), h('div', { class: 'palabra-grande' }, en(e.en, { class: 'frase-en' }), botonOir(e.en, 'Escuchar cómo se dice')), h('p', { class: 'tenue' }, 'Quiere decir: ', e.es));
      if (!st.respondido) partes.push(botonMic(compruebaHabla), h('p', { class: 'tenue', style: 'font-size:13px' }, 'Primero escúchalo; luego toca el micrófono y léelo en voz alta, sin prisa.'));
    }
    return { partes, u };
  }
  function respuesta() {
    const e = st.ej, ok = st.ok;
    const titulo = ok ? (st.comp && !st.comp.exacto ? 'Bien, casi perfecto' : 'Correcto') : st.casi ? 'Casi: repítelo' : e.tipo === 'habla' ? 'Todavía no se entiende' : e.tipo === 'ordenar' ? 'Ese orden no es el correcto' : 'No era esa';
    const caja = h('div', { class: 'respuesta ' + (ok ? 'si' : st.casi ? 'casi' : 'no'), role: 'status' }, h('div', { class: 'entre' }, h('h3', null, titulo), chipPuntos(st.res)));
    const fraseCorrecta = (txt, es) => h('div', { class: 'pila', style: 'gap:4px' }, h('div', { class: 'fila' }, h('b', { class: 'frase-en', lang: 'en' }, txt), botonOir(txt), botonLento(txt)), es ? h('span', { class: 'tenue' }, es) : null);
    if (e.tipo === 'significado' || e.tipo === 'palabra' || (e.tipo === 'escucha' && e.pr)) caja.append(fraseCorrecta(e.en, `${e.es || e.opciones[e.correcta]} · se pronuncia «${e.pr}»`));
    else if (e.tipo === 'error') caja.append(h('p', null, h('span', { class: 'mono', lang: 'en' }, e.mensaje), ' = ', h('b', null, e.opciones[e.correcta]), '.'), h('p', { class: 'tenue' }, 'Truco: la primera palabra (NameError, TypeError…) dice el tipo de problema; lo que va detrás de los dos puntos dice qué pasó.'));
    else if (e.tipo === 'habla') {
      const r = st.habla;
      caja.append(h('div', { class: 'fila' }, h('p', { class: 'palabras-dichas', lang: 'en' }, ...r.palabras.map(p => h('span', { class: p.ok ? 'bien' : 'mal' }, p.w))), botonOir(e.en), botonLento(e.en)),
        h('p', { class: 'tenue' }, `Te entendí: «${r.oido || '…'}» · ${Math.round(r.score * 100)} % de las palabras.`));
      if (!ok) caja.append(h('p', null, 'Las palabras en rojo no se entendieron. Escúchala otra vez, repítela despacio y vuelve a probar: saldrá de nuevo en unos ejercicios.'));
    } else {
      if (st.comp && !st.comp.exacto) caja.append(h('p', null, 'Escribiste: ', h('span', { lang: 'en' }, '«' + st.comp.escrito + '»')));
      caja.append(fraseCorrecta(e.en, e.es));
      if (e.alt && e.alt.length) caja.append(h('p', { class: 'tenue', style: 'font-size:13px' }, 'También vale: ', ...e.alt.map((a, k) => [k ? ' · ' : '', h('span', { lang: 'en' }, a)])));
    }
    caja.append(h('div', { class: 'fila' }, h('button', { class: 'btn primario', id: 'ing-siguiente', onclick: siguiente }, 'Siguiente'),
      e.tipo === 'habla' && !ok ? h('button', { class: 'btn', onclick: () => { st.respondido = false; st.habla = null; st.res = null; PINTA(); } }, 'Repetir (sin puntos)') : null));
    const pregunta = e.tipo === 'error' ? `Explica en 3 o 4 frases qué quiere decir este mensaje de error y palabra por palabra lo que significa en español: «${e.mensaje}». Luego di qué suele causarlo.`
      : `Explica en 3 a 5 frases la frase en inglés «${e.en}» (significa «${e.es || e.opciones[e.correcta]}»): qué significa cada palabra, cómo se pronuncia y una regla de gramática que tenga.${st.comp ? ` El alumno escribió «${st.comp.escrito}»: si tiene un error, dile cuál.` : ''}`;
    caja.append(botonTutor('Explícamelo mejor', () => `${REGLAS_PROFE}\n\n${pregunta}\n\nEl alumno ${ok ? 'acertó' : 'se equivocó'}.`));
    return caja;
  }
  function vistaPractica() {
    if (!st.ej) nuevoEj();
    const e = st.ej, { partes, u } = cuerpo(), d = N.leeDia(P.d), pend = N.pendientesIngles(P.d, I).length;
    const sel = h('select', { class: 'campo', id: 'ing-unidad', 'aria-label': 'Qué practicar', onchange: ev => { const v = ev.target.value; st.repaso = v === 'repaso'; st.fija = v === 'auto' || v === 'repaso' ? null : v; nuevoEj(); PINTA(); } },
      h('option', { value: 'auto' }, `Tu unidad (${N.unidadActual(P.d, I).titulo})`), h('option', { value: 'repaso' }, `Solo repasos de hoy (${pend})`),
      ...I.unidades.map(x => h('option', { value: x.id }, `${x.n}. ${x.titulo}`)));
    sel.value = st.repaso ? 'repaso' : st.fija || 'auto';
    const tarjeta = h('article', { class: 'tarjeta reto ejercicio' + (st.pintado !== e ? ' entra' : ''), 'aria-live': 'polite' },
      h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, I.NOMBRE_TIPO[e.tipo]),
        h('span', { class: 'fila', style: 'gap:6px' }, e.marca ? h('span', { class: 'insignia kihada' }, e.marca) : null, h('span', { class: 'insignia' }, `Unidad ${u.n}`), h('span', { class: 'insignia ai' }, u.nivel))),
      ...partes, st.respondido ? respuesta() : null);
    st.pintado = e;   // la animación de entrada solo con un ejercicio nuevo, no en cada repintado
    return h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Practicar inglés'),
      h('div', { class: 'entre' }, h('button', { class: 'btn plano', onclick: () => { Voz.callar(); st.modo = 'inicio'; PINTA(); } }, '← Inglés'), sel),
      tarjeta,
      h('div', { class: 'entre' }, h('span', { class: 'tenue num', style: 'font-size:13.5px' }, `Hoy: ${d.ingles} de ${P.d.ajustes.metaIngles} ejercicios${d.ingles ? ` · ${Math.round(d.inglesOk / d.ingles * 100)} % bien` : ''}${pend ? ` · ${pend} repasos` : ''}`),
        h('label', { class: 'interruptor' }, h('input', { type: 'checkbox', checked: autoVoz() || null, onchange: ev => ls.set('ingles-auto', ev.target.checked) }), ' Leer en voz alta al responder')));
  }

  /* ── Conversación guiada (la de cada unidad; da puntos y domina la unidad) ── */
  function conversar(id) {
    const u = I.porId[id] || N.unidadActual(P.d, I);
    Voz.callar(); st.modo = 'conversa'; st.libre = null;
    st.conv = { u, k: 0, intentos: 0, bien: 0, log: [{ quien: 'app', texto: u.dialogo[0].app }], fin: null, ejemplo: false };
    if (vista() !== 'ingles') ir('ingles'); else PINTA();
    if (Voz.sale) Voz.decir(u.dialogo[0].app, { lento: lento() });
  }
  function respondeConversa(alternativas) {
    const c = st.conv, t = c.u.dialogo[c.k]; if (!t || c.fin) return;
    const r = I.puntuaRespuesta(alternativas, t.respuestas), bien = r.score >= 0.7;
    c.log.push({ quien: 'yo', texto: alternativas[0] || r.oido, ok: bien }); c.ejemplo = false;
    if (bien) { c.bien++; avanza(); return; }
    c.intentos++;
    if (c.intentos >= 2) { c.log.push({ quien: 'nota', texto: `Seguimos. Una forma de decirlo: «${t.ejemplo}»` }); avanza(); }
    else { c.log.push({ quien: 'nota', texto: `No te entendí del todo. ${t.es} Prueba otra vez.` }); PINTA(); }
  }
  function avanza() {
    const c = st.conv; c.k++; c.intentos = 0;
    if (c.k >= c.u.dialogo.length) {
      c.fin = N.registraConversacion(P.d, I, c.u.id, { turnos: c.u.dialogo.length, bien: c.bien });
      if (c.fin.completa) { trataPuntos(c.fin, true); if (c.fin.unidad) celebraUnidad(N.unidadActual(P.d, I), c.u); }
      PINTA(); return;
    }
    const linea = c.u.dialogo[c.k].app; c.log.push({ quien: 'app', texto: linea }); PINTA();
    if (Voz.sale) Voz.decir(linea, { lento: lento() });
  }
  function burbujas(log) {
    return h('ol', { class: 'chat', 'aria-live': 'polite' }, ...log.map(m => m.quien === 'nota'
      ? h('li', { class: 'nota' }, m.texto)
      : h('li', { class: 'burbuja ' + (m.quien === 'yo' ? 'yo' : 'ella') + (m.quien === 'yo' ? (m.ok ? ' bien' : ' mal') : '') },
        h('span', { class: 'quien' }, m.quien === 'yo' ? 'Tú' : m.quien === 'claude' ? 'Claude' : 'Compañero'),
        h('span', { lang: 'en' }, m.texto), m.quien !== 'yo' && Voz.sale ? botonOir(m.texto, 'Escuchar otra vez') : null,
        m.es ? h('small', { class: 'correccion' }, m.es) : null)));
  }
  function entradaChat(al, id) {
    const campo = h('input', { class: 'campo', id, type: 'text', lang: 'en', autocomplete: 'off', placeholder: Voz.entra ? 'O escríbelo aquí' : 'Escribe tu respuesta en inglés', 'aria-label': 'Tu respuesta en inglés',
      onkeydown: ev => { if (ev.key === 'Enter') { ev.preventDefault(); enviar(); } } });
    const enviar = () => { const v = campo.value.trim(); if (!v) return; campo.value = ''; al([v]); };
    return h('div', { class: 'pila' }, botonMic(al, 'Toca y responde'), h('div', { class: 'fila entrada-chat' }, campo, h('button', { class: 'btn', onclick: enviar }, 'Enviar')));
  }
  function vistaConversa() {
    const c = st.conv, u = c.u, t = u.dialogo[c.k];
    const partes = [h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Conversación · unidad ${u.n}`), h('span', { class: 'insignia num' }, `${Math.min(c.k + (c.fin ? 0 : 1), u.dialogo.length)} de ${u.dialogo.length}`)),
      h('h2', null, u.tema), burbujas(c.log)];
    if (c.fin) {
      partes.push(h('div', { class: 'respuesta ' + (c.fin.completa ? 'si' : 'no'), role: 'status' },
        h('div', { class: 'entre' }, h('h3', null, c.fin.completa ? 'Conversación completada' : 'Casi: te faltó responder bien algunos turnos'), c.fin.completa ? chipPuntos(c.fin) : null),
        h('p', null, c.fin.completa ? `Respondiste bien ${c.bien} de ${u.dialogo.length}. ${c.fin.primera ? 'Esta conversación cuenta para dominar la unidad.' : 'Repetirla te da soltura.'}` : `Respondiste bien ${c.bien} de ${u.dialogo.length}. Para que cuente, hay que acertar todos menos uno. Repásala: las conversaciones no restan puntos.`),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => conversar(u.id) }, 'Otra vez'), h('button', { class: 'btn', onclick: () => { st.modo = 'inicio'; PINTA(); } }, 'Volver a Inglés'))));
    } else {
      partes.push(h('div', { class: 'pista-chat' }, h('b', null, 'Qué responder: '), t.es, ' ',
        c.ejemplo ? h('span', null, 'Por ejemplo: ', h('i', { lang: 'en' }, '«' + t.ejemplo + '»'), ' ', botonOir(t.ejemplo, 'Escuchar el ejemplo')) : h('button', { class: 'btn chico plano', onclick: () => { c.ejemplo = true; PINTA(); } }, 'Ver un ejemplo')),
        entradaChat(respondeConversa, 'conv-texto'));
    }
    return h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Conversación en inglés'),
      h('div', null, h('button', { class: 'btn plano', onclick: () => { Voz.callar(); Voz.parar(); st.modo = 'inicio'; PINTA(); } }, '← Inglés')),
      h('section', { class: 'tarjeta conversa' }, ...partes), tarjetaLibre(u));
  }

  /* ── Conversación libre con Claude (solo dentro de Claude, con el permiso de preguntarle) ── */
  const INSTRUCCION_LIBRE = u => `${I.instruccionConversacion(u)}\n\nResponde SIEMPRE con exactamente dos líneas, sin nada más:\nEN: tu respuesta en inglés, máximo dos frases cortas y fáciles, terminando con una pregunta.\nES: si el alumno cometió un error en su último mensaje, corrígelo en una frase corta en español; si no, escribe «Bien dicho.»`;
  function tarjetaLibre(u) {
    const s = sample();
    if (!s) return h('section', { class: 'tarjeta' }, h('h2', null, 'Conversación libre con Claude'),
      h('p', { class: 'tenue' }, 'Para hablar de verdad, sin guion: abre la app de Claude, empieza un chat nuevo, toca el modo de voz (el icono de ondas) y pega esta instrucción. Claude hará de compañero de equipo que solo habla inglés y te corregirá en español.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn', onclick: async () => { if (await U.copia(I.instruccionConversacion(u))) aviso('Instrucción copiada. Pégala en Claude y habla con el modo de voz.', 5000); else aviso('No se pudo copiar. Mantén pulsado el texto para copiarlo.'); } }, 'Copiar la instrucción para Claude')));
    return h('section', { class: 'tarjeta' }, h('h2', null, 'Conversación libre con Claude'),
      h('p', { class: 'tenue' }, 'Sin guion: Claude hace de compañero de equipo que solo habla inglés, sobre el tema de esta unidad, y te corrige en español. No da puntos: es para soltarte. Usa tu cuenta de Claude.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => empiezaLibre(u) }, 'Hablar con Claude')));
  }
  async function pideLibre() {
    const l = st.libre, s = sample(); if (!s) return;
    l.pensando = true; PINTA();
    const mensajes = [{ role: 'user', content: INSTRUCCION_LIBRE(l.u) + '\n\nEmpieza tú: salúdame y hazme la primera pregunta.' }];
    for (const m of l.log) if (m.quien === 'claude') mensajes.push({ role: 'assistant', content: 'EN: ' + m.texto + '\nES: ' + (m.es || 'Bien dicho.') }); else if (m.quien === 'yo') mensajes.push({ role: 'user', content: m.texto });
    try {
      const { text } = await s(mensajes, { modelTier: 'quick', cache: false });
      const eng = (/^\s*EN:\s*(.+)$/mi.exec(text) || [])[1], esp = (/^\s*ES:\s*(.+)$/mi.exec(text) || [])[1];
      const linea = (eng || text.split('\n')[0] || '').trim().slice(0, 400);
      l.log.push({ quien: 'claude', texto: linea, es: esp && !/^bien dicho/i.test(esp.trim()) ? esp.trim().slice(0, 300) : '' });
      l.pensando = false; PINTA();
      if (Voz.sale && linea) Voz.decir(linea, { lento: lento() });
    } catch (e) {
      l.pensando = false;
      if (e && ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled'].includes(e.code)) { st.libre = null; ctx.apagaTutor(); aviso('La conversación con Claude no está disponible aquí.'); }
      else aviso(e && e.code === 'rate_limited' ? 'Has usado mucho a Claude ahora mismo. Prueba en un rato.' : 'No se pudo hablar con Claude. Prueba otra vez.', 4500);
      PINTA();
    }
  }
  function empiezaLibre(u) { Voz.callar(); st.modo = 'libre'; st.libre = { u, log: [], pensando: false }; PINTA(); pideLibre(); }
  function vistaLibre() {
    const l = st.libre, turnos = l.log.filter(m => m.quien === 'yo').length, tope = 12;
    const partes = [h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, 'Conversación libre con Claude'), h('span', { class: 'insignia ai' }, `Unidad ${l.u.n} · ${l.u.nivel}`)), h('h2', null, l.u.tema), burbujas(l.log)];
    if (l.pensando) partes.push(h('p', { class: 'tenue' }, 'Claude está pensando…'));
    else if (turnos >= tope) partes.push(h('p', null, 'Buena charla. Para no gastar tu cuenta, la conversación termina aquí. Empieza otra cuando quieras.'), h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => empiezaLibre(l.u) }, 'Otra conversación')));
    else if (l.log.length) partes.push(entradaChat(alts => { l.log.push({ quien: 'yo', texto: alts[0] }); pideLibre(); }, 'libre-texto'));
    return h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Conversación libre con Claude'),
      h('div', null, h('button', { class: 'btn plano', onclick: () => { Voz.callar(); Voz.parar(); st.modo = 'inicio'; st.libre = null; PINTA(); } }, '← Inglés')),
      h('section', { class: 'tarjeta conversa' }, ...partes));
  }

  /* ── Una unidad por dentro ── */
  function estadoTexto(e, actual) { return e.dominada ? 'Dominada' : actual ? 'Tu unidad ahora' : e.visto ? 'Empezada' : 'Por ver'; }
  function vistaUnidad(u) {
    const e = N.estadoUnidad(P.d, I, u.id), actual = N.unidadActual(P.d, I) === u;
    return h('div', { class: 'columna' },
      h('div', null, h('button', { class: 'btn plano', onclick: () => { Voz.callar(); st.abierta = null; st.modo = 'inicio'; PINTA(); } }, '← Todas las unidades')),
      h('section', { class: 'tarjeta' },
        h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Unidad ${u.n} de ${I.unidades.length}`), h('span', { class: 'fila', style: 'gap:6px' }, h('span', { class: 'insignia ai' }, NIVEL[u.nivel]), h('span', { class: 'insignia' + (e.dominada ? ' bien' : '') }, estadoTexto(e, actual)))),
        h('h1', null, u.titulo), h('p', { class: 'tenue' }, u.tema),
        h('p', { class: 'tenue', style: 'font-size:13.5px' }, e.dominada ? 'Unidad dominada. Sus palabras seguirán saliendo en los repasos para que no se olviden.' : `Para dominarla: acierta 8 de los últimos 10 ejercicios (${e.n ? Math.round(e.prop * 100) + ' % de los últimos ' + e.n : 'aún sin ejercicios'}) y completa su conversación (${e.conversa ? 'hecha' : 'pendiente'}).`),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => { st.fija = u.id; st.repaso = false; st.modo = 'practica'; siguiente(); } }, 'Practicar esta unidad'), h('button', { class: 'btn', onclick: () => conversar(u.id) }, 'Conversar'))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Palabras'), !Voz.sale ? h('p', { class: 'tenue' }, 'La pronunciación va escrita como se leería en español.') : null,
        h('ul', { class: 'palabras' }, ...u.palabras.map(p => h('li', { class: 'palabra' }, h('div', { class: 'entre' }, h('b', { lang: 'en' }, p.en), botonOir(p.en)), h('small', { class: 'tenue' }, '«' + p.pr + '»'), h('span', null, p.es))))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Frases'),
        h('ul', { class: 'frases' }, ...u.frases.map(f => h('li', null, h('div', { class: 'fila', style: 'gap:6px' }, h('b', { lang: 'en' }, f.en), botonOir(f.en), botonLento(f.en)), h('span', { class: 'tenue' }, f.es))))),
      h('section', { class: 'tarjeta' }, h('h2', null, 'Gramática en tres ideas'), h('ul', { class: 'lista' }, ...u.gramatica.map(g => h('li', null, g)))),
      u.n === 7 ? h('section', { class: 'tarjeta' }, h('h2', null, 'Mensajes de error que vas a ver'), listaErrores()) : null,
      h('section', { class: 'tarjeta' }, h('h2', null, 'La conversación'), h('p', { class: 'tenue' }, 'Tu compañero de equipo te dirá esto. Tú respondes hablando (o escribiendo).'),
        h('ol', { class: 'lista' }, ...u.dialogo.map(t => h('li', null, h('span', { lang: 'en' }, t.app), h('small', { class: 'tenue', style: 'display:block' }, 'Tú: ' + t.es)))),
        h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => conversar(u.id) }, 'Empezar la conversación'))));
  }
  function listaErrores() {
    return h('ul', { class: 'errores-en' }, ...I.errores.map(([m, es]) => h('li', null, h('code', { class: 'mono', lang: 'en' }, m), h('span', { class: 'tenue' }, es))));
  }

  /* ── Inicio de Inglés ── */
  function vistaInicio() {
    const actual = N.unidadActual(P.d, I), e = N.estadoUnidad(P.d, I, actual.id), d = N.leeDia(P.d), meta = P.d.ajustes.metaIngles;
    const dom = N.unidadesDominadas(P.d, I), pend = N.pendientesIngles(P.d, I).length;
    const cab = h('section', { class: 'tarjeta portada-en' },
      h('span', { class: 'etiqueta' }, 'Inglés para programar · desde cero'),
      h('h1', null, 'Escúchalo, léelo y háblalo'),
      h('p', { class: 'tenue' }, 'El inglés que usan los programadores: leer errores y documentación, pedir ayuda y hablar en una reunión. 12 unidades, del nivel A1 al B1.'),
      h('div', { class: 'fila' }, h('span', { class: 'insignia ai' }, NIVEL[actual.nivel]), h('span', { class: 'insignia num' }, `${dom} de ${I.unidades.length} unidades`), h('span', { class: 'insignia num ' + (d.ingles >= meta ? 'bien' : 'kihada') }, `Hoy ${d.ingles} de ${meta}`)),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario grande', onclick: () => practicar() }, 'Practicar'), h('button', { class: 'btn grande', onclick: () => conversar(actual.id) }, 'Conversar'),
        pend ? h('button', { class: 'btn plano', onclick: repasar }, `Repasar (${pend})`) : null),
      estadoVoz());
    const ahora = h('section', { class: 'tarjeta siguiente' },
      h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, 'Tu unidad ahora'), h('span', { class: 'insignia ai' }, `Unidad ${actual.n}`)),
      h('h2', null, actual.titulo), h('p', { class: 'tenue' }, actual.tema),
      h('div', { class: 'fila', style: 'gap:14px' },
        h('div', { style: 'flex:1 1 200px;display:grid;gap:6px' }, h('small', { class: 'tenue' }, e.n ? `Ejercicios: ${Math.round(e.prop * 100)} % de los últimos ${e.n}` : 'Aún no hay ejercicios de esta unidad'), h('div', { class: 'barra' }, h('i', { style: `width:${Math.round(e.prop * 100)}%` }))),
        h('span', { class: 'insignia ' + (e.conversa ? 'bien' : '') }, e.conversa ? 'Conversación hecha' : 'Falta la conversación'),
        h('button', { class: 'btn chico', onclick: () => abrirUnidad(actual.id) }, 'Ver la unidad')));
    const grupos = ['A1', 'A2', 'B1'].map(nv => h('div', { class: 'pila' }, h('span', { class: 'etiqueta' }, NIVEL[nv]),
      h('ol', { class: 'temas', start: String(I.unidades.find(u => u.nivel === nv).n) }, ...I.unidades.filter(u => u.nivel === nv).map(u => {
        const x = N.estadoUnidad(P.d, I, u.id), esActual = u === actual;
        return h('li', null, h('button', { class: 'tema' + (x.dominada ? ' hecho' : esActual ? ' actual' : ''), onclick: () => abrirUnidad(u.id) },
          h('span', { class: 'n', 'aria-hidden': 'true' }, x.dominada ? '✓' : String(u.n)),
          h('span', { class: 'detalle' }, h('b', null, u.titulo), h('span', { class: 'tenue', style: 'font-size:13.5px' }, u.tema),
            h('span', { class: 'fila', style: 'gap:10px' }, h('span', { class: 'barra', style: 'flex:1 1 120px' }, h('i', { style: `width:${Math.round(x.prop * 100)}%` })), h('small', { class: 'tenue num' }, x.n ? `${Math.round(x.prop * 100)} %` : ''))),
          h('span', { class: 'lado' }, h('span', { class: 'insignia' + (x.dominada ? ' bien' : esActual ? ' ai' : '') }, estadoTexto(x, esActual)), h('span', { class: 'tenue', style: 'font-size:12px' }, `${u.palabras.length} palabras · ${u.frases.length} frases`))));
      }))));
    const ajustes = h('section', { class: 'tarjeta' }, h('h2', null, 'Ajustes de inglés'),
      h('div', { class: 'ajuste' }, h('span', { class: 'etiqueta' }, 'Ejercicios al día'), h('div', { class: 'chips', role: 'group', 'aria-label': 'Ejercicios de inglés al día' }, ...[5, 10, 15, 20].map(n => h('button', { class: 'chip', 'aria-pressed': String(meta === n), onclick: () => { P.d.ajustes.metaIngles = n; P.cambio(); PINTA(); } }, String(n))))),
      Voz.sale ? h('div', { class: 'ajuste' }, h('span', { class: 'etiqueta' }, 'Velocidad de la voz'), h('div', { class: 'chips', role: 'group', 'aria-label': 'Velocidad de la voz' },
        h('button', { class: 'chip', 'aria-pressed': String(!lento()), onclick: () => { P.d.ajustes.voz = 1; P.cambio(); PINTA(); Voz.decir('This is the normal speed.'); } }, 'Normal'),
        h('button', { class: 'chip', 'aria-pressed': String(lento()), onclick: () => { P.d.ajustes.voz = 0.75; P.cambio(); PINTA(); Voz.decir('This is the slow speed.', { lento: true }); } }, 'Más despacio'))) : null,
      h('details', null, h('summary', null, 'Cómo se aprende aquí'),
        h('ul', { class: 'lista tenue' }, h('li', null, 'Cada unidad empieza por las palabras; luego vienen las frases: ordenarlas, completarlas, escucharlas, escribirlas y decirlas.'),
          h('li', null, 'Lo que fallas vuelve a salir en esa misma sesión, y lo que aciertas vuelve dentro de 1, 3, 7, 16 y 35 días: es el repaso espaciado.'),
          h('li', null, 'Para hablar: escucha primero, repite despacio y después prueba sin mirar. El micrófono te dice qué palabras se entendieron.'),
          h('li', null, `Cada acierto suma ${N.PUNTOS.ingles} puntos (${N.PUNTOS.habla} si lo dices bien en voz alta) y cada fallo resta ${-N.PUNTOS.inglesFallo}.`))));
    return h('div', { class: 'columna' }, cab, ahora, h('section', { class: 'tarjeta' }, h('h2', null, 'Las 12 unidades'), ...grupos),
      h('section', { class: 'tarjeta' }, h('details', null, h('summary', null, h('b', null, 'Mensajes de error en inglés que vas a ver')), listaErrores())), ajustes);
  }

  function PINTA() {
    const el = $('#v-ingles'); if (!el) return;
    const foco = document.activeElement && document.activeElement.id;
    const escrito = {}; el.querySelectorAll('input[id][type="text"]').forEach(x => { escrito[x.id] = x.value; });   // no perder lo que se está escribiendo
    el.textContent = '';
    if (st.modo === 'practica') el.append(vistaPractica());
    else if (st.modo === 'conversa' && st.conv) el.append(vistaConversa());
    else if (st.modo === 'libre' && st.libre) el.append(vistaLibre());
    else if (st.modo === 'unidad' && st.abierta) el.append(vistaUnidad(I.porId[st.abierta]));
    else { st.modo = 'inicio'; el.append(vistaInicio()); }
    for (const id in escrito) { const x = document.getElementById(id); if (x && !x.value) x.value = escrito[id]; }
    const s = $('#ing-siguiente');
    if (st.modo === 'practica' && st.respondido && s && (!foco || foco === 'ing-escrito' || el.contains(document.activeElement) || document.activeElement === document.body)) s.focus({ preventScroll: true });
    else if (foco && document.getElementById(foco) && el.contains(document.getElementById(foco))) document.getElementById(foco).focus({ preventScroll: true });
    if (st.modo === 'conversa' || st.modo === 'libre') { const c = el.querySelector('.chat'); if (c && c.lastElementChild && c.lastElementChild.scrollIntoView && window.innerWidth < 900) c.lastElementChild.scrollIntoView({ block: 'nearest' }); }
  }
  function practicar(uid) { st.fija = uid || null; st.repaso = false; st.modo = 'practica'; if (vista() !== 'ingles') ir('ingles'); siguiente(); }
  function repasar() { st.fija = null; st.repaso = true; st.modo = 'practica'; if (vista() !== 'ingles') ir('ingles'); siguiente(); }
  function abrirUnidad(id) { st.abierta = id; st.modo = 'unidad'; if (vista() !== 'ingles') ir('ingles'); else { PINTA(); window.scrollTo(0, 0); } }
  function inicio() { st.modo = 'inicio'; st.abierta = null; }

  // Teclado en la práctica: 1 a 4 para responder, Enter para el siguiente
  document.addEventListener('keydown', ev => {
    if (vista() !== 'ingles' || st.modo !== 'practica' || !st.ej || ev.ctrlKey || ev.metaKey || ev.altKey || document.querySelector('.capa')) return;
    if (ev.target.closest && ev.target.closest('input, textarea, select')) return;
    if (!st.respondido && /^[1-4]$/.test(ev.key) && st.ej.opciones) { ev.preventDefault(); responde(+ev.key - 1); }
    else if (st.respondido && ev.key === 'Enter' && !(ev.target.closest && ev.target.closest('button'))) { ev.preventDefault(); siguiente(); }
  });

  return { pinta: PINTA, practicar, repasar, conversar, abrirUnidad, inicio, NIVEL, estado: st };
};
})(window);
