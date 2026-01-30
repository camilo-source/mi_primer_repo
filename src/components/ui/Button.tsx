import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { playSound } from '../../lib/sounds';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    soundOnClick?: boolean;
    soundOnHover?: boolean;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading,
        icon,
        children,
        disabled,
        soundOnClick = true,
        soundOnHover = false,
        onClick,
        onMouseEnter,
        ...props
    }, ref) => {
        const [ripples, setRipples] = useState<Ripple[]>([]);
        const buttonRef = useRef<HTMLButtonElement>(null);

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            // Play satisfying click sound
            if (soundOnClick && !disabled && !isLoading) {
                playSound.click();
            }

            // Create ripple effect
            if (buttonRef.current && !disabled) {
                const rect = buttonRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const id = Date.now();

                setRipples(prev => [...prev, { id, x, y }]);
                setTimeout(() => {
                    setRipples(prev => prev.filter(r => r.id !== id));
                }, 600);
            }

            onClick?.(e);
        };

        const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (soundOnHover && !disabled) {
                playSound.hover();
            }
            onMouseEnter?.(e);
        };

        const baseStyles = "relative overflow-hidden inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] hover:scale-[1.02]";

        const variants = {
            primary: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-400/20",
            secondary: cn(
                "border backdrop-blur-md",
                "bg-[var(--card-bg)] border-[var(--card-border)]",
                "text-[var(--text-main)] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-lg"
            ),
            outline: "border-2 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10",
            ghost: "text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/10",
            danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-6 text-lg"
        };

        // Merge refs
        const mergedRef = (node: HTMLButtonElement) => {
            (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
        };

        return (
            <button
                ref={mergedRef}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                {...props}
            >
                {/* Ripple effects */}
                {ripples.map(ripple => (
                    <span
                        key={ripple.id}
                        className="absolute rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]"
                        style={{
                            left: ripple.x - 10,
                            top: ripple.y - 10,
                            width: 20,
                            height: 20,
                        }}
                    />
                ))}

                {/* Button content */}
                <span className="relative z-10 flex items-center">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!isLoading && icon && <span className="mr-2">{icon}</span>}
                    {children}
                </span>
            </button>
        );
    }
);

Button.displayName = "Button";

