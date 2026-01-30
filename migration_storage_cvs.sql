-- Migración: Crear bucket para CVs en Supabase Storage
-- Ejecutar en Supabase SQL Editor
-- 1. Crear bucket para CVs (si no existe)
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
        -- 5MB
        ARRAY ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ) ON CONFLICT (id) DO
UPDATE
SET public = true,
    file_size_limit = 5242880;
-- 2. Política para permitir uploads públicos (candidatos)
CREATE POLICY "Allow public uploads to cvs bucket" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'cvs');
-- 3. Política para lectura pública
CREATE POLICY "Allow public read access to cvs" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'cvs');
-- 4. Agregar campo favorito a busquedas (si no existe)
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS favorito BOOLEAN DEFAULT false;
-- 5. Agregar campos faltantes a postulantes (si es necesario)
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS telefono TEXT,
    ADD COLUMN IF NOT EXISTS linkedin TEXT,
    ADD COLUMN IF NOT EXISTS cv_url TEXT;
-- Verificar que todo se creó correctamente
SELECT id,
    name,
    public
FROM storage.buckets
WHERE id = 'cvs';