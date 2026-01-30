import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { triggerN8nWorkflow, buildWebhookPayload } from '../lib/n8nWebhook';
import type { SearchFormData, CreatedSearch, IdiomaEntry } from '../types/search';
import { initialSearchFormData } from '../types/search';

export function useSearchForm() {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SearchFormData>(initialSearchFormData);
    const [createdSearch, setCreatedSearch] = useState<CreatedSearch | null>(null);

    // Temporary input states
    const [newSkill, setNewSkill] = useState('');
    const [newSoftSkill, setNewSoftSkill] = useState('');
    const [newReqExcluyente, setNewReqExcluyente] = useState('');
    const [newReqDeseable, setNewReqDeseable] = useState('');
    const [newIdioma, setNewIdioma] = useState<IdiomaEntry>({ idioma: '', nivel: 'B1' });

    // --- Array Handlers ---
    const addSkill = useCallback(() => {
        if (newSkill.trim() && !formData.habilidades_requeridas.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                habilidades_requeridas: [...prev.habilidades_requeridas, newSkill.trim()]
            }));
            setNewSkill('');
        }
    }, [newSkill, formData.habilidades_requeridas]);

    const removeSkill = useCallback((skill: string) => {
        setFormData(prev => ({
            ...prev,
            habilidades_requeridas: prev.habilidades_requeridas.filter(s => s !== skill)
        }));
    }, []);

    const addSoftSkill = useCallback(() => {
        if (newSoftSkill.trim() && !formData.habilidades_blandas.includes(newSoftSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                habilidades_blandas: [...prev.habilidades_blandas, newSoftSkill.trim()]
            }));
            setNewSoftSkill('');
        }
    }, [newSoftSkill, formData.habilidades_blandas]);

    const removeSoftSkill = useCallback((skill: string) => {
        setFormData(prev => ({
            ...prev,
            habilidades_blandas: prev.habilidades_blandas.filter(s => s !== skill)
        }));
    }, []);

    const addReqExcluyente = useCallback(() => {
        if (newReqExcluyente.trim() && !formData.requisitos_excluyentes.includes(newReqExcluyente.trim())) {
            setFormData(prev => ({
                ...prev,
                requisitos_excluyentes: [...prev.requisitos_excluyentes, newReqExcluyente.trim()]
            }));
            setNewReqExcluyente('');
        }
    }, [newReqExcluyente, formData.requisitos_excluyentes]);

    const removeReqExcluyente = useCallback((req: string) => {
        setFormData(prev => ({
            ...prev,
            requisitos_excluyentes: prev.requisitos_excluyentes.filter(r => r !== req)
        }));
    }, []);

    const addReqDeseable = useCallback(() => {
        if (newReqDeseable.trim() && !formData.requisitos_deseables.includes(newReqDeseable.trim())) {
            setFormData(prev => ({
                ...prev,
                requisitos_deseables: [...prev.requisitos_deseables, newReqDeseable.trim()]
            }));
            setNewReqDeseable('');
        }
    }, [newReqDeseable, formData.requisitos_deseables]);

    const removeReqDeseable = useCallback((req: string) => {
        setFormData(prev => ({
            ...prev,
            requisitos_deseables: prev.requisitos_deseables.filter(r => r !== req)
        }));
    }, []);

    const addIdioma = useCallback(() => {
        if (newIdioma.idioma.trim()) {
            setFormData(prev => ({
                ...prev,
                idiomas: [...prev.idiomas, { ...newIdioma, idioma: newIdioma.idioma.trim() }]
            }));
            setNewIdioma({ idioma: '', nivel: 'B1' });
        }
    }, [newIdioma]);

    const removeIdioma = useCallback((idioma: string) => {
        setFormData(prev => ({
            ...prev,
            idiomas: prev.idiomas.filter(i => i.idioma !== idioma)
        }));
    }, []);

    // --- Form Field Update ---
    const updateField = useCallback(<K extends keyof SearchFormData>(field: K, value: SearchFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // --- Submit Handler ---
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!formData.empresa.trim()) {
            addToast('El nombre de la empresa es requerido', 'error');
            setCurrentStep(1);
            return;
        }

        if (!formData.titulo.trim()) {
            addToast('El título del puesto es requerido', 'error');
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

            const searchId = crypto.randomUUID();
            const idiomasArray = formData.idiomas.map(i => `${i.idioma} ${i.nivel}`);

            const insertData: Record<string, unknown> = {
                id_busqueda_n8n: searchId,
                user_id: user.id,
                titulo: formData.titulo.trim(),
                descripcion: formData.descripcion.trim() || null,
                habilidades_requeridas: formData.habilidades_requeridas,
                experiencia_minima: formData.experiencia_minima,
                experiencia_maxima: formData.experiencia_maxima,
                modalidad: formData.modalidad,
                ubicacion: formData.ubicacion.trim() || null,
                salario_min: formData.salario_min ? parseInt(formData.salario_min) : null,
                salario_max: formData.salario_max ? parseInt(formData.salario_max) : null,
                moneda: formData.moneda,
                estado: 'active'
            };

            // Optional fields
            if (formData.empresa.trim()) insertData.empresa = formData.empresa.trim();
            if (formData.rubro.trim()) insertData.rubro = formData.rubro.trim();
            if (formData.descripcion_empresa.trim()) insertData.descripcion_empresa = formData.descripcion_empresa.trim();
            if (formData.titulo.trim()) insertData.nombre_del_puesto = formData.titulo.trim();
            if (formData.habilidades_blandas.length > 0) insertData.habilidades_blandas = formData.habilidades_blandas;
            if (formData.nivel_formacion) insertData.nivel_formacion = formData.nivel_formacion;
            if (formData.disponibilidad) insertData.disponibilidad = formData.disponibilidad;
            if (idiomasArray.length > 0) insertData.idiomas = idiomasArray;
            if (formData.requisitos_excluyentes.length > 0) insertData.requisitos_excluyentes = formData.requisitos_excluyentes;
            if (formData.requisitos_deseables.length > 0) insertData.requisitos_deseables = formData.requisitos_deseables;
            if (formData.extras.trim()) insertData.extras = formData.extras.trim();

            console.log('[SearchNew] Insertando búsqueda:', insertData);

            const { error } = await supabase
                .from('busquedas')
                .insert(insertData);

            if (error) {
                console.error('[SearchNew] Error de Supabase:', error);
                throw error;
            }

            addToast('¡Búsqueda creada! Generando publicación...', 'success');

            // Trigger n8n webhook
            const webhookPayload = buildWebhookPayload(formData, searchId);
            const webhookResult = await triggerN8nWorkflow(webhookPayload);

            if (webhookResult.success) {
                await supabase
                    .from('busquedas')
                    .update({
                        webhook_status: 'sent',
                        webhook_sent_at: new Date().toISOString()
                    })
                    .eq('id_busqueda_n8n', searchId);

                addToast('✨ ¡Publicación en proceso! Recibirás un email cuando esté lista.', 'success');
            } else {
                console.warn('Webhook failed:', webhookResult.error);
                await supabase
                    .from('busquedas')
                    .update({ webhook_status: 'failed' })
                    .eq('id_busqueda_n8n', searchId);

                addToast('⚠️ La búsqueda se creó pero la publicación automática falló. Podés reintentarlo después.', 'warning');
            }

            const applicationUrl = `${window.location.origin}/apply/${searchId}`;

            setCreatedSearch({
                id: searchId,
                n8nUrl: applicationUrl
            });

        } catch (error: unknown) {
            console.error('Error creating search:', error);
            let errorMsg = 'Error desconocido';
            if (error && typeof error === 'object') {
                const err = error as Record<string, unknown>;
                if (err.message) errorMsg = String(err.message);
                else if (err.code) errorMsg = `Código: ${err.code}`;
                else errorMsg = JSON.stringify(error).substring(0, 100);
            }
            addToast(`Error: ${errorMsg}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [formData, addToast, navigate]);

    return {
        // State
        loading,
        currentStep,
        formData,
        createdSearch,
        // Setters
        setCurrentStep,
        updateField,
        // Skill handlers
        newSkill,
        setNewSkill,
        addSkill,
        removeSkill,
        // Soft skill handlers
        newSoftSkill,
        setNewSoftSkill,
        addSoftSkill,
        removeSoftSkill,
        // Requirement handlers
        newReqExcluyente,
        setNewReqExcluyente,
        addReqExcluyente,
        removeReqExcluyente,
        newReqDeseable,
        setNewReqDeseable,
        addReqDeseable,
        removeReqDeseable,
        // Idioma handlers
        newIdioma,
        setNewIdioma,
        addIdioma,
        removeIdioma,
        // Submit
        handleSubmit,
        // Navigation
        navigate
    };
}
