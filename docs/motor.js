/* Motor del Dojo de código: ejecuta PSeInt, Python y C++ (los subconjuntos de un primer curso)
   dentro del navegador, sin instalar nada. Un solo intérprete para los tres: cada lenguaje tiene su
   propio lector (parser) y todos producen el mismo árbol. Funciona igual en Node para las pruebas. */
(function (raiz) {
'use strict';

class ErrorDojo extends Error {
  constructor(msg, linea, pista) { super(msg); this.linea = linea || 0; this.pista = pista || ''; }
}
class Real { constructor(v) { this.v = v; } }
const R = v => new Real(v);
const esR = x => x instanceof Real;
class Car { constructor(c) { this.c = c; } }   // un char de C++
const esNum = x => typeof x === 'number' || x instanceof Real || typeof x === 'boolean' || x instanceof Car;
const N = x => (x instanceof Real ? x.v : typeof x === 'boolean' ? (x ? 1 : 0) : x instanceof Car ? x.c.charCodeAt(0) : x);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
class Corte { constructor(tipo, valor) { this.tipo = tipo; this.valor = valor; } }
const LIMITE_PASOS = 300000;

function distancia(a, b) {
  const m = a.length, n = b.length; const d = [];
  for (let i = 0; i <= m; i++) { d[i] = [i]; }
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function parecido(nombre, candidatos) {
  let mejor = null, dm = 3;
  for (const c of candidatos) {
    if (c === nombre) continue;
    if (c.toLowerCase() === nombre.toLowerCase()) return c;
    const d = distancia(nombre.toLowerCase(), c.toLowerCase());
    if (d < dm && d <= Math.max(1, Math.floor(nombre.length / 3))) { dm = d; mejor = c; }
  }
  return mejor;
}

/* ───────────── Escáner: texto → fichas ───────────── */
const OPS = {
  ps: ['<-', '<=', '>=', '<>', '==', '!=', '=', '<', '>', '+', '-', '*', '/', '^', '%', '(', ')', '[', ']', ',', ':', ';', '&', '|', '~'],
  py: ['**=', '//=', '**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '=', '<', '>', '+', '-', '*', '/', '%', '(', ')', '[', ']', ',', ':', '.', ';', '{', '}'],
  cpp: ['<<=', '>>=', '::', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '->', '=', '<', '>', '+', '-', '*', '/', '%', '!', '(', ')', '[', ']', '{', '}', ',', ';', '.', '&', '?', ':', '|', '^', '~']
};
for (const k in OPS) OPS[k].sort((a, b) => b.length - a.length);

function escanear(src, lang) {
  src = src.replace(/\r\n?/g, '\n');
  const ops = OPS[lang]; const toks = []; const n = src.length;
  let i = 0, linea = 1, prof = 0, inicioLinea = true; const pila = [0];
  const add = (t, v, extra) => { const tk = { t, v, linea }; if (extra) Object.assign(tk, extra); toks.push(tk); return tk; };
  while (i < n) {
    let c = src[i];
    if (lang === 'py' && inicioLinea && prof === 0) {
      let w = 0, j = i;
      while (j < n && (src[j] === ' ' || src[j] === '\t')) { w += src[j] === '\t' ? 4 : 1; j++; }
      if (j >= n || src[j] === '\n' || src[j] === '#') {
        while (j < n && src[j] !== '\n') j++;
        i = j < n ? j + 1 : j; if (j < n) linea++; continue;
      }
      i = j; inicioLinea = false;
      const tope = pila[pila.length - 1];
      if (w > tope) { pila.push(w); add('indent', w); }
      else if (w < tope) {
        while (pila.length > 1 && w < pila[pila.length - 1]) { pila.pop(); add('dedent', w); }
        if (pila[pila.length - 1] !== w) throw new ErrorDojo('La sangría (los espacios al inicio) de esta línea no coincide con ninguna de las de arriba.', linea, 'En Python cada bloque usa exactamente la misma sangría. Lo normal son 4 espacios por nivel.');
      }
      continue;
    }
    if (c === '\n') {
      if (lang === 'ps' || (lang === 'py' && prof === 0)) { if (toks.length && toks[toks.length - 1].t !== 'nl') add('nl'); }
      i++; linea++; if (lang !== 'py' || prof === 0) inicioLinea = true; continue;
    }
    if (c === ' ' || c === '\t') { i++; continue; }
    if (lang === 'py' && c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
    if (lang !== 'py' && c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (lang === 'cpp' && c === '/' && src[i + 1] === '*') {
      i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') linea++; i++; } i += 2; continue;
    }
    if (lang === 'cpp' && c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let j = i, real = false;
      while (j < n && /[0-9]/.test(src[j])) j++;
      if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { real = true; j++; while (j < n && /[0-9]/.test(src[j])) j++; }
      else if (src[j] === '.' && lang !== 'ps' && !/[A-Za-z_.]/.test(src[j + 1] || '')) { real = true; j++; }
      if (/[eE]/.test(src[j] || '') && /[0-9]/.test(src[j + 1] === '-' || src[j + 1] === '+' ? (src[j + 2] || '') : (src[j + 1] || ''))) {
        real = true; j++; if (src[j] === '-' || src[j] === '+') j++; while (j < n && /[0-9]/.test(src[j])) j++;
      }
      const v = parseFloat(src.slice(i, j));
      if (lang === 'cpp') while (j < n && /[fFlLuU]/.test(src[j])) { if (/[fF]/.test(src[j])) real = true; j++; }
      add('num', v, { real }); i = j; continue;
    }
    const esF = lang === 'py' && (c === 'f' || c === 'F') && (src[i + 1] === '"' || src[i + 1] === "'");
    if (c === '"' || c === "'" || c === '“' || c === '”' || esF) {
      if (esF) { i++; c = src[i]; }
      const q = (c === '“' || c === '”') ? null : c;
      let j = i + 1, s = '';
      while (j < n && (q ? src[j] !== q : (src[j] !== '”' && src[j] !== '“'))) {
        if (src[j] === '\n') throw new ErrorDojo('Falta cerrar las comillas de este texto.', linea, 'Cada texto empieza y termina con comillas: "así".');
        if (src[j] === '\\' && lang !== 'ps') {
          const e = src[j + 1]; const m = { n: '\n', t: '\t', '\\': '\\', '"': '"', "'": "'", '0': '\0' };
          s += (e in m) ? m[e] : '\\' + e; j += 2; continue;
        }
        s += src[j]; j++;
      }
      if (j >= n) throw new ErrorDojo('Falta cerrar las comillas de este texto.', linea, 'Cada texto empieza y termina con comillas: "así".');
      i = j + 1;
      if (lang === 'cpp' && q === "'") add('chr', s); else if (esF) add('fstr', s); else add('str', s);
      continue;
    }
    if (/[A-Za-z_À-ſ]/.test(c)) {
      let j = i + 1; while (j < n && /[\wÀ-ſ]/.test(src[j])) j++;
      const v = src.slice(i, j); add('id', v, { k: norm(v) }); i = j; continue;
    }
    if (c === '←') { add('op', '<-'); i++; continue; }
    if (c === '≤' || c === '≥' || c === '≠') { add('op', c === '≤' ? '<=' : c === '≥' ? '>=' : '<>'); i++; continue; }
    let m = null; for (const o of ops) if (src.startsWith(o, i)) { m = o; break; }
    if (!m) throw new ErrorDojo(`No entiendo el símbolo «${c}».`, linea, 'Revisa si se coló un carácter raro al copiar o escribir.');
    if (lang === 'py') { if ('([{'.includes(m)) prof++; else if (')]}'.includes(m)) prof = Math.max(0, prof - 1); }
    add('op', m); i += m.length;
  }
  if (lang !== 'cpp' && toks.length && toks[toks.length - 1].t !== 'nl') add('nl');
  if (lang === 'py') while (pila.length > 1) { pila.pop(); add('dedent', 0); }
  add('eof');
  if (lang === 'ps') {
    // «Fin Si» → «FinSi», «Sino» igual que «SiNo»
    const out = [];
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k], s = toks[k + 1];
      if (t.t === 'id' && t.k === 'fin' && s && s.t === 'id' && s.linea === t.linea) { out.push({ t: 'id', v: 'Fin' + s.v, k: 'fin' + s.k, linea: t.linea }); k++; }
      else out.push(t);
    }
    return out;
  }
  return toks;
}

/* ───────────── Base de los lectores ───────────── */
class Lector {
  constructor(toks, lang) { this.k = toks; this.p = 0; this.lang = lang; }
  get t() { return this.k[this.p]; }
  mira(o) { return this.k[Math.min(this.p + o, this.k.length - 1)]; }
  sig() { const t = this.k[this.p]; if (this.p < this.k.length - 1) this.p++; return t; }
  esOp(v) { const t = this.t; return t.t === 'op' && t.v === v; }
  esId(v) { const t = this.t; return t.t === 'id' && (this.lang === 'ps' ? t.k === v : t.v === v); }
  tomaOp(v) { return this.esOp(v) ? this.sig() : null; }
  tomaId(v) { return this.esId(v) ? this.sig() : null; }
  previa() { return this.k[Math.max(0, this.p - 1)]; }
  err(msg, pista, tk) { return new ErrorDojo(msg, (tk || this.t).linea, pista); }
  pideOp(v, msg, pista) { if (this.esOp(v)) return this.sig(); throw this.err(msg || `Falta «${v}».`, pista); }
  desc(t) { t = t || this.t; if (t.t === 'eof') return 'el final del programa'; if (t.t === 'nl') return 'el final de la línea'; if (t.t === 'str') return 'el texto "' + t.v + '"'; return '«' + t.v + '»'; }
}

/* ───────────── Lector de Python ───────────── */
function leerPy(src) {
  const P = new Lector(escanear(src, 'py'), 'py');
  const cuerpo = [];
  while (P.t.t !== 'eof') { if (P.t.t === 'nl') { P.sig(); continue; } cuerpo.push(stmtPy(P)); }
  return { cuerpo, funcs: [] };
}
function dosPuntosPy(P, que) {
  if (P.tomaOp(':')) return;
  if (P.esOp('=')) throw P.err('Para comparar se usan dos iguales: «==».', 'Un solo «=» guarda un valor; «==» pregunta si dos cosas son iguales.');
  throw new ErrorDojo(`Falta «:» al final de la línea del ${que}.`, P.previa().linea, 'En Python, if, elif, else, for, while y def terminan siempre con dos puntos.');
}
function bloquePy(P, que, L) {
  if (P.t.t === 'nl') {
    P.sig();
    if (P.t.t !== 'indent') throw P.err(`La línea que va dentro del ${que} (línea ${L}) necesita sangría: 4 espacios al inicio.`, 'Python sabe qué está dentro de un if, for, while o def por los espacios al inicio de la línea.');
    P.sig(); const c = [];
    while (P.t.t !== 'dedent' && P.t.t !== 'eof') { if (P.t.t === 'nl') { P.sig(); continue; } c.push(stmtPy(P)); }
    if (P.t.t === 'dedent') P.sig();
    return c;
  }
  const s = simplePy(P); finPy(P); return [s];
}
function finPy(P) {
  if (P.t.t === 'nl') { P.sig(); return; }
  if (P.esOp(';')) { P.sig(); if (P.t.t === 'nl') P.sig(); return; }
  if (P.t.t === 'eof' || P.t.t === 'dedent') return;
  const prev = P.previa();
  let pista = 'Revisa si falta un operador, una coma o un paréntesis.';
  if (prev.t === 'id' && prev.v === 'print') pista = 'En Python 3, print lleva paréntesis: print("hola").';
  else if (P.esOp('=')) pista = 'A la izquierda de «=» solo puede ir una variable.';
  throw P.err(`No entiendo esta línea a partir de ${P.desc()}.`, pista);
}
function stmtPy(P) {
  const t = P.t, L = t.linea;
  if (t.t === 'indent') throw P.err('Esta línea tiene espacios de más al inicio y no está dentro de ningún bloque.', 'Quita los espacios del inicio, o revisa si la línea de arriba debía terminar en «:».');
  if (t.t === 'id') {
    if (t.v === 'if') return siPy(P);
    if (t.v === 'while') { P.sig(); const c = exprPy(P); dosPuntosPy(P, 'while'); return { k: 'mientras', c, cuerpo: bloquePy(P, 'while', L), linea: L }; }
    if (t.v === 'for') {
      P.sig(); const vs = [];
      do { const v = P.sig(); if (v.t !== 'id') throw P.err('Después de «for» va el nombre de una variable.'); vs.push({ k: 'var', n: v.v, id: v.v, linea: L }); } while (P.tomaOp(','));
      if (!P.tomaId('in')) throw P.err('Falta «in»: se escribe  for variable in ...', 'Por ejemplo: for i in range(5):');
      const iter = exprPy(P); dosPuntosPy(P, 'for');
      const v = vs.length === 1 ? vs[0] : { k: 'tupla', els: vs, linea: L };
      return { k: 'paracada', v, iter, cuerpo: bloquePy(P, 'for', L), linea: L };
    }
    if (t.v === 'def') {
      P.sig(); const nm = P.sig(); if (nm.t !== 'id') throw P.err('Después de «def» va el nombre de la función.');
      P.pideOp('(', 'Falta «(» después del nombre de la función.', 'Se escribe: def nombre(parametro):');
      const params = [];
      while (!P.esOp(')')) {
        const p = P.sig(); if (p.t !== 'id') throw P.err('Esperaba el nombre de un parámetro.', '', p);
        let def = null; if (P.tomaOp('=')) def = exprPy(P);
        params.push({ n: p.v, id: p.v, def }); if (!P.tomaOp(',')) break;
      }
      P.pideOp(')', 'Falta «)» al cerrar los parámetros.'); dosPuntosPy(P, 'def');
      return { k: 'func', n: nm.v, id: nm.v, params, cuerpo: bloquePy(P, 'def', L), linea: L };
    }
    if (t.v === 'elif' || t.v === 'else') throw P.err(`«${t.v}» sin un «if» justo antes, o con distinta sangría que su if.`, 'El else/elif tiene que estar alineado exactamente con su if.');
  }
  const s = simplePy(P); finPy(P); return s;
}
function siPy(P) {
  const L = P.t.linea; P.sig();
  const c = exprPy(P); dosPuntosPy(P, 'if'); const a = bloquePy(P, 'if', L); let b = null;
  if (P.esId('elif')) b = [siPy(P)];
  else if (P.esId('else')) { const Le = P.t.linea; P.sig(); dosPuntosPy(P, 'else'); b = bloquePy(P, 'else', Le); }
  return { k: 'si', c, a, b, linea: L };
}
function destinoPy(P, e) {
  if (e.k === 'var' || e.k === 'idx') return;
  if (e.k === 'tupla') { e.els.forEach(x => destinoPy(P, x)); return; }
  if (e.k === 'call') throw new ErrorDojo('No se puede guardar un valor en una llamada a función.', e.linea, '¿Querías comparar con «==»?');
  throw new ErrorDojo('A la izquierda de «=» solo puede ir una variable.', e.linea, 'Escribe primero la variable y después el valor: x = 5');
}
function simplePy(P) {
  const t = P.t, L = t.linea;
  if (t.t === 'id') {
    if (t.v === 'return') { P.sig(); const e = (P.t.t === 'nl' || P.t.t === 'eof' || P.esOp(';')) ? null : listaExprPy(P); return { k: 'ret', e, linea: L }; }
    if (t.v === 'break') { P.sig(); return { k: 'break', linea: L }; }
    if (t.v === 'continue') { P.sig(); return { k: 'cont', linea: L }; }
    if (t.v === 'pass') { P.sig(); return { k: 'pass', linea: L }; }
    if (t.v === 'global') { P.sig(); const ns = []; do { ns.push(P.sig().v); } while (P.tomaOp(',')); return { k: 'global', ns, linea: L }; }
    if (t.v === 'import') { P.sig(); do { P.sig(); } while (P.tomaOp(',')); return { k: 'pass', linea: L }; }
    if (t.v === 'from') { P.sig(); P.sig(); if (!P.tomaId('import')) throw P.err('Falta «import».'); const ns = []; do { ns.push(P.sig().v); } while (P.tomaOp(',')); return { k: 'importa', ns, linea: L }; }
  }
  const e = listaExprPy(P);
  if (P.esOp('=')) {
    const ts = [e]; while (P.tomaOp('=')) ts.push(listaExprPy(P));
    const val = ts.pop(); ts.forEach(x => destinoPy(P, x));
    return { k: 'asig', ts, e: val, op: '=', linea: L };
  }
  for (const op of ['+=', '-=', '*=', '/=', '//=', '%=', '**=']) if (P.esOp(op)) {
    P.sig(); const v = exprPy(P); destinoPy(P, e); return { k: 'asig', ts: [e], e: v, op, linea: L };
  }
  return { k: 'expr', e, linea: L };
}
function listaExprPy(P) {
  const L = P.t.linea; const e = exprPy(P);
  if (!P.esOp(',')) return e;
  const els = [e];
  while (P.tomaOp(',')) { if (P.t.t === 'nl' || P.esOp('=') || P.t.t === 'eof') break; els.push(exprPy(P)); }
  return { k: 'tupla', els, linea: L };
}
function exprPy(P) {
  const L = P.t.linea; const a = orPy(P);
  if (P.esId('if') ) { P.sig(); const c = orPy(P); if (!P.tomaId('else')) throw P.err('Falta «else» en la expresión «a if condición else b».'); const b = exprPy(P); return { k: 'tern', c, a, b, linea: L }; }
  return a;
}
function orPy(P) { let a = andPy(P); while (P.esId('or')) { const L = P.sig().linea; a = { k: 'log', op: 'o', a, b: andPy(P), linea: L }; } return a; }
function andPy(P) { let a = notPy(P); while (P.esId('and')) { const L = P.sig().linea; a = { k: 'log', op: 'y', a, b: notPy(P), linea: L }; } return a; }
function notPy(P) { if (P.esId('not')) { const L = P.sig().linea; return { k: 'un', op: 'no', a: notPy(P), linea: L }; } return cmpPy(P); }
const CMP = ['==', '!=', '<', '>', '<=', '>='];
function cmpPy(P) {
  const L = P.t.linea; const es = [sumPy(P)], ops = [];
  for (;;) {
    let op = null;
    if (P.t.t === 'op' && CMP.includes(P.t.v)) op = P.sig().v;
    else if (P.esId('in')) { P.sig(); op = 'in'; }
    else if (P.esId('not') && P.mira(1).t === 'id' && P.mira(1).v === 'in') { P.sig(); P.sig(); op = 'notin'; }
    else if (P.esId('is')) { P.sig(); op = P.tomaId('not') ? '!=' : '=='; }
    if (!op) break; ops.push(op); es.push(sumPy(P));
  }
  if (!ops.length) return es[0];
  return { k: 'cmp', ops, es, linea: L };
}
function sumPy(P) { let a = mulPy(P); while (P.esOp('+') || P.esOp('-')) { const t = P.sig(); a = { k: 'bin', op: t.v, a, b: mulPy(P), linea: t.linea }; } return a; }
function mulPy(P) { let a = unPy(P); while (P.esOp('*') || P.esOp('/') || P.esOp('//') || P.esOp('%')) { const t = P.sig(); a = { k: 'bin', op: t.v, a, b: unPy(P), linea: t.linea }; } return a; }
function unPy(P) { if (P.esOp('-') || P.esOp('+')) { const t = P.sig(); return { k: 'un', op: t.v, a: unPy(P), linea: t.linea }; } return powPy(P); }
function powPy(P) { const a = postPy(P); if (P.esOp('**')) { const t = P.sig(); return { k: 'bin', op: '**', a, b: unPy(P), linea: t.linea }; } return a; }
function argsPy(P) {
  const pos = [], kw = {};
  while (!P.esOp(')')) {
    if (P.t.t === 'eof' || P.t.t === 'nl') throw P.err('Falta cerrar el paréntesis «)».');
    if (P.t.t === 'id' && P.mira(1).t === 'op' && P.mira(1).v === '=') { const n = P.sig().v; P.sig(); kw[n] = exprPy(P); }
    else pos.push(exprPy(P));
    if (!P.tomaOp(',')) break;
  }
  P.pideOp(')', 'Falta cerrar el paréntesis «)».', 'Cada «(» necesita su «)».');
  return { pos, kw };
}
function postPy(P) {
  let e = atomoPy(P);
  for (;;) {
    const L = P.t.linea;
    if (P.esOp('(')) { P.sig(); const ar = argsPy(P); if (e.k === 'var') e = { k: 'call', f: e.n, id: e.id, args: ar.pos, kw: ar.kw, linea: L }; else if (e.k === 'attr') e = { k: 'met', obj: e.obj, m: e.n, args: ar.pos, kw: ar.kw, linea: L }; else throw P.err('Esto no se puede llamar como función.'); continue; }
    if (P.esOp('[')) {
      P.sig(); let a = null, b = null, s = null, esCorte = false;
      if (!P.esOp(':')) a = exprPy(P);
      if (P.tomaOp(':')) { esCorte = true; if (!P.esOp(']') && !P.esOp(':')) b = exprPy(P); if (P.tomaOp(':')) { if (!P.esOp(']')) s = exprPy(P); } }
      P.pideOp(']', 'Falta cerrar el corchete «]».');
      e = esCorte ? { k: 'corte', obj: e, a, b, s, linea: L } : { k: 'idx', obj: e, is: [a], linea: L }; continue;
    }
    if (P.esOp('.')) { P.sig(); const nm = P.sig(); if (nm.t !== 'id') throw P.err('Después del punto va un nombre.'); e = { k: 'attr', obj: e, n: nm.v, linea: L }; continue; }
    return e;
  }
}
function atomoPy(P) {
  const t = P.t, L = t.linea;
  if (t.t === 'num') { P.sig(); return { k: 'num', v: t.v, real: t.real, linea: L }; }
  if (t.t === 'str') { P.sig(); let v = t.v; while (P.t.t === 'str') v += P.sig().v; return { k: 'str', v, linea: L }; }
  if (t.t === 'fstr') { P.sig(); return fstringPy(t.v, L); }
  if (t.t === 'id') {
    if (t.v === 'True' || t.v === 'False') { P.sig(); return { k: 'bool', v: t.v === 'True', linea: L }; }
    if (t.v === 'None') { P.sig(); return { k: 'none', linea: L }; }
    if (t.v === 'true' || t.v === 'false') throw P.err(`En Python se escribe ${t.v === 'true' ? 'True' : 'False'}, con mayúscula.`);
    P.sig(); return { k: 'var', n: t.v, id: t.v, linea: L };
  }
  if (P.esOp('(')) {
    P.sig(); if (P.tomaOp(')')) return { k: 'tupla', els: [], linea: L };
    const e = exprPy(P);
    if (P.esOp(',')) { const els = [e]; while (P.tomaOp(',')) { if (P.esOp(')')) break; els.push(exprPy(P)); } P.pideOp(')', 'Falta cerrar el paréntesis «)».'); return { k: 'tupla', els, linea: L }; }
    P.pideOp(')', 'Falta cerrar el paréntesis «)».', 'Cada «(» necesita su «)».'); return e;
  }
  if (P.esOp('[')) {
    P.sig(); const els = [];
    while (!P.esOp(']')) { if (P.t.t === 'eof') throw P.err('Falta cerrar el corchete «]».'); els.push(exprPy(P)); if (!P.tomaOp(',')) break; }
    P.pideOp(']', 'Falta cerrar el corchete «]».'); return { k: 'lista', els, linea: L };
  }
  if (t.t === 'nl' || t.t === 'eof') throw P.err('La línea termina antes de tiempo: falta algo al final.', 'Por ejemplo, el valor después de un «=» o de un operador.');
  if (P.esOp('=')) throw P.err('Aquí sobra un «=».', '¿Querías comparar? Entonces es «==».');
  throw P.err(`No esperaba ${P.desc()} aquí.`);
}
function fstringPy(txt, L) {
  const partes = []; let i = 0, s = '';
  while (i < txt.length) {
    const c = txt[i];
    if (c === '{' && txt[i + 1] === '{') { s += '{'; i += 2; continue; }
    if (c === '}' && txt[i + 1] === '}') { s += '}'; i += 2; continue; }
    if (c === '{') {
      let j = i + 1, prof = 0, fin = -1, dos = -1;
      for (; j < txt.length; j++) {
        const d = txt[j];
        if ('([{'.includes(d)) prof++; else if (')]'.includes(d)) prof--;
        else if (d === '}') { if (prof === 0) { fin = j; break; } prof--; }
        else if (d === ':' && prof === 0 && dos < 0) dos = j;
      }
      if (fin < 0) throw new ErrorDojo('Falta cerrar una llave «}» dentro de la f-string.', L);
      const ex = txt.slice(i + 1, dos >= 0 ? dos : fin); const fmt = dos >= 0 ? txt.slice(dos + 1, fin) : '';
      if (s) { partes.push(s); s = ''; }
      const Q = new Lector(escanear(ex, 'py').filter(t => t.t !== 'nl').map(t => Object.assign(t, { linea: L })), 'py');
      partes.push({ e: exprPy(Q), fmt }); i = fin + 1; continue;
    }
    s += c; i++;
  }
  if (s) partes.push(s);
  return { k: 'fstr', partes, linea: L };
}

/* ───────────── Lector de PSeInt ───────────── */
const FIN_PS = { si: 'FinSi', mientras: 'FinMientras', para: 'FinPara', segun: 'FinSegun', algoritmo: 'FinAlgoritmo', funcion: 'FinFuncion', subproceso: 'FinSubProceso' };
const INSTR_PS = ['Escribir', 'Leer', 'Definir', 'Dimension', 'Si', 'Mientras', 'Para', 'Repetir', 'Segun'];
function leerPs(src) {
  const P = new Lector(escanear(src, 'ps'), 'ps');
  const funcs = []; let cuerpo = null; const sueltos = [];
  saltaNlPs(P);
  while (P.t.t !== 'eof') {
    if (P.esId('algoritmo') || P.esId('proceso')) {
      const L = P.t.linea; P.sig(); if (P.t.t === 'id') P.sig(); finPs(P);
      if (cuerpo) throw new ErrorDojo('Solo puede haber un Algoritmo.', L);
      cuerpo = bloquePs(P, q => q.esId('finalgoritmo') || q.esId('finproceso'), { que: 'Algoritmo', fin: 'FinAlgoritmo', linea: L });
      P.sig(); finPs(P);
    } else if (P.esId('funcion') || P.esId('subproceso') || P.esId('subalgoritmo')) funcs.push(funcPs(P));
    else sueltos.push(stmtPs(P));
    saltaNlPs(P);
  }
  if (cuerpo && sueltos.length) throw new ErrorDojo('Hay instrucciones fuera del Algoritmo.', sueltos[0].linea, 'Todo lo que hace el programa va entre «Algoritmo nombre» y «FinAlgoritmo».');
  return { cuerpo: cuerpo || sueltos, funcs };
}
function saltaNlPs(P) { while (P.t.t === 'nl' || P.esOp(';')) P.sig(); }
function finPs(P) {
  if (P.t.t === 'nl' || P.esOp(';')) { saltaNlPs(P); return; }
  if (P.t.t === 'eof') return;
  throw P.err(`Sobra algo en esta línea: ${P.desc()}.`, 'Cada instrucción va en su propia línea.');
}
function bloquePs(P, esFin, abre) {
  const c = []; saltaNlPs(P);
  while (!esFin(P)) {
    const t = P.t;
    if (t.t === 'eof' || (t.t === 'id' && (t.k.startsWith('fin') || t.k === 'sino' || t.k === 'hasta')))
      throw new ErrorDojo(`Falta «${abre.fin}» para cerrar el «${abre.que}» de la línea ${abre.linea}.`, abre.linea, t.t === 'eof' ? `Todo ${abre.que} se cierra con su ${abre.fin}.` : `Antes de «${t.v}» (línea ${t.linea}) tiene que cerrarse el ${abre.que} con ${abre.fin}.`);
    c.push(stmtPs(P)); saltaNlPs(P);
  }
  return c;
}
function pideIdPs(P, k, msg, pista, L) {
  if (P.tomaId(k)) return;
  throw new ErrorDojo(msg, L || P.t.linea, pista);
}
function lineaDeCaso(P) {
  // ¿La línea que empieza aquí es una etiqueta de caso («1, 2:» o «Caso 3:»)?
  if (P.esId('caso')) return true;
  for (let j = P.p; j < P.k.length; j++) {
    const t = P.k[j]; if (t.t === 'nl' || t.t === 'eof' || (t.t === 'op' && t.v === ';')) return false;
    if (t.t === 'op' && t.v === ':') return true;
    if (t.t === 'id' && ['escribir', 'leer', 'si', 'mientras', 'para', 'imprimir', 'mostrar'].includes(t.k) && j === P.p) return false;
  }
  return false;
}
function stmtPs(P) {
  const t = P.t, L = t.linea;
  if (t.t !== 'id') {
    if (t.t === 'str') throw P.err('Esta línea empieza con un texto suelto.', 'Para mostrarlo en pantalla: Escribir "texto"');
    throw P.err(`No entiendo esta línea: empieza con ${P.desc()}.`);
  }
  switch (t.k) {
    case 'definir': {
      P.sig(); const ns = [];
      do { const v = P.sig(); if (v.t !== 'id') throw P.err('Esperaba el nombre de una variable.', '', v); ns.push({ n: v.v, id: v.k }); } while (P.tomaOp(','));
      pideIdPs(P, 'como', 'Falta «Como»: se escribe  Definir x Como Entero', 'Los tipos son Entero, Real, Caracter (texto) y Logico.', L);
      const tp = P.sig(); const tipos = { entero: 'entero', real: 'real', numero: 'real', numerico: 'real', caracter: 'texto', texto: 'texto', cadena: 'texto', logico: 'logico' };
      if (tp.t !== 'id' || !tipos[tp.k]) throw P.err(`«${tp.v}» no es un tipo de PSeInt.`, 'Usa Entero, Real, Caracter o Logico.', tp);
      finPs(P); return { k: 'definir', ns, tipo: tipos[tp.k], linea: L };
    }
    case 'dimension': case 'dimensionar': {
      P.sig(); const ds = [];
      do {
        const v = P.sig(); if (v.t !== 'id') throw P.err('Esperaba el nombre del arreglo.', '', v);
        P.pideOp('[', 'Falta «[»: se escribe  Dimension a[10]');
        const dims = [exprPs(P)]; while (P.tomaOp(',')) dims.push(exprPs(P));
        P.pideOp(']', 'Falta «]».'); ds.push({ n: v.v, id: v.k, dims });
      } while (P.tomaOp(','));
      finPs(P); return { k: 'dimension', ds, linea: L };
    }
    case 'escribir': case 'imprimir': case 'mostrar': {
      P.sig(); const args = [];
      if (!(P.t.t === 'nl' || P.t.t === 'eof' || P.esOp(';') || P.esId('sin'))) { do { args.push(exprPs(P)); } while (P.tomaOp(',')); }
      let salto = true;
      if (P.esId('sin')) { P.sig(); if (P.esId('saltar') || P.esId('bajar')) P.sig(); salto = false; }
      finPs(P); return { k: 'escribir', args, salto, linea: L };
    }
    case 'leer': {
      P.sig(); const ts = [];
      do { const e = postPs(P); if (e.k !== 'var' && e.k !== 'idx') throw new ErrorDojo('Leer guarda lo que escribe el usuario en una variable.', L, 'Por ejemplo: Leer edad'); ts.push(e); } while (P.tomaOp(','));
      finPs(P); return { k: 'leer', ts, linea: L };
    }
    case 'si': {
      P.sig(); const c = exprPs(P);
      if (!P.tomaId('entonces')) {
        if (P.esOp('<-')) throw P.err('En la condición del Si se compara con «=», no con «<-».', '«<-» guarda un valor; para preguntar si son iguales: Si x = 5 Entonces');
        throw new ErrorDojo('Falta «Entonces» al final de la línea del Si.', L, 'Se escribe: Si condición Entonces');
      }
      const a = bloquePs(P, q => q.esId('sino') || q.esId('finsi'), { que: 'Si', fin: 'FinSi', linea: L }); let b = null;
      if (P.esId('sino')) { const Ls = P.sig().linea; b = bloquePs(P, q => q.esId('finsi'), { que: 'Si', fin: 'FinSi', linea: L }); void Ls; }
      P.sig(); finPs(P); return { k: 'si', c, a, b, linea: L };
    }
    case 'mientras': {
      P.sig(); const c = exprPs(P);
      pideIdPs(P, 'hacer', 'Falta «Hacer» al final de la línea del Mientras.', 'Se escribe: Mientras condición Hacer', L);
      const cuerpo = bloquePs(P, q => q.esId('finmientras'), { que: 'Mientras', fin: 'FinMientras', linea: L });
      P.sig(); finPs(P); return { k: 'mientras', c, cuerpo, linea: L };
    }
    case 'repetir': {
      P.sig(); finPs(P);
      const esFin = q => q.esId('hasta') || (q.esId('mientras') && q.mira(1).t === 'id' && q.mira(1).k === 'que');
      const cuerpo = bloquePs(P, esFin, { que: 'Repetir', fin: 'Hasta Que', linea: L });
      const hasta = !!P.tomaId('hasta'); if (!hasta) P.sig();
      pideIdPs(P, 'que', 'Falta «Que»: se escribe  Hasta Que condición', '', P.t.linea);
      const c = exprPs(P); finPs(P); return { k: 'repetir', cuerpo, c, hasta, linea: L };
    }
    case 'para': {
      P.sig(); const v = P.sig(); if (v.t !== 'id') throw P.err('Después de «Para» va el nombre de la variable que cuenta.', 'Por ejemplo: Para i <- 1 Hasta 10 Hacer', v);
      if (P.esId('cada')) throw P.err('«Para Cada» no está disponible aquí: usa Para i <- 1 Hasta n.');
      if (!P.tomaOp('<-') && !P.tomaOp('=')) throw P.err('Falta «<-» después de la variable del Para.', 'Por ejemplo: Para i <- 1 Hasta 10 Hacer');
      const desde = exprPs(P);
      pideIdPs(P, 'hasta', 'Falta «Hasta» en el Para.', 'Por ejemplo: Para i <- 1 Hasta 10 Hacer', L);
      const hasta = exprPs(P); let paso = null;
      if (P.tomaId('con')) { pideIdPs(P, 'paso', 'Falta «Paso»: se escribe  Con Paso 2', '', L); paso = exprPs(P); }
      pideIdPs(P, 'hacer', 'Falta «Hacer» al final de la línea del Para.', 'Por ejemplo: Para i <- 1 Hasta 10 Hacer', L);
      const cuerpo = bloquePs(P, q => q.esId('finpara'), { que: 'Para', fin: 'FinPara', linea: L });
      P.sig(); finPs(P); return { k: 'para', v: { k: 'var', n: v.v, id: v.k, linea: L }, desde, hasta, paso, cuerpo, linea: L };
    }
    case 'segun': {
      P.sig(); const e = exprPs(P);
      pideIdPs(P, 'hacer', 'Falta «Hacer» al final de la línea del Segun.', 'Se escribe: Segun variable Hacer', L);
      saltaNlPs(P); const casos = []; let otro = null;
      const finCaso = q => q.esId('finsegun') || (q.esId('de') && q.mira(1).k === 'otro') || lineaDeCaso(q);
      while (!P.esId('finsegun')) {
        if (P.t.t === 'eof') throw new ErrorDojo('Falta «FinSegun».', L);
        if (P.esId('de') && P.mira(1).k === 'otro') { P.sig(); P.sig(); pideIdPs(P, 'modo', 'Falta «Modo»: De Otro Modo:'); P.pideOp(':', 'Falta «:» después de De Otro Modo.'); otro = bloquePs(P, q => q.esId('finsegun'), { que: 'Segun', fin: 'FinSegun', linea: L }); break; }
        P.tomaId('caso'); const vals = [exprPs(P)]; while (P.tomaOp(',')) vals.push(exprPs(P));
        P.pideOp(':', 'Falta «:» después del valor del caso.', 'Por ejemplo:  1: Escribir "uno"');
        const cuerpo = []; saltaNlPs(P);
        while (!finCaso(P)) { if (P.t.t === 'eof') throw new ErrorDojo('Falta «FinSegun».', L); cuerpo.push(stmtPs(P)); saltaNlPs(P); }
        casos.push({ vals, cuerpo });
      }
      P.sig(); finPs(P); return { k: 'segun', e, casos, otro, caida: false, linea: L };
    }
    case 'esperar': case 'borrar': case 'limpiar':
      while (!(P.t.t === 'nl' || P.t.t === 'eof' || P.esOp(';'))) P.sig(); finPs(P); return { k: 'pass', linea: L };
    default: {
      if (t.k.startsWith('fin') || ['sino', 'hasta', 'entonces', 'hacer'].includes(t.k))
        throw P.err(`«${t.v}» está fuera de lugar: aquí no hay ningún bloque abierto que cierre.`, '¿Cerraste antes otro bloque, o falta el Si/Mientras/Para que lo abre?');
      const tgt = postPs(P);
      if (P.esOp('<-') || P.esOp('=')) { P.sig(); const e = exprPs(P); finPs(P); return { k: 'asig', ts: [tgt], e, op: '=', linea: L }; }
      if (tgt.k === 'call') { finPs(P); return { k: 'expr', e: tgt, linea: L }; }
      if (tgt.k === 'var' && (P.t.t === 'nl' || P.t.t === 'eof' || P.esOp(';'))) { finPs(P); return { k: 'expr', e: { k: 'call', f: tgt.n, id: tgt.id, args: [], linea: L }, linea: L }; }
      const sug = parecido(t.v, INSTR_PS);
      throw new ErrorDojo(`No entiendo «${t.v}».`, L, sug ? `¿Quisiste decir «${sug}»?` : 'Para guardar un valor se usa «<-», por ejemplo: x <- 5');
    }
  }
}
function funcPs(P) {
  const L = P.t.linea; const tipo = P.sig().k; const finK = tipo === 'funcion' ? 'finfuncion' : (tipo === 'subproceso' ? 'finsubproceso' : 'finsubalgoritmo');
  let a = P.sig(); if (a.t !== 'id') throw P.err('Falta el nombre de la función.', '', a);
  let ret = null, nombre = a;
  if (P.tomaOp('<-') || P.tomaOp('=')) { ret = { n: a.v, id: a.k }; nombre = P.sig(); if (nombre.t !== 'id') throw P.err('Falta el nombre de la función.', '', nombre); }
  const params = [];
  if (P.tomaOp('(')) {
    while (!P.esOp(')')) {
      const p = P.sig(); if (p.t !== 'id') throw P.err('Esperaba el nombre de un parámetro.', '', p);
      let ref = false; if (P.tomaId('por')) { if (P.tomaId('referencia')) ref = true; else P.tomaId('valor'); }
      params.push({ n: p.v, id: p.k, ref }); if (!P.tomaOp(',')) break;
    }
    P.pideOp(')', 'Falta «)» al cerrar los parámetros.');
  }
  finPs(P);
  const cuerpo = bloquePs(P, q => q.t.t === 'id' && (q.t.k === finK || q.t.k === 'finfuncion' || q.t.k === 'finsubproceso'), { que: tipo === 'funcion' ? 'Funcion' : 'SubProceso', fin: tipo === 'funcion' ? 'FinFuncion' : 'FinSubProceso', linea: L });
  P.sig(); finPs(P);
  return { k: 'func', n: nombre.v, id: nombre.k, params, cuerpo, ret, linea: L };
}
function exprPs(P) { let a = yPs(P); while (P.esId('o') || P.esOp('|')) { const L = P.sig().linea; a = { k: 'log', op: 'o', a, b: yPs(P), linea: L }; } return a; }
function yPs(P) { let a = noPs(P); while (P.esId('y') || P.esOp('&')) { const L = P.sig().linea; a = { k: 'log', op: 'y', a, b: noPs(P), linea: L }; } return a; }
function noPs(P) { if (P.esId('no') || P.esOp('~')) { const L = P.sig().linea; return { k: 'un', op: 'no', a: noPs(P), linea: L }; } return cmpPs(P); }
function cmpPs(P) {
  const a = sumPs(P); const t = P.t;
  if (t.t === 'op' && ['=', '==', '<>', '!=', '<', '>', '<=', '>='].includes(t.v)) {
    P.sig(); const op = t.v === '=' ? '==' : t.v === '<>' ? '!=' : t.v;
    return { k: 'cmp', ops: [op], es: [a, sumPs(P)], linea: t.linea };
  }
  return a;
}
function sumPs(P) { let a = mulPs(P); while (P.esOp('+') || P.esOp('-')) { const t = P.sig(); a = { k: 'bin', op: t.v, a, b: mulPs(P), linea: t.linea }; } return a; }
function mulPs(P) { let a = powPs(P); while (P.esOp('*') || P.esOp('/') || P.esOp('%') || P.esId('mod')) { const t = P.sig(); a = { k: 'bin', op: (t.v === '*' || t.v === '/') ? t.v : '%', a, b: powPs(P), linea: t.linea }; } return a; }
function powPs(P) { const a = unPs(P); if (P.esOp('^')) { const t = P.sig(); return { k: 'bin', op: '**', a, b: powPs(P), linea: t.linea }; } return a; }
function unPs(P) { if (P.esOp('-') || P.esOp('+')) { const t = P.sig(); return { k: 'un', op: t.v, a: unPs(P), linea: t.linea }; } return postPs(P); }
function postPs(P) {
  const t = P.t, L = t.linea;
  if (t.t === 'num') { P.sig(); return { k: 'num', v: t.v, real: t.real, linea: L }; }
  if (t.t === 'str') { P.sig(); return { k: 'str', v: t.v, linea: L }; }
  if (P.esOp('(')) { P.sig(); const e = exprPs(P); P.pideOp(')', 'Falta cerrar el paréntesis «)».'); return e; }
  if (t.t === 'id') {
    if (t.k === 'verdadero' || t.k === 'falso') { P.sig(); return { k: 'bool', v: t.k === 'verdadero', linea: L }; }
    P.sig();
    if (P.esOp('(')) {
      P.sig(); const args = [];
      while (!P.esOp(')')) { if (P.t.t === 'nl' || P.t.t === 'eof') throw P.err('Falta cerrar el paréntesis «)».'); args.push(exprPs(P)); if (!P.tomaOp(',')) break; }
      P.pideOp(')', 'Falta cerrar el paréntesis «)».'); return { k: 'call', f: t.v, id: t.k, args, linea: L };
    }
    if (P.esOp('[')) {
      P.sig(); const is = [exprPs(P)]; while (P.tomaOp(',')) is.push(exprPs(P));
      P.pideOp(']', 'Falta cerrar el corchete «]».');
      let e = { k: 'idx', obj: { k: 'var', n: t.v, id: t.k, linea: L }, is, linea: L, base1: true };
      while (P.esOp('[')) { P.sig(); const j = [exprPs(P)]; P.pideOp(']'); e = { k: 'idx', obj: e, is: j, linea: L, base1: true }; }
      return e;
    }
    return { k: 'var', n: t.v, id: t.k, linea: L };
  }
  if (t.t === 'nl' || t.t === 'eof') throw P.err('La línea termina antes de tiempo: falta un valor.', 'Por ejemplo, después de «<-» o de un operador.');
  throw P.err(`No esperaba ${P.desc()} aquí.`);
}

/* ───────────── Lector de C++ ───────────── */
const TIPOS_CPP = new Set(['int', 'double', 'float', 'bool', 'string', 'char', 'long', 'short', 'unsigned', 'signed', 'void', 'auto', 'const', 'vector', 'size_t']);
function quitaStd(P) { if (P.esId('std') && P.mira(1).t === 'op' && P.mira(1).v === '::') { P.sig(); P.sig(); } }
function esTipoCpp(P) {
  const t = P.t; if (t.t !== 'id') return false;
  if (TIPOS_CPP.has(t.v)) return true;
  return t.v === 'std' && P.mira(1).v === '::' && TIPOS_CPP.has(P.mira(2).v);
}
function cierraAngulo(P) {
  if (P.esOp('>')) { P.sig(); return; }
  if (P.esOp('>>')) { P.t.v = '>'; return; }
  throw P.err('Falta «>» al cerrar el tipo del vector.', 'Por ejemplo: vector<int> numeros;');
}
function tipoCpp(P) {
  while (P.tomaId('const') || P.tomaId('signed')) { /* se ignoran */ }
  quitaStd(P);
  const t = P.sig(); let base = t.v;
  if (base === 'unsigned') { if (P.esId('int') || P.esId('long') || P.esId('short') || P.esId('char')) P.sig(); base = 'int'; }
  else if (base === 'long') { if (P.esId('long')) P.sig(); if (P.esId('int')) P.sig(); if (P.tomaId('double')) base = 'double'; else base = 'int'; }
  else if (base === 'short' || base === 'size_t') { if (P.esId('int')) P.sig(); base = 'int'; }
  else if (base === 'float') base = 'double';
  if (base === 'vector') { P.pideOp('<', 'Falta «<»: se escribe  vector<int> v;'); const el = tipoCpp(P); cierraAngulo(P); return { base: 'vector', elem: el }; }
  return { base };
}
function leerCpp(src) {
  const P = new Lector(escanear(src, 'cpp'), 'cpp');
  const funcs = [], cuerpo = [];
  while (P.t.t !== 'eof') {
    if (P.esId('using')) { while (!P.esOp(';') && P.t.t !== 'eof') P.sig(); P.tomaOp(';'); continue; }
    if (esTipoCpp(P)) {
      const guarda = P.p; const tipo = tipoCpp(P); const nm = P.t;
      if (nm.t === 'id' && P.mira(1).t === 'op' && P.mira(1).v === '(' && esDefFuncion(P)) { const f = funcCpp(P, tipo); if (f) funcs.push(f); continue; }
      P.p = guarda;
    }
    cuerpo.push(stmtCpp(P));
  }
  return { cuerpo, funcs };
}
function esDefFuncion(P) {
  let j = P.p + 2, prof = 1;
  for (; j < P.k.length && prof > 0; j++) { const t = P.k[j]; if (t.t === 'op' && t.v === '(') prof++; else if (t.t === 'op' && t.v === ')') prof--; else if (t.t === 'eof') return false; }
  const sig = P.k[j];
  if (sig && sig.t === 'op' && sig.v === '{') return true;
  if (sig && sig.t === 'op' && sig.v === ';') { const pri = P.k[P.p + 2]; return (pri.t === 'op' && pri.v === ')') || (pri.t === 'id' && TIPOS_CPP.has(pri.v)) || (pri.t === 'id' && pri.v === 'std'); }
  return false;
}
function funcCpp(P, tipo) {
  const nm = P.sig(); const L = nm.linea; P.sig();
  const params = [];
  while (!P.esOp(')')) {
    if (P.t.t === 'eof') throw P.err('Falta «)» al cerrar los parámetros.');
    if (P.esId('void') && P.mira(1).v === ')') { P.sig(); break; }
    const tp = tipoCpp(P); let ref = false; if (P.tomaOp('&')) ref = true;
    const pn = P.sig(); if (pn.t !== 'id') throw P.err('Esperaba el nombre del parámetro.', '', pn);
    let arr = false; while (P.tomaOp('[')) { if (!P.esOp(']')) exprCpp(P); P.pideOp(']'); arr = true; }
    params.push({ n: pn.v, id: pn.v, ref, tipo: tp, arr }); if (!P.tomaOp(',')) break;
  }
  P.pideOp(')', 'Falta «)» al cerrar los parámetros.');
  if (P.tomaOp(';')) return null;
  if (!P.esOp('{')) throw P.err('Falta «{» para abrir el cuerpo de la función.');
  const b = stmtCpp(P);
  return { k: 'func', n: nm.v, id: nm.v, params, cuerpo: b.cuerpo, tipo, linea: L };
}
function finCpp(P) {
  if (P.tomaOp(';')) return;
  const prev = P.previa();
  throw new ErrorDojo('Falta «;» al final de esta línea.', prev.linea, 'En C++ casi todas las instrucciones terminan en punto y coma.');
}
function condCpp(P, que, L) {
  if (!P.tomaOp('(')) throw new ErrorDojo(`Falta «(»: en C++ la condición del ${que} va entre paréntesis.`, L, `Por ejemplo: ${que} (x > 5)`);
  const c = exprCpp(P);
  if (!P.tomaOp(')')) throw new ErrorDojo(`Falta «)» al cerrar la condición del ${que}.`, P.previa().linea, 'Cada «(» necesita su «)».');
  return c;
}
function stmtCpp(P) {
  const t = P.t, L = t.linea;
  if (P.esOp('{')) {
    P.sig(); const c = [];
    while (!P.esOp('}')) { if (P.t.t === 'eof') throw new ErrorDojo(`Falta «}» para cerrar la llave «{» de la línea ${L}.`, L, 'Cada «{» necesita su «}».'); c.push(stmtCpp(P)); }
    P.sig(); return { k: 'bloque', cuerpo: c, linea: L };
  }
  if (P.esOp(';')) { P.sig(); return { k: 'pass', linea: L }; }
  if (P.esOp('}')) throw P.err('Esta «}» sobra: no cierra ninguna llave abierta.');
  if (t.t === 'id') switch (t.v) {
    case 'if': { P.sig(); const c = condCpp(P, 'if', L); const a = stmtCpp(P); let b = null; if (P.tomaId('else')) b = [stmtCpp(P)]; return { k: 'si', c, a: [a], b, linea: L }; }
    case 'while': { P.sig(); const c = condCpp(P, 'while', L); return { k: 'mientras', c, cuerpo: [stmtCpp(P)], linea: L }; }
    case 'do': {
      P.sig(); const cu = stmtCpp(P);
      if (!P.tomaId('while')) throw P.err('Falta «while (condición);» después del do { }.');
      const c = condCpp(P, 'while', P.previa().linea); finCpp(P);
      return { k: 'repetir', cuerpo: [cu], c, hasta: false, linea: L };
    }
    case 'for': {
      P.sig(); P.pideOp('(', 'Falta «(» después de for.', 'Por ejemplo: for (int i = 0; i < 10; i++)');
      if (esTipoCpp(P)) {
        const g = P.p; const tp = tipoCpp(P); const ref = !!P.tomaOp('&'); const v = P.t;
        if (v.t === 'id' && P.mira(1).t === 'op' && P.mira(1).v === ':') {
          P.sig(); P.sig(); const it = exprCpp(P); P.pideOp(')', 'Falta «)».');
          return { k: 'paracada', v: { k: 'var', n: v.v, id: v.v, linea: L }, tipo: tp, ref, decl: true, iter: it, cuerpo: [stmtCpp(P)], linea: L };
        }
        P.p = g;
      }
      let init = null;
      if (esTipoCpp(P)) init = declCpp(P); else if (P.tomaOp(';')) init = null; else { init = { k: 'expr', e: exprCpp(P), linea: L }; finCpp(P); }
      const c = P.esOp(';') ? null : exprCpp(P);
      if (!P.tomaOp(';')) throw new ErrorDojo('El for lleva dos «;» entre sus tres partes.', L, 'Así: for (int i = 0; i < 10; i++)');
      const upd = P.esOp(')') ? null : exprCpp(P);
      P.pideOp(')', 'Falta «)» al cerrar el for.');
      return { k: 'forc', init, c, upd, cuerpo: [stmtCpp(P)], linea: L };
    }
    case 'return': { P.sig(); const e = P.esOp(';') ? null : exprCpp(P); finCpp(P); return { k: 'ret', e, linea: L }; }
    case 'break': P.sig(); finCpp(P); return { k: 'break', linea: L };
    case 'continue': P.sig(); finCpp(P); return { k: 'cont', linea: L };
    case 'switch': {
      P.sig(); const e = condCpp(P, 'switch', L); P.pideOp('{', 'Falta «{» después del switch.');
      const casos = []; let otro = null, cur = null;
      while (!P.esOp('}')) {
        if (P.t.t === 'eof') throw new ErrorDojo('Falta «}» al final del switch.', L);
        if (P.tomaId('case')) { const v = exprCpp(P); P.pideOp(':', 'Falta «:» después del case.'); cur = { vals: [v], cuerpo: [] }; casos.push(cur); continue; }
        if (P.tomaId('default')) { P.pideOp(':', 'Falta «:» después de default.'); cur = { vals: null, cuerpo: [] }; casos.push(cur); otro = cur; continue; }
        if (!cur) throw P.err('Dentro del switch todo va después de un «case valor:».');
        cur.cuerpo.push(stmtCpp(P));
      }
      P.sig(); return { k: 'segun', e, casos, otro: null, caida: true, linea: L };
    }
    case 'else': throw P.err('«else» sin un if justo antes.', '¿Pusiste un «;» justo después del if (...)? Eso termina el if ahí.');
  }
  if (esTipoCpp(P)) return declCpp(P);
  const e = exprCpp(P);
  if (t.t === 'id' && P.t.t === 'id' && P.previa() === t) throw P.err(`No conozco el tipo «${t.v}».`, 'Los tipos que puedes usar: int, double, bool, char, string y vector<...>.');
  finCpp(P); return { k: 'expr', e, linea: L };
}
function declCpp(P) {
  const L = P.t.linea; const tipo = tipoCpp(P); const ds = [];
  if (tipo.base === 'void') throw P.err('Una variable no puede ser void.');
  do {
    const nm = P.sig(); if (nm.t !== 'id') throw P.err('Esperaba el nombre de la variable.', '', nm);
    const d = { n: nm.v, id: nm.v, dims: null, init: null, ctor: null, linea: nm.linea };
    if (P.esOp('[')) { d.dims = []; while (P.tomaOp('[')) { d.dims.push(P.esOp(']') ? null : exprCpp(P)); P.pideOp(']', 'Falta «]».'); } }
    if (P.tomaOp('=')) d.init = P.esOp('{') ? llavesCpp(P) : asigCpp(P);
    else if (P.esOp('{')) d.init = llavesCpp(P);
    else if (P.esOp('(')) { P.sig(); d.ctor = []; while (!P.esOp(')')) { d.ctor.push(asigCpp(P)); if (!P.tomaOp(',')) break; } P.pideOp(')', 'Falta «)».'); }
    ds.push(d);
  } while (P.tomaOp(','));
  finCpp(P); return { k: 'decl', tipo, ds, linea: L };
}
function llavesCpp(P) {
  const L = P.sig().linea; const els = [];
  while (!P.esOp('}')) { els.push(P.esOp('{') ? llavesCpp(P) : asigCpp(P)); if (!P.tomaOp(',')) break; }
  P.pideOp('}', 'Falta «}» al cerrar la lista de valores.'); return { k: 'lista', els, linea: L };
}
function exprCpp(P) { return asigCpp(P); }
function esLvalor(e) { return e.k === 'var' || e.k === 'idx'; }
function asigCpp(P) {
  const L = P.t.linea; const a = ternCpp(P);
  for (const op of ['=', '+=', '-=', '*=', '/=', '%=']) if (P.esOp(op)) {
    P.sig(); if (!esLvalor(a)) throw new ErrorDojo('A la izquierda de «' + op + '» tiene que ir una variable.', L, op === '=' ? '¿Querías comparar? En C++ se compara con «==».' : '');
    return { k: 'asigx', op, t: a, e: asigCpp(P), linea: L };
  }
  return a;
}
function ternCpp(P) { const a = orCpp(P); if (P.esOp('?')) { const L = P.sig().linea; const x = asigCpp(P); P.pideOp(':', 'Falta «:» en la expresión con «?».'); const y = asigCpp(P); return { k: 'tern', c: a, a: x, b: y, linea: L }; } return a; }
function orCpp(P) { let a = andCpp(P); while (P.esOp('||') || P.esId('or')) { const L = P.sig().linea; a = { k: 'log', op: 'o', a, b: andCpp(P), linea: L }; } return a; }
function andCpp(P) { let a = eqCpp(P); while (P.esOp('&&') || P.esId('and')) { const L = P.sig().linea; a = { k: 'log', op: 'y', a, b: eqCpp(P), linea: L }; } return a; }
function eqCpp(P) { let a = relCpp(P); while (P.esOp('==') || P.esOp('!=')) { const t = P.sig(); a = { k: 'cmp', ops: [t.v], es: [a, relCpp(P)], linea: t.linea }; } return a; }
function relCpp(P) { let a = shCpp(P); while (['<', '>', '<=', '>='].some(o => P.esOp(o))) { const t = P.sig(); a = { k: 'cmp', ops: [t.v], es: [a, shCpp(P)], linea: t.linea }; } return a; }
function shCpp(P) { let a = sumCpp(P); while (P.esOp('<<') || P.esOp('>>')) { const t = P.sig(); a = { k: 'flujo', op: t.v, a, b: sumCpp(P), linea: t.linea }; } return a; }
function sumCpp(P) { let a = mulCpp(P); while (P.esOp('+') || P.esOp('-')) { const t = P.sig(); a = { k: 'bin', op: t.v, a, b: mulCpp(P), linea: t.linea }; } return a; }
function mulCpp(P) { let a = unCpp(P); while (P.esOp('*') || P.esOp('/') || P.esOp('%')) { const t = P.sig(); a = { k: 'bin', op: t.v, a, b: unCpp(P), linea: t.linea }; } return a; }
function unCpp(P) {
  const t = P.t, L = t.linea;
  if (P.esOp('!') || P.esId('not')) { P.sig(); return { k: 'un', op: 'no', a: unCpp(P), linea: L }; }
  if (P.esOp('-') || P.esOp('+')) { P.sig(); return { k: 'un', op: t.v, a: unCpp(P), linea: L }; }
  if (P.esOp('++') || P.esOp('--')) { P.sig(); const a = unCpp(P); if (!esLvalor(a)) throw P.err(`«${t.v}» solo funciona sobre una variable.`); return { k: 'inc', op: t.v, pre: true, t: a, linea: L }; }
  if (P.esOp('(') && P.mira(1).t === 'id' && ['int', 'double', 'float', 'bool', 'char', 'long'].includes(P.mira(1).v) && P.mira(2).v === ')') {
    P.sig(); const tp = tipoCpp(P); P.sig(); return { k: 'cast', tipo: tp, e: unCpp(P), linea: L };
  }
  return postCpp(P);
}
function postCpp(P) {
  let e = atomoCpp(P);
  for (;;) {
    const L = P.t.linea;
    if (P.esOp('(')) {
      P.sig(); const args = []; while (!P.esOp(')')) { if (P.t.t === 'eof') throw P.err('Falta «)».'); args.push(asigCpp(P)); if (!P.tomaOp(',')) break; }
      P.pideOp(')', 'Falta cerrar el paréntesis «)».');
      if (e.k === 'var') e = { k: 'call', f: e.n, id: e.id, args, linea: L };
      else if (e.k === 'attr') e = { k: 'met', obj: e.obj, m: e.n, args, linea: L };
      else throw P.err('Esto no se puede llamar como función.');
      continue;
    }
    if (P.esOp('[')) { P.sig(); const i = exprCpp(P); P.pideOp(']', 'Falta «]».'); e = { k: 'idx', obj: e, is: [i], linea: L }; continue; }
    if (P.esOp('.')) { P.sig(); const nm = P.sig(); e = { k: 'attr', obj: e, n: nm.v, linea: L }; continue; }
    if (P.esOp('++') || P.esOp('--')) { const t = P.sig(); if (!esLvalor(e)) throw P.err(`«${t.v}» solo funciona sobre una variable.`); e = { k: 'inc', op: t.v, pre: false, t: e, linea: L }; continue; }
    return e;
  }
}
function atomoCpp(P) {
  const t = P.t, L = t.linea;
  if (t.t === 'num') { P.sig(); return { k: 'num', v: t.v, real: t.real, linea: L }; }
  if (t.t === 'str') { P.sig(); let v = t.v; while (P.t.t === 'str') v += P.sig().v; return { k: 'str', v, linea: L }; }
  if (t.t === 'chr') { P.sig(); if (t.v.length !== 1) throw P.err("Entre comillas simples va un solo carácter: 'a'.", 'Para textos largos usa comillas dobles: "hola".', t); return { k: 'chr', v: t.v, linea: L }; }
  if (t.t === 'id') {
    quitaStd(P); const u = P.sig();
    if (u.v === 'true' || u.v === 'false') return { k: 'bool', v: u.v === 'true', linea: L };
    if (u.v === 'string' && P.esOp('::')) { P.sig(); const q = P.sig(); if (q.v !== 'npos') throw P.err('Solo conozco string::npos.'); return { k: 'num', v: -1, real: false, linea: L }; }
    if (u.v === 'static_cast') { P.pideOp('<'); const tp = tipoCpp(P); cierraAngulo(P); P.pideOp('('); const e = exprCpp(P); P.pideOp(')'); return { k: 'cast', tipo: tp, e, linea: L }; }
    if (['int', 'double', 'float', 'char', 'bool', 'long'].includes(u.v) && P.esOp('(')) { P.p--; P.k[P.p] = u; const tp = tipoCpp(P); P.sig(); const e = exprCpp(P); P.pideOp(')'); return { k: 'cast', tipo: tp, e, linea: L }; }
    return { k: 'var', n: u.v, id: u.v, linea: L };
  }
  if (P.esOp('(')) { P.sig(); const e = exprCpp(P); P.pideOp(')', 'Falta cerrar el paréntesis «)».'); return e; }
  if (P.esOp('{')) return llavesCpp(P);
  if (t.t === 'eof') throw P.err('El programa termina antes de tiempo.', '¿Falta cerrar una llave o un paréntesis?');
  if (P.esOp(';')) throw P.err('Falta un valor antes del «;».');
  throw P.err(`No esperaba ${P.desc()} aquí.`);
}

/* ───────────── Cómo se muestra cada valor ───────────── */
function exponentePy(s) {
  let [m, ex] = s.split('e'); const sg = ex[0] === '-' ? '-' : '+'; ex = ex.replace(/^[+-]/, '');
  if (ex.length < 2) ex = '0' + ex; return m + 'e' + sg + ex;
}
function reprFloat(x) {
  if (!isFinite(x)) return isNaN(x) ? 'nan' : (x > 0 ? 'inf' : '-inf');
  const a = Math.abs(x);
  if (a >= 1e16 || (a < 1e-4 && x !== 0)) return exponentePy(x.toExponential());
  if (Number.isInteger(x)) return x.toFixed(1);
  return String(x);
}
function fmtG(x) {
  if (!isFinite(x)) return isNaN(x) ? 'nan' : (x > 0 ? 'inf' : '-inf');
  if (x === 0) return '0';
  const [m0, ex] = x.toExponential(5).split('e'); const exp = parseInt(ex, 10);
  if (exp < -4 || exp >= 6) { const m = m0.includes('.') ? m0.replace(/\.?0+$/, '') : m0; return m + 'e' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0'); }
  let f = x.toFixed(Math.max(0, 5 - exp)); if (f.includes('.')) f = f.replace(/\.?0+$/, ''); return f;
}
function fmtPs(x) {
  if (Number.isInteger(x)) return String(x);
  if (!isFinite(x)) return String(x);
  return String(parseFloat(x.toFixed(10)));
}
function textoDe(v, lang) {
  if (typeof v === 'string') return v;
  if (v instanceof Car) return v.c;
  if (typeof v === 'boolean') return lang === 'py' ? (v ? 'True' : 'False') : lang === 'ps' ? (v ? 'VERDADERO' : 'FALSO') : (v ? '1' : '0');
  if (v === null) return lang === 'py' ? 'None' : '';
  if (v instanceof Real) return lang === 'py' ? reprFloat(v.v) : lang === 'cpp' ? fmtG(v.v) : fmtPs(v.v);
  if (typeof v === 'number') return lang === 'ps' ? fmtPs(v) : String(v);
  if (Array.isArray(v) && lang === 'py') {
    if (v.rango) return v.rango;
    const dentro = v.map(x => reprPy(x)).join(', ');
    return v.tupla ? '(' + dentro + (v.length === 1 ? ',)' : ')') : '[' + dentro + ']';
  }
  if (v && v.fn) return '<function ' + v.fn.n + '>';
  return String(v);
}
function reprPy(v) {
  if (typeof v === 'string') return (v.includes("'") && !v.includes('"')) ? '"' + v + '"' : "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  return textoDe(v, 'py');
}
function nombreTipo(v, lang) {
  if (typeof v === 'string') return lang === 'py' ? 'texto (str)' : lang === 'ps' ? 'texto' : 'texto (string)';
  if (typeof v === 'boolean') return lang === 'ps' ? 'lógico' : 'booleano';
  if (v instanceof Real) return lang === 'py' ? 'decimal (float)' : lang === 'ps' ? 'número' : 'decimal (double)';
  if (typeof v === 'number') return lang === 'py' ? 'entero (int)' : lang === 'ps' ? 'número' : 'entero (int)';
  if (Array.isArray(v)) return lang === 'py' ? 'lista' : lang === 'ps' ? 'arreglo' : 'arreglo';
  if (v === null) return 'None';
  return 'valor';
}
function formatoPy(v, spec, L) {
  const m = /^([<>^]?)(\d*)(?:\.(\d+))?([fdse%]?)$/.exec(spec);
  if (!m) throw new ErrorDojo(`No conozco el formato «:${spec}» de la f-string.`, L, 'Los más usados: {x:.2f} (dos decimales) y {x:5} (ancho 5).');
  let s;
  const [, ali, ancho, dec, tipo] = m;
  if (tipo === 'f' || (dec !== undefined && tipo === '')) { if (!esNum(v)) throw new ErrorDojo('El formato «.Nf» es para números.', L); s = N(v).toFixed(dec === undefined ? 6 : +dec); }
  else if (tipo === 'd') { if (!esNum(v) || esR(v)) throw new ErrorDojo('El formato «d» es para números enteros.', L); s = String(N(v)); }
  else if (tipo === '%') s = (N(v) * 100).toFixed(dec === undefined ? 6 : +dec) + '%';
  else s = textoDe(v, 'py');
  if (ancho) {
    const w = +ancho; const izq = ali === '<' || (!ali && typeof v === 'string');
    if (ali === '^') { const tot = Math.max(0, w - s.length), a = Math.floor(tot / 2); s = ' '.repeat(a) + s + ' '.repeat(tot - a); }
    else s = izq ? s.padEnd(w) : s.padStart(w);
  }
  return s;
}

/* ───────────── Variables ───────────── */
class Ambito {
  constructor(padre) { this.m = new Map(); this.padre = padre; this.globalesDecl = null; }
  busca(id) { let a = this; while (a) { const c = a.m.get(id); if (c) return c; a = a.padre; } return null; }
  todos() { const s = []; let a = this; while (a) { for (const c of a.m.values()) s.push(c.n); a = a.padre; } return s; }
}
const FLUJO_COUT = { flujo: 'cout' }, FLUJO_CIN = { flujo: 'cin' }, ENDL = { endl: true };

/* ───────────── La máquina ───────────── */
function crearArreglo(dims, relleno) {
  const a = new Array(dims[0]);
  for (let k = 0; k < dims[0]; k++) a[k] = dims.length > 1 ? crearArreglo(dims.slice(1), relleno) : relleno;
  return a;
}
function copia(x) { return Array.isArray(x) ? x.map(copia) : x; }
function valorCero(tp) { const b = tp && tp.base; return b === 'double' ? R(0) : b === 'bool' ? false : b === 'string' ? '' : b === 'char' ? new Car('\0') : b === 'vector' ? [] : 0; }
function nombreExpr(e) {
  if (!e) return 'esto';
  if (e.k === 'var') return e.n;
  if (e.k === 'idx') return nombreExpr(e.obj) + '[' + e.is.map(x => x.k === 'num' ? x.v : x.k === 'var' ? x.n : '…').join(', ') + ']';
  if (e.k === 'attr') return nombreExpr(e.obj) + '.' + e.n;
  return 'esto';
}
const RE_NUM = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

class Maquina {
  constructor(prog, lang) {
    this.prog = prog; this.lang = lang; this.out = []; this.eventos = []; this.pasos = 0; this.prof = 0;
    this.funcs = new Map(); this.globales = new Ambito(null); this.buf = ''; this.linea = 0; this.importados = new Set();
  }
  escribe(s) {
    if (!s) return; this.out.push(s);
    const u = this.eventos[this.eventos.length - 1];
    if (u && u.t === 'out') u.s += s; else this.eventos.push({ t: 'out', s });
  }
  *pideLinea() { const v = yield { pide: true }; const s = v == null ? '' : String(v); this.eventos.push({ t: 'in', s }); return s; }
  paso(L) {
    if (++this.pasos > LIMITE_PASOS) throw new ErrorDojo('El programa dio más de 300.000 pasos y lo detuve. ¿Hay un bucle que nunca termina?', L || this.linea, 'Revisa que dentro del bucle cambie algo que haga falsa la condición alguna vez.');
  }
  *correr() {
    const p = this.prog, L = this.lang;
    for (const f of p.funcs) { if (this.funcs.has(f.id)) throw new ErrorDojo(`La función «${f.n}» está escrita dos veces.`, f.linea); this.funcs.set(f.id, f); }
    try {
      if (L === 'py') yield* this.bloque(p.cuerpo, this.globales);
      else if (L === 'ps') yield* this.bloque(p.cuerpo, new Ambito(null));
      else {
        yield* this.bloque(p.cuerpo, this.globales);
        const main = this.funcs.get('main');
        if (main) yield* this.bloque(main.cuerpo, new Ambito(this.globales));
      }
    } catch (c) {
      if (!(c instanceof Corte)) throw c;
      if (c.tipo === 'ret' && L === 'cpp') return;
      if (c.tipo === 'ret') throw new ErrorDojo('«return» fuera de una función.', this.linea);
      throw new ErrorDojo(c.tipo === 'break' ? '«break» fuera de un bucle.' : '«continue» fuera de un bucle.', this.linea);
    }
  }
  *bloque(stmts, amb) { for (const s of stmts) yield* this.exec(s, amb); }
  *vuelta(cuerpo, amb) {
    try { yield* this.bloque(cuerpo, amb); }
    catch (c) { if (c instanceof Corte) { if (c.tipo === 'break') return 'break'; if (c.tipo === 'cont') return 'cont'; } throw c; }
    return null;
  }
  *exec(s, amb) {
    this.paso(s.linea); this.linea = s.linea;
    switch (s.k) {
      case 'pass': return;
      case 'expr': yield* this.ev(s.e, amb); return;
      case 'asig': {
        if (s.op === '=') { const v = yield* this.ev(s.e, amb); for (const t of s.ts) yield* this.asignar(t, v, amb, s.linea); return; }
        const t = s.ts[0]; const act = yield* this.ev(t, amb); const r = yield* this.ev(s.e, amb);
        let v;
        if (this.lang === 'py' && s.op === '+=' && Array.isArray(act)) { if (!Array.isArray(r)) throw new ErrorDojo('A una lista solo se le puede sumar otra lista.', s.linea, 'Para añadir un elemento usa .append(x).'); act.push(...r); v = act; }
        else v = this.opBin(s.op.slice(0, -1), act, r, s.linea);
        yield* this.asignar(t, v, amb, s.linea); return;
      }
      case 'escribir': {
        let txt = '';
        for (const a of s.args) {
          const v = yield* this.ev(a, amb);
          if (Array.isArray(v)) throw new ErrorDojo('No se puede escribir un arreglo entero de una vez.', s.linea, 'Recórrelo con un Para y escribe cada posición.');
          txt += textoDe(v, 'ps');
        }
        this.escribe(txt + (s.salto ? '\n' : '')); return;
      }
      case 'leer':
        for (const t of s.ts) {
          const txt = yield* this.pideLinea(); const tipo = this.tipoDestino(t, amb);
          yield* this.asignar(t, this.convierteLeidoPs(txt, tipo, t, s.linea), amb, s.linea);
        }
        return;
      case 'definir':
        for (const d of s.ns) {
          const c = amb.m.get(d.id);
          if (c && c.tipo) throw new ErrorDojo(`La variable «${d.n}» ya estaba definida.`, s.linea);
          if (c) c.tipo = s.tipo; else amb.m.set(d.id, { n: d.n, v: undefined, tipo: s.tipo });
        }
        return;
      case 'dimension':
        for (const d of s.ds) {
          const dims = [];
          for (const e of d.dims) { const x = yield* this.ev(e, amb); if (!esNum(x) || !Number.isInteger(N(x)) || N(x) < 1) throw new ErrorDojo('El tamaño de un arreglo tiene que ser un número entero mayor que 0.', s.linea); dims.push(N(x)); }
          let c = amb.m.get(d.id); if (!c) { c = { n: d.n, tipo: null }; amb.m.set(d.id, c); }
          c.v = crearArreglo(dims, undefined); c.dims = dims;
        }
        return;
      case 'si': { const c = yield* this.ev(s.c, amb); if (this.verdad(c, s.linea)) yield* this.bloque(s.a, amb); else if (s.b) yield* this.bloque(s.b, amb); return; }
      case 'bloque': yield* this.bloque(s.cuerpo, new Ambito(amb)); return;
      case 'mientras':
        for (;;) { this.paso(s.linea); const c = yield* this.ev(s.c, amb); if (!this.verdad(c, s.linea)) break; if ((yield* this.vuelta(s.cuerpo, amb)) === 'break') break; }
        return;
      case 'repetir':
        for (;;) {
          this.paso(s.linea); if ((yield* this.vuelta(s.cuerpo, amb)) === 'break') break;
          const c = this.verdad(yield* this.ev(s.c, amb), s.linea); if (s.hasta ? c : !c) break;
        }
        return;
      case 'para': {
        const ini = yield* this.ev(s.desde, amb), fin = yield* this.ev(s.hasta, amb);
        const pa = s.paso ? yield* this.ev(s.paso, amb) : 1;
        if (!esNum(ini) || !esNum(fin) || !esNum(pa)) throw new ErrorDojo('El Para cuenta con números: revisa el inicio, el final y el paso.', s.linea);
        const p = N(pa); if (p === 0) throw new ErrorDojo('El paso del Para no puede ser 0.', s.linea);
        let i = N(ini); const f = N(fin);
        while (p > 0 ? i <= f : i >= f) {
          this.paso(s.linea); yield* this.asignar(s.v, i, amb, s.linea);
          if ((yield* this.vuelta(s.cuerpo, amb)) === 'break') break;
          i = N(yield* this.ev(s.v, amb)) + p;
        }
        return;
      }
      case 'paracada': {
        const it = yield* this.ev(s.iter, amb);
        let lista;
        if (typeof it === 'string') lista = [...it];
        else if (Array.isArray(it)) lista = it;
        else throw new ErrorDojo(`Un ${nombreTipo(it, this.lang)} no se puede recorrer con for.`, s.linea, this.lang === 'py' && esNum(it) ? 'Para contar hasta un número usa range:  for i in range(n):' : 'Se recorre un texto o una lista.');
        for (let k = 0; k < lista.length; k++) {
          this.paso(s.linea); let sc = amb;
          if (this.lang === 'cpp') {
            sc = new Ambito(amb);
            if (s.ref && Array.isArray(it)) { const arr = it, kk = k; sc.m.set(s.v.id, { n: s.v.n, tipo: s.tipo, get v() { return arr[kk]; }, set v(x) { arr[kk] = x; } }); }
            else { const el = typeof it === 'string' ? new Car(lista[k]) : lista[k]; sc.m.set(s.v.id, { n: s.v.n, tipo: s.tipo, v: s.tipo.base === 'auto' ? copia(el) : this.coerce(s.tipo, copia(el), s.linea) }); }
          } else yield* this.asignar(s.v, lista[k], amb, s.linea);
          if ((yield* this.vuelta(s.cuerpo, sc)) === 'break') break;
        }
        return;
      }
      case 'forc': {
        const sc = new Ambito(amb);
        if (s.init) yield* this.exec(s.init, sc);
        for (;;) {
          this.paso(s.linea);
          if (s.c && !this.verdad(yield* this.ev(s.c, sc), s.linea)) break;
          if ((yield* this.vuelta(s.cuerpo, sc)) === 'break') break;
          if (s.upd) yield* this.ev(s.upd, sc);
        }
        return;
      }
      case 'segun': {
        const v = yield* this.ev(s.e, amb);
        if (!s.caida) {
          for (const cs of s.casos) for (const ve of cs.vals) { if (this.igual(v, yield* this.ev(ve, amb))) { yield* this.bloque(cs.cuerpo, amb); return; } }
          if (s.otro) yield* this.bloque(s.otro, amb); return;
        }
        let ini = -1;
        for (let k = 0; k < s.casos.length && ini < 0; k++) { const cs = s.casos[k]; if (cs.vals && this.igual(v, yield* this.ev(cs.vals[0], amb))) ini = k; }
        if (ini < 0) ini = s.casos.findIndex(c => !c.vals);
        if (ini < 0) return;
        const sc = new Ambito(amb);
        try { for (let k = ini; k < s.casos.length; k++) yield* this.bloque(s.casos[k].cuerpo, sc); }
        catch (c) { if (c instanceof Corte && c.tipo === 'break') return; throw c; }
        return;
      }
      case 'func': this.funcs.set(s.id, s); return;
      case 'ret': { const v = s.e ? yield* this.ev(s.e, amb) : null; throw new Corte('ret', v); }
      case 'break': throw new Corte('break');
      case 'cont': throw new Corte('cont');
      case 'global': if (!amb.globalesDecl) amb.globalesDecl = new Set(); s.ns.forEach(n => amb.globalesDecl.add(n)); return;
      case 'importa': s.ns.forEach(n => this.importados.add(n)); return;
      case 'decl': yield* this.declarar(s, amb); return;
    }
    throw new ErrorDojo('Instrucción desconocida: ' + s.k, s.linea);
  }
  *declarar(s, amb) {
    const tipo = s.tipo;
    for (const d of s.ds) {
      if (amb.m.has(d.id)) throw new ErrorDojo(`La variable «${d.n}» ya está declarada aquí.`, d.linea, `Para cambiar su valor no repitas el tipo: escribe solo  ${d.n} = ...;`);
      if (d.dims) {
        const dims = [];
        for (const e of d.dims) { if (e === null) { dims.push(null); continue; } const x = yield* this.ev(e, amb); if (!esNum(x) || esR(x) || N(x) < 1) throw new ErrorDojo('El tamaño de un arreglo tiene que ser un número entero mayor que 0.', d.linea); dims.push(N(x)); }
        let ini = null;
        if (d.init) { if (d.init.k !== 'lista') throw new ErrorDojo('Un arreglo se inicia con llaves: {1, 2, 3}.', d.linea); ini = yield* this.ev(d.init, amb); }
        if (dims[0] === null) { if (!ini) throw new ErrorDojo('Si no pones el tamaño del arreglo, dale los valores: int a[] = {1, 2, 3};', d.linea); dims[0] = ini.length; }
        if (dims.some(x => x === null)) throw new ErrorDojo('Falta el tamaño del arreglo.', d.linea);
        const v = crearArreglo(dims, undefined);
        if (ini) {
          const llena = (dst, src, ds) => {
            if (src.length > ds[0]) throw new ErrorDojo('Hay más valores entre llaves que espacio en el arreglo.', d.linea);
            for (let k = 0; k < ds[0]; k++) {
              if (ds.length > 1) llena(dst[k], Array.isArray(src[k]) ? src[k] : [], ds.slice(1));
              else dst[k] = k < src.length ? this.coerce({ base: tipo.base }, src[k], d.linea) : valorCero(tipo);
            }
          };
          llena(v, ini, dims);
        }
        amb.m.set(d.id, { n: d.n, v, tipo: { base: tipo.base, dims } }); continue;
      }
      let v;
      if (tipo.base === 'vector') {
        if (d.init) v = this.coerce(tipo, yield* this.ev(d.init, amb), d.linea);
        else if (d.ctor && d.ctor.length) {
          const nn = yield* this.ev(d.ctor[0], amb); const rel = d.ctor[1] ? yield* this.ev(d.ctor[1], amb) : valorCero(tipo.elem);
          if (!esNum(nn) || esR(nn) || N(nn) < 0) throw new ErrorDojo('El tamaño del vector tiene que ser un número entero.', d.linea);
          v = []; for (let k = 0; k < N(nn); k++) v.push(this.coerce(tipo.elem, copia(rel), d.linea));
        } else v = [];
      } else if (d.init) { const x = yield* this.ev(d.init, amb); v = tipo.base === 'auto' ? copia(x) : this.coerce(tipo, x, d.linea); }
      else if (d.ctor && d.ctor.length) v = this.coerce(tipo, yield* this.ev(d.ctor[0], amb), d.linea);
      else v = tipo.base === 'string' ? '' : undefined;
      let tp = tipo;
      if (tipo.base === 'auto') tp = v instanceof Real ? { base: 'double' } : typeof v === 'string' ? { base: 'string' } : typeof v === 'boolean' ? { base: 'bool' } : v instanceof Car ? { base: 'char' } : { base: 'int' };
      amb.m.set(d.id, { n: d.n, v, tipo: tp });
    }
  }
  coerce(tipo, x, L) {
    if (this.lang !== 'cpp' || !tipo || x === undefined) return x;
    if (tipo.dims && tipo.dims.length) throw new ErrorDojo('En C++ un arreglo no se puede copiar entero con «=».', L, 'Cópialo posición por posición con un for, o usa vector, que sí se puede copiar.');
    const malTexto = (pista) => new ErrorDojo(`No se puede guardar un texto en una variable ${tipo.base}.`, L, pista);
    if (Array.isArray(x) && tipo.base !== 'vector' && tipo.base !== 'auto') throw new ErrorDojo(`No se puede guardar una lista de valores en una variable ${tipo.base}.`, L);
    switch (tipo.base) {
      case 'int': if (typeof x === 'string') throw malTexto('Si el texto tiene un número, conviértelo con stoi(texto).'); return Math.trunc(N(x));
      case 'double': if (typeof x === 'string') throw malTexto('Si el texto tiene un número, conviértelo con stod(texto).'); return R(N(x));
      case 'bool': if (typeof x === 'string') throw malTexto(''); return N(x) !== 0;
      case 'char':
        if (x instanceof Car) return x;
        if (typeof x === 'string') { if (x.length === 1) return new Car(x); throw new ErrorDojo("Un char guarda un solo carácter, con comillas simples: 'a'.", L, 'Para guardar palabras usa string.'); }
        return new Car(String.fromCharCode(Math.trunc(N(x))));
      case 'string':
        if (typeof x === 'string') return x; if (x instanceof Car) return x.c;
        throw new ErrorDojo('No se puede guardar un número en un string.', L, 'Conviértelo primero con to_string(n).');
      case 'vector': if (!Array.isArray(x)) throw new ErrorDojo(`Aquí hace falta un vector y llegó un ${nombreTipo(x, 'cpp')}.`, L); return x.map(e => this.coerce(tipo.elem, copia(e), L));
    }
    return copia(x);
  }
  compruebaPs(tipo, v, L, nombre) {
    if (!tipo || v === undefined) return v;
    if (Array.isArray(v)) throw new ErrorDojo('No se puede guardar un arreglo entero en una variable.', L);
    const que = esNum(v) && typeof v !== 'boolean' ? 'el número ' + fmtPs(N(v)) : typeof v === 'string' ? 'un texto' : 'un valor lógico';
    const mal = t => new ErrorDojo(`«${nombre}» es de tipo ${t} y le quieres guardar ${que}.`, L, 'Cada variable guarda un solo tipo de dato: el que pusiste en Definir.');
    switch (tipo) {
      case 'entero':
        if (!esNum(v) || typeof v === 'boolean') throw mal('Entero');
        if (!Number.isInteger(N(v))) throw new ErrorDojo(`«${nombre}» es Entero y no puede guardar ${fmtPs(N(v))}, que tiene decimales.`, L, 'Defínela como Real, o quita los decimales con TRUNC(...) o REDON(...).');
        return N(v);
      case 'real': if (!esNum(v) || typeof v === 'boolean') throw mal('Real'); return N(v);
      case 'texto': if (typeof v !== 'string') throw mal('Caracter (texto)'); return v;
      case 'logico': if (typeof v !== 'boolean') throw mal('Logico'); return v;
    }
    return v;
  }
  convierteLeidoPs(txt, tipo, t, L) {
    const s = txt.trim(); const nom = nombreExpr(t);
    switch (tipo) {
      case 'entero': if (!/^[-+]?\d+$/.test(s)) throw new ErrorDojo(`Se esperaba un número entero para «${nom}» y se escribió «${txt}».`, L, `«${nom}» es Entero: solo acepta números sin decimales.`); return parseInt(s, 10);
      case 'real': if (!RE_NUM.test(s)) throw new ErrorDojo(`Se esperaba un número para «${nom}» y se escribió «${txt}».`, L, 'Los decimales van con punto: 2.5'); return parseFloat(s);
      case 'logico': if (/^(verdadero|v)$/i.test(s)) return true; if (/^(falso|f)$/i.test(s)) return false; throw new ErrorDojo('Se esperaba VERDADERO o FALSO.', L);
      case 'texto': return txt;
    }
    return RE_NUM.test(s) ? parseFloat(s) : txt;
  }
  /* variables */
  celda(e, amb) {
    if (this.lang === 'py') { if (amb !== this.globales) { const c = amb.m.get(e.id); if (c) return c; } return this.globales.m.get(e.id) || null; }
    if (this.lang === 'ps') return amb.m.get(e.id) || null;
    return amb.busca(e.id);
  }
  nombresVisibles(amb) {
    const s = new Set();
    if (this.lang === 'py') { for (const c of amb.m.values()) s.add(c.n); for (const c of this.globales.m.values()) s.add(c.n); }
    else amb.todos().forEach(n => s.add(n));
    for (const f of this.funcs.values()) s.add(f.n);
    return [...s];
  }
  leerVar(e, amb) {
    const c = this.celda(e, amb), L = e.linea;
    if (c) {
      if (c.v === undefined) {
        if (this.lang === 'cpp') throw new ErrorDojo(`Usas «${e.n}» sin haberle dado un valor.`, L, `En C++ de verdad tendría basura (un número cualquiera). Dale un valor al declararla:  ${c.tipo && c.tipo.base === 'double' ? 'double' : 'int'} ${e.n} = 0;`);
        throw new ErrorDojo(`«${e.n}» está definida pero todavía no tiene valor.`, L, 'Dale un valor con «<-» o con Leer antes de usarla.');
      }
      return c.v;
    }
    if (this.lang === 'py' && this.funcs.has(e.id)) return { fn: this.funcs.get(e.id) };
    if (this.lang === 'cpp') { if (e.id === 'cout') return FLUJO_COUT; if (e.id === 'cin') return FLUJO_CIN; if (e.id === 'endl') return ENDL; if (e.id === 'M_PI') return R(Math.PI); }
    if (this.lang === 'ps' && e.id === 'pi') return Math.PI;
    const sug = parecido(e.n, this.nombresVisibles(amb));
    if (this.lang === 'py') throw new ErrorDojo(`«${e.n}» no existe: no hay ninguna variable con ese nombre (NameError).`, L, sug ? `¿Quisiste decir «${sug}»?` : 'Dale un valor antes de usarla, o revisa cómo la escribiste (las mayúsculas cuentan). Si es un texto, va entre comillas.');
    if (this.lang === 'ps') throw new ErrorDojo(`La variable «${e.n}» todavía no tiene valor.`, L, sug ? `¿Quisiste decir «${sug}»?` : 'Dale un valor con «<-» o con Leer antes de usarla. Si es un texto, va entre comillas.');
    if (e.id === 'print' || e.id === 'printf') throw new ErrorDojo('En C++ se muestra con cout.', L, 'Así:  cout << "hola" << endl;');
    throw new ErrorDojo(`La variable «${e.n}» no está declarada.`, L, sug ? `¿Quisiste decir «${sug}»?` : `Declárala antes con su tipo, por ejemplo  int ${e.n} = 0;  (si es un texto, va entre comillas dobles).`);
  }
  tipoDestino(t, amb) {
    if (t.k === 'var') { const c = this.celda(t, amb); return c ? c.tipo : null; }
    return this.tipoElemento(t, amb);
  }
  tipoElemento(t, amb) {
    let niv = 0, e = t; while (e.k === 'idx') { niv += e.is.length; e = e.obj; }
    if (e.k !== 'var') return null; const c = this.celda(e, amb); if (!c || !c.tipo) return null;
    let tp = c.tipo; if (this.lang === 'ps') return tp;
    for (let k = 0; k < niv; k++) {
      if (tp.dims && tp.dims.length) tp = tp.dims.length > 1 ? { base: tp.base, dims: tp.dims.slice(1) } : { base: tp.base };
      else if (tp.base === 'vector') tp = tp.elem;
      else if (tp.base === 'string') tp = { base: 'char' };
      else return null;
    }
    return tp;
  }
  asignaVar(t, v, amb, L) {
    if (this.lang === 'py') {
      let dst = amb; if (amb !== this.globales && amb.globalesDecl && amb.globalesDecl.has(t.id)) dst = this.globales;
      const c = dst.m.get(t.id); if (c) c.v = v; else dst.m.set(t.id, { n: t.n, v }); return;
    }
    if (this.lang === 'ps') {
      let c = amb.m.get(t.id); if (!c) { c = { n: t.n, v: undefined, tipo: null }; amb.m.set(t.id, c); }
      if (c.dims) throw new ErrorDojo(`«${t.n}» es un arreglo: para guardar un valor di en qué posición, por ejemplo ${t.n}[1].`, L);
      c.v = this.compruebaPs(c.tipo, v, L, t.n); return;
    }
    const c = amb.busca(t.id);
    if (!c) { const sug = parecido(t.n, this.nombresVisibles(amb)); throw new ErrorDojo(`La variable «${t.n}» no está declarada.`, L, sug ? `¿Quisiste decir «${sug}»?` : `En C++ hay que declararla antes con su tipo, por ejemplo:  int ${t.n} = 0;`); }
    c.v = this.coerce(c.tipo, v, L);
  }
  *asignar(t, v, amb, L) {
    if (t.k === 'var') { this.asignaVar(t, v, amb, L); return; }
    if (t.k === 'tupla') {
      const vals = typeof v === 'string' ? [...v] : v;
      if (!Array.isArray(vals)) throw new ErrorDojo('Para repartir valores en varias variables, a la derecha tiene que haber varios valores.', L);
      if (vals.length !== t.els.length) throw new ErrorDojo(`Hay ${t.els.length} variables a la izquierda y ${vals.length} valores a la derecha.`, L);
      for (let k = 0; k < vals.length; k++) yield* this.asignar(t.els[k], vals[k], amb, L);
      return;
    }
    if (t.k === 'idx') {
      const obj = yield* this.ev(t.obj, amb); const is = []; for (const e of t.is) is.push(yield* this.ev(e, amb));
      if (typeof obj === 'string') {
        if (this.lang === 'cpp') { const k = this.posicion(obj, is[0], t); const ch = this.coerce({ base: 'char' }, v, L).c; yield* this.asignar(t.obj, obj.slice(0, k) + ch + obj.slice(k + 1), amb, L); return; }
        throw new ErrorDojo(this.lang === 'py' ? 'En Python no se puede cambiar una letra de un texto: los textos no se modifican.' : 'No se puede cambiar una letra así.', L, this.lang === 'py' ? 'Crea un texto nuevo, por ejemplo:  s = s[:i] + "x" + s[i+1:]' : '');
      }
      if (!Array.isArray(obj)) throw new ErrorDojo(`«${nombreExpr(t.obj)}» no es ${this.lang === 'py' ? 'una lista' : 'un arreglo'}: no se le puede poner [ ].`, L, this.lang === 'ps' ? 'Primero hay que crearlo con Dimension.' : '');
      let arr = obj;
      for (let d = 0; d < is.length - 1; d++) { arr = arr[this.posicion(arr, is[d], t)]; if (!Array.isArray(arr)) throw new ErrorDojo('Ese arreglo no tiene tantas dimensiones.', L); }
      const k = this.posicion(arr, is[is.length - 1], t); const tp = this.tipoElemento(t, amb);
      arr[k] = this.lang === 'cpp' ? this.coerce(tp, v, L) : this.lang === 'ps' ? this.compruebaPs(tp, v, L, nombreExpr(t)) : v;
      return;
    }
    throw new ErrorDojo('Aquí no se puede guardar un valor.', L, 'A la izquierda solo puede ir una variable o una posición de una lista.');
  }
  posicion(arr, i, t) {
    const L = t.linea, len = arr.length;
    const que = typeof arr === 'string' ? 'el texto' : this.lang === 'py' ? 'la lista' : this.lang === 'ps' ? 'el arreglo' : 'el arreglo';
    if (!esNum(i) || esR(i) || i instanceof Car) throw new ErrorDojo('La posición tiene que ser un número entero.', L, this.lang === 'py' && typeof i === 'string' ? 'Si viene de input(), conviértela con int(...).' : '');
    let k = N(i);
    if (this.lang === 'ps') {
      if (k < 1 || k > len) throw new ErrorDojo(`La posición ${k} no existe: ${que} «${nombreExpr(t.obj || t)}» va de 1 a ${len}.`, L, k === 0 ? 'En PSeInt las posiciones empiezan en 1, no en 0.' : 'Revisa el final del Para que recorre el arreglo.');
      return k - 1;
    }
    if (this.lang === 'py' && k < 0) k += len;
    if (k < 0 || k >= len) {
      if (this.lang === 'py') throw new ErrorDojo(`La posición ${N(i)} no existe: ${que} tiene ${len} elemento(s), de la posición 0 a la ${len - 1} (IndexError).`, L, 'En Python se cuenta desde 0: la última posición es len(...) - 1.');
      throw new ErrorDojo(`La posición ${k} se sale: ${que} va de 0 a ${len - 1}.`, L, 'En C++ de verdad esto no avisa: lee basura de la memoria o el programa se cae. Revisa los límites del bucle.');
    }
    return k;
  }
  indexar(o, is, e) {
    const L = e.linea; let v = o;
    for (const i of is) {
      if (typeof v === 'string') {
        if (this.lang === 'ps') throw new ErrorDojo('En PSeInt las letras de un texto se sacan con Subcadena(texto, desde, hasta).', L);
        const k = this.posicion(v, i, e); v = this.lang === 'cpp' ? new Car(v[k]) : v[k]; continue;
      }
      if (!Array.isArray(v)) throw new ErrorDojo(`«${nombreExpr(e.obj)}» no es ${this.lang === 'py' ? 'una lista' : 'un arreglo'}: no se le puede poner [ ].`, L, this.lang === 'ps' ? 'Primero hay que crearlo con Dimension.' : '');
      v = v[this.posicion(v, i, e)];
    }
    if (v === undefined) throw new ErrorDojo(`${nombreExpr(e)} todavía no tiene valor.`, L, this.lang === 'cpp' ? 'En C++ de verdad tendría basura. Dale valor antes, o inicia el arreglo con llaves:  int a[5] = {0};' : 'Dale valor a esa posición antes de usarla.');
    return v;
  }
  verdad(v, L) {
    if (this.lang === 'py') { if (v === null || v === false || v === 0 || v === '') return false; if (v instanceof Real) return v.v !== 0; if (Array.isArray(v)) return v.length > 0; return true; }
    if (typeof v === 'boolean') return v;
    if (this.lang === 'ps') throw new ErrorDojo('La condición tiene que ser verdadera o falsa, por ejemplo  x > 5.', L, esNum(v) ? 'Para comparar se usa «=», «<», «>»… y los valores lógicos se unen con Y / O.' : '');
    if (esNum(v)) return N(v) !== 0;
    throw new ErrorDojo('Aquí hace falta una condición (verdadera o falsa).', L);
  }
  igual(a, b) {
    if (a instanceof Car && typeof b === 'string') return a.c === b;
    if (b instanceof Car && typeof a === 'string') return a === b.c;
    if (esNum(a) && esNum(b)) return N(a) === N(b);
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, k) => this.igual(x, b[k]));
    return a === b;
  }
  compara(op, a, b, L) {
    if (op === '==') return this.igual(a, b);
    if (op === '!=') return !this.igual(a, b);
    if (op === 'in' || op === 'notin') {
      let r;
      if (typeof b === 'string') { if (typeof a !== 'string') throw new ErrorDojo('Para buscar dentro de un texto, lo que buscas también tiene que ser texto.', L); r = b.includes(a); }
      else if (Array.isArray(b)) r = b.some(x => this.igual(x, a));
      else throw new ErrorDojo('«in» busca dentro de un texto o de una lista.', L);
      return op === 'in' ? r : !r;
    }
    let x, y;
    if (typeof a === 'string' && typeof b === 'string') { x = a; y = b; }
    else if (esNum(a) && esNum(b)) { x = N(a); y = N(b); }
    else throw new ErrorDojo(`No se puede comparar un ${nombreTipo(a, this.lang)} con un ${nombreTipo(b, this.lang)}.`, L, this.lang === 'py' && (typeof a === 'string' || typeof b === 'string') ? 'Si el texto viene de input(), conviértelo con int(...) antes de comparar.' : '');
    return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
  }
  opBin(op, a, b, L) {
    const lang = this.lang;
    if (op === '+') {
      if (typeof a === 'string' || typeof b === 'string') {
        if (typeof a === 'string' && typeof b === 'string') return a + b;
        if (lang === 'cpp' && typeof a === 'string' && b instanceof Car) return a + b.c;
        if (lang === 'cpp' && a instanceof Car && typeof b === 'string') return a.c + b;
        const pista = lang === 'py' ? 'Convierte el número a texto con str(n), o usa una f-string: f"Tengo {n} años". Si el texto viene de input(), conviértelo con int(...).'
          : lang === 'ps' ? 'Para mostrar texto y números juntos usa comas:  Escribir "Tengo ", n, " años"'
          : 'Usa to_string(n), o encadena con <<:  cout << "Tengo " << n;';
        throw new ErrorDojo(`No se puede sumar un ${nombreTipo(a, lang)} con un ${nombreTipo(b, lang)}.`, L, pista);
      }
      if (lang === 'py' && Array.isArray(a) && Array.isArray(b)) return a.concat(b);
    }
    if (op === '*' && lang === 'py') {
      if (typeof a === 'string' && typeof b === 'number') return a.repeat(Math.max(0, b));
      if (typeof b === 'string' && typeof a === 'number') return b.repeat(Math.max(0, a));
      if (Array.isArray(a) && typeof b === 'number') { let r = []; for (let k = 0; k < b; k++) r = r.concat(a); return r; }
    }
    if (!esNum(a) || !esNum(b)) {
      if (lang === 'py' && (typeof a === 'string' || typeof b === 'string')) throw new ErrorDojo(`No se puede usar «${op}» con un texto y un número.`, L, 'Si el texto viene de input(), conviértelo antes con int(...) o float(...).');
      throw new ErrorDojo(`No se puede usar «${op}» con un ${nombreTipo(a, lang)} y un ${nombreTipo(b, lang)}.`, L);
    }
    const real = esR(a) || esR(b), x = N(a), y = N(b);
    const num = v => lang === 'ps' ? v : real ? R(v) : v;
    const div0 = () => new ErrorDojo('División entre cero.', L, 'Ningún número se puede dividir entre 0: revisa que el divisor no valga 0.');
    switch (op) {
      case '+': return num(x + y);
      case '-': return num(x - y);
      case '*': return num(x * y);
      case '/': if (y === 0) throw div0(); if (lang === 'ps') return x / y; if (lang === 'py') return R(x / y); return real ? R(x / y) : Math.trunc(x / y);
      case '//': if (y === 0) throw div0(); return num(Math.floor(x / y));
      case '%':
        if (y === 0) throw div0();
        if (lang === 'py') return num(x - y * Math.floor(x / y));
        if (lang === 'cpp' && real) throw new ErrorDojo('En C++ «%» solo funciona con números enteros.', L, 'Para decimales existe fmod(a, b).');
        return x % y;
      case '**': { const r = Math.pow(x, y); return lang === 'py' ? ((!real && y >= 0) ? r : R(r)) : r; }
    }
    throw new ErrorDojo('Operador desconocido: ' + op, L);
  }
  *evArgs(args, amb) { const r = []; for (const a of args) r.push(yield* this.ev(a, amb)); return r; }
  *ev(e, amb) {
    switch (e.k) {
      case 'num': return (e.real && this.lang !== 'ps') ? R(e.v) : e.v;
      case 'str': return e.v;
      case 'chr': return new Car(e.v);
      case 'bool': return e.v;
      case 'none': return null;
      case 'var': return this.leerVar(e, amb);
      case 'fstr': {
        let s = '';
        for (const p of e.partes) { if (typeof p === 'string') s += p; else { const v = yield* this.ev(p.e, amb); s += p.fmt ? formatoPy(v, p.fmt, e.linea) : textoDe(v, 'py'); } }
        return s;
      }
      case 'lista': case 'tupla': { const a = yield* this.evArgs(e.els, amb); if (e.k === 'tupla') a.tupla = true; return a; }
      case 'idx': { const o = yield* this.ev(e.obj, amb); const is = yield* this.evArgs(e.is, amb); return this.indexar(o, is, e); }
      case 'corte': {
        const o = yield* this.ev(e.obj, amb);
        if (typeof o !== 'string' && !Array.isArray(o)) throw new ErrorDojo('Solo se pueden cortar textos y listas.', e.linea);
        const len = o.length; const st = e.s ? N(yield* this.ev(e.s, amb)) : 1;
        if (st === 0) throw new ErrorDojo('El paso de un corte no puede ser 0.', e.linea);
        let a = e.a ? N(yield* this.ev(e.a, amb)) : (st > 0 ? 0 : len - 1);
        let b = e.b ? N(yield* this.ev(e.b, amb)) : (st > 0 ? len : -len - 1);
        if (a < 0) a += len; if (b < 0) b += len;
        const lim = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        if (st > 0) { a = lim(a, 0, len); b = lim(b, 0, len); } else { a = lim(a, -1, len - 1); b = lim(b, -1, len - 1); }
        const r = []; if (st > 0) for (let k = a; k < b; k += st) r.push(o[k]); else for (let k = a; k > b; k += st) r.push(o[k]);
        return typeof o === 'string' ? r.join('') : r;
      }
      case 'bin': { const a = yield* this.ev(e.a, amb); const b = yield* this.ev(e.b, amb); return this.opBin(e.op, a, b, e.linea); }
      case 'log': {
        const a = yield* this.ev(e.a, amb);
        if (this.lang === 'py') { const va = this.verdad(a); if (e.op === 'y') return va ? yield* this.ev(e.b, amb) : a; return va ? a : yield* this.ev(e.b, amb); }
        const va = this.verdad(a, e.linea);
        if (e.op === 'y' && !va) return false; if (e.op === 'o' && va) return true;
        return this.verdad(yield* this.ev(e.b, amb), e.linea);
      }
      case 'cmp': {
        let a = yield* this.ev(e.es[0], amb);
        for (let k = 0; k < e.ops.length; k++) { const b = yield* this.ev(e.es[k + 1], amb); if (!this.compara(e.ops[k], a, b, e.linea)) return false; a = b; }
        return true;
      }
      case 'un': {
        const a = yield* this.ev(e.a, amb);
        if (e.op === 'no') return !this.verdad(a, e.linea);
        if (!esNum(a)) throw new ErrorDojo(`No se puede poner «${e.op}» delante de un ${nombreTipo(a, this.lang)}.`, e.linea);
        if (e.op === '-') return esR(a) ? R(-a.v) : -N(a);
        return esR(a) ? a : N(a);
      }
      case 'tern': return this.verdad(yield* this.ev(e.c, amb), e.linea) ? yield* this.ev(e.a, amb) : yield* this.ev(e.b, amb);
      case 'call': return yield* this.llamar(e, amb);
      case 'met': return yield* this.metodo(e, amb);
      case 'attr': return this.atributo(e, amb);
      case 'asigx': {
        let v;
        if (e.op === '=') v = yield* this.ev(e.e, amb);
        else { const act = yield* this.ev(e.t, amb); const r = yield* this.ev(e.e, amb); v = this.opBin(e.op.slice(0, -1), act, r, e.linea); }
        yield* this.asignar(e.t, v, amb, e.linea); return yield* this.ev(e.t, amb);
      }
      case 'inc': {
        const old = yield* this.ev(e.t, amb);
        if (!esNum(old)) throw new ErrorDojo(`«${e.op}» solo funciona con números.`, e.linea);
        yield* this.asignar(e.t, this.opBin(e.op === '++' ? '+' : '-', old, 1, e.linea), amb, e.linea);
        return e.pre ? yield* this.ev(e.t, amb) : old;
      }
      case 'cast': return this.coerce(e.tipo, yield* this.ev(e.e, amb), e.linea);
      case 'flujo': return yield* this.flujo(e, amb);
    }
    throw new ErrorDojo('Expresión desconocida: ' + e.k, e.linea);
  }
  /* entrada y salida de C++ */
  *flujo(e, amb) {
    const izq = yield* this.ev(e.a, amb);
    if (izq === FLUJO_COUT) {
      if (e.op !== '<<') throw new ErrorDojo('Con cout se usa «<<»: las flechas apuntan hacia cout.', e.linea, 'Así:  cout << "hola";   («>>» es para cin).');
      const v = yield* this.ev(e.b, amb);
      if (v === ENDL) this.escribe('\n');
      else if (v === FLUJO_CIN || v === FLUJO_COUT) throw new ErrorDojo('No se puede mandar cin o cout a cout.', e.linea);
      else if (Array.isArray(v)) throw new ErrorDojo('cout no puede mostrar un arreglo o un vector entero.', e.linea, 'Recórrelo con un for y muestra cada elemento.');
      else this.escribe(textoDe(v, 'cpp'));
      return FLUJO_COUT;
    }
    if (izq === FLUJO_CIN) {
      if (e.op !== '>>') throw new ErrorDojo('Con cin se usa «>>»: las flechas apuntan hacia la variable.', e.linea, 'Así:  cin >> edad;   («<<» es para cout).');
      if (!esLvalor(e.b)) throw new ErrorDojo('cin guarda lo que escribe el usuario en una variable.', e.linea, 'Así:  cin >> edad;');
      const tp = this.tipoDestino(e.b, amb);
      const tok = yield* this.tokenCin(tp);
      yield* this.asignar(e.b, this.convierteCin(tok, tp, e), amb, e.linea);
      return FLUJO_CIN;
    }
    if (izq === ENDL) throw new ErrorDojo('endl va al final, después de cout << ...', e.linea);
    const der = yield* this.ev(e.b, amb);
    if (!esNum(izq) || !esNum(der) || esR(izq) || esR(der)) throw new ErrorDojo(`«${e.op}» se usa con cout y cin.`, e.linea, '¿Falta escribir  cout <<  al principio?');
    return e.op === '<<' ? (N(izq) << N(der)) : (N(izq) >> N(der));
  }
  *tokenCin(tp) {
    for (;;) {
      const k = this.buf.search(/\S/);
      if (k >= 0) {
        if (tp && tp.base === 'char') { const ch = this.buf[k]; this.buf = this.buf.slice(k + 1); return ch; }
        const m = /^\S+/.exec(this.buf.slice(k)); this.buf = this.buf.slice(k + m[0].length); return m[0];
      }
      this.buf = (yield* this.pideLinea()) + '\n';
    }
  }
  *lineaCin() {
    if (this.buf === '') this.buf = (yield* this.pideLinea()) + '\n';
    const k = this.buf.indexOf('\n'); const s = this.buf.slice(0, k); this.buf = this.buf.slice(k + 1); return s;
  }
  convierteCin(tok, tp, e) {
    const b = tp ? tp.base : null, L = e.linea, nom = nombreExpr(e.b);
    if (b === 'int') { if (!/^[-+]?\d+$/.test(tok)) throw new ErrorDojo(`cin esperaba un número entero para «${nom}» y llegó «${tok}».`, L, 'En C++ de verdad cin falla en silencio y la variable se queda en 0: es un error muy común.'); return parseInt(tok, 10); }
    if (b === 'double') { if (!RE_NUM.test(tok)) throw new ErrorDojo(`cin esperaba un número para «${nom}» y llegó «${tok}».`, L, 'Los decimales van con punto: 2.5'); return R(parseFloat(tok)); }
    if (b === 'bool') { if (tok === '1' || tok === '0') return tok === '1'; throw new ErrorDojo('cin lee un bool como 1 o 0.', L); }
    if (b === 'char') return new Car(tok[0]);
    return tok;
  }
  atributo(e, amb) {
    if (this.lang === 'py' && e.obj.k === 'var' && e.obj.n === 'math' && !this.celda(e.obj, amb)) {
      const c = { pi: R(Math.PI), e: R(Math.E), inf: R(Infinity) }[e.n]; if (c) return c;
    }
    throw new ErrorDojo(`No conozco «${nombreExpr(e)}».`, e.linea, `Si es una función o un método, lleva paréntesis:  ${nombreExpr(e)}()`);
  }
  /* llamadas */
  *llamar(e, amb) {
    const f = this.funcs.get(e.id);
    if (f && f.id !== 'main') return yield* this.llamarUsuario(f, e, amb);
    if (this.lang === 'py') return yield* this.integradaPy(e, amb);
    if (this.lang === 'ps') return this.integradaPs(e, yield* this.evArgs(e.args, amb));
    return yield* this.integradaCpp(e, amb);
  }
  *llamarUsuario(f, e, amb) {
    const L = e.linea, lang = this.lang, n = e.args.length;
    const minimo = f.params.filter(p => !p.def).length;
    if (n > f.params.length || n < minimo) throw new ErrorDojo(`«${f.n}» espera ${f.params.length} dato(s) entre paréntesis y le diste ${n}.`, L, `Así la escribiste:  ${f.n}(${f.params.map(p => p.n).join(', ')})`);
    if (++this.prof > 150) { this.prof--; throw new ErrorDojo('Demasiadas llamadas una dentro de otra.', L, '¿La función se llama a sí misma sin un caso que la detenga?'); }
    try {
      const loc = new Ambito(lang === 'cpp' ? this.globales : null);
      for (let k = 0; k < f.params.length; k++) {
        const p = f.params[k], a = e.args[k];
        if (a === undefined) { loc.m.set(p.id, { n: p.n, v: yield* this.ev(p.def, this.globales) }); continue; }
        if (p.ref) {
          if (!esLvalor(a)) throw new ErrorDojo(`El parámetro «${p.n}» es por referencia: hay que pasarle una variable, no un valor suelto.`, L);
          loc.m.set(p.id, yield* this.celdaRef(a, amb, p)); continue;
        }
        let v = yield* this.ev(a, amb);
        let tipo = null, dims;
        if (lang === 'cpp') { if (p.arr) { if (!Array.isArray(v)) throw new ErrorDojo(`«${p.n}» espera un arreglo.`, L); tipo = { base: p.tipo.base, dims: [v.length] }; } else { v = this.coerce(p.tipo, v, L); tipo = p.tipo; } }
        if (lang === 'ps' && Array.isArray(v)) dims = [v.length];
        loc.m.set(p.id, { n: p.n, v, tipo, dims });
      }
      if (lang === 'ps' && f.ret && !loc.m.has(f.ret.id)) loc.m.set(f.ret.id, { n: f.ret.n, v: undefined, tipo: null });
      let res = null;
      try { yield* this.bloque(f.cuerpo, loc); }
      catch (c) {
        if (!(c instanceof Corte)) throw c;
        if (c.tipo !== 'ret') throw new ErrorDojo(`«${c.tipo === 'break' ? 'break' : 'continue'}» fuera de un bucle.`, this.linea);
        res = c.valor;
      }
      if (lang === 'ps') {
        if (!f.ret) return null;
        const c = loc.m.get(f.ret.id);
        if (c.v === undefined) throw new ErrorDojo(`La función «${f.n}» termina sin guardar nada en «${f.ret.n}».`, f.linea, `Antes de FinFuncion escribe  ${f.ret.n} <- (el resultado)`);
        return c.v;
      }
      if (lang === 'cpp') {
        if (f.tipo.base === 'void') return null;
        if (res === null || res === undefined) throw new ErrorDojo(`La función «${f.n}» terminó sin «return».`, f.linea, `Una función ${f.tipo.base} tiene que devolver un valor con return.`);
        return this.coerce(f.tipo, res, L);
      }
      return res;
    } finally { this.prof--; }
  }
  *celdaRef(a, amb, p) {
    if (a.k === 'var') {
      let c = this.celda(a, amb);
      if (!c) { if (this.lang === 'ps') { c = { n: a.n, v: undefined, tipo: null }; amb.m.set(a.id, c); } else throw new ErrorDojo(`La variable «${a.n}» no está declarada.`, a.linea); }
      return c;
    }
    const obj = yield* this.ev(a.obj, amb); const is = yield* this.evArgs(a.is, amb);
    let arr = obj; for (let d = 0; d < is.length - 1; d++) arr = arr[this.posicion(arr, is[d], a)];
    const k = this.posicion(arr, is[is.length - 1], a);
    return { n: nombreExpr(a), get v() { return arr[k]; }, set v(x) { arr[k] = x; }, tipo: this.tipoElemento(a, amb) };
  }
  ordena(arr, L) {
    if (arr.every(x => esNum(x))) arr.sort((x, y) => N(x) - N(y));
    else if (arr.every(x => typeof x === 'string')) arr.sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
    else throw new ErrorDojo('No se puede ordenar una lista que mezcla números y textos.', L);
  }
  num1(args, nombre, L) {
    if (args.length < 1 || !esNum(args[0])) throw new ErrorDojo(`${nombre} necesita un número entre paréntesis.`, L);
    return N(args[0]);
  }
  *integradaPy(e, amb) {
    const L = e.linea, n = e.f;
    const args = yield* this.evArgs(e.args, amb);
    const kw = {}; for (const k in (e.kw || {})) kw[k] = yield* this.ev(e.kw[k], amb);
    const uno = () => { if (args.length !== 1) throw new ErrorDojo(`${n}() lleva un solo dato entre paréntesis.`, L); return args[0]; };
    switch (n) {
      case 'print': {
        const sep = 'sep' in kw ? textoDe(kw.sep, 'py') : ' ', end = 'end' in kw ? textoDe(kw.end, 'py') : '\n';
        this.escribe(args.map(a => textoDe(a, 'py')).join(sep) + end); return null;
      }
      case 'input': if (args.length) this.escribe(textoDe(args[0], 'py')); return yield* this.pideLinea();
      case 'int': {
        const x = args.length ? args[0] : 0;
        if (typeof x === 'string') {
          const s = x.trim();
          if (!/^[-+]?\d+$/.test(s)) throw new ErrorDojo(`int() no puede convertir «${x}» en un número entero (ValueError).`, L, /^[-+]?\d*\.\d+$/.test(s) ? 'Tiene decimales: para eso está float(...).' : 'Solo convierte textos que sean números enteros, como "42".');
          return parseInt(s, 10);
        }
        if (esNum(x)) return Math.trunc(N(x));
        throw new ErrorDojo(`int() no puede convertir un ${nombreTipo(x, 'py')}.`, L);
      }
      case 'float': {
        const x = args.length ? args[0] : 0;
        if (typeof x === 'string') { const s = x.trim(); if (!RE_NUM.test(s)) throw new ErrorDojo(`float() no puede convertir «${x}» en un número (ValueError).`, L, 'Los decimales van con punto: 2.5, no 2,5.'); return R(parseFloat(s)); }
        if (esNum(x)) return R(N(x));
        throw new ErrorDojo(`float() no puede convertir un ${nombreTipo(x, 'py')}.`, L);
      }
      case 'str': return args.length ? textoDe(args[0], 'py') : '';
      case 'bool': return args.length ? this.verdad(args[0]) : false;
      case 'len': { const x = uno(); if (typeof x === 'string' || Array.isArray(x)) return x.length; throw new ErrorDojo(`len() no funciona con un ${nombreTipo(x, 'py')}.`, L, 'len() sirve para textos y listas.'); }
      case 'range': {
        if (!args.length || args.length > 3) throw new ErrorDojo('range() lleva de 1 a 3 números.', L);
        if (args.some(a => !esNum(a) || esR(a))) throw new ErrorDojo('range() solo acepta números enteros.', L, args.some(a => typeof a === 'string') ? 'Si el número viene de input(), conviértelo con int(...).' : '');
        const [a, b, s] = args.length === 1 ? [0, N(args[0]), 1] : [N(args[0]), N(args[1]), args.length > 2 ? N(args[2]) : 1];
        if (s === 0) throw new ErrorDojo('El paso de range() no puede ser 0.', L);
        const r = []; if (s > 0) for (let k = a; k < b; k += s) r.push(k); else for (let k = a; k > b; k += s) r.push(k);
        if (r.length > LIMITE_PASOS) throw new ErrorDojo('Ese range es demasiado grande.', L);
        r.rango = 'range(' + args.map(x => N(x)).join(', ') + ')'; return r;
      }
      case 'abs': { const x = uno(); if (!esNum(x)) throw new ErrorDojo('abs() necesita un número.', L); return esR(x) ? R(Math.abs(x.v)) : Math.abs(N(x)); }
      case 'round': {
        const x = args[0]; if (!esNum(x)) throw new ErrorDojo('round() necesita un número.', L);
        const d = args.length > 1 && args[1] !== null ? N(args[1]) : null; const f = Math.pow(10, d || 0); const y = N(x) * f;
        let r = Math.round(y); if (Math.abs(y % 1) === 0.5) r = 2 * Math.round(y / 2);
        return d === null ? r : R(r / f);
      }
      case 'max': case 'min': {
        const l = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        if (!l.length) throw new ErrorDojo(`${n}() de una lista vacía.`, L);
        let best = l[0]; for (const x of l.slice(1)) if (this.compara(n === 'max' ? '>' : '<', x, best, L)) best = x;
        return best;
      }
      case 'sum': { const l = uno(); if (!Array.isArray(l)) throw new ErrorDojo('sum() suma los elementos de una lista.', L); let s = 0; for (const x of l) s = this.opBin('+', s, x, L); return s; }
      case 'sorted': { const l = uno(); const c = typeof l === 'string' ? [...l] : l.slice(); this.ordena(c, L); if (kw.reverse && this.verdad(kw.reverse)) c.reverse(); return c; }
      case 'list': { if (!args.length) return []; const x = uno(); if (typeof x === 'string') return [...x]; if (Array.isArray(x)) return x.slice(); throw new ErrorDojo(`list() no puede convertir un ${nombreTipo(x, 'py')}.`, L); }
      case 'reversed': { const x = uno(); return (typeof x === 'string' ? [...x] : x.slice()).reverse(); }
      case 'enumerate': { const x = uno(); return (typeof x === 'string' ? [...x] : x).map((v, k) => { const t = [k, v]; t.tupla = true; return t; }); }
      case 'ord': { const x = uno(); if (typeof x !== 'string' || x.length !== 1) throw new ErrorDojo('ord() recibe una sola letra.', L); return x.charCodeAt(0); }
      case 'chr': return String.fromCharCode(N(uno()));
    }
    if (this.importados.has(n) || n in MATH_PY) { if (n in MATH_PY && this.importados.has(n)) return this.mathPy(n, args, L); }
    const sug = parecido(n, [...INTEGRADAS_PY, ...[...this.funcs.values()].map(f => f.n)]);
    if (n in MATH_PY) throw new ErrorDojo(`«${n}» está en el módulo math.`, L, `Escribe arriba  import math  y úsala así:  math.${n}(...)`);
    throw new ErrorDojo(`La función «${n}» no existe (NameError).`, L, sug ? `¿Quisiste decir «${sug}»?` : 'Si es tuya, escríbela con def antes de usarla.');
  }
  mathPy(m, args, L) {
    const f = MATH_PY[m]; if (!f) throw new ErrorDojo(`El módulo math no tiene «${m}».`, L);
    if (!args.length || !args.every(esNum)) throw new ErrorDojo(`math.${m}() necesita números.`, L);
    const x = N(args[0]);
    if (m === 'sqrt' && x < 0) throw new ErrorDojo('No existe la raíz cuadrada de un número negativo (math domain error).', L);
    return f(x, args.length > 1 ? N(args[1]) : undefined);
  }
  integradaPs(e, args) {
    const L = e.linea, n = e.id;
    const txt = (k) => { if (typeof args[k] !== 'string') throw new ErrorDojo(`${e.f} necesita un texto.`, L); return args[k]; };
    const numk = (k) => { if (!esNum(args[k]) || typeof args[k] === 'boolean') throw new ErrorDojo(`${e.f} necesita un número.`, L); return N(args[k]); };
    switch (n) {
      case 'raiz': case 'rc': { const x = numk(0); if (x < 0) throw new ErrorDojo('No existe la raíz cuadrada de un número negativo.', L); return Math.sqrt(x); }
      case 'abs': return Math.abs(numk(0));
      case 'trunc': return Math.trunc(numk(0));
      case 'redon': return Math.round(numk(0));
      case 'azar': return Math.floor(Math.random() * numk(0));
      case 'aleatorio': { const a = numk(0), b = numk(1); return a + Math.floor(Math.random() * (b - a + 1)); }
      case 'sen': return Math.sin(numk(0)); case 'cos': return Math.cos(numk(0)); case 'tan': return Math.tan(numk(0));
      case 'ln': return Math.log(numk(0)); case 'exp': return Math.exp(numk(0));
      case 'longitud': return txt(0).length;
      case 'mayusculas': return txt(0).toUpperCase();
      case 'minusculas': return txt(0).toLowerCase();
      case 'subcadena': {
        const s = txt(0), a = numk(1), b = numk(2);
        if (a < 1 || b > s.length) throw new ErrorDojo(`Subcadena fuera del texto: «${s}» tiene posiciones de 1 a ${s.length}.`, L, 'En PSeInt las posiciones del texto empiezan en 1.');
        return s.substring(a - 1, b);
      }
      case 'concatenar': return txt(0) + txt(1);
      case 'convertiranumero': { const s = txt(0).trim(); if (!RE_NUM.test(s)) throw new ErrorDojo(`«${s}» no es un número.`, L); return parseFloat(s); }
      case 'convertiratexto': return fmtPs(numk(0));
    }
    const sug = parecido(e.f, [...INTEGRADAS_PS, ...[...this.funcs.values()].map(f => f.n)]);
    throw new ErrorDojo(`No existe la función «${e.f}».`, L, sug ? `¿Quisiste decir «${sug}»?` : 'Si es tuya, escríbela con Funcion ... FinFuncion.');
  }
  *integradaCpp(e, amb) {
    const L = e.linea, n = e.f;
    if (n === 'getline') {
      if (!e.args[0] || e.args[0].k !== 'var' || e.args[0].n !== 'cin' || !e.args[1] || !esLvalor(e.args[1])) throw new ErrorDojo('getline se usa así:  getline(cin, texto);', L);
      yield* this.asignar(e.args[1], yield* this.lineaCin(), amb, L); return FLUJO_CIN;
    }
    if (n === 'swap') {
      if (e.args.length !== 2 || !e.args.every(esLvalor)) throw new ErrorDojo('swap intercambia dos variables:  swap(a, b);', L);
      const a = yield* this.ev(e.args[0], amb), b = yield* this.ev(e.args[1], amb);
      yield* this.asignar(e.args[0], b, amb, L); yield* this.asignar(e.args[1], a, amb, L); return null;
    }
    const args = yield* this.evArgs(e.args, amb);
    const x = () => this.num1(args, n, L);
    switch (n) {
      case 'sqrt': { const v = x(); if (v < 0) throw new ErrorDojo('sqrt de un número negativo da «nan» (no es un número).', L); return R(Math.sqrt(v)); }
      case 'pow': if (args.length !== 2) throw new ErrorDojo('pow lleva dos números: pow(base, exponente).', L); return R(Math.pow(N(args[0]), N(args[1])));
      case 'abs': return esR(args[0]) ? R(Math.abs(x())) : Math.abs(x());
      case 'fabs': return R(Math.abs(x()));
      case 'floor': return R(Math.floor(x())); case 'ceil': return R(Math.ceil(x()));
      case 'round': { const v = x(); return R(Math.sign(v) * Math.round(Math.abs(v))); }
      case 'max': case 'min': {
        if (args.length !== 2) throw new ErrorDojo(`${n} compara dos valores: ${n}(a, b).`, L);
        const [a, b] = args; const r = this.compara(n === 'max' ? '>=' : '<=', a, b, L) ? a : b;
        return (esR(a) || esR(b)) && esNum(r) ? R(N(r)) : r;
      }
      case 'to_string': { const v = args[0]; if (!esNum(v)) throw new ErrorDojo('to_string convierte un número en texto.', L); return esR(v) ? v.v.toFixed(6) : String(N(v)); }
      case 'stoi': { const s = String(args[0] && args[0].c !== undefined ? args[0].c : args[0]); const m = /^\s*[-+]?\d+/.exec(s); if (!m) throw new ErrorDojo(`stoi no puede convertir «${s}» en número.`, L, 'En C++ de verdad esto lanza una excepción y el programa se detiene.'); return parseInt(m[0], 10); }
      case 'stod': { const s = String(args[0]); const m = /^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?/.exec(s); if (!m) throw new ErrorDojo(`stod no puede convertir «${s}» en número.`, L); return R(parseFloat(m[0])); }
      case 'sort': case 'reverse': {
        const [a, b] = args;
        if (!a || !b || !a.iter || a.iter !== b.iter) throw new ErrorDojo(`${n} se usa así:  ${n}(v.begin(), v.end());`, L);
        const parte = a.iter.slice(a.pos, b.pos); if (n === 'sort') this.ordena(parte, L); else parte.reverse();
        a.iter.splice(a.pos, parte.length, ...parte); return null;
      }
      case 'toupper': case 'tolower': { const c = args[0]; const ch = c instanceof Car ? c.c : String.fromCharCode(N(c)); return new Car(n === 'toupper' ? ch.toUpperCase() : ch.toLowerCase()); }
      case 'isdigit': case 'isalpha': case 'isupper': case 'islower': {
        const c = args[0]; const ch = c instanceof Car ? c.c : String.fromCharCode(N(c));
        return n === 'isdigit' ? /[0-9]/.test(ch) : n === 'isalpha' ? /[A-Za-z]/.test(ch) : n === 'isupper' ? /[A-Z]/.test(ch) : /[a-z]/.test(ch);
      }
      case 'rand': return Math.floor(Math.random() * 32768);
      case 'srand': return null; case 'time': return 0;
      case 'printf': case 'scanf': throw new ErrorDojo(`${n} es de C. En C++ se usa ${n === 'printf' ? 'cout <<' : 'cin >>'}.`, L);
      case 'main': throw new ErrorDojo('No se llama a main: el programa empieza ahí solo.', L);
    }
    const sug = parecido(n, [...INTEGRADAS_CPP, ...[...this.funcs.values()].map(f => f.n)]);
    throw new ErrorDojo(`No existe la función «${n}».`, L, sug ? `¿Quisiste decir «${sug}»?` : 'Si es tuya, escríbela antes de main con su tipo, por ejemplo:  int doble(int x) { return x * 2; }');
  }
  *metodo(e, amb) {
    const L = e.linea, m = e.m;
    if (this.lang === 'py' && e.obj.k === 'var' && e.obj.n === 'math' && !this.celda(e.obj, amb)) return this.mathPy(m, yield* this.evArgs(e.args, amb), L);
    if (this.lang === 'ps') throw new ErrorDojo('PSeInt no usa el punto: las funciones van así:  Longitud(texto).', L);
    const o = yield* this.ev(e.obj, amb); const args = yield* this.evArgs(e.args, amb);
    const kw = {}; for (const k in (e.kw || {})) kw[k] = yield* this.ev(e.kw[k], amb);
    if (this.lang === 'py') return this.metodoPy(o, m, args, kw, e);
    return yield* this.metodoCpp(o, m, args, e, amb);
  }
  metodoPy(o, m, args, kw, e) {
    const L = e.linea;
    const t0 = () => { if (typeof args[0] !== 'string') throw new ErrorDojo(`.${m}() necesita un texto entre paréntesis.`, L); return args[0]; };
    if (typeof o === 'string') switch (m) {
      case 'upper': return o.toUpperCase(); case 'lower': return o.toLowerCase();
      case 'strip': return o.trim(); case 'lstrip': return o.replace(/^\s+/, ''); case 'rstrip': return o.replace(/\s+$/, '');
      case 'title': return o.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      case 'capitalize': return o.charAt(0).toUpperCase() + o.slice(1).toLowerCase();
      case 'split': return args.length ? o.split(t0()) : o.trim().split(/\s+/).filter(x => x);
      case 'replace': return o.split(t0()).join(String(args[1]));
      case 'count': return o.split(t0()).length - 1;
      case 'find': return o.indexOf(t0());
      case 'startswith': return o.startsWith(t0()); case 'endswith': return o.endsWith(t0());
      case 'isdigit': return /^\d+$/.test(o); case 'isalpha': return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/.test(o);
      case 'isupper': return /[A-Z]/.test(o) && o === o.toUpperCase(); case 'islower': return /[a-z]/.test(o) && o === o.toLowerCase();
      case 'join': {
        const l = args[0]; if (!Array.isArray(l)) throw new ErrorDojo('.join() une los textos de una lista.', L);
        if (l.some(x => typeof x !== 'string')) throw new ErrorDojo('.join() solo une textos.', L, 'Convierte los números antes con str(...).');
        return l.join(o);
      }
    }
    if (Array.isArray(o)) switch (m) {
      case 'append': if (args.length !== 1) throw new ErrorDojo('.append() añade un solo elemento.', L); o.push(args[0]); return null;
      case 'pop': { if (!o.length) throw new ErrorDojo('No se puede sacar nada de una lista vacía.', L); if (args.length) return o.splice(this.posicion(o, args[0], e), 1)[0]; return o.pop(); }
      case 'insert': { let k = N(args[0]); if (k < 0) k += o.length; o.splice(Math.max(0, Math.min(o.length, k)), 0, args[1]); return null; }
      case 'remove': { const k = o.findIndex(x => this.igual(x, args[0])); if (k < 0) throw new ErrorDojo(`${reprPy(args[0])} no está en la lista.`, L); o.splice(k, 1); return null; }
      case 'index': { const k = o.findIndex(x => this.igual(x, args[0])); if (k < 0) throw new ErrorDojo(`${reprPy(args[0])} no está en la lista.`, L); return k; }
      case 'count': return o.filter(x => this.igual(x, args[0])).length;
      case 'sort': this.ordena(o, L); if (kw.reverse && this.verdad(kw.reverse)) o.reverse(); return null;
      case 'reverse': o.reverse(); return null;
      case 'clear': o.length = 0; return null;
      case 'copy': return o.slice();
      case 'extend': o.push(...args[0]); return null;
    }
    const metodos = typeof o === 'string' ? ['upper', 'lower', 'strip', 'split', 'replace', 'count', 'find', 'join', 'startswith', 'endswith', 'title', 'capitalize', 'isdigit'] : Array.isArray(o) ? ['append', 'pop', 'insert', 'remove', 'index', 'count', 'sort', 'reverse', 'clear', 'copy', 'extend'] : [];
    const sug = parecido(m, metodos);
    throw new ErrorDojo(`Un ${nombreTipo(o, 'py')} no tiene el método «.${m}()».`, L, sug ? `¿Quisiste decir «.${sug}()»?` : '');
  }
  *metodoCpp(o, m, args, e, amb) {
    const L = e.linea;
    const chOtxt = v => v instanceof Car ? v.c : v;
    if (typeof o === 'string') switch (m) {
      case 'length': case 'size': return o.length;
      case 'empty': return o.length === 0;
      case 'substr': {
        const p = N(args[0]); if (p > o.length) throw new ErrorDojo('substr empieza fuera del texto.', L, `El texto tiene ${o.length} letras (posiciones 0 a ${o.length - 1}).`);
        return o.substr(p, args.length > 1 ? N(args[1]) : o.length);
      }
      case 'find': return o.indexOf(chOtxt(args[0]));
      case 'at': return new Car(o[this.posicion(o, args[0], e)]);
      case 'push_back': case 'append': yield* this.asignar(e.obj, o + chOtxt(args[0]), amb, L); return null;
      case 'pop_back': yield* this.asignar(e.obj, o.slice(0, -1), amb, L); return null;
      case 'begin': return { iter: o, pos: 0 }; case 'end': return { iter: o, pos: o.length };
    }
    if (Array.isArray(o)) switch (m) {
      case 'push_back': case 'emplace_back': { const tp = this.tipoElemento({ k: 'idx', obj: e.obj, is: [{ k: 'num', v: 0 }], linea: L }, amb); o.push(this.coerce(tp, args[0], L)); return null; }
      case 'pop_back': if (!o.length) throw new ErrorDojo('pop_back sobre un vector vacío.', L, 'En C++ de verdad eso rompe el programa.'); o.pop(); return null;
      case 'size': return o.length; case 'empty': return o.length === 0; case 'clear': o.length = 0; return null;
      case 'back': if (!o.length) throw new ErrorDojo('back() de un vector vacío.', L); return o[o.length - 1];
      case 'front': if (!o.length) throw new ErrorDojo('front() de un vector vacío.', L); return o[0];
      case 'at': return o[this.posicion(o, args[0], e)];
      case 'begin': return { iter: o, pos: 0 }; case 'end': return { iter: o, pos: o.length };
    }
    if (o === FLUJO_COUT || o === FLUJO_CIN) throw new ErrorDojo(`No conozco «${nombreExpr(e.obj)}.${m}()».`, L);
    throw new ErrorDojo(`Un ${nombreTipo(o, 'cpp')} no tiene «.${m}()».`, L, typeof o === 'number' ? 'Los números no tienen métodos.' : '');
  }
}
const MATH_PY = {
  sqrt: x => R(Math.sqrt(x)), floor: x => Math.floor(x), ceil: x => Math.ceil(x), pow: (x, y) => R(Math.pow(x, y)),
  fabs: x => R(Math.abs(x)), trunc: x => Math.trunc(x), sin: x => R(Math.sin(x)), cos: x => R(Math.cos(x)), log: x => R(Math.log(x))
};
const INTEGRADAS_PY = ['print', 'input', 'int', 'float', 'str', 'bool', 'len', 'range', 'abs', 'round', 'max', 'min', 'sum', 'sorted', 'list', 'reversed', 'enumerate', 'ord', 'chr'];
const INTEGRADAS_PS = ['RAIZ', 'ABS', 'TRUNC', 'REDON', 'AZAR', 'ALEATORIO', 'Longitud', 'Mayusculas', 'Minusculas', 'Subcadena', 'Concatenar', 'ConvertirANumero', 'ConvertirATexto'];
const INTEGRADAS_CPP = ['sqrt', 'pow', 'abs', 'fabs', 'floor', 'ceil', 'round', 'max', 'min', 'to_string', 'stoi', 'stod', 'getline', 'swap', 'sort', 'reverse', 'toupper', 'tolower', 'isdigit', 'isalpha'];

/* ───────────── Lo que usa la app ───────────── */
function leer(src, lang) { return lang === 'py' ? leerPy(src) : lang === 'ps' ? leerPs(src) : leerCpp(src); }
function crear(src, lang) {
  let prog;
  try { prog = leer(src, lang); }
  catch (e) {
    if (!(e instanceof ErrorDojo)) e = new ErrorDojo('Fallo interno del Dojo al leer: ' + e.message, 0, 'Esto es un error de la app, no tuyo.');
    return { maquina: null, eventos: [], avanzar: () => ({ estado: 'error', error: e }), salida: () => '' };
  }
  const m = new Maquina(prog, lang); const gen = m.correr(); let fin = false;
  return {
    maquina: m, eventos: m.eventos, salida: () => m.out.join(''),
    avanzar(entrada) {
      if (fin) return { estado: 'fin' };
      try { const r = gen.next(entrada); if (r.done) { fin = true; return { estado: 'fin' }; } return { estado: 'pide' }; }
      catch (e) {
        fin = true;
        if (e instanceof ErrorDojo) return { estado: 'error', error: e };
        if (e instanceof RangeError) return { estado: 'error', error: new ErrorDojo('El programa se metió en demasiadas llamadas.', m.linea, '¿Una función que se llama a sí misma sin parar?') };
        return { estado: 'error', error: new ErrorDojo('Fallo interno del Dojo: ' + e.message, m.linea, 'Esto es un error de la app, no tuyo.') };
      }
    }
  };
}
function correr(src, lang, entradas) {
  const ej = crear(src, lang); const cola = (entradas || []).map(String); let r = ej.avanzar();
  while (r.estado === 'pide') {
    if (!cola.length) { r = { estado: 'error', error: new ErrorDojo('El programa pidió un dato y no había ninguno preparado.', ej.maquina ? ej.maquina.linea : 0, 'Escribe los datos en «Entrada», uno por línea.') }; break; }
    r = ej.avanzar(cola.shift());
  }
  return { salida: ej.salida(), error: r.estado === 'error' ? r.error : null, eventos: ej.eventos };
}
const Motor = { correr, crear, leer, escanear, ErrorDojo, textoDe };
if (typeof module !== 'undefined' && module.exports) module.exports = Motor; else raiz.Motor = Motor;
})(typeof window !== 'undefined' ? window : globalThis);
