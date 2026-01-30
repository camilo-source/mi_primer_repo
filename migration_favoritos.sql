-- Migración: Agregar campo favorito a busquedas
-- Ejecutar en Supabase SQL Editor
-- Agregar columna favorito
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS favorito BOOLEAN DEFAULT false;
-- Crear índice para optimizar ordenamiento por favoritos
CREATE INDEX IF NOT EXISTS idx_busquedas_favorito ON busquedas(favorito);
-- Verificar que se creó correctamente
SELECT column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'busquedas'
    AND column_name = 'favorito';