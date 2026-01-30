import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import {
    ArrowLeft,
    Briefcase,
    FileText,
    Zap,
    Copy,
    ExternalLink,
    Check,
    Code,
    Clock,
    MapPin,
    DollarSign,
    Languages,
    AlertCircle,
    Star,
    X,
    Plus
} from 'lucide-react';

interface FormData {
    titulo: string;
    descripcion: string;
    habilidades_requeridas: string[];
    experiencia_minima: number;
    experiencia_maxima: number;
    modalidad: 'remoto' | 'presencial' | 'hibrido';
    ubicacion: string;
    salario_min: string;
    salario_max: string;
    moneda: string;
    idiomas: { idioma: string; nivel: string }[];
    requisitos_excluyentes: string[];
    requisitos_deseables: string[];
}

export default function SearchNew() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        titulo: '',
        descripcion: '',
        habilidades_requeridas: [],
        experiencia_minima: 0,
        experiencia_maxima: 5,
        modalidad: 'remoto',
        ubicacion: '',
        salario_min: '',
        salario_max: '',
        moneda: 'USD',
        idiomas: [],
        requisitos_excluyentes: [],
        requisitos_deseables: []
    });

    // Estado para inputs temporales
    const [newSkill, setNewSkill] = useState('');
    const [newReqExcluyente, setNewReqExcluyente] = useState('');
    const [newReqDeseable, setNewReqDeseable] = useState('');
    const [newIdioma, setNewIdioma] = useState({ idioma: '', nivel: 'B1' });

    // Estado post-creación
    const [createdSearch, setCreatedSearch] = useState<{
        id: string;
        n8nUrl: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    // Handlers para arrays
    const addSkill = () => {
        if (newSkill.trim() && !formData.habilidades_requeridas.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                habilidades_requeridas: [...prev.habilidades_requeridas, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            habilidades_requeridas: prev.habilidades_requeridas.filter(s => s !== skill)
        }));
    };

    const addReqExcluyente = () => {
        if (newReqExcluyente.trim() && !formData.requisitos_excluyentes.includes(newReqExcluyente.trim())) {
            setFormData(prev => ({
                ...prev,
                requisitos_excluyentes: [...prev.requisitos_excluyentes, newReqExcluyente.trim()]
            }));
            setNewReqExcluyente('');
        }
    };

    const removeReqExcluyente = (req: string) => {
        setFormData(prev => ({
            ...prev,
            requisitos_excluyentes: prev.requisitos_excluyentes.filter(r => r !== req)
        }));
    };

    const addReqDeseable = () => {
        if (newReqDeseable.trim() && !formData.requisitos_deseables.includes(newReqDeseable.trim())) {
            setFormData(prev => ({
                ...prev,
                requisitos_deseables: [...prev.requisitos_deseables, newReqDeseable.trim()]
            }));
            setNewReqDeseable('');
        }
    };

    const removeReqDeseable = (req: string) => {
        setFormData(prev => ({
            ...prev,
            requisitos_deseables: prev.requisitos_deseables.filter(r => r !== req)
        }));
    };

    const addIdioma = () => {
        if (newIdioma.idioma.trim()) {
            setFormData(prev => ({
                ...prev,
                idiomas: [...prev.idiomas, { ...newIdioma, idioma: newIdioma.idioma.trim() }]
            }));
            setNewIdioma({ idioma: '', nivel: 'B1' });
        }
    };

    const removeIdioma = (idioma: string) => {
        setFormData(prev => ({
            ...prev,
            idiomas: prev.idiomas.filter(i => i.idioma !== idioma)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar URL de n8n
        const n8nBaseUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
        if (!n8nBaseUrl) {
            addToast('❌ Error: URL de n8n no configurada. Contactá al administrador.', 'error');
            return;
        }

        if (!formData.titulo.trim()) {
            addToast('El título es requerido', 'error');
            setCurrentStep(1);
            return;
        }

        if (formData.habilidades_requeridas.length === 0) {
            addToast('Agregá al menos una habilidad técnica requerida', 'error');
            setCurrentStep(2);
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

            // Generar UUID único para la búsqueda
            const searchId = crypto.randomUUID();

            // Convertir idiomas a JSON
            const idiomasJson: Record<string, string> = {};
            formData.idiomas.forEach(i => {
                idiomasJson[i.idioma.toLowerCase()] = i.nivel;
            });

            const { error } = await supabase
                .from('busquedas')
                .insert({
                    id_busqueda_n8n: searchId,
                    user_id: user.id,
                    titulo: formData.titulo.trim(),
                    descripcion: formData.descripcion.trim() || null,
                    habilidades_requeridas: formData.habilidades_requeridas.length > 0 ? formData.habilidades_requeridas : null,
                    experiencia_minima: formData.experiencia_minima,
                    experiencia_maxima: formData.experiencia_maxima,
                    modalidad: formData.modalidad,
                    ubicacion: formData.ubicacion.trim() || null,
                    salario_min: formData.salario_min ? parseInt(formData.salario_min) : null,
                    salario_max: formData.salario_max ? parseInt(formData.salario_max) : null,
                    moneda: formData.moneda,
                    idiomas: Object.keys(idiomasJson).length > 0 ? idiomasJson : null,
                    requisitos_excluyentes: formData.requisitos_excluyentes.length > 0 ? formData.requisitos_excluyentes : null,
                    requisitos_deseables: formData.requisitos_deseables.length > 0 ? formData.requisitos_deseables : null,
                    estado: 'active'
                });

            if (error) throw error;

            // Construir URL de n8n con el ID
            const n8nBaseUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
            const n8nUrl = n8nBaseUrl ? `${n8nBaseUrl}?id_busqueda_n8n=${searchId}` : '';

            addToast('¡Búsqueda creada exitosamente!', 'success');

            // Mostrar el panel de confirmación con el link
            setCreatedSearch({
                id: searchId,
                n8nUrl: n8nUrl
            });

        } catch (error) {
            console.error('Error creating search:', error);
            addToast('Error al crear la búsqueda', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!createdSearch?.n8nUrl) return;

        try {
            await navigator.clipboard.writeText(createdSearch.n8nUrl);
            setCopied(true);
            addToast('Link copiado al portapapeles', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast('Error al copiar', 'error');
        }
    };

    const handleOpenN8n = () => {
        if (createdSearch?.n8nUrl) {
            window.open(createdSearch.n8nUrl, '_blank');
        }
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    const handleGoToSearch = () => {
        if (createdSearch?.id) {
            navigate(`/search/${createdSearch.id}`);
        }
    };

    // Helper components
    const TagInput = ({
        tags,
        onAdd,
        onRemove,
        value,
        onChange,
        placeholder,
        color = 'emerald'
    }: {
        tags: string[];
        onAdd: () => void;
        onRemove: (tag: string) => void;
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
        color?: 'emerald' | 'red' | 'amber';
    }) => {
        const colorClasses = {
            emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            red: 'bg-red-500/20 text-red-400 border-red-500/30',
            amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        };

        return (
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={onAdd} icon={<Plus size={14} />}>
                        Agregar
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span
                                key={tag}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}`}
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => onRemove(tag)}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Vista de confirmación post-creación
    if (createdSearch) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                {/* Success Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                        <Check className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">¡Búsqueda Creada!</h1>
                    <p className="text-[var(--text-muted)]">
                        Tu búsqueda <strong className="text-emerald-500">"{formData.titulo}"</strong> ha sido creada exitosamente.
                    </p>
                </div>

                {/* ID Card */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-emerald-500/5 rounded-full blur-3xl" />

                    <div className="relative space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                            <Zap size={16} className="text-purple-500" />
                            ID de la Búsqueda
                        </div>

                        <div className="p-4 rounded-xl bg-black/20 border border-white/10 font-mono text-sm text-emerald-400 break-all">
                            {createdSearch.id}
                        </div>

                        <p className="text-xs text-[var(--text-muted)]">
                            Este ID identifica tu búsqueda y vincula los candidatos que se postulen.
                        </p>
                    </div>
                </GlassCard>

                {/* n8n Link Card */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl" />

                    <div className="relative space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                            <ExternalLink size={16} className="text-blue-500" />
                            Link del Formulario n8n
                        </div>

                        {createdSearch.n8nUrl ? (
                            <>
                                <div className="p-4 rounded-xl bg-black/20 border border-white/10 font-mono text-xs text-blue-400 break-all">
                                    {createdSearch.n8nUrl}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleCopyLink}
                                        variant="secondary"
                                        icon={copied ? <Check size={16} /> : <Copy size={16} />}
                                        className="flex-1"
                                    >
                                        {copied ? 'Copiado!' : 'Copiar Link'}
                                    </Button>
                                    <Button
                                        onClick={handleOpenN8n}
                                        icon={<ExternalLink size={16} />}
                                        className="flex-1"
                                    >
                                        Abrir Formulario
                                    </Button>
                                </div>

                                <p className="text-xs text-[var(--text-muted)]">
                                    Compartí este link con los candidatos o usalo para iniciar el flujo de postulación en n8n.
                                </p>
                            </>
                        ) : (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                                ⚠️ URL de n8n no configurada. Agregá <code>VITE_N8N_WEBHOOK_URL</code> en tu archivo .env
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleGoToDashboard}
                        className="flex-1"
                    >
                        Ir al Panel de Control
                    </Button>
                    <Button
                        onClick={handleGoToSearch}
                        className="flex-1"
                    >
                        Ver Búsqueda
                    </Button>
                </div>
            </div>
        );
    }

    // Formulario de creación con pasos
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    aria-label="Volver al dashboard"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Nueva Búsqueda</h1>
                    <p className="text-[var(--text-muted)]">Definí los requisitos del puesto para que la IA califique correctamente</p>
                </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map(step => (
                    <button
                        key={step}
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === step
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'
                            }`}
                    >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === step ? 'bg-emerald-500 text-white' : 'bg-white/10'
                            }`}>
                            {step}
                        </span>
                        <span className="hidden sm:inline text-sm font-medium">
                            {step === 1 && 'Información'}
                            {step === 2 && 'Requisitos'}
                            {step === 3 && 'Detalles'}
                        </span>
                    </button>
                ))}
            </div>

            {/* Form Card */}
            <GlassCard className="relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <form onSubmit={handleSubmit} className="relative space-y-6">

                    {/* STEP 1: Información Básica */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
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
                                    Descripción del puesto
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                    placeholder="Describe las responsabilidades principales, el equipo, proyectos, etc..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                                />
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, modalidad: e.target.value as FormData['modalidad'] }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                                        placeholder="ej: Buenos Aires, Argentina"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Requisitos Técnicos */}
                    {currentStep === 2 && (
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
                                        <label className="text-xs text-[var(--text-muted)]">Mínimo</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={formData.experiencia_minima}
                                            onChange={(e) => setFormData(prev => ({ ...prev, experiencia_minima: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                    <span className="text-[var(--text-muted)]">a</span>
                                    <div className="flex-1">
                                        <label className="text-xs text-[var(--text-muted)]">Máximo</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            value={formData.experiencia_maxima}
                                            onChange={(e) => setFormData(prev => ({ ...prev, experiencia_maxima: parseInt(e.target.value) || 0 }))}
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
                    )}

                    {/* STEP 3: Detalles Adicionales */}
                    {currentStep === 3 && (
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, moneda: e.target.value }))}
                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="ARS">ARS</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={formData.salario_min}
                                        onChange={(e) => setFormData(prev => ({ ...prev, salario_min: e.target.value }))}
                                        placeholder="Mínimo"
                                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                    <span className="text-[var(--text-muted)]">a</span>
                                    <input
                                        type="number"
                                        value={formData.salario_max}
                                        onChange={(e) => setFormData(prev => ({ ...prev, salario_max: e.target.value }))}
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
                                        onChange={(e) => setNewIdioma(prev => ({ ...prev, idioma: e.target.value }))}
                                        placeholder="ej: Inglés"
                                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    />
                                    <select
                                        value={newIdioma.nivel}
                                        onChange={(e) => setNewIdioma(prev => ({ ...prev, nivel: e.target.value }))}
                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-main)] focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
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
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                        <div>
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                >
                                    ← Anterior
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancelar
                            </Button>

                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                >
                                    Siguiente →
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    icon={<Zap size={18} />}
                                >
                                    Crear Búsqueda
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
