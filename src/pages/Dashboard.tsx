import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchBar } from '../components/ui/SearchBar';

import { Plus, Search, Calendar as CalendarIcon, Trash2, Zap, ChevronDown, Database, Users, Mail, Star, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { createDemoSearch, getDemoConfigs, type DemoType } from '../lib/seed';
import { useToast } from '../contexts/ToastContext';

interface Busqueda {
    id_busqueda_n8n: string;
    titulo: string;
    estado: string;
    created_at: string;
    favorito?: boolean;
}

type SortOrder = 'recent' | 'oldest' | 'favorites';

export default function Dashboard() {
    const [searches, setSearches] = useState<Busqueda[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showDemoMenu, setShowDemoMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        fetchSearches();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowDemoMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate filtered and sorted searches
    const filteredSearches = useMemo(() => {
        let result = searches.filter(search => {
            // Filter by search query (title)
            return search.titulo
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        });

        // Sort based on sortOrder
        if (sortOrder === 'recent') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortOrder === 'oldest') {
            result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (sortOrder === 'favorites') {
            result.sort((a, b) => {
                if (a.favorito && !b.favorito) return -1;
                if (!a.favorito && b.favorito) return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }

        return result;
    }, [searches, searchQuery, sortOrder]);



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
            addToast('Error al cargar búsquedas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNewSearch = () => {
        navigate('/search/new');
    };

    const handleCreateDemo = async (demoType: DemoType) => {
        setProcessing(true);
        setShowDemoMenu(false);

        try {
            const searchId = await createDemoSearch(demoType);
            if (searchId) {
                await fetchSearches();

                const demoLabels = {
                    'empty': 'Búsqueda vacía',
                    'engineers': 'Demo Ingenieros',
                    'real_contacts': 'Contactos reales'
                };

                addToast(`¡${demoLabels[demoType]} creada!`, 'success');
                navigate(`/search/${searchId}`);
            }
        } catch (error) {
            console.error("Demo failed", error);
            addToast('Error al crear búsqueda demo', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        try {
            // Check if there are any confirmed candidates
            const { data: confirmedCandidates, error: checkError } = await supabase
                .from('postulantes')
                .select('id, nombre')
                .eq('id_busqueda_n8n', id)
                .eq('estado_agenda', 'confirmed');

            if (checkError) throw checkError;

            if (confirmedCandidates && confirmedCandidates.length > 0) {
                addToast(
                    `❌ No se puede eliminar: hay ${confirmedCandidates.length} candidato(s) con entrevista confirmada`,
                    'error'
                );
                return;
            }

            // Proceed with deletion if no confirmed candidates
            if (!confirm("¿Estás seguro? Se perderán TODOS los datos de esta búsqueda.")) return;

            await supabase.from('postulantes').delete().eq('id_busqueda_n8n', id);
            const { error } = await supabase.from('busquedas').delete().eq('id_busqueda_n8n', id);

            if (error) throw error;
            setSearches(prev => prev.filter(s => s.id_busqueda_n8n !== id));
            addToast('Búsqueda eliminada', 'success');
        } catch (error) {
            console.error("Delete failed", error);
            addToast("No se pudo eliminar la búsqueda", 'error');
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const search = searches.find(s => s.id_busqueda_n8n === id);
        if (!search) return;

        const newValue = !search.favorito;

        try {
            const { error } = await supabase
                .from('busquedas')
                .update({ favorito: newValue })
                .eq('id_busqueda_n8n', id);

            if (error) throw error;

            setSearches(prev => prev.map(s =>
                s.id_busqueda_n8n === id ? { ...s, favorito: newValue } : s
            ));
        } catch (error) {
            console.error("Toggle favorite failed", error);
            addToast("Error al actualizar favorito", 'error');
        }
    };

    const demoConfigs = getDemoConfigs();

    const demoIcons = {
        'empty': <Database size={16} />,
        'engineers': <Users size={16} />,
        'real_contacts': <Mail size={16} />
    };

    return (
        <div className="space-y-8">
            {/* Header with animations */}
            <div className="space-y-4 animate-apple-slide-down">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">Panel de Control</h1>
                        <p className="text-[var(--text-muted)]">Gestioná tus procesos de reclutamiento</p>
                    </div>

                    <div className="flex gap-3">
                        {/* Demo Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <Button
                                onClick={() => setShowDemoMenu(!showDemoMenu)}
                                isLoading={processing}
                                variant="ghost"
                                className="text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 hover:bg-purple-500/10"
                                icon={<Zap size={18} className={processing ? "animate-pulse" : ""} />}
                            >
                                Demo
                                <ChevronDown size={16} className={`ml-1 transition-transform ${showDemoMenu ? 'rotate-180' : ''}`} />
                            </Button>

                            {/* Dropdown Menu */}
                            {showDemoMenu && (
                                <div className="absolute right-0 mt-2 w-72 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xl shadow-xl z-50">
                                    <div className="px-4 py-2 border-b border-[var(--card-border)]">
                                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                            Selecciona tipo de demo
                                        </p>
                                    </div>
                                    {demoConfigs.map((config) => (
                                        <button
                                            key={config.id}
                                            onClick={() => handleCreateDemo(config.id)}
                                            className="w-full px-4 py-3 text-left hover:bg-emerald-500/10 transition-colors flex items-start gap-3"
                                        >
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                                                {demoIcons[config.id]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--text-main)]">{config.title}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{config.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleNewSearch}
                            icon={<Plus size={20} />}
                        >
                            Nueva Búsqueda
                        </Button>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Buscar búsquedas por título..."
                        className="flex-1"
                    />

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                const orders: SortOrder[] = ['recent', 'oldest', 'favorites'];
                                const currentIndex = orders.indexOf(sortOrder);
                                const nextIndex = (currentIndex + 1) % orders.length;
                                setSortOrder(orders[nextIndex]);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] text-sm hover:border-emerald-500/50 transition-colors"
                            title="Cambiar ordenamiento"
                        >
                            <ArrowUpDown size={16} className="text-purple-500" />
                            <span className="hidden sm:inline">
                                {sortOrder === 'recent' && 'Más recientes'}
                                {sortOrder === 'oldest' && 'Más antiguas'}
                                {sortOrder === 'favorites' && '⭐ Favoritos'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Results Counter */}
                {searchQuery && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span>
                            Mostrando <span className="font-bold text-emerald-500">{filteredSearches.length}</span> de {searches.length} búsquedas
                        </span>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-purple-500 hover:text-purple-400 underline"
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <GlassCard key={i} className="h-40 animate-pulse bg-[var(--card-bg)]" children="" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searches.length === 0 ? (
                        <GlassCard className="col-span-full py-16 text-center text-[var(--text-muted)] border-dashed">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">No hay búsquedas activas</p>
                            <p className="text-sm mb-6">Hacé click en "Demo" para ver las opciones disponibles.</p>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleCreateDemo('real_contacts')}
                                    icon={<Mail size={16} />}
                                >
                                    Demo Contactos Reales
                                </Button>
                            </div>
                        </GlassCard>
                    ) : filteredSearches.length === 0 ? (
                        <GlassCard className="col-span-full py-16 text-center text-[var(--text-muted)] border-dashed">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
                            <p className="text-lg mb-2">No se encontraron búsquedas</p>
                            <p className="text-sm mb-6">
                                No hay resultados para "{searchQuery}"
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                            >
                                Limpiar búsqueda
                            </Button>
                        </GlassCard>
                    ) : (
                        filteredSearches.map((search) => (
                            <GlassCard
                                key={search.id_busqueda_n8n}
                                className="group cursor-pointer glass-hover relative animate-scale-in"
                                onClick={() => navigate(`/search/${search.id_busqueda_n8n}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={search.estado === 'active' ? 'success' : 'default'}>
                                        {search.estado === 'active' ? 'ACTIVO' : search.estado.toUpperCase()}
                                    </Badge>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleToggleFavorite(e, search.id_busqueda_n8n)}
                                            className={`p-2 -mt-2 rounded-full transition-all z-10 ${search.favorito
                                                ? 'text-yellow-500 hover:text-yellow-600'
                                                : 'text-[var(--text-muted)] hover:text-yellow-500 hover:bg-yellow-500/10'
                                                }`}
                                            aria-label={search.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                                            title={search.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                                        >
                                            <Star size={16} fill={search.favorito ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, search.id_busqueda_n8n)}
                                            className="p-2 -mr-2 -mt-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10"
                                            aria-label="Eliminar búsqueda"
                                            title="Eliminar búsqueda"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2 line-clamp-1">
                                    {search.titulo || "Sin título"}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mt-4">
                                    <CalendarIcon size={14} />
                                    <span>{format(new Date(search.created_at), 'MMM d, yyyy')}</span>
                                </div>

                                <p className="text-xs text-[var(--text-muted)] opacity-50 mt-2 font-mono truncate">
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
