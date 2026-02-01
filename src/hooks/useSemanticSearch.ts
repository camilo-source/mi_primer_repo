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
            // 1. Generate embedding using our API (Gemini)
            const response = await fetch('/api/embed-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: searchTerm })
            });

            if (!response.ok) throw new Error('Failed to generate embedding');

            const { embedding } = await response.json();

            // 2. Call Supabase RPC
            const { data, error: rpcError } = await supabase.rpc('match_candidates', {
                query_embedding: embedding,
                match_threshold: 0.4, // Threshold can be tuned
                match_count: 10,
                search_job_id: jobId || null
            });

            if (rpcError) throw rpcError;

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
