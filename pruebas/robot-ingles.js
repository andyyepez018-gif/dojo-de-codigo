// Ayudas para probar el inglés en el navegador: voz y micrófono simulados y un alumno robot que conoce el curso.
const pausa = ms => new Promise(r => setTimeout(r, ms));
/* Voz y micrófono simulados: lo que la app «dice» queda en window.__dicho; lo que «oye» es window.__oir */
const vozFalsa = () => {
  window.__dicho = []; window.__oir = '';
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  const ss = { speaking: false, pending: false, getVoices: () => [{ name: 'Google US English', lang: 'en-US', localService: false }], addEventListener() {}, cancel() {},
    speak(u) { window.__dicho.push(u.text); setTimeout(() => { if (u.onstart) u.onstart(); setTimeout(() => { if (u.onend) u.onend(); }, 20); }, 5); } };
  Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
  window.SpeechRecognition = window.webkitSpeechRecognition = class { start() { setTimeout(() => { if (!window.__oir) { this.onerror && this.onerror({ error: 'no-speech' }); this.onend && this.onend(); return; } const r = [{ transcript: window.__oir }, { transcript: window.__oir + ' extra' }]; r.isFinal = true; this.onresult({ results: [r] }); this.onend(); }, 60); } stop() {} };
};
/* Un alumno robot que conoce el curso: responde bien (o mal a propósito) cualquier ejercicio de inglés */
const CURSO = require('../ingles.js');
const TIPO_DE = Object.fromEntries(Object.entries(CURSO.NOMBRE_TIPO).map(([k, v]) => [v, k]));
const frases = CURSO.unidades.flatMap(u => u.frases), palabras = CURSO.unidades.flatMap(u => u.palabras);
async function resuelveIngles(p, bien = true) {
  const tipo = TIPO_DE[(await p.textContent('#v-ingles .reto-cab .etiqueta')).trim()];
  const opcionTexto = async t => { const ops = await p.locator('#v-ingles .opcion .texto-opcion').allTextContents(); let k = ops.findIndex(x => x.trim().toLowerCase() === String(t).toLowerCase()); if (!bien) k = ops.findIndex((x, j) => j !== k); await p.locator('#v-ingles .opcion').nth(k).click(); };
  const ultimoDicho = async () => { let d = await p.evaluate(() => window.__dicho.at(-1)); if (!d) { await p.locator('#v-ingles .btn.oir.grande').first().click(); await pausa(80); d = await p.evaluate(() => window.__dicho.at(-1)); } return d; };
  if (tipo === 'significado') { const w = (await p.textContent('#v-ingles .en-grande')).trim(); await opcionTexto(palabras.find(x => x.en === w).es); }
  else if (tipo === 'palabra') { const es = (await p.textContent('#v-ingles .es-grande')).trim(); await opcionTexto(palabras.find(x => x.es === es).en); }
  else if (tipo === 'escucha') await opcionTexto(await ultimoDicho());
  else if (tipo === 'error') { const m = (await p.textContent('#v-ingles .salida')).trim(); await opcionTexto(CURSO.errores.find(e => e[0] === m)[1]); }
  else if (tipo === 'hueco') {
    const con = (await p.textContent('#v-ingles .frase-en')).trim(); const re = new RegExp('^' + con.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('____', '(\\S+?)') + '$');
    const f = frases.find(x => re.test(x.en)); await opcionTexto(re.exec(f.en)[1]);
  } else if (tipo === 'ordenar') {
    const es = (await p.textContent('#v-ingles .reto p b')).trim(); const f = frases.find(x => x.es === es);
    const fichas = bien ? f.en.replace(/[.!?]$/, '').split(/\s+/) : f.en.replace(/[.!?]$/, '').split(/\s+/).reverse();
    for (const w of fichas) await p.evaluate(w => { const b = [...document.querySelectorAll('#v-ingles .fichas .ficha')].find(x => x.textContent.toLowerCase() === w.toLowerCase()); if (b) b.click(); }, w);
    await p.locator('#v-ingles').getByRole('button', { name: 'Comprobar' }).click();
  } else if (tipo === 'traducir' || tipo === 'dictado') {
    const esT = tipo === 'dictado' ? '' : (await p.textContent('#v-ingles .es-grande')).trim();
    const objetivo = tipo === 'dictado' ? await ultimoDicho() : frases.find(x => x.es === esT).en;
    await p.fill('#ing-escrito', bien ? objetivo : 'banana banana'); await p.locator('#v-ingles').getByRole('button', { name: 'Comprobar' }).click();
  } else if (tipo === 'habla') {
    const en = (await p.textContent('#v-ingles .palabra-grande .frase-en')).trim();
    await p.evaluate(t => { window.__oir = t; }, bien ? en : 'banana pizza'); await p.locator('#v-ingles .microfono').click();
  }
  try { await p.locator('#v-ingles .respuesta').waitFor({ timeout: 5000 }); }
  catch (e) { throw new Error(`el ejercicio «${tipo}» no se pudo responder: ${(await p.textContent('#v-ingles .ejercicio')).slice(0, 300)}`); }
  return tipo;
}
const cierraFiesta = async p => { if (await p.locator('.capa').count()) await p.locator('.capa').getByRole('button', { name: 'Seguir' }).click(); };
module.exports = { vozFalsa, resuelveIngles, cierraFiesta, CURSO };
