import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, Mail, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { SmartInsights } from './SmartInsights';

export interface Candidate {
    id: string;
    nombre: string;
    email: string;
    resumen_ia: string;
    score_ia?: number;
    estado_agenda: string;
    comentarios_admin: string;
    fecha_entrevista?: string;
    booking_token?: string;
    cv_text_or_url?: string;
    cv_url?: string;
    analisis_json?: {
        technical_score: number;
        experience_score: number;
        soft_skills_score: number;
        relevance_score: number;
    };
}

interface CandidateTableProps {
    data: Candidate[];
    onUpdateComment: (id: string, comment: string) => void;
    onSchedule: (id: string) => void;
    onViewCv: (url: string) => void;
    onRegrade: (id: string) => void;
    jobMatches?: Array<{ id: string; similarity: number }>;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'confirmed': return 'success';
        case 'pending': return 'warning';
        case 'cancelled':
        case 'rejected': return 'error';
        case 'sent': return 'default'; // Or add info variant
        default: return 'default';
    }
};

const columnHelper = createColumnHelper<Candidate>();

export function CandidateTable({ data, onUpdateComment, onSchedule, onViewCv, onRegrade, jobMatches }: CandidateTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    // Create a map for quick job match lookup
    const jobMatchMap = new Map(jobMatches?.map(m => [m.id, m.similarity]) || []);

    const columns = [
        columnHelper.accessor('nombre', {
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center gap-2 hover:text-white transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Candidate
                        <ArrowUpDown size={14} className="opacity-50" />
                    </button>
                )
            },
            cell: (info) => {
                const cvLink = info.row.original.cv_url || info.row.original.cv_text_or_url;
                return (
                    <div className="flex items-center gap-3 group/candidate">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs border border-emerald-500/30">
                            {info.getValue()?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-white flex items-center gap-2">
                            {info.getValue()}
                            {cvLink && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewCv(cvLink);
                                    }}
                                    className="opacity-0 group-hover/candidate:opacity-100 transition-all duration-300 p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30"
                                    title="Ver CV Completo"
                                >
                                    <FileText size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            },
        }),
        // Job Match % Column
        columnHelper.display({
            id: 'job_match',
            header: () => (
                <div className="text-center">
                    <span className="text-xs">Job Match</span>
                </div>
            ),
            cell: (info) => {
                const candidateId = info.row.original.id;
                const matchScore = jobMatchMap.get(candidateId);

                if (!matchScore || matchScore === 0) return null;

                const percentage = Math.round(matchScore * 100);

                // Color based on match percentage
                let colorClass = 'text-white/30 bg-white/5';
                if (percentage >= 80) colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                else if (percentage >= 60) colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                else if (percentage >= 40) colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                return (
                    <div className="flex justify-center">
                        <div className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`} title="Relevancia semántica con el puesto">
                            {percentage}%
                        </div>
                    </div>
                );
            },
            size: 80,
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: (info) => (
                <div className="flex items-center gap-2 text-white/60">
                    <Mail size={14} />
                    {info.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor('score_ia', {
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center gap-2 hover:text-white transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Score
                        <ArrowUpDown size={14} className="opacity-50" />
                    </button>
                )
            },
            cell: (info) => {
                const score = info.getValue();
                const analysis = info.row.original.analisis_json;

                // Color basado en el score
                let colorClass = 'text-white/50';
                if (score && score >= 80) colorClass = 'text-emerald-400';
                else if (score && score >= 60) colorClass = 'text-amber-400';
                else if (score) colorClass = 'text-red-400';

                return (
                    <div className="flex items-center gap-2 group/score relative">
                        <div className={`text-2xl font-bold ${colorClass} cursor-help`}>
                            {score ?? 'N/A'}
                        </div>
                        <div className="text-xs text-white/30">/100</div>

                        {/* Smart Insights Popover (Radar Chart) */}
                        {analysis && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 opacity-0 group-hover/score:opacity-100 invisible group-hover/score:visible transition-all duration-300 z-50 pointer-events-none scale-95 group-hover/score:scale-100 origin-bottom">
                                <SmartInsights analysis={analysis} />
                                {/* Arrow */}
                                <div className="w-4 h-4 bg-black/80 border-r border-b border-emerald-500/30 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-2"></div>
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegrade(info.row.original.id);
                            }}
                            className="opacity-0 group-hover/score:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                            title="Recalcular con IA"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                        </button>
                    </div>
                );
            },
        }),
        columnHelper.accessor('resumen_ia', {
            header: 'AI Summary',
            cell: (info) => (
                <div className="text-sm text-white/70 line-clamp-2 max-w-md" title={info.getValue() || ''}>
                    {info.getValue() || "No summary available."}
                </div>
            ),
        }),
        columnHelper.accessor('comentarios_admin', {
            header: 'Notes',
            cell: ({ row, getValue }) => (
                <div className="min-w-[220px]">
                    <Input
                        defaultValue={getValue() || ''}
                        onBlur={(e) => onUpdateComment(row.original.id, e.target.value)}
                        placeholder="Add a note..."
                        variant="comment"
                        className="text-sm"
                        icon={<MessageSquare size={14} />}
                    />
                </div>
            ),
        }),
        columnHelper.accessor('estado_agenda', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() || 'pending';
                return (
                    <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
                        {status}
                    </Badge>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSchedule(row.original.id)}
                    disabled={row.original.estado_agenda !== 'pending'}
                    icon={<Calendar size={14} />}
                >
                    Schedule
                </Button>
            ),
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b border-white/10">
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="p-4 text-sm font-medium text-white/50 first:pl-6 last:pr-6">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="text-sm">
                    {table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-8 text-center text-white/30">
                                No candidates found using the current filter criteria.
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-4 first:pl-6 last:pr-6">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
