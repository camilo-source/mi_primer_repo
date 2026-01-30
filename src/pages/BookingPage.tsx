import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Loader2, AlertCircle, Sparkles, Download } from 'lucide-react';
import { playSound } from '../lib/sounds';

interface Slot {
    id: string;
    start_time: string;
    end_time: string;
}

interface BookingData {
    candidateName: string;
    searchTitle: string;
    slots: Slot[];
}

type BookingState = 'loading' | 'selecting' | 'confirming' | 'confirmed' | 'error' | 'already_confirmed';

export default function BookingPage() {
    const { token } = useParams<{ token: string }>();
    const [state, setState] = useState<BookingState>('loading');
    const [data, setData] = useState<BookingData | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [confirmedSlot, setConfirmedSlot] = useState<Slot | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (token) {
            fetchSlots();
        }
    }, [token]);

    const fetchSlots = async () => {
        try {
            const response = await fetch(`/api/booking/slots?token=${token}`);
            const result = await response.json();

            if (!response.ok) {
                if (result.error === 'already_confirmed') {
                    setState('already_confirmed');
                    return;
                }
                throw new Error(result.error || 'Failed to load slots');
            }

            setData(result);
            setState('selecting');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error loading availability');
            setState('error');
        }
    };

    const handleConfirm = async () => {
        if (!selectedSlot) return;

        setState('confirming');
        try {
            const response = await fetch('/api/booking/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, slotId: selectedSlot.id })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to confirm');
            }

            setConfirmedSlot(selectedSlot);
            setState('confirmed');
            // Play success sound
            playSound.success();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error confirming slot');
            setState('error');
        }
    };

    // Group slots by day
    const groupSlotsByDay = (slots: Slot[]) => {
        const groups: Record<string, Slot[]> = {};
        slots.forEach(slot => {
            const day = format(new Date(slot.start_time), 'yyyy-MM-dd');
            if (!groups[day]) groups[day] = [];
            groups[day].push(slot);
        });
        return groups;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl"
            >
                {/* Loading State */}
                {state === 'loading' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Cargando disponibilidad...</p>
                    </div>
                )}

                {/* Error State */}
                {state === 'error' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-red-500/20 p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Link inválido</h2>
                        <p className="text-white/60">{error}</p>
                    </div>
                )}

                {/* Already Confirmed State */}
                {state === 'already_confirmed' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">¡Ya está confirmada!</h2>
                        <p className="text-white/60">Esta entrevista ya fue agendada anteriormente.</p>
                    </div>
                )}

                {/* Selection State */}
                {state === 'selecting' && data && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                        {/* Header */}
                        <div className="p-8 bg-gradient-to-r from-emerald-500/20 to-blue-500/10 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 text-sm font-medium">GreenGlass ATS</p>
                                    <h1 className="text-2xl font-bold text-white">{data.searchTitle}</h1>
                                </div>
                            </div>
                            <p className="text-white/70">
                                Hola <span className="font-semibold text-white">{data.candidateName}</span>,
                                seleccioná el horario que mejor te quede para la entrevista.
                            </p>
                        </div>

                        {/* Slots Grid */}
                        <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {data.slots.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/50">No hay horarios disponibles por el momento.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupSlotsByDay(data.slots)).map(([day, daySlots]) => (
                                        <div key={day}>
                                            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                                <Calendar size={14} />
                                                {format(new Date(day), "EEEE d 'de' MMMM", { locale: es })}
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {daySlots.map(slot => {
                                                    const isSelected = selectedSlot?.id === slot.id;
                                                    return (
                                                        <motion.button
                                                            key={slot.id}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setSelectedSlot(slot);
                                                                playSound.pop();
                                                            }}
                                                            className={`
                                                                p-3 rounded-xl border transition-all flex items-center justify-center gap-2
                                                                ${isSelected
                                                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                                                                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 hover:shadow-lg'
                                                                }
                                                            `}
                                                        >
                                                            <Clock size={14} className={isSelected ? 'text-white' : 'text-emerald-400'} />
                                                            <span className="font-medium">
                                                                {format(new Date(slot.start_time), 'HH:mm')}
                                                            </span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white/5 border-t border-white/10">
                            <AnimatePresence>
                                {selectedSlot && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                                    >
                                        <p className="text-sm text-emerald-300">Horario seleccionado:</p>
                                        <p className="font-bold text-white">
                                            {format(new Date(selectedSlot.start_time), "EEEE d 'de' MMMM, HH:mm", { locale: es })} hs
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleConfirm}
                                disabled={!selectedSlot}
                                className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle size={20} />
                                Confirmar Entrevista
                            </button>
                        </div>
                    </div>
                )}

                {/* Confirming State */}
                {state === 'confirming' && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Confirmando tu entrevista...</p>
                    </div>
                )}

                {/* Confirmed State */}
                {state === 'confirmed' && confirmedSlot && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-12 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        >
                            <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-2">¡Confirmado!</h2>
                        <p className="text-white/60 mb-8">Tu entrevista ha sido agendada</p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20"
                        >
                            <div className="flex items-center justify-center gap-3 text-emerald-300 mb-2">
                                <Calendar size={20} />
                                <span className="text-lg font-semibold">
                                    {format(new Date(confirmedSlot.start_time), "EEEE d 'de' MMMM", { locale: es })}
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-3 text-white text-2xl font-bold">
                                <Clock size={24} />
                                <span>
                                    {format(new Date(confirmedSlot.start_time), 'HH:mm')} hs
                                </span>
                            </div>
                        </motion.div>

                        {/* Download .ics button */}
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                playSound.click();
                                // Generate .ics file
                                const start = new Date(confirmedSlot.start_time);
                                const end = new Date(confirmedSlot.end_time);
                                const title = data?.searchTitle || 'Entrevista';

                                const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                                const icsContent = [
                                    'BEGIN:VCALENDAR',
                                    'VERSION:2.0',
                                    'PRODID:-//GreenGlass ATS//Booking//ES',
                                    'BEGIN:VEVENT',
                                    `DTSTART:${formatDate(start)}`,
                                    `DTEND:${formatDate(end)}`,
                                    `SUMMARY:${title}`,
                                    `DESCRIPTION:Entrevista agendada vía GreenGlass ATS`,
                                    'STATUS:CONFIRMED',
                                    'END:VEVENT',
                                    'END:VCALENDAR'
                                ].join('\r\n');

                                const blob = new Blob([icsContent], { type: 'text/calendar' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'entrevista.ics';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="mt-6 flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 hover:border-white/20 transition-all"
                        >
                            <Download size={18} />
                            Agregar a mi calendario
                        </motion.button>

                        <p className="mt-6 text-white/40 text-sm">
                            Recibirás un email con los detalles de la reunión.
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
