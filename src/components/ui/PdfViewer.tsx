
import { X, ExternalLink } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface PdfViewerProps {
    url: string | null;
    onClose: () => void;
    title?: string;
}

export function PdfViewer({ url, onClose, title = 'Documento' }: PdfViewerProps) {
    if (!url) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-6xl h-[92vh] flex flex-col p-0 overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-emerald-400">PDF</span>
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Abrir en nueva pestaña"
                        >
                            <ExternalLink size={20} />
                        </a>
                        <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={20} />}>
                            Cerrar
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full h-full bg-white/5 relative overflow-hidden">
                    <iframe
                        src={url}
                        className="w-full h-full border-0 block"
                        title={title}
                    />

                    {/* Fallback msg if iframe fails (though modern browsers handle PDFs well) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 text-white/30">
                        <p>Cargando documento...</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
