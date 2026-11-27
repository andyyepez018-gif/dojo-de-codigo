-- Dojo de código · base de datos en Supabase (plan gratuito)
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → New query → pega todo esto → Run.
-- Se puede ejecutar más de una vez sin romper nada.
--
-- Qué crea:
--   perfiles  → nombre, ficha del SENA y correo de cada aprendiz (uno por cuenta)
--   progreso  → el progreso completo del Dojo de cada aprendiz (puntos, rango, retos, inglés…)
-- Seguridad: cada persona SOLO puede leer y cambiar sus propias filas (Row Level Security).
-- Las contraseñas no están aquí: las guarda Supabase cifradas en su sistema de cuentas.

-- ── Perfiles ──
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 2 and 80),
  ficha text not null check (ficha ~ '^[0-9]{4,10}$'),
  correo text not null,
  acepta_datos boolean not null default false,
  creado timestamptz not null default now()
);

-- ── Progreso (un documento por aprendiz) ──
create table if not exists public.progreso (
  id uuid primary key references auth.users (id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  actualizado bigint not null default 0,
  modificado timestamptz not null default now(),
  constraint progreso_tamano check (pg_column_size(datos) < 500000)
);

alter table public.perfiles enable row level security;
alter table public.progreso enable row level security;

-- Permisos exactos para la app (sirve aunque el proyecto NO dé acceso automático a las tablas nuevas):
-- los visitantes sin cuenta (anon) no tocan nada; los que entraron (authenticated) solo lo necesario,
-- y las reglas de abajo (RLS) los limitan a SU fila.
grant usage on schema public to anon, authenticated;
revoke all on public.perfiles, public.progreso from anon;
grant select, update on public.perfiles to authenticated;
grant select, insert, update on public.progreso to authenticated;

drop policy if exists "perfil propio: ver" on public.perfiles;
drop policy if exists "perfil propio: cambiar" on public.perfiles;
create policy "perfil propio: ver" on public.perfiles for select to authenticated using ((select auth.uid()) = id);
create policy "perfil propio: cambiar" on public.perfiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "progreso propio: ver" on public.progreso;
drop policy if exists "progreso propio: crear" on public.progreso;
drop policy if exists "progreso propio: cambiar" on public.progreso;
create policy "progreso propio: ver" on public.progreso for select to authenticated using ((select auth.uid()) = id);
create policy "progreso propio: crear" on public.progreso for insert to authenticated with check ((select auth.uid()) = id);
create policy "progreso propio: cambiar" on public.progreso for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ── Al registrarse, se crea su perfil con lo que escribió (nombre, ficha y si aceptó el aviso de datos) ──
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre, ficha, correo, acepta_datos)
  values (new.id,
          btrim(coalesce(new.raw_user_meta_data ->> 'nombre', '')),
          btrim(coalesce(new.raw_user_meta_data ->> 'ficha', '')),
          new.email,
          coalesce((new.raw_user_meta_data ->> 'acepta_datos')::boolean, false));
  return new;
end $$;
drop trigger if exists al_registrarse on auth.users;
create trigger al_registrarse after insert on auth.users for each row execute function public.crear_perfil();

-- ── «Borrar mi cuenta»: cada aprendiz puede borrar la suya (y con ella su perfil y su progreso) ──
create or replace function public.borrar_mi_cuenta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sin sesión'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;
