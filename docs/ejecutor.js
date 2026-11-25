/* Ejecuta código del alumno. Por defecto en un hilo aparte (trabajador.js); si el navegador no lo
   permite, en la página misma con un límite de pasos más bajo. La interfaz es la misma en los dos casos. */
(function (raiz) {
'use strict';
const LIMITE_HILO = 5000000, LIMITE_LOCAL = 300000;
let hiloRoto = false;
function ejecutar(codigo, lang, cb, opciones = {}) {
  const op = Object.assign({}, opciones);
  let w = null, activo = true, arranco = false, temporizador = null, local = null;
  const termina = () => { activo = false; clearTimeout(temporizador); if (w) { w.terminate(); w = null; } };
  const ctl = {
    get activo() { return activo; },
    enviar(texto) { if (!activo) return; if (w) w.postMessage({ tipo: 'entrada', texto }); else if (local) paso(local.avanzar(texto)); },
    detener() { if (!activo) return; termina(); cb.detenido && cb.detenido(); }
  };
  function paso(r) {
    while (r.estado === 'pausa') r = local.avanzar();
    cb.salida(local.eventos);
    if (r.estado === 'pide') { cb.pide(); return; }
    activo = false;
    if (r.estado === 'error') cb.error(r.error, op.traza ? local.traza() : null); else cb.fin(op.traza ? local.traza() : null);
  }
  function enLaPagina() {
    if (w) { w.terminate(); w = null; }
    local = raiz.Motor.crear(codigo, lang, Object.assign({}, op, { limite: LIMITE_LOCAL }));
    cb.avisos && cb.avisos(local.avisos || []);
    paso(local.avanzar());
  }
  if (hiloRoto || typeof Worker === 'undefined') { setTimeout(enLaPagina, 0); return ctl; }
  try { w = new Worker('trabajador.js'); } catch (e) { hiloRoto = true; setTimeout(enLaPagina, 0); return ctl; }
  temporizador = setTimeout(() => { if (!arranco && activo) { hiloRoto = true; enLaPagina(); } }, 4000);
  w.onerror = ev => { if (ev.preventDefault) ev.preventDefault(); if (!arranco && activo) { hiloRoto = true; clearTimeout(temporizador); enLaPagina(); } else if (activo) { termina(); cb.error({ message: 'El hilo de ejecución falló de forma inesperada.', linea: 0, pista: 'Esto es un error de la app, no tuyo. Prueba otra vez.' }, null); } };
  w.onmessage = ev => {
    if (!activo) return;
    const m = ev.data; arranco = true; clearTimeout(temporizador);
    if (m.tipo === 'listo') { cb.avisos && cb.avisos(m.avisos || []); return; }
    cb.salida(m.eventos);
    if (m.tipo === 'pide') cb.pide();
    else if (m.tipo === 'fin') { termina(); cb.fin(m.traza); }
    else if (m.tipo === 'error') { termina(); cb.error(m.error, m.traza); }
  };
  w.postMessage({ tipo: 'correr', codigo, lang, opciones: Object.assign({}, op, { limite: LIMITE_HILO }) });
  return ctl;
}
/* Ejecuta hasta el final con datos ya preparados (para el paso a paso y las comprobaciones). */
function ejecutarConDatos(codigo, lang, entradas, opciones) {
  return new Promise(resolve => {
    const cola = (entradas || []).map(String); let eventos = [], faltaDato = false;
    const ctl = ejecutar(codigo, lang, {
      salida: ev => { eventos = ev; },
      pide: () => { if (cola.length) ctl.enviar(cola.shift()); else { faltaDato = true; ctl.detener(); } },
      fin: traza => resolve({ eventos, traza, error: null }),
      error: (error, traza) => resolve({ eventos, traza, error }),
      detenido: () => resolve({ eventos, traza: null, error: faltaDato ? { message: 'El programa pidió un dato y no había ninguno preparado.', linea: 0, pista: 'Escribe los datos de entrada, uno por línea.' } : { message: 'Detenido.', linea: 0 } })
    }, opciones);
  });
}
const Ejecutor = { ejecutar, ejecutarConDatos, LIMITE_HILO, LIMITE_LOCAL };
if (typeof module !== 'undefined' && module.exports) module.exports = Ejecutor; else raiz.Ejecutor = Ejecutor;
})(typeof window !== 'undefined' ? window : globalThis);
