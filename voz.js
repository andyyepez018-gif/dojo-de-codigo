/* Voz del Dojo: oír inglés y hablarlo.
   Dentro de Claude usa su voz (tts) y su dictado; en la app instalada, la voz y el reconocimiento del
   navegador (Chrome, Edge, Safari). Si no hay ninguno, la app sigue funcionando: se lee y se escribe.
   Reglas de Claude que se respetan: hablar y escuchar solo después de un toque del usuario, el texto
   siempre en pantalla, y si el usuario apaga la voz de Claude no se le habla con otra voz. */
(function (raiz) {
'use strict';
const nav = typeof navigator !== 'undefined' ? navigator : {};
const Reconocedor = raiz.SpeechRecognition || raiz.webkitSpeechRecognition || null;
const sintesis = raiz.speechSynthesis || null;

const V = {
  sale: false, entra: false, origenSale: '', origenEntra: '', hablando: false, escuchando: false,
  tts: null, dictado: null, vozNavegador: null, prohibidoSalir: false, prohibidoEntrar: false,
  avisos: new Set(),
  alCambiar(fn) { this.avisos.add(fn); return () => this.avisos.delete(fn); },
  cambio() { for (const fn of this.avisos) { try { fn(this); } catch (e) { /* nada */ } } },

  /* Mira qué hay. En Claude, las capacidades llegan más tarde: se repinta al llegar. */
  iniciar(enClaude) {
    this.navegador();
    if (enClaude && raiz.claude && raiz.claude.use) {
      raiz.claude.use('tts').then(t => {
        if (!t) return; this.tts = t; this.sale = true; this.origenSale = 'claude';
        t.onState(({ state, reason }) => {
          this.hablando = state !== 'idle';
          if (state === 'idle' && (reason === 'not_granted' || reason === 'unavailable')) { this.tts = null; this.prohibidoSalir = reason === 'not_granted'; this.navegador(); }
          this.cambio();
        });
        this.cambio();
      }).catch(() => {});
      raiz.claude.use('dictation').then(d => {
        if (!d) return; this.dictado = d; this.entra = true; this.origenEntra = 'claude';
        d.onState(({ state }) => { this.escuchando = state !== 'idle'; this.cambio(); });
        this.cambio();
      }).catch(() => {});
    }
  },
  navegador() {
    if (!this.tts) {
      this.sale = !this.prohibidoSalir && !!(sintesis && raiz.SpeechSynthesisUtterance);
      this.origenSale = this.sale ? 'navegador' : '';
      if (this.sale) { this.eligeVoz(); if (sintesis.addEventListener) sintesis.addEventListener('voiceschanged', () => this.eligeVoz()); }
    }
    if (!this.dictado) { this.entra = !this.prohibidoEntrar && !!Reconocedor; this.origenEntra = this.entra ? 'navegador' : ''; }
  },
  /* La mejor voz en inglés que tenga el sistema (las «naturales» y las de Google suenan mejor) */
  eligeVoz() {
    const voces = (sintesis && sintesis.getVoices && sintesis.getVoices()) || [];
    const en = voces.filter(v => /^en[-_]/i.test(v.lang));
    const nota = v => (/natural|neural|online/i.test(v.name) ? 6 : 0) + (/google/i.test(v.name) ? 4 : 0) + (/^en[-_]US/i.test(v.lang) ? 3 : /^en[-_]GB/i.test(v.lang) ? 2 : 0) + (/aria|jenny|guy|samantha|zira|david/i.test(v.name) ? 1 : 0) + (v.localService === false ? 1 : 0);
    this.vozNavegador = en.sort((a, b) => nota(b) - nota(a))[0] || null;
  },
  get descripcion() {
    const s = this.origenSale === 'claude' ? 'voz de Claude' : this.origenSale === 'navegador' ? 'voz del dispositivo' : 'sin audio';
    const e = this.origenEntra === 'claude' ? 'dictado de Claude' : this.origenEntra === 'navegador' ? 'micrófono del dispositivo' : 'sin micrófono';
    return { s, e };
  },

  /* Decir un texto en inglés. Llamar desde un toque del usuario. Devuelve una promesa que no falla. */
  decir(texto, { lento = false, ritmo = 1 } = {}) {
    texto = String(texto || '').slice(0, 1900); if (!texto || !this.sale) return Promise.resolve(false);
    if (this.escuchando) this.parar();
    if (this.tts) {
      return this.tts.speak(texto, { language: 'en', rate: lento ? 0.75 : ritmo }).then(() => true, e => {
        if (e && (e.code === 'not_granted' || e.code === 'unavailable')) { this.tts = null; this.prohibidoSalir = e.code === 'not_granted'; this.navegador(); this.cambio(); }
        return false;
      });
    }
    return new Promise(listo => {
      try {
        sintesis.cancel();
        const u = new raiz.SpeechSynthesisUtterance(texto);
        u.lang = (this.vozNavegador && this.vozNavegador.lang) || 'en-US'; if (this.vozNavegador) u.voice = this.vozNavegador;
        u.rate = lento ? 0.7 : 0.95 * ritmo;
        u.onstart = () => { this.hablando = true; this.cambio(); };
        u.onend = u.onerror = () => { this.hablando = false; this.cambio(); listo(true); };
        sintesis.speak(u);
        setTimeout(() => { if (!sintesis.speaking && !sintesis.pending) { this.hablando = false; listo(false); } }, 4000);
      } catch (e) { this.hablando = false; listo(false); }
    });
  },
  callar() { try { if (this.tts) this.tts.stop().catch(() => {}); else if (sintesis) sintesis.cancel(); } catch (e) { /* nada */ } this.hablando = false; this.cambio(); },

  /* Escuchar una frase en inglés. LLAMAR DIRECTAMENTE DESDE EL TOQUE (sin await antes).
     o.parcial(texto) muestra lo que va oyendo; la promesa da { alternativas: [...] } o { error: código }. */
  escuchar(o = {}) {
    if (!this.entra) return Promise.resolve({ error: 'sin_microfono', alternativas: [] });
    if (this.hablando) this.callar();
    return this.dictado ? this.escuchaClaude(o) : this.escuchaNavegador(o);
  },
  parar() { if (this.detener) this.detener(); },

  escuchaClaude(o) {
    const d = this.dictado; let final = '', parcial = '', silencio = null, terminado = false, quitar = [];
    return new Promise(listo => {
      const fin = res => {
        if (terminado) return; terminado = true; clearTimeout(silencio); quitar.forEach(q => q()); this.detener = null; this.escuchando = false; this.cambio();
        listo(res);
      };
      // El dictado no se para solo: tras 1,6 s sin palabras nuevas, se da por terminada la frase
      const espera = () => { clearTimeout(silencio); silencio = setTimeout(() => { d.stop().catch(() => {}); }, 1600); };
      quitar = [
        d.onPartial(({ text }) => { parcial = text; if (o.parcial) o.parcial((final + ' ' + text).trim()); if (text) espera(); }),
        d.onFinal(({ text }) => { final = (final + text).trim(); parcial = ''; if (o.parcial) o.parcial(final); espera(); }),
        d.onState(({ state, reason }) => {
          if (state === 'idle') {
            const texto = (final + ' ' + parcial).trim();
            if (reason === 'not_granted' || reason === 'unavailable') { this.dictado = null; this.prohibidoEntrar = reason === 'not_granted'; this.navegador(); }
            fin(texto ? { alternativas: [texto] } : { error: reason === 'stopped' || reason === 'viewer_stopped' ? 'silencio' : (reason || 'silencio'), alternativas: [] });
          }
        })
      ];
      this.detener = () => { d.stop().catch(() => {}); };
      // start() va primero, antes de tocar la pantalla: el dictado tiene que salir del toque mismo
      d.start({ language: 'en' }).then(() => { if (!final && !parcial) silencio = setTimeout(() => d.stop().catch(() => {}), 7000); }, e => {
        const c = (e && e.code) || 'upstream_error';
        // si dijo que no al micrófono de Claude, no se le pide por otro lado
        if (c === 'not_granted' || c === 'unavailable') { this.dictado = null; this.prohibidoEntrar = c === 'not_granted'; this.navegador(); }
        fin({ error: c, alternativas: [] });
      });
      if (!terminado) { this.escuchando = true; this.cambio(); }
    });
  },
  escuchaNavegador(o) {
    return new Promise(listo => {
      let rec, alternativas = [], ultimo = '', terminado = false;
      const fin = res => { if (terminado) return; terminado = true; this.detener = null; this.escuchando = false; this.cambio(); listo(res); };
      try {
        rec = new Reconocedor(); rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
      } catch (e) { this.entra = false; this.cambio(); return fin({ error: 'sin_microfono', alternativas: [] }); }
      rec.onresult = ev => {
        let texto = '';
        for (let i = 0; i < ev.results.length; i++) {
          const r = ev.results[i]; texto += r[0].transcript;
          if (r.isFinal) { alternativas = []; for (let k = 0; k < r.length; k++) alternativas.push(r[k].transcript); }
        }
        ultimo = texto.trim(); if (o.parcial) o.parcial(ultimo);
      };
      rec.onerror = ev => {
        const c = ev && ev.error;
        if (c === 'not-allowed' || c === 'service-not-allowed') { this.entra = false; this.cambio(); fin({ error: 'not_granted', alternativas: [] }); }
        else if (c === 'no-speech' || c === 'aborted') fin({ error: 'silencio', alternativas: [] });
        else if (c === 'network') fin({ error: 'red', alternativas: [] });
        else fin({ error: 'upstream_error', alternativas: [] });
      };
      const resultado = () => (alternativas.length || ultimo ? { alternativas: alternativas.length ? alternativas : [ultimo] } : { error: 'silencio', alternativas: [] });
      rec.onend = () => { clearTimeout(tope); fin(resultado()); };
      this.detener = () => { try { rec.stop(); } catch (e) { /* nada */ } setTimeout(() => fin(resultado()), 1500); };
      // por si el navegador se queda escuchando para siempre (pasa sin red en algunos móviles)
      const tope = setTimeout(() => this.detener && this.detener(), 12000);
      try { rec.start(); this.escuchando = true; this.cambio(); } catch (e) { clearTimeout(tope); fin({ error: 'upstream_error', alternativas: [] }); }
    });
  }
};
/* Lo que se le dice al usuario cuando escuchar falla */
V.mensajeError = c => ({
  not_granted: 'Sin permiso para el micrófono. Puedes escribir la respuesta en su lugar.',
  dismissed: 'No se dio permiso al micrófono. Toca otra vez para intentarlo, o escribe la respuesta.',
  silencio: 'No te oí. Toca el micrófono y habla cerca del teléfono.',
  red: 'El reconocimiento de voz necesita internet. Escribe la respuesta o prueba luego.',
  rate_limited: 'El micrófono está ocupado ahora mismo. Prueba en unos segundos.',
  sin_microfono: 'Este navegador no puede escuchar. Escribe la respuesta.',
  unavailable: 'El dictado no está disponible aquí. Escribe la respuesta.'
}[c] || 'No se pudo escuchar. Prueba otra vez o escribe la respuesta.');

raiz.Voz = V;
})(typeof window !== 'undefined' ? window : globalThis);
