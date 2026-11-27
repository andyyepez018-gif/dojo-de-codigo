// Un Supabase de mentira para las pruebas del navegador: responde como la API real (cuentas con
// contraseña, sesiones que caducan, progreso con «cada uno solo ve lo suyo» y borrar la cuenta).
// Uso: const sb = await supabaseFalso(contexto); … sb.usuarios, sb.progreso
const URL_FALSA = 'https://prueba-dojo.supabase.co';
const ANON = 'anon-de-prueba-' + 'x'.repeat(40);
async function supabaseFalso(c, opciones = {}) {
  const sb = { usuarios: new Map(), progreso: new Map(), tokens: new Map(), refrescos: new Map(), llamadas: [], caerRed: false, confirmar: !!opciones.confirmar };
  let n = 0;
  const sesion = u => { const t = 'tok-' + (++n), rt = 'ref-' + n; sb.tokens.set(t, u.id); sb.refrescos.set(rt, u.id); return { access_token: t, refresh_token: rt, expires_in: 3600, token_type: 'bearer', user: { id: u.id, email: u.email, user_metadata: u.meta } }; };
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, authorization, content-type, prefer', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS' };
  const json = (route, status, body) => route.fulfill({ status, headers: Object.assign({ 'Content-Type': 'application/json' }, cors), body: body === undefined ? '' : JSON.stringify(body) });
  await c.route(URL_FALSA + '/**', async route => {
    const req = route.request(), u = new URL(req.url()), ruta = u.pathname, metodo = req.method();
    if (metodo === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (sb.caerRed) return route.abort('internetdisconnected');
    if (req.headers().apikey !== ANON) return json(route, 401, { message: 'Invalid API key' });
    const cuerpo = req.postData() ? JSON.parse(req.postData()) : null;
    const tok = (req.headers().authorization || '').replace(/^Bearer /, ''), yo = sb.tokens.get(tok) || null;
    sb.llamadas.push(metodo + ' ' + ruta + u.search);
    if (ruta === '/auth/v1/signup') {
      const email = String(cuerpo.email).toLowerCase();
      if ([...sb.usuarios.values()].some(x => x.email === email)) return json(route, 422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
      if (String(cuerpo.password).length < 6) return json(route, 422, { code: 422, error_code: 'weak_password', msg: 'Password should be at least 6 characters.' });
      const nuevo = { id: 'u-' + (sb.usuarios.size + 1) + '-' + Date.now().toString(36), email, password: cuerpo.password, meta: cuerpo.data || {}, confirmado: !sb.confirmar };
      sb.usuarios.set(nuevo.id, nuevo);
      return json(route, 200, sb.confirmar ? { id: nuevo.id, email, user_metadata: nuevo.meta } : sesion(nuevo));
    }
    if (ruta === '/auth/v1/token') {
      const tipo = u.searchParams.get('grant_type');
      if (tipo === 'password') {
        const x = [...sb.usuarios.values()].find(y => y.email === String(cuerpo.email).toLowerCase() && y.password === cuerpo.password);
        if (!x) return json(route, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
        if (!x.confirmado) return json(route, 400, { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
        return json(route, 200, sesion(x));
      }
      const id = sb.refrescos.get(cuerpo.refresh_token); if (!id || !sb.usuarios.get(id)) return json(route, 400, { error_code: 'refresh_token_not_found' });
      return json(route, 200, sesion(sb.usuarios.get(id)));
    }
    if (ruta === '/auth/v1/logout') { sb.tokens.delete(tok); return json(route, 204); }
    if (!yo || !sb.usuarios.get(yo)) return json(route, 401, { code: 'PGRST301', message: 'JWT expired' });
    if (ruta === '/rest/v1/progreso' && metodo === 'GET') {
      const id = (u.searchParams.get('id') || '').replace(/^eq\./, ''), fila = id === yo ? sb.progreso.get(id) : null;   // cada uno solo ve lo suyo
      return json(route, 200, fila ? [{ datos: fila.datos, actualizado: fila.actualizado }] : []);
    }
    if (ruta === '/rest/v1/progreso' && metodo === 'POST') {
      if (cuerpo.id !== yo) return json(route, 403, { code: '42501', message: 'new row violates row-level security policy' });
      sb.progreso.set(yo, { datos: cuerpo.datos, actualizado: cuerpo.actualizado }); return json(route, 201);
    }
    if (ruta === '/rest/v1/perfiles') { const x = sb.usuarios.get(yo); return json(route, 200, [{ nombre: x.meta.nombre, ficha: x.meta.ficha, correo: x.email }]); }
    if (ruta === '/rest/v1/rpc/borrar_mi_cuenta') { sb.usuarios.delete(yo); sb.progreso.delete(yo); return json(route, 204); }
    return json(route, 404, { message: 'no existe ' + ruta });
  });
  await c.addInitScript(([url, anon]) => { try { localStorage.setItem('dojo-pruebas', '1'); localStorage.setItem('dojo-cuenta-config', JSON.stringify({ url, anon })); } catch (e) { /* nada */ } }, [URL_FALSA, ANON]);
  return sb;
}
module.exports = { supabaseFalso, URL_FALSA, ANON };
