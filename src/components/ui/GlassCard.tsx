import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { playSound } from '../../lib/sounds';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
    soundOnHover?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, hover = false, glow = false, soundOnHover = false, onMouseEnter, ...props }, ref) => {

        const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
            if (soundOnHover) {
                playSound.hover();
            }
            if (onMouseEnter) {
                (onMouseEnter as (e: React.MouseEvent<HTMLDivElement>) => void)(e);
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    scale: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileHover={hover ? {
                    scale: 1.01,
                    y: -4,
                    transition: { duration: 0.2 }
                } : undefined}
                ref={ref}
                onMouseEnter={handleMouseEnter}
                className={cn(
                    "relative rounded-2xl p-6 transition-all duration-300",
                    "bg-[var(--card-bg)] border border-[var(--card-border)]",
                    "shadow-[var(--card-shadow)]",
                    "backdrop-blur-xl",
                    hover && "cursor-pointer hover:shadow-[var(--shadow-lg)] hover:border-[var(--brand-primary)]",
                    glow && "animate-glow-pulse",
                    className
                )}
                {...props}
            >
                {/* Shimmer overlay effect on hover */}
                {hover && (
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </div>
                )}
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";

