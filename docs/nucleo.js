/* Núcleo del Dojo: la lógica sin pantalla (progreso, repaso espaciado, rango, racha, recomendaciones).
   No toca el DOM, así que se prueba igual en Node que en el navegador. */
(function (raiz) {
'use strict';
const VERSION = '1.2.0';
const LANGS = ['ps', 'py', 'cpp'];
const REGLA = 'Si le mando un mensaje a Claude, entonces abro el Dojo y hago retos hasta que me responda.';
const INTERVALOS = [0, 1, 3, 7, 16, 35];   // días hasta el siguiente repaso según la caja (0 = fallado)

const hoyClave = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumaDias = (clave, n) => { const d = new Date(clave + 'T12:00:00'); d.setDate(d.getDate() + n); return hoyClave(d); };
const diasAtras = n => sumaDias(hoyClave(), -n);
const esFecha = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const entero = (x, min = 0, max = 1e9) => { x = Math.round(Number(x)); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min; };

function NUEVO() {
  return {
    v: 2, actualizado: 0, puntos: 0, dias: {}, temas: {}, ejercicios: {}, tarjetas: {}, html: {}, bienvenida: false,
    porLang: { ps: { retos: 0, aciertos: 0 }, py: { retos: 0, aciertos: 0 }, cpp: { retos: 0, aciertos: 0 } },
    ajustes: { meta: 20, foco: 25, lang: 'mezcla', tema: 'auto', aspecto: 'sistema', vibrar: true },
    plan: { checks: {}, regla: REGLA }
  };
}
const elige = (v, opciones, def) => (opciones.includes(v) ? v : def);

/* Devuelve un progreso limpio a partir de cualquier cosa guardada (versión 1, versión 2, un código
   pegado o datos dañados). Lo que no se reconoce se descarta; nada puede romper la app. */
function normaliza(d, D) {
  const n = NUEVO(); if (!d || typeof d !== 'object' || Array.isArray(d)) return n;
  const hoy = hoyClave();
  n.actualizado = entero(d.actualizado, 0, 1e15); n.puntos = entero(d.puntos);
  if (d.dias && typeof d.dias === 'object') for (const k of Object.keys(d.dias)) {
    if (!esFecha(k)) continue; const x = d.dias[k] || {};
    const retos = entero(x.retos);
    n.dias[k] = { retos, aciertos: entero(x.aciertos, 0, retos), foco: entero(x.foco, 0, 1440), esperas: entero(x.esperas), perdidas: entero(x.perdidas), segEspera: entero(x.segEspera) };
  }
  for (const t of D.temas) {
    const x = d.temas && d.temas[t.id]; if (!x || typeof x !== 'object') continue;
    n.temas[t.id] = { ultimos: (Array.isArray(x.ultimos) ? x.ultimos : []).slice(-10).map(v => (v ? 1 : 0)), intentos: entero(x.intentos), aciertos: entero(x.aciertos) };
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
    n.tarjetas[k] = { caja: entero(x.caja, 0, 5), vence: esFecha(x.vence) ? x.vence : hoy, aciertos: entero(x.aciertos), fallos: entero(x.fallos), visto: esFecha(x.visto) ? x.visto : hoy };
  }
  if (Array.isArray(d.repaso)) for (const r of d.repaso) {   // versión 1: cola de fallos
    if (!r || !D.porId[r.tpl] || !LANGS.includes(r.lang)) continue; const k = r.tpl + '|' + r.lang;
    if (!n.tarjetas[k]) n.tarjetas[k] = { caja: 0, vence: hoy, aciertos: 0, fallos: 1, visto: esFecha(r.dia) ? r.dia : sumaDias(hoy, -1) };
  }
  for (const l of LANGS) { const x = (d.porLang && d.porLang[l]) || {}; const retos = entero(x.retos); n.porLang[l] = { retos, aciertos: entero(x.aciertos, 0, retos) }; }
  for (const x of D.html) if (d.html && d.html[x.id] === true) n.html[x.id] = true;
  const a = d.ajustes || {};
  n.ajustes = {
    meta: elige(a.meta, [10, 20, 30, 50], 20), foco: elige(a.foco, [15, 25, 45, 60], 25), lang: elige(a.lang, ['mezcla', ...LANGS], 'mezcla'),
    tema: a.tema === 'auto' || a.tema === 'todo' || a.tema === 'repaso' || D.temas.some(t => t.id === a.tema) ? a.tema : 'auto',
    aspecto: elige(a.aspecto, ['sistema', 'claro', 'oscuro'], 'sistema'), vibrar: a.vibrar !== false
  };
  const pl = d.plan || {};
  if (pl.checks && typeof pl.checks === 'object') for (const k of Object.keys(pl.checks)) if (/^[a-z-]{1,30}$/.test(k) && pl.checks[k] === true) n.plan.checks[k] = true;
  if (typeof pl.regla === 'string' && pl.regla.trim()) n.plan.regla = pl.regla.slice(0, 500);
  n.bienvenida = d.bienvenida === true || Object.keys(n.dias).length > 0;
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
const cuentaDia = (d, k) => { const x = d.dias[k]; return !!x && (x.retos >= 5 || x.foco >= 10); };
function racha(d) { let n = 0, k = cuentaDia(d, hoyClave()) ? 0 : 1; while (cuentaDia(d, diasAtras(k))) { n++; k++; } return n; }
const diaVacio = () => ({ retos: 0, aciertos: 0, foco: 0, esperas: 0, perdidas: 0, segEspera: 0 });
const dia = (d, k = hoyClave()) => d.dias[k] || (d.dias[k] = diaVacio());
const leeDia = (d, k = hoyClave()) => d.dias[k] || diaVacio();

/* ── Repaso espaciado (cajas de Leitner por plantilla y lenguaje) ── */
function apuntaTarjeta(d, tpl, lang, ok, hoy = hoyClave()) {
  const k = tpl + '|' + lang;
  const t = d.tarjetas[k] || { caja: 0, vence: hoy, aciertos: 0, fallos: 0, visto: hoy };
  if (ok) { t.aciertos++; t.caja = Math.min(5, t.caja + 1); } else { t.fallos++; t.caja = 0; }
  t.visto = hoy; t.vence = sumaDias(hoy, INTERVALOS[t.caja]); d.tarjetas[k] = t;
  return t;
}
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
function registraReto(d, D, r) {
  const antes = dominados(d, D), x = dia(d);
  x.retos++; if (r.ok) x.aciertos++;
  const t = d.temas[r.tema] || (d.temas[r.tema] = { ultimos: [], intentos: 0, aciertos: 0 });
  t.intentos++; if (r.ok) t.aciertos++; t.ultimos.push(r.ok ? 1 : 0); if (t.ultimos.length > 10) t.ultimos.shift();
  const pl = d.porLang[r.lang]; if (pl) { pl.retos++; if (r.ok) pl.aciertos++; }
  apuntaTarjeta(d, r.tpl, r.lang, r.ok);
  d.puntos += r.ok ? 10 : 2;
  const ahora = dominados(d, D);
  return { cinturon: ahora > antes ? ahora : 0, metaCumplida: x.retos === d.ajustes.meta };
}
function registraEjercicio(d, D, id, lang) {
  const antes = dominados(d, D); const e = d.ejercicios[id] || (d.ejercicios[id] = {});
  const nuevo = !e[lang]; e[lang] = true; if (nuevo) d.puntos += 50;
  const ahora = dominados(d, D);
  return { nuevo, cinturon: ahora > antes ? ahora : 0 };
}

/* ── Qué hacer ahora ── */
function siguientePaso(d, D, estado = {}) {
  const t = temaActual(d, D), e = estadoTema(d, D, t.id), hoy = leeDia(d), pend = pendientes(d, D).length;
  if (estado.foco) return { id: 'foco', titulo: 'Estás en tu bloque de foco', texto: `Lee la lección de «${t.titulo}» y resuelve su ejercicio sin mirar a Claude.`, accion: 'tema', boton: 'Abrir la lección' };
  if (dominados(d, D) >= D.temas.length) return { id: 'fin', titulo: 'Dominaste los diez temas', texto: 'Ya tienes la base de los tres lenguajes. Ahora toca un proyecto tuyo en el laboratorio, y repasar para no olvidar.', accion: 'lab', boton: 'Ir al laboratorio' };
  if (e.retos && !e.ej) return { id: 'ejercicio', titulo: `Te falta el ejercicio de «${t.titulo}»`, texto: 'Ya dominas sus retos. Escribe el ejercicio en el laboratorio para ganar el siguiente cinturón.', accion: 'ejercicio', boton: 'Resolver el ejercicio' };
  if (pend >= 3) return { id: 'repaso', titulo: `Tienes ${pend} repasos para hoy`, texto: 'Son retos que fallaste o aprendiste hace días. Repasarlos a tiempo es lo que hace que no se olviden.', accion: 'repaso', boton: 'Repasar ahora' };
  if (hoy.retos < d.ajustes.meta) { const f = d.ajustes.meta - hoy.retos; return { id: 'retos', titulo: hoy.retos ? `Te faltan ${f} retos para tu meta` : `Hoy toca: ${d.ajustes.meta} retos`, texto: `Tema actual: «${t.titulo}». Unos minutos en cada espera de Claude bastan.`, accion: 'retos', boton: hoy.retos ? 'Seguir con los retos' : 'Empezar' }; }
  if (hoy.foco < 10) return { id: 'foco', titulo: 'Meta de retos cumplida: falta el foco', texto: 'Lo nuevo se aprende escribiendo código con calma. Un bloque al día marca la diferencia.', accion: 'foco', boton: 'Empezar el bloque' };
  return { id: 'hecho', titulo: 'Día completo', texto: 'Retos y foco hechos. Si quieres más, prueba algo tuyo en el laboratorio o adelanta el tema siguiente.', accion: 'lab', boton: 'Ir al laboratorio' };
}

/* ── Estadísticas ── */
function semana(d) { const r = []; for (let k = 6; k >= 0; k--) { const c = diasAtras(k); r.push({ k: c, ...leeDia(d, c) }); } return r; }
function totales(d) {
  let retos = 0, aciertos = 0, foco = 0, segEspera = 0, esperas = 0, perdidas = 0;
  for (const x of Object.values(d.dias)) { retos += x.retos; aciertos += x.aciertos; foco += x.foco; segEspera += x.segEspera; esperas += x.esperas; perdidas += x.perdidas; }
  return { retos, aciertos, foco, segEspera, esperas, perdidas, dias: Object.values(d.dias).filter(x => x.retos > 0 || x.foco > 0).length };
}

/* ── Código para pasar el progreso a otro dispositivo ── */
const aBase64 = s => (typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, 'utf8').toString('base64'));
const deBase64 = s => (typeof atob === 'function' ? decodeURIComponent(escape(atob(s))) : Buffer.from(s, 'base64').toString('utf8'));
const codigoProgreso = d => 'DOJO1:' + aBase64(JSON.stringify(d));
function leeCodigoProgreso(txt, D) {
  const m = /DOJO1:([A-Za-z0-9+/=]+)/.exec(String(txt).replace(/\s+/g, ''));
  if (!m) throw new Error('Ese texto no es un código de progreso del Dojo. Tiene que empezar por DOJO1:');
  let d; try { d = JSON.parse(deBase64(m[1])); } catch (e) { throw new Error('El código está incompleto. Cópialo entero otra vez.'); }
  if (!d || typeof d !== 'object' || (d.v !== 1 && d.v !== 2) || typeof d.dias !== 'object') throw new Error('El código no tiene el formato del Dojo.');
  return normaliza(d, D);
}

const Nucleo = { VERSION, LANGS, INTERVALOS, hoyClave, sumaDias, diasAtras, NUEVO, normaliza, estadoTema, dominados, temaActual, racha, dia, leeDia,
  apuntaTarjeta, pendientes, debiles, registraReto, registraEjercicio, ejercicioHecho, siguientePaso, semana, totales, codigoProgreso, leeCodigoProgreso };
if (typeof module !== 'undefined' && module.exports) module.exports = Nucleo; else raiz.Nucleo = Nucleo;
})(typeof window !== 'undefined' ? window : globalThis);
