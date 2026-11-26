/* Dojo de código · las pantallas: Hoy, Retos, Inglés, Habla, Ruta, Laboratorio, Plan y examen.
   La lógica sin pantalla está en nucleo.js; las piezas visuales en ui.js; la ejecución en ejecutor.js;
   el curso de inglés en ingles.js (contenido) y vista-ingles.js (pantalla); la voz en voz.js. */
(function () {
'use strict';
const D = window.Dojo, M = window.Motor, N = window.Nucleo, U = window.UI, E = window.Ejecutor, I = window.Ingles, J = window.Habla, Voz = window.Voz;
const { $, h, ls, mmss, NL, aviso, bloqueCodigo, salidaBloque, cinturon, CINTURONES } = U;
const LANGS = N.LANGS, VERSION = N.VERSION;
const URL_APP = 'https://andyyepez018-gif.github.io/dojo-de-codigo/';
const enClaude = !!(window.claude && window.claude.use);
document.documentElement.lang = 'es';

/* ───────────── Progreso: en la cuenta (versión de Claude) o en este dispositivo ───────────── */
const P = {
  d: N.normaliza(ls.get('progreso', null), D, I, J), ref: null, escribiendo: false, otraVez: false, t: null, enCuenta: false,
  async iniciar() {
    try {
      if (!enClaude) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const id = user ? await user.id() : null;
      if (!db || !id) return;
      this.ref = db.doc('data/users/' + id + '/progreso');
      let primera = true;
      this.ref.onSnapshot(snap => {
        const remoto = snap.exists ? snap.data() : null;
        if (primera && !snap.metadata.fromCache) { primera = false; this.enCuenta = true; pintaPie(); if (!remoto || (remoto.actualizado || 0) < this.d.actualizado) this.guardar(); }
        if (remoto && (remoto.actualizado || 0) > this.d.actualizado && !this.t && !this.escribiendo) {
          this.d = N.normaliza(JSON.parse(JSON.stringify(remoto)), D, I, J); ls.set('progreso', this.d); repintar();
        }
      }, () => { this.ref = null; pintaPie(); });
    } catch (e) { this.ref = null; }
  },
  cambio() { this.d.actualizado = Date.now(); ls.set('progreso', this.d); clearTimeout(this.t); this.t = setTimeout(() => { this.t = null; this.guardar(); }, 2000); },
  async guardar() {
    if (!this.ref) return;
    if (this.escribiendo) { this.otraVez = true; return; }
    this.escribiendo = true;
    try { await this.ref.set(JSON.parse(JSON.stringify(this.d))); }
    catch (e) { if (e && e.code === 'invalid_argument') this.ref = null; }
    finally { this.escribiendo = false; if (this.otraVez) { this.otraVez = false; this.guardar(); } }
  },
  sustituye(d) { this.d = d; this.cambio(); }
};
const est = id => N.estadoTema(P.d, D, id);
const temaActual = () => N.temaActual(P.d, D);
const dominados = () => N.dominados(P.d, D);
function pintaPie() { const el = $('#pie-lateral'); if (el) el.textContent = (P.enCuenta ? 'Tu progreso se guarda en tu cuenta: es el mismo en el PC y en el móvil.' : 'Tu progreso se guarda en este dispositivo.') + ' Versión ' + VERSION + '.'; }

/* ───────────── App instalable y actualizable (fuera de Claude) ───────────── */
const instalada = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const esIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
let pedirInstalar = null, actualizando = false;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedirInstalar = e; pintaInstalar(); });
window.addEventListener('appinstalled', () => { pedirInstalar = null; P.d.plan.checks['dojo-inicio'] = true; P.cambio(); pintaInstalar(); aviso('App instalada. Ponla en la pantalla de inicio, donde estaba TikTok.', 5000); });
async function instalar() { if (!pedirInstalar) return; const e = pedirInstalar; pedirInstalar = null; e.prompt(); try { await e.userChoice; } catch (x) { /* nada */ } pintaInstalar(); }
function pintaInstalar() { document.querySelectorAll('.boton-instalar').forEach(b => { b.hidden = !pedirInstalar; }); if (vista === 'plan') PINTA.plan(); }
if (!enClaude && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    const mira = () => { if (reg.waiting && navigator.serviceWorker.controller) mostrarActualizacion(reg.waiting); };
    mira();
    reg.addEventListener('updatefound', () => { const n = reg.installing; if (n) n.addEventListener('statechange', () => { if (n.state === 'installed') mira(); }); });
    setInterval(() => reg.update().catch(() => {}), 30 * 60e3);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (actualizando) location.reload(); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
function mostrarActualizacion(sw) {
  const el = $('#actualizacion'); if (!el) return; el.hidden = false; el.textContent = '';
  el.append(h('span', null, 'Hay una versión nueva del Dojo.'), h('button', { class: 'btn chico', onclick: () => { actualizando = true; sw.postMessage('actualizar'); } }, 'Actualizar ahora'));
}

/* ───────────── Rango, puntos y racha en la cabecera ───────────── */
function pintaRango() {
  const rg = N.rangoActual(P.d), r = N.racha(P.d);
  for (const id of ['rango-lateral', 'rango-cabecera']) {
    const el = $('#' + id); if (!el) continue; el.textContent = '';
    el.append(U.emblema(rg.i, id === 'rango-lateral' ? 34 : 28, rg.rango.n),
      h('span', { class: 'rango-texto' }, h('b', { class: 'rango-nombre' }, rg.rango.n), h('small', { class: 'num' }, `${U.miles(P.d.puntos)} puntos`)),
      h('span', { class: 'insignia kihada num', title: 'Días seguidos practicando (5 retos, 5 ejercicios de inglés o 10 min de foco)' }, `${r} ${r === 1 ? 'día' : 'días'}`));
    if (id === 'rango-lateral' && rg.siguiente) el.append(h('div', { class: 'barra kihada', role: 'progressbar', 'aria-label': 'Hacia el rango ' + rg.siguiente.n, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(rg.prop * 100)), title: rg.faltan ? `Faltan ${U.miles(rg.faltan)} puntos para el examen de «${rg.siguiente.n}»` : `Examen de «${rg.siguiente.n}» disponible` }, h('i', { style: `width:${Math.round(rg.prop * 100)}%` })));
  }
}
/* Después de cualquier respuesta: guardar, repintar el rango y avisar si subes, recuperas o bajas de rango */
function trataPuntos(res, ok) {
  U.vibra(ok ? 18 : [40, 50, 40], P.d.ajustes.vibrar);
  P.cambio(); pintaRango(); tic();
  const c = res && res.cambio; if (!c) return;
  const R = N.RANGOS[c.i], sig = N.RANGOS[c.i + 1];
  if (c.tipo === 'sube') U.celebra(c.i, `Examen aprobado. ${R.lema} ${sig ? `El examen de «${sig.n}» se abre con ${U.miles(sig.min)} puntos.` : 'Llegaste al rango más alto del Dojo.'}`, { figura: U.emblema(c.i, 92, R.n), etiqueta: `Nuevo rango · ${c.i + 1} de ${N.RANGOS.length}`, titulo: R.n });
  else if (c.tipo === 'examen') U.celebra(c.i, `Tienes los puntos de «${R.n}». Para subir, aprueba su examen: ${R.examen.preguntas} preguntas de código e inglés, sin ninguna ayuda. Necesitas el ${Math.round(R.examen.nota * 100)} %.`, { figura: U.emblema(c.i, 92, R.n), etiqueta: 'Examen de ascenso disponible', titulo: R.n, accion: { texto: 'Ver el examen', fn: () => ir('examen') } });
  else if (c.tipo === 'recupera') aviso(`Recuperaste el rango «${R.n}».`, 4000);
  else if (c.tipo === 'baja') aviso(`Bajaste a «${R.n}». Con ${U.miles(sig.min - P.d.puntos)} puntos más recuperas «${sig.n}».`, 5500);
}
function chipPuntos(res) {
  if (!res || typeof res.puntos !== 'number') return null;
  const p = res.puntos, combo = res.combo >= 3 ? ` · ${res.combo} seguidos` : '';
  return h('span', { class: 'insignia num ' + (p > 0 ? 'kihada' : p < 0 ? 'mal' : ''), title: 'Puntos de esta respuesta' }, `${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p)} puntos${combo}`);
}
/* Qué vale cada cosa (sale de N.PUNTOS, así nunca se desajusta del cálculo real) */
function tablaPuntos() {
  const X = N.PUNTOS, fila = (t, v, cls) => h('li', null, h('span', null, t), h('b', { class: 'num ' + (cls || '') }, v));
  return h('div', { class: 'tabla-puntos' },
    h('div', null, h('span', { class: 'etiqueta' }, 'Ganas'), h('ul', null,
      fila('Reto de código acertado', `+${X.reto} (hasta +${X.reto + X.comboMax} en racha)`, 'mas'),
      fila('Ejercicio de inglés acertado', `+${X.ingles} (hasta +${X.ingles + X.comboMax})`, 'mas'),
      fila('Frase dicha bien en voz alta', `+${X.habla} (casi bien: +${X.hablaCasi})`, 'mas'),
      fila('Ejercicio del laboratorio, por lenguaje', `+${X.ejercicio}`, 'mas'), fila('Lección de HTML', `+${X.html}`, 'mas'), fila('Cada minuto de foco', `+${X.focoMin}`, 'mas'),
      fila('Meta diaria de retos · de inglés', `+${X.meta} · +${X.metaIngles}`, 'mas'),
      fila('Conversación en inglés', `+${X.conversa} la primera, +${X.conversaOtra} después`, 'mas'),
      fila('Cinturón nuevo · unidad de inglés dominada', `+${X.cinturon} · +${X.unidad}`, 'mas'),
      fila('Ejercicio de habla de programador acertado', `+${X.jerga} (hasta +${X.jerga + X.comboMax})`, 'mas'),
      fila('Examen de ascenso aprobado', `+${X.examen}`, 'mas'))),
    h('div', null, h('span', { class: 'etiqueta' }, 'Pierdes'), h('ul', null,
      fila('Reto de código fallado', `−${-X.retoFallo}`, 'menos'), fila('Ejercicio de inglés o de habla fallado', `−${-X.inglesFallo}`, 'menos'), fila('Frase mal pronunciada', `−${-X.hablaFallo}`, 'menos'),
      fila('Ejercicio del laboratorio que no pasa al comprobar', `−${-X.ejercicioFallo}`, 'menos'), fila('Respuesta no entendida en una conversación', `−${-X.conversaFallo}`, 'menos'),
      fila('Fallo en el repaso del examen', `−${-X.repasoFallo}`, 'menos'), fila('Examen suspendido', '−10 % de los puntos del rango', 'menos')),
      h('p', { class: 'tenue', style: 'font-size:13px' }, `Subir de rango pide dos cosas: llegar a sus puntos y aprobar su examen (código, inglés y habla de programador), sin ayuda. Suspender resta el 10 % de los puntos de ese rango y te deja un repaso obligatorio de lo que fallaste; cuando lo termines y vuelvas a tus puntos, lo repites. La racha: cada acierto seguido suma +1 más, hasta +${X.comboMax}; un fallo la corta. Los puntos nunca bajan de 0. Si bajan del mínimo de tu rango, bajas, y lo recuperas al volver a subir (sin repetir el examen). Equivocarse resta en todo: retos, inglés, habla, ejercicios del laboratorio y conversaciones.`)));
}
function escaleraRangos() {
  const rg = N.rangoActual(P.d);
  return h('ol', { class: 'escalera' }, ...N.RANGOS.map((R, k) => h('li', { class: k === rg.i ? 'actual' : k <= P.d.rangoMax ? 'logrado' : 'futuro', 'aria-current': k === rg.i ? 'step' : null },
    U.emblema(k, 30, R.n), h('span', { class: 'detalle' }, h('b', null, R.n), h('small', { class: 'tenue' }, R.lema),
      R.examen ? h('small', { class: 'requisito' }, `${U.miles(R.min)} puntos + examen: ${R.examen.preguntas} preguntas (temas 1–${R.examen.temas}, inglés 1–${R.examen.unidades}, habla 1–${R.examen.bloques}), ${Math.round(R.examen.nota * 100)} % para aprobar${k <= P.d.rangoMax ? ' · aprobado' : ''}`) : null,
      h('small', { class: 'sabe-rango' }, 'Sabe: ' + R.sabe.join(' · '))),
    h('span', { class: 'num tenue' }, k === rg.i ? 'Tú' : U.miles(R.min)))));
}

/* ───────────── Navegación ───────────── */
const ICONOS = {
  hoy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  retos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  habla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="m9 9-2 2 2 2M15 9l2 2-2 2"/></svg>',
  ingles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.5-5.2A8.5 8.5 0 1 1 21 12z"/><path d="M8 15.5 10.3 8.5h.4l2.3 7M8.8 13.3h3.4M14.8 10h3"/></svg>',
  ruta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/></svg>',
  lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>'
};
const VISTAS = [['hoy', 'Hoy'], ['retos', 'Retos'], ['ingles', 'Inglés'], ['habla', 'Habla'], ['ruta', 'Ruta'], ['lab', 'Laboratorio'], ['plan', 'Plan']];
let vista = 'hoy';
function pintaMenus() {
  for (const id of ['menu-lateral', 'menu-pestanas']) {
    const el = $('#' + id); el.textContent = '';
    for (const [v, n] of VISTAS) el.append(h('a', { href: '#' + v, 'aria-current': v === vista ? 'page' : null, html: ICONOS[v] + `<span>${n === 'Laboratorio' && id === 'menu-pestanas' ? 'Lab' : n}</span>`,
      onclick: e => { if (v === 'lab') lab.modo = 'editar'; if (v === 'ruta') temaAbierto = null; if (v === 'ingles') VI.inicio(); if (v === 'habla') VH.inicio(); if (location.hash === '#' + v) { e.preventDefault(); mostrar(v, true); } } }));
  }
}
function ir(v) { if (location.hash !== '#' + v) location.hash = v; else mostrar(v); }
function mostrar(v, forzar) {
  if (!VISTAS.some(x => x[0] === v) && v !== 'examen') v = 'hoy';
  if (vista === 'examen' && v !== 'examen') VE.salir();   // salir a mitad del examen es abandonarlo
  const cambia = v !== vista || forzar;
  if (vista === 'lab' && v !== 'lab') detenerEjecucion();   // no dejar programas vivos al salir del laboratorio
  if (vista === 'ingles' && v !== 'ingles') { Voz.callar(); Voz.parar(); }
  vista = v; pintaMenus();
  document.querySelectorAll('[data-vista]').forEach(s => { s.hidden = s.dataset.vista !== v; });
  PINTA[v]();
  if (cambia) { window.scrollTo(0, 0); const s = $('#v-' + v); if (s && !U.reduceMovimiento()) { s.classList.remove('aparece'); void s.offsetWidth; s.classList.add('aparece'); } }
}
window.addEventListener('hashchange', () => mostrar(location.hash.slice(1)));
function repintar() { U.aplicaAspecto(P.d.ajustes.aspecto); pintaRango(); pintaBandas(); PINTA[vista](); }

/* ───────────── La espera de Claude y el bloque de foco ───────────── */
let espera = ls.get('espera', null);   // { inicio, retos }
let foco = ls.get('foco', null);       // { inicio, minutos }
if (espera && Date.now() - espera.inicio > 90 * 60e3) { espera = null; ls.set('espera', null); }
const hechosHoy = () => { const x = N.leeDia(P.d); return x.retos + x.ingles; };
function empiezaEspera(adonde = 'retos') {
  if (foco) { aviso('Estás en un bloque de foco: ahora toca no mirar a Claude.'); ir('retos'); return; }
  espera = { inicio: Date.now(), retos: hechosHoy() }; ls.set('espera', espera); pintaBandas();
  if (adonde === 'ingles') VI.practicar(); else ir('retos');
}
function terminaEspera(convertida) {
  if (!espera) return;
  const seg = Math.round((Date.now() - espera.inicio) / 1000), hechos = hechosHoy() - espera.retos;
  const d = N.dia(P.d); if (convertida) { d.esperas++; d.segEspera += seg; } else d.perdidas++;
  P.cambio(); espera = null; ls.set('espera', null); pintaBandas();
  if (convertida) aviso(hechos > 0 ? `Espera aprovechada: ${mmss(seg)} y ${hechos} ${hechos === 1 ? 'reto' : 'retos'}. Vuelve con Claude.` : 'Anotado. La próxima espera, haz al menos un reto.');
  else aviso('Anotado, sin castigo. Lo importante es darse cuenta. A la próxima.');
  if (vista === 'hoy') PINTA.hoy();
}
function empiezaFoco() {
  if (espera) terminaEspera(true);
  foco = { inicio: Date.now(), minutos: P.d.ajustes.foco }; ls.set('foco', foco); pintaBandas();
  if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {});
  abrirTema(temaActual().id);
}
function terminaFoco(completo) {
  if (!foco) return;
  const min = completo ? foco.minutos : Math.min(foco.minutos, Math.floor((Date.now() - foco.inicio) / 60e3));
  N.dia(P.d).foco += min; const pf = N.sumaPuntos(P.d, min * N.PUNTOS.focoMin); foco = null; ls.set('foco', null); trataPuntos(pf, true); pintaBandas();
  aviso(min > 0 ? `Bloque de foco: ${min} min sumados. Ya puedes mirar qué hizo Claude.` : 'Bloque cancelado.');
  if (vista === 'hoy') PINTA.hoy();
}
function pintaBandas() {
  const el = $('#bandas'); el.textContent = '';
  if (foco) {
    el.append(h('div', { class: 'banda foco', role: 'status' },
      h('span', { class: 'reloj', id: 'reloj-foco' }, '--:--'),
      h('span', { class: 'texto' }, h('b', null, 'Bloque de foco'), ' · sin mirar a Claude.'),
      h('button', { class: 'btn chico', onclick: () => terminaFoco(false) }, 'Terminar')));
  } else if (espera) {
    el.append(h('div', { class: 'banda espera', role: 'status' },
      h('span', { class: 'pulso', 'aria-hidden': 'true' }), h('span', { class: 'reloj', id: 'reloj-espera' }, '00:00'),
      h('span', { class: 'texto', id: 'texto-espera' }, 'Claude trabaja. Tú, a practicar.'),
      h('button', { class: 'btn chico lleno', onclick: () => terminaEspera(true) }, 'Claude ya respondió'),
      h('button', { class: 'btn chico', onclick: () => terminaEspera(false) }, 'Me distraje')));
  }
  tic();
}
function tic() {
  if (espera) {
    const r = $('#reloj-espera'); if (r) r.textContent = mmss((Date.now() - espera.inicio) / 1000);
    const t = $('#texto-espera'); const n = hechosHoy() - espera.retos;
    if (t) t.textContent = n > 0 ? `Claude trabaja · llevas ${n} ${n === 1 ? 'ejercicio' : 'ejercicios'} en esta espera` : 'Claude trabaja. Tú, a practicar.';
  }
  if (foco) {
    const quedan = foco.minutos * 60 - (Date.now() - foco.inicio) / 1000; const r = $('#reloj-foco');
    if (quedan <= 0) { terminaFoco(true); return; }   // también si terminó con la app cerrada: los minutos cuentan
    if (r) r.textContent = mmss(quedan);
  }
}
setInterval(tic, 1000);

/* ───────────── El tutor: Claude dentro de la página, o la pregunta lista para copiar ───────────── */
let sample = null, tutorApagado = false;
if (enClaude) window.claude.use('sample').then(s => { sample = s; if (vista !== 'hoy') PINTA[vista](); }).catch(() => {});
const sampleActivo = () => (tutorApagado ? null : sample);
const REGLAS_TUTOR = 'Eres un profesor de programación paciente. Hablas en español sencillo, de tú, a alguien que está empezando. Frases cortas, sin saludos ni felicitaciones, sin formato Markdown (nada de asteriscos ni almohadillas). Solo cosas básicas de un primer curso.';
function botonTutor(texto, hacerPrompt) {
  const caja = h('div', { class: 'tutor', hidden: true, 'aria-live': 'polite' });
  if (!sample || tutorApagado) {
    const b = h('button', { class: 'btn chico', onclick: async () => {
      const ok = await U.copia(hacerPrompt());
      if (ok) aviso('Pregunta copiada. Pégala en Claude y te lo explica.'); else { caja.hidden = false; caja.textContent = hacerPrompt(); aviso('Selecciona el texto y cópialo para preguntárselo a Claude.'); }
    } }, 'Copiar la pregunta para Claude');
    return h('div', { class: 'pila-tutor' }, h('div', { class: 'fila' }, b), caja);
  }
  const btn = h('button', { class: 'btn chico', onclick: async () => {
    btn.disabled = true; caja.hidden = false; caja.textContent = 'Pensando…';
    try {
      const { text } = await sample(hacerPrompt(), { modelTier: 'quick', onText: ({ text }) => { caja.textContent = text; } });
      caja.textContent = text;
    } catch (e) {
      if (e && ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled'].includes(e.code)) { tutorApagado = true; caja.textContent = 'El tutor no está disponible aquí. Todo lo demás funciona igual.'; btn.remove(); return; }
      caja.textContent = e && e.code === 'rate_limited' ? 'Has usado mucho a Claude ahora mismo. Prueba en un rato.' : (e && e.text) || 'No se pudo preguntar. Prueba otra vez.';
    } finally { btn.disabled = false; }
  } }, texto);
  return h('div', { class: 'pila-tutor' }, h('div', { class: 'fila' }, btn, h('span', { class: 'tenue', style: 'font-size:12.5px' }, 'Usa tu cuenta de Claude')), caja);
}

/* ───────────── HOY ───────────── */
const PINTA = {};
let retoDirigido = null;
function accionPaso(p) {
  if (p.accion === 'retos') { nuevoReto(); ir('retos'); }
  else if (p.accion === 'repaso') { P.d.ajustes.tema = 'repaso'; P.cambio(); nuevoReto(); ir('retos'); }
  else if (p.accion === 'ejercicio') { const t = temaActual(); const ej = t.ejercicios.find(e => !N.ejercicioHecho(P.d, e.id)) || t.ejercicios[0]; abrirLab({ ejercicio: ej.id }); }
  else if (p.accion === 'ingles') VI.practicar();
  else if (p.accion === 'examen') { if (N.estadoExamen(P.d) && N.estadoExamen(P.d).repaso) VE.empiezaRepaso(); else ir('examen'); }
  else if (p.accion === 'foco') empiezaFoco();
  else if (p.accion === 'tema') abrirTema(temaActual().id);
  else abrirLab({});
}
function tarjetaBienvenida() {
  const aj = P.d.ajustes;
  const chips = (clave, opciones) => h('div', { class: 'chips', role: 'group' }, ...opciones.map(([v, n]) => h('button', { class: 'chip', 'aria-pressed': String(aj[clave] === v), onclick: () => { aj[clave] = v; P.cambio(); PINTA.hoy(); } }, n)));
  return h('section', { class: 'tarjeta bienvenida', 'aria-labelledby': 'bienvenida-t' },
    h('span', { class: 'etiqueta' }, 'Bienvenido al Dojo'),
    h('h1', { id: 'bienvenida-t' }, 'Aprende a programar en los ratos muertos'),
    h('ol', { class: 'pasos' },
      h('li', null, h('b', null, 'En cada espera de Claude, '), 'pulsa «Sí · empezar retos» y responde retos de 30 segundos hasta que te conteste.'),
      h('li', null, h('b', null, 'Una vez al día, '), 'haz un bloque de foco: lee la lección y escribe el ejercicio en el laboratorio.'),
      h('li', null, h('b', null, 'Cada acierto suma puntos y cada fallo resta. '), 'Con los puntos se abre el examen de cada rango; apruébalo sin ayuda y subes. Son diez rangos, de Aprendiz a Ingeniero de élite. Y cada tema que dominas te da un cinturón.'),
      h('li', null, h('b', null, 'Y también inglés: '), 'el que usan los programadores, desde cero, para entenderlo y hablarlo.')),
    h('div', { class: 'ajuste' }, h('span', { class: 'etiqueta' }, 'Qué quieres practicar'), chips('lang', [['mezcla', 'Los tres'], ['ps', 'PSeInt'], ['py', 'Python'], ['cpp', 'C++']])),
    h('div', { class: 'ajuste' }, h('span', { class: 'etiqueta' }, 'Retos al día'), chips('meta', [[10, '10'], [20, '20'], [30, '30']])),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario grande', onclick: () => { P.d.bienvenida = true; P.cambio(); PINTA.hoy(); aviso('Listo. Ahora, cada vez que le escribas a Claude, vuelve aquí.'); } }, 'Empezar')));
}
PINTA.hoy = function () {
  const el = $('#v-hoy'); el.textContent = '';
  if (!P.d.bienvenida) { el.append(h('div', { class: 'columna' }, tarjetaBienvenida())); return; }
  const d = N.leeDia(P.d), meta = P.d.ajustes.meta, metaI = P.d.ajustes.metaIngles, t = temaActual(), et = est(t.id), i = dominados();
  const portada = h('div', { class: 'portada' },
    h('span', { class: 'kanji', 'aria-hidden': 'true' }, '道'),
    h('span', { class: 'etiqueta', style: 'color:inherit;opacity:.85' }, espera ? 'Claude está trabajando' : foco ? 'Bloque de foco en marcha' : 'Tu regla'),
    h('h1', null, espera ? 'Sigue con los retos hasta que responda' : foco ? 'Ahora toca escribir código' : '¿Le acabas de escribir a Claude?'),
    h('p', null, espera ? 'Cuando Claude termine, toca «Claude ya respondió» arriba y vuelve con él.' : foco ? 'Abre la lección del tema actual y resuelve su ejercicio en el laboratorio.' : 'Mientras trabaja, haz retos de 30 segundos aquí en vez de abrir TikTok. Cuando responda, vuelves con él.'),
    espera ? h('button', { class: 'btn primario grande', onclick: () => ir('retos') }, 'Seguir con los retos')
      : foco ? h('button', { class: 'btn primario grande', onclick: () => abrirTema(t.id) }, 'Abrir la lección')
      : h('div', { class: 'fila' }, h('button', { class: 'btn primario grande', onclick: () => empiezaEspera('retos') }, 'Sí · empezar retos'), h('button', { class: 'btn secundario', onclick: () => empiezaEspera('ingles') }, 'O practicar inglés')));
  const paso = N.siguientePaso(P.d, D, { foco: !!foco, espera: !!espera }, I);
  const siguiente = espera ? null : h('section', { class: 'tarjeta siguiente', 'aria-labelledby': 'sig-t' },
    h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, 'Siguiente paso'), h('span', { class: 'insignia ai' }, `Tema ${D.temas.indexOf(t) + 1}: ${t.titulo}`)),
    h('h2', { id: 'sig-t' }, paso.titulo), h('p', { class: 'tenue' }, paso.texto),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => accionPaso(paso) }, paso.boton)));
  const mins = Math.round(d.segEspera / 60);
  const metrica = (etq, valor, de, barra, pct, nota) => h('div', { class: 'metrica' }, h('span', { class: 'etiqueta' }, etq), h('b', { class: 'num' }, String(valor), h('small', null, de)), h('div', { class: 'barra ' + barra, role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(pct)), 'aria-label': etq }, h('i', { style: `width:${Math.min(100, pct)}%` })), h('small', null, nota));
  const metricas = h('div', { class: 'metricas' },
    metrica('Retos hoy', d.retos, ` / ${meta}`, '', d.retos / meta * 100, d.retos ? `${Math.round(d.aciertos / d.retos * 100)} % de aciertos` : 'Empieza por uno'),
    metrica('Inglés hoy', d.ingles, ` / ${metaI}`, '', d.ingles / metaI * 100, d.ingles ? `${Math.round(d.inglesOk / d.ingles * 100)} % bien` : 'Escuchar y hablar'),
    metrica('Foco hoy', d.foco, ` / ${P.d.ajustes.foco} min`, 'kihada', d.foco / P.d.ajustes.foco * 100, 'Escribir código sin Claude'),
    metrica('Esperas', d.esperas, d.perdidas ? ` · ${d.perdidas} a TikTok` : ' aprovechadas', 'bien', d.esperas + d.perdidas ? d.esperas / (d.esperas + d.perdidas) * 100 : 0, mins ? `${mins} min convertidos en práctica` : 'Cada espera cuenta'));
  const rg = N.rangoActual(P.d), ex = rg.examen;
  const rangoT = h('section', { class: 'tarjeta rango-tarjeta', 'aria-labelledby': 'rango-t' },
    h('div', { class: 'cabeza-rango' }, U.emblema(rg.i, 58, rg.rango.n),
      h('div', { class: 'pila', style: 'gap:2px' }, h('span', { class: 'etiqueta' }, `Tu rango · ${rg.n} de ${N.RANGOS.length}`), h('h2', { id: 'rango-t' }, rg.rango.n), h('span', { class: 'tenue' }, rg.rango.lema))),
    h('div', { class: 'entre' }, h('b', { class: 'num puntos-grandes' }, `${U.miles(P.d.puntos)} puntos`), h('span', { class: 'insignia num ' + (d.puntos > 0 ? 'kihada' : d.puntos < 0 ? 'mal' : '') }, `Hoy ${d.puntos > 0 ? '+' : d.puntos < 0 ? '−' : ''}${U.miles(Math.abs(d.puntos))}`)),
    rg.siguiente ? h('div', { class: 'pila', style: 'gap:6px' }, h('div', { class: 'barra kihada', role: 'progressbar', 'aria-label': 'Hacia el examen de ' + rg.siguiente.n, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(rg.prop * 100)) }, h('i', { style: `width:${Math.round(rg.prop * 100)}%` })),
      h('small', { class: 'tenue' }, rg.i < P.d.rangoMax ? `Bajaste de rango: con ${U.miles(rg.faltan)} puntos más recuperas «${rg.siguiente.n}» (sin repetir el examen).`
        : rg.faltan ? `Faltan ${U.miles(rg.faltan)} puntos para el examen de «${rg.siguiente.n}». Acertar suma; fallar resta.`
        : ex && ex.espera ? `Suspendiste el examen de «${rg.siguiente.n}». Practica ${U.miles(ex.espera)} puntos más para repetirlo.`
        : `Tienes los puntos de «${rg.siguiente.n}»: aprueba su examen para subir.`),
      ex && ex.disponible ? h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => ir('examen') }, `Hacer el examen de «${ex.nombre}»`)) : null)
      : h('p', null, 'Estás en la cima. Sigue practicando: si los puntos bajan de 30.000, bajas de rango.'),
    h('details', { class: 'desplegable' }, h('summary', null, 'Los 10 rangos y cómo se ganan los puntos'), escaleraRangos(), tablaPuntos()));
  const rango = h('section', { class: 'tarjeta' },
    h('div', { class: 'entre' }, h('div', { class: 'fila' }, cinturon(i), h('h2', null, 'Cinturón: ' + CINTURONES[i].n)), h('span', { class: 'insignia num' }, `${i} de ${D.temas.length} temas`)),
    i >= 10 ? h('p', null, 'Dominaste los 10 temas. Ya sabes lo básico de los tres lenguajes: toca hacer un proyecto pequeño tuyo.')
      : h('p', { class: 'tenue' }, `Para el siguiente cinturón domina «${t.titulo}»: acierta 8 de los últimos 10 retos del tema y resuelve uno de sus ejercicios en el laboratorio.`),
    i < 10 ? h('div', { class: 'fila', style: 'gap:14px' },
      h('div', { style: 'flex:1 1 200px;display:grid;gap:6px' }, h('small', { class: 'tenue' }, et.n ? `Retos del tema: ${Math.round(et.prop * 100)} % de los últimos ${et.n}` : 'Aún no hay retos de este tema'), h('div', { class: 'barra' }, h('i', { style: `width:${Math.round(et.prop * 100)}%` }))),
      h('span', { class: 'insignia ' + (et.ej ? 'bien' : '') }, et.ej ? 'Ejercicio resuelto' : 'Falta un ejercicio'),
      h('button', { class: 'btn chico', onclick: () => abrirTema(t.id) }, 'Ver la lección')) : null);
  // Lenguajes y puntos débiles
  const pl = P.d.porLang, hayDatos = LANGS.some(l => pl[l].retos > 0);
  const lenguajes = h('section', { class: 'tarjeta' }, h('h2', null, 'Tus lenguajes'),
    hayDatos ? h('div', { class: 'lenguajes' }, ...LANGS.map(l => { const x = pl[l], p = x.retos ? x.aciertos / x.retos : 0; return h('div', { class: 'lenguaje' }, h('div', { class: 'entre' }, h('b', null, NL[l]), h('span', { class: 'tenue num' }, x.retos ? `${Math.round(p * 100)} % · ${x.retos} retos` : 'sin retos')), h('div', { class: 'barra' + (p >= 0.8 ? ' bien' : p < 0.5 && x.retos ? ' mal' : '') }, h('i', { style: `width:${Math.round(p * 100)}%` }))); }))
      : h('p', { class: 'tenue' }, 'Aquí verás qué tal vas en PSeInt, Python y C++ en cuanto respondas unos retos.'));
  const deb = N.debiles(P.d, D);
  const debiles = h('section', { class: 'tarjeta' }, h('h2', null, 'Tus puntos débiles'),
    deb.length ? h('ul', { class: 'debiles' }, ...deb.map(x => h('li', null, h('div', null, h('b', null, x.titulo), h('small', { class: 'tenue' }, `${D.temas.find(t2 => t2.id === x.tema).titulo} · ${Math.round(x.prop * 100)} % de aciertos · fallas más en ${NL[x.peorLang]}`)), h('button', { class: 'btn chico', onclick: () => { retoDirigido = { tpl: x.tpl, lang: x.peorLang }; nuevoReto(); ir('retos'); } }, 'Practicar'))))
      : h('p', { class: 'tenue' }, 'Cuando falles el mismo tipo de reto varias veces, aparecerá aquí para que lo practiques a propósito.'));
  const focoT = foco ? null : h('section', { class: 'tarjeta' },
    h('div', { class: 'entre' }, h('h2', null, `Bloque de foco · ${P.d.ajustes.foco} min`), h('span', { class: 'insignia kihada' }, 'Una vez al día')),
    h('p', { class: 'tenue' }, 'Las esperas sirven para repasar; lo nuevo se aprende escribiendo código con calma. Antes de empezar, dale a Claude una tarea grande y entera, para que trabaje solo todo el bloque.'),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: empiezaFoco }, 'Empezar el bloque'), h('button', { class: 'btn plano', onclick: () => ir('plan') }, 'Por qué funciona')));
  const sem = N.semana(P.d), tope = Math.max(meta, ...sem.map(v => v.retos)), letras = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const barras = h('div', { class: 'semana', role: 'img', 'aria-label': 'Retos de los últimos 7 días: ' + sem.map(v => v.retos).join(', ') },
    ...sem.map((v, j) => h('div', { class: 'dia' + (j === 6 ? ' hoy' : ''), title: `${v.retos} retos` }, h('span', { class: v.retos >= meta ? 'lleno' : '', style: `height:${Math.max(3, v.retos / tope * 100)}%` }), letras[new Date(v.k + 'T12:00').getDay()])));
  const tot = N.totales(P.d), r = N.racha(P.d);
  const semana = h('section', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', null, 'Tu semana'), h('span', { class: 'tenue', style: 'font-size:13px' }, `Racha: ${r} ${r === 1 ? 'día' : 'días'} (5 retos, 5 de inglés o 10 min de foco)`)),
    tot.retos ? barras : h('p', { class: 'tenue' }, 'Aún no hay retos. Las barras de cada día aparecerán aquí.'),
    tot.retos || tot.ingles ? h('p', { class: 'tenue num', style: 'font-size:13px' }, `En total: ${tot.retos} retos${tot.retos ? ` (${Math.round(tot.aciertos / tot.retos * 100)} % bien)` : ''}, ${tot.ingles} ejercicios de inglés, ${tot.foco} min de foco y ${Math.round(tot.segEspera / 60)} min de esperas convertidas en práctica, en ${tot.dias} ${tot.dias === 1 ? 'día' : 'días'}.`) : null);
  const u = N.unidadActual(P.d, I), eu = N.estadoUnidad(P.d, I, u.id), pendI = N.pendientesIngles(P.d, I).length;
  const inglesT = h('section', { class: 'tarjeta' },
    h('div', { class: 'entre' }, h('h2', null, 'Inglés para programar'), h('span', { class: 'insignia ai' }, VI.NIVEL[u.nivel])),
    h('p', { class: 'tenue' }, `Unidad ${u.n} de ${I.unidades.length}: «${u.titulo}». ${u.tema}.`),
    h('div', { class: 'pila', style: 'gap:6px' }, h('small', { class: 'tenue' }, eu.n ? `${Math.round(eu.prop * 100)} % de los últimos ${eu.n} ejercicios · ${eu.conversa ? 'conversación hecha' : 'falta la conversación'}` : 'Empieza por las palabras de la unidad'), h('div', { class: 'barra' }, h('i', { style: `width:${Math.round(eu.prop * 100)}%` }))),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => VI.practicar() }, 'Practicar'), h('button', { class: 'btn', onclick: () => VI.conversar(u.id) }, 'Conversar'),
      pendI ? h('button', { class: 'btn plano', onclick: () => VI.repasar() }, `Repasar (${pendI})`) : null));
  const b = N.bloqueActual(P.d, J), eb = N.estadoBloque(P.d, J, b.id), pendJ = N.pendientesJerga(P.d, J).length;
  const hablaT = h('section', { class: 'tarjeta' },
    h('div', { class: 'entre' }, h('h2', null, 'Habla de programador'), h('span', { class: 'insignia ai' }, `Bloque ${b.n} de ${J.bloques.length}`)),
    h('p', { class: 'tenue' }, `«${b.titulo}»: ${b.tema}. Términos y forma profesional, en español y en inglés.`),
    h('div', { class: 'pila', style: 'gap:6px' }, h('small', { class: 'tenue' }, eb.n ? `${Math.round(eb.prop * 100)} % de los últimos ${eb.n}` : 'Empieza por los términos'), h('div', { class: 'barra' }, h('i', { style: `width:${Math.round(eb.prop * 100)}%` }))),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => VH.practicar() }, 'Practicar'), pendJ ? h('button', { class: 'btn plano', onclick: () => ir('habla') }, `Repasos (${pendJ})`) : null));
  el.append(h('div', { class: 'columna' }, portada, siguiente, metricas, rangoT, h('div', { class: 'dos-col' }, inglesT, hablaT), rango, h('div', { class: 'dos-col' }, lenguajes, debiles), focoT, semana));
};

/* ───────────── RETOS ───────────── */
let retoPintado = null, reto = null, respondido = false, elegida = null, armado = [], resultadoOrden = null, ultimaPlantilla = null, ultimoRes = null;
const colaSesion = [];
const azar = arr => arr[Math.floor(Math.random() * arr.length)];
const semilla = () => Math.floor(Math.random() * 2147483647);
function tipoAlAzar() { const w = [['salida', 35], ['hueco', 20], ['ordenar', 15], ['error', 15], ['traducir', 15]]; let x = Math.random() * 100; for (const [t, p] of w) { if ((x -= p) < 0) return t; } return 'salida'; }
function sorteo(items, peso) { const ps = items.map(peso), tot = ps.reduce((a, b) => a + b, 0); let x = Math.random() * tot; for (let k = 0; k < items.length; k++) { if ((x -= ps[k]) < 0) return items[k]; } return items[items.length - 1]; }
function elegirSpec() {
  const aj = P.d.ajustes, langsOk = aj.lang === 'mezcla' ? LANGS : [aj.lang];
  colaSesion.forEach(x => { x.tras++; });
  if (retoDirigido) { const r = retoDirigido; retoDirigido = null; return { tpl: r.tpl, lang: r.lang, tipo: tipoAlAzar(), seed: semilla(), marca: 'Práctica dirigida' }; }
  const k = colaSesion.findIndex(x => x.tras >= 3);
  if (k >= 0 && Math.random() < 0.6) { const x = colaSesion.splice(k, 1)[0]; return { tpl: x.tpl, lang: x.lang, tipo: x.tipo, seed: x.seed, marca: 'Otra vez' }; }
  const pend = N.pendientes(P.d, D);
  if (aj.tema === 'repaso') {
    if (pend.length) { const x = pend[0]; return { tpl: x.tpl, lang: x.lang, tipo: tipoAlAzar(), seed: semilla(), marca: 'Repaso' }; }
    aj.tema = 'auto'; P.cambio(); aviso('No quedan repasos para hoy. Seguimos con tu tema actual.');
  } else if (pend.length && Math.random() < 0.35) { const x = azar(pend.slice(0, 5)); return { tpl: x.tpl, lang: x.lang, tipo: tipoAlAzar(), seed: semilla(), marca: 'Repaso' }; }
  const actual = D.temas.indexOf(temaActual());
  const temaId = aj.tema === 'todo' ? D.temas[Math.floor(Math.random() * (actual + 1))].id
    : aj.tema !== 'auto' && aj.tema !== 'repaso' ? aj.tema
    : actual > 0 && Math.random() < 0.25 ? D.temas[Math.floor(Math.random() * actual)].id : D.temas[actual].id;
  let cands = D.plantillas.filter(t => t.tema === temaId && D.langsDe(t).some(l => langsOk.includes(l)));
  if (!cands.length) cands = D.plantillas.filter(t => t.tema === temaId);
  const cajaMin = t => Math.min(...D.langsDe(t).filter(l => langsOk.includes(l)).map(l => (P.d.tarjetas[t.id + '|' + l] || { caja: -1 }).caja), 9);
  const t = sorteo(cands, x => (x.id === ultimaPlantilla && cands.length > 1 ? 0.15 : cajaMin(x) < 0 ? 4 : 1 + (5 - cajaMin(x)) * 0.6));
  ultimaPlantilla = t.id;
  const ok = D.langsDe(t).filter(l => langsOk.includes(l));
  return { tpl: t.id, lang: azar(ok.length ? ok : D.langsDe(t)), tipo: (P.d.temas[temaId] || { intentos: 0 }).intentos < 3 ? 'salida' : tipoAlAzar(), seed: semilla() };
}
/* Genera un reto sin tocar el que está en pantalla */
function generaReto() {
  for (let intento = 0; intento < 4; intento++) {
    const spec = elegirSpec();
    let r = null; try { r = D.generar(spec) || D.generar(Object.assign({}, spec, { tipo: 'salida' })); } catch (e) { try { r = D.generar(Object.assign({}, spec, { tipo: 'salida' })); } catch (x) { r = null; } }
    if (r) { r.marca = spec.marca || ''; return r; }
  }
  return null;
}
function nuevoReto() {
  retoListo = null;
  const r = generaReto(); if (!r) return;
  reto = r; respondido = false; elegida = null; armado = []; resultadoOrden = null;
}
/* El siguiente reto se prepara en segundo plano mientras respondes el actual: «Siguiente» sale al instante */
let retoListo = null;
const claveAjustes = () => P.d.ajustes.lang + '|' + P.d.ajustes.tema;
function preparaSiguiente() {
  if (retoListo || retoDirigido) return;
  const hazlo = () => { if (retoListo || retoDirigido) return; const r = generaReto(); if (r) retoListo = { reto: r, clave: claveAjustes() }; };
  if (window.requestIdleCallback) requestIdleCallback(hazlo, { timeout: 1500 }); else setTimeout(hazlo, 200);
}
function siguienteReto() {
  if (retoListo && retoListo.clave === claveAjustes() && !retoDirigido) { reto = retoListo.reto; respondido = false; elegida = null; armado = []; resultadoOrden = null; }
  else nuevoReto();
  retoListo = null; PINTA.retos();
}
function registra(ok) {
  const res = N.registraReto(P.d, D, { tema: reto.tema, tpl: reto.spec.tpl, lang: reto.lang, ok });
  if (!ok) colaSesion.push({ tpl: reto.spec.tpl, lang: reto.lang, tipo: reto.tipo, seed: (reto.spec.seed + 104729) % 2147483647, tras: 0 });
  ultimoRes = res; trataPuntos(res, ok);
  if (res.cinturon) U.celebra(res.cinturon, `Dominaste «${D.temas.find(t => t.id === reto.tema).titulo}». Siguiente tema: «${temaActual().titulo}».`);
  else if (res.metaCumplida) aviso(`Meta de hoy cumplida: ${P.d.ajustes.meta} retos. +${N.PUNTOS.meta} puntos.`);
}
function responde(k) { if (respondido || !reto) return; respondido = true; elegida = k; registra(k === reto.correcta); PINTA.retos(); }
const letraOpcion = k => h('span', { class: 'letra', 'aria-hidden': 'true' }, String(k + 1));
function opcionesTexto(textos, vacio) {
  const g = h('div', { class: 'opciones' + (textos.some(t => t.length > 28 || t.split('\n').length > 3) ? ' una' : ''), role: 'group', 'aria-label': 'Opciones' });
  textos.forEach((tx, k) => {
    const b = h('button', { class: 'opcion', disabled: respondido || null, onclick: () => responde(k), 'aria-label': `Opción ${k + 1}: ${tx === '' && vacio ? vacio : tx}` }, letraOpcion(k), tx === '' && vacio ? h('pre', { class: 'tenue', style: 'font-family:var(--f-texto);font-style:italic' }, vacio) : h('pre', null, tx));
    if (respondido) { if (k === reto.correcta) b.classList.add('correcta'); else if (k === elegida) b.classList.add('fallada'); }
    g.append(b);
  });
  return g;
}
function chipsEntradas() {
  if (!reto.entradas.length) return null;
  return h('p', { class: 'fila' }, h('span', { class: 'tenue' }, 'El usuario escribe:'), ...reto.entradas.map(e => h('span', { class: 'insignia ai mono' }, e)));
}
function cuerpoReto() {
  const r = reto, l = r.lang, partes = [];
  if (r.tipo === 'salida') partes.push(h('h2', null, '¿Qué muestra este programa?'), chipsEntradas(), bloqueCodigo(r.codigo, l), opcionesTexto(r.opciones, '(no muestra nada)'));
  else if (r.tipo === 'hueco') partes.push(h('h2', null, '¿Qué va en el hueco?'), h('p', { class: 'tenue' }, 'Para que el programa muestre exactamente esto:'), salidaBloque(r.salida), chipsEntradas(), bloqueCodigo(r.codigo, l, { hueco: r.hueco, relleno: respondido ? r.opciones[elegida] : null }), opcionesTexto(r.opciones));
  else if (r.tipo === 'ordenar') {
    const quedan = r.piezas.map((t, k) => k).filter(k => !armado.includes(k));
    const zona = h('div', { class: 'armado', role: 'group', 'aria-label': 'Tu programa' }, ...armado.map((k, j) => h('button', { class: 'pieza', disabled: respondido || null, 'aria-label': `Quitar la línea ${r.piezas[k].trim()}`, onclick: () => { armado.splice(j, 1); PINTA.retos(); } }, r.piezas[k])));
    partes.push(h('h2', null, 'Ordena las líneas'), h('p', { class: 'tenue' }, 'Arma el programa para que muestre exactamente esto:'), salidaBloque(r.salida), chipsEntradas(), h('span', { class: 'etiqueta' }, 'Tu programa'), zona);
    if (!respondido) partes.push(quedan.length ? h('span', { class: 'etiqueta' }, 'Líneas sueltas') : null,
      h('div', { class: 'piezas' }, ...quedan.map(k => h('button', { class: 'pieza', 'aria-label': `Añadir la línea ${r.piezas[k].trim()}`, onclick: () => { armado.push(k); PINTA.retos(); } }, r.piezas[k]))),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', disabled: quedan.length ? true : null, onclick: () => {
        resultadoOrden = D.compruebaOrden(r, armado.map(k => r.piezas[k])); respondido = true; elegida = resultadoOrden.ok ? 0 : 1; r.correcta = 0; registra(resultadoOrden.ok); PINTA.retos();
      } }, 'Comprobar'), armado.length ? h('button', { class: 'btn', onclick: () => { armado = []; PINTA.retos(); } }, 'Empezar de nuevo') : null));
  } else if (r.tipo === 'error') {
    partes.push(h('h2', null, 'Encuentra el error'), h('p', { class: 'tenue' }, 'Este programa tiene un error. Toca la línea donde está.'), chipsEntradas());
    const b = bloqueCodigo(r.codigoMal, l, respondido ? {} : { tocar: i => { r.correcta = r.lineaMal; responde(i); } });
    if (respondido) { const lis = b.querySelectorAll('li'); lis[r.lineaMal].classList.add('buena'); if (elegida !== r.lineaMal && lis[elegida]) lis[elegida].classList.add('marcada'); }
    partes.push(b);
  } else if (r.tipo === 'traducir') {
    partes.push(h('h2', null, `¿Cuál es este programa en ${NL[l]}?`), h('span', { class: 'etiqueta' }, 'En ' + NL[r.origen]), bloqueCodigo(r.codigoOrigen, r.origen), chipsEntradas());
    const g = h('div', { class: 'opciones una', role: 'group', 'aria-label': 'Opciones' });
    r.opciones.forEach((cod, k) => {
      const b = h('button', { class: 'opcion', disabled: respondido || null, onclick: () => responde(k), 'aria-label': `Opción ${k + 1}` }, letraOpcion(k), bloqueCodigo(cod, l));
      if (respondido) { if (k === r.correcta) b.classList.add('correcta'); else if (k === elegida) b.classList.add('fallada'); }
      g.append(b);
    });
    partes.push(g);
  }
  return partes;
}
function respuestaReto() {
  const r = reto, ok = elegida === r.correcta;
  const caja = h('div', { class: 'respuesta ' + (ok ? 'si' : 'no'), role: 'status' }, h('div', { class: 'entre' }, h('h3', null, ok ? 'Correcto' : r.tipo === 'ordenar' ? 'Ese orden no da lo mismo' : 'No era esa'), chipPuntos(ultimoRes)));
  if (r.tipo === 'error') caja.append(h('p', null, `El error está en la línea ${r.lineaMal + 1}. ${r.explicaError}`), h('p', { class: 'tenue' }, `El Dojo lo avisaría así: «${r.mensajeMotor}»`));
  else if (r.tipo === 'ordenar') {
    if (!ok) caja.append(h('p', null, resultadoOrden.error ? `Con tu orden el programa da un error en la línea ${resultadoOrden.error.linea}: ${resultadoOrden.error.message}` : 'Con tu orden el programa muestra:'), resultadoOrden.error ? '' : salidaBloque(resultadoOrden.salida), h('span', { class: 'etiqueta' }, 'Un orden que funciona'), bloqueCodigo(r.codigo, r.lang));
    caja.append(h('p', null, r.explica));
  } else if (r.tipo === 'traducir') {
    if (!ok && r.motivos[elegida]) caja.append(h('p', { style: 'white-space:pre-wrap' }, 'La que elegiste: ' + r.motivos[elegida]));
    caja.append(h('p', null, r.explica));
  } else {
    caja.append(h('p', null, r.explica));
    if (r.tipo === 'hueco') caja.append(h('ul', { class: 'lista' }, ...r.opciones.map((op, k) => h('li', null, h('span', { class: 'mono' }, `«${op}»`), r.consecuencias[k].error ? ` da un error: ${r.consecuencias[k].error}` : k === r.correcta ? ' muestra lo pedido.' : ` mostraría: ${r.consecuencias[k].salida.split('\n').join(' · ') || '(nada)'}`))));
    else if (!ok) caja.append(h('span', { class: 'etiqueta' }, 'Lo que muestra de verdad'), salidaBloque(r.salida));
  }
  const et = est(r.tema);
  if (et.retos && !et.ej) caja.append(h('p', { class: 'insignia kihada', style: 'white-space:normal' }, `Ya dominas los retos de «${D.temas.find(t => t.id === r.tema).titulo}». Para subir de cinturón falta uno de sus ejercicios de escribir código.`));
  const codigo = r.tipo === 'error' ? r.codigoMal : r.codigo;
  caja.append(h('div', { class: 'fila' },
    h('button', { class: 'btn primario', id: 'siguiente', onclick: siguienteReto }, 'Siguiente reto'),
    r.tipo !== 'error' ? h('button', { class: 'btn', onclick: () => abrirLab({ lang: r.lang, codigo: D.completo(codigo, r.lang), entradas: r.entradas, traza: true }) }, 'Ver paso a paso') : null,
    h('button', { class: 'btn plano', onclick: () => abrirLab({ lang: r.lang, codigo: D.completo(codigo, r.lang), entradas: r.entradas }) }, 'Abrir en el laboratorio')));
  caja.append(botonTutor('Explícamelo mejor', () => `${REGLAS_TUTOR}\n\nExplica en 3 a 5 frases cortas ${r.tipo === 'error' ? 'dónde está el error de este programa y por qué es un error' : 'por qué este programa muestra exactamente lo que muestra'}. Ve paso a paso con los valores reales.\n\nLenguaje: ${NL[r.lang]}\nPrograma:\n${codigo}\n${r.entradas.length ? '\nEl usuario escribe: ' + r.entradas.join(', ') + '\n' : ''}\n${r.tipo === 'error' ? 'El error está en la línea ' + (r.lineaMal + 1) + ': ' + r.explicaError : 'Lo que muestra de verdad:\n' + (r.salida || '(nada)')}\n\nEl alumno ${ok ? 'acertó' : 'se equivocó'}.`));
  return caja;
}
PINTA.retos = function () {
  const el = $('#v-retos'); el.textContent = '';
  if (!reto) nuevoReto();
  const aj = P.d.ajustes, pend = N.pendientes(P.d, D).length;
  const chipLang = (v, n) => h('button', { class: 'chip', 'aria-pressed': String(aj.lang === v), onclick: () => { aj.lang = v; P.cambio(); if (!respondido) nuevoReto(); PINTA.retos(); } }, n);
  const sel = h('select', { class: 'campo', id: 'tema-retos', 'aria-label': 'Qué practicar', onchange: e => { aj.tema = e.target.value; P.cambio(); nuevoReto(); PINTA.retos(); } },
    h('option', { value: 'auto' }, `Tu tema actual (${temaActual().titulo})`), h('option', { value: 'repaso' }, `Solo repasos de hoy (${pend})`), h('option', { value: 'todo' }, 'Mezcla de todo lo visto'),
    ...D.temas.map((t, k) => h('option', { value: t.id }, `${k + 1}. ${t.titulo}`)));
  sel.value = aj.tema || 'auto';
  const r = reto, d = N.leeDia(P.d);
  const tarjeta = h('article', { class: 'tarjeta reto' + (retoPintado !== r ? ' entra' : ''), 'aria-live': 'polite' },
    h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, D.NOMBRE_TIPO[r.tipo]),
      h('span', { class: 'fila', style: 'gap:6px' }, r.marca ? h('span', { class: 'insignia kihada' }, r.marca) : null, h('span', { class: 'insignia' }, D.temas.find(t => t.id === r.tema).titulo), h('span', { class: 'insignia ai' }, NL[r.lang]))),
    ...cuerpoReto(), respondido ? respuestaReto() : null);
  retoPintado = r;   // la animación de entrada solo con un reto nuevo
  el.append(h('div', { class: 'columna' }, h('h1', { class: 'sr-only' }, 'Retos'),
    h('div', { class: 'entre' }, h('div', { class: 'chips', role: 'group', 'aria-label': 'Lenguaje de los retos' }, chipLang('mezcla', 'Los tres'), chipLang('ps', 'PSeInt'), chipLang('py', 'Python'), chipLang('cpp', 'C++')), sel),
    tarjeta,
    h('div', { class: 'entre' }, h('span', { class: 'tenue num', style: 'font-size:13.5px' }, `Hoy: ${d.retos} ${d.retos === 1 ? 'reto' : 'retos'}${d.retos ? ` · ${Math.round(d.aciertos / d.retos * 100)} % de aciertos` : ''}${pend ? ` · ${pend} repasos pendientes` : ''}`),
      h('span', { class: 'atajos' }, 'Teclado: 1 a 4 para responder · Enter para el siguiente'))));
  if (respondido) { const s = $('#siguiente'); if (s && document.activeElement && document.activeElement.closest && document.activeElement.closest('#v-retos')) s.focus({ preventScroll: true }); }
  else preparaSiguiente();
};
document.addEventListener('keydown', e => {
  if (vista !== 'retos' || !reto || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('.capa')) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (!respondido && /^[1-9]$/.test(e.key) && reto.opciones && reto.tipo !== 'ordenar' && reto.tipo !== 'error') { const k = +e.key - 1; if (k < reto.opciones.length) { e.preventDefault(); responde(k); } }
  else if (respondido && e.key === 'Enter' && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); siguienteReto(); }
});

/* ───────────── RUTA ───────────── */
let temaAbierto = null, langEjemplo = ls.get('lang-ejemplo', 'py');
function abrirTema(id) { temaAbierto = id; if (vista === 'ruta') PINTA.ruta(); else ir('ruta'); }
PINTA.ruta = function () {
  const el = $('#v-ruta'); el.textContent = '';
  if (temaAbierto) { el.append(detalleTema(D.temas.find(t => t.id === temaAbierto))); return; }
  const actual = temaActual();
  const lista = h('ol', { class: 'temas' }, ...D.temas.map((t, k) => {
    const e = est(t.id), hechos = t.ejercicios.filter(x => N.ejercicioHecho(P.d, x.id)).length;
    const estado = e.dominado ? 'Dominado' : t === actual ? 'Tu tema ahora' : e.visto ? 'Empezado' : 'Por ver';
    return h('li', null, h('button', { class: 'tema' + (e.dominado ? ' hecho' : t === actual ? ' actual' : ''), onclick: () => abrirTema(t.id) },
      h('span', { class: 'n', 'aria-hidden': 'true' }, e.dominado ? '✓' : String(k + 1)),
      h('span', { class: 'detalle' }, h('b', null, t.titulo), h('span', { class: 'tenue', style: 'font-size:13.5px' }, t.corto),
        h('span', { class: 'fila', style: 'gap:10px' }, h('span', { class: 'barra', style: 'flex:1 1 120px' }, h('i', { style: `width:${Math.round(e.prop * 100)}%` })), h('small', { class: 'tenue num' }, e.n ? `${Math.round(e.prop * 100)} %` : ''))),
      h('span', { class: 'lado' }, h('span', { class: 'insignia' + (e.dominado ? ' bien' : t === actual ? ' ai' : '') }, estado),
        h('span', { class: 'tenue', style: 'font-size:12px' }, `Ejercicios: ${hechos} de ${t.ejercicios.length}`))));
  }));
  const htmlHechas = D.html.filter(x => P.d.html[x.id]).length;
  el.append(h('div', { class: 'columna' },
    h('div', { class: 'tarjeta' }, h('h1', null, 'La ruta'),
      h('p', { class: 'tenue' }, 'Diez temas en orden. Cada uno explica una idea una sola vez y la enseña en los tres lenguajes a la vez: aprendes la lógica con PSeInt y ves cómo se escribe en Python y en C++. Cada tema dominado es un cinturón nuevo.'),
      h('p', { class: 'tenue', style: 'font-size:13.5px' }, 'Dominar un tema = acertar 8 de los últimos 10 retos del tema y resolver al menos uno de sus dos ejercicios en el laboratorio, en el lenguaje que quieras.')),
    lista,
    h('section', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', null, 'Rama extra: HTML'), h('span', { class: 'insignia' + (htmlHechas === D.html.length ? ' bien' : '') }, `${htmlHechas} de ${D.html.length}`)),
      h('p', { class: 'tenue' }, 'Tres lecciones cortas para hacer tu primera página web. No es programación, pero se aprende en una tarde y ves el resultado al momento.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => abrirLab({ lang: 'html' }) }, 'Abrir la rama de HTML')))));
};
function detalleTema(t) {
  const k = D.temas.indexOf(t), e = est(t.id);
  const pestanas = h('div', { class: 'chips', role: 'tablist', 'aria-label': 'Lenguaje del ejemplo' });
  const zona = h('div', { class: 'pila', role: 'tabpanel' });
  const pintaEjemplo = () => {
    pestanas.textContent = ''; zona.textContent = '';
    LANGS.forEach(l => pestanas.append(h('button', { class: 'chip', role: 'tab', 'aria-selected': String(l === langEjemplo), onclick: () => { langEjemplo = l; ls.set('lang-ejemplo', l); pintaEjemplo(); } }, NL[l])));
    const ent = { leer: ['16'], decisiones: ['7'] }[t.id] || [];
    const res = M.correr(t.ejemplo[langEjemplo], langEjemplo, ent);
    zona.append(bloqueCodigo(t.ejemplo[langEjemplo], langEjemplo),
      h('span', { class: 'etiqueta' }, ent.length ? `Lo que muestra (si el usuario escribe ${ent.join(', ')})` : 'Lo que muestra'), salidaBloque(D.limpia(res.salida)),
      h('div', { class: 'fila' }, h('button', { class: 'btn', onclick: () => abrirLab({ lang: langEjemplo, codigo: t.ejemplo[langEjemplo], entradas: ent, traza: true }) }, 'Ver paso a paso'),
        h('button', { class: 'btn plano', onclick: () => abrirLab({ lang: langEjemplo, codigo: t.ejemplo[langEjemplo], entradas: ent }) }, 'Abrir en el laboratorio')));
  };
  pintaEjemplo();
  const ejercicios = t.ejercicios.map((ej, j) => {
    const hecho = P.d.ejercicios[ej.id] || {};
    return h('section', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', null, `Ejercicio ${j + 1}: escríbelo tú`), h('span', { class: 'insignia' + (N.ejercicioHecho(P.d, ej.id) ? ' bien' : ' kihada') }, N.ejercicioHecho(P.d, ej.id) ? 'Resuelto' : 'Pendiente')),
      h('p', { style: 'white-space:pre-line' }, ej.enunciado),
      h('div', { class: 'fila' }, ...LANGS.map(l => h('button', { class: 'btn' + (l === langEjemplo && !hecho[l] ? ' primario' : ''), onclick: () => abrirLab({ lang: l, ejercicio: ej.id }) }, hecho[l] ? `${NL[l]} ✓` : `Resolver en ${NL[l]}`))));
  });
  return h('div', { class: 'columna' },
    h('div', null, h('button', { class: 'btn plano', onclick: () => { temaAbierto = null; PINTA.ruta(); } }, '← Todos los temas')),
    h('div', { class: 'tarjeta' },
      h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Tema ${k + 1} de ${D.temas.length}`), h('span', { class: 'insignia' + (e.dominado ? ' bien' : '') }, e.dominado ? 'Dominado' : `Retos: ${Math.round(e.prop * 100)} %`)),
      h('h1', null, t.titulo), ...t.idea.map(p => h('p', null, p))),
    h('section', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', null, 'El mismo programa en los tres'), pestanas), zona),
    h('section', { class: 'tarjeta' }, h('h2', null, 'Lo que cambia entre lenguajes'), h('ul', { class: 'lista' }, ...t.diferencias.map(d => h('li', null, d)))),
    ...ejercicios,
    h('section', { class: 'tarjeta' }, h('h2', null, 'Practicar este tema'), h('p', { class: 'tenue' }, 'Retos solo de este tema, en los tres lenguajes, hasta que lo domines.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => { P.d.ajustes.tema = t.id; P.cambio(); nuevoReto(); ir('retos'); } }, 'Retos de este tema'),
        P.d.ajustes.tema === t.id ? h('button', { class: 'btn plano', onclick: () => { P.d.ajustes.tema = 'auto'; P.cambio(); nuevoReto(); aviso('Los retos vuelven a seguir tu tema actual.'); PINTA.ruta(); } }, 'Volver al tema automático') : null)));
}

/* ───────────── LABORATORIO ───────────── */
const lab = { lang: ls.get('lab-lang', 'py'), ejercicio: null, html: ls.get('lab-html', 'html-1'), modo: 'editar', traza: null, paso: 0, datos: '' };
if (!['ps', 'py', 'cpp', 'html'].includes(lab.lang)) lab.lang = 'py';
let editor = null, ejec = null, resultados = null, ultimoFallo = null, entradasRun = [], avisosRun = [];
const claveBorrador = () => lab.lang === 'html' ? 'html-' + lab.html : lab.ejercicio ? `ej-${lab.ejercicio}-${lab.lang}` : 'libre-' + lab.lang;
const INICIO_LIBRE = {
  ps: 'Algoritmo MiPrograma\n    Escribir "Hola desde PSeInt"\nFinAlgoritmo\n',
  py: 'nombre = input("¿Cómo te llamas? ")\nprint("Hola,", nombre)\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hola desde C++" << endl;\n    return 0;\n}\n'
};
function codigoInicial() {
  const b = ls.get('borrador-' + claveBorrador(), null); if (typeof b === 'string') return b;
  if (lab.lang === 'html') return D.html.find(x => x.id === lab.html).inicio;
  if (lab.ejercicio) {
    const x = D.ejercicioPorId(lab.ejercicio);
    if (lab.ejercicio.endsWith('-1')) { const viejo = ls.get(`borrador-ej-${x.tema.id}-${lab.lang}`, null); if (typeof viejo === 'string') return viejo; }   // borradores de la versión 1
    return x.ej.inicio[lab.lang];
  }
  return INICIO_LIBRE[lab.lang];
}
function detenerEjecucion() { if (ejec && ejec.activo) ejec.detener(); ejec = null; }
function abrirLab(o = {}) {
  detenerEjecucion();
  lab.ejercicio = o.ejercicio && D.ejercicioPorId(o.ejercicio) ? o.ejercicio : null;
  lab.lang = o.lang || (lab.ejercicio && lab.lang === 'html' ? 'py' : lab.lang); ls.set('lab-lang', lab.lang);
  if (o.codigo) ls.set('borrador-' + claveBorrador(), o.codigo);
  lab.datos = (o.entradas || []).join('\n'); resultados = null; ultimoFallo = null; lab.modo = 'editar'; lab.traza = null;
  if (vista === 'lab') PINTA.lab(); else ir('lab');
  if (o.traza) pasoAPaso(codigoInicial());   // el código pedido, no el que tuviera el editor antes
}
function pintaEventos(caja, eventos) {
  caja.textContent = '';
  for (const ev of eventos) caja.append(ev.t === 'out' ? document.createTextNode(ev.s) : h('span', { class: 'in' }, ev.s + '\n'));
}
function pintaAvisos() {
  const caja = $('#avisos-lab'); if (!caja) return; caja.textContent = '';
  for (const a of avisosRun) caja.append(h('div', { class: 'aviso-codigo', role: 'note' }, h('b', null, `Aviso, línea ${a.linea}: `), a.texto));
}
function botonesEjecucion() {
  const b = $('#btn-ejecutar'); if (!b) return;
  const corre = !!(ejec && ejec.activo);
  b.textContent = corre ? 'Detener' : 'Ejecutar'; b.classList.toggle('peligro', corre);
}
function ejecutar() {
  if (ejec && ejec.activo) { ejec.detener(); return; }
  const caja = $('#consola'); if (!caja || !editor) return;
  editor.marca(0); caja.textContent = ''; caja.append(h('span', { class: 'fin' }, 'Ejecutando…'));
  entradasRun = []; ultimoFallo = null; let eventos = [];
  const pinta = () => pintaEventos(caja, eventos);
  ejec = E.ejecutar(editor.ta.value, lab.lang, {
    avisos: a => { avisosRun = a; pintaAvisos(); },
    salida: ev => { eventos = ev; pinta(); },
    pide: () => {
      pinta();
      const inp = h('input', { 'aria-label': 'Dato para el programa: escríbelo y pulsa Enter', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'send' });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); entradasRun.push(inp.value); ejec.enviar(inp.value); } });
      caja.append(inp, h('div', { class: 'fin' }, 'El programa espera un dato: escríbelo y pulsa Enter.'));
      setTimeout(() => inp.focus({ preventScroll: true }), 0);
    },
    fin: () => { pinta(); caja.append(h('div', { class: 'fin' }, eventos.length ? '— fin del programa —' : '(El programa terminó sin mostrar nada.)')); lab.datos = entradasRun.join('\n'); terminaRun(); },
    error: er => {
      pinta(); ultimoFallo = { tipo: 'error', linea: er.linea, mensaje: er.message, pista: er.pista };
      if (er.linea) editor.marca(er.linea);
      caja.append(h('div', { class: 'err', role: 'alert' }, h('b', null, er.linea ? `Línea ${er.linea}: ` : 'Error: '), er.message, er.pista ? h('div', { class: 'tenue', style: 'margin-top:4px' }, er.pista) : null));
      terminaRun();
    },
    detenido: () => { pinta(); caja.append(h('div', { class: 'fin' }, '— detenido —')); terminaRun(); }
  });
  botonesEjecucion();
}
function terminaRun() { botonesEjecucion(); pintaPistaLab(); }
async function pasoAPaso(codigoPedido) {
  if (lab.lang === 'html') return;
  detenerEjecucion();
  const codigo = typeof codigoPedido === 'string' ? codigoPedido : lab.modo === 'traza' && lab.traza && lab.traza.codigo ? lab.traza.codigo : editor && editor.ta.isConnected ? editor.ta.value : codigoInicial();
  const lang = lab.lang;
  const entradas = lab.datos === '' ? [] : lab.datos.replace(/\n$/, '').split('\n');
  lab.modo = 'traza'; lab.traza = { cargando: true, codigo, lang }; if (vista === 'lab') PINTA.lab();
  const r = await E.ejecutarConDatos(codigo, lang, entradas, { traza: true });
  const salida = r.eventos.filter(ev => ev.t === 'out').map(ev => ev.s).join('');
  const usoDatos = r.eventos.some(ev => ev.t === 'in') || (r.error && /pidió un dato/.test(r.error.message));
  lab.traza = { pasos: r.traza || [], salida, error: r.error, codigo, lang, usoDatos, cortada: (r.traza || []).length >= 3000 };
  lab.paso = 0; if (vista === 'lab') PINTA.lab();
}
function vistaTraza() {
  const T = lab.traza;
  const volver = h('button', { class: 'btn', onclick: () => { lab.modo = 'editar'; PINTA.lab(); } }, '← Volver al editor');
  if (T.cargando) return [h('div', { class: 'tarjeta' }, h('p', { class: 'tenue' }, 'Preparando el paso a paso…'))];
  const datos = h('textarea', { class: 'campo mono', id: 'datos-traza', rows: '3', 'aria-label': 'Datos de entrada, uno por línea', placeholder: 'Un dato por línea' }); datos.value = lab.datos;
  datos.addEventListener('change', () => { lab.datos = datos.value; });
  const panelDatos = (T.usoDatos || lab.datos) ? h('section', { class: 'tarjeta' }, h('h2', null, 'Datos de entrada'),
    h('p', { class: 'tenue' }, 'Lo que «escribe el usuario» cuando el programa pide datos. Uno por línea.'), datos,
    h('div', { class: 'fila' }, h('button', { class: 'btn', onclick: () => { lab.datos = datos.value; pasoAPaso(); } }, 'Repetir con estos datos'))) : null;
  if (!T.pasos.length) {
    const er = T.error;
    return [h('div', { class: 'fila' }, volver), h('section', { class: 'tarjeta' }, h('h2', null, 'No se puede seguir paso a paso'),
      h('p', null, er ? (er.linea ? `Línea ${er.linea}: ` : '') + er.message : 'El programa no tiene instrucciones.'), er && er.pista ? h('p', { class: 'tenue' }, er.pista) : null,
      h('p', { class: 'tenue' }, er && /pidió un dato/.test(er.message) ? 'Escribe abajo los datos que pide y repite.' : 'Corrige el error en el editor y vuelve a intentarlo.')), panelDatos];
  }
  const n = T.pasos.length, k = Math.max(0, Math.min(lab.paso, n - 1)), p = T.pasos[k], prev = k > 0 ? T.pasos[k - 1] : null;
  const ir_ = x => { lab.paso = Math.max(0, Math.min(n - 1, x)); PINTA.lab(); const b = $('#traza-sig'); if (b) b.focus({ preventScroll: true }); };
  const antes = new Map((prev ? prev.vars : []).map(v => [v.n + '|' + v.donde, v.v]));
  const rango = h('input', { type: 'range', min: '0', max: String(n - 1), value: String(k), 'aria-label': 'Elegir paso', oninput: e => ir_(+e.target.value) });
  const controles = h('div', { class: 'controles-traza' },
    h('button', { class: 'btn chico', onclick: () => ir_(0), disabled: k === 0 || null, 'aria-label': 'Primer paso' }, '⏮'),
    h('button', { class: 'btn chico', onclick: () => ir_(k - 1), disabled: k === 0 || null, 'aria-label': 'Paso anterior' }, '◀ Anterior'),
    h('span', { class: 'num contador', 'aria-live': 'polite' }, `Paso ${k + 1} de ${n}`),
    h('button', { class: 'btn chico primario', id: 'traza-sig', onclick: () => ir_(k + 1), disabled: k === n - 1 || null, 'aria-label': 'Paso siguiente' }, 'Siguiente ▶'),
    h('button', { class: 'btn chico', onclick: () => ir_(n - 1), disabled: k === n - 1 || null, 'aria-label': 'Último paso' }, '⏭'));
  const estado = p.fin ? h('p', { class: 'estado-traza fin' }, 'El programa terminó.')
    : p.error ? h('p', { class: 'estado-traza err' }, `Error en la línea ${p.linea}: ${p.error}`)
    : h('p', { class: 'estado-traza' }, `▶ Ahora se va a ejecutar la línea ${p.linea}`, p.pila.length ? h('span', { class: 'insignia ai', style: 'margin-left:8px' }, 'Dentro de ' + p.pila.map(f => f + '()').join(' › ')) : null);
  const codigo = bloqueCodigo(T.codigo, T.lang, { actual: p.fin ? 0 : p.linea });
  const vars = p.vars.length ? h('table', { class: 'variables' }, h('thead', null, h('tr', null, h('th', null, 'Variable'), h('th', null, 'Valor'), h('th', null, 'Tipo'))),
    h('tbody', null, ...p.vars.map(v => { const cambio = !prev || antes.get(v.n + '|' + v.donde) !== v.v; return h('tr', { class: cambio && k > 0 ? 'cambio' : '' }, h('td', { class: 'mono' }, v.n, v.donde ? h('small', { class: 'tenue' }, ' ' + v.donde) : null), h('td', { class: 'mono valor' }, v.v), h('td', { class: 'tenue' }, v.t)); })))
    : h('p', { class: 'tenue' }, 'Todavía no hay variables.');
  setTimeout(() => { const li = document.querySelector('#v-lab .codigo li.actual'); if (li) li.scrollIntoView({ block: 'nearest' }); }, 0);
  return [h('div', { class: 'entre' }, volver, h('span', { class: 'tenue', style: 'font-size:12.5px' }, 'Teclado: ← y → para moverte')),
    h('section', { class: 'tarjeta traza' }, controles, rango, estado,
      h('div', { class: 'dos' }, h('div', { class: 'pila' }, codigo), h('div', { class: 'pila' }, h('span', { class: 'etiqueta' }, 'Variables'), vars,
        h('span', { class: 'etiqueta' }, 'Lo que se ha mostrado'), salidaBloque(T.salida.slice(0, p.salida)))),
      T.cortada ? h('p', { class: 'tenue', style: 'font-size:13px' }, 'Solo se registran los primeros 3.000 pasos.') : null),
    panelDatos];
}
function comprobar() {
  const x = D.ejercicioPorId(lab.ejercicio); if (!x || !editor) return;
  resultados = D.compruebaEjercicio(editor.ta.value, lab.lang, x.ej.pruebas);
  if (resultados.every(r => r.ok)) {
    const r = N.registraEjercicio(P.d, D, lab.ejercicio, lab.lang); trataPuntos(r, true); ultimoFallo = null;
    if (r.cinturon) U.celebra(r.cinturon, `Dominaste «${x.tema.titulo}» resolviendo su ejercicio: +${N.PUNTOS.ejercicio + N.PUNTOS.cinturon} puntos. Siguiente tema: «${temaActual().titulo}».`);
    else aviso(r.nuevo ? `Ejercicio resuelto en ${NL[lab.lang]}: +${N.PUNTOS.ejercicio} puntos.` : 'Sigue funcionando. Bien.', 5000);
  } else {
    const f = resultados.find(r => !r.ok);
    ultimoFallo = f.error ? { tipo: 'error', linea: f.error.linea, mensaje: f.error.message } : { tipo: 'prueba', entradas: f.entradas, esperado: f.esperado, salida: f.salida };
    trataPuntos(N.registraFallo(P.d, N.PUNTOS.ejercicioFallo), false); aviso(`El ejercicio aún no pasa las pruebas: −${-N.PUNTOS.ejercicioFallo} puntos. Mira qué falla abajo.`, 4500);
    if (f.error && f.error.linea) editor.marca(f.error.linea);
    lab.datos = f.entradas.join('\n');
  }
  pintaResultados(); pintaPistaLab();
}
function pintaResultados() {
  const caja = $('#resultados'); if (!caja) return; caja.textContent = '';
  if (!resultados) return;
  const todos = resultados.every(r => r.ok);
  caja.append(h('p', { role: 'status' }, h('b', null, todos ? 'Todas las pruebas pasan.' : `Pasan ${resultados.filter(r => r.ok).length} de ${resultados.length} pruebas.`), todos ? ' Ejercicio resuelto.' : ' Mira la que falla (con «Paso a paso» verás qué hace tu programa con esos datos):'));
  resultados.forEach((r, k) => caja.append(h('div', { class: 'prueba ' + (r.ok ? 'si' : 'no') },
    h('b', null, `${r.ok ? '✓' : '✗'} Prueba ${k + 1}`, r.entradas.length ? h('span', { class: 'tenue', style: 'font-weight:400' }, ` · el usuario escribe: ${r.entradas.join(', ')}`) : null),
    r.ok ? null : h('div', null, h('span', { class: 'etiqueta' }, 'Esperaba'), h('pre', null, r.esperado)),
    r.ok ? null : h('div', null, h('span', { class: 'etiqueta' }, r.error ? 'Error' : 'Salió'), h('pre', null, r.error ? `Línea ${r.error.linea}: ${r.error.message}` : (r.salida || '(nada)'))))));
}
function pintaPistaLab() {
  const caja = $('#pista-lab'); if (!caja) return; caja.textContent = '';
  if (!editor) return;
  const x = lab.ejercicio ? D.ejercicioPorId(lab.ejercicio) : null;
  caja.append(botonTutor(ultimoFallo ? 'Pedir una pista' : 'Que revise mi código', () => {
    let estado = 'El código funciona sin errores.';
    if (ultimoFallo && ultimoFallo.tipo === 'error') estado = `Da un error en la línea ${ultimoFallo.linea}: ${ultimoFallo.mensaje}`;
    else if (ultimoFallo && ultimoFallo.tipo === 'prueba') estado = `Una prueba falla. ${ultimoFallo.entradas.length ? 'El usuario escribe: ' + ultimoFallo.entradas.join(', ') + '. ' : ''}Se esperaba:\n${ultimoFallo.esperado}\nY salió:\n${ultimoFallo.salida || '(nada)'}`;
    return `${REGLAS_TUTOR}\n\n${x ? 'El ejercicio es:\n' + x.ej.enunciado + '\n\n' : ''}Lenguaje: ${NL[lab.lang]}\nSu código:\n${editor.ta.value}\n\nResultado: ${estado}\n\nDale UNA pista concreta, de 2 a 4 frases, para que encuentre el problema por sí mismo. No escribas el código resuelto ni la línea corregida completa. Si el código ya está bien, díselo y sugiere una mejora pequeña.`;
  }));
}
let reinicioArmado = false;
PINTA.lab = function () {
  const el = $('#v-lab'); el.textContent = ''; reinicioArmado = false;
  const tabs = h('div', { class: 'chips', role: 'tablist', 'aria-label': 'Lenguaje' }, ...[...LANGS, 'html'].map(l => h('button', { class: 'chip', role: 'tab', 'aria-selected': String(lab.lang === l), onclick: () => {
    if (lab.lang === l) return; detenerEjecucion(); lab.lang = l; ls.set('lab-lang', l); resultados = null; ultimoFallo = null; avisosRun = []; lab.modo = 'editar';
    if (l === 'html') lab.ejercicio = null; PINTA.lab();
  } }, NL[l])));
  if (lab.lang === 'html') { el.append(h('div', { class: 'columna' }, tabs, ...pintaHtml())); return; }
  const x = lab.ejercicio ? D.ejercicioPorId(lab.ejercicio) : null;
  const cab = x ? h('div', { class: 'tarjeta' }, h('h1', { class: 'sr-only' }, `Laboratorio: ejercicio de ${x.tema.titulo}`),
      h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Tema ${D.temas.indexOf(x.tema) + 1}: ${x.tema.titulo}`),
        h('div', { class: 'chips' }, ...x.tema.ejercicios.map((e2, j) => h('button', { class: 'chip', 'aria-pressed': String(e2.id === lab.ejercicio), onclick: () => abrirLab({ lang: lab.lang, ejercicio: e2.id }) }, `Ejercicio ${j + 1}${N.ejercicioHecho(P.d, e2.id) ? ' ✓' : ''}`)))),
      h('p', { style: 'white-space:pre-line' }, x.ej.enunciado),
      (P.d.ejercicios[lab.ejercicio] || {})[lab.lang] ? h('span', { class: 'insignia bien' }, `Resuelto en ${NL[lab.lang]}`) : null,
      h('div', { class: 'fila' }, h('button', { class: 'btn plano', onclick: () => abrirTema(x.tema.id) }, 'Ver la lección'), h('button', { class: 'btn plano', onclick: () => abrirLab({ lang: lab.lang }) }, 'Salir al espacio libre')))
    : h('div', { class: 'tarjeta' }, h('h1', null, 'Laboratorio'),
      h('p', { class: 'tenue' }, `Espacio libre para escribir ${NL[lab.lang]} y ejecutarlo aquí mismo, sin instalar nada. Si el programa pide datos, los escribes en la consola. Con «Paso a paso» ves qué hace cada línea y cómo cambian las variables.`),
      h('p', { class: 'tenue', style: 'font-size:13px' }, 'Entiende lo de un primer curso: variables, decisiones, bucles, arreglos, funciones, texto' + (lab.lang === 'py' ? ', listas y diccionarios' : lab.lang === 'cpp' ? ', vector y string' : '') + '. Para programas grandes, instala el lenguaje en tu PC.'));
  if (lab.modo === 'traza' && lab.traza) { el.append(h('div', { class: 'columna' }, tabs, cab, ...vistaTraza().filter(Boolean))); return; }
  editor = U.editor({ valor: codigoInicial(), lang: lab.lang, alCambiar: v => ls.set('borrador-' + claveBorrador(), v), alEjecutar: ejecutar });
  const reiniciar = h('button', { class: 'btn plano', onclick: () => {
    if (!reinicioArmado) { reinicioArmado = true; reiniciar.textContent = '¿Seguro? Toca otra vez'; setTimeout(() => { if (reiniciar.isConnected) { reinicioArmado = false; reiniciar.textContent = 'Volver a empezar'; } }, 3000); return; }
    ls.set('borrador-' + claveBorrador(), null); if (lab.ejercicio && lab.ejercicio.endsWith('-1')) ls.set(`borrador-ej-${D.ejercicioPorId(lab.ejercicio).tema.id}-${lab.lang}`, null);
    resultados = null; ultimoFallo = null; PINTA.lab();
  } }, 'Volver a empezar');
  const acciones = h('div', { class: 'fila' },
    h('button', { class: 'btn primario', id: 'btn-ejecutar', onclick: ejecutar }, 'Ejecutar'),
    h('button', { class: 'btn', onclick: () => pasoAPaso(editor.ta.value) }, 'Paso a paso'),
    x ? h('button', { class: 'btn exito', onclick: comprobar }, 'Comprobar el ejercicio') : null,
    reiniciar, h('span', { class: 'atajos' }, 'Ctrl + Enter ejecuta · Ctrl + / comenta'));
  el.append(h('div', { class: 'columna' }, tabs, cab, h('div', { class: 'lab' }, editor.el, acciones, h('div', { id: 'avisos-lab', class: 'pila' }),
    h('span', { class: 'etiqueta' }, 'Consola'), h('div', { class: 'consola', id: 'consola', 'aria-live': 'polite' }, h('span', { class: 'fin' }, 'Pulsa «Ejecutar» para ver lo que hace tu programa.')),
    h('div', { class: 'pruebas', id: 'resultados' }), h('div', { id: 'pista-lab' }))));
  pintaAvisos(); pintaResultados(); pintaPistaLab(); botonesEjecucion();
};
document.addEventListener('keydown', e => {
  if (vista !== 'lab' || lab.modo !== 'traza' || !lab.traza || !lab.traza.pasos || e.target.closest('input, textarea, select')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); lab.paso = Math.max(0, Math.min(lab.traza.pasos.length - 1, lab.paso + (e.key === 'ArrowRight' ? 1 : -1))); PINTA.lab(); }
});

/* HTML: vista previa al momento, en una caja aislada (sin scripts) */
let vistaT = null;
function limpiaHtml(src) {
  // 1.º se quitan del texto los atributos on…= (así el navegador ni siquiera los lee); 2.º se limpia el árbol;
  // 3.º la política de seguridad de la página bloquearía cualquier script que quedara.
  const doc = new DOMParser().parseFromString(src.replace(/[\s/]on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, ' '), 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link, meta, base, frame, frameset, template').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(n => {
    for (const a of [...n.attributes]) if (/^on/i.test(a.name) || /^\s*(javascript|data|vbscript):/i.test(a.value) && /^(href|src|action|formaction|xlink:href)$/i.test(a.name)) n.removeAttribute(a.name);
    if (n.tagName === 'A') { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer'); }
  });
  return doc;
}
function pintaVistaHtml() {
  const caja = $('#vista-html'); if (!caja || !editor) return;
  const src = editor.ta.value, doc = limpiaHtml(src);
  const raiz = caja.shadowRoot || caja.attachShadow({ mode: 'open' });
  raiz.innerHTML = '<style>:host{all:initial;display:block;font:16px/1.5 system-ui,sans-serif;color:#111;background:#fff}</style>' + [...doc.head.querySelectorAll('style')].map(s => s.outerHTML).join('') + doc.body.innerHTML;
  raiz.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => e.preventDefault()));
  const lec = D.html.find(x => x.id === lab.html), checks = lec.comprobar(doc, src);
  const lista = $('#checks-html'); lista.textContent = '';
  checks.forEach(c => lista.append(h('li', { class: c.ok ? 'si' : '' }, (c.ok ? '✓ ' : '○ ') + c.texto)));
  if (checks.every(c => c.ok) && !P.d.html[lec.id]) { P.d.html[lec.id] = true; trataPuntos(N.sumaPuntos(P.d, N.PUNTOS.html), true); aviso(`Lección de HTML «${lec.titulo}» completada: +${N.PUNTOS.html} puntos.`); }
}
function pintaHtml() {
  const lec = D.html.find(x => x.id === lab.html) || D.html[0];
  editor = U.editor({ valor: codigoInicial(), lang: 'html', alCambiar: v => { ls.set('borrador-' + claveBorrador(), v); clearTimeout(vistaT); vistaT = setTimeout(pintaVistaHtml, 250); } });
  const chips = h('div', { class: 'chips' }, ...D.html.map((x, k) => h('button', { class: 'chip', 'aria-pressed': String(x.id === lab.html), onclick: () => { lab.html = x.id; ls.set('lab-html', x.id); PINTA.lab(); } }, `${k + 1}. ${x.titulo}${P.d.html[x.id] ? ' ✓' : ''}`)));
  setTimeout(pintaVistaHtml, 0);
  return [h('div', { class: 'tarjeta' }, h('span', { class: 'etiqueta' }, 'Rama extra: HTML'), chips, h('h1', null, lec.titulo), ...lec.idea.map(p => h('p', null, p)),
      h('p', null, h('b', null, 'Tu tarea: '), lec.tarea), h('ul', { class: 'checks', id: 'checks-html' })),
    h('div', { class: 'dos' }, h('div', { class: 'lab' }, h('span', { class: 'etiqueta' }, 'Tu HTML'), editor.el), h('div', { class: 'lab' }, h('span', { class: 'etiqueta' }, 'Así se ve'), h('div', { class: 'vista-html', id: 'vista-html' })))];
}

/* ───────────── PLAN ───────────── */
const REGLAS = [
  { e: 'Disparador', t: 'Misma señal, otra respuesta', p: 'Decide de antemano qué haces cuando llega la espera: «si le escribo a Claude, entonces abro el Dojo». Los planes «si… entonces» funcionan mucho mejor que las buenas intenciones: en un análisis de 94 estudios con más de 8.000 personas tuvieron un efecto entre medio y grande.', f: 'Gollwitzer y Sheeran (2006), metaanálisis de las intenciones de implementación.', u: 'https://doi.org/10.1016/S0065-2601(06)38002-1' },
  { e: 'Trabas', t: 'Ponle trabas a TikTok y quítaselas al Dojo', p: 'Lo que está a un toque gana. Saca TikTok de la pantalla de inicio, ponle un límite diario y pon el Dojo en su sitio. Abrirlo tiene que costar menos que abrir TikTok.' },
  { e: 'Recordar', t: 'Practica sacando la respuesta de tu cabeza', p: 'Por eso aquí casi todo son preguntas y no lecturas. Responder fija lo aprendido mucho más que releer: en clases reales, las preguntas cortas mejoraron lo aprendido en torno a media desviación típica.', f: 'Yang y otros (2021), metaanálisis de estudios en clase, Psychological Bulletin.', u: 'https://doi.org/10.1037/bul0000309' },
  { e: 'Espaciar', t: 'Lo que fallas vuelve, y lo que aciertas también', p: 'Cada tipo de reto tiene su calendario: si lo fallas vuelve pronto; si lo aciertas, vuelve en 1, 3, 7, 16 y 35 días. Repasar justo antes de olvidar es de lo mejor respaldado de la psicología del aprendizaje.', f: 'Carpenter, Pan y Butler (2022), Nature Reviews Psychology.', u: 'https://www.nature.com/articles/s44159-022-00089-1' },
  { e: 'Ordenar', t: 'Ordenar líneas antes de escribirlas', p: 'Los retos de ordenar líneas (los «problemas de Parsons») ayudan a practicar más rápido y con menos atascos, sobre todo a quien todavía no se ve capaz de programar, y se aprende lo mismo que escribiendo desde cero.', f: 'Hou, Ericson y Wang (2023), Universidad de Míchigan.', u: 'https://arxiv.org/abs/2311.18115' },
  { e: 'Ver', t: 'Mira lo que pasa por dentro', p: 'Con «Paso a paso» ves qué línea se ejecuta y cómo cambian las variables. Ver el programa por dentro es la forma más rápida de entender por qué falla.' },
  { e: 'Foco', t: 'Lo nuevo se aprende con calma', p: 'Las esperas sirven para repasar. Un tema nuevo se aprende con un rato seguido escribiendo código sin mirar a Claude: el bloque de foco. Antes de empezarlo, dale a Claude una parte entera para que trabaje solo todo ese rato.' },
  { e: 'Avisos', t: 'Que Claude te avise; no lo vigiles', p: 'Si Claude te avisa cuando termina, no hace falta estar pendiente de la pantalla. Y si te distraes, tócalo en «Me distraje»: no resta nada, sirve para que lo veas.' }
];
const CHECKS = [
  ['dojo-inicio', 'Instala el Dojo y ponlo en la pantalla de inicio', 'En Android, desde Chrome: menú ⋮ → «Instalar app». En el PC, el icono de instalar de Chrome o Edge. En iPhone, desde Safari: Compartir → Añadir a la pantalla de inicio. Ponlo justo donde estaba TikTok.'],
  ['tiktok', 'Saca TikTok de la pantalla de inicio y ponle un límite', 'Android: Ajustes → Bienestar digital → Temporizadores de apps. iPhone: Ajustes → Tiempo de uso → Límites de apps.'],
  ['avisos', 'Activa los avisos de Claude', 'Que te avise cuando termina, para no vigilarlo. En el PC, Claude Code puede sonar al acabar: pídeselo en el chat del proyecto y lo deja configurado.'],
  ['hora', 'Elige la hora de tu bloque de foco', 'Siempre la misma, por ejemplo después de comer. Escríbela en tu regla de abajo.'],
  ['pc', 'Instala PSeInt, Python y C++ en tu PC', 'Para cuando quieras ir más allá del laboratorio: PSeInt (pseint.sourceforge.net), Python (python.org) y C++ con VS Code o Code::Blocks.']
];
function selector(id, etiqueta, valor, opciones, al) {
  const s = h('select', { class: 'campo', id }, ...opciones.map(([v, n]) => h('option', { value: String(v) }, n)));
  s.value = String(valor); s.addEventListener('change', () => al(s.value));
  return h('label', { class: 'ajuste', for: id }, h('span', null, etiqueta), s);
}
PINTA.plan = function () {
  const el = $('#v-plan'); el.textContent = ''; const aj = P.d.ajustes;
  const regla = h('textarea', { class: 'campo', id: 'regla', rows: '3', maxlength: '500', 'aria-label': 'Tu regla si-entonces' }); regla.value = P.d.plan.regla;
  regla.addEventListener('change', () => { P.d.plan.regla = regla.value.trim().slice(0, 500) || P.d.plan.regla; P.cambio(); aviso('Regla guardada.'); });
  const hechos = CHECKS.filter(c => P.d.plan.checks[c[0]]).length;
  el.append(h('div', { class: 'columna' },
    h('div', { class: 'tarjeta' }, h('h1', null, 'Tu plan contra el scroll'),
      h('p', null, 'Lo que te pasa tiene explicación: cada mensaje a Claude abre una espera de unos minutos, y esa espera es la señal que te lleva a TikTok. TikTok gana porque está a un toque y premia al instante. No se arregla con fuerza de voluntad: se arregla decidiendo qué haces en ese mismo momento y poniéndole trabas a lo otro.'),
      h('p', { class: 'tenue' }, 'Este Dojo está hecho para esa espera: retos de 30 segundos en el móvil o en el PC. Y una vez al día, un bloque de foco para aprender de verdad.')),
    h('section', { class: 'tarjeta' }, h('h2', null, 'Las ideas que lo sostienen'),
      ...REGLAS.map(r => h('div', { class: 'regla' }, h('span', { class: 'insignia ai' }, r.e), h('div', null, h('h3', null, r.t), h('p', { class: 'tenue' }, r.p), r.f ? h('p', { class: 'fuente' }, 'Fuente: ', h('a', { href: r.u, target: '_blank', rel: 'noopener noreferrer' }, r.f)) : null)))),
    h('section', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', null, 'Prepara el terreno'), h('span', { class: 'insignia' + (hechos === CHECKS.length ? ' bien' : '') }, `${hechos} de ${CHECKS.length}`)),
      h('div', null, ...CHECKS.map(([id, t, s]) => { const c = h('input', { type: 'checkbox', id: 'chk-' + id }); c.checked = !!P.d.plan.checks[id]; c.addEventListener('change', () => { if (c.checked) P.d.plan.checks[id] = true; else delete P.d.plan.checks[id]; P.cambio(); PINTA.plan(); }); return h('div', { class: 'check' }, c, h('label', { for: 'chk-' + id }, t, h('small', null, s))); }))),
    h('section', { class: 'tarjeta', id: 'puntos' }, h('h2', null, 'Rangos y puntos'),
      h('p', { class: 'tenue' }, 'Diez rangos, de Aprendiz a Ingeniero de élite. Cada acierto suma y cada fallo resta, así que no vale responder a lo loco. Al llegar a los puntos de un rango se abre su examen: preguntas de código y de inglés de todo lo que deberías saber a ese nivel, sin tutor, sin pistas y sin saber si aciertas hasta el final. Solo subes si lo apruebas.'),
      escaleraRangos(), tablaPuntos()),
    h('section', { class: 'tarjeta' }, h('h2', null, 'Tu regla «si… entonces»'), h('p', { class: 'tenue' }, 'Escríbela con tus palabras. Concreta y con un momento fijo funciona mejor.'), regla),
    h('section', { class: 'tarjeta' }, h('h2', null, 'Ajustes'),
      h('div', { class: 'ajustes' },
        selector('aj-meta', 'Retos al día', aj.meta, [[10, '10'], [20, '20'], [30, '30'], [50, '50']], v => { aj.meta = +v; P.cambio(); }),
        selector('aj-meta-ingles', 'Ejercicios de inglés al día', aj.metaIngles, [[5, '5'], [10, '10'], [15, '15'], [20, '20']], v => { aj.metaIngles = +v; P.cambio(); }),
        selector('aj-foco', 'Bloque de foco', aj.foco, [[15, '15 min'], [25, '25 min'], [45, '45 min'], [60, '60 min']], v => { aj.foco = +v; P.cambio(); }),
        selector('aj-lang', 'Lenguaje de los retos', aj.lang, [['mezcla', 'Los tres'], ['ps', 'PSeInt'], ['py', 'Python'], ['cpp', 'C++']], v => { aj.lang = v; P.cambio(); reto = null; }),
        selector('aj-aspecto', 'Aspecto', aj.aspecto, [['sistema', 'Como el sistema'], ['claro', 'Claro'], ['oscuro', 'Oscuro']], v => { aj.aspecto = v; P.cambio(); U.aplicaAspecto(v); }),
        selector('aj-vibrar', 'Vibrar al responder', aj.vibrar ? 'si' : 'no', [['si', 'Sí'], ['no', 'No']], v => { aj.vibrar = v === 'si'; P.cambio(); U.vibra(18, aj.vibrar); }))),
    tarjetaApp(), tarjetaCopia(), tarjetaPrivacidad()));
};
function tarjetaApp() {
  const partes = [h('h2', null, 'La app')];
  if (enClaude) partes.push(h('p', { class: 'tenue' }, 'Estás usando la versión dentro de Claude: guarda tu progreso en tu cuenta y tiene el tutor.'),
    h('p', null, 'La app instalable (con su icono, sin internet y con actualizaciones solas) está aquí: ', h('a', { href: URL_APP, target: '_blank', rel: 'noopener noreferrer' }, URL_APP)),
    h('p', { class: 'tenue', style: 'font-size:13px' }, 'Para llevarte tu progreso a la app instalable, usa «Copiar mi progreso» aquí abajo y pégalo allí.'));
  else if (instalada()) partes.push(h('p', null, h('span', { class: 'insignia bien' }, 'Instalada'), ' Se actualiza sola: cuando haya una versión nueva te saldrá un aviso para actualizar.'));
  else if (pedirInstalar) partes.push(h('p', { class: 'tenue' }, 'Instálala para tenerla con su icono, en su propia ventana y sin internet. Se actualiza sola.'), h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: instalar }, 'Instalar la app')));
  else if (esIphone()) partes.push(h('p', null, 'En iPhone se instala desde Safari: toca Compartir (el cuadrado con la flecha) y luego «Añadir a la pantalla de inicio».'));
  else partes.push(h('p', { class: 'tenue' }, 'Para instalarla como app de verdad, ábrela en Chrome y elige «Instalar app» en el menú ⋮ (en el PC, el icono de instalar de la barra de direcciones). Si la instalas desde Edge, solo crea un acceso directo con su logo.'));
  partes.push(h('p', { class: 'tenue num', style: 'font-size:12.5px' }, 'Versión ' + VERSION));
  return h('section', { class: 'tarjeta' }, ...partes);
}
let cargaArmada = false, borrarArmado = false;
function tarjetaCopia() {
  const salida = h('textarea', { class: 'campo mono', id: 'codigo-progreso', rows: '3', readonly: true, hidden: true, 'aria-label': 'Tu código de progreso' });
  const entrada = h('textarea', { class: 'campo mono', id: 'pegar-progreso', rows: '3', placeholder: 'Pega aquí el código (empieza por DOJO1:)', 'aria-label': 'Código de progreso de otro dispositivo' });
  const cargar = h('button', { class: 'btn', onclick: () => {
    let d; try { d = N.leeCodigoProgreso(entrada.value, D, I, J); } catch (e) { aviso(e.message, 5000); return; }
    if (!cargaArmada) { cargaArmada = true; cargar.textContent = 'Sustituye el progreso de este dispositivo. Toca otra vez'; setTimeout(() => { if (cargar.isConnected) { cargaArmada = false; cargar.textContent = 'Cargar este progreso'; } }, 4000); return; }
    cargaArmada = false; d.bienvenida = true; P.sustituye(d); reto = null; repintar(); aviso('Progreso cargado.');
  } }, 'Cargar este progreso');
  return h('section', { class: 'tarjeta' }, h('h2', null, 'Pasar tu progreso a otro dispositivo'),
    h('p', { class: 'tenue' }, 'Copia el código aquí, mándatelo (por ejemplo, por WhatsApp a ti mismo) y pégalo en el otro dispositivo.'),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: async () => {
      const c = N.codigoProgreso(P.d); salida.value = c;
      if (await U.copia(c)) aviso('Código copiado. Pégalo en el otro dispositivo.'); else { salida.hidden = false; salida.focus(); salida.select(); aviso('Selecciona el código y cópialo.'); }
    } }, 'Copiar mi progreso')), salida, entrada, h('div', { class: 'fila' }, cargar));
}
function tarjetaPrivacidad() {
  const borrar = h('button', { class: 'btn peligro-suave', onclick: () => {
    if (!borrarArmado) { borrarArmado = true; borrar.textContent = 'Se borra todo y no se puede deshacer. Toca otra vez'; setTimeout(() => { if (borrar.isConnected) { borrarArmado = false; borrar.textContent = 'Borrar mi progreso'; } }, 4000); return; }
    borrarArmado = false; const n = N.NUEVO(); n.bienvenida = false; P.sustituye(n); reto = null; colaSesion.length = 0; VI.inicio(); repintar(); ir('hoy'); aviso('Progreso borrado. Empiezas de cero.');
  } }, 'Borrar mi progreso');
  return h('section', { class: 'tarjeta' }, h('h2', null, 'Tus datos'),
    h('p', { class: 'tenue' }, enClaude ? 'Tu progreso se guarda en tu cuenta de Claude, en un espacio privado que solo tú puedes leer.' : 'Tu progreso se guarda solo en este dispositivo. La app no tiene anuncios, no envía datos a ningún servidor y no usa rastreadores.'),
    h('p', { class: 'tenue' }, enClaude ? 'La voz y el dictado de los ejercicios de inglés los pone Claude; tu voz no se guarda en el Dojo.' : 'Si usas el micrófono en inglés, quien convierte tu voz en texto es el navegador (en Chrome y Edge, con los servidores de Google o de Microsoft). El Dojo solo recibe el texto y no lo guarda.'),
    h('p', { class: 'tenue' }, 'El código que escribes en el laboratorio se ejecuta aquí mismo, en tu dispositivo.'),
    h('div', { class: 'fila' }, borrar));
}

/* ───────────── INGLÉS (vista-ingles.js) ───────────── */
const VE = window.VistaExamen({ P, N, D, I, J, U, Voz, ir, aviso, trataPuntos, chipPuntos, vista: () => vista });
const VH = window.VistaHabla({ P, N, J, U, Voz, ir, aviso, botonTutor, trataPuntos, chipPuntos, vista: () => vista });
PINTA.habla = () => VH.pinta();
PINTA.examen = () => VE.pinta();
const VI = window.VistaIngles({ P, N, I, U, Voz, ir, aviso, botonTutor, trataPuntos, chipPuntos, sample: sampleActivo, apagaTutor: () => { tutorApagado = true; }, vista: () => vista });
PINTA.ingles = () => VI.pinta();

/* ───────────── Arranque ───────────── */
U.aplicaAspecto(P.d.ajustes.aspecto);
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => U.aplicaAspecto(P.d.ajustes.aspecto));
document.querySelectorAll('.boton-instalar').forEach(b => b.addEventListener('click', instalar));
Voz.iniciar(enClaude);
VE.revisaAbandono();
pintaRango(); pintaBandas(); pintaPie(); pintaInstalar();
vista = '';
mostrar(location.hash.slice(1) || 'hoy');
P.iniciar();
})();
