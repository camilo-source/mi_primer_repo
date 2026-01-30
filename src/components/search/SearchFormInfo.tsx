import { Building, Briefcase, FileText, MapPin } from 'lucide-react';
import type { SearchFormData } from '../../types/search';

interface SearchFormInfoProps {
    formData: SearchFormData;
    updateField: <K extends keyof SearchFormData>(field: K, value: SearchFormData[K]) => void;
}

export function SearchFormInfo({ formData, updateField }: SearchFormInfoProps) {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* SECCIÓN: Datos de la Empresa */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 pb-2 border-b border-white/10">
                    <Building size={20} className="text-purple-500" />
                    Datos de la Empresa
                </h2>

                {/* Empresa y Rubro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-main)]">
                            Nombre de la empresa *
                        </label>
                        <input
                            type="text"
                            value={formData.empresa}
                            onChange={(e) => updateField('empresa', e.target.value)}
                            placeholder="ej: Metanoia Tech"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-main)]">
                            Rubro / Industria
                        </label>
                        <select
                            value={formData.rubro}
                            onChange={(e) => updateField('rubro', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-purple-500/50 transition-all"
                            aria-label="Seleccionar rubro de la empresa"
                        >
                            <option value="">Seleccionar rubro...</option>
                            <option value="Tecnología">💻 Tecnología</option>
                            <option value="Fintech">💰 Fintech</option>
                            <option value="Ecommerce">🛒 E-commerce</option>
                            <option value="Marketing">📢 Marketing</option>
                            <option value="Recursos Humanos">👥 Recursos Humanos</option>
                            <option value="Salud">⚕️ Salud</option>
                            <option value="Educación">📚 Educación</option>
                            <option value="Logística">🚚 Logística</option>
                            <option value="Startup">🚀 Startup</option>
                            <option value="Consultoría">📊 Consultoría</option>
                            <option value="Otro">📌 Otro</option>
                        </select>
                    </div>
                </div>

                {/* Descripción de la empresa */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                        Descripción de la empresa
                        <span className="text-xs text-[var(--text-muted)]">(para el post de LinkedIn)</span>
                    </label>
                    <textarea
                        value={formData.descripcion_empresa}
                        onChange={(e) => updateField('descripcion_empresa', e.target.value)}
                        placeholder="Contá brevemente qué hace la empresa, su cultura, valores, etc. La IA usará esto para crear el post de LinkedIn."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    />
                </div>
            </div>

            {/* SECCIÓN: Datos del Puesto */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 pb-2 border-b border-white/10">
                    <Briefcase size={20} className="text-emerald-500" />
                    Información del Puesto
                </h2>

                {/* Title Field */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-main)]">
                        Título del puesto *
                    </label>
                    <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => updateField('titulo', e.target.value)}
                        placeholder="ej: Desarrollador Full Stack Senior"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                        <FileText size={16} className="text-emerald-500" />
                        Descripción del puesto
                    </label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => updateField('descripcion', e.target.value)}
                        placeholder="Describe las responsabilidades principales, el equipo, proyectos, etc..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    />
                </div>
            </div>

            {/* Modalidad y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-main)]">
                        <MapPin size={16} className="text-emerald-500" />
                        Modalidad
                    </label>
                    <select
                        value={formData.modalidad}
                        onChange={(e) => updateField('modalidad', e.target.value as SearchFormData['modalidad'])}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
                        aria-label="Seleccionar modalidad de trabajo"
                    >
                        <option value="remoto">🏠 Remoto</option>
                        <option value="presencial">🏢 Presencial</option>
                        <option value="hibrido">🔄 Híbrido</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-main)]">
                        Ubicación
                    </label>
                    <input
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) => updateField('ubicacion', e.target.value)}
                        placeholder="ej: Buenos Aires, Argentina"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
