import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { CandidateTable, type Candidate } from '../components/CandidateTable';
import { KanbanBoard } from '../components/KanbanBoard';
import { ScheduleModal } from '../components/ScheduleModal';
import { useToast } from '../contexts/ToastContext';
import {
    LayoutGrid,
    List,
    Code,
    Clock,
    MapPin,
    DollarSign,
    Languages,
    AlertCircle,
    Star,
    ChevronDown,
    ChevronUp,
    Briefcase
} from 'lucide-react';

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
    const [showRequirements, setShowRequirements] = useState(false);
    const { addToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<{ id: string, name: string } | null>(null);

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


    if (loading) return (
        <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">
            Cargando datos...
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard className="relative overflow-hidden w-full">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">{searchInfo?.titulo}</h1>
                        <p className="text-[var(--text-muted)] font-mono text-sm">ID: {id}</p>
                        {searchInfo?.descripcion && (
                            <p className="text-[var(--text-muted)] mt-2 max-w-2xl">{searchInfo.descripcion}</p>
                        )}
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

                {/* Perfil del Puesto - Colapsable */}
                {(searchInfo?.habilidades_requeridas?.length || searchInfo?.requisitos_excluyentes?.length || searchInfo?.requisitos_deseables?.length || searchInfo?.idiomas) && (
                    <div className="border-t border-[var(--card-border)] pt-4 mt-4">
                        <button
                            onClick={() => setShowRequirements(!showRequirements)}
                            className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-emerald-500 transition-colors w-full justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Briefcase size={16} />
                                Perfil del Puesto
                            </span>
                            {showRequirements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showRequirements && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-fade-in">
                                {/* Habilidades Técnicas */}
                                {searchInfo?.habilidades_requeridas && searchInfo.habilidades_requeridas.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <Code size={12} className="text-emerald-500" />
                                            Habilidades Técnicas
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {searchInfo.habilidades_requeridas.map(skill => (
                                                <span key={skill} className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experiencia */}
                                {(searchInfo?.experiencia_minima !== undefined || searchInfo?.experiencia_maxima !== undefined) && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <Clock size={12} className="text-emerald-500" />
                                            Experiencia
                                        </label>
                                        <p className="text-sm text-[var(--text-main)]">
                                            {searchInfo?.experiencia_minima || 0} - {searchInfo?.experiencia_maxima || 10} años
                                        </p>
                                    </div>
                                )}

                                {/* Modalidad */}
                                {searchInfo?.modalidad && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <MapPin size={12} className="text-emerald-500" />
                                            Modalidad
                                        </label>
                                        <p className="text-sm text-[var(--text-main)] capitalize">
                                            {searchInfo.modalidad === 'remoto' && '🏠 Remoto'}
                                            {searchInfo.modalidad === 'presencial' && '🏢 Presencial'}
                                            {searchInfo.modalidad === 'hibrido' && '🔄 Híbrido'}
                                        </p>
                                    </div>
                                )}

                                {/* Ubicación */}
                                {searchInfo?.ubicacion && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <MapPin size={12} className="text-purple-500" />
                                            Ubicación
                                        </label>
                                        <p className="text-sm text-[var(--text-main)]">{searchInfo.ubicacion}</p>
                                    </div>
                                )}

                                {/* Salario */}
                                {(searchInfo?.salario_min || searchInfo?.salario_max) && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <DollarSign size={12} className="text-emerald-500" />
                                            Rango Salarial
                                        </label>
                                        <p className="text-sm text-[var(--text-main)]">
                                            {searchInfo.moneda} {searchInfo.salario_min?.toLocaleString()} - {searchInfo.salario_max?.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {/* Idiomas */}
                                {searchInfo?.idiomas && Object.keys(searchInfo.idiomas).length > 0 && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <Languages size={12} className="text-blue-500" />
                                            Idiomas
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(searchInfo.idiomas).map(([idioma, nivel]) => (
                                                <span key={idioma} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
                                                    {idioma} ({nivel})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Requisitos Excluyentes */}
                                {searchInfo?.requisitos_excluyentes && searchInfo.requisitos_excluyentes.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <AlertCircle size={12} className="text-red-500" />
                                            Excluyentes
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {searchInfo.requisitos_excluyentes.map(req => (
                                                <span key={req} className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                                    {req}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Requisitos Deseables */}
                                {searchInfo?.requisitos_deseables && searchInfo.requisitos_deseables.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                            <Star size={12} className="text-amber-500" />
                                            Deseables
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {searchInfo.requisitos_deseables.map(req => (
                                                <span key={req} className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                    {req}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>

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
