-- ════════════════════════════════════════════════════════════
-- FitApp — Supabase Schema
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- Dashboard → SQL Editor → New query → pega y ejecuta
-- ════════════════════════════════════════════════════════════

-- ── TABLAS GLOBALES ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coaches (
  id   TEXT PRIMARY KEY DEFAULT 'coach_1',
  nombre TEXT NOT NULL DEFAULT 'Jimmy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO coaches (id, nombre) VALUES ('coach_1', 'Jimmy') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS alumnos (
  id                    TEXT PRIMARY KEY,
  codigo                TEXT UNIQUE NOT NULL,
  nombre                TEXT NOT NULL,
  apellido              TEXT,
  edad                  INT,
  genero                TEXT,
  objetivo              TEXT,
  nivel                 TEXT,
  peso_inicial          NUMERIC,
  peso_actual           NUMERIC,
  altura                NUMERIC,
  fecha_inicio          DATE,
  rutina_id             TEXT,
  plan_alimentacion_id  TEXT,
  activo                BOOLEAN DEFAULT TRUE,
  coach_id              TEXT REFERENCES coaches(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rutinas (
  id               TEXT PRIMARY KEY,
  nombre           TEXT NOT NULL,
  descripcion      TEXT,
  objetivo         TEXT,
  nivel            TEXT,
  duracion_semanas INT,
  mesociclo        TEXT,
  dias             JSONB NOT NULL DEFAULT '[]',
  coach_id         TEXT REFERENCES coaches(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planes (
  id               TEXT PRIMARY KEY,
  nombre           TEXT NOT NULL,
  objetivo         TEXT,
  calorias_objetivo INT,
  macros           JSONB,
  descripcion      TEXT,
  comidas          JSONB NOT NULL DEFAULT '[]',
  coach_id         TEXT REFERENCES coaches(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ejercicios (
  id            TEXT PRIMARY KEY,
  nombre        TEXT NOT NULL,
  grupo         TEXT,
  descripcion   TEXT,
  video_url     TEXT,
  foto          TEXT,
  como_hacer    TEXT,
  nota_tecnica  TEXT,
  series        INT,
  repeticiones  TEXT,
  descanso_seg  INT,
  sets          JSONB,
  coach_id      TEXT REFERENCES coaches(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gym_info (
  id         TEXT PRIMARY KEY DEFAULT 'main',
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vinculos (
  id             TEXT PRIMARY KEY,
  alumno1        TEXT REFERENCES alumnos(id) ON DELETE CASCADE,
  alumno2        TEXT REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha          DATE,
  confirmado_por JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLAS POR ALUMNO ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS registros (
  id                      TEXT PRIMARY KEY,
  alumno_id               TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha                   DATE NOT NULL,
  dia_numero              INT,
  sesion_nombre           TEXT,
  duracion_min            INT,
  sensacion               INT,
  nota                    TEXT,
  ejercicios_completados  INT,
  ejercicios_total        INT,
  series_data             JSONB,
  ejercicios              JSONB,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_registros_alumno ON registros(alumno_id, fecha DESC);

CREATE TABLE IF NOT EXISTS pesos (
  id         BIGSERIAL PRIMARY KEY,
  alumno_id  TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha      DATE NOT NULL,
  kg         NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medidas (
  id           BIGSERIAL PRIMARY KEY,
  alumno_id    TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha        DATE NOT NULL,
  cuello       NUMERIC, pecho     NUMERIC, cintura    NUMERIC, cadera     NUMERIC,
  brazo_izq    NUMERIC, brazo_der NUMERIC, muslo_izq  NUMERIC, muslo_der  NUMERIC,
  pantorrilla  NUMERIC,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nutricion_diaria (
  id         BIGSERIAL PRIMARY KEY,
  alumno_id  TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha      DATE NOT NULL,
  opciones   JSONB NOT NULL DEFAULT '{}',
  comidos    JSONB NOT NULL DEFAULT '{}',
  agua       INT NOT NULL DEFAULT 0,
  alimentos  JSONB NOT NULL DEFAULT '[]',
  extras     JSONB NOT NULL DEFAULT '[]',
  UNIQUE(alumno_id, fecha)
);
CREATE INDEX IF NOT EXISTS idx_nutricion_alumno ON nutricion_diaria(alumno_id, fecha DESC);

CREATE TABLE IF NOT EXISTS medallas_alumno (
  alumno_id        TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  medalla_id       TEXT NOT NULL,
  desbloqueada_en  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (alumno_id, medalla_id)
);

CREATE TABLE IF NOT EXISTS notas (
  id         BIGSERIAL PRIMARY KEY,
  alumno_id  TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha      DATE NOT NULL,
  texto      TEXT NOT NULL,
  leida      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fotos: archivos en Storage, tabla guarda solo metadatos + URL firmada
CREATE TABLE IF NOT EXISTS fotos (
  id            TEXT PRIMARY KEY,
  alumno_id     TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha         DATE,
  semana        TEXT,
  storage_path  TEXT,
  url           TEXT,
  tipo          TEXT,
  nota          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habitos (
  id             TEXT PRIMARY KEY,
  alumno_id      TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  nombre         TEXT NOT NULL,
  icono          TEXT,
  hora_sugerida  TEXT,
  racha          INT DEFAULT 0,
  creado         DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habito_checks (
  alumno_id  TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha      DATE NOT NULL,
  checks     JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (alumno_id, fecha)
);
CREATE INDEX IF NOT EXISTS idx_habito_checks_alumno ON habito_checks(alumno_id, fecha DESC);

CREATE TABLE IF NOT EXISTS food_scans (
  id         BIGSERIAL PRIMARY KEY,
  alumno_id  TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha      DATE NOT NULL,
  scan_data  JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS objetivos (
  id         TEXT PRIMARY KEY,
  alumno_id  TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progreso_diario (
  alumno_id         TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha             DATE NOT NULL,
  pasos             INT NOT NULL DEFAULT 0,
  agua_ml           INT NOT NULL DEFAULT 0,
  sueno_h           NUMERIC NOT NULL DEFAULT 0,
  calorias_activas  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (alumno_id, fecha)
);

CREATE TABLE IF NOT EXISTS fitscore (
  alumno_id   TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  score_data  JSONB NOT NULL,
  PRIMARY KEY (alumno_id, fecha)
);

-- ── STORAGE BUCKET ──────────────────────────────────────────
-- Ejecuta esto APARTE en: Dashboard → Storage → New bucket
-- Nombre: fitapp-media
-- Public: NO (privado)
-- File size limit: 50 MB
-- Allowed MIME types: image/*, video/*
--
-- Luego crea esta policy en el bucket:
--   Name: allow_all_anon
--   Operation: SELECT, INSERT, UPDATE, DELETE
--   Target roles: anon, authenticated
--   USING expression: true

-- ── RLS (fase 1: acceso abierto por anon key) ───────────────
-- En fase 2, cuando se agregue login, reemplaza estas policies
-- con validación por auth.uid()

ALTER TABLE alumnos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutinas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_info         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinculos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutricion_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE medallas_alumno  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE habito_checks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_scans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_diario  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitscore         ENABLE ROW LEVEL SECURITY;

-- Policy de acceso total para la anon key (reemplazar con auth en fase 2)
CREATE POLICY "anon_all" ON alumnos          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON rutinas          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON planes           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON ejercicios       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON gym_info         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON vinculos         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON registros        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON pesos            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON medidas          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON nutricion_diaria FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON medallas_alumno  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON notas            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON fotos            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON habitos          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON habito_checks    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON food_scans       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON objetivos        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON progreso_diario  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON fitscore         FOR ALL TO anon USING (true) WITH CHECK (true);
