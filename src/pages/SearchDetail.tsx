import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { CandidateTable, type Candidate } from '../components/CandidateTable';
import { KanbanBoard } from '../components/KanbanBoard';
import { ScheduleModal } from '../components/ScheduleModal';
import { useToast } from '../contexts/ToastContext';
import { LayoutGrid, List } from 'lucide-react';

interface BusquedaInfo {
    titulo: string;
    estado: string;
}

type ViewMode = 'table' | 'kanban';

export default function SearchDetail() {
    const { id } = useParams<{ id: string }>();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [searchInfo, setSearchInfo] = useState<BusquedaInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const { addToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const { data: searchData, error: searchError } = await supabase
                .from('busquedas')
                .select('titulo, estado')
                .eq('id_busqueda_n8n', id)
                .single();

            if (searchError) throw searchError;
            setSearchInfo(searchData);

            const { data: candidatesData, error: candidatesError } = await supabase
                .from('postulantes')
                .select('*')
                .eq('id_busqueda_n8n', id);

            if (candidatesError) throw candidatesError;
            setCandidates(candidatesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast('Error al cargar los datos', 'error');
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
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, comentarios_admin: newComment } : c));
            addToast('Nota actualizada', 'success');
        } catch (error) {
            console.error('Error updating comment:', error);
            addToast('Error al actualizar nota', 'error');
        }
    };

    const handleStatusChange = async (candidateId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('postulantes')
                .update({ estado_agenda: newStatus })
                .eq('id', candidateId);

            if (error) throw error;

            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, estado_agenda: newStatus } : c
            ));

            const statusLabels: Record<string, string> = {
                'pending': 'Pendiente',
                'sent': 'Enviado',
                'replied': 'Respondido',
                'confirmed': 'Confirmado',
                'rejected': 'Rechazado'
            };

            addToast(`Estado: "${statusLabels[newStatus] || newStatus}"`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            addToast('Error al actualizar estado', 'error');
            throw error;
        }
    };

    const handleOpenSchedule = (candidateId: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            setSelectedCandidate({ id: candidate.id, name: candidate.nombre });
            setIsModalOpen(true);
        }
    };

    const handleConfirmSchedule = async (slotId: string, startTime: string) => {
        if (!selectedCandidate) return;

        try {
            const { error: slotError } = await supabase
                .from('availability')
                .update({ is_booked: true })
                .eq('id', slotId);

            if (slotError) throw slotError;

            const { error: candidateError } = await supabase
                .from('postulantes')
                .update({
                    estado_agenda: 'confirmed',
                    fecha_entrevista: startTime
                })
                .eq('id', selectedCandidate.id);

            if (candidateError) throw candidateError;

            setCandidates(prev => prev.map(c =>
                c.id === selectedCandidate.id
                    ? { ...c, estado_agenda: 'confirmed' }
                    : c
            ));

            setIsModalOpen(false);
            addToast(`¡Entrevista confirmada para ${selectedCandidate.name}!`, 'success');
        } catch (error) {
            console.error('Error confirming schedule:', error);
            addToast('Error al confirmar entrevista', 'error');
        }
    };


    if (loading) return (
        <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">
            Cargando datos...
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard className="relative overflow-hidden w-full">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">{searchInfo?.titulo}</h1>
                        <p className="text-[var(--text-muted)] font-mono text-sm">ID: {id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex bg-[var(--card-bg)] rounded-lg p-1 border border-[var(--card-border)]">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'kanban'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-[var(--text-muted)] hover:text-emerald-500'
                                    }`}
                                title="Vista Kanban"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'table'
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : 'text-[var(--text-muted)] hover:text-emerald-500'
                                    }`}
                                title="Vista Tabla"
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <div className="px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                            {searchInfo?.estado === 'active' ? 'ACTIVO' : searchInfo?.estado.toUpperCase()}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Candidates View */}
            {viewMode === 'kanban' ? (
                <KanbanBoard
                    candidates={candidates}
                    onStatusChange={handleStatusChange}
                    onSchedule={handleOpenSchedule}
                />
            ) : (
                <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)]">
                    <CandidateTable
                        data={candidates}
                        onUpdateComment={handleUpdateComment}
                        onSchedule={handleOpenSchedule}
                    />
                </div>
            )}

            {/* Schedule Modal */}
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSchedule}
                candidateName={selectedCandidate?.name || 'Candidato'}
            />
        </div>
    );
}
