import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, Mail, Calendar, MessageSquare, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

export interface Candidate {
    id: string;
    nombre: string;
    email: string;
    resumen_ia: string;
    estado_agenda: string;
    comentarios_admin: string;
}

interface CandidateTableProps {
    data: Candidate[];
    onUpdateComment: (id: string, comment: string) => void;
    onSchedule: (id: string) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="text-yellow-400" size={18} />,
    sent: <Send className="text-blue-400" size={18} />,
    confirmed: <CheckCircle className="text-emerald-400" size={18} />,
    cancelled: <XCircle className="text-red-400" size={18} />
};

const columnHelper = createColumnHelper<Candidate>();

export function CandidateTable({ data, onUpdateComment, onSchedule }: CandidateTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

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
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        {info.getValue()?.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-medium text-white">{info.getValue()}</div>
                </div>
            ),
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
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-white/30 shrink-0 opacity-50" />
                    <input
                        type="text"
                        defaultValue={getValue() || ''}
                        onBlur={(e) => onUpdateComment(row.original.id, e.target.value)}
                        className="bg-transparent border-b border-white/10 focus:border-emerald-400 outline-none w-full text-white placeholder-white/20 text-xs py-1 transition-all"
                        placeholder="Add note..."
                    />
                </div>
            ),
        }),
        columnHelper.accessor('estado_agenda', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() || 'pending';
                return (
                    <div className="flex items-center gap-2" title={status}>
                        {statusIcons[status] || statusIcons.pending}
                        <span className="capitalize text-xs font-medium opacity-80">{status}</span>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <button
                    onClick={() => onSchedule(row.original.id)}
                    disabled={row.original.estado_agenda !== 'pending'}
                    className="flex items-center gap-2 bg-white/10 hover:bg-emerald-500 hover:text-white text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Calendar size={14} />
                    Schedule
                </button>
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
