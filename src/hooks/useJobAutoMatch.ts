import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface JobMatchResult {
    id: string;
    similarity: number;
}

/**
 * Hook to auto-match candidates against the job's embedding
 * This runs automatically when the job has an embedding
 */
export function useJobAutoMatch(jobId?: string) {
    const [jobMatches, setJobMatches] = useState<JobMatchResult[]>([]);
    const [isMatching, setIsMatching] = useState(false);

    useEffect(() => {
        if (!jobId) return;

        const fetchJobEmbeddingAndMatch = async () => {
            setIsMatching(true);
            try {
                // 1. Get the job's embedding
                const { data: jobData, error: jobError } = await supabase
                    .from('busquedas')
                    .select('embedding')
                    .eq('id_busqueda_n8n', jobId)
                    .single();

                if (jobError || !jobData?.embedding) {
                    console.log('[JobAutoMatch] No embedding found for job, skipping auto-match');
                    return;
                }

                // 2. Match candidates using the job's embedding
                const { data, error: rpcError } = await supabase.rpc('match_candidates', {
                    query_embedding: jobData.embedding,
                    match_threshold: 0.3, // Lower threshold for auto-match
                    match_count: 50, // Get more results
                    search_job_id: jobId
                });

                if (rpcError) throw rpcError;

                // Map to just id and similarity
                const matches = (data || []).map((item: any) => ({
                    id: item.id,
                    similarity: item.similarity
                }));

                setJobMatches(matches);
                console.log('[JobAutoMatch] Auto-matched', matches.length, 'candidates');

            } catch (err) {
                console.error('[JobAutoMatch] Error:', err);
            } finally {
                setIsMatching(false);
            }
        };

        fetchJobEmbeddingAndMatch();
    }, [jobId]);

    return {
        jobMatches,
        isMatching
    };
}
