-- Migration: Agregar columna score_ia a postulantes
-- Fecha: 2026-01-30
-- Agregar columna score_ia para guardar el puntaje de la IA
ALTER TABLE public.postulantes
ADD COLUMN IF NOT EXISTS score_ia INTEGER;
-- Agregar comentario explicativo
COMMENT ON COLUMN public.postulantes.score_ia IS 'Puntaje de calificación de IA (0-100)';
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard: https://supabase.com/dashboard
-- 2. Seleccionar tu proyecto
-- 3. Ir a SQL Editor
-- 4. Pegar y ejecutar este script