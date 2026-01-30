import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, CheckCircle, Calendar, ExternalLink, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import type { Candidate } from './CandidateTable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

interface SchedulingActionsProps {
    candidate: Candidate;
    onStatusChange: (candidateId: string, newStatus: string) => void;
}

export function SchedulingActions({ candidate, onStatusChange }: SchedulingActionsProps) {
    const [loading, setLoading] = useState(false);
    const [bookingUrl, setBookingUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { addToast } = useToast();

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const response = await fetch('/api/booking/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: candidate.id,
                    userId: user.id
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            setBookingUrl(data.bookingUrl);
            onStatusChange(candidate.id, 'sent');
            addToast('📅 Link de agenda generado', 'success');

        } catch (error) {
            console.error('Generate link error:', error);
            addToast('Error al generar link', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!bookingUrl) return;

        try {
            await navigator.clipboard.writeText(bookingUrl);
            setCopied(true);
            addToast('📋 Link copiado al portapapeles', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast('Error al copiar', 'error');
        }
    };

    const handleSendEmail = () => {
        if (!bookingUrl) return;

        const subject = encodeURIComponent('Agenda tu entrevista');
        const body = encodeURIComponent(
            `Hola ${candidate.nombre},\n\n` +
            `¡Gracias por tu interés en la posición!\n\n` +
            `Por favor, seleccioná el horario que mejor te quede para la entrevista:\n\n` +
            `${bookingUrl}\n\n` +
            `Saludos`
        );

        window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`, '_blank');
    };

    // Render based on current status
    const renderActionByStatus = () => {
        switch (candidate.estado_agenda) {
            case 'pending':
            case undefined:
            case null:
                return (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleGenerateLink}
                        isLoading={loading}
                        icon={<Calendar size={14} />}
                        className="w-full"
                    >
                        Generar Link de Agenda
                    </Button>
                );

            case 'sent':
                return (
                    <div className="space-y-2">
                        {bookingUrl ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                            >
                                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <p className="text-[10px] text-emerald-400 mb-1 font-medium">Link generado:</p>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={bookingUrl}
                                            readOnly
                                            className="flex-1 text-[10px] bg-transparent text-[var(--text-muted)] truncate outline-none"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title="Copiar link"
                                        >
                                            {copied ? (
                                                <CheckCircle size={12} className="text-emerald-400" />
                                            ) : (
                                                <Copy size={12} className="text-[var(--text-muted)]" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleCopyLink}
                                        icon={copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                                        className="text-xs"
                                    >
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleSendEmail}
                                        icon={<Mail size={12} />}
                                        className="text-xs"
                                    >
                                        Enviar
                                    </Button>
                                </div>

                                <a
                                    href={bookingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    <ExternalLink size={10} />
                                    Ver página de agenda
                                </a>
                            </motion.div>
                        ) : (
                            <div className="flex items-center gap-2 text-blue-400 text-xs p-2 bg-blue-500/10 rounded-lg">
                                <Link2 size={12} />
                                <span>Link enviado - esperando selección</span>
                            </div>
                        )}
                    </div>
                );

            case 'confirmed':
                return (
                    <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <div className="text-xs text-emerald-400">
                            <span className="font-medium">Confirmado</span>
                            {candidate.fecha_entrevista && (
                                <span className="block text-emerald-500/70">
                                    {format(new Date(candidate.fecha_entrevista), "d MMM, HH:mm", { locale: es })}
                                </span>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleGenerateLink}
                        isLoading={loading}
                        icon={<Calendar size={14} />}
                        className="w-full"
                    >
                        Generar Link
                    </Button>
                );
        }
    };

    return (
        <div className="mt-3">
            {renderActionByStatus()}
        </div>
    );
}
