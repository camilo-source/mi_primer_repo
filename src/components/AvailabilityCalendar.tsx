import { useState } from 'react';
import { format, addDays, startOfToday, setHours, setMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Check, X, Clock, Calendar as CalendarIcon, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export function AvailabilityCalendar() {
    const today = startOfToday();
    const days = Array.from({ length: 5 }).map((_, i) => addDays(today, i)); // Next 5 days
    const hours = Array.from({ length: 9 }).map((_, i) => 9 + i); // 9 AM to 5 PM

    const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);

    const toggleSlot = (date: Date, hour: number) => {
        const slotDate = setHours(setMinutes(date, 0), hour);
        const exists = selectedSlots.find(d => d.getTime() === slotDate.getTime());

        if (exists) {
            setSelectedSlots(prev => prev.filter(d => d.getTime() !== slotDate.getTime()));
        } else {
            setSelectedSlots(prev => [...prev, slotDate].sort((a, b) => a.getTime() - b.getTime()));
        }
    };

    const isSelected = (date: Date, hour: number) => {
        const slotDate = setHours(setMinutes(date, 0), hour);
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
                    {hours.map(hour => (
                        <>
                            <div key={`time-${hour}`} className="flex items-center justify-center text-xs text-white/40 font-mono">
                                {format(setHours(today, hour), 'h a')}
                            </div>
                            {days.map(day => {
                                const active = isSelected(day, hour);
                                return (
                                    <motion.button
                                        key={`${day.toISOString()}-${hour}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleSlot(day, hour)}
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
                            {selectedSlots.length === 0 ? (
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
                            disabled={selectedSlots.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                            onClick={() => alert(`Saved ${selectedSlots.length} availability slots!`)}
                        >
                            <Save size={18} />
                            Save Availability
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
