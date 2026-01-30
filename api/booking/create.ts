import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

/**
 * Generate a unique booking link for a candidate
 * POST /api/booking/create
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { candidateId, userId } = req.body;

    if (!candidateId || !userId) {
        return res.status(400).json({ error: 'candidateId and userId required' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Generate unique token for this booking link
        const bookingToken = randomUUID();

        // Get candidate info
        const { data: candidate, error: candidateError } = await supabase
            .from('postulantes')
            .select('nombre, email, id_busqueda_n8n')
            .eq('id', candidateId)
            .single();

        if (candidateError || !candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Get search info
        const { data: search } = await supabase
            .from('busquedas')
            .select('titulo')
            .eq('id_busqueda_n8n', candidate.id_busqueda_n8n)
            .single();

        // Store the booking token
        const { error: updateError } = await supabase
            .from('postulantes')
            .update({
                booking_token: bookingToken,
                estado_agenda: 'sent'
            })
            .eq('id', candidateId);

        if (updateError) {
            console.error('Update error:', updateError);
            return res.status(500).json({ error: 'Failed to create booking link' });
        }

        // Generate the booking URL
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'https://mi-primer-repo-seven.vercel.app';

        const bookingUrl = `${baseUrl}/book/${bookingToken}`;

        return res.status(200).json({
            success: true,
            bookingUrl,
            bookingToken,
            candidate: {
                name: candidate.nombre,
                email: candidate.email
            },
            searchTitle: search?.titulo || 'Entrevista'
        });

    } catch (error) {
        console.error('Create booking error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
