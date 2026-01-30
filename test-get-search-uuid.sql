-- 🧪 CREAR BÚSQUEDA DE PRUEBA PARA TEST N8N
-- Ejecutar este script en Supabase SQL Editor

-- Crear búsqueda de prueba
INSERT INTO busquedas (
    id_busqueda_n8n,
    titulo,
    descripcion,
    estado,
    requisitos,
    ubicacion,
    tipo_contrato,
    salario_min,
    salario_max,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'TEST N8N - Desarrollador Full Stack Senior',
    'Búsqueda de prueba para testing de integración con n8n. Buscamos desarrollador con experiencia en React, Node.js y TypeScript.',
    'borrador',
    ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Git'],
    'Buenos Aires, Argentina (Remoto)',
    'full-time',
    80000,
    120000,
    NOW(),
    NOW()
)
RETURNING 
    id_busqueda_n8n as "UUID (COPIAR ESTE)",
    titulo as "Título",
    estado as "Estado";

-- Verificar que se creó correctamente
SELECT 
    id_busqueda_n8n,
    titulo,
    estado,
    created_at
FROM busquedas
WHERE titulo LIKE '%TEST N8N%'
ORDER BY created_at DESC
LIMIT 1;
