import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

/**
 * Generate a unique booking link for a candidate
 * POST /api/booking/create
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { candidateId, userId } = req.body;

    console.log('Booking create request:', { candidateId, userId });

    if (!candidateId || !userId) {
        return res.status(400).json({ error: 'candidateId and userId required' });
    }

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase env vars');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Generate unique token for this booking link
        const bookingToken = randomUUID();
        console.log('Generated token:', bookingToken);

        // Get candidate info
        const { data: candidate, error: candidateError } = await supabase
            .from('postulantes')
            .select('nombre, email, id_busqueda_n8n')
            .eq('id', candidateId)
            .single();

        if (candidateError) {
            console.error('Candidate fetch error:', candidateError);
            return res.status(404).json({ error: 'Candidate not found', details: candidateError.message });
        }

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Found candidate:', candidate.nombre);

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
            return res.status(500).json({ error: 'Failed to create booking link', details: updateError.message });
        }

        // Generate the booking URL - use hardcoded production URL
        const bookingUrl = `https://mi-primer-repo-seven.vercel.app/book/${bookingToken}`;

        console.log('Created booking URL:', bookingUrl);

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
