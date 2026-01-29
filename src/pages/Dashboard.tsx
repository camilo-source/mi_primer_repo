import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Search, Activity, Calendar as CalendarIcon, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { seedDatabase } from '../lib/seed';

interface Busqueda {
    id_busqueda_n8n: string;
    titulo: string;
    estado: string;
    created_at: string;
}

export default function Dashboard() {
    const [searches, setSearches] = useState<Busqueda[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        } finally {
            setLoading(false);
        }
    };

    const handleNewSearch = () => {
        const n8nFormUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

        if (!n8nFormUrl) {
            alert('Config error: VITE_N8N_WEBHOOK_URL not set');
            return;
        }

        // Redirect to the n8n Form (The form handles ID generation and DB insertion)
        window.open(n8nFormUrl, '_blank');
    };

    const handleSeed = async () => {
        if (confirm("¿Estás seguro de que quieres poblar la base de datos con datos de prueba?")) {
            await seedDatabase();
            fetchSearches(); // Refresh list
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-emerald-100/70">Manage your recruitment pipelines</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSeed}
                        className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg shadow-lg transition-all active:scale-95 font-medium border border-white/10"
                        title="Seed Test Data"
                    >
                        <Database size={18} />
                        <span className="hidden sm:inline">Seed DB</span>
                    </button>

                    <button
                        onClick={handleNewSearch}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 font-medium"
                    >
                        <Plus size={20} />
                        New Search
                    </button>
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
                            <p>No active searches found. Start a new one!</p>
                        </GlassCard>
                    ) : (
                        searches.map((search) => (
                            <GlassCard
                                key={search.id_busqueda_n8n}
                                className="group cursor-pointer glass-hover"
                                onClick={() => navigate(`/search/${search.id_busqueda_n8n}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`
                    px-3 py-1 rounded-full text-xs font-medium border
                    ${search.estado === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}
                  `}>
                                        {search.estado.toUpperCase()}
                                    </div>
                                    <Activity size={18} className="text-white/40" />
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
