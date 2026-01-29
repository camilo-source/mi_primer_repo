import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

interface ConfirmScheduleRequest {
    candidateId: string;
    userId: string;
    slotId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { candidateId, userId, slotId } = req.body as ConfirmScheduleRequest;

        // 1. Get all required data
        const [integrationResult, candidateResult, slotResult] = await Promise.all([
            supabase.from('user_integrations').select('*').eq('user_id', userId).single(),
            supabase.from('postulantes').select('*, busquedas:id_busqueda_n8n(titulo)').eq('id', candidateId).single(),
            supabase.from('availability').select('*').eq('id', slotId).single()
        ]);

        const integration = integrationResult.data;
        const candidate = candidateResult.data;
        const slot = slotResult.data;

        if (!integration || !candidate || !slot) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        // 2. Set up Google APIs
        oauth2Client.setCredentials({
            access_token: integration.google_access_token,
            refresh_token: integration.google_refresh_token,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 3. Generate confirmation email with AI
        const confirmationEmail = await generateConfirmationEmail(
            candidate.nombre,
            candidate.busquedas?.titulo || 'the position',
            slot
        );

        // 4. Send confirmation email
        const message = createMimeMessage({
            to: candidate.email,
            subject: confirmationEmail.subject,
            body: confirmationEmail.body
        });

        const { data: sentMessage } = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: message,
                threadId: candidate.email_thread_id // Keep in same thread
            }
        });

        // 5. Create Google Calendar event
        const startTime = new Date(slot.start_time);
        const endTime = new Date(slot.end_time);

        const { data: calendarEvent } = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: `Entrevista: ${candidate.nombre} - ${candidate.busquedas?.titulo}`,
                description: `Entrevista con ${candidate.nombre} (${candidate.email})\n\nPosición: ${candidate.busquedas?.titulo}\n\nResumen IA: ${candidate.resumen_ia || 'N/A'}`,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                attendees: [
                    { email: candidate.email }
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 60 },
                        { method: 'popup', minutes: 15 }
                    ]
                }
            },
            sendUpdates: 'all' // Send invite to attendee
        });

        // 6. Update database
        await Promise.all([
            // Mark candidate as confirmed
            supabase.from('postulantes').update({
                estado_agenda: 'confirmed',
                fecha_entrevista: slot.start_time,
                selected_slot: slot
            }).eq('id', candidateId),

            // Mark slot as booked
            supabase.from('availability').update({
                is_booked: true
            }).eq('id', slotId),

            // Log the confirmation email
            supabase.from('email_logs').insert({
                user_id: userId,
                candidate_id: candidateId,
                email_type: 'confirmation',
                gmail_message_id: sentMessage?.id,
                gmail_thread_id: candidate.email_thread_id,
                subject: confirmationEmail.subject,
                body_preview: confirmationEmail.body.substring(0, 200)
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Interview confirmed!',
            calendarEventId: calendarEvent?.id,
            interviewTime: slot.start_time
        });

    } catch (error) {
        console.error('Error confirming schedule:', error);
        return res.status(500).json({ error: 'Failed to confirm interview' });
    }
}

// Generate confirmation email with AI
async function generateConfirmationEmail(
    candidateName: string,
    positionTitle: string,
    slot: any
) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const interviewDate = new Date(slot.start_time);
    const dateStr = interviewDate.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = interviewDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const prompt = `
Write a professional interview confirmation email in Spanish.

Candidate: ${candidateName}
Position: ${positionTitle}
Interview Date: ${dateStr}
Interview Time: ${timeStr}

The email should:
1. Confirm the interview appointment
2. Be warm and professional
3. Mention they will receive a calendar invite
4. Include a brief "what to expect" section
5. Provide contact info for questions
6. Keep it concise (max 120 words)

Return JSON:
{
  "subject": "email subject",
  "body": "email body"
}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
                })
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('AI generation error:', error);
    }

    // Fallback
    return {
        subject: `✅ Confirmación de entrevista - ${positionTitle}`,
        body: `Hola ${candidateName},\n\n¡Excelente! Tu entrevista para ${positionTitle} ha sido confirmada para el ${dateStr} a las ${timeStr}.\n\nRecibirás una invitación de calendario con los detalles.\n\n¡Nos vemos pronto!`
    };
}

// Helper: Create MIME message
function createMimeMessage({ to, subject, body }: { to: string; subject: string; body: string }) {
    const message = [
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        '',
        body
    ].join('\n');

    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
