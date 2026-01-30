import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

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

        // Get search info for calendar event
        const { data: search } = await supabase
            .from('busquedas')
            .select('titulo')
            .eq('id', candidate.id_busqueda_n8n)
            .single();

        let googleEventId = null;
        let meetLink = null;

        // Try to create Google Calendar event
        try {
            // Get admin/recruiter tokens (you'll need to store these)
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
                    summary: `Entrevista: ${search?.titulo || 'Posición'}`,
                    description: `Entrevista con ${candidate.nombre}.\n\nGenerado automáticamente por VIBE CODE ATS.`,
                    start: {
                        dateTime: slot.start_time,
                        timeZone: 'America/Argentina/Buenos_Aires',
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
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 60 },
                        ],
                    },
                };

                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event,
                    conferenceDataVersion: 1,
                    sendUpdates: 'all',
                });

                googleEventId = response.data.id;
                meetLink = response.data.hangoutLink;

                // Update candidate with Google event info
                await supabase
                    .from('postulantes')
                    .update({
                        google_event_id: googleEventId,
                        google_meet_link: meetLink,
                    })
                    .eq('id', candidate.id);
            }
        } catch (calendarError) {
            console.error('Calendar creation failed (non-critical):', calendarError);
            // Don't fail the booking if calendar creation fails
        }

        // Send confirmation email to candidate
        try {
            await fetch(`${process.env.VERCEL_URL || 'http://localhost:5173'}/api/emails/send-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: candidate.id }),
            });
        } catch (emailError) {
            console.error('Email sending failed (non-critical):', emailError);
            // Don't fail the booking if email fails
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

    } catch (error) {
        console.error('Confirm error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
