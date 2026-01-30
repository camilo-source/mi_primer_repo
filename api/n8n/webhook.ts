import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 🎯 WEBHOOK PARA N8N - RECIBE DATOS PROCESADOS POR IA
 * 
 * Este endpoint recibe los candidatos procesados por la IA en n8n
 * y los guarda en la base de datos de Supabase.
 * 
 * Método: POST
 * URL: https://tu-dominio.vercel.app/api/n8n/webhook
 * 
 * Headers permitidos:
 * - Content-Type: application/json
 * - Authorization: Bearer <token> (opcional - si se configura N8N_WEBHOOK_SECRET)
 * 
 * Body esperado:
 * {
 *   "id_busqueda_n8n": "uuid-de-la-busqueda",
 *   "candidato": {
 *     "nombre": "Juan Pérez",
 *     "email": "juan@example.com",
 *     "resumen_ia": "Desarrollador Full Stack con 5 años...",
 *     "score_ia": 85
 *   }
 * }
 * 
 * O formato batch:
 * {
 *   "id_busqueda_n8n": "uuid-de-la-busqueda",
 *   "candidatos": [...]
 * }
 */

interface Candidato {
    nombre: string;
    email: string;
    resumen_ia?: string;
    score_ia?: number;
}

interface WebhookPayload {
    id_busqueda_n8n: string;
    candidato?: Candidato;  // Single candidate
    candidatos?: Candidato[]; // Batch of candidates
}

// Configurar CORS para permitir requests desde n8n
function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Configurar CORS
    setCorsHeaders(res);

    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Método no permitido. Usar POST.'
        });
    }

    // Verificar autenticación opcional (si está configurada)
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    if (webhookSecret) {
        const authHeader = req.headers.authorization;
        if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
            return res.status(401).json({
                success: false,
                error: 'Autenticación inválida'
            });
        }
    }

    try {
        const payload: WebhookPayload = req.body;

        console.log('📥 Webhook recibido:', JSON.stringify(payload, null, 2));

        // Validar payload
        if (!payload.id_busqueda_n8n) {
            return res.status(400).json({
                success: false,
                error: 'Falta id_busqueda_n8n'
            });
        }

        // Normalizar: aceptar tanto "candidato" (single) como "candidatos" (array)
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

        // Verificar que la búsqueda existe
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

        // Preparar candidatos para inserción (solo campos que existen en tabla postulantes)
        const candidatosParaInsertar = candidatos.map(candidato => ({
            id_busqueda_n8n: payload.id_busqueda_n8n,
            nombre: candidato.nombre || 'Sin nombre',
            email: candidato.email || 'sin@email.com',
            resumen_ia: candidato.resumen_ia || null,
            score_ia: candidato.score_ia || null,
            estado_agenda: 'pending',
            comentarios_admin: null
        }));

        // Insertar candidatos en tabla POSTULANTES (no candidatos)
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

        // Respuesta exitosa
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
