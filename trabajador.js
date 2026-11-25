/* Hilo aparte que ejecuta el código: la pantalla nunca se congela y el programa se puede detener.
   Mensajes que recibe: {tipo:'correr', codigo, lang, opciones} y {tipo:'entrada', texto}.
   Mensajes que envía: listo (avisos), pausa (salida parcial), pide, fin, error; con los eventos de la consola. */
importScripts('motor.js');
let ej = null, conTraza = false;
const err = e => ({ message: e.message, linea: e.linea, pista: e.pista });
function sigue(entrada) {
  let r = ej.avanzar(entrada);
  const t0 = Date.now();
  while (r.estado === 'pausa') {
    if (Date.now() - t0 > 120) { postMessage({ tipo: 'pausa', eventos: ej.eventos }); setTimeout(() => sigue(), 0); return; }
    r = ej.avanzar();
  }
  const fin = r.estado === 'fin' || r.estado === 'error';
  postMessage({ tipo: r.estado, eventos: ej.eventos, error: r.error ? err(r.error) : null, traza: fin && conTraza ? ej.traza() : null });
}
onmessage = e => {
  const m = e.data;
  if (m.tipo === 'correr') {
    conTraza = !!(m.opciones && m.opciones.traza);
    ej = self.Motor.crear(m.codigo, m.lang, Object.assign({ pausas: true }, m.opciones));
    postMessage({ tipo: 'listo', avisos: ej.avisos });
    sigue();
  } else if (m.tipo === 'entrada' && ej) sigue(m.texto);
};
