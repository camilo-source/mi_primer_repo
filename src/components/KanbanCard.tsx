import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Mail, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { type Candidate } from './CandidateTable';
import { SchedulingActions } from './SchedulingActions';

interface KanbanCardProps {
    candidate: Candidate;
    onSchedule: (id: string) => void;
    onStatusChange: (candidateId: string, newStatus: string) => void;
    isDragging?: boolean;
}

// Extract match percentage from AI summary
const extractMatchScore = (summary: string): number | null => {
    const match = summary?.match(/MATCH:\s*(\d+)%/i);
    return match ? parseInt(match[1], 10) : null;
};

const getMatchColor = (score: number): string => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
};

export function KanbanCard({ candidate, onStatusChange, isDragging }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: candidate.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const matchScore = extractMatchScore(candidate.resumen_ia);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all",
                (isDragging || isSortableDragging) && "opacity-50 scale-105 shadow-xl ring-2 ring-emerald-500/30",
                !isDragging && !isSortableDragging && "hover:border-emerald-500/30"
            )}
        >
            {/* Header with drag handle */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs border border-emerald-500/30">
                        {candidate.nombre?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--text-main)] leading-tight">
                            {candidate.nombre || 'Unknown'}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Mail size={10} />
                            <span className="truncate max-w-[120px]">{candidate.email}</span>
                        </div>
                    </div>
                </div>

                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={14} />
                </button>
            </div>

            {/* Match Score */}
            {matchScore !== null && (
                <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className={getMatchColor(matchScore)} />
                    <span className={cn("text-xs font-bold", getMatchColor(matchScore))}>
                        {matchScore}% Match
                    </span>
                </div>
            )}

            {/* AI Summary Preview */}
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2 leading-relaxed">
                {candidate.resumen_ia?.replace(/MATCH:\s*\d+%\.?\s*/i, '') || 'No AI summary'}
            </p>

            {/* Admin Notes */}
            {candidate.comentarios_admin && (
                <div className="bg-emerald-500/5 rounded-lg px-2 py-1.5 mb-2 border-l-2 border-emerald-500/50">
                    <p className="text-xs text-[var(--text-muted)] italic line-clamp-1">
                        📝 {candidate.comentarios_admin}
                    </p>
                </div>
            )}

            {/* Scheduling Actions - Shows different UI based on status */}
            <SchedulingActions
                candidate={candidate}
                onStatusChange={onStatusChange}
            />
        </div>
    );
}
