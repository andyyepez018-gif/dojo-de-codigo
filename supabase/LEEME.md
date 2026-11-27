# Cuentas de los aprendices con Supabase (gratis)

El Dojo puede pedir **entrar o crear cuenta** (correo, contraseña, nombre y ficha del SENA) y guardar
el progreso de cada aprendiz en una base de datos de **Supabase**, en su plan gratuito. Mientras
`cuenta.js` no tenga la dirección y la clave pública del proyecto, las cuentas están apagadas y el
Dojo funciona como siempre.

Solo se usa en la **app instalable** (GitHub Pages). Dentro de Claude no se pide login: ahí ya
identifica a cada persona su cuenta de Claude.

## Pasos (una sola vez)

1. Entra en <https://supabase.com> y crea una cuenta gratis (puedes usar «Continue with GitHub»).
2. **New project**: nombre `dojo-de-codigo`, región **South America (São Paulo)** y una contraseña
   para la base de datos (guárdala tú; el Dojo no la necesita). Espera un par de minutos.
3. **SQL Editor → New query**: pega todo `supabase/esquema.sql` y pulsa **Run**. Debe decir «Success».
4. **Authentication → Sign In / Providers → Email**: desactiva **Confirm email**. El correo gratuito
   de Supabase solo puede escribir a los miembros del proyecto, así que tus compañeros no recibirían
   el correo de confirmación. (Si algún día configuras un correo propio gratis, por ejemplo Brevo,
   se puede volver a activar, y también «olvidé mi contraseña».)
5. **Authentication → URL Configuration → Site URL**: `https://andyyepez018-gif.github.io/dojo-de-codigo/`
6. **Project Settings → API** (o **Data API**): copia la **Project URL** (`https://xxxx.supabase.co`)
   y la clave **anon / public**. Esas dos se ponen en `CONFIG` dentro de `cuenta.js`.
   **Nunca** compartas ni pongas en la app la clave `service_role`: esa sí es secreta.

## Seguridad

- Las contraseñas las guarda Supabase cifradas; el Dojo nunca las guarda.
- Las reglas de `esquema.sql` (Row Level Security) hacen que cada aprendiz solo pueda leer y cambiar
  su propio perfil y su propio progreso. La clave «anon» es pública a propósito.
- Cada aprendiz puede borrar su cuenta y todos sus datos desde Plan → «Tu cuenta».
- El registro pide aceptar el aviso de tratamiento de datos (Ley 1581 de 2012).

## Ver los registrados

Supabase → **Table Editor → perfiles**: nombre, ficha y correo de cada aprendiz.
