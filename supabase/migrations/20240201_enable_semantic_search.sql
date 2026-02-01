-- Enable pgvector extension
create extension if not exists vector;
-- Add embedding column to postulantes table (768 dimensions for Gemini text-embedding-004)
alter table postulantes
add column if not exists embedding vector(768);
-- Create HNSW index for performance
create index on postulantes using hnsw (embedding vector_cosine_ops);
-- Create match_candidates function for similarity search
create or replace function match_candidates (
        query_embedding vector(768),
        match_threshold float,
        match_count int,
        search_job_id uuid
    ) returns table (
        id uuid,
        nombre text,
        email text,
        cv_text_or_url text,
        score_ia int,
        similarity float
    ) language plpgsql as $$ begin return query
select postulantes.id,
    postulantes.nombre,
    postulantes.email,
    postulantes.cv_text_or_url,
    postulantes.score_ia,
    1 - (postulantes.embedding <=> query_embedding) as similarity
from postulantes
where 1 - (postulantes.embedding <=> query_embedding) > match_threshold
    and (
        search_job_id is null
        or postulantes.id_busqueda_n8n = search_job_id
    )
order by postulantes.embedding <=> query_embedding
limit match_count;
end;
$$;