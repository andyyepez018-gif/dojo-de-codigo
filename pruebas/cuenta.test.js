// Pruebas del módulo de cuentas (sin navegador, con un fetch de mentira): node pruebas/cuenta.test.js
const almacen = new Map();
globalThis.localStorage = { getItem: k => (almacen.has(k) ? almacen.get(k) : null), setItem: (k, v) => almacen.set(k, String(v)), removeItem: k => almacen.delete(k) };
const C = require('../cuenta.js');
let bien = 0, mal = 0; const ok = (n, c, d) => { if (c) bien++; else { mal++; console.log('✗ ' + n + (d !== undefined ? ' → ' + JSON.stringify(d) : '')); } };
(async () => {
  ok('sin configurar, las cuentas están apagadas (el Dojo funciona como siempre)', C.activa() === false);
  localStorage.setItem('dojo-cuenta-config', JSON.stringify({ url: 'https://prueba.supabase.co', anon: 'a'.repeat(40) }));
  ok('la configuración de prueba solo vale en modo pruebas', C.activa() === false);
  localStorage.setItem('dojo-pruebas', '1');
  ok('en modo pruebas se activa', C.activa() === true);
  localStorage.setItem('dojo-cuenta-config', JSON.stringify({ url: 'https://evil.example.com', anon: 'a'.repeat(40) }));
  ok('solo acepta direcciones de Supabase', C.activa() === false);
  localStorage.setItem('dojo-cuenta-config', JSON.stringify({ url: 'https://prueba.supabase.co/', anon: 'a'.repeat(40) }));
  // validación del registro
  const bueno = { nombre: 'Ana Pérez', correo: 'ana@correo.com', ficha: '2834567', clave: 'clave1234', clave2: 'clave1234', acepta: true };
  ok('registro válido', C.validaRegistro(bueno) === '');
  const casos = [[{ nombre: 'A' }, /nombre/], [{ correo: 'ana@' }, /correo válido/], [{ ficha: '12' }, /ficha/], [{ ficha: '28a4567' }, /ficha/], [{ clave: 'corta1', clave2: 'corta1' }, /8 caracteres/], [{ clave: 'solamenteletras', clave2: 'solamenteletras' }, /letras y números/], [{ clave2: 'otra12345' }, /no coinciden/], [{ acepta: false }, /tratamiento/]];
  for (const [cambio, re] of casos) ok('registro inválido: ' + JSON.stringify(cambio), re.test(C.validaRegistro(Object.assign({}, bueno, cambio))), C.validaRegistro(Object.assign({}, bueno, cambio)));
  // un Supabase de mentira por fetch
  const llamadas = []; let respuesta = null;
  globalThis.fetch = async (url, o) => { llamadas.push({ url, o, cuerpo: o.body ? JSON.parse(o.body) : null }); const r = respuesta(url, o); return { ok: r.status < 400, status: r.status, text: async () => (r.body === undefined ? '' : JSON.stringify(r.body)) }; };
  const ses = (t, exp) => ({ access_token: t, refresh_token: 'r-' + t, expires_in: exp, user: { id: 'u1', email: 'ana@correo.com', user_metadata: { nombre: 'Ana Pérez', ficha: '2834567' } } });
  respuesta = () => ({ status: 200, body: ses('t1', 3600) });
  const r = await C.registra(Object.assign({}, bueno, { correo: ' ANA@correo.com ' }));
  const l0 = llamadas[0];
  ok('registrarse manda correo (en minúsculas), contraseña y nombre/ficha/aviso como datos del usuario', l0.url === 'https://prueba.supabase.co/auth/v1/signup' && l0.cuerpo.email === 'ana@correo.com' && l0.cuerpo.password === 'clave1234' && l0.cuerpo.data.nombre === 'Ana Pérez' && l0.cuerpo.data.ficha === '2834567' && l0.cuerpo.data.acepta_datos === true && l0.o.headers.apikey === 'a'.repeat(40));
  ok('sin sesión, la clave pública va solo en «apikey» (sirve la clave publishable y la anon)', l0.o.headers.Authorization === undefined);
  ok('con sesión al registrarse, queda dentro', r.sesion && C.sesion().user.nombre === 'Ana Pérez' && !r.confirmar);
  ok('la contraseña no se guarda en el aparato', ![...almacen.values()].some(v => v.includes('clave1234')));
  respuesta = () => ({ status: 200, body: { id: 'u2', email: 'x@y.com' } });
  ok('si el proyecto pide confirmar el correo, lo dice', (await C.registra(Object.assign({}, bueno, { correo: 'x@y.com' }))).confirmar === true);
  // errores en español
  const errorDe = async (status, body) => { respuesta = () => ({ status, body }); try { await C.entra({ correo: 'ana@correo.com', clave: 'x' }); return null; } catch (e) { return e; } };
  ok('contraseña mal', /no son correctos/.test((await errorDe(400, { error_code: 'invalid_credentials' })).message));
  ok('correo sin confirmar', /confirmaste/.test((await errorDe(400, { error_code: 'email_not_confirmed' })).message));
  ok('demasiados intentos', /Demasiados intentos/.test((await errorDe(429, { error_code: 'over_request_rate_limit' })).message));
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  ok('sin internet', /Sin conexión/.test((await (async () => { try { await C.entra({ correo: 'ana@correo.com', clave: 'x' }); } catch (e) { return e; } })()).message));
  globalThis.fetch = async (url, o) => { llamadas.push({ url, o, cuerpo: o.body ? JSON.parse(o.body) : null }); const r2 = respuesta(url, o); return { ok: r2.status < 400, status: r2.status, text: async () => (r2.body === undefined ? '' : JSON.stringify(r2.body)) }; };
  // la sesión caducada se renueva sola
  respuesta = () => ({ status: 200, body: ses('t-viejo', 30) }); await C.entra({ correo: 'ana@correo.com', clave: 'clave1234' });
  llamadas.length = 0;
  respuesta = url => (url.includes('grant_type=refresh_token') ? { status: 200, body: ses('t-nuevo', 3600) } : { status: 200, body: [{ datos: { puntos: 5 }, actualizado: 9 }] });
  const pr = await C.leeProgreso();
  ok('si la sesión va a caducar, la renueva antes de leer', llamadas[0].url.includes('grant_type=refresh_token') && llamadas[0].cuerpo.refresh_token === 'r-t-viejo' && llamadas[1].o.headers.Authorization === 'Bearer t-nuevo' && pr.datos.puntos === 5);
  ok('lee solo su fila', /\/rest\/v1\/progreso\?id=eq\.u1&select=datos,actualizado/.test(llamadas[1].url));
  respuesta = () => ({ status: 201 }); llamadas.length = 0;
  await C.guardaProgreso({ puntos: 7, actualizado: 123 });
  ok('guardar hace «upsert» de su fila con la fecha de actualización', /on_conflict=id/.test(llamadas[0].url) && /merge-duplicates/.test(llamadas[0].o.headers.Prefer) && llamadas[0].cuerpo.id === 'u1' && llamadas[0].cuerpo.actualizado === 123 && llamadas[0].cuerpo.datos.puntos === 7);
  respuesta = () => ({ status: 401, body: { message: 'JWT expired' } });
  ok('si la base de datos dice que la sesión no vale, lo avisa como «sin sesión»', (await (async () => { try { await C.guardaProgreso({}); } catch (e) { return e.codigo; } })()) === 'sin_sesion');
  respuesta = () => ({ status: 204 }); await C.sale();
  ok('cerrar sesión la quita del aparato', C.sesion() === null);
  console.log(`\n${bien} bien, ${mal} mal`);
  process.exit(mal ? 1 : 0);
})();
