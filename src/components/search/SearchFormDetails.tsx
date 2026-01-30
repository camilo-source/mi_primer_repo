import { DollarSign, Languages, Zap, Plus, X } from 'lucide-react';
import type { SearchFormData, IdiomaEntry } from '../../types/search';
import { Button } from '../ui/Button';

interface SearchFormDetailsProps {
    formData: SearchFormData;
    updateField: <K extends keyof SearchFormData>(field: K, value: SearchFormData[K]) => void;
    // Idioma handlers
    newIdioma: IdiomaEntry;
    setNewIdioma: (value: IdiomaEntry) => void;
    addIdioma: () => void;
    removeIdioma: (idioma: string) => void;
}

export function SearchFormDetails({
    formData,
    updateField,
    newIdioma,
    setNewIdioma,
    addIdioma,
    removeIdioma
}: SearchFormDetailsProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-500" />
                Detalles Adicionales
            </h2>

            {/* Salario */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <DollarSign size={16} className="text-emerald-500" />
                    Rango Salarial (opcional)
                </label>
                <div className="flex items-center gap-4">
                    <select
                        value={formData.moneda}
                        onChange={(e) => updateField('moneda', e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
                        aria-label="Seleccionar moneda"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="ARS">ARS</option>
                    </select>
                    <input
                        type="number"
                        value={formData.salario_min}
                        onChange={(e) => updateField('salario_min', e.target.value)}
                        placeholder="Mínimo"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <span className="text-[var(--text-muted)]">a</span>
                    <input
                        type="number"
                        value={formData.salario_max}
                        onChange={(e) => updateField('salario_max', e.target.value)}
                        placeholder="Máximo"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Idiomas */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Languages size={16} className="text-emerald-500" />
                    Idiomas Requeridos
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newIdioma.idioma}
                        onChange={(e) => setNewIdioma({ ...newIdioma, idioma: e.target.value })}
                        placeholder="ej: Inglés"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                    <select
                        value={newIdioma.nivel}
                        onChange={(e) => setNewIdioma({ ...newIdioma, nivel: e.target.value })}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        aria-label="Seleccionar nivel de idioma"
                    >
                        <option value="A1">A1 - Básico</option>
                        <option value="A2">A2 - Elemental</option>
                        <option value="B1">B1 - Intermedio</option>
                        <option value="B2">B2 - Intermedio Alto</option>
                        <option value="C1">C1 - Avanzado</option>
                        <option value="C2">C2 - Nativo</option>
                    </select>
                    <Button type="button" size="sm" variant="secondary" onClick={addIdioma} icon={<Plus size={14} />}>
                        Agregar
                    </Button>
                </div>
                {formData.idiomas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.idiomas.map(i => (
                            <span
                                key={i.idioma}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30"
                            >
                                {i.idioma} ({i.nivel})
                                <button
                                    type="button"
                                    onClick={() => removeIdioma(i.idioma)}
                                    className="hover:opacity-70 transition-opacity"
                                    aria-label={`Quitar idioma ${i.idioma}`}
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-start gap-3">
                    <Zap size={20} className="text-purple-500 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-[var(--text-main)] font-medium mb-1">IA Contextual</p>
                        <p className="text-[var(--text-muted)]">
                            Estos requisitos serán usados por la IA para calificar los CVs de manera precisa y contextual.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
