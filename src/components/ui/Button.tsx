import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

        const variants = {
            primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 border border-transparent",
            secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md",
            outline: "border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10",
            ghost: "text-white/70 hover:text-emerald-300 hover:bg-white/5",
            danger: "bg-red-500/80 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-6 text-lg"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && icon && <span className="mr-2">{icon}</span>}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
