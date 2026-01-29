import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { CandidateTable, type Candidate } from '../components/CandidateTable';


interface BusquedaInfo {
    titulo: string;
    estado: string;
}

export default function SearchDetail() {
    const { id } = useParams<{ id: string }>();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [searchInfo, setSearchInfo] = useState<BusquedaInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch Search Info
            const { data: searchData, error: searchError } = await supabase
                .from('busquedas')
                .select('titulo, estado')
                .eq('id_busqueda_n8n', id)
                .single();

            if (searchError) throw searchError;
            setSearchInfo(searchData);

            // Fetch Candidates
            const { data: candidatesData, error: candidatesError } = await supabase
                .from('postulantes')
                .select('*')
                .eq('id_busqueda_n8n', id);

            if (candidatesError) throw candidatesError;
            setCandidates(candidatesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateComment = async (candidateId: string, newComment: string) => {
        try {
            const { error } = await supabase
                .from('postulantes')
                .update({ comentarios_admin: newComment })
                .eq('id', candidateId);

            if (error) throw error;
            // Optimistic update
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, comentarios_admin: newComment } : c));
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Failed to update comment');
        }
    };

    const handleSchedule = async (candidateId: string) => {
        // 1. Check availability (Mock)
        const hasAvailability = Math.random() > 0.2; // 80% success

        if (!hasAvailability) {
            alert('No availability found for the recruiter.');
            return;
        }

        try {
            // 2. Trigger n8n Webhook (Mock)
            // fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ candidateId }) });

            // 3. Update Status
            const { error } = await supabase
                .from('postulantes')
                .update({ estado_agenda: 'sent' }) // Workflow: pending -> sent -> confirmed
                .eq('id', candidateId);

            if (error) throw error;

            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, estado_agenda: 'sent' } : c));
            alert('Invitation sent via Agent!');
        } catch (error) {
            console.error('Error scheduling:', error);
        }
    };


    if (loading) return <div className="p-10 text-center text-white/50 animate-pulse">Loading Search Data...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <GlassCard className="relative overflow-hidden w-full">
                <h1 className="text-3xl font-bold text-white mb-2">{searchInfo?.titulo}</h1>
                <p className="text-emerald-100/60 font-mono text-sm">ID: {id}</p>
                <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                    {searchInfo?.estado.toUpperCase()}
                </div>
            </GlassCard>

            {/* Candidates Table */}
            <div className="glass rounded-2xl overflow-hidden border border-white/20">
                <CandidateTable
                    data={candidates}
                    onUpdateComment={handleUpdateComment}
                    onSchedule={handleSchedule}
                />
            </div>
        </div>
    );
}
