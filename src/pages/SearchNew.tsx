import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Briefcase, FileText, Sparkles, ExternalLink, Zap } from 'lucide-react';

export default function SearchNew() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: ''
    });

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

            const searchId = `search_${Date.now()}`;

            const { error } = await supabase
                .from('busquedas')
                .insert({
                    id_busqueda_n8n: searchId,
                    user_id: user.id,
                    titulo: formData.titulo.trim(),
                    descripcion: formData.descripcion.trim() || null,
                    estado: 'active'
                });

            if (error) throw error;

            addToast('¡Búsqueda creada exitosamente!', 'success');
            navigate(`/search/${searchId}`);
        } catch (error) {
            console.error('Error creating search:', error);
            addToast('Error al crear la búsqueda', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleN8nRedirect = () => {
        const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
        if (n8nUrl) {
            window.open(n8nUrl, '_blank');
        } else {
            addToast('URL de n8n no configurada', 'error');
        }
    };

    if (showForm) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowForm(false)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-main)]">Crear Búsqueda</h1>
                        <p className="text-[var(--text-muted)]">Completá los detalles de la búsqueda</p>
                    </div>
                </div>

                {/* Form Card */}
                <GlassCard className="relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

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

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                            >
                                Crear Búsqueda
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Nueva Búsqueda</h1>
                    <p className="text-[var(--text-muted)]">Elegí cómo querés crear tu búsqueda</p>
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Native Option */}
                <GlassCard
                    hover
                    className="group cursor-pointer p-8 text-center apple-hover-lift"
                    onClick={() => setShowForm(true)}
                >
                    <div className="mb-6 flex justify-center">
                        <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                            <Sparkles className="w-12 h-12 text-emerald-500" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-main)] mb-3">Crear Nativa</h3>
                    <p className="text-[var(--text-muted)] mb-6">
                        Creá una búsqueda rápida con título y descripción. Ideal para procesos simples.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-emerald-500 font-medium">
                        <span>Comenzar</span>
                        <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                </GlassCard>

                {/* n8n Option */}
                <GlassCard
                    hover
                    className="group cursor-pointer p-8 text-center apple-hover-lift"
                    onClick={handleN8nRedirect}
                >
                    <div className="mb-6 flex justify-center">
                        <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                            <Zap className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-main)] mb-3">Usar n8n</h3>
                    <p className="text-[var(--text-muted)] mb-6">
                        Abrí el flujo completo de n8n para procesos avanzados con automatizaciones.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-purple-500 font-medium">
                        <span>Abrir n8n</span>
                        <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </GlassCard>
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-[var(--text-muted)] text-center">
                    💡 <strong>Tip:</strong> Podés editar el título y descripción de cualquier búsqueda después de crearla.
                </p>
            </div>
        </div>
    );
}
