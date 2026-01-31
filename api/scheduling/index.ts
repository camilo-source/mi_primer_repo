import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { randomUUID } from 'crypto';

/**
 * Consolidated Internal Scheduling API
 * Handles sending invites, checking replies, and confirming slots manually.
 */

// Initialize Clients
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// --- HELPER FUNCTIONS ---

// Helper: Create MIME message for Gmail API
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

// Generate email content with Gemini AI
async function generateEmailWithAI(
    candidateName: string,
    positionTitle: string,
    bookingUrl: string
) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `
You are a professional HR assistant. Write a friendly and professional email in Spanish to invite a candidate for an interview.

Candidate Name: ${candidateName}
Position: ${positionTitle}
Booking Link: ${bookingUrl}

The email should:
1. Be warm and professional
2. Congratulate them for advancing in the selection process
3. IMPORTANT: Include the booking link prominently and explain that they can click it to select their preferred interview time
4. Mention that the link allows them to see available slots and confirm their interview instantly
5. Keep it concise (max 120 words)
6. End with a friendly closing

The booking link MUST appear clearly in the email body.

Return JSON format:
{
  "subject": "email subject line in Spanish",
  "body": "email body in plain text with the booking link included"
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
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('AI generation error:', error);
    }

    // Fallback with booking link included
    return {
        subject: `Invitación a entrevista - ${positionTitle}`,
        body: `Hola ${candidateName},

¡Felicitaciones! Has avanzado en nuestro proceso de selección para el puesto de ${positionTitle}.

Nos gustaría invitarte a una entrevista. Para agendar tu horario preferido, por favor hacé click en el siguiente enlace:

${bookingUrl}

En ese link vas a poder ver los horarios disponibles y confirmar tu entrevista de forma instantánea.

¡Esperamos verte pronto!

Saludos cordiales`
    };
}

// Extract plain text body from Gmail message
function extractEmailBody(message: any): string {
    const parts = message.payload?.parts || [message.payload];

    for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
        if (part.parts) {
            const nested = extractEmailBody({ payload: { parts: part.parts } });
            if (nested) return nested;
        }
    }

    // Fallback to body data if available
    if (message.payload?.body?.data) {
        return Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    return '';
}

// Use AI to extract availability from candidate's reply
async function analyzeReplyWithAI(replyText: string, userSlots: any[]): Promise<any> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const userSlotsText = userSlots.map(slot => {
        const date = new Date(slot.start_time);
        return `${date.toISOString()} - ${date.toLocaleDateString('es-AR')} ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    }).join('\n');

    const prompt = `
Analyze this email reply from a job candidate and extract their availability for an interview.

=== CANDIDATE'S REPLY ===
${replyText}
=========================

=== INTERVIEWER'S AVAILABLE SLOTS ===
${userSlotsText}
=====================================

Tasks:
1. Understand what times the candidate says they are available
2. Match their availability with the interviewer's slots
3. Return the matching slot IDs

Return JSON format only:
{
  "candidatePreferences": ["description of what candidate said"],
  "matchingSlotIds": ["id1", "id2"],
  "confidence": "high" | "medium" | "low",
  "needsClarification": false
}

If the candidate's message is unclear or they suggest completely different times, set needsClarification to true.
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
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
        console.error('AI analysis error:', error);
    }

    return { candidatePreferences: [], matchingSlotIds: [], confidence: 'low', needsClarification: true };
}

// Find slots that match between user and candidate
function findMatchingSlots(userSlots: any[], candidateAnalysis: any): any[] {
    if (!candidateAnalysis?.matchingSlotIds?.length) return [];

    return userSlots.filter(slot =>
        candidateAnalysis.matchingSlotIds.includes(slot.id)
    );
}

// Generate confirmation email for manual confirm
async function generateConfirmationEmail(
    candidateName: string,
    positionTitle: string,
    slot: any
) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const interviewDate = new Date(slot.start_time);
    const dateStr = interviewDate.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = interviewDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const prompt = `
Write a professional interview confirmation email in Spanish.
Candidate: ${candidateName}
Position: ${positionTitle}
Interview Date: ${dateStr}
Interview Time: ${timeStr}

Return JSON: { "subject": "...", "body": "..." }
Keep it concise.
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
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('AI generation error:', error);
    }

    return {
        subject: `✅ Confirmación de entrevista - ${positionTitle}`,
        body: `Hola ${candidateName},\n\nTu entrevista para ${positionTitle} ha sido confirmada para el ${dateStr} a las ${timeStr}.\n\nRecibirás una invitación de calendario con los detalles.\n\n¡Nos vemos pronto!`
    };
}


// --- HANDLERS ---

async function handleSendInvite(req: VercelRequest, res: VercelResponse) {
    const { candidateId, userId } = req.body;

    // 1. Get user's Google tokens
    const { data: integration, error: integrationError } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (integrationError || !integration) {
        return res.status(401).json({ error: 'Google integration not found', needsAuth: true });
    }

    // 2. Get candidate details
    const { data: candidate, error: candidateError } = await supabase
        .from('postulantes')
        .select('*, busquedas:id_busqueda_n8n(titulo)')
        .eq('id', candidateId)
        .single();

    if (candidateError || !candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
    }

    // 3. Generate booking token if needed
    let bookingToken = candidate.booking_token;
    if (!bookingToken) {
        bookingToken = randomUUID();
        await supabase.from('postulantes').update({ booking_token: bookingToken }).eq('id', candidateId);
    }

    // 4. Build booking URL
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mi-primer-repo-seven.vercel.app';
    const bookingUrl = `${baseUrl}/book/${bookingToken}`;

    // 5. Configure Google
    oauth2Client.setCredentials({
        access_token: integration.google_access_token,
        refresh_token: integration.google_refresh_token,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 7. Generate email
    const emailContent = await generateEmailWithAI(candidate.nombre, candidate.busquedas?.titulo || 'Posición', bookingUrl);

    // 8. Send email
    const message = createMimeMessage({
        to: candidate.email,
        subject: emailContent.subject,
        body: emailContent.body
    });

    const { data: sentMessage } = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: message }
    });

    // 9. Update DB
    await supabase.from('postulantes').update({
        estado_agenda: 'sent',
        email_thread_id: sentMessage?.threadId,
        email_sent_at: new Date().toISOString()
    }).eq('id', candidateId);

    return res.status(200).json({ success: true, message: 'Invitation sent' });
}

async function handleCheckReplies(req: VercelRequest, res: VercelResponse) {
    const { candidateId, userId } = req.body;

    // 1. Get user and candidate
    const [integrationResult, candidateResult, availabilityResult] = await Promise.all([
        supabase.from('user_integrations').select('*').eq('user_id', userId).single(),
        supabase.from('postulantes').select('*').eq('id', candidateId).single(),
        supabase.from('availability').select('*').eq('user_id', userId).eq('is_booked', false)
    ]);

    const integration = integrationResult.data;
    const candidate = candidateResult.data;
    const userAvailability = availabilityResult.data || [];

    if (!integration || !candidate?.email_thread_id) {
        return res.status(400).json({ error: 'Missing integration or thread ID' });
    }

    oauth2Client.setCredentials({
        access_token: integration.google_access_token,
        refresh_token: integration.google_refresh_token,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get thread
    const { data: thread } = await gmail.users.threads.get({ userId: 'me', id: candidate.email_thread_id });
    const messages = thread?.messages || [];
    const replies = messages.filter(msg => {
        const from = msg.payload?.headers?.find(h => h.name === 'From')?.value || '';
        return from.includes(candidate.email);
    });

    if (replies.length === 0) {
        return res.status(200).json({ hasReply: false, message: 'No reply yet' });
    }

    const latestReply = replies[replies.length - 1];
    const replyBody = extractEmailBody(latestReply);

    // Analyze
    const candidateAvailability = await analyzeReplyWithAI(replyBody, userAvailability);
    const matchedSlots = findMatchingSlots(userAvailability, candidateAvailability);

    // Update DB
    await supabase.from('postulantes').update({
        estado_agenda: 'replied',
        email_reply_received_at: new Date().toISOString(),
        candidate_availability: candidateAvailability,
        matched_slots: matchedSlots
    }).eq('id', candidateId);

    return res.status(200).json({
        hasReply: true,
        matchedSlots,
        candidateAvailability
    });
}

async function handleConfirm(req: VercelRequest, res: VercelResponse) {
    const { candidateId, userId, slotId } = req.body;

    const [integrationResult, candidateResult, slotResult] = await Promise.all([
        supabase.from('user_integrations').select('*').eq('user_id', userId).single(),
        supabase.from('postulantes').select('*, busquedas:id_busqueda_n8n(titulo)').eq('id', candidateId).single(),
        supabase.from('availability').select('*').eq('id', slotId).single()
    ]);

    const integration = integrationResult.data;
    const candidate = candidateResult.data;
    const slot = slotResult.data;

    if (!integration || !candidate || !slot) return res.status(400).json({ error: 'Missing data' });

    oauth2Client.setCredentials({
        access_token: integration.google_access_token,
        refresh_token: integration.google_refresh_token,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Generate confirm email
    const confirmationEmail = await generateConfirmationEmail(candidate.nombre, candidate.busquedas?.titulo || 'Posición', slot);

    // Send email
    const message = createMimeMessage({ to: candidate.email, subject: confirmationEmail.subject, body: confirmationEmail.body });
    const { data: sentMessage } = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: message, threadId: candidate.email_thread_id }
    });

    // Create Calendar Event
    const { data: calendarEvent } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: `Entrevista: ${candidate.nombre}`,
            description: `Entrevista con ${candidate.nombre} (${candidate.email})`,
            start: { dateTime: new Date(slot.start_time).toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
            end: { dateTime: new Date(slot.end_time).toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
            attendees: [{ email: candidate.email }],
            conferenceData: { createRequest: { requestId: `booking-${candidate.id}-${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } }
        },
        conferenceDataVersion: 1,
        sendUpdates: 'all'
    });

    // Update DB
    await Promise.all([
        supabase.from('postulantes').update({
            estado_agenda: 'confirmed',
            fecha_entrevista: slot.start_time,
            selected_slot: slot,
            google_meet_link: calendarEvent?.hangoutLink,
            google_event_id: calendarEvent?.id
        }).eq('id', candidateId),
        supabase.from('availability').update({ is_booked: true }).eq('id', slotId)
    ]);

    return res.status(200).json({ success: true, message: 'Confirmed' });
}

// --- MAIN HANDLER ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { action } = req.query;

    console.log(`[Scheduling API] action=${action}`);

    try {
        switch (action) {
            case 'send-invite': return handleSendInvite(req, res);
            case 'check-replies': return handleCheckReplies(req, res);
            case 'confirm': return handleConfirm(req, res);
            default: return res.status(400).json({ error: `Invalid action: ${action}` });
        }
    } catch (error) {
        console.error('Scheduling API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
