-- Migración: Tabla de availability para calendario
-- Ejecutar en Supabase SQL Editor
-- ============================================
-- PASO 1: Eliminar tabla anterior si existe
-- ============================================
DROP TABLE IF EXISTS public.availability CASCADE;
-- ============================================
-- PASO 2: Crear tabla availability nueva
-- ============================================
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  booked_by_candidate_id UUID REFERENCES public.postulantes(id) ON DELETE
  SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- PASO 3: Índices para búsquedas eficientes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_start_time ON availability(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_is_booked ON availability(is_booked);
-- Evitar slots duplicados para el mismo usuario y horario
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_unique_slot ON availability(user_id, start_time);
-- ============================================
-- PASO 4: Habilitar RLS
-- ============================================
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
-- Política: usuarios pueden ver y editar sus propios slots
CREATE POLICY "Users can manage their own availability" ON availability FOR ALL USING (auth.uid() = user_id);
-- Política: cualquiera puede leer slots para la página de booking
CREATE POLICY "Public can read available slots" ON availability FOR
SELECT USING (true);
-- ============================================
-- PASO 5: Agregar campo fecha_entrevista a postulantes
-- ============================================
ALTER TABLE public.postulantes
ADD COLUMN IF NOT EXISTS fecha_entrevista TIMESTAMPTZ;
-- ============================================
-- Verificación
-- ============================================
SELECT column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;