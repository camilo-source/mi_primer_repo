-- Add embedding column to busquedas table for Semantic Job Context
alter table busquedas
add column if not exists embedding vector(768);
-- Create index for efficient similarity search
create index if not exists busquedas_embedding_idx on busquedas using hnsw (embedding vector_cosine_ops);
-- RPC function to find similar jobs (for future "Similar Jobs" feature)
create or replace function match_similar_jobs(
        query_embedding vector(768),
        match_threshold float default 0.7,
        match_count int default 10
    ) returns table (
        id_busqueda_n8n text,
        titulo text,
        descripcion text,
        similarity float
    ) language plpgsql as $$ begin return query
select busquedas.id_busqueda_n8n,
    busquedas.titulo,
    busquedas.descripcion,
    1 - (busquedas.embedding <=> query_embedding) as similarity
from busquedas
where busquedas.embedding is not null
    and 1 - (busquedas.embedding <=> query_embedding) > match_threshold
order by busquedas.embedding <=> query_embedding
limit match_count;
end;
$$;