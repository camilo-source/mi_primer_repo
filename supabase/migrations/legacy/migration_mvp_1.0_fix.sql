-- Migración: Campos FALTANTES para MVP 1.0
-- Ejecutar DESPUÉS de migration_mvp_1.0.sql
-- ============================================
-- TABLA busquedas - Campos adicionales faltantes
-- ============================================
-- Campo nombre de empresa (REQUERIDO)
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'Sin especificar';
-- Campo nombre del puesto (alias del título)
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS nombre_del_puesto TEXT;
-- Asegurar que tiene valor por defecto para idiomas si está vacío
UPDATE busquedas
SET idiomas = '{}'::text []
WHERE idiomas IS NULL;
-- ============================================
-- Verificación
-- ============================================
SELECT column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'busquedas'
    AND column_name IN (
        'empresa',
        'nombre_del_puesto',
        'rubro',
        'descripcion_empresa'
    )
ORDER BY ordinal_position;