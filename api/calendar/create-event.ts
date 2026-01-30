import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/**
 * Create a Google Calendar event for a confirmed booking
 * POST /api/calendar/create-event
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { bookingId, candidateEmail, candidateName, startTime, endTime, searchTitle } = req.body;

    if (!bookingId || !candidateEmail || !candidateName || !startTime || !endTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get recruiter's Google tokens
        const { data: session } = await supabase.auth.getSession();

        if (!session?.session?.provider_token || !session?.session?.provider_refresh_token) {
            return res.status(401).json({ error: 'No Google Calendar access' });
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: session.session.provider_token,
            refresh_token: session.session.provider_refresh_token,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Create event
        const event = {
            summary: `Entrevista: ${searchTitle}`,
            description: `Entrevista con ${candidateName} para la posición de ${searchTitle}.\n\nGenerado automáticamente por VIBE CODE ATS.`,
            start: {
                dateTime: startTime,
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            end: {
                dateTime: endTime,
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            attendees: [
                { email: candidateEmail, displayName: candidateName }
            ],
            conferenceData: {
                createRequest: {
                    requestId: `booking-${bookingId}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 }, // 1 hour before
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all', // Send email invites to all attendees
        });

        // Save event ID to database
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                google_event_id: response.data.id,
                google_meet_link: response.data.hangoutLink,
            })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Failed to save event ID:', updateError);
        }

        return res.status(200).json({
            success: true,
            eventId: response.data.id,
            meetLink: response.data.hangoutLink,
            htmlLink: response.data.htmlLink,
        });

    } catch (error: any) {
        console.error('Calendar error:', error);
        return res.status(500).json({
            error: 'Failed to create calendar event',
            details: error.message
        });
    }
}
