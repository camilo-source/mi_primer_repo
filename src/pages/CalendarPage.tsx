import { AvailabilityCalendar } from '../components/AvailabilityCalendar';

export default function CalendarPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
                    <p className="text-emerald-100/70">Manage your interview availability</p>
                </div>
            </div>

            <AvailabilityCalendar />
        </div>
    );
}
