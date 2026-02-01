import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useDebounce } from './useDebounce';

export interface SemanticSearchResult {
    id: string;
    nombre: string;
    email: string;
    cv_text_or_url: string;
    score_ia: number;
    similarity: number;
}

export function useSemanticSearch(jobId?: string) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SemanticSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const performSearch = async (searchTerm: string) => {
        // Validate input is a string
        if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            // 1. Generate embedding using client-side function (works in dev and prod)
            const { generateEmbedding } = await import('../lib/embeddings');
            const embedding = await generateEmbedding(searchTerm);

            if (!embedding) {
                throw new Error('Failed to generate embedding');
            }

            // 2. Call Supabase RPC for semantic search
            const { data, error: rpcError } = await supabase.rpc('match_candidates', {
                query_embedding: embedding,
                match_threshold: 0.2, // Lower threshold for more results
                match_count: 20,
                search_job_id: jobId || null
            });

            if (rpcError) {
                console.error('[useSemanticSearch] RPC error:', rpcError);
                throw rpcError;
            }

            console.log('[useSemanticSearch] RPC results:', data);

            // If no semantic results, fall back to text search
            if (!data || data.length === 0) {
                console.log('[useSemanticSearch] No semantic results, trying text fallback');

                // Simple text-based search as fallback
                const { data: textResults, error: textError } = await supabase
                    .from('postulantes')
                    .select('*')
                    .eq('id_busqueda_n8n', jobId)
                    .or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,resumen_ia.ilike.%${searchTerm}%,cv_texto_extraido.ilike.%${searchTerm}%`)
                    .limit(10);

                if (textError) throw textError;

                // Convert to semantic search format
                const convertedResults = (textResults || []).map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    email: c.email,
                    cv_text_or_url: c.cv_texto_extraido || '',
                    score_ia: c.score_ia || 0,
                    similarity: 0.5 // Give moderate similarity for text matches
                }));

                setResults(convertedResults);
                console.log('[useSemanticSearch] Text fallback results:', convertedResults.length);
                return;
            }

            setResults(data || []);

        } catch (err: any) {
            console.error('Semantic search error:', err);
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounce the search wrapper
    const debouncedSearch = useDebounce((term: string) => performSearch(term), 600);

    const handleSearchInput = (value: string, immediate = false) => {
        console.log('[useSemanticSearch] handleSearchInput called:', { value, immediate, type: typeof value });
        setQuery(value);
        if (immediate) {
            console.log('[useSemanticSearch] Triggering immediate search');
            performSearch(value);
        } else {
            console.log('[useSemanticSearch] Triggering debounced search');
            debouncedSearch(value);
        }
    };

    return {
        query,
        setQuery: handleSearchInput, // Expose the wrapper
        results,
        isSearching,
        error
    };
}
