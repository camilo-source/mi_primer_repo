import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, Calendar, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useScheduling } from '../hooks/useScheduling';
import type { Candidate } from './CandidateTable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SchedulingActionsProps {
    candidate: Candidate;
    onStatusChange: (candidateId: string, newStatus: string) => void;
}

export function SchedulingActions({ candidate, onStatusChange }: SchedulingActionsProps) {
    const {
        status,
        matchedSlots,
        sendInvite,
        checkReplies,
        confirmSlot,
        needsGoogleAuth,
        initiateGoogleAuth
    } = useScheduling();

    const [showSlots, setShowSlots] = useState(false);

    const handleSendInvite = async () => {
        const success = await sendInvite(candidate.id);
        if (success) {
            onStatusChange(candidate.id, 'sent');
        }
    };

    const handleCheckReplies = async () => {
        const hasMatches = await checkReplies(candidate.id);
        if (hasMatches) {
            setShowSlots(true);
            onStatusChange(candidate.id, 'replied');
        }
    };

    const handleConfirmSlot = async (slotId: string) => {
        const success = await confirmSlot(candidate.id, slotId);
        if (success) {
            setShowSlots(false);
            onStatusChange(candidate.id, 'confirmed');
        }
    };

    // Need to connect Google first
    if (needsGoogleAuth) {
        return (
            <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-300 text-sm mb-2">
                    <AlertCircle size={16} />
                    <span>Conecta tu Google para enviar emails</span>
                </div>
                <Button
                    size="sm"
                    onClick={initiateGoogleAuth}
                    className="w-full"
                >
                    Conectar Google
                </Button>
            </div>
        );
    }

    // Render based on current status
    const renderActionByStatus = () => {
        switch (candidate.estado_agenda) {
            case 'pending':
                return (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSendInvite}
                        isLoading={status === 'sending'}
                        icon={<Mail size={14} />}
                        className="w-full"
                    >
                        Organizar Reunión
                    </Button>
                );

            case 'sent':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-300 text-xs">
                            <Clock size={12} className="animate-pulse" />
                            <span>Esperando respuesta...</span>
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCheckReplies}
                            isLoading={status === 'checking'}
                            icon={<RefreshCw size={14} />}
                            className="w-full"
                        >
                            Verificar Respuesta
                        </Button>
                    </div>
                );

            case 'replied':
                return (
                    <div className="space-y-2">
                        {!showSlots ? (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setShowSlots(true)}
                                icon={<Calendar size={14} />}
                                className="w-full"
                            >
                                Ver Horarios Compatibles
                            </Button>
                        ) : (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <p className="text-xs text-emerald-300 mb-2">
                                        Selecciona un horario:
                                    </p>
                                    {matchedSlots.map(slot => (
                                        <button
                                            key={slot.id}
                                            onClick={() => handleConfirmSlot(slot.id)}
                                            disabled={status === 'confirming'}
                                            className="w-full p-2 text-left bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-lg transition-all flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-white group-hover:text-emerald-300">
                                                    {format(new Date(slot.start_time), "EEEE d 'de' MMMM", { locale: es })}
                                                </div>
                                                <div className="text-xs text-white/50">
                                                    {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                                                </div>
                                            </div>
                                            {status === 'confirming' ? (
                                                <Loader2 size={16} className="animate-spin text-emerald-400" />
                                            ) : (
                                                <CheckCircle size={16} className="text-white/20 group-hover:text-emerald-400" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                );

            case 'confirmed':
                return (
                    <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <div className="text-xs text-emerald-300">
                            <span className="font-medium">Confirmado</span>
                            {candidate.fecha_entrevista && (
                                <span className="block text-emerald-400/70">
                                    {format(new Date(candidate.fecha_entrevista), "d MMM, HH:mm", { locale: es })}
                                </span>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="mt-3">
            {renderActionByStatus()}
        </div>
    );
}
