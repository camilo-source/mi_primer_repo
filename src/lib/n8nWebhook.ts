/**
 * n8n Webhook Integration
 * 
 * Este módulo maneja la comunicación con n8n para disparar
 * el workflow de generación de publicaciones de LinkedIn.
 * 
 * Usa un proxy API para evitar problemas de CORS.
 */

// URL del proxy API que redirige a n8n
const N8N_WEBHOOK_URL = '/api/n8n/trigger';

/**
 * Payload que se envía al webhook de n8n
 */
export interface SearchWebhookPayload {
    // Identificadores
    id_busqueda: string;

    // Datos de la Empresa
    empresa: string;
    rubro: string;
    descripcion_empresa: string;

    // Datos del Puesto
    nombre_puesto: string;
    descripcion_puesto: string;

    // Requisitos
    habilidades_tecnicas: string[];
    habilidades_blandas: string[];
    experiencia_previa: string;
    nivel_formacion: string;

    // Condiciones Laborales
    disponibilidad: string;
    modalidad: string;
    ubicacion: string;
    idiomas: string[];

    // Extras
    extras: string;

    // URLs
    application_url: string;
    flyer_url?: string;
}

/**
 * Resultado del envío del webhook
 */
export interface WebhookResult {
    success: boolean;
    error?: string;
    retryable?: boolean;
}

/**
 * Valida el payload antes de enviarlo
 */
function validatePayload(payload: SearchWebhookPayload): string | null {
    if (!payload.id_busqueda) {
        return 'ID de búsqueda es requerido';
    }
    if (!payload.empresa?.trim()) {
        return 'Nombre de empresa es requerido';
    }
    if (!payload.nombre_puesto?.trim()) {
        return 'Nombre del puesto es requerido';
    }
    if (!payload.application_url?.trim()) {
        return 'URL de postulación es requerida';
    }
    return null;
}

/**
 * Limpia y normaliza el payload
 */
function normalizePayload(payload: SearchWebhookPayload): SearchWebhookPayload {
    return {
        ...payload,
        empresa: payload.empresa?.trim() || '',
        rubro: payload.rubro?.trim() || 'Sin especificar',
        descripcion_empresa: payload.descripcion_empresa?.trim() || '',
        nombre_puesto: payload.nombre_puesto?.trim() || '',
        descripcion_puesto: payload.descripcion_puesto?.trim() || payload.nombre_puesto?.trim() || '',
        habilidades_tecnicas: payload.habilidades_tecnicas?.filter(h => h?.trim()) || [],
        habilidades_blandas: payload.habilidades_blandas?.filter(h => h?.trim()) || [],
        experiencia_previa: payload.experiencia_previa?.trim() || 'Sin especificar',
        nivel_formacion: payload.nivel_formacion?.trim() || 'Cualquiera',
        disponibilidad: payload.disponibilidad?.trim() || 'Full Time',
        modalidad: payload.modalidad?.trim() || 'Cualquiera',
        ubicacion: payload.ubicacion?.trim() || 'Sin especificar',
        idiomas: payload.idiomas?.filter(i => i?.trim()) || [],
        extras: payload.extras?.trim() || '',
        application_url: payload.application_url?.trim() || '',
        flyer_url: payload.flyer_url?.trim() || undefined,
    };
}

/**
 * Envía el payload al webhook de n8n con retry logic
 */
export async function triggerN8nWorkflow(
    payload: SearchWebhookPayload,
    options: { maxRetries?: number; retryDelay?: number } = {}
): Promise<WebhookResult> {
    const { maxRetries = 3, retryDelay = 1000 } = options;

    // Validar payload
    const validationError = validatePayload(payload);
    if (validationError) {
        return { success: false, error: validationError, retryable: false };
    }

    // Normalizar payload
    const normalizedPayload = normalizePayload(payload);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[n8n Webhook] Attempt ${attempt}/${maxRetries}...`);
            console.log('[n8n Webhook] URL:', N8N_WEBHOOK_URL);
            console.log('[n8n Webhook] Payload:', JSON.stringify(normalizedPayload, null, 2));

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(normalizedPayload),
            });

            console.log('[n8n Webhook] Response status:', response.status);

            if (response.ok) {
                console.log('[n8n Webhook] Success!');
                return { success: true };
            }

            // Errores 4xx no son reintentables (error del cliente)
            if (response.status >= 400 && response.status < 500) {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `Error ${response.status}: ${errorText}`,
                    retryable: false
                };
            }

            // Errores 5xx son reintentables (error del servidor)
            lastError = new Error(`HTTP ${response.status}`);

        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Error de red');
            console.warn(`[n8n Webhook] Attempt ${attempt} failed:`, lastError.message);
        }

        // Esperar antes del próximo intento
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
    }

    return {
        success: false,
        error: lastError?.message || 'Error desconocido después de múltiples intentos',
        retryable: true
    };
}

/**
 * Construye el payload desde los datos del formulario
 */
export function buildWebhookPayload(
    formData: {
        titulo: string;
        empresa: string;
        rubro?: string;
        descripcion_empresa?: string;
        descripcion?: string;
        habilidades_requeridas: string[];
        habilidades_blandas?: string[];
        experiencia_minima: number;
        experiencia_maxima: number;
        nivel_formacion?: string;
        disponibilidad?: string;
        modalidad?: string;
        ubicacion?: string;
        idiomas?: { idioma: string; nivel: string }[] | string[];
        extras?: string;
        flyer_url?: string;
    },
    searchId: string
): SearchWebhookPayload {
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://mi-primer-repo-seven.vercel.app';

    // Convertir idiomas a array de strings si viene como objetos
    let idiomasArray: string[] = [];
    if (formData.idiomas && formData.idiomas.length > 0) {
        if (typeof formData.idiomas[0] === 'string') {
            idiomasArray = formData.idiomas as string[];
        } else {
            idiomasArray = (formData.idiomas as { idioma: string; nivel: string }[])
                .map(i => `${i.idioma} ${i.nivel}`);
        }
    }

    return {
        id_busqueda: searchId,
        empresa: formData.empresa,
        rubro: formData.rubro || 'Sin especificar',
        descripcion_empresa: formData.descripcion_empresa || '',
        nombre_puesto: formData.titulo,
        descripcion_puesto: formData.descripcion || formData.titulo,
        habilidades_tecnicas: formData.habilidades_requeridas,
        habilidades_blandas: formData.habilidades_blandas || [],
        experiencia_previa: `${formData.experiencia_minima}-${formData.experiencia_maxima} años`,
        nivel_formacion: formData.nivel_formacion || 'Cualquiera',
        disponibilidad: formData.disponibilidad || 'Full Time',
        modalidad: formData.modalidad || 'Cualquiera',
        ubicacion: formData.ubicacion || '',
        idiomas: idiomasArray,
        extras: formData.extras || '',
        application_url: `${baseUrl}/apply/${searchId}`,
        flyer_url: formData.flyer_url,
    };
}
