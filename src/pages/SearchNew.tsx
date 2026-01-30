import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Briefcase, FileText, Sparkles } from 'lucide-react';

export default function SearchNew() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
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

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
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
                    <p className="text-[var(--text-muted)]">Creá un nuevo proceso de reclutamiento</p>
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
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Sparkles size={12} className="text-emerald-500" />
                            Podés agregar candidatos después de crear la búsqueda
                        </p>
                        <div className="flex gap-3">
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
                            >
                                Crear Búsqueda
                            </Button>
                        </div>
                    </div>
                </form>
            </GlassCard>

            {/* Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <h3 className="font-semibold text-emerald-400 mb-1">💡 Tip</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        Un título claro ayuda a organizar mejor tus procesos de selección.
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <h3 className="font-semibold text-blue-400 mb-1">📝 Siguientes pasos</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        Después de crear la búsqueda, podrás agregar candidatos y gestionar entrevistas.
                    </p>
                </div>
            </div>
        </div>
    );
}
