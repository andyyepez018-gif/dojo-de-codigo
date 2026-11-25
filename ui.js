/* Piezas de interfaz del Dojo: nodos, resaltado de código, bloques de código, editor con colores,
   avisos, celebración y aspecto (claro/oscuro). */
(function (raiz) {
'use strict';
const $ = (s, el) => (el || document).querySelector(s);
function h(tag, attrs, ...hijos) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;            // solo con HTML fijo o ya escapado
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
  set(k, v) { try { if (v === null || v === undefined) localStorage.removeItem('dojo-' + k); else localStorage.setItem('dojo-' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
};
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const NL = { ps: 'PSeInt', py: 'Python', cpp: 'C++', html: 'HTML' };
const reduceMovimiento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function aviso(texto, ms = 3400) {
  const a = $('#aviso'); if (!a) return;
  a.textContent = texto; a.hidden = false; a.classList.remove('sale'); void a.offsetWidth; a.classList.add('entra');
  clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, ms);
}

/* ── Resaltado ── */
const KW = {
  ps: new Set('algoritmo finalgoritmo proceso finproceso definir como entero real caracter cadena texto logico numero dimension dimensionar escribir imprimir mostrar leer si entonces sino finsi mientras hacer finmientras para hasta con paso finpara repetir que segun finsegun de otro modo caso funcion finfuncion subproceso finsubproceso por referencia valor y o no mod sin saltar bajar verdadero falso'.split(' ')),
  py: new Set('def return if elif else while for in and or not is True False None break continue pass import from global del lambda'.split(' ')),
  cpp: new Set('int double float bool char string void auto vector if else while for do return break continue switch case default true false using namespace std const include long short unsigned static_cast'.split(' '))
};
const FN = {
  ps: new Set('raiz rc abs trunc redon azar aleatorio longitud mayusculas minusculas subcadena concatenar convertiranumero convertiratexto'.split(' ')),
  py: new Set('print input int float str len range abs round max min sum sorted list dict type enumerate reversed'.split(' ')),
  cpp: new Set('cout cin endl getline sqrt pow abs max min to_string stoi stod setprecision setw fixed main'.split(' '))
};
const normaliza = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const RE = {
  py: /(#.*$)|([fF]?"(?:[^"\\]|\\.)*"?|[fF]?'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ſ][\wÀ-ſ]*)/g,
  otro: /(\/\/.*$|^\s*#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ſ][\wÀ-ſ]*)/g,
  html: /(<!--.*?(?:-->|$))|(<\/?[A-Za-z][\w-]*)|("[^"]*"?|'[^']*'?)|([\w-]+(?==))|(\/?>)/g
};
function resalta(linea, lang) {
  if (lang === 'html') {
    const re = new RegExp(RE.html.source, 'g'); let out = '', ult = 0, m;
    while ((m = re.exec(linea))) {
      out += esc(linea.slice(ult, m.index)); ult = re.lastIndex;
      out += m[1] ? `<span class="com">${esc(m[1])}</span>` : m[2] ? `<span class="kw">${esc(m[2])}</span>` : m[3] ? `<span class="str">${esc(m[3])}</span>` : m[4] ? `<span class="fn">${esc(m[4])}</span>` : `<span class="kw">${esc(m[5])}</span>`;
      if (m[0] === '') re.lastIndex++;
    }
    return out + esc(linea.slice(ult));
  }
  const re = new RegExp((lang === 'py' ? RE.py : RE.otro).source, 'g');
  let out = '', ult = 0, m;
  while ((m = re.exec(linea))) {
    out += esc(linea.slice(ult, m.index)); ult = re.lastIndex;
    if (m[1]) out += m[1].trimStart().startsWith('#') && lang !== 'py' ? `<span class="kw">${esc(m[1])}</span>` : `<span class="com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="nu">${m[3]}</span>`;
    else {
      const w = m[4], k = lang === 'ps' ? normaliza(w) : w;
      if (KW[lang] && KW[lang].has(k)) out += `<span class="kw">${esc(w)}</span>`;
      else if ((FN[lang] && FN[lang].has(k)) || /^\s*\(/.test(linea.slice(ult))) out += `<span class="fn">${esc(w)}</span>`;
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
    if (opts.actual === i + 1) li.classList.add('actual');
    if (opts.tocar) {
      li.classList.add('toca'); li.tabIndex = 0; li.setAttribute('role', 'button'); li.setAttribute('aria-label', 'Línea ' + (i + 1) + ': ' + l.trim());
      li.addEventListener('click', () => opts.tocar(i, li)); li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.tocar(i, li); } });
    }
    ol.append(li);
  });
  return h('div', { class: 'codigo', role: opts.tocar ? 'group' : null, 'aria-label': 'Código en ' + (NL[lang] || lang) }, ol);
}
const salidaBloque = s => s === '' ? h('div', { class: 'salida vacia' }, '(no muestra nada)') : h('div', { class: 'salida' }, s);

/* ── Editor con colores: un textarea transparente encima del código pintado ── */
const ABRE = { py: /:\s*(#.*)?$/, cpp: /\{\s*$/, ps: /(\bEntonces|\bHacer|^\s*Repetir|^\s*SiNo|^\s*Algoritmo\b.*|^\s*(Funcion|SubProceso)\b.*|:)\s*$/i, html: /<(ul|ol|div|section|body|head|style|table|tr)[^>]*>\s*$/i };
const COMENTARIO = { py: '# ', cpp: '// ', ps: '// ' };
function editor({ valor, lang, alCambiar, alEjecutar, etiqueta }) {
  const nums = h('div', { class: 'numeros', 'aria-hidden': 'true' });
  const pintado = h('pre', { class: 'pintado', 'aria-hidden': 'true' });
  const banda = h('div', { class: 'banda-error', hidden: true });
  const ta = h('textarea', { id: 'editor-codigo', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-label': etiqueta || ('Tu código en ' + (NL[lang] || lang)), wrap: 'off' });
  ta.value = valor; let marcada = 0;
  const pinta = () => {
    const ls_ = ta.value.split('\n');
    pintado.innerHTML = ls_.map(l => resalta(l, lang)).join('\n') + '\n ';
    nums.innerHTML = ls_.map((_, i) => i + 1 === marcada ? `<span class="err">${i + 1}</span>` : String(i + 1)).join('\n');
    sincroniza();
  };
  const sincroniza = () => {
    pintado.scrollTop = ta.scrollTop; pintado.scrollLeft = ta.scrollLeft; nums.scrollTop = ta.scrollTop;
    if (marcada) { const alto = parseFloat(getComputedStyle(ta).lineHeight) || 22; banda.hidden = false; banda.style.transform = `translateY(${(marcada - 1) * alto - ta.scrollTop}px)`; } else banda.hidden = true;
  };
  const mete = (txt, a, b, modo = 'end') => { ta.setRangeText(txt, a, b, modo); ta.dispatchEvent(new Event('input')); };
  ta.addEventListener('input', () => { marcada = 0; pinta(); alCambiar && alCambiar(ta.value); });
  ta.addEventListener('scroll', sincroniza);
  ta.addEventListener('keydown', e => {
    const a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); alEjecutar && alEjecutar(); return; }
    if (e.key === '/' && (e.ctrlKey || e.metaKey) && COMENTARIO[lang]) {
      e.preventDefault(); const ini = v.lastIndexOf('\n', a - 1) + 1; let fin = v.indexOf('\n', b); if (fin < 0) fin = v.length;
      const c = COMENTARIO[lang], bloque = v.slice(ini, fin).split('\n'), todas = bloque.every(l => !l.trim() || l.trimStart().startsWith(c.trim()));
      const nuevo = bloque.map(l => !l.trim() ? l : todas ? l.replace(new RegExp('^(\\s*)' + c.trim().replace(/\//g, '\\/') + ' ?'), '$1') : l.replace(/^(\s*)/, '$1' + c)).join('\n');
      ta.setRangeText(nuevo, ini, fin, 'select'); ta.dispatchEvent(new Event('input')); return;
    }
    if (e.key === 'Tab' && !e.shiftKey && a === b) { e.preventDefault(); mete('    ', a, b); return; }
    if (e.key === 'Tab') {
      e.preventDefault(); const ini = v.lastIndexOf('\n', a - 1) + 1; let fin = v.indexOf('\n', b === a ? b : b - 1); if (fin < 0) fin = v.length;
      const nuevo = v.slice(ini, fin).split('\n').map(l => e.shiftKey ? l.replace(/^ {1,4}/, '') : '    ' + l).join('\n');
      ta.setRangeText(nuevo, ini, fin, 'select'); ta.dispatchEvent(new Event('input')); return;
    }
    if (e.key === 'Enter' && !e.shiftKey && a === b) {
      e.preventDefault(); const ini = v.lastIndexOf('\n', a - 1) + 1; const lin = v.slice(ini, a);
      let sang = /^\s*/.exec(lin)[0]; if (ABRE[lang] && ABRE[lang].test(lin)) sang += '    ';
      mete('\n' + sang, a, b);
    }
  });
  const el = h('div', { class: 'editor' }, nums, h('div', { class: 'area' }, banda, pintado, ta));
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(sincroniza).observe(ta);
  pinta();
  return { el, ta, marca(l) { marcada = l || 0; pinta(); if (l) { const alto = parseFloat(getComputedStyle(ta).lineHeight) || 22; if ((l - 1) * alto < ta.scrollTop || (l - 1) * alto > ta.scrollTop + ta.clientHeight - alto) ta.scrollTop = Math.max(0, (l - 3) * alto); } }, pon(v) { ta.value = v; marcada = 0; pinta(); } };
}

/* ── Cinturones ── */
const CINTURONES = [
  { n: '10.º kyū', c: '#F3F1EA' }, { n: '9.º kyū', c: '#E9C547' }, { n: '8.º kyū', c: '#E58A2E' }, { n: '7.º kyū', c: '#3F9A5A' }, { n: '6.º kyū', c: '#2F6DB5' },
  { n: '5.º kyū', c: '#7A4FB0' }, { n: '4.º kyū', c: '#A0703F' }, { n: '3.er kyū', c: '#7D5230' }, { n: '2.º kyū', c: '#5E3B22' }, { n: '1.er kyū', c: '#4A2E1A' }, { n: 'Shodan', c: '#16161B' }];
const cinturon = (i, grande) => { const c = CINTURONES[Math.min(i, 10)]; return h('span', { class: 'cinturon' + (grande ? ' grande' : ''), style: `background:${c.c}`, role: 'img', 'aria-label': 'Cinturón ' + c.n, title: c.n }); };
function celebra(i, texto) {
  const antes = document.activeElement;
  const cierra = () => { capa.remove(); document.removeEventListener('keydown', tecla); if (antes && antes.focus) antes.focus({ preventScroll: true }); };
  const tecla = e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); cierra(); } };
  const boton = h('button', { class: 'btn primario grande', onclick: cierra }, 'Seguir');
  const capa = h('div', { class: 'capa', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'celebra-titulo', onclick: e => { if (e.target === capa) cierra(); } },
    h('div', { class: 'celebra' }, cinturon(i, true), h('span', { class: 'etiqueta' }, 'Nuevo cinturón'), h('h2', { id: 'celebra-titulo' }, CINTURONES[Math.min(i, 10)].n), h('p', null, texto), boton));
  document.body.append(capa); document.addEventListener('keydown', tecla); boton.focus();
}

/* ── Aspecto: sistema / claro / oscuro (respeta lo que diga Claude si se elige «sistema») ── */
const temaOriginal = document.documentElement.getAttribute('data-theme');
function aplicaAspecto(a) {
  const r = document.documentElement;
  if (a === 'claro') r.setAttribute('data-theme', 'light'); else if (a === 'oscuro') r.setAttribute('data-theme', 'dark');
  else if (temaOriginal) r.setAttribute('data-theme', temaOriginal); else r.removeAttribute('data-theme');
  const oscuro = r.getAttribute('data-theme') === 'dark' || (!r.getAttribute('data-theme') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', oscuro ? '#0B1020' : '#2B4C9B'));
}
function vibra(patron, permitido) { try { if (permitido && navigator.vibrate) navigator.vibrate(patron); } catch (e) { /* no disponible */ } }
async function copia(texto) {
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(texto); return true; } } catch (e) { /* sin permiso */ }
  return false;
}

raiz.UI = { $, h, esc, ls, mmss, NL, aviso, resalta, bloqueCodigo, salidaBloque, editor, CINTURONES, cinturon, celebra, aplicaAspecto, vibra, copia, reduceMovimiento };
})(window);
