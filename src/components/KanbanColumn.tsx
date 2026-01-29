import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../lib/utils';

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    count: number;
    children: React.ReactNode;
}

const colorVariants: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    yellow: {
        bg: 'bg-yellow-500/5',
        border: 'border-yellow-500/20',
        text: 'text-yellow-600 dark:text-yellow-300',
        dot: 'bg-yellow-500',
    },
    blue: {
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-300',
        dot: 'bg-blue-500',
    },
    purple: {
        bg: 'bg-purple-500/5',
        border: 'border-purple-500/20',
        text: 'text-purple-600 dark:text-purple-300',
        dot: 'bg-purple-500',
    },
    emerald: {
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    red: {
        bg: 'bg-red-500/5',
        border: 'border-red-500/20',
        text: 'text-red-600 dark:text-red-300',
        dot: 'bg-red-500',
    },
};

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const colors = colorVariants[color] || colorVariants.yellow;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-72 rounded-2xl border transition-all duration-200",
                colors.bg,
                colors.border,
                isOver && "ring-2 ring-emerald-500/50 border-emerald-500/50"
            )}
        >
            {/* Column Header */}
            <div className="p-4 border-b border-[var(--card-border)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                        <h3 className={cn("font-bold text-sm", colors.text)}>{title}</h3>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--card-bg)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                        {count}
                    </span>
                </div>
            </div>

            {/* Column Content */}
            <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {children}
                {count === 0 && (
                    <div className="text-center py-8 text-[var(--text-muted)] text-sm opacity-50">
                        Arrastra candidatos aquí
                    </div>
                )}
            </div>
        </div>
    );
}
