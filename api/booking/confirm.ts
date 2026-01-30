import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Confirm a booking slot
 * POST /api/booking/confirm
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, slotId } = req.body;

    if (!token || !slotId) {
        return res.status(400).json({ error: 'token and slotId required' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find candidate
        const { data: candidate, error: candidateError } = await supabase
            .from('postulantes')
            .select('id, nombre, email, id_busqueda_n8n, estado_agenda')
            .eq('booking_token', token)
            .single();

        if (candidateError || !candidate) {
            return res.status(404).json({ error: 'Invalid booking link' });
        }

        if (candidate.estado_agenda === 'confirmed') {
            return res.status(400).json({ error: 'Already confirmed' });
        }

        // Get the slot
        const { data: slot, error: slotError } = await supabase
            .from('availability')
            .select('id, start_time, end_time, is_booked')
            .eq('id', slotId)
            .single();

        if (slotError || !slot) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        if (slot.is_booked) {
            return res.status(400).json({ error: 'Slot already booked' });
        }

        // Mark slot as booked
        const { error: bookError } = await supabase
            .from('availability')
            .update({ is_booked: true })
            .eq('id', slotId);

        if (bookError) {
            console.error('Book error:', bookError);
            return res.status(500).json({ error: 'Failed to book slot' });
        }

        // Update candidate status
        const { error: updateError } = await supabase
            .from('postulantes')
            .update({
                estado_agenda: 'confirmed',
                fecha_entrevista: slot.start_time,
                selected_slot: {
                    id: slot.id,
                    start_time: slot.start_time,
                    end_time: slot.end_time
                }
            })
            .eq('id', candidate.id);

        if (updateError) {
            console.error('Update error:', updateError);
            return res.status(500).json({ error: 'Failed to confirm interview' });
        }

        return res.status(200).json({
            success: true,
            message: '¡Entrevista confirmada!',
            interview: {
                candidateName: candidate.nombre,
                startTime: slot.start_time,
                endTime: slot.end_time
            }
        });

    } catch (error) {
        console.error('Confirm error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
