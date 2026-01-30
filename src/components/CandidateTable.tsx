import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown, Mail, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export interface Candidate {
    id: string;
    nombre: string;
    email: string;
    resumen_ia: string;
    estado_agenda: string;
    comentarios_admin: string;
    fecha_entrevista?: string;
    booking_token?: string;
}

interface CandidateTableProps {
    data: Candidate[];
    onUpdateComment: (id: string, comment: string) => void;
    onSchedule: (id: string) => void;
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
