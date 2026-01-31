import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { google } from 'googleapis';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Google Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// --- Handlers ---

/**
 * GET available slots
 */
async function handleGetSlots(req: VercelRequest, res: VercelResponse) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

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
}

/**
 * POST Create booking link
 */
async function handleCreateBooking(req: VercelRequest, res: VercelResponse) {
    const { candidateId, userId } = req.body;

    console.log('Booking create request:', { candidateId, userId });

    if (!candidateId || !userId) {
        return res.status(400).json({ error: 'candidateId and userId required' });
    }

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

    // Generate the booking URL (using env var or default to production)
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mi-primer-repo-seven.vercel.app';
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
}

/**
 * POST Confirm booking
 */
async function handleConfirmBooking(req: VercelRequest, res: VercelResponse) {
    const { token, slotId } = req.body;

    if (!token || !slotId) {
        return res.status(400).json({ error: 'token and slotId required' });
    }

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
        return res.status(500).json({ error: 'Failed to confirm interview' });
    }

    let googleEventId = null;
    let meetLink = null;

    // Try to create Google Calendar event
    try {
        const { data: adminTokens } = await supabase
            .from('user_tokens')
            .select('google_access_token, google_refresh_token')
            .single();

        if (adminTokens?.google_access_token) {
            oauth2Client.setCredentials({
                access_token: adminTokens.google_access_token,
                refresh_token: adminTokens.google_refresh_token,
            });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const event = {
                summary: `Entrevista`,
                description: `Entrevista con ${candidate.nombre}`,
                start: {
                    dateTime: slot.start_time,
                    timeZone: 'America/Argentina/Buenos_Aires', // Fixed timezone for now
                },
                end: {
                    dateTime: slot.end_time,
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
                attendees: [
                    { email: candidate.email, displayName: candidate.nombre }
                ],
                conferenceData: {
                    createRequest: {
                        requestId: `booking-${candidate.id}-${Date.now()}`,
                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                    }
                }
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                conferenceDataVersion: 1,
            });

            googleEventId = response.data.id;
            meetLink = response.data.hangoutLink;

            // Update with Google info
            await supabase
                .from('postulantes')
                .update({
                    google_event_id: googleEventId,
                    google_meet_link: meetLink,
                })
                .eq('id', candidate.id);
        }
    } catch (calendarError) {
        console.error('Calendar creation failed:', calendarError);
        // Continue without failing
    }

    return res.status(200).json({
        success: true,
        message: '¡Entrevista confirmada!',
        interview: {
            candidateName: candidate.nombre,
            startTime: slot.start_time,
            endTime: slot.end_time,
            meetLink: meetLink,
        }
    });
}

// --- Main Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    console.log(`[Booking API] ${req.method} action=${action}`);

    try {
        if (req.method === 'GET') {
            // Default to slots if token is present
            if (action === 'slots' || req.query.token) {
                return handleGetSlots(req, res);
            }
        }

        if (req.method === 'POST') {
            if (action === 'create') {
                return handleCreateBooking(req, res);
            }
            if (action === 'confirm') {
                return handleConfirmBooking(req, res);
            }
        }

        return res.status(400).json({ error: `Invalid action: ${action}` });

    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
