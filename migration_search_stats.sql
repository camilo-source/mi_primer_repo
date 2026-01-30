-- ============================================
-- VISTA: Estadísticas de Búsquedas
-- ============================================
-- Esta vista compila información agregada de cada búsqueda
-- incluyendo cantidad de candidatos, score promedio, etc.
CREATE OR REPLACE VIEW busquedas_con_stats AS
SELECT b.id_busqueda_n8n,
    b.titulo,
    b.estado,
    b.descripcion,
    b.requisitos,
    b.created_at,
    b.updated_at,
    -- Estadísticas de candidatos
    COUNT(p.id) as total_candidatos,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'pending'
    ) as candidatos_pendientes,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'sent'
    ) as candidatos_enviados,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'replied'
    ) as candidatos_respondidos,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'confirmed'
    ) as candidatos_confirmados,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'rejected'
    ) as candidatos_rechazados,
    -- Scores
    ROUND(AVG(p.score_ia)::numeric, 1) as score_promedio,
    MAX(p.score_ia) as score_maximo,
    MIN(p.score_ia) as score_minimo,
    -- Último candidato
    MAX(p.created_at) as ultimo_candidato_fecha
FROM busquedas b
    LEFT JOIN postulantes p ON b.id_busqueda_n8n = p.id_busqueda_n8n
GROUP BY b.id_busqueda_n8n,
    b.titulo,
    b.estado,
    b.descripcion,
    b.requisitos,
    b.created_at,
    b.updated_at;
-- ============================================
-- FUNCIÓN: Obtener estadísticas de una búsqueda específica
-- ============================================
CREATE OR REPLACE FUNCTION get_search_stats(search_id UUID) RETURNS TABLE (
        total_candidatos BIGINT,
        candidatos_pendientes BIGINT,
        candidatos_enviados BIGINT,
        candidatos_respondidos BIGINT,
        candidatos_confirmados BIGINT,
        candidatos_rechazados BIGINT,
        score_promedio NUMERIC,
        score_maximo INTEGER,
        score_minimo INTEGER,
        ultimo_candidato_fecha TIMESTAMPTZ
    ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(p.id) as total_candidatos,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'pending'
    ) as candidatos_pendientes,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'sent'
    ) as candidatos_enviados,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'replied'
    ) as candidatos_respondidos,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'confirmed'
    ) as candidatos_confirmados,
    COUNT(p.id) FILTER (
        WHERE p.estado_agenda = 'rejected'
    ) as candidatos_rechazados,
    ROUND(AVG(p.score_ia)::numeric, 1) as score_promedio,
    MAX(p.score_ia) as score_maximo,
    MIN(p.score_ia) as score_minimo,
    MAX(p.created_at) as ultimo_candidato_fecha
FROM postulantes p
WHERE p.id_busqueda_n8n = search_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON VIEW busquedas_con_stats IS 'Vista que muestra búsquedas con estadísticas agregadas de candidatos';
COMMENT ON FUNCTION get_search_stats IS 'Función que retorna estadísticas de una búsqueda específica';