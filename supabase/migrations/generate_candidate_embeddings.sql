-- Generate embeddings for existing candidates (run AFTER inserting demo candidates)
-- This uses the cv_texto_extraido field to generate candidate embeddings
-- NOTE: This is a placeholder SQL. 
-- In production, embeddings should be generated via the API or a migration script
-- that calls the Gemini API for each candidate.
-- For now, you'll need to:
-- 1. Create a simple Node.js script that:
--    - Fetches all candidates without embeddings
--    - Generates embeddings using Gemini API
--    - Updates the candidates table
-- Update candidates without embeddings
-- (This query just marks them for processing)
UPDATE postulantes
SET comentarios_admin = COALESCE(comentarios_admin, '') || ' [NEEDS_EMBEDDING]'
WHERE embedding IS NULL
    AND cv_texto_extraido IS NOT NULL
    AND id_busqueda_n8n = '5b2de542-443a-41a1-addd-c18279537613';
SELECT 'Marked ' || COUNT(*) || ' candidates for embedding generation' as message
FROM postulantes
WHERE comentarios_admin LIKE '%[NEEDS_EMBEDDING]%'
    AND id_busqueda_n8n = '5b2de542-443a-41a1-addd-c18279537613';