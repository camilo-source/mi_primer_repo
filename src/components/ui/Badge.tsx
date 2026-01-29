import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
    const variants = {
        default: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
        warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-500/20",
        error: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20",
        outline: "bg-transparent border-[var(--card-border)] text-[var(--text-muted)]"
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
};
