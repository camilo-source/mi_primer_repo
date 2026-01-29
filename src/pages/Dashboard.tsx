import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Calendar as CalendarIcon, Trash2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { createMockSearch } from '../lib/seed';
import { useToast } from '../contexts/ToastContext';

interface Busqueda {
    id_busqueda_n8n: string;
    titulo: string;
    estado: string;
    created_at: string;
}

export default function Dashboard() {
    const [searches, setSearches] = useState<Busqueda[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        fetchSearches();
    }, []);

    const fetchSearches = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('busquedas')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSearches(data || []);
        } catch (error) {
            console.error('Error fetching searches:', error);
            addToast('Failed to load searches', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNewSearch = () => {
        const n8nFormUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

        if (!n8nFormUrl) {
            addToast('Config error: VITE_N8N_WEBHOOK_URL not set', 'error');
            return;
        }
        window.open(n8nFormUrl, '_blank');
    };

    const handleMockSearch = async () => {
        setProcessing(true);
        try {
            const searchId = await createMockSearch();
            if (searchId) {
                await fetchSearches();
                addToast('Demo search created successfully!', 'success');
                navigate(`/search/${searchId}`);
            }
        } catch (error) {
            console.error("Demo failed", error);
            addToast('Failed to create demo search', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("Are you sure you want to delete this search? ALL DATA will be lost.")) return;

        try {
            // Manual cascade delete (just in case DB doesn't have it)
            await supabase.from('postulantes').delete().eq('id_busqueda_n8n', id);
            const { error } = await supabase.from('busquedas').delete().eq('id_busqueda_n8n', id);

            if (error) throw error;
            setSearches(prev => prev.filter(s => s.id_busqueda_n8n !== id));
            addToast('Search deleted', 'success');
        } catch (error) {
            console.error("Delete failed", error);
            addToast("Could not delete search.", 'error');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-emerald-100/70">Manage your recruitment pipelines</p>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={handleMockSearch}
                        isLoading={processing}
                        variant="ghost"
                        className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10"
                        icon={<Zap size={18} className={processing ? "animate-pulse" : ""} />}
                    >
                        Demo Search
                    </Button>

                    <Button
                        onClick={handleNewSearch}
                        icon={<Plus size={20} />}
                    >
                        New Search
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <GlassCard key={i} className="h-40 animate-pulse bg-white/5" children="" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searches.length === 0 ? (
                        <GlassCard className="col-span-full py-16 text-center text-white/50 border-dashed border-white/10">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">No active searches found.</p>
                            <p className="text-sm">Click "Demo Search" to see how it works instantly.</p>
                        </GlassCard>
                    ) : (
                        searches.map((search) => (
                            <GlassCard
                                key={search.id_busqueda_n8n}
                                className="group cursor-pointer glass-hover relative"
                                onClick={() => navigate(`/search/${search.id_busqueda_n8n}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={search.estado === 'active' ? 'success' : 'default'}>
                                        {search.estado.toUpperCase()}
                                    </Badge>

                                    <button
                                        onClick={(e) => handleDelete(e, search.id_busqueda_n8n)}
                                        className="p-2 -mr-2 -mt-2 text-white/20 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                                    {search.titulo || "Untitled Search"}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-emerald-100/60 mt-4">
                                    <CalendarIcon size={14} />
                                    <span>{format(new Date(search.created_at), 'MMM d, yyyy')}</span>
                                </div>

                                <p className="text-xs text-white/30 mt-2 font-mono truncate">
                                    ID: {search.id_busqueda_n8n}
                                </p>
                            </GlassCard>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
