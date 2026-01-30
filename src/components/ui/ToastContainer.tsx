import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { type Toast, type ToastType } from '../../types/toast';
import { playSound } from '../../lib/sounds';

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />
};

const borderColors: Record<ToastType, string> = {
    success: "border-emerald-500/30",
    error: "border-red-500/30",
    info: "border-blue-500/30",
    warning: "border-yellow-500/30"
};

const glowColors: Record<ToastType, string> = {
    success: "shadow-emerald-500/20",
    error: "shadow-red-500/20",
    info: "shadow-blue-500/20",
    warning: "shadow-yellow-500/20"
};

// Component to handle sound on mount
const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        // Play sound based on toast type
        switch (toast.type) {
            case 'success':
                playSound.success();
                break;
            case 'error':
                playSound.notification();
                break;
            case 'info':
            case 'warning':
                playSound.pop();
                break;
        }
    }, [toast.type]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.8, rotateZ: 5 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateZ: 0 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
            }}
            layout
            className={`
                pointer-events-auto
                flex items-center gap-3 min-w-[300px] max-w-sm
                p-4 rounded-xl border backdrop-blur-xl shadow-xl
                bg-slate-900/95 text-white
                ${borderColors[toast.type]}
                ${glowColors[toast.type]}
            `}
        >
            <motion.div
                className="shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
            >
                {icons[toast.type]}
            </motion.div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={onRemove}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-95"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

