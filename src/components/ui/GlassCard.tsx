import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
    gradient?: boolean;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export const GlassCard = ({
    children,
    className,
    hover = true,
    glow = false,
    gradient = false,
    style,
    onClick
}: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hover ? { y: -4, scale: 1.01 } : {}}
            onClick={onClick}
            style={style}
            className={cn(
                "liquid-glass-card relative",
                onClick && "cursor-pointer",
                glow && "glow-border-static",
                gradient && "glow-border",
                className
            )}
        >
            {/* Top shine effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            {/* Bottom glow */}
            {glow && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-emerald-500/20 blur-xl rounded-full" />
            )}
        </motion.div>
    );
};
