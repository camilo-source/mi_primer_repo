import { Code, Clock, AlertCircle, Star } from 'lucide-react';
import type { SearchFormData } from '../../types/search';
import { TagInput } from './TagInput';

interface SearchFormRequirementsProps {
    formData: SearchFormData;
    updateField: <K extends keyof SearchFormData>(field: K, value: SearchFormData[K]) => void;
    // Skill handlers
    newSkill: string;
    setNewSkill: (value: string) => void;
    addSkill: () => void;
    removeSkill: (skill: string) => void;
    // Requirement handlers
    newReqExcluyente: string;
    setNewReqExcluyente: (value: string) => void;
    addReqExcluyente: () => void;
    removeReqExcluyente: (req: string) => void;
    newReqDeseable: string;
    setNewReqDeseable: (value: string) => void;
    addReqDeseable: () => void;
    removeReqDeseable: (req: string) => void;
}

export function SearchFormRequirements({
    formData,
    updateField,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    newReqExcluyente,
    setNewReqExcluyente,
    addReqExcluyente,
    removeReqExcluyente,
    newReqDeseable,
    setNewReqDeseable,
    addReqDeseable,
    removeReqDeseable
}: SearchFormRequirementsProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <Code size={20} className="text-emerald-500" />
                Requisitos Técnicos
            </h2>

            {/* Habilidades Técnicas */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Code size={16} className="text-emerald-500" />
                    Habilidades Técnicas Requeridas
                </label>
                <TagInput
                    tags={formData.habilidades_requeridas}
                    onAdd={addSkill}
                    onRemove={removeSkill}
                    value={newSkill}
                    onChange={setNewSkill}
                    placeholder="ej: React, Node.js, TypeScript..."
                    color="emerald"
                />
            </div>

            {/* Experiencia */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Clock size={16} className="text-emerald-500" />
                    Experiencia (años)
                </label>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label htmlFor="exp-min" className="text-xs text-[var(--text-muted)]">Mínimo</label>
                        <input
                            id="exp-min"
                            type="number"
                            min="0"
                            max="20"
                            value={formData.experiencia_minima}
                            onChange={(e) => updateField('experiencia_minima', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                    <span className="text-[var(--text-muted)]">a</span>
                    <div className="flex-1">
                        <label htmlFor="exp-max" className="text-xs text-[var(--text-muted)]">Máximo</label>
                        <input
                            id="exp-max"
                            type="number"
                            min="0"
                            max="30"
                            value={formData.experiencia_maxima}
                            onChange={(e) => updateField('experiencia_maxima', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Requisitos Excluyentes */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <AlertCircle size={16} className="text-red-500" />
                    Requisitos Excluyentes
                    <span className="text-xs text-red-400 font-normal">(DEBE cumplir)</span>
                </label>
                <TagInput
                    tags={formData.requisitos_excluyentes}
                    onAdd={addReqExcluyente}
                    onRemove={removeReqExcluyente}
                    value={newReqExcluyente}
                    onChange={setNewReqExcluyente}
                    placeholder="ej: Título universitario, Inglés avanzado..."
                    color="red"
                />
            </div>

            {/* Requisitos Deseables */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                    <Star size={16} className="text-amber-500" />
                    Requisitos Deseables
                    <span className="text-xs text-amber-400 font-normal">(Nice to have)</span>
                </label>
                <TagInput
                    tags={formData.requisitos_deseables}
                    onAdd={addReqDeseable}
                    onRemove={removeReqDeseable}
                    value={newReqDeseable}
                    onChange={setNewReqDeseable}
                    placeholder="ej: Experiencia en startups, Conocimiento de AWS..."
                    color="amber"
                />
            </div>
        </div>
    );
}
