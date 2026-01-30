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
 * Body esperado:
 * {
 *   "id_busqueda_n8n": "uuid-de-la-busqueda",
 *   "candidatos": [
 *     {
 *       "nombre": "Juan Pérez",
 *       "email": "juan@example.com",
 *       "telefono": "+54 11 1234-5678",
 *       "linkedin": "https://linkedin.com/in/juanperez",
 *       "cv_url": "https://storage.com/cv.pdf",
 *       "resumen_ia": "Desarrollador Full Stack con 5 años...",
 *       "score_ia": 85,
 *       "habilidades": ["React", "Node.js", "TypeScript"],
 *       "experiencia_anos": 5,
 *       "ubicacion": "Buenos Aires, Argentina"
 *     }
 *   ]
 * }
 */

interface Candidato {
    nombre: string;
    email: string;
    telefono?: string;
    linkedin?: string;
    cv_url?: string;
    resumen_ia?: string;
    score_ia?: number;
    habilidades?: string[];
    experiencia_anos?: number;
    ubicacion?: string;
}

interface WebhookPayload {
    id_busqueda_n8n: string;
    candidatos: Candidato[];
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Método no permitido. Usar POST.'
        });
    }

    try {
        const payload: WebhookPayload = req.body;

        // Validar payload
        if (!payload.id_busqueda_n8n) {
            return res.status(400).json({
                success: false,
                error: 'Falta id_busqueda_n8n'
            });
        }

        if (!payload.candidatos || !Array.isArray(payload.candidatos)) {
            return res.status(400).json({
                success: false,
                error: 'Falta array de candidatos'
            });
        }

        if (payload.candidatos.length === 0) {
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
            return res.status(404).json({
                success: false,
                error: `Búsqueda no encontrada: ${payload.id_busqueda_n8n}`
            });
        }

        console.log(`📥 Recibiendo ${payload.candidatos.length} candidatos para búsqueda: ${busqueda.titulo}`);

        // Preparar candidatos para inserción
        const candidatosParaInsertar = payload.candidatos.map(candidato => ({
            id_busqueda_n8n: payload.id_busqueda_n8n,
            nombre: candidato.nombre,
            email: candidato.email,
            telefono: candidato.telefono || null,
            linkedin: candidato.linkedin || null,
            cv_url: candidato.cv_url || null,
            resumen_ia: candidato.resumen_ia || null,
            score_ia: candidato.score_ia || null,
            habilidades: candidato.habilidades || [],
            experiencia_anos: candidato.experiencia_anos || null,
            ubicacion: candidato.ubicacion || null,
            estado: 'nuevo', // Estado inicial
            created_at: new Date().toISOString()
        }));

        // Insertar candidatos en batch
        const { data: candidatosInsertados, error: insertError } = await supabase
            .from('candidatos')
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

        console.log(`✅ ${candidatosInsertados?.length || 0} candidatos guardados exitosamente`);

        // Actualizar estado de la búsqueda
        const { error: updateError } = await supabase
            .from('busquedas')
            .update({
                estado: 'activa',
                updated_at: new Date().toISOString()
            })
            .eq('id_busqueda_n8n', payload.id_busqueda_n8n);

        if (updateError) {
            console.error('⚠️ Error actualizando estado de búsqueda:', updateError);
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: `${candidatosInsertados?.length || 0} candidatos procesados exitosamente`,
            data: {
                busqueda_id: payload.id_busqueda_n8n,
                busqueda_titulo: busqueda.titulo,
                candidatos_insertados: candidatosInsertados?.length || 0,
                candidatos: candidatosInsertados?.map(c => ({
                    id: c.id_candidato,
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
