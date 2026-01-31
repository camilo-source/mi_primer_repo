import { ArrowLeft, Zap, AlertTriangle, Beaker } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useSearchForm } from '../hooks/useSearchForm';
import {
    SearchFormInfo,
    SearchFormCombined,
    SearchSuccess,
    SearchChannelSelector
} from '../components/search';
import { useState } from 'react';

export default function SearchNew() {
    const {
        // State
        loading,
        statusMessage,
        currentStep,
        formData,
        createdSearch,
        // Setters
        setCurrentStep,
        updateField,
        updateChannels,
        loadDemoData,
        // Skill handlers
        newSkill,
        setNewSkill,
        addSkill,
        removeSkill,
        newSoftSkill,
        setNewSoftSkill,
        addSoftSkill,
        removeSoftSkill,
        // Idioma handlers
        newIdioma,
        setNewIdioma,
        addIdioma,
        removeIdioma,
        // Submit
        handleSubmit,
        // Navigation
        navigate
    } = useSearchForm();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Handle form submission - only on step 3
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submission if not on last step
        if (currentStep < 3) {
            return;
        }

        // Show confirmation dialog on last step
        setShowConfirmDialog(true);
    };

    // Confirm and create search
    const confirmAndCreate = async () => {
        setShowConfirmDialog(false);
        const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
        await handleSubmit(fakeEvent);
    };

    // Success view after creation
    if (createdSearch) {
        return (
            <SearchSuccess
                createdSearch={createdSearch}
                formData={formData}
                onGoToDashboard={() => navigate('/dashboard')}
                onGoToSearch={() => navigate(`/search/${createdSearch.id}`)}
            />
        );
    }

    // Multi-step form (3 steps now)
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
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

                <button
                    onClick={loadDemoData}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all border border-indigo-500/20 hover:border-indigo-500/40"
                    title="Cargar datos de prueba"
                >
                    <Beaker size={18} />
                    <span className="text-sm font-medium">Demo</span>
                </button>
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
                            {step === 2 && 'Perfil del Candidato'}
                            {step === 3 && 'Canales'}
                        </span>
                    </button>
                ))}
            </div>

            {/* Form Card */}
            <GlassCard className="relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <form onSubmit={handleFormSubmit} className="relative space-y-6">
                    {/* Step content */}
                    {currentStep === 1 && (
                        <SearchFormInfo
                            formData={formData}
                            updateField={updateField}
                        />
                    )}

                    {currentStep === 2 && (
                        <SearchFormCombined
                            formData={formData}
                            updateField={updateField}
                            newSkill={newSkill}
                            setNewSkill={setNewSkill}
                            addSkill={addSkill}
                            removeSkill={removeSkill}
                            newSoftSkill={newSoftSkill}
                            setNewSoftSkill={setNewSoftSkill}
                            addSoftSkill={addSoftSkill}
                            removeSoftSkill={removeSoftSkill}
                            newIdioma={newIdioma}
                            setNewIdioma={setNewIdioma}
                            addIdioma={addIdioma}
                            removeIdioma={removeIdioma}
                        />
                    )}

                    {currentStep === 3 && (
                        <SearchChannelSelector
                            channels={formData.channels}
                            onChange={updateChannels}
                        />
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

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <GlassCard className="max-w-md w-full">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-amber-500/10">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
                                    ¿Estás seguro?
                                </h3>
                                <p className="text-[var(--text-muted)] mb-4">
                                    Se creará la búsqueda <strong className="text-[var(--text-main)]">"{formData.titulo}"</strong> y se publicará automáticamente en LinkedIn.
                                </p>
                                <p className="text-sm text-amber-400 mb-6">
                                    ⚠️ Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowConfirmDialog(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={confirmAndCreate}
                                        isLoading={loading}
                                        icon={<Zap size={18} />}
                                    >
                                        {loading ? statusMessage || 'Creando...' : 'Sí, Crear Búsqueda'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
