-- ════════════════════════════════════════════════════════════
-- FitApp — Schema para Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- Dashboard → SQL Editor → New query → pega todo y ejecuta
-- ════════════════════════════════════════════════════════════

create table if not exists alumnos (
  id text primary key,
  codigo text unique not null,
  nombre text, apellido text, edad integer, genero text,
  objetivo text, nivel text, peso_inicial numeric, peso_actual numeric,
  altura numeric, fecha_inicio text, rutina_id text,
  plan_alimentacion_id text, activo boolean default true
);

create table if not exists rutinas (
  id text primary key,
  nombre text, descripcion text, objetivo text, nivel text,
  duracion_semanas integer, mesociclo text, dias jsonb
);

create table if not exists planes (
  id text primary key,
  nombre text, objetivo text, calorias_objetivo integer,
  macros jsonb, descripcion text, suplementos jsonb, comidas jsonb
);

create table if not exists ejercicios (
  id text primary key,
  nombre text, grupo text, series integer, repeticiones text,
  descanso_seg integer, peso_sugerido numeric,
  nota_tecnica text, video_url text, foto text
);

create table if not exists vinculos (
  id text primary key,
  alumno1 text, alumno2 text, fecha text, confirmado_por jsonb
);

create table if not exists gym_info (
  id text primary key, data jsonb, updated_at text
);

create table if not exists registros (
  id text primary key,
  alumno_id text, fecha text, dia_numero integer, sesion_nombre text,
  duracion_min integer, sensacion integer, nota text,
  ejercicios_completados integer, ejercicios_total integer
);

create table if not exists pesos (
  alumno_id text, fecha text, kg numeric,
  primary key (alumno_id, fecha)
);

create table if not exists medidas (
  alumno_id text, fecha text,
  cuello numeric, pecho numeric, cintura numeric, cadera numeric,
  brazo_izq numeric, brazo_der numeric, muslo_izq numeric,
  muslo_der numeric, pantorrilla numeric,
  primary key (alumno_id, fecha)
);

create table if not exists medallas_alumno (
  alumno_id text, medalla_id text,
  primary key (alumno_id, medalla_id)
);

create table if not exists notas (
  id text primary key,
  alumno_id text, fecha text, texto text, leida boolean default false
);

create table if not exists habitos (
  id text primary key,
  alumno_id text, nombre text, icono text,
  hora_sugerida text, racha integer default 0, creado text
);

create table if not exists habito_checks (
  alumno_id text, fecha text, checks jsonb,
  primary key (alumno_id, fecha)
);

create table if not exists nutricion_diaria (
  alumno_id text, fecha text,
  opciones jsonb, comidos jsonb, agua numeric default 0,
  alimentos jsonb, extras jsonb, suplementos jsonb,
  primary key (alumno_id, fecha)
);

create table if not exists progreso_diario (
  alumno_id text, fecha text,
  pasos integer default 0, agua_ml integer default 0,
  sueno_h numeric default 0, calorias_activas integer default 0,
  primary key (alumno_id, fecha)
);

create table if not exists fitscore (
  alumno_id text, fecha text, score_data jsonb,
  primary key (alumno_id, fecha)
);

create table if not exists food_scans (
  id text primary key,
  alumno_id text, fecha text, scan_data jsonb
);

create table if not exists objetivos (
  id text primary key, alumno_id text, data jsonb
);

create table if not exists fotos (
  id text primary key,
  alumno_id text, storage_path text, url text,
  fecha text, tipo text, descripcion text
);

-- Habilitar RLS con acceso total (la app tiene su propio auth por código)
do $$
declare t text;
begin
  foreach t in array array[
    'alumnos','rutinas','planes','ejercicios','vinculos','gym_info',
    'registros','pesos','medidas','medallas_alumno','notas','habitos',
    'habito_checks','nutricion_diaria','progreso_diario','fitscore',
    'food_scans','objetivos','fotos'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "allow all" on %I', t);
    execute format(
      'create policy "allow all" on %I for all to anon, authenticated using (true) with check (true)', t
    );
  end loop;
end $$;

-- Bucket de fotos (ejecutar solo si da error, hazlo manual en Storage → New bucket → "fotos" → Public ON)
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
  on conflict (id) do nothing;
