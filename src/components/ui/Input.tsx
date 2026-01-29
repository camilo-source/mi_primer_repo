import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
    variant?: 'default' | 'minimal' | 'comment';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, icon, error, variant = 'default', ...props }, ref) => {
        const variants = {
            default: "glass-input",
            minimal: "bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 rounded-none px-0",
            comment: "bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg"
        };

        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full py-2 px-3 text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none transition-all duration-200",
                        variants[variant],
                        icon && "pl-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-red-500 mt-1.5 block ml-1">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
