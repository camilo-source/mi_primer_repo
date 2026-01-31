import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ||
    'https://n8n.metanoian8n.com/webhook/68440768-004a-4aa8-9127-f3130b99d6ca';

/**
 * Unified n8n API endpoint
 * 
 * Handles two operations:
 * 1. POST /api/n8n?action=trigger - Proxy to trigger n8n workflow (from frontend)
 * 2. POST /api/n8n - Receive processed candidates from n8n (webhook)
 */

interface Candidato {
    nombre: string;
    email: string;
    resumen_ia?: string;
    score_ia?: number;
}

interface WebhookPayload {
    id_busqueda_n8n: string;
    candidato?: Candidato;
    candidatos?: Candidato[];
}

function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Handler for triggering n8n workflow (proxy)
async function handleTrigger(req: VercelRequest, res: VercelResponse) {
    try {
        console.log('[n8n Trigger] Forwarding request to n8n...');
        console.log('[n8n Trigger] Payload:', JSON.stringify(req.body, null, 2));

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        console.log('[n8n Trigger] Response status:', response.status);

        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            return res.status(200).json({
                success: true,
                data
            });
        }

        const errorText = await response.text();
        console.error('[n8n Trigger] Error from n8n:', errorText);

        return res.status(response.status).json({
            success: false,
            error: errorText
        });

    } catch (error) {
        console.error('[n8n Trigger] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Handler for receiving candidates from n8n (webhook)
async function handleWebhook(req: VercelRequest, res: VercelResponse) {
    try {
        const payload: WebhookPayload = req.body;
        console.log('📥 Webhook recibido:', JSON.stringify(payload, null, 2));

        if (!payload.id_busqueda_n8n) {
            return res.status(400).json({
                success: false,
                error: 'Falta id_busqueda_n8n'
            });
        }

        let candidatos: Candidato[] = [];

        if (payload.candidato) {
            candidatos = [payload.candidato];
        } else if (payload.candidatos && Array.isArray(payload.candidatos)) {
            candidatos = payload.candidatos;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Falta candidato o candidatos en el payload'
            });
        }

        if (candidatos.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array de candidatos vacío'
            });
        }

        const { data: busqueda, error: busquedaError } = await supabase
            .from('busquedas')
            .select('id_busqueda_n8n, titulo')
            .eq('id_busqueda_n8n', payload.id_busqueda_n8n)
            .single();

        if (busquedaError || !busqueda) {
            console.error('❌ Búsqueda no encontrada:', payload.id_busqueda_n8n);
            return res.status(404).json({
                success: false,
                error: `Búsqueda no encontrada: ${payload.id_busqueda_n8n}`
            });
        }

        console.log(`📥 Procesando ${candidatos.length} candidato(s) para búsqueda: ${busqueda.titulo}`);

        const candidatosParaInsertar = candidatos.map(candidato => ({
            id_busqueda_n8n: payload.id_busqueda_n8n,
            nombre: candidato.nombre || 'Sin nombre',
            email: candidato.email || 'sin@email.com',
            resumen_ia: candidato.resumen_ia || null,
            score_ia: candidato.score_ia || null,
            estado_agenda: 'pending',
            comentarios_admin: null
        }));

        const { data: candidatosInsertados, error: insertError } = await supabase
            .from('postulantes')
            .insert(candidatosParaInsertar)
            .select();

        if (insertError) {
            console.error('❌ Error insertando candidatos:', insertError);
            return res.status(500).json({
                success: false,
                error: 'Error al guardar candidatos en la base de datos',
                details: insertError.message
            });
        }

        console.log(`✅ ${candidatosInsertados?.length || 0} candidato(s) guardado(s) exitosamente`);

        return res.status(200).json({
            success: true,
            message: `${candidatosInsertados?.length || 0} candidato(s) procesado(s) exitosamente`,
            data: {
                busqueda_id: payload.id_busqueda_n8n,
                busqueda_titulo: busqueda.titulo,
                candidatos_insertados: candidatosInsertados?.length || 0,
                candidatos: candidatosInsertados?.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    email: c.email,
                    score: c.score_ia
                }))
            }
        });

    } catch (error: any) {
        console.error('❌ Error en webhook n8n:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if this is a trigger request (from frontend) or webhook (from n8n)
    const action = req.query.action as string;

    if (action === 'trigger') {
        return handleTrigger(req, res);
    } else {
        return handleWebhook(req, res);
    }
}
