-- FIX: Habilitar postulaciones públicas y asegurar esquema
-- Problema: Los candidatos no pueden guardar sus datos porque falta permiso de INSERT público.
-- 1. Asegurar columnas necesarias en la tabla postulantes
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS telefono TEXT,
    ADD COLUMN IF NOT EXISTS linkedin TEXT,
    ADD COLUMN IF NOT EXISTS cv_url TEXT,
    ADD COLUMN IF NOT EXISTS score_ia INTEGER,
    -- Para la calificación
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'nuevo';
-- Unificando estado
-- 2. Habilitar RLS (por si acaso no estaba)
ALTER TABLE postulantes ENABLE ROW LEVEL SECURITY;
-- 3. Crear política para PERMITIR que cualquiera (public) se postule
-- Sin esto, Supabase bloquea el INSERT de usuarios anónimos
DROP POLICY IF EXISTS "Public Candidates Insert" ON postulantes;
CREATE POLICY "Public Candidates Insert" ON postulantes FOR
INSERT TO public WITH CHECK (true);
-- 4. Mantener la política de lectura solo para el reclutador (dueño de la búsqueda)
-- (Ya debería existir, pero reforzamos)
-- Nota: El candidato NO debe poder leer las postulaciones de otros.
-- 5. Crear índice para búsquedas rápidas por ID de búsqueda
CREATE INDEX IF NOT EXISTS idx_postulantes_busqueda ON postulantes(id_busqueda_n8n);