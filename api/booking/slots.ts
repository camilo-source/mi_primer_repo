import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Get available slots for a booking token
 * GET /api/booking/slots?token=xxx
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Add CORS headers for public access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find candidate by booking token
        const { data: candidate, error: candidateError } = await supabase
            .from('postulantes')
            .select('id, nombre, id_busqueda_n8n, estado_agenda')
            .eq('booking_token', token)
            .single();

        if (candidateError || !candidate) {
            return res.status(404).json({ error: 'Invalid or expired booking link' });
        }

        // Check if already confirmed
        if (candidate.estado_agenda === 'confirmed') {
            return res.status(400).json({
                error: 'already_confirmed',
                message: 'This interview has already been scheduled'
            });
        }

        // Get search info and user_id
        const { data: search } = await supabase
            .from('busquedas')
            .select('titulo, user_id')
            .eq('id_busqueda_n8n', candidate.id_busqueda_n8n)
            .single();

        if (!search) {
            return res.status(404).json({ error: 'Search not found' });
        }

        // Get available slots from recruiter
        const { data: slots, error: slotsError } = await supabase
            .from('availability')
            .select('id, start_time, end_time')
            .eq('user_id', search.user_id)
            .eq('is_booked', false)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true });

        if (slotsError) {
            console.error('Slots error:', slotsError);
            return res.status(500).json({ error: 'Failed to fetch availability' });
        }

        return res.status(200).json({
            candidateName: candidate.nombre,
            searchTitle: search.titulo,
            slots: slots || []
        });

    } catch (error) {
        console.error('Get slots error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
