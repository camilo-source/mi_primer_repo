-- ============================================
-- MIGRACIÓN: Formulario de Búsqueda Extendido
-- Fecha: 2026-01-30
-- Propósito: Agregar campos para requisitos del puesto
-- ============================================
-- Agregar columna descripcion (si no existe)
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS descripcion TEXT;
-- Habilidades técnicas requeridas (array de strings)
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS habilidades_requeridas TEXT [];
-- Experiencia en años (rango)
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS experiencia_minima INTEGER DEFAULT 0;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS experiencia_maxima INTEGER DEFAULT 10;
-- Modalidad de trabajo
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS modalidad TEXT DEFAULT 'remoto';
-- Ubicación
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS ubicacion TEXT;
-- Rango salarial (opcional)
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS salario_min INTEGER;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS salario_max INTEGER;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'USD';
-- Idiomas requeridos (JSON: {"ingles": "B2", "portugues": "A1"})
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS idiomas JSONB DEFAULT '{}';
-- Requisitos excluyentes (DEBE tener)
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS requisitos_excluyentes TEXT [];
-- Requisitos deseables (nice to have)
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS requisitos_deseables TEXT [];
-- Campo favorito para el ordenamiento
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS favorito BOOLEAN DEFAULT FALSE;
-- Comentarios sobre los requisitos
COMMENT ON COLUMN public.busquedas.habilidades_requeridas IS 'Array de habilidades técnicas requeridas (ej: React, Node.js)';
COMMENT ON COLUMN public.busquedas.experiencia_minima IS 'Años mínimos de experiencia requeridos';
COMMENT ON COLUMN public.busquedas.experiencia_maxima IS 'Años máximos de experiencia requeridos';
COMMENT ON COLUMN public.busquedas.modalidad IS 'Modalidad de trabajo: remoto, presencial, hibrido';
COMMENT ON COLUMN public.busquedas.idiomas IS 'JSON con idiomas requeridos y nivel (ej: {"ingles": "B2"})';
COMMENT ON COLUMN public.busquedas.requisitos_excluyentes IS 'Requisitos que el candidato DEBE cumplir';
COMMENT ON COLUMN public.busquedas.requisitos_deseables IS 'Requisitos deseables pero no excluyentes';
-- ============================================
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Ir a Supabase Dashboard
-- 2. SQL Editor
-- 3. Pegar y ejecutar este script
-- ============================================