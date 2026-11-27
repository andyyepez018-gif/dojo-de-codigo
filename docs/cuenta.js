/* Dojo de código · cuentas de los aprendices con Supabase (gratis): registrarse con correo, contraseña,
   nombre y ficha del SENA, entrar, salir y guardar el progreso de cada uno en la base de datos.
   Habla directamente con la API de Supabase (sin librerías). Las contraseñas las guarda Supabase
   cifradas: el Dojo solo las envía al entrar o registrarse y nunca las guarda.
   La base de datos se prepara con supabase/esquema.sql. Sin URL ni clave pública, las cuentas están
   apagadas y el Dojo funciona como siempre (progreso en el aparato o en la cuenta de Claude). */
(function (raiz) {
'use strict';
// Los dos datos públicos del proyecto (Supabase → Project Settings → API). La clave «anon» está hecha
// para ir en la página: la seguridad la ponen las reglas de la base de datos (cada uno ve solo lo suyo).
const CONFIG = { url: '', anon: '' };

const CLAVE_SESION = 'dojo-sesion';
const lee = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const guarda = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
function config() {
  // Solo en las pruebas automáticas se puede usar otro proyecto (uno de mentira)
  const otra = lee('dojo-pruebas') === 1 ? lee('dojo-cuenta-config') : null;
  const c = otra && otra.url ? otra : CONFIG;
  return { url: String(c.url || '').replace(/\/+$/, ''), anon: String(c.anon || '') };
}
const activa = () => { const c = config(); return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(c.url) && c.anon.length > 20; };

class ErrorCuenta extends Error { constructor(msg, codigo) { super(msg); this.codigo = codigo || ''; } }
const MENSAJES = {
  invalid_credentials: 'El correo o la contraseña no son correctos.',
  user_already_exists: 'Ya hay una cuenta con ese correo. Entra con tu contraseña.',
  email_exists: 'Ya hay una cuenta con ese correo. Entra con tu contraseña.',
  weak_password: 'La contraseña es muy débil: usa al menos 8 caracteres, con letras y números.',
  email_not_confirmed: 'Todavía no confirmaste tu correo: busca el mensaje de confirmación (también en spam).',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Espera unos minutos y vuelve a intentarlo.',
  over_request_rate_limit: 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.',
  email_address_invalid: 'Ese correo no es válido.',
  validation_failed: 'Revisa los datos: el correo o la contraseña no son válidos.',
  signup_disabled: 'El registro está cerrado por ahora.',
  unexpected_failure: 'Supabase no pudo guardar la cuenta. Revisa que el nombre y la ficha sean válidos.'
};
async function pide(ruta, { metodo = 'GET', cuerpo, token, prefer } = {}) {
  const c = config(); if (!activa()) throw new ErrorCuenta('Las cuentas no están configuradas.', 'sin_config');
  const cab = { apikey: c.anon, 'Content-Type': 'application/json' };
  cab.Authorization = 'Bearer ' + (token || c.anon); if (prefer) cab.Prefer = prefer;
  let r;
  try { r = await fetch(c.url + ruta, { method: metodo, headers: cab, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }); }
  catch (e) { throw new ErrorCuenta('Sin conexión: revisa tu internet y vuelve a intentarlo.', 'red'); }
  let datos = null; const texto = await r.text(); try { datos = texto ? JSON.parse(texto) : null; } catch (e) { datos = null; }
  if (!r.ok) {
    const cod = (datos && (datos.error_code || datos.code || datos.error)) || String(r.status);
    const msg = MENSAJES[cod] || (r.status === 401 || r.status === 403 ? 'Tu sesión caducó: vuelve a entrar.' : (datos && (datos.msg || datos.message || datos.error_description)) || 'Algo falló al hablar con la base de datos.');
    throw new ErrorCuenta(msg, r.status === 401 ? 'sin_sesion' : cod);
  }
  return datos;
}

/* ── Sesión ── */
function sesion() { const s = lee(CLAVE_SESION); return s && s.access_token && s.user && s.user.id ? s : null; }
function ponSesion(d) {
  if (!d || !d.access_token) return null;
  const s = { access_token: d.access_token, refresh_token: d.refresh_token, expira: Date.now() + (Number(d.expires_in) || 3600) * 1000, user: { id: d.user.id, email: d.user.email, nombre: (d.user.user_metadata || {}).nombre || '', ficha: (d.user.user_metadata || {}).ficha || '' } };
  guarda(CLAVE_SESION, s); return s;
}
let renovando = null;
async function token() {
  const s = sesion(); if (!s) throw new ErrorCuenta('No has entrado.', 'sin_sesion');
  if (s.expira - Date.now() > 60000) return s.access_token;
  if (!renovando) renovando = pide('/auth/v1/token?grant_type=refresh_token', { metodo: 'POST', cuerpo: { refresh_token: s.refresh_token } })
    .then(d => ponSesion(d).access_token)
    .catch(e => { if (e.codigo !== 'red') guarda(CLAVE_SESION, null); throw e; })
    .finally(() => { renovando = null; });
  return renovando;
}

/* ── Registrarse, entrar y salir ── */
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validaRegistro({ nombre, correo, ficha, clave, clave2, acepta }) {
  const n = String(nombre || '').trim().replace(/\s+/g, ' ');
  if (n.length < 2 || n.length > 80) return 'Escribe tu nombre (y tu apellido).';
  if (!RE_CORREO.test(String(correo || '').trim())) return 'Escribe un correo válido, por ejemplo nombre@gmail.com.';
  if (!/^[0-9]{4,10}$/.test(String(ficha || '').trim())) return 'La ficha del SENA son solo números (entre 4 y 10 cifras).';
  if (String(clave || '').length < 8) return 'La contraseña tiene que tener al menos 8 caracteres.';
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(clave) || !/[0-9]/.test(clave)) return 'La contraseña tiene que tener letras y números.';
  if (clave2 !== undefined && clave !== clave2) return 'Las dos contraseñas no coinciden.';
  if (!acepta) return 'Para crear la cuenta tienes que aceptar el tratamiento de tus datos.';
  return '';
}
async function registra(datos) {
  const mal = validaRegistro(datos); if (mal) throw new ErrorCuenta(mal, 'validacion');
  const nombre = String(datos.nombre).trim().replace(/\s+/g, ' '), ficha = String(datos.ficha).trim(), correo = String(datos.correo).trim().toLowerCase();
  const d = await pide('/auth/v1/signup', { metodo: 'POST', cuerpo: { email: correo, password: datos.clave, data: { nombre, ficha, acepta_datos: true } } });
  // Si el proyecto pide confirmar el correo, Supabase no da sesión hasta que se confirme
  if (d && d.access_token) return { sesion: ponSesion(d), confirmar: false };
  return { sesion: null, confirmar: true };
}
async function entra({ correo, clave }) {
  if (!RE_CORREO.test(String(correo || '').trim()) || !clave) throw new ErrorCuenta('Escribe tu correo y tu contraseña.', 'validacion');
  const d = await pide('/auth/v1/token?grant_type=password', { metodo: 'POST', cuerpo: { email: String(correo).trim().toLowerCase(), password: clave } });
  return ponSesion(d);
}
async function sale() {
  const s = sesion(); guarda(CLAVE_SESION, null);
  if (s) { try { await pide('/auth/v1/logout', { metodo: 'POST', token: s.access_token }); } catch (e) { /* ya no hay sesión: da igual */ } }
}

/* ── Datos del aprendiz ── */
async function perfil() {
  const s = sesion(); if (!s) return null;
  const filas = await pide(`/rest/v1/perfiles?id=eq.${encodeURIComponent(s.user.id)}&select=nombre,ficha,correo`, { token: await token() });
  return filas && filas[0] ? filas[0] : { nombre: s.user.nombre, ficha: s.user.ficha, correo: s.user.email };
}
async function leeProgreso() {
  const s = sesion(); if (!s) throw new ErrorCuenta('No has entrado.', 'sin_sesion');
  const filas = await pide(`/rest/v1/progreso?id=eq.${encodeURIComponent(s.user.id)}&select=datos,actualizado`, { token: await token() });
  return filas && filas[0] ? filas[0] : null;
}
async function guardaProgreso(datos) {
  const s = sesion(); if (!s) throw new ErrorCuenta('No has entrado.', 'sin_sesion');
  await pide('/rest/v1/progreso?on_conflict=id', { metodo: 'POST', token: await token(), prefer: 'resolution=merge-duplicates,return=minimal', cuerpo: { id: s.user.id, datos, actualizado: Number(datos && datos.actualizado) || 0, modificado: new Date().toISOString() } });
}
async function borraCuenta() {
  await pide('/rest/v1/rpc/borrar_mi_cuenta', { metodo: 'POST', token: await token(), cuerpo: {} });
  guarda(CLAVE_SESION, null);
}

const Cuenta = { activa, config, sesion, registra, entra, sale, perfil, leeProgreso, guardaProgreso, borraCuenta, validaRegistro, ErrorCuenta, MENSAJES };
if (typeof module !== 'undefined' && module.exports) module.exports = Cuenta; else raiz.Cuenta = Cuenta;
})(typeof window !== 'undefined' ? window : globalThis);
