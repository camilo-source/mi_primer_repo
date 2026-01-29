import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
    const variants = {
        default: "bg-white/10 text-white border-white/10",
        success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        error: "bg-red-500/20 text-red-300 border-red-500/30",
        outline: "bg-transparent border-white/20 text-white/70"
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
};
