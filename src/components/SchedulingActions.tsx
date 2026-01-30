import { useState, useEffect } from 'react';
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

    // Check if there's already a booking token
    useEffect(() => {
        if (candidate.booking_token) {
            const baseUrl = window.location.origin;
            setBookingUrl(`${baseUrl}/book/${candidate.booking_token}`);
        }
    }, [candidate.booking_token]);

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
            addToast('📋 Link copiado', 'success');
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
            `¡Gracias por tu interés!\n\n` +
            `Seleccioná el horario que mejor te quede:\n\n` +
            `${bookingUrl}\n\n` +
            `Saludos`
        );

        window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`, '_blank');
    };

    // CONFIRMED STATE
    if (candidate.estado_agenda === 'confirmed') {
        return (
            <div className="mt-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                    <div className="text-xs">
                        <span className="font-bold text-emerald-400 block">✓ Confirmado</span>
                        {candidate.fecha_entrevista && (
                            <span className="text-emerald-300/70">
                                {format(new Date(candidate.fecha_entrevista), "EEEE d MMM, HH:mm", { locale: es })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // SENT STATE - Link already generated
    if (candidate.estado_agenda === 'sent' || bookingUrl) {
        return (
            <div className="mt-3 space-y-2">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-medium mb-1">
                        <Link2 size={10} />
                        Link de agenda:
                    </div>
                    <div className="flex items-center gap-1 bg-black/20 rounded p-1">
                        <input
                            type="text"
                            value={bookingUrl || ''}
                            readOnly
                            className="flex-1 text-[9px] bg-transparent text-white/60 truncate outline-none font-mono"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        >
                            {copied ? (
                                <CheckCircle size={12} className="text-emerald-400" />
                            ) : (
                                <Copy size={12} className="text-white/40" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
                    >
                        {copied ? <CheckCircle size={10} /> : <Copy size={10} />}
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-medium rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 transition-colors"
                    >
                        <Mail size={10} />
                        Enviar Email
                    </button>
                </div>

                <a
                    href={bookingUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[10px] text-white/40 hover:text-emerald-400 transition-colors py-1"
                >
                    <ExternalLink size={10} />
                    Ver página
                </a>
            </div>
        );
    }

    // PENDING/DEFAULT STATE - Generate link button
    return (
        <div className="mt-3">
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
        </div>
    );
}
