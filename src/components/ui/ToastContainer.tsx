import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { type Toast, type ToastType } from '../../types/toast';

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

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        layout
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 min-w-[300px] max-w-sm
                            p-4 rounded-xl border backdrop-blur-md shadow-lg
                            bg-slate-900/90 text-white
                            ${borderColors[toast.type]}
                        `}
                    >
                        <div className="shrink-0">{icons[toast.type]}</div>
                        <p className="text-sm font-medium flex-1">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
