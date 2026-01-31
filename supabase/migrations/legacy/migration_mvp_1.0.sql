-- Migración: Campos adicionales para MVP 1.0
-- Ejecutar en Supabase SQL Editor
-- ============================================
-- TABLA busquedas - Campos adicionales
-- ============================================
-- Agregar campo rubro de la empresa
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS rubro TEXT DEFAULT 'Sin especificar';
-- Agregar campo descripción de la empresa
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS descripcion_empresa TEXT;
-- Agregar campo descripción del puesto
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS descripcion TEXT;
-- Agregar campo para URL del flyer de referencia
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS flyer_url TEXT;
-- Agregar campo para habilidades blandas
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS habilidades_blandas TEXT [];
-- Agregar campo para nivel de formación
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS nivel_formacion TEXT DEFAULT 'Cualquiera';
-- Agregar campo para disponibilidad
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS disponibilidad TEXT DEFAULT 'Full Time';
-- Agregar campo para idiomas
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS idiomas TEXT [];
-- Agregar campo para extras/beneficios
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS extras TEXT;
-- Agregar campo favorito
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS favorito BOOLEAN DEFAULT false;
-- Agregar campo para trackear estado del webhook
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS webhook_status TEXT DEFAULT 'pending';
-- Valores posibles: 'pending', 'sent', 'failed', 'published'
-- Agregar timestamp de última actualización del webhook
ALTER TABLE busquedas
ADD COLUMN IF NOT EXISTS webhook_sent_at TIMESTAMPTZ;
-- ============================================
-- TABLA postulantes - Campos adicionales
-- ============================================
-- Agregar campo teléfono
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS telefono TEXT;
-- Agregar campo LinkedIn
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS linkedin TEXT;
-- Agregar campo URL del CV
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS cv_url TEXT;
-- Agregar campo para estado de la postulación
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'nuevo';
-- Valores: 'nuevo', 'en_revision', 'entrevista', 'finalista', 'contratado', 'rechazado'
-- Agregar campo para notas del reclutador
ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS notas TEXT;
-- ============================================
-- ÍNDICES para optimizar consultas
-- ============================================
-- Índice para buscar por favoritos
CREATE INDEX IF NOT EXISTS idx_busquedas_favorito ON busquedas(favorito);
-- Índice para buscar por estado de webhook
CREATE INDEX IF NOT EXISTS idx_busquedas_webhook_status ON busquedas(webhook_status);
-- Índice para buscar postulantes por estado
CREATE INDEX IF NOT EXISTS idx_postulantes_estado ON postulantes(estado);
-- Índice para buscar postulantes por búsqueda
CREATE INDEX IF NOT EXISTS idx_postulantes_busqueda ON postulantes(id_busqueda_n8n);
-- ============================================
-- STORAGE - Bucket para CVs
-- ============================================
-- Crear bucket para CVs (si no existe)
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
-- Crear bucket para Flyers (si no existe)
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'flyers',
        'flyers',
        true,
        10485760,
        -- 10MB
        ARRAY ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ) ON CONFLICT (id) DO
UPDATE
SET public = true,
    file_size_limit = 10485760;
-- ============================================
-- POLÍTICAS DE STORAGE
-- ============================================
-- Política para uploads públicos a CVs
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Allow public uploads to cvs bucket'
) THEN CREATE POLICY "Allow public uploads to cvs bucket" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'cvs');
END IF;
END $$;
-- Política para lectura pública de CVs
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Allow public read access to cvs'
) THEN CREATE POLICY "Allow public read access to cvs" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'cvs');
END IF;
END $$;
-- Política para uploads públicos a Flyers
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Allow public uploads to flyers bucket'
) THEN CREATE POLICY "Allow public uploads to flyers bucket" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'flyers');
END IF;
END $$;
-- Política para lectura pública de Flyers
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Allow public read access to flyers'
) THEN CREATE POLICY "Allow public read access to flyers" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'flyers');
END IF;
END $$;
-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar columnas de busquedas
SELECT column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'busquedas'
ORDER BY ordinal_position;
-- Verificar columnas de postulantes
SELECT column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'postulantes'
ORDER BY ordinal_position;
-- Verificar buckets
SELECT id,
    name,
    public
FROM storage.buckets;