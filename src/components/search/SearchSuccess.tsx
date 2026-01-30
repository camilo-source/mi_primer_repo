import { useState } from 'react';
import { Check, ExternalLink, Copy, Code } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import type { CreatedSearch, SearchFormData } from '../../types/search';

interface SearchSuccessProps {
    createdSearch: CreatedSearch;
    formData: SearchFormData;
    onGoToDashboard: () => void;
    onGoToSearch: () => void;
}

export function SearchSuccess({ createdSearch, formData, onGoToDashboard, onGoToSearch }: SearchSuccessProps) {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        if (!createdSearch?.n8nUrl) return;

        try {
            await navigator.clipboard.writeText(createdSearch.n8nUrl);
            setCopied(true);
            addToast('Link copiado al portapapeles', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast('Error al copiar', 'error');
        }
    };

    const handleOpenN8n = () => {
        if (createdSearch?.n8nUrl) {
            window.open(createdSearch.n8nUrl, '_blank');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Success Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                    <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--text-main)]">¡Búsqueda Creada!</h1>
                <p className="text-[var(--text-muted)]">
                    Tu búsqueda <strong className="text-emerald-500">"{formData.titulo}"</strong> ha sido creada exitosamente.
                </p>
            </div>

            {/* ID Card */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-emerald-500/5 rounded-full blur-3xl" />

                <div className="relative space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <Code size={16} className="text-purple-500" />
                        ID de la Búsqueda
                    </div>

                    <div className="p-4 rounded-xl bg-black/20 border border-white/10 font-mono text-sm text-emerald-400 break-all">
                        {createdSearch.id}
                    </div>

                    <p className="text-xs text-[var(--text-muted)]">
                        Este ID identifica tu búsqueda y vincula los candidatos que se postulen.
                    </p>
                </div>
            </GlassCard>

            {/* n8n Link Card */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl" />

                <div className="relative space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <ExternalLink size={16} className="text-blue-500" />
                        Link del Formulario n8n
                    </div>

                    {createdSearch.n8nUrl ? (
                        <>
                            <div className="p-4 rounded-xl bg-black/20 border border-white/10 font-mono text-xs text-blue-400 break-all">
                                {createdSearch.n8nUrl}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCopyLink}
                                    variant="secondary"
                                    icon={copied ? <Check size={16} /> : <Copy size={16} />}
                                    className="flex-1"
                                >
                                    {copied ? 'Copiado!' : 'Copiar Link'}
                                </Button>
                                <Button
                                    onClick={handleOpenN8n}
                                    icon={<ExternalLink size={16} />}
                                    className="flex-1"
                                >
                                    Abrir Formulario
                                </Button>
                            </div>

                            <p className="text-xs text-[var(--text-muted)]">
                                Compartí este link con los candidatos o usalo para iniciar el flujo de postulación en n8n.
                            </p>
                        </>
                    ) : (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                            ⚠️ URL de n8n no configurada. Agregá <code>VITE_N8N_WEBHOOK_URL</code> en tu archivo .env
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="ghost"
                    onClick={onGoToDashboard}
                    className="flex-1"
                >
                    Ir al Panel de Control
                </Button>
                <Button
                    onClick={onGoToSearch}
                    className="flex-1"
                >
                    Ver Búsqueda
                </Button>
            </div>
        </div>
    );
}
