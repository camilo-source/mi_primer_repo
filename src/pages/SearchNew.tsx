import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Briefcase, FileText, Zap, Copy, ExternalLink, Check } from 'lucide-react';

export default function SearchNew() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: ''
    });

    // Estado post-creación
    const [createdSearch, setCreatedSearch] = useState<{
        id: string;
        n8nUrl: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.titulo.trim()) {
            addToast('El título es requerido', 'error');
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                addToast('Debes iniciar sesión', 'error');
                navigate('/');
                return;
            }

            // Generar UUID único para la búsqueda
            const searchId = crypto.randomUUID();

            const { error } = await supabase
                .from('busquedas')
                .insert({
                    id_busqueda_n8n: searchId,
                    user_id: user.id,
                    titulo: formData.titulo.trim(),
                    estado: 'active'
                });

            if (error) throw error;

            // Construir URL de n8n con el ID
            const n8nBaseUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
            const n8nUrl = n8nBaseUrl ? `${n8nBaseUrl}?id_busqueda_n8n=${searchId}` : '';

            addToast('¡Búsqueda creada exitosamente!', 'success');

            // Mostrar el panel de confirmación con el link
            setCreatedSearch({
                id: searchId,
                n8nUrl: n8nUrl
            });

        } catch (error) {
            console.error('Error creating search:', error);
            addToast('Error al crear la búsqueda', 'error');
        } finally {
            setLoading(false);
        }
    };

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

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    const handleGoToSearch = () => {
        if (createdSearch?.id) {
            navigate(`/search/${createdSearch.id}`);
        }
    };

    // Vista de confirmación post-creación
    if (createdSearch) {
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
                            <Zap size={16} className="text-purple-500" />
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
                        onClick={handleGoToDashboard}
                        className="flex-1"
                    >
                        Ir al Dashboard
                    </Button>
                    <Button
                        onClick={handleGoToSearch}
                        className="flex-1"
                    >
                        Ver Búsqueda
                    </Button>
                </div>
            </div>
        );
    }

    // Formulario de creación
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    aria-label="Volver al dashboard"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Nueva Búsqueda</h1>
                    <p className="text-[var(--text-muted)]">Creá una nueva búsqueda para recibir candidatos</p>
                </div>
            </div>

            {/* Form Card */}
            <GlassCard className="relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <form onSubmit={handleSubmit} className="relative space-y-6">
                    {/* Title Field */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                            <Briefcase size={16} className="text-emerald-500" />
                            Título del puesto
                        </label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                            placeholder="ej: Desarrollador Full Stack Senior"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                            <FileText size={16} className="text-emerald-500" />
                            Descripción
                            <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            placeholder="Describe los requisitos, responsabilidades y cualquier detalle relevante..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-start gap-3">
                            <Zap size={20} className="text-purple-500 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-[var(--text-main)] font-medium mb-1">Flujo con n8n</p>
                                <p className="text-[var(--text-muted)]">
                                    Al crear la búsqueda, obtendrás un link único para el formulario de n8n donde los candidatos podrán postularse.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            icon={<Zap size={18} />}
                        >
                            Crear Búsqueda
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
