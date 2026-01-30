import { useState, useEffect } from 'react';
import { format, addDays, startOfToday, setHours, setMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Check, X, Clock, Calendar as CalendarIcon, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function AvailabilityCalendar() {
    const today = startOfToday();
    const days = Array.from({ length: 5 }).map((_, i) => addDays(today, i));
    // Generate 30-minute intervals from 9:00 to 17:30
    const timeSlots = Array.from({ length: 17 }).map((_, i) => {
        const hour = Math.floor(i / 2) + 9;
        const minute = (i % 2) * 30;
        return { hour, minute };
    });

    const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('availability')
                .select('start_time')
                .gte('start_time', today.toISOString());

            if (error) throw error;

            if (data) {
                setSelectedSlots(data.map(d => new Date(d.start_time)));
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

            // 1. Delete existing future availability to replace with new selection (simpler for now)
            // Real apps might merge, but replacing ensures consistency with UI state.
            await supabase
                .from('availability')
                .delete()
                .eq('user_id', user.id)
                .gte('start_time', today.toISOString());

            // 2. Insert new slots
            const slotsToInsert = selectedSlots.map(date => ({
                user_id: user.id,
                start_time: date.toISOString(),
                end_time: setMinutes(date, date.getMinutes() + 30).toISOString(), // 30 minute slots
                is_booked: false
            }));

            if (slotsToInsert.length > 0) {
                const { error } = await supabase
                    .from('availability')
                    .insert(slotsToInsert);
                if (error) throw error;
            }

            alert('Availability saved successfully!');
        } catch (error) {
            console.error('Error saving availability:', error);
            alert('Failed to save availability.');
        } finally {
            setSaving(false);
        }
    };

    const toggleSlot = (date: Date, hour: number, minute: number) => {
        const slotDate = setMinutes(setHours(date, hour), minute);
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="text-emerald-400" />
                        Select Availability
                    </h2>
                    <p className="text-sm text-white/50">Click slots to toggle</p>
                </div>

                <div className="grid grid-cols-6 gap-2">
                    {/* Header Row */}
                    <div className="glass p-2 rounded-lg flex items-center justify-center font-bold text-white/50 text-xs shadow-none border-none bg-transparent">
                        TIME
                    </div>
                    {days.map(day => (
                        <div key={day.toISOString()} className="glass p-2 rounded-lg text-center shadow-none border-white/5 bg-white/5">
                            <div className="text-emerald-400 font-bold text-sm">{format(day, 'EEE')}</div>
                            <div className="text-white/40 text-xs">{format(day, 'MMM d')}</div>
                        </div>
                    ))}

                    {/* Time Rows */}
                    {timeSlots.map(({ hour, minute }, index) => (
                        <>
                            <div key={`time-${index}`} className="flex items-center justify-center text-xs text-white/40 font-mono">
                                {format(setMinutes(setHours(today, hour), minute), 'h:mm a')}
                            </div>
                            {days.map(day => {
                                const active = isSelected(day, hour, minute);
                                return (
                                    <motion.button
                                        key={`${day.toISOString()}-${hour}-${minute}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleSlot(day, hour, minute)}
                                        className={cn(
                                            "h-10 rounded-lg border transition-all duration-300 flex items-center justify-center",
                                            active
                                                ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(46,204,113,0.3)]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {active && <Check size={16} className="animate-fade-in" />}
                                    </motion.button>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>

            {/* Selected Slots Table */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="text-emerald-400" />
                    Selected Slots
                </h2>

                <GlassCard className="min-h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {loading ? (
                                <div className="p-4 text-center text-white/50">Loading slots...</div>
                            ) : selectedSlots.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/30 text-center space-y-2">
                                    <CalendarIcon size={32} strokeWidth={1.5} />
                                    <p className="text-sm">No slots selected.</p>
                                </div>
                            ) : (
                                selectedSlots.map((slot) => (
                                    <motion.div
                                        key={slot.getTime()}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group hover:border-white/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 rounded-full bg-emerald-500" />
                                            <div>
                                                <div className="text-sm font-bold text-white">
                                                    {format(slot, 'EEEE, MMM d')}
                                                </div>
                                                <div className="text-xs text-emerald-200/70 font-mono">
                                                    {format(slot, 'h:00 a')} - {format(addDays(setHours(slot, slot.getHours() + 1), 0), 'h:00 a')}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSlots(prev => prev.filter(d => d.getTime() !== slot.getTime()))}
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-6 mt-4 border-t border-white/10">
                        <button
                            disabled={selectedSlots.length === 0 || saving}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                            onClick={handleSave}
                        >
                            {saving ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <Save size={18} />
                            )}
                            {saving ? 'Saving...' : 'Save Availability'}
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
