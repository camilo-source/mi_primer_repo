import { Code, Globe, MapPin, Briefcase, Star } from 'lucide-react';
import type { SearchFormData, IdiomaEntry } from '../../types/search';
import { TagInput } from './TagInput';

interface SearchFormCombinedProps {
    formData: SearchFormData;
    updateField: <K extends keyof SearchFormData>(field: K, value: SearchFormData[K]) => void;
    // Skill handlers
    newSkill: string;
    setNewSkill: (value: string) => void;
    addSkill: () => void;
    removeSkill: (skill: string) => void;
    // Soft skill handlers
    newSoftSkill: string;
    setNewSoftSkill: (value: string) => void;
    addSoftSkill: () => void;
    removeSoftSkill: (skill: string) => void;
    // Idioma handlers
    newIdioma: IdiomaEntry;
    setNewIdioma: (value: IdiomaEntry) => void;
    addIdioma: () => void;
    removeIdioma: (idioma: string) => void;
}

export function SearchFormCombined({
    formData,
    updateField,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    newSoftSkill,
    setNewSoftSkill,
    addSoftSkill,
    removeSoftSkill,
    newIdioma,
    setNewIdioma,
    addIdioma,
    removeIdioma
}: SearchFormCombinedProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <Star size={20} className="text-emerald-500" />
                Perfil del Candidato
            </h2>

            {/* Habilidades Técnicas */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Code size={16} className="text-emerald-500" />
                    Habilidades Técnicas
                </label>
                <TagInput
                    tags={formData.habilidades_requeridas}
                    onAdd={addSkill}
                    onRemove={removeSkill}
                    value={newSkill}
                    onChange={setNewSkill}
                    placeholder="Ej: React, Python, SQL..."
                    color="emerald"
                />
            </div>

            {/* Habilidades Blandas */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Star size={16} className="text-amber-500" />
                    Habilidades Blandas
                </label>
                <TagInput
                    tags={formData.habilidades_blandas}
                    onAdd={addSoftSkill}
                    onRemove={removeSoftSkill}
                    value={newSoftSkill}
                    onChange={setNewSoftSkill}
                    placeholder="Ej: Liderazgo, Comunicación..."
                    color="amber"
                />
            </div>

            {/* Experiencia */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Briefcase size={16} className="text-purple-500" />
                    Experiencia Previa (años)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="exp-min" className="text-xs text-[var(--text-muted)] mb-1 block">Mínimo</label>
                        <input
                            id="exp-min"
                            type="number"
                            min="0"
                            value={formData.experiencia_minima}
                            onChange={(e) => updateField('experiencia_minima', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="exp-max" className="text-xs text-[var(--text-muted)] mb-1 block">Máximo</label>
                        <input
                            id="exp-max"
                            type="number"
                            min="0"
                            value={formData.experiencia_maxima}
                            onChange={(e) => updateField('experiencia_maxima', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Idiomas */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Globe size={16} className="text-blue-500" />
                    Idiomas Requeridos
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newIdioma.idioma}
                        onChange={(e) => setNewIdioma({ ...newIdioma, idioma: e.target.value })}
                        placeholder="Ej: Inglés"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                    <select
                        value={newIdioma.nivel}
                        onChange={(e) => setNewIdioma({ ...newIdioma, nivel: e.target.value })}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                        aria-label="Seleccionar nivel de idioma"
                    >
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                        <option value="Nativo">Nativo</option>
                    </select>
                    <Button type="button" size="sm" variant="secondary" onClick={addIdioma}>
                        Agregar
                    </Button>
                </div>
                {formData.idiomas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.idiomas.map((i) => (
                            <span
                                key={i.idioma}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30"
                            >
                                {i.idioma} {i.nivel}
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

            {/* Modalidad */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Briefcase size={16} className="text-cyan-500" />
                    Modalidad de Trabajo
                </label>
                <select
                    value={formData.modalidad}
                    onChange={(e) => updateField('modalidad', e.target.value as SearchFormData['modalidad'])}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    aria-label="Seleccionar modalidad de trabajo"
                >
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                </select>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
                <label htmlFor="ubicacion" className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <MapPin size={16} className="text-red-500" />
                    Ubicación
                </label>
                <input
                    id="ubicacion"
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => updateField('ubicacion', e.target.value)}
                    placeholder="Ej: Buenos Aires, Argentina"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
            </div>

            {/* Extras */}
            <div className="space-y-2">
                <label htmlFor="extras" className="text-sm font-medium text-[var(--text-main)]">
                    Información Adicional
                </label>
                <textarea
                    id="extras"
                    value={formData.extras}
                    onChange={(e) => updateField('extras', e.target.value)}
                    placeholder="Beneficios, horarios, cultura de la empresa..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm resize-none"
                />
            </div>
        </div>
    );
}

// Import Button and X from lucide-react
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
