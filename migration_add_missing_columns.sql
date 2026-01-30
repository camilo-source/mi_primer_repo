-- ============================================
-- MIGRACIÓN: Agregar columnas faltantes a busquedas
-- Fecha: 2026-01-30
-- Propósito: Agregar campos del formulario extendido
-- ============================================
-- Agregar columnas faltantes
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS empresa TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS rubro TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS descripcion_empresa TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS nombre_del_puesto TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS habilidades_blandas TEXT [];
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS nivel_formacion TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS disponibilidad TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS extras TEXT;
-- Cambiar idiomas de JSONB a TEXT[] para consistencia
ALTER TABLE public.busquedas DROP COLUMN IF EXISTS idiomas;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS idiomas TEXT [];
-- Agregar columnas de webhook status
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS webhook_status TEXT;
ALTER TABLE public.busquedas
ADD COLUMN IF NOT EXISTS webhook_sent_at TIMESTAMPTZ;
-- Comentarios
COMMENT ON COLUMN public.busquedas.empresa IS 'Nombre de la empresa';
COMMENT ON COLUMN public.busquedas.rubro IS 'Rubro o industria de la empresa';
COMMENT ON COLUMN public.busquedas.descripcion_empresa IS 'Descripción de la empresa para el post de LinkedIn';
COMMENT ON COLUMN public.busquedas.nombre_del_puesto IS 'Nombre del puesto (copia del título)';
COMMENT ON COLUMN public.busquedas.habilidades_blandas IS 'Habilidades blandas requeridas';
COMMENT ON COLUMN public.busquedas.nivel_formacion IS 'Nivel de formación requerido';
COMMENT ON COLUMN public.busquedas.disponibilidad IS 'Disponibilidad horaria';
COMMENT ON COLUMN public.busquedas.extras IS 'Información adicional';
COMMENT ON COLUMN public.busquedas.idiomas IS 'Array de idiomas con nivel (ej: ["Inglés B2", "Portugués A1"])';
COMMENT ON COLUMN public.busquedas.webhook_status IS 'Estado del webhook: sent, failed, null';
COMMENT ON COLUMN public.busquedas.webhook_sent_at IS 'Timestamp de cuando se envió el webhook';
-- ============================================
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Pegar y ejecutar este script
-- 3. Verificar que todas las columnas se crearon correctamente
-- ============================================