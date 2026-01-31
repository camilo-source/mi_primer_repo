-- FIX: Reparar permisos de Storage para carga de CVs
-- Ejecuta este script en el SQL Editor de Supabase para arreglar el error de carga
-- 1. Asegurar que el bucket 'cvs' existe y es público
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'cvs',
        'cvs',
        true,
        5242880,
        -- 5MB limit
        ARRAY ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ) ON CONFLICT (id) DO
UPDATE
SET public = true,
    file_size_limit = 5242880;
-- 2. Limpiar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Allow public uploads to cvs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to cvs" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload CVS" ON storage.objects;
DROP POLICY IF EXISTS "Public Read CVS" ON storage.objects;
-- 3. Crear políticas permisivas para el bucket 'cvs'
-- Permitir subida (INSERT) a cualquier usuario (público)
CREATE POLICY "Public Upload CVS" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'cvs');
-- Permitir lectura (SELECT) pública (para que el reclutador pueda verlos)
CREATE POLICY "Public Read CVS" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'cvs');
-- Permitir actualización (UPDATE) por si acaso se reescriben
CREATE POLICY "Public Update CVS" ON storage.objects FOR
UPDATE TO public USING (bucket_id = 'cvs');
-- 4. Verificar
SELECT *
FROM storage.buckets
WHERE id = 'cvs';