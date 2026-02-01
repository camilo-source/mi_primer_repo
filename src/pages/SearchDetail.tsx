import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PdfViewer } from '../components/ui/PdfViewer';
import { CandidateTable, type Candidate } from '../components/CandidateTable';
import { KanbanBoard } from '../components/KanbanBoard';
import { ScheduleModal } from '../components/ScheduleModal';
import { useToast } from '../contexts/ToastContext';
import { SearchInfoHeader } from '../components/SearchInfoHeader';
import { triggerGradingWorkflow } from '../lib/n8nWebhook';

interface BusquedaInfo {
    titulo: string;
    estado: string;
    descripcion?: string;
    habilidades_requeridas?: string[];
    experiencia_minima?: number;
    experiencia_maxima?: number;
    modalidad?: string;
    ubicacion?: string;
    salario_min?: number;
    salario_max?: number;
    moneda?: string;
    idiomas?: Record<string, string>;
    requisitos_excluyentes?: string[];
    requisitos_deseables?: string[];
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
    const [selectedCv, setSelectedCv] = useState<string | null>(null);

    // Ordenar candidatos por score (mayor a menor)
    const sortedCandidates = useMemo(() => {
        return [...candidates].sort((a, b) => {
            return (b.score_ia || 0) - (a.score_ia || 0);
        });
    }, [candidates]);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    // 🔄 REALTIME: Suscripción a cambios en tiempo real
    useEffect(() => {
        if (!id) return;

        console.log('🔄 Configurando Realtime para búsqueda:', id);

        const channel = supabase
            .channel(`postulantes:${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'postulantes',
                    filter: `id_busqueda_n8n=eq.${id}`
                },
                (payload) => {
                    console.log('🆕 Nuevo candidato recibido:', payload.new);

                    // Agregar candidato a la lista
                    setCandidates(prev => [...prev, payload.new as Candidate]);

                    // Mostrar notificación
                    const newCandidate = payload.new as Candidate;
                    addToast(
                        `🎉 Nuevo candidato: ${newCandidate.nombre} (Score: ${newCandidate.score_ia || 'N/A'})`,
                        'success'
                    );
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'postulantes',
                    filter: `id_busqueda_n8n=eq.${id}`
                },
                (payload) => {
                    console.log('✏️ Candidato actualizado:', payload.new);

                    // Actualizar candidato en la lista
                    setCandidates(prev =>
                        prev.map(c => c.id === payload.new.id ? payload.new as Candidate : c)
                    );
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'postulantes',
                    filter: `id_busqueda_n8n=eq.${id}`
                },
                (payload) => {
                    console.log('🗑️ Candidato eliminado:', payload.old);

                    // Remover candidato de la lista
                    setCandidates(prev => prev.filter(c => c.id !== payload.old.id));
                }
            )
            .subscribe((status) => {
                console.log('📡 Estado de Realtime:', status);
            });

        // Cleanup al desmontar
        return () => {
            console.log('🔌 Desconectando Realtime');
            supabase.removeChannel(channel);
        };
    }, [id, addToast]);

    const fetchData = async () => {
        try {
            const { data: searchData, error: searchError } = await supabase
                .from('busquedas')
                .select('titulo, estado, descripcion, habilidades_requeridas, experiencia_minima, experiencia_maxima, modalidad, ubicacion, salario_min, salario_max, moneda, idiomas, requisitos_excluyentes, requisitos_deseables')
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

    const handleRegrade = async (candidateId: string) => {
        if (!id) return;
        const candidate = candidates.find(c => c.id === candidateId);
        const cvSource = candidate?.cv_url || candidate?.cv_text_or_url;

        if (!candidate || !cvSource) {
            addToast('No se puede analizar este candidato (falta CV)', 'error');
            return;
        }

        addToast('🤖 Iniciando análisis con IA (Prompt mejorado)...', 'success');

        try {
            await triggerGradingWorkflow({
                jobId: id,
                candidate: {
                    nombre: candidate.nombre,
                    email: candidate.email,
                    cv_text_or_url: cvSource,
                }
            });
            // Result is handled via Supabase Realtime (update event)
        } catch (error) {
            console.error('Regrade error:', error);
            addToast('Error al invocar el agente de IA', 'error');
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
            <SearchInfoHeader
                id={id}
                searchInfo={searchInfo}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {/* Candidates View */}
            {viewMode === 'kanban' ? (
                <KanbanBoard
                    candidates={sortedCandidates}
                    onStatusChange={handleStatusChange}
                    onSchedule={handleOpenSchedule}
                />
            ) : (
                <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)]">
                    <CandidateTable
                        data={sortedCandidates}
                        onUpdateComment={handleUpdateComment}
                        onSchedule={handleOpenSchedule}
                        onViewCv={(url) => setSelectedCv(url)}
                        onRegrade={handleRegrade}
                    />
                </div>
            )}

            {/* PdfViewer Modal */}
            <PdfViewer
                url={selectedCv}
                onClose={() => setSelectedCv(null)}
                title="CV del Candidato"
            />


            {/* Schedule Modal */}
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSchedule}
                candidateName={selectedCandidate?.name || 'Candidato'}
            />
        </div >
    );
}
