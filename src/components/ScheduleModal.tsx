import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from './ui/GlassCard';
import { format } from 'date-fns';
import { X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (slotId: string, startTime: string) => void;
    candidateName: string;
}

interface AvailabilitySlot {
    id: string;
    start_time: string;
    end_time: string;
}

export function ScheduleModal({ isOpen, onClose, onConfirm, candidateName }: ScheduleModalProps) {
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSlots();
        }
    }, [isOpen]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('availability')
                .select('*')
                .eq('is_booked', false)
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(10); // Show next 10 available slots

            if (error) throw error;
            setSlots(data || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    <GlassCard className="max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Schedule Interview</h3>
                            <button onClick={onClose} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-white/70 mb-4">
                            Select a time for <strong>{candidateName}</strong>:
                        </p>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {loading ? (
                                <div className="text-center text-white/40 py-8">Loading available slots...</div>
                            ) : slots.length === 0 ? (
                                <div className="text-center text-white/40 py-8 border border-dashed border-white/10 rounded-lg">
                                    <Calendar className="mx-auto mb-2 opacity-50" />
                                    No available slots found. <br /> Check your Calendar availability.
                                </div>
                            ) : (
                                slots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => onConfirm(slot.id, slot.start_time)}
                                        className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 transition-all group"
                                    >
                                        <div className="font-bold text-white group-hover:text-emerald-300">
                                            {format(new Date(slot.start_time), 'EEEE, MMM d')}
                                        </div>
                                        <div className="text-xs text-white/50 font-mono">
                                            {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
