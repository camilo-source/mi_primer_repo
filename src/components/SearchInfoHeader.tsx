import { ChevronDown, ChevronUp, Code, Clock, MapPin, DollarSign, Languages, Briefcase, LayoutGrid, List } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useState } from 'react';

interface BusquedaInfo {
    titulo: string;
    estado: string;
    descripcion?: string;
    habilidades_requeridas?: string[];
    experiencia_minima?: number;
    experiencia_maxima?: number;
    modalidad?: string;
    ubicacion?: string;
    salario_min?: number;
    salario_max?: number;
    moneda?: string;
    idiomas?: Record<string, string>;
    requisitos_excluyentes?: string[];
    requisitos_deseables?: string[];
}

interface SearchInfoHeaderProps {
    id: string | undefined;
    searchInfo: BusquedaInfo | null;
    viewMode: 'table' | 'kanban';
    setViewMode: (mode: 'table' | 'kanban') => void;
    onSearch: (query: string) => void;
    isSearching: boolean;
}

export function SearchInfoHeader({ id, searchInfo, viewMode, setViewMode, onSearch, isSearching }: SearchInfoHeaderProps) {
    const [showRequirements, setShowRequirements] = useState(false);

    return (
        <GlassCard className="relative overflow-hidden w-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-8">
                    <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">{searchInfo?.titulo}</h1>
                    <p className="text-[var(--text-muted)] font-mono text-sm mb-4">ID: {id}</p>

                    {/* 🔍 Semantic Search Bar */}
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors">
                            {isSearching ? (
                                <div className="animate-spin h-5 w-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" />
                            ) : (
                                <div className="h-2 w-2 rounded-full bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="✨ Búsqueda Semántica: 'Experto en React que sepa liderar'..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all font-medium backdrop-blur-sm"
                            onChange={(e) => onSearch(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono border border-white/5 px-2 py-0.5 rounded">
                            AI POWERED
                        </div>
                    </div>

                    {searchInfo?.descripcion && (
                        <p className="text-[var(--text-muted)] mt-4 max-w-2xl line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                            {searchInfo.descripcion}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex bg-[var(--card-bg)] rounded-lg p-1 border border-[var(--card-border)]">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'kanban'
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'text-[var(--text-muted)] hover:text-emerald-500'
                                }`}
                            title="Vista Kanban"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table'
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'text-[var(--text-muted)] hover:text-emerald-500'
                                }`}
                            title="Vista Tabla"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <div className="px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                        {searchInfo?.estado === 'active' ? 'ACTIVO' : searchInfo?.estado.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Perfil del Puesto - Colapsable */}
            {(searchInfo?.habilidades_requeridas?.length || searchInfo?.idiomas) && (
                <div className="border-t border-[var(--card-border)] pt-4 mt-4">
                    <button
                        onClick={() => setShowRequirements(!showRequirements)}
                        className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-emerald-500 transition-colors w-full justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <Briefcase size={16} />
                            Perfil del Puesto
                        </span>
                        {showRequirements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showRequirements && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-fade-in">
                            {/* Habilidades Técnicas */}
                            {searchInfo?.habilidades_requeridas && searchInfo.habilidades_requeridas.length > 0 && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <Code size={12} className="text-emerald-500" />
                                        Habilidades Técnicas
                                    </label>
                                    <div className="flex flex-wrap gap-1">
                                        {searchInfo.habilidades_requeridas.map(skill => (
                                            <span key={skill} className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experiencia */}
                            {(searchInfo?.experiencia_minima !== undefined || searchInfo?.experiencia_maxima !== undefined) && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <Clock size={12} className="text-emerald-500" />
                                        Experiencia
                                    </label>
                                    <p className="text-sm text-[var(--text-main)]">
                                        {searchInfo?.experiencia_minima || 0} - {searchInfo?.experiencia_maxima || 10} años
                                    </p>
                                </div>
                            )}

                            {/* Modalidad */}
                            {searchInfo?.modalidad && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <MapPin size={12} className="text-emerald-500" />
                                        Modalidad
                                    </label>
                                    <p className="text-sm text-[var(--text-main)] capitalize">
                                        {searchInfo.modalidad === 'remoto' && '🏠 Remoto'}
                                        {searchInfo.modalidad === 'presencial' && '🏢 Presencial'}
                                        {searchInfo.modalidad === 'hibrido' && '🔄 Híbrido'}
                                    </p>
                                </div>
                            )}

                            {/* Ubicación */}
                            {searchInfo?.ubicacion && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <MapPin size={12} className="text-purple-500" />
                                        Ubicación
                                    </label>
                                    <p className="text-sm text-[var(--text-main)]">{searchInfo.ubicacion}</p>
                                </div>
                            )}

                            {/* Salario */}
                            {(searchInfo?.salario_min || searchInfo?.salario_max) && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <DollarSign size={12} className="text-emerald-500" />
                                        Rango Salarial
                                    </label>
                                    <p className="text-sm text-[var(--text-main)]">
                                        {searchInfo.moneda} {searchInfo.salario_min?.toLocaleString()} - {searchInfo.salario_max?.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Idiomas */}
                            {searchInfo?.idiomas && Object.keys(searchInfo.idiomas).length > 0 && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                                        <Languages size={12} className="text-blue-500" />
                                        Idiomas
                                    </label>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(searchInfo.idiomas).map(([idioma, nivel]) => (
                                            <span key={idioma} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
                                                {idioma} ({nivel})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
