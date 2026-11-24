/* Dojo de código · la app. Vistas: Hoy, Retos, Ruta, Laboratorio y Plan. */
(function () {
'use strict';
const D = window.Dojo, M = window.Motor;
const LANGS = ['ps', 'py', 'cpp'];
const NL = D.NOMBRE_LANG;
const $ = (s, el) => (el || document).querySelector(s);
function h(tag, attrs, ...hijos) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat(Infinity)) { if (c === null || c === undefined || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return el;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem('dojo-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('dojo-' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
};
const hoyClave = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const diasAtras = n => { const d = new Date(); d.setDate(d.getDate() - n); return hoyClave(d); };
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function aviso(texto, ms = 3200) { const a = $('#aviso'); a.textContent = texto; a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, ms); }

/* ───────────── Progreso: en la cuenta (db) y, de respaldo, en este navegador ───────────── */
const NUEVO = () => ({ v: 1, actualizado: 0, puntos: 0, dias: {}, temas: {}, repaso: [], html: {},
  ajustes: { meta: 20, foco: 25, lang: 'mezcla', tema: 'auto' },
  plan: { checks: {}, regla: 'Si le mando un mensaje a Claude, entonces abro el Dojo y hago retos hasta que me responda.' } });
const P = {
  d: Object.assign(NUEVO(), ls.get('progreso', {})), ref: null, escribiendo: false, otraVez: false, t: null, enCuenta: false,
  async iniciar() {
    try {
      if (!window.claude || !window.claude.use) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const id = user ? await user.id() : null;
      if (!db || !id) return;
      this.ref = db.doc('data/users/' + id + '/progreso');
      let primera = true;
      this.ref.onSnapshot(snap => {
        const remoto = snap.exists ? snap.data() : null;
        if (primera && !snap.metadata.fromCache) { primera = false; this.enCuenta = true; pintaPie(); if (!remoto || (remoto.actualizado || 0) < this.d.actualizado) this.guardar(); }
        if (remoto && (remoto.actualizado || 0) > this.d.actualizado && !this.t && !this.escribiendo) {
          this.d = Object.assign(NUEVO(), JSON.parse(JSON.stringify(remoto))); ls.set('progreso', this.d); repintar();
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
  dia(k = hoyClave()) { return this.d.dias[k] || (this.d.dias[k] = { retos: 0, aciertos: 0, foco: 0, esperas: 0, perdidas: 0, segEspera: 0 }); },
  tema(id) { return this.d.temas[id] || (this.d.temas[id] = { ultimos: [], intentos: 0, aciertos: 0, ejercicio: {} }); }
};
function pintaPie() { const el = $('#pie-lateral'); if (el) el.textContent = (P.enCuenta ? 'Tu progreso se guarda en tu cuenta: es el mismo en el PC y en el móvil.' : 'Tu progreso se guarda en este dispositivo.') + ' Versión ' + VERSION + '.'; }

/* ───────────── App instalable y actualizable (fuera de Claude) ───────────── */
const VERSION = '1.1.0';
const URL_APP = '';   // dirección de la app instalable, cuando esté publicada
const enClaude = !!(window.claude && window.claude.use);
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
/* Pasar el progreso de un dispositivo a otro con un código */
const codigoProgreso = () => 'DOJO1:' + btoa(unescape(encodeURIComponent(JSON.stringify(P.d))));
function leeCodigoProgreso(txt) {
  const m = /DOJO1:([A-Za-z0-9+/=]+)/.exec(String(txt).replace(/\s+/g, ''));
  if (!m) throw new Error('Ese texto no es un código de progreso del Dojo. Tiene que empezar por DOJO1:');
  let d; try { d = JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch (e) { throw new Error('El código está incompleto. Cópialo entero otra vez.'); }
  if (!d || d.v !== 1 || typeof d.dias !== 'object' || typeof d.temas !== 'object') throw new Error('El código no tiene el formato del Dojo.');
  return d;
}

/* ───────────── Rango, racha y tema actual ───────────── */
const CINTURONES = [
  { n: '10.º kyū', c: '#F3F1EA' }, { n: '9.º kyū', c: '#E9C547' }, { n: '8.º kyū', c: '#E58A2E' }, { n: '7.º kyū', c: '#3F9A5A' }, { n: '6.º kyū', c: '#2F6DB5' },
  { n: '5.º kyū', c: '#7A4FB0' }, { n: '4.º kyū', c: '#A0703F' }, { n: '3.er kyū', c: '#7D5230' }, { n: '2.º kyū', c: '#5E3B22' }, { n: '1.er kyū', c: '#4A2E1A' }, { n: 'Shodan', c: '#16161B' }];
function estadoTema(id) {
  const t = P.tema(id); const u = t.ultimos; const prop = u.length ? u.reduce((a, b) => a + b, 0) / u.length : 0;
  const retos = u.length >= 8 && prop >= 0.8; const ej = Object.values(t.ejercicio).some(Boolean);
  return { prop, retos, ej, dominado: retos && ej, visto: t.intentos > 0 };
}
const dominados = () => D.temas.filter(t => estadoTema(t.id).dominado).length;
const temaActual = () => (D.temas.find(t => !estadoTema(t.id).dominado) || D.temas[D.temas.length - 1]);
function cuentaDia(k) { const d = P.d.dias[k]; return !!d && (d.retos >= 5 || d.foco >= 10); }
function racha() { let n = 0, k = cuentaDia(hoyClave()) ? 0 : 1; while (cuentaDia(diasAtras(k))) { n++; k++; } return n; }
function cinturon(i) { const c = CINTURONES[Math.min(i, 10)]; return h('span', { class: 'cinturon', style: `background:${c.c}`, title: c.n }); }
function pintaRango() {
  const i = dominados(); const r = racha();
  for (const id of ['rango-lateral', 'rango-cabecera']) {
    const el = $('#' + id); if (!el) continue; el.textContent = '';
    el.append(cinturon(i), h('span', null, CINTURONES[i].n), h('span', { class: 'insignia kihada num', title: 'Días seguidos practicando' }, `${r} ${r === 1 ? 'día' : 'días'}`));
  }
}

/* ───────────── Navegación ───────────── */
const ICONOS = {
  hoy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  retos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  ruta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/></svg>',
  lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>'
};
const VISTAS = [['hoy', 'Hoy'], ['retos', 'Retos'], ['ruta', 'Ruta'], ['lab', 'Laboratorio'], ['plan', 'Plan']];
let vista = 'hoy';
function pintaMenus() {
  for (const id of ['menu-lateral', 'menu-pestanas']) {
    const el = $('#' + id); el.textContent = '';
    for (const [v, n] of VISTAS) el.append(h('a', { href: '#' + v, 'aria-current': v === vista ? 'page' : null, html: ICONOS[v] + `<span>${n === 'Laboratorio' && id === 'menu-pestanas' ? 'Lab' : n}</span>` }));
  }
}
function ir(v) { if (location.hash !== '#' + v) location.hash = v; else mostrar(v); }
function mostrar(v) {
  if (!VISTAS.some(x => x[0] === v)) v = 'hoy';
  vista = v; pintaMenus();
  document.querySelectorAll('[data-vista]').forEach(s => { s.hidden = s.dataset.vista !== v; });
  PINTA[v](); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => mostrar(location.hash.slice(1)));
function repintar() { pintaRango(); pintaBandas(); PINTA[vista](); }

/* ───────────── La espera de Claude y el bloque de foco ───────────── */
let espera = ls.get('espera', null);       // { inicio, retos }
let foco = ls.get('foco', null);           // { inicio, minutos }
if (espera && Date.now() - espera.inicio > 90 * 60e3) { espera = null; ls.set('espera', null); }
if (foco && Date.now() - foco.inicio > (foco.minutos + 60) * 60e3) { foco = null; ls.set('foco', null); }
function empiezaEspera() {
  if (foco) { aviso('Estás en un bloque de foco: ahora toca no mirar a Claude.'); ir('retos'); return; }
  espera = { inicio: Date.now(), retos: P.dia().retos }; ls.set('espera', espera); pintaBandas(); ir('retos');
}
function terminaEspera(convertida) {
  if (!espera) return;
  const seg = Math.round((Date.now() - espera.inicio) / 1000), hechos = P.dia().retos - espera.retos;
  const d = P.dia(); if (convertida) { d.esperas++; d.segEspera += seg; } else d.perdidas++;
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
  const min = completo ? foco.minutos : Math.floor((Date.now() - foco.inicio) / 60e3);
  P.dia().foco += min; P.d.puntos += min * 2; P.cambio(); foco = null; ls.set('foco', null); pintaBandas(); pintaRango();
  aviso(min > 0 ? `Bloque de foco: ${min} min sumados. Ya puedes mirar qué hizo Claude.` : 'Bloque cancelado.');
  if (vista === 'hoy') PINTA.hoy();
}
function pintaBandas() {
  const el = $('#bandas'); el.textContent = '';
  if (foco) {
    el.append(h('div', { class: 'banda foco', role: 'status' },
      h('span', { class: 'reloj', id: 'reloj-foco' }, '--:--'),
      h('span', { class: 'texto' }, h('b', null, 'Bloque de foco'), ' · sin mirar a Claude. Lección y ejercicio del tema actual.'),
      h('button', { class: 'btn chico', onclick: () => terminaFoco(false) }, 'Terminar')));
  } else if (espera) {
    el.append(h('div', { class: 'banda espera', role: 'status' },
      h('span', { class: 'pulso', 'aria-hidden': 'true' }), h('span', { class: 'reloj', id: 'reloj-espera' }, '00:00'),
      h('span', { class: 'texto', id: 'texto-espera' }, 'Claude trabaja. Tú, retos.'),
      h('button', { class: 'btn chico lleno', onclick: () => terminaEspera(true) }, 'Claude ya respondió'),
      h('button', { class: 'btn chico', onclick: () => terminaEspera(false) }, 'Me distraje')));
  }
  tic();
}
function tic() {
  if (espera) {
    const r = $('#reloj-espera'); if (r) r.textContent = mmss((Date.now() - espera.inicio) / 1000);
    const t = $('#texto-espera'); const n = P.dia().retos - espera.retos;
    if (t) t.textContent = n > 0 ? `Claude trabaja · llevas ${n} ${n === 1 ? 'reto' : 'retos'} en esta espera` : 'Claude trabaja. Tú, retos.';
  }
  if (foco) {
    const quedan = foco.minutos * 60 - (Date.now() - foco.inicio) / 1000; const r = $('#reloj-foco');
    if (quedan <= 0) { terminaFoco(true); return; }
    if (r) r.textContent = mmss(quedan);
  }
}
setInterval(tic, 1000);

/* ───────────── Resaltado de código ───────────── */
const KW = {
  ps: new Set('algoritmo finalgoritmo proceso finproceso definir como entero real caracter cadena texto logico numero dimension escribir imprimir mostrar leer si entonces sino finsi mientras hacer finmientras para hasta con paso finpara repetir que segun finsegun de otro modo funcion finfuncion subproceso finsubproceso por referencia valor y o no mod sin saltar verdadero falso'.split(' ')),
  py: new Set('def return if elif else while for in and or not True False None break continue pass import from global'.split(' ')),
  cpp: new Set('int double float bool char string void auto vector if else while for do return break continue switch case default true false using namespace std const include'.split(' '))
};
const FN = { py: new Set('print input int float str len range abs round max min sum sorted list append upper lower split'.split(' ')), cpp: new Set('cout cin endl getline sqrt pow abs max min to_string push_back size length substr main'.split(' ')) };
const normaliza = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function resalta(linea, lang) {
  const re = lang === 'py' ? /(#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ſ][\wÀ-ſ]*)/g
    : /(\/\/.*$|^\s*#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ſ][\wÀ-ſ]*)/g;
  let out = '', ult = 0, m;
  while ((m = re.exec(linea))) {
    out += esc(linea.slice(ult, m.index)); ult = re.lastIndex;
    if (m[1]) out += `<span class="com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="nu">${m[3]}</span>`;
    else {
      const w = m[4]; const k = lang === 'ps' ? normaliza(w) : w;
      if (KW[lang].has(k)) out += `<span class="kw">${esc(w)}</span>`;
      else if ((FN[lang] && FN[lang].has(w)) || /^\s*\(/.test(linea.slice(ult))) out += `<span class="fn">${esc(w)}</span>`;
      else out += esc(w);
    }
    if (m[0] === '') re.lastIndex++;
  }
  return out + esc(linea.slice(ult));
}
function bloqueCodigo(codigo, lang, opts = {}) {
  const ol = h('ol');
  codigo.replace(/\n+$/, '').split('\n').forEach((l, i) => {
    let html = resalta(l, lang);
    if (opts.hueco && opts.hueco.i === i) { const a = l.slice(0, opts.hueco.pos), b = l.slice(opts.hueco.pos + opts.hueco.len); html = resalta(a, lang) + `<span class="hueco">${opts.relleno ? esc(opts.relleno) : '&nbsp;?&nbsp;'}</span>` + resalta(b, lang); }
    const li = h('li', { html: html || ' ' });
    if (opts.tocar) { li.classList.add('toca'); li.tabIndex = 0; li.setAttribute('role', 'button'); li.setAttribute('aria-label', 'Línea ' + (i + 1)); li.addEventListener('click', () => opts.tocar(i, li)); li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.tocar(i, li); } }); }
    ol.append(li);
  });
  return h('div', { class: 'codigo', 'aria-label': 'Código en ' + NL[lang] }, ol);
}
const salidaBloque = s => s === '' ? h('div', { class: 'salida vacia' }, '(no muestra nada)') : h('div', { class: 'salida' }, s);

/* ───────────── El tutor: Claude dentro de la página (opcional, con tu cuenta) ───────────── */
let sample = null, tutorApagado = false;
if (window.claude && window.claude.use) window.claude.use('sample').then(s => { sample = s; if (vista !== 'hoy') PINTA[vista](); }).catch(() => {});
const hayTutor = () => !!sample && !tutorApagado;
const REGLAS_TUTOR = 'Eres un profesor de programación paciente. Hablas en español sencillo, de tú, a alguien que está empezando. Frases cortas, sin saludos ni felicitaciones, sin formato Markdown (nada de asteriscos ni almohadillas). Solo cosas básicas de un primer curso.';
function botonTutor(texto, hacerPrompt) {
  if (!hayTutor()) return null;
  const caja = h('div', { class: 'tutor', hidden: true });
  const btn = h('button', { class: 'btn chico', onclick: async () => {
    btn.disabled = true; caja.hidden = false; caja.textContent = 'Pensando…';
    try {
      const { text } = await sample(hacerPrompt(), { modelTier: 'quick', onText: ({ text }) => { caja.textContent = text; } });
      caja.textContent = text;
    } catch (e) {
      if (e && (e.code === 'not_granted' || e.code === 'sampling_disabled' || e.code === 'not_declared' || e.code === 'capability_disabled')) { tutorApagado = true; caja.textContent = 'El tutor no está disponible aquí. Todo lo demás funciona igual.'; btn.remove(); return; }
      caja.textContent = e && e.code === 'rate_limited' ? 'Has usado mucho a Claude ahora mismo. Prueba en un rato.' : (e && e.text) || 'No se pudo preguntar. Prueba otra vez.';
    } finally { btn.disabled = false; }
  } }, texto);
  return h('div', { class: 'fila', style: 'flex-direction:column;align-items:stretch;gap:8px' }, h('div', { class: 'fila' }, btn, h('span', { class: 'tenue', style: 'font-size:12.5px' }, 'Usa tu cuenta de Claude')), caja);
}

/* ───────────── HOY ───────────── */
const PINTA = {};
PINTA.hoy = function () {
  const el = $('#v-hoy'); el.textContent = '';
  const d = P.dia(), meta = P.d.ajustes.meta, t = temaActual(), et = estadoTema(t.id), i = dominados();
  const portada = h('div', { class: 'portada' },
    h('span', { class: 'kanji', 'aria-hidden': 'true' }, '道'),
    h('span', { class: 'etiqueta', style: 'color:inherit;opacity:.8' }, espera ? 'Claude está trabajando' : foco ? 'Bloque de foco en marcha' : 'Tu regla'),
    h('h1', null, espera ? 'Sigue con los retos hasta que responda' : foco ? 'Ahora toca escribir código' : '¿Le acabas de escribir a Claude?'),
    h('p', null, espera ? 'Cuando Claude termine, toca «Claude ya respondió» arriba y vuelve con él.' : foco ? 'Abre la lección del tema actual y resuelve el ejercicio en el laboratorio.' : 'Mientras trabaja, haz retos de 30 segundos aquí en vez de abrir TikTok. Cuando responda, vuelves con él.'),
    espera ? h('button', { class: 'btn primario grande', onclick: () => ir('retos') }, 'Seguir con los retos')
      : foco ? h('button', { class: 'btn primario grande', onclick: () => abrirTema(t.id) }, 'Abrir la lección')
      : h('button', { class: 'btn primario grande', onclick: empiezaEspera }, 'Sí · empezar retos'));
  const mins = Math.round(d.segEspera / 60);
  const metricas = h('div', { class: 'metricas' },
    h('div', { class: 'metrica' }, h('span', { class: 'etiqueta' }, 'Retos hoy'), h('b', null, `${d.retos}`, h('small', null, ` / ${meta}`)), h('div', { class: 'barra' }, h('i', { style: `width:${Math.min(100, d.retos / meta * 100)}%` })), h('small', null, d.retos ? `${Math.round(d.aciertos / d.retos * 100)} % de aciertos` : 'Empieza por uno')),
    h('div', { class: 'metrica' }, h('span', { class: 'etiqueta' }, 'Foco hoy'), h('b', null, `${d.foco}`, h('small', null, ` / ${P.d.ajustes.foco} min`)), h('div', { class: 'barra kihada' }, h('i', { style: `width:${Math.min(100, d.foco / P.d.ajustes.foco * 100)}%` })), h('small', null, 'Escribir código sin Claude')),
    h('div', { class: 'metrica' }, h('span', { class: 'etiqueta' }, 'Esperas'), h('b', null, `${d.esperas}`, h('small', null, d.perdidas ? ` · ${d.perdidas} a TikTok` : ' aprovechadas')), h('div', { class: 'barra bien' }, h('i', { style: `width:${d.esperas + d.perdidas ? d.esperas / (d.esperas + d.perdidas) * 100 : 0}%` })), h('small', null, mins ? `${mins} min convertidos en práctica` : 'Cada espera cuenta')));
  const cint = CINTURONES[i];
  const rango = h('div', { class: 'tarjeta' },
    h('div', { class: 'entre' }, h('div', { class: 'fila' }, cinturon(i), h('h2', { style: 'font-size:18px' }, cint.n)), h('span', { class: 'insignia num' }, `${P.d.puntos} puntos`)),
    i >= 10 ? h('p', null, 'Dominaste los 10 temas. Ya sabes lo básico de los tres lenguajes: toca hacer un proyecto pequeño tuyo.')
      : h('p', { class: 'tenue' }, `Para el siguiente cinturón domina «${t.titulo}»: acierta 8 de los últimos 10 retos del tema y resuelve su ejercicio en el laboratorio.`),
    i < 10 ? h('div', { class: 'fila', style: 'gap:14px' },
      h('div', { style: 'flex:1 1 200px;display:grid;gap:6px' }, h('small', { class: 'tenue' }, `Retos del tema: ${Math.round(et.prop * 100)} % de los últimos ${P.tema(t.id).ultimos.length || 0}`), h('div', { class: 'barra' }, h('i', { style: `width:${Math.round(et.prop * 100)}%` }))),
      h('span', { class: 'insignia ' + (et.ej ? 'bien' : '') }, et.ej ? 'Ejercicio resuelto' : 'Falta el ejercicio'),
      h('button', { class: 'btn chico', onclick: () => abrirTema(t.id) }, 'Ver la lección')) : null);
  const focoT = foco ? null : h('div', { class: 'tarjeta' },
    h('div', { class: 'entre' }, h('h2', { style: 'font-size:18px' }, `Bloque de foco · ${P.d.ajustes.foco} min`), h('span', { class: 'insignia kihada' }, 'Una vez al día')),
    h('p', { class: 'tenue' }, 'Las esperas sirven para repasar; lo nuevo se aprende escribiendo código con calma. Antes de empezar, dale a Claude una tarea grande y entera (una parte completa), para que trabaje solo todo el bloque y no tengas que mirarlo.'),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: empiezaFoco }, 'Empezar el bloque'), h('button', { class: 'btn plano', onclick: () => ir('plan') }, 'Por qué funciona')));
  const semana = h('div', { class: 'semana', role: 'img', 'aria-label': 'Retos de los últimos 7 días' });
  const vals = []; for (let k = 6; k >= 0; k--) vals.push({ k: diasAtras(k), n: (P.d.dias[diasAtras(k)] || {}).retos || 0 });
  const tope = Math.max(meta, ...vals.map(v => v.n));
  const letras = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  vals.forEach((v, j) => { const dt = new Date(v.k + 'T12:00'); semana.append(h('div', { class: 'dia' + (j === 6 ? ' hoy' : ''), title: `${v.n} retos` }, h('span', { class: v.n >= meta ? 'lleno' : '', style: `height:${Math.max(3, v.n / tope * 100)}%` }), letras[dt.getDay()])); });
  const sem = h('div', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', { style: 'font-size:18px' }, 'Tu semana'), h('span', { class: 'tenue', style: 'font-size:13px' }, `Racha: ${racha()} ${racha() === 1 ? 'día' : 'días'} (5 retos o 10 min de foco)`)), semana);
  el.append(h('div', { class: 'columna' }, portada, metricas, rango, focoT, sem));
};

/* ───────────── RETOS ───────────── */
let reto = null, respondido = false, elegida = null, armado = [], resultadoOrden = null, ultimaPlantilla = null;
const azar = arr => arr[Math.floor(Math.random() * arr.length)];
function tipoAlAzar() { const w = [['salida', 35], ['hueco', 20], ['ordenar', 15], ['error', 15], ['traducir', 15]]; let x = Math.random() * 100; for (const [t, p] of w) { if ((x -= p) < 0) return t; } return 'salida'; }
function elegirSpec() {
  const aj = P.d.ajustes, n = P.dia().retos, hoy = hoyClave();
  const k = P.d.repaso.findIndex(x => x.dia < hoy || x.desde <= n);
  if (k >= 0 && Math.random() < 0.5) { const s = P.d.repaso.splice(k, 1)[0]; P.cambio(); return { tpl: s.tpl, lang: s.lang, tipo: s.tipo, seed: s.seed, repaso: true }; }
  const actual = D.temas.indexOf(temaActual());
  let temaId;
  if (aj.tema === 'todo') temaId = D.temas[Math.floor(Math.random() * (actual + 1))].id;
  else if (aj.tema && aj.tema !== 'auto') temaId = aj.tema;
  else temaId = actual > 0 && Math.random() < 0.3 ? D.temas[Math.floor(Math.random() * actual)].id : D.temas[actual].id;
  const langs = aj.lang === 'mezcla' ? LANGS : [aj.lang];
  let cands = D.plantillas.filter(t => t.tema === temaId && D.langsDe(t).some(l => langs.includes(l)));
  if (!cands.length) cands = D.plantillas.filter(t => t.tema === temaId);
  let t = azar(cands); if (t.id === ultimaPlantilla && cands.length > 1) t = azar(cands.filter(x => x.id !== ultimaPlantilla));
  ultimaPlantilla = t.id;
  const ok = D.langsDe(t).filter(l => langs.includes(l));
  return { tpl: t.id, lang: azar(ok.length ? ok : D.langsDe(t)), tipo: P.tema(temaId).intentos < 3 ? 'salida' : tipoAlAzar(), seed: Math.floor(Math.random() * 2147483647) };
}
function nuevoReto() {
  const spec = elegirSpec();
  try { reto = D.generar(spec); } catch (e) { reto = D.generar(Object.assign({}, spec, { tipo: 'salida' })); }
  reto.repaso = !!spec.repaso; respondido = false; elegida = null; armado = []; resultadoOrden = null;
}
function registra(ok) {
  const antes = dominados(), d = P.dia();
  d.retos++; if (ok) d.aciertos++;
  const t = P.tema(reto.tema); t.intentos++; if (ok) t.aciertos++; t.ultimos.push(ok ? 1 : 0); if (t.ultimos.length > 10) t.ultimos.shift();
  P.d.puntos += ok ? 10 : 2;
  if (!ok) { P.d.repaso.push({ tpl: reto.spec.tpl, lang: reto.lang, tipo: reto.tipo, seed: (reto.spec.seed + 104729) % 2147483647, desde: d.retos + 3, dia: hoyClave() }); P.d.repaso = P.d.repaso.slice(-30); }
  P.cambio(); pintaRango(); tic();
  const ahora = dominados();
  if (ahora > antes) aviso(`¡Nuevo cinturón: ${CINTURONES[ahora].n}!`, 5000);
  else if (d.retos === P.d.ajustes.meta) aviso(`Meta de hoy cumplida: ${d.retos} retos.`);
}
function responde(k) {
  if (respondido || !reto) return;
  respondido = true; elegida = k; registra(k === reto.correcta); PINTA.retos();
}
function letraOpcion(k) { return h('span', { class: 'letra', 'aria-hidden': 'true' }, String(k + 1)); }
function opcionesTexto(textos, vacio) {
  const g = h('div', { class: 'opciones' + (textos.some(t => t.length > 28 || t.split('\n').length > 3) ? ' una' : '') });
  textos.forEach((tx, k) => {
    const b = h('button', { class: 'opcion', disabled: respondido || null, onclick: () => responde(k) }, letraOpcion(k), tx === '' && vacio ? h('pre', { class: 'tenue', style: 'font-family:var(--f-texto);font-style:italic' }, vacio) : h('pre', null, tx));
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
  if (r.tipo === 'salida') {
    partes.push(h('h2', null, '¿Qué muestra este programa?'), chipsEntradas(), bloqueCodigo(r.codigo, l), opcionesTexto(r.opciones, '(no muestra nada)'));
  } else if (r.tipo === 'hueco') {
    partes.push(h('h2', null, '¿Qué va en el hueco?'), h('p', { class: 'tenue' }, 'Para que el programa muestre exactamente esto:'), salidaBloque(r.salida), chipsEntradas(),
      bloqueCodigo(r.codigo, l, { hueco: r.hueco, relleno: respondido ? r.opciones[elegida] : null }), opcionesTexto(r.opciones));
  } else if (r.tipo === 'ordenar') {
    const quedan = r.piezas.map((t, k) => k).filter(k => !armado.includes(k));
    const zona = h('div', { class: 'armado', 'aria-label': 'Tu programa' }, ...armado.map((k, j) => h('button', { class: 'pieza', disabled: respondido || null, title: 'Quitar', onclick: () => { armado.splice(j, 1); PINTA.retos(); } }, r.piezas[k])));
    const piezas = h('div', { class: 'piezas' }, ...quedan.map(k => h('button', { class: 'pieza', onclick: () => { armado.push(k); PINTA.retos(); } }, r.piezas[k])));
    partes.push(h('h2', null, 'Ordena las líneas'), h('p', { class: 'tenue' }, 'Arma el programa para que muestre exactamente esto:'), salidaBloque(r.salida), chipsEntradas(),
      h('span', { class: 'etiqueta' }, 'Tu programa'), zona);
    if (!respondido) partes.push(quedan.length ? h('span', { class: 'etiqueta' }, 'Líneas sueltas') : null, piezas,
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
    const g = h('div', { class: 'opciones una' });
    r.opciones.forEach((cod, k) => {
      const b = h('button', { class: 'opcion', disabled: respondido || null, onclick: () => responde(k) }, letraOpcion(k), bloqueCodigo(cod, l));
      if (respondido) { if (k === r.correcta) b.classList.add('correcta'); else if (k === elegida) b.classList.add('fallada'); }
      g.append(b);
    });
    partes.push(g);
  }
  return partes;
}
function respuestaReto() {
  const r = reto, ok = elegida === r.correcta;
  const caja = h('div', { class: 'respuesta ' + (ok ? 'si' : 'no'), role: 'status' }, h('h3', null, ok ? 'Correcto' : r.tipo === 'ordenar' ? 'Ese orden no da lo mismo' : 'No era esa'));
  if (r.tipo === 'error') {
    caja.append(h('p', null, `El error está en la línea ${r.lineaMal + 1}. ${r.explicaError}`), h('p', { class: 'tenue' }, `El Dojo lo avisaría así: «${r.mensajeMotor}»`));
  } else if (r.tipo === 'ordenar') {
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
  const et = estadoTema(r.tema);
  if (et.retos && !et.ej) caja.append(h('p', { class: 'insignia kihada', style: 'white-space:normal' }, `Ya dominas los retos de «${D.temas.find(t => t.id === r.tema).titulo}». Para subir de cinturón falta su ejercicio de escribir código.`));
  const codigoLab = D.completo(r.tipo === 'error' ? r.codigoMal : r.codigo, r.lang);
  const tutor = botonTutor('Explícamelo mejor', () => `${REGLAS_TUTOR}\n\nExplica en 3 a 5 frases cortas ${r.tipo === 'error' ? 'dónde está el error de este programa y por qué es un error' : 'por qué este programa muestra exactamente lo que muestra'}. Ve paso a paso con los valores reales.\n\nLenguaje: ${NL[r.lang]}\nPrograma:\n${r.tipo === 'error' ? r.codigoMal : r.codigo}\n${r.entradas.length ? '\nEl usuario escribe: ' + r.entradas.join(', ') + '\n' : ''}\n${r.tipo === 'error' ? 'El error está en la línea ' + (r.lineaMal + 1) + ': ' + r.explicaError : 'Lo que muestra de verdad:\n' + (r.salida || '(nada)')}\n\nEl alumno ${ok ? 'acertó' : 'se equivocó'}.`);
  caja.append(h('div', { class: 'fila' },
    h('button', { class: 'btn primario', id: 'siguiente', onclick: () => { nuevoReto(); PINTA.retos(); } }, 'Siguiente reto'),
    h('button', { class: 'btn', onclick: () => abrirLab({ lang: r.lang, codigo: codigoLab, entradas: r.entradas }) }, 'Probarlo en el laboratorio')));
  if (tutor) caja.append(tutor);
  return caja;
}
PINTA.retos = function () {
  const el = $('#v-retos'); el.textContent = '';
  if (!reto) nuevoReto();
  const aj = P.d.ajustes;
  const chipLang = (v, n) => h('button', { class: 'chip', 'aria-pressed': aj.lang === v ? 'true' : 'false', onclick: () => { aj.lang = v; P.cambio(); if (!respondido) nuevoReto(); PINTA.retos(); } }, n);
  const sel = h('select', { class: 'campo', id: 'tema-retos', 'aria-label': 'Tema de los retos', onchange: e => { aj.tema = e.target.value; P.cambio(); nuevoReto(); PINTA.retos(); } },
    h('option', { value: 'auto' }, `Tu tema actual (${temaActual().titulo})`), h('option', { value: 'todo' }, 'Repaso de todo lo visto'),
    ...D.temas.map((t, k) => h('option', { value: t.id }, `${k + 1}. ${t.titulo}`)));
  sel.value = aj.tema || 'auto';
  const r = reto, d = P.dia();
  const tarjeta = h('article', { class: 'tarjeta reto', 'aria-live': 'polite' },
    h('div', { class: 'reto-cab' }, h('span', { class: 'etiqueta' }, D.NOMBRE_TIPO[r.tipo]),
      h('span', { class: 'fila', style: 'gap:6px' }, r.repaso ? h('span', { class: 'insignia kihada' }, 'Repaso') : null, h('span', { class: 'insignia' }, D.temas.find(t => t.id === r.tema).titulo), h('span', { class: 'insignia ai' }, NL[r.lang]))),
    ...cuerpoReto(), respondido ? respuestaReto() : null);
  el.append(h('div', { class: 'columna' },
    h('div', { class: 'entre' }, h('div', { class: 'chips', role: 'group', 'aria-label': 'Lenguaje' }, chipLang('mezcla', 'Los tres'), chipLang('ps', 'PSeInt'), chipLang('py', 'Python'), chipLang('cpp', 'C++')), sel),
    tarjeta,
    h('div', { class: 'entre' }, h('span', { class: 'tenue num', style: 'font-size:13.5px' }, `Hoy: ${d.retos} ${d.retos === 1 ? 'reto' : 'retos'}${d.retos ? ` · ${Math.round(d.aciertos / d.retos * 100)} % de aciertos` : ''}`),
      h('span', { class: 'atajos' }, 'Teclado: 1 a 4 para responder · Enter para el siguiente'))));
  if (respondido) { const s = $('#siguiente'); if (s && document.activeElement && document.activeElement.closest && document.activeElement.closest('#v-retos')) s.focus({ preventScroll: true }); }
};
document.addEventListener('keydown', e => {
  if (vista !== 'retos' || !reto || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (!respondido && /^[1-9]$/.test(e.key) && reto.opciones && reto.tipo !== 'ordenar' && reto.tipo !== 'error') { const k = +e.key - 1; if (k < reto.opciones.length) { e.preventDefault(); responde(k); } }
  else if (respondido && e.key === 'Enter' && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); nuevoReto(); PINTA.retos(); }
});

/* ───────────── RUTA ───────────── */
let temaAbierto = null, langEjemplo = ls.get('lang-ejemplo', 'py');
function abrirTema(id) { temaAbierto = id; if (vista === 'ruta') PINTA.ruta(); else ir('ruta'); }
PINTA.ruta = function () {
  const el = $('#v-ruta'); el.textContent = '';
  if (temaAbierto) { el.append(detalleTema(D.temas.find(t => t.id === temaAbierto))); return; }
  const actual = temaActual();
  const lista = D.temas.map((t, k) => {
    const e = estadoTema(t.id), tm = P.tema(t.id);
    const estado = e.dominado ? 'Dominado' : t === actual ? 'Tu tema ahora' : e.visto ? 'Empezado' : 'Por ver';
    return h('button', { class: 'tema' + (e.dominado ? ' hecho' : t === actual ? ' actual' : ''), onclick: () => abrirTema(t.id) },
      h('span', { class: 'n' }, e.dominado ? '✓' : String(k + 1)),
      h('span', { class: 'detalle' }, h('b', null, t.titulo), h('span', { class: 'tenue', style: 'font-size:13.5px' }, t.corto),
        h('span', { class: 'fila', style: 'gap:10px' }, h('span', { class: 'barra', style: 'flex:1 1 120px' }, h('i', { style: `width:${Math.round(e.prop * 100)}%` })), h('small', { class: 'tenue num' }, tm.ultimos.length ? `${Math.round(e.prop * 100)} %` : ''))),
      h('span', { class: 'fila', style: 'flex-direction:column;align-items:flex-end;gap:6px' }, h('span', { class: 'insignia' + (e.dominado ? ' bien' : t === actual ? ' ai' : '') }, estado),
        h('span', { class: 'tenue', style: 'font-size:12px' }, LANGS.filter(l => tm.ejercicio[l]).map(l => NL[l]).join(' · ') || (e.retos ? 'Falta el ejercicio' : ''))));
  });
  const htmlHechas = D.html.filter(x => P.d.html[x.id]).length;
  el.append(h('div', { class: 'columna' },
    h('div', { class: 'tarjeta' }, h('h1', { style: 'font-size:24px' }, 'La ruta'),
      h('p', { class: 'tenue' }, 'Diez temas en orden. Cada uno explica una idea una sola vez y la enseña en los tres lenguajes a la vez: así aprendes la lógica (PSeInt) y ves cómo se escribe en Python y en C++. Cada tema dominado es un cinturón nuevo.'),
      h('p', { class: 'tenue', style: 'font-size:13.5px' }, 'Dominar un tema = acertar 8 de los últimos 10 retos del tema y resolver su ejercicio en el laboratorio, en el lenguaje que quieras.')),
    ...lista,
    h('div', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', { style: 'font-size:18px' }, 'Rama extra: HTML'), h('span', { class: 'insignia' + (htmlHechas === 3 ? ' bien' : '') }, `${htmlHechas} de 3`)),
      h('p', { class: 'tenue' }, 'Tres lecciones cortas para hacer tu primera página web. No es programación, pero se aprende en una tarde y ves el resultado al momento.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => abrirLab({ lang: 'html' }) }, 'Abrir la rama de HTML')))));
};
function detalleTema(t) {
  const k = D.temas.indexOf(t), e = estadoTema(t.id), tm = P.tema(t.id);
  const pestanas = h('div', { class: 'chips', role: 'tablist', 'aria-label': 'Lenguaje del ejemplo' });
  const zona = h('div', { style: 'display:grid;gap:10px;min-width:0' });
  const pintaEjemplo = () => {
    pestanas.textContent = ''; zona.textContent = '';
    LANGS.forEach(l => pestanas.append(h('button', { class: 'chip', role: 'tab', 'aria-selected': l === langEjemplo ? 'true' : 'false', 'aria-pressed': l === langEjemplo ? 'true' : 'false', onclick: () => { langEjemplo = l; ls.set('lang-ejemplo', l); pintaEjemplo(); } }, NL[l])));
    const ent = { leer: ['16'], decisiones: ['7'] }[t.id] || [];
    const res = M.correr(t.ejemplo[langEjemplo], langEjemplo, ent);
    zona.append(bloqueCodigo(t.ejemplo[langEjemplo], langEjemplo),
      h('span', { class: 'etiqueta' }, ent.length ? `Lo que muestra (si el usuario escribe ${ent.join(', ')})` : 'Lo que muestra'), salidaBloque(D.limpia(res.salida)),
      h('div', { class: 'fila' }, h('button', { class: 'btn', onclick: () => abrirLab({ lang: langEjemplo, codigo: t.ejemplo[langEjemplo] }) }, 'Abrir en el laboratorio')));
  };
  pintaEjemplo();
  const botonesEj = LANGS.map(l => h('button', { class: 'btn' + (l === langEjemplo ? ' primario' : ''), onclick: () => abrirLab({ lang: l, ejercicio: t.id }) }, tm.ejercicio[l] ? `${NL[l]} ✓` : `Resolver en ${NL[l]}`));
  return h('div', { class: 'columna' },
    h('div', null, h('button', { class: 'btn plano', onclick: () => { temaAbierto = null; PINTA.ruta(); } }, '← Todos los temas')),
    h('div', { class: 'tarjeta' },
      h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Tema ${k + 1} de 10`), h('span', { class: 'insignia' + (e.dominado ? ' bien' : '') }, e.dominado ? 'Dominado' : `Retos: ${Math.round(e.prop * 100)} %`)),
      h('h1', { style: 'font-size:26px' }, t.titulo), ...t.idea.map(p => h('p', null, p))),
    h('div', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', { style: 'font-size:18px' }, 'El mismo programa en los tres'), pestanas), zona),
    h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:18px' }, 'Lo que cambia entre lenguajes'), h('ul', { class: 'lista' }, ...t.diferencias.map(d => h('li', null, d)))),
    h('div', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', { style: 'font-size:18px' }, 'Ejercicio: escríbelo tú'), h('span', { class: 'insignia' + (e.ej ? ' bien' : ' kihada') }, e.ej ? 'Resuelto' : 'Pendiente')),
      h('p', { style: 'white-space:pre-line' }, t.ejercicio.enunciado), h('div', { class: 'fila' }, ...botonesEj),
      h('p', { class: 'tenue', style: 'font-size:13px' }, 'Escríbelo sin copiar el ejemplo. Si te atascas, ejecuta, lee el error y pide una pista.')),
    h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:18px' }, 'Practicar este tema'), h('p', { class: 'tenue' }, 'Retos solo de este tema, en los tres lenguajes, hasta que lo domines.'),
      h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => { P.d.ajustes.tema = t.id; P.cambio(); nuevoReto(); ir('retos'); } }, 'Retos de este tema'),
        P.d.ajustes.tema === t.id ? h('button', { class: 'btn plano', onclick: () => { P.d.ajustes.tema = 'auto'; P.cambio(); nuevoReto(); aviso('Los retos vuelven a seguir tu tema actual.'); } }, 'Volver al tema automático') : null)));
}

/* ───────────── LABORATORIO ───────────── */
const lab = { lang: ls.get('lab-lang', 'py'), ejercicio: null, html: ls.get('lab-html', 'html-1') };
let editor = null, resultados = null, ultimoFallo = null;
const claveBorrador = () => lab.lang === 'html' ? 'html-' + lab.html : lab.ejercicio ? `ej-${lab.ejercicio}-${lab.lang}` : 'libre-' + lab.lang;
const INICIO_LIBRE = {
  ps: 'Algoritmo MiPrograma\n    Escribir "Hola desde PSeInt"\nFinAlgoritmo\n',
  py: 'nombre = input("¿Cómo te llamas? ")\nprint("Hola,", nombre)\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hola desde C++" << endl;\n    return 0;\n}\n'
};
function codigoInicial() {
  const b = ls.get('borrador-' + claveBorrador(), null); if (b !== null) return b;
  if (lab.lang === 'html') return D.html.find(x => x.id === lab.html).inicio;
  if (lab.ejercicio) return D.temas.find(t => t.id === lab.ejercicio).ejercicio.inicio[lab.lang];
  return INICIO_LIBRE[lab.lang];
}
function abrirLab(o) {
  lab.lang = o.lang || lab.lang; lab.ejercicio = o.ejercicio || null; ls.set('lab-lang', lab.lang);
  if (o.codigo) ls.set('borrador-' + claveBorrador(), o.codigo);
  resultados = null; ultimoFallo = null; ir('lab'); if (vista === 'lab') PINTA.lab();
}
const ABRE_BLOQUE = { py: /:\s*$/, cpp: /\{\s*$/, ps: /(\bEntonces|\bHacer|^\s*Repetir|^\s*SiNo|^\s*Algoritmo\b.*|^\s*(Funcion|SubProceso)\b.*|:)\s*$/i, html: /<(ul|ol|div|section|body|head|style)[^>]*>\s*$/i };
function crearEditor(valor, lang) {
  const num = h('div', { class: 'numeros', 'aria-hidden': 'true' });
  const ta = h('textarea', { id: 'editor-codigo', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-label': 'Tu código en ' + (NL[lang] || 'HTML') });
  ta.value = valor; let marcada = 0;
  const nums = () => { const n = ta.value.split('\n').length; num.innerHTML = Array.from({ length: n }, (_, i) => i + 1 === marcada ? `<span class="err">${i + 1}</span>` : String(i + 1)).join('\n'); num.scrollTop = ta.scrollTop; };
  const mete = (txt, a, b) => { ta.setRangeText(txt, a, b, 'end'); ta.dispatchEvent(new Event('input')); };
  ta.addEventListener('input', () => { marcada = 0; nums(); ls.set('borrador-' + claveBorrador(), ta.value); if (lang === 'html') vistaHtmlLuego(); });
  ta.addEventListener('scroll', () => { num.scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', e => {
    const a = ta.selectionStart, b = ta.selectionEnd;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (lang !== 'html') ejecutar(); return; }
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); mete('    ', a, b); return; }
    if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); const ini = ta.value.lastIndexOf('\n', a - 1) + 1; const q = /^ {1,4}/.exec(ta.value.slice(ini))?.[0].length || 0; if (q) { ta.setRangeText('', ini, ini + q, 'preserve'); ta.selectionStart = ta.selectionEnd = Math.max(ini, a - q); ta.dispatchEvent(new Event('input')); } return; }
    if (e.key === 'Enter' && !e.shiftKey && a === b) {
      e.preventDefault(); const ini = ta.value.lastIndexOf('\n', a - 1) + 1; const lin = ta.value.slice(ini, a);
      let sang = /^\s*/.exec(lin)[0]; if (ABRE_BLOQUE[lang] && ABRE_BLOQUE[lang].test(lin)) sang += '    ';
      mete('\n' + sang, a, b);
    }
  });
  nums();
  return { el: h('div', { class: 'editor' }, num, ta), ta, marca: l => { marcada = l; nums(); } };
}
function pintaConsola(caja, ej, r) {
  caja.textContent = '';
  for (const ev of ej.eventos) caja.append(ev.t === 'out' ? document.createTextNode(ev.s) : h('span', { class: 'in' }, ev.s + '\n'));
  if (r.estado === 'pide') {
    const inp = h('input', { 'aria-label': 'Escribe el dato y pulsa Enter', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'send' });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); pintaConsola(caja, ej, ej.avanzar(inp.value)); } });
    caja.append(inp, h('div', { class: 'fin' }, 'El programa espera un dato: escríbelo y pulsa Enter.'));
    setTimeout(() => inp.focus({ preventScroll: true }), 0);
  } else if (r.estado === 'error') {
    const er = r.error; ultimoFallo = { tipo: 'error', linea: er.linea, mensaje: er.message, pista: er.pista };
    if (editor && er.linea) editor.marca(er.linea);
    caja.append(h('div', { class: 'err' }, h('b', null, er.linea ? `Línea ${er.linea}: ` : 'Error: '), er.message, er.pista ? h('div', { class: 'tenue', style: 'margin-top:4px' }, er.pista) : null));
    pintaPistaLab();
  } else {
    ultimoFallo = null;
    if (!ej.eventos.length) caja.append(h('div', { class: 'fin' }, '(El programa terminó sin mostrar nada.)'));
    else caja.append(h('div', { class: 'fin' }, '— fin del programa —'));
  }
}
function ejecutar() { const caja = $('#consola'); if (!caja || !editor) return; const ej = M.crear(editor.ta.value, lab.lang); pintaConsola(caja, ej, ej.avanzar()); }
function comprobar() {
  const t = D.temas.find(x => x.id === lab.ejercicio); if (!t || !editor) return;
  resultados = D.compruebaEjercicio(editor.ta.value, lab.lang, t.ejercicio.pruebas);
  const todos = resultados.every(r => r.ok); const tm = P.tema(t.id);
  if (todos) {
    const antes = dominados(); const nuevo = !tm.ejercicio[lab.lang];
    tm.ejercicio[lab.lang] = true; if (nuevo) P.d.puntos += 50; P.cambio(); pintaRango();
    const ahora = dominados();
    aviso(ahora > antes ? `¡Ejercicio resuelto y nuevo cinturón: ${CINTURONES[ahora].n}!` : nuevo ? `Ejercicio resuelto en ${NL[lab.lang]}: +50 puntos.` : 'Sigue funcionando. Bien.', 5000);
    ultimoFallo = null;
  } else {
    const f = resultados.find(r => !r.ok);
    ultimoFallo = f.error ? { tipo: 'error', linea: f.error.linea, mensaje: f.error.message } : { tipo: 'prueba', entradas: f.entradas, esperado: f.esperado, salida: f.salida };
    if (f.error && f.error.linea) editor.marca(f.error.linea);
  }
  pintaResultados(); pintaPistaLab();
}
function pintaResultados() {
  const caja = $('#resultados'); if (!caja) return; caja.textContent = '';
  if (!resultados) return;
  const todos = resultados.every(r => r.ok);
  caja.append(h('p', null, h('b', null, todos ? 'Todas las pruebas pasan.' : `Pasan ${resultados.filter(r => r.ok).length} de ${resultados.length} pruebas.`), todos ? ' Ejercicio resuelto.' : ' Mira la que falla:'));
  resultados.forEach((r, k) => caja.append(h('div', { class: 'prueba ' + (r.ok ? 'si' : 'no') },
    h('b', null, `${r.ok ? '✓' : '✗'} Prueba ${k + 1}`, r.entradas.length ? h('span', { class: 'tenue', style: 'font-weight:400' }, ` · el usuario escribe: ${r.entradas.join(', ')}`) : null),
    r.ok ? null : h('div', null, h('span', { class: 'etiqueta' }, 'Esperaba'), h('pre', null, r.esperado)),
    r.ok ? null : h('div', null, h('span', { class: 'etiqueta' }, r.error ? 'Error' : 'Salió'), h('pre', null, r.error ? `Línea ${r.error.linea}: ${r.error.message}` : (r.salida || '(nada)'))))));
}
function pintaPistaLab() {
  const caja = $('#pista-lab'); if (!caja) return; caja.textContent = '';
  if (!editor) return;
  const t = lab.ejercicio ? D.temas.find(x => x.id === lab.ejercicio) : null;
  const b = botonTutor(ultimoFallo ? 'Pedir una pista' : 'Que revise mi código', () => {
    let estado = 'El código funciona sin errores.';
    if (ultimoFallo && ultimoFallo.tipo === 'error') estado = `Da un error en la línea ${ultimoFallo.linea}: ${ultimoFallo.mensaje}`;
    else if (ultimoFallo && ultimoFallo.tipo === 'prueba') estado = `Una prueba falla. ${ultimoFallo.entradas.length ? 'El usuario escribe: ' + ultimoFallo.entradas.join(', ') + '. ' : ''}Se esperaba:\n${ultimoFallo.esperado}\nY salió:\n${ultimoFallo.salida || '(nada)'}`;
    return `${REGLAS_TUTOR}\n\n${t ? 'El ejercicio es:\n' + t.ejercicio.enunciado + '\n\n' : ''}Lenguaje: ${NL[lab.lang]}\nSu código:\n${editor.ta.value}\n\nResultado: ${estado}\n\nDale UNA pista concreta, de 2 a 4 frases, para que encuentre el problema por sí mismo. No escribas el código resuelto ni la línea corregida completa. Si el código ya está bien, díselo y sugiere una mejora pequeña.`;
  });
  if (b) caja.append(b);
}
let reinicioArmado = false;
PINTA.lab = function () {
  const el = $('#v-lab'); el.textContent = ''; reinicioArmado = false;
  const tabs = h('div', { class: 'chips', role: 'tablist', 'aria-label': 'Lenguaje' }, ...[...LANGS, 'html'].map(l => h('button', { class: 'chip', role: 'tab', 'aria-selected': lab.lang === l ? 'true' : 'false', 'aria-pressed': lab.lang === l ? 'true' : 'false', onclick: () => { lab.lang = l; ls.set('lab-lang', l); resultados = null; ultimoFallo = null; PINTA.lab(); } }, l === 'html' ? 'HTML' : NL[l])));
  if (lab.lang === 'html') { el.append(h('div', { class: 'columna' }, tabs, ...pintaHtml())); return; }
  editor = crearEditor(codigoInicial(), lab.lang);
  const t = lab.ejercicio ? D.temas.find(x => x.id === lab.ejercicio) : null;
  const cab = t ? h('div', { class: 'tarjeta' },
      h('div', { class: 'entre' }, h('span', { class: 'etiqueta' }, `Ejercicio · tema ${D.temas.indexOf(t) + 1}: ${t.titulo}`), P.tema(t.id).ejercicio[lab.lang] ? h('span', { class: 'insignia bien' }, `Resuelto en ${NL[lab.lang]}`) : null),
      h('p', { style: 'white-space:pre-line' }, t.ejercicio.enunciado),
      h('div', { class: 'fila' }, h('button', { class: 'btn plano', onclick: () => abrirTema(t.id) }, 'Ver la lección'), h('button', { class: 'btn plano', onclick: () => { lab.ejercicio = null; resultados = null; PINTA.lab(); } }, 'Salir al espacio libre')))
    : h('div', { class: 'tarjeta' }, h('h1', { style: 'font-size:22px' }, 'Laboratorio'),
      h('p', { class: 'tenue' }, `Espacio libre para escribir ${NL[lab.lang]} y ejecutarlo aquí mismo, sin instalar nada. Si el programa pide datos, los escribes en la consola. Para un ejercicio con corrección, entra en un tema de la Ruta.`),
      h('p', { class: 'tenue', style: 'font-size:13px' }, 'Este laboratorio entiende lo de un primer curso (variables, decisiones, bucles, arreglos, funciones y texto). Para programas grandes, instala el lenguaje en tu PC.'));
  const reiniciar = h('button', { class: 'btn', onclick: () => {
    if (!reinicioArmado) { reinicioArmado = true; reiniciar.textContent = '¿Seguro? Toca otra vez'; setTimeout(() => { reinicioArmado = false; reiniciar.textContent = 'Volver a empezar'; }, 3000); return; }
    ls.set('borrador-' + claveBorrador(), null); try { localStorage.removeItem('dojo-borrador-' + claveBorrador()); } catch (e) { /* nada */ } PINTA.lab();
  } }, 'Volver a empezar');
  const acciones = h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: ejecutar }, 'Ejecutar'), t ? h('button', { class: 'btn primario', style: 'background:var(--bien);border-color:var(--bien)', onclick: comprobar }, 'Comprobar el ejercicio') : null, reiniciar, h('span', { class: 'atajos' }, 'Ctrl + Enter ejecuta'));
  el.append(h('div', { class: 'columna' }, tabs, cab, h('div', { class: 'lab' }, editor.el, acciones,
    h('span', { class: 'etiqueta' }, 'Consola'), h('div', { class: 'consola', id: 'consola', 'aria-live': 'polite' }, h('span', { class: 'fin' }, 'Pulsa «Ejecutar» para ver lo que hace tu programa.')),
    h('div', { class: 'pruebas', id: 'resultados' }), h('div', { id: 'pista-lab' }))));
  pintaResultados(); pintaPistaLab();
};

/* HTML: vista previa al momento, en una caja aislada (sin scripts) */
let vistaT = null;
function vistaHtmlLuego() { clearTimeout(vistaT); vistaT = setTimeout(pintaVistaHtml, 250); }
function limpiaHtml(src) {
  const doc = new DOMParser().parseFromString(src, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link, meta, base, frame, frameset').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(n => { for (const a of [...n.attributes]) { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); } if (n.tagName === 'A') { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener'); } if (n.tagName === 'FORM') n.setAttribute('onsubmit', 'return false'); });
  doc.querySelectorAll('form').forEach(f => f.removeAttribute('onsubmit'));
  return doc;
}
function pintaVistaHtml() {
  const caja = $('#vista-html'); if (!caja || !editor) return;
  const src = editor.ta.value; const doc = limpiaHtml(src);
  const raiz = caja.shadowRoot || caja.attachShadow({ mode: 'open' });
  raiz.innerHTML = '<style>:host{all:initial;display:block;font:16px/1.5 system-ui,sans-serif;color:#111;background:#fff}</style>' + [...doc.head.querySelectorAll('style')].map(s => s.outerHTML).join('') + doc.body.innerHTML;
  raiz.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => e.preventDefault()));
  const lec = D.html.find(x => x.id === lab.html); const checks = lec.comprobar(doc, src);
  const lista = $('#checks-html'); lista.textContent = '';
  checks.forEach(c => lista.append(h('li', { style: `color:${c.ok ? 'var(--bien)' : 'var(--tinta-2)'}` }, (c.ok ? '✓ ' : '○ ') + c.texto)));
  if (checks.every(c => c.ok) && !P.d.html[lec.id]) { P.d.html[lec.id] = true; P.d.puntos += 30; P.cambio(); pintaRango(); aviso(`Lección de HTML «${lec.titulo}» completada: +30 puntos.`); }
}
function pintaHtml() {
  const lec = D.html.find(x => x.id === lab.html);
  editor = crearEditor(codigoInicial(), 'html');
  const chips = h('div', { class: 'chips' }, ...D.html.map((x, k) => h('button', { class: 'chip', 'aria-pressed': x.id === lab.html ? 'true' : 'false', onclick: () => { lab.html = x.id; ls.set('lab-html', x.id); PINTA.lab(); } }, `${k + 1}. ${x.titulo}${P.d.html[x.id] ? ' ✓' : ''}`)));
  setTimeout(pintaVistaHtml, 0);
  return [h('div', { class: 'tarjeta' }, h('span', { class: 'etiqueta' }, 'Rama extra: HTML'), chips, h('h1', { style: 'font-size:22px' }, lec.titulo), ...lec.idea.map(p => h('p', null, p)),
      h('p', null, h('b', null, 'Tu tarea: '), lec.tarea), h('ul', { class: 'lista', id: 'checks-html', style: 'list-style:none;padding-left:0' })),
    h('div', { class: 'dos' }, h('div', { class: 'lab' }, h('span', { class: 'etiqueta' }, 'Tu HTML'), editor.el), h('div', { class: 'lab' }, h('span', { class: 'etiqueta' }, 'Así se ve'), h('div', { class: 'vista-html', id: 'vista-html' })))];
}

/* ───────────── PLAN ───────────── */
const REGLAS = [
  { e: 'Disparador', t: 'Misma señal, otra respuesta', p: 'Decide de antemano qué haces cuando llega la espera: «si le escribo a Claude, entonces abro el Dojo». Los planes «si… entonces» funcionan mucho mejor que las buenas intenciones: en un análisis de 94 estudios con más de 8.000 personas tuvieron un efecto entre medio y grande.', f: 'Gollwitzer y Sheeran (2006), metaanálisis de las intenciones de implementación.', u: 'https://doi.org/10.1016/S0065-2601(06)38002-1' },
  { e: 'Trabas', t: 'Ponle trabas a TikTok y quítaselas al Dojo', p: 'Lo que está a un toque gana. Saca TikTok de la pantalla de inicio, ponle un límite diario y pon el Dojo en su sitio. Abrirlo tiene que costar menos que abrir TikTok.' },
  { e: 'Recordar', t: 'Practica sacando la respuesta de tu cabeza', p: 'Por eso aquí casi todo son preguntas y no lecturas. Responder fija lo aprendido mucho más que releer: en clases reales, las preguntas cortas mejoraron lo aprendido en torno a media desviación típica.', f: 'Yang y otros (2021), metaanálisis de estudios en clase, Psychological Bulletin.', u: 'https://doi.org/10.1037/bul0000309' },
  { e: 'Espaciar', t: 'Lo que fallas vuelve', p: 'Cada reto que fallas vuelve unos retos después y también otro día, con otros números. Repasar de forma espaciada es de lo mejor respaldado de la psicología del aprendizaje.', f: 'Carpenter, Pan y Butler (2022), Nature Reviews Psychology.', u: 'https://www.nature.com/articles/s44159-022-00089-1' },
  { e: 'Ordenar', t: 'Ordenar líneas antes de escribirlas', p: 'Los retos de ordenar líneas (los «problemas de Parsons») ayudan a practicar más rápido y con menos atascos, sobre todo a quien todavía no se ve capaz de programar, y se aprende lo mismo que escribiendo desde cero.', f: 'Hou, Ericson y Wang (2023), Universidad de Míchigan.', u: 'https://arxiv.org/abs/2311.18115' },
  { e: 'Foco', t: 'Lo nuevo se aprende con calma', p: 'Las esperas sirven para repasar. Un tema nuevo se aprende con un rato seguido escribiendo código sin mirar a Claude: el bloque de foco. Antes de empezarlo, dale a Claude una parte entera para que trabaje solo todo ese rato.' },
  { e: 'Avisos', t: 'Que Claude te avise; no lo vigiles', p: 'Si Claude te avisa cuando termina, no hace falta estar pendiente de la pantalla. Y si te distraes, tócalo en «Me distraje»: no resta nada, sirve para que lo veas.' }
];
const CHECKS = [
  ['dojo-inicio', 'Instala el Dojo y ponlo en la pantalla de inicio', 'Botón «Instalar la app» en Android y en el PC (Chrome o Edge). En iPhone, desde Safari: Compartir → Añadir a la pantalla de inicio. Ponlo justo donde estaba TikTok.'],
  ['tiktok', 'Saca TikTok de la pantalla de inicio y ponle un límite', 'Android: Ajustes → Bienestar digital → Temporizadores de apps. iPhone: Ajustes → Tiempo de uso → Límites de apps.'],
  ['avisos', 'Activa los avisos de Claude', 'Que te avise cuando termina, para no vigilarlo. En el PC, Claude Code puede sonar al acabar: pídeselo en el chat del proyecto y lo deja configurado.'],
  ['hora', 'Elige la hora de tu bloque de foco', 'Siempre la misma, por ejemplo después de comer. Escríbela en tu regla de abajo.'],
  ['pc', 'Instala PSeInt, Python y C++ en tu PC', 'Para cuando quieras ir más allá del laboratorio: PSeInt (pseint.sourceforge.net), Python (python.org) y C++ con VS Code o Code::Blocks.']
];
PINTA.plan = function () {
  const el = $('#v-plan'); el.textContent = ''; const aj = P.d.ajustes;
  const regla = h('textarea', { class: 'campo', id: 'regla', rows: '3', style: 'width:100%', 'aria-label': 'Tu regla si-entonces' }); regla.value = P.d.plan.regla;
  regla.addEventListener('change', () => { P.d.plan.regla = regla.value.trim(); P.cambio(); aviso('Regla guardada.'); });
  const selector = (id, etiqueta, valor, opciones, al) => { const s = h('select', { class: 'campo', id }, ...opciones.map(([v, n]) => h('option', { value: v }, n))); s.value = String(valor); s.addEventListener('change', () => al(s.value)); return h('label', { style: 'display:grid;gap:4px;font-size:14px' }, etiqueta, s); };
  el.append(h('div', { class: 'columna' },
    h('div', { class: 'tarjeta' }, h('h1', { style: 'font-size:24px' }, 'Tu plan contra el scroll'),
      h('p', null, 'Lo que te pasa tiene explicación: cada mensaje a Claude abre una espera de unos minutos, y esa espera es la señal que te lleva a TikTok. TikTok gana porque está a un toque y premia al instante. No se arregla con fuerza de voluntad: se arregla decidiendo qué haces en ese mismo momento y poniéndole trabas a lo otro.'),
      h('p', { class: 'tenue' }, 'Este Dojo está hecho para esa espera: retos de 30 segundos, sin instalar nada, en el móvil o en el PC. Y una vez al día, un bloque de foco para aprender de verdad.')),
    h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:18px' }, 'Las ideas que lo sostienen'),
      ...REGLAS.map(r => h('div', { class: 'regla' }, h('span', { class: 'insignia ai', style: 'margin-top:2px' }, r.e), h('div', null, h('h3', null, r.t), h('p', { class: 'tenue' }, r.p), r.f ? h('p', { class: 'fuente' }, 'Fuente: ', h('a', { href: r.u, target: '_blank', rel: 'noopener' }, r.f)) : null)))),
    h('div', { class: 'tarjeta' }, h('div', { class: 'entre' }, h('h2', { style: 'font-size:18px' }, 'Prepara el terreno'), h('span', { class: 'insignia' }, `${CHECKS.filter(c => P.d.plan.checks[c[0]]).length} de ${CHECKS.length}`)),
      h('div', null, ...CHECKS.map(([id, t, s]) => { const c = h('input', { type: 'checkbox', id: 'chk-' + id }); c.checked = !!P.d.plan.checks[id]; c.addEventListener('change', () => { P.d.plan.checks[id] = c.checked; P.cambio(); PINTA.plan(); }); return h('div', { class: 'check' }, c, h('label', { for: 'chk-' + id }, t, h('small', null, s))); }))),
    h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:18px' }, 'Tu regla «si… entonces»'), h('p', { class: 'tenue' }, 'Escríbela con tus palabras. Concreta y con un momento fijo funciona mejor.'), regla),
    h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:18px' }, 'Ajustes'),
      h('div', { class: 'fila', style: 'gap:16px;align-items:end' },
        selector('aj-meta', 'Retos al día', aj.meta, [[10, '10'], [20, '20'], [30, '30'], [50, '50']], v => { aj.meta = +v; P.cambio(); }),
        selector('aj-foco', 'Bloque de foco', aj.foco, [[15, '15 min'], [25, '25 min'], [45, '45 min'], [60, '60 min']], v => { aj.foco = +v; P.cambio(); }),
        selector('aj-lang', 'Lenguaje de los retos', aj.lang, [['mezcla', 'Los tres'], ['ps', 'PSeInt'], ['py', 'Python'], ['cpp', 'C++']], v => { aj.lang = v; P.cambio(); nuevoReto(); })),
      h('p', { class: 'tenue', style: 'font-size:13px' }, P.enCuenta ? 'Tu progreso se guarda en tu cuenta de Claude: es el mismo en el PC y en el móvil.' : 'Tu progreso se guarda en este dispositivo.')),
    tarjetaApp(), tarjetaCopia()));
};
function tarjetaApp() {
  const partes = [h('h2', { style: 'font-size:18px' }, 'La app')];
  if (enClaude) {
    partes.push(h('p', { class: 'tenue' }, 'Estás usando la versión dentro de Claude: guarda tu progreso en tu cuenta y tiene el tutor.'),
      URL_APP ? h('p', null, 'La app instalable (con su icono, sin internet y con actualizaciones solas) está aquí: ', h('a', { href: URL_APP, target: '_blank', rel: 'noopener' }, URL_APP)) : null,
      h('p', { class: 'tenue', style: 'font-size:13px' }, 'Para llevarte tu progreso a la app instalable, usa «Copiar mi progreso» aquí abajo y pégalo allí.'));
  } else if (instalada()) {
    partes.push(h('p', null, h('span', { class: 'insignia bien' }, 'Instalada'), ' Se actualiza sola: cuando haya una versión nueva te saldrá un aviso para actualizar.'));
  } else if (pedirInstalar) {
    partes.push(h('p', { class: 'tenue' }, 'Instálala para tenerla con su icono, en su propia ventana y sin internet. Se actualiza sola.'), h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: instalar }, 'Instalar la app')));
  } else if (esIphone()) {
    partes.push(h('p', null, 'En iPhone se instala desde Safari: toca Compartir (el cuadrado con la flecha) y luego «Añadir a la pantalla de inicio».'));
  } else {
    partes.push(h('p', { class: 'tenue' }, 'Para instalarla, ábrela en Chrome o Edge y busca «Instalar» en el menú del navegador (o el icono de instalar en la barra de direcciones). En iPhone, desde Safari: Compartir → Añadir a la pantalla de inicio.'));
  }
  partes.push(h('p', { class: 'tenue num', style: 'font-size:12.5px' }, 'Versión ' + VERSION));
  return h('div', { class: 'tarjeta' }, ...partes);
}
let cargaArmada = false;
function tarjetaCopia() {
  const salida = h('textarea', { class: 'campo mono', id: 'codigo-progreso', rows: '3', readonly: true, hidden: true, style: 'width:100%;font-size:12px', 'aria-label': 'Tu código de progreso' });
  const entrada = h('textarea', { class: 'campo mono', id: 'pegar-progreso', rows: '3', style: 'width:100%;font-size:12px', placeholder: 'Pega aquí el código (empieza por DOJO1:)', 'aria-label': 'Código de progreso de otro dispositivo' });
  const cargar = h('button', { class: 'btn', onclick: () => {
    let d; try { d = leeCodigoProgreso(entrada.value); } catch (e) { aviso(e.message, 5000); return; }
    if (!cargaArmada) { cargaArmada = true; cargar.textContent = 'Sustituye el progreso de este dispositivo. Toca otra vez'; setTimeout(() => { cargaArmada = false; cargar.textContent = 'Cargar este progreso'; }, 4000); return; }
    cargaArmada = false; P.d = Object.assign(NUEVO(), d); P.cambio(); reto = null; repintar(); aviso('Progreso cargado.');
  } }, 'Cargar este progreso');
  return h('div', { class: 'tarjeta' }, h('h2', { style: 'font-size:18px' }, 'Pasar tu progreso a otro dispositivo'),
    h('p', { class: 'tenue' }, 'Copia el código aquí, mándatelo (por ejemplo, por WhatsApp a ti mismo) y pégalo en el otro dispositivo.'),
    h('div', { class: 'fila' }, h('button', { class: 'btn primario', onclick: () => {
      const c = codigoProgreso(); salida.value = c;
      const muestra = () => { salida.hidden = false; salida.focus(); salida.select(); aviso('Selecciona el código y cópialo.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c).then(() => aviso('Código copiado. Pégalo en el otro dispositivo.'), muestra); else muestra();
    } }, 'Copiar mi progreso')), salida, entrada, h('div', { class: 'fila' }, cargar));
}

/* ───────────── Arranque ───────────── */
document.querySelectorAll('.boton-instalar').forEach(b => b.addEventListener('click', instalar));
pintaRango(); pintaBandas(); pintaPie(); pintaInstalar();
mostrar(location.hash.slice(1) || 'hoy');
P.iniciar();
})();
