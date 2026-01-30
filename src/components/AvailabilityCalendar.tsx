import { useState, useEffect } from 'react';
import { format, addDays, startOfToday, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Check, X, Clock, Calendar as CalendarIcon, Save, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export function AvailabilityCalendar() {
    const { addToast } = useToast();
    const today = startOfToday();
    const [weekOffset, setWeekOffset] = useState(0);
    const days = Array.from({ length: 5 }).map((_, i) => addDays(today, i + weekOffset * 5));

    // Generate 30-minute intervals from 9:00 to 17:30
    const timeSlots = Array.from({ length: 17 }).map((_, i) => {
        const hour = Math.floor(i / 2) + 9;
        const minute = (i % 2) * 30;
        return { hour, minute };
    });

    const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
    const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAvailability();
    }, [weekOffset]);

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('availability')
                .select('start_time, is_booked')
                .gte('start_time', today.toISOString());

            if (error) throw error;

            if (data) {
                const available = data.filter(d => !d.is_booked).map(d => new Date(d.start_time));
                const booked = data.filter(d => d.is_booked).map(d => new Date(d.start_time));

                setSelectedSlots(available);
                setBookedSlots(booked);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            await supabase
                .from('availability')
                .delete()
                .eq('user_id', user.id)
                .gte('start_time', today.toISOString());

            const slotsToInsert = selectedSlots.map(date => ({
                user_id: user.id,
                start_time: date.toISOString(),
                end_time: setMinutes(date, date.getMinutes() + 30).toISOString(),
                is_booked: false
            }));

            if (slotsToInsert.length > 0) {
                const { error } = await supabase
                    .from('availability')
                    .insert(slotsToInsert);
                if (error) throw error;
            }

            addToast('Disponibilidad guardada exitosamente', 'success');
        } catch (error) {
            console.error('Error saving availability:', error);
            addToast('Error al guardar la disponibilidad', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleSlot = (date: Date, hour: number, minute: number) => {
        const slotDate = setMinutes(setHours(date, hour), minute);

        const isBooked = bookedSlots.some(d => d.getTime() === slotDate.getTime());
        if (isBooked) return;

        const exists = selectedSlots.find(d => d.getTime() === slotDate.getTime());

        if (exists) {
            setSelectedSlots(prev => prev.filter(d => d.getTime() !== slotDate.getTime()));
        } else {
            setSelectedSlots(prev => [...prev, slotDate].sort((a, b) => a.getTime() - b.getTime()));
        }
    };

    const isSelected = (date: Date, hour: number, minute: number) => {
        const slotDate = setMinutes(setHours(date, hour), minute);
        return selectedSlots.some(d => d.getTime() === slotDate.getTime());
    };

    const isBooked = (date: Date, hour: number, minute: number) => {
        const slotDate = setMinutes(setHours(date, hour), minute);
        return bookedSlots.some(d => d.getTime() === slotDate.getTime());
    };

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 space-y-6">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                                disabled={weekOffset === 0}
                                className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Semana anterior"
                            >
                                <ChevronLeft size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setWeekOffset(prev => prev + 1)}
                                className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                                aria-label="Semana siguiente"
                            >
                                <ChevronRight size={20} />
                            </motion.button>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                            <CalendarIcon className="text-emerald-500" />
                            Disponibilidad
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm"></div>
                            <span className="text-[var(--text-muted)]">Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25"></div>
                            <span className="text-[var(--text-muted)]">Seleccionado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md bg-red-500/20 border border-red-500/30"></div>
                            <span className="text-[var(--text-muted)]">Reservado</span>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <GlassCard className="overflow-hidden">
                    <div className="grid grid-cols-6 gap-1 p-1">
                        {/* Header Row */}
                        <div className="p-3 flex items-center justify-center font-bold text-[var(--text-muted)] text-xs">
                            HORA
                        </div>
                        {days.map(day => (
                            <motion.div
                                key={day.toISOString()}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-3 rounded-xl text-center transition-all",
                                    isToday(day)
                                        ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30"
                                        : "bg-[var(--card-bg)]/50"
                                )}
                            >
                                <div className={cn(
                                    "font-bold text-sm",
                                    isToday(day) ? "text-emerald-500" : "text-[var(--text-main)]"
                                )}>
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div className={cn(
                                    "text-xs",
                                    isToday(day) ? "text-emerald-400" : "text-[var(--text-muted)]"
                                )}>
                                    {format(day, 'd MMM', { locale: es })}
                                </div>
                                {isToday(day) && (
                                    <div className="mt-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 rounded-full px-2 py-0.5">
                                        HOY
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* Time Rows */}
                        {timeSlots.map(({ hour, minute }, index) => (
                            <>
                                <div
                                    key={`time-${index}`}
                                    className="flex items-center justify-center text-xs text-[var(--text-muted)] font-mono py-2"
                                >
                                    {format(setMinutes(setHours(today, hour), minute), 'h:mm a')}
                                </div>
                                {days.map(day => {
                                    const active = isSelected(day, hour, minute);
                                    const booked = isBooked(day, hour, minute);
                                    return (
                                        <motion.button
                                            key={`${day.toISOString()}-${hour}-${minute}`}
                                            whileHover={!booked ? { scale: 1.08, y: -2 } : {}}
                                            whileTap={!booked ? { scale: 0.95 } : {}}
                                            onClick={() => !booked && toggleSlot(day, hour, minute)}
                                            disabled={booked}
                                            aria-label={`${booked ? 'Reservado' : active ? 'Quitar disponibilidad' : 'Agregar disponibilidad'} ${format(day, 'EEEE d', { locale: es })} a las ${format(setMinutes(setHours(today, hour), minute), 'h:mm a')}`}
                                            className={cn(
                                                "h-11 rounded-xl border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                                                booked
                                                    ? "bg-red-500/10 border-red-500/20 cursor-not-allowed"
                                                    : active
                                                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                                                        : "bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-md"
                                            )}
                                        >
                                            <AnimatePresence mode="wait">
                                                {active && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0, rotate: 180 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    >
                                                        <Check size={18} strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                                {booked && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <X size={16} className="text-red-400" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Selected Slots Panel */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Clock className="text-emerald-500" />
                    Horarios Seleccionados
                    <span className="ml-auto text-sm font-normal bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                        {selectedSlots.length}
                    </span>
                </h2>

                <GlassCard className="min-h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[350px] custom-scrollbar">
                        <AnimatePresence>
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
                                    />
                                </div>
                            ) : selectedSlots.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center space-y-4 py-12"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-purple-500/10 flex items-center justify-center">
                                        <CalendarIcon size={32} strokeWidth={1.5} className="text-emerald-500/50" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-1">Sin horarios seleccionados</p>
                                        <p className="text-xs">Hacé click en los slots del calendario para agregar disponibilidad</p>
                                    </div>
                                </motion.div>
                            ) : (
                                selectedSlots.map((slot, index) => (
                                    <motion.div
                                        key={slot.getTime()}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm group hover:border-emerald-500/30 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30" />
                                            <div>
                                                <div className="text-sm font-bold text-[var(--text-main)]">
                                                    {format(slot, 'EEEE d MMM', { locale: es })}
                                                </div>
                                                <div className="text-xs text-emerald-500 font-mono">
                                                    {format(slot, 'h:mm a')} - {format(setMinutes(slot, slot.getMinutes() + 30), 'h:mm a')}
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setSelectedSlots(prev => prev.filter(d => d.getTime() !== slot.getTime()))}
                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all"
                                            aria-label={`Quitar ${format(slot, 'EEEE d', { locale: es })} a las ${format(slot, 'h:mm a')}`}
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-6 mt-4 border-t border-[var(--card-border)]">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={selectedSlots.length === 0 || saving}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40"
                            onClick={handleSave}
                        >
                            {saving ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <Save size={18} />
                                </>
                            )}
                            {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
                        </motion.button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
