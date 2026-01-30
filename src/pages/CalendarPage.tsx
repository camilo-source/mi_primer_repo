import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export default function CalendarPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-2">
                            Calendario
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                        </h1>
                        <p className="text-[var(--text-muted)]">Configurá tu disponibilidad para entrevistas</p>
                    </div>
                </div>
            </div>

            <AvailabilityCalendar />
        </div>
    );
}
