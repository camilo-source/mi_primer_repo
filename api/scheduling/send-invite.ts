import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { randomUUID } from 'crypto';

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for backend
);

// Configure Google OAuth
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

interface SendInviteRequest {
    candidateId: string;
    userId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { candidateId, userId } = req.body as SendInviteRequest;

        // 1. Get user's Google tokens from database
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (integrationError || !integration) {
            return res.status(401).json({
                error: 'Google integration not found',
                needsAuth: true
            });
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

        // 3. Generate booking token if candidate doesn't have one
        let bookingToken = candidate.booking_token;
        if (!bookingToken) {
            bookingToken = randomUUID();
            await supabase
                .from('postulantes')
                .update({ booking_token: bookingToken })
                .eq('id', candidateId);
        }

        // 4. Build the booking URL
        const bookingUrl = `https://mi-primer-repo-seven.vercel.app/book/${bookingToken}`;

        // 5. Set up Google OAuth with stored tokens
        oauth2Client.setCredentials({
            access_token: integration.google_access_token,
            refresh_token: integration.google_refresh_token,
        });

        // Handle token refresh if needed
        if (new Date(integration.google_token_expiry) < new Date()) {
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Save new tokens
            await supabase
                .from('user_integrations')
                .update({
                    google_access_token: credentials.access_token,
                    google_token_expiry: new Date(credentials.expiry_date!).toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            oauth2Client.setCredentials(credentials);
        }

        // 6. Generate email with AI (using Gemini) - NOW WITH BOOKING LINK
        const emailContent = await generateEmailWithAI(
            candidate.nombre,
            candidate.busquedas?.titulo || 'the position',
            bookingUrl
        );

        // 7. Send email via Gmail API
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const message = createMimeMessage({
            to: candidate.email,
            subject: emailContent.subject,
            body: emailContent.body
        });

        const { data: sentMessage } = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: message
            }
        });

        // 8. Update candidate status and save thread ID
        await supabase
            .from('postulantes')
            .update({
                estado_agenda: 'sent',
                email_thread_id: sentMessage?.threadId,
                email_sent_at: new Date().toISOString()
            })
            .eq('id', candidateId);

        // 9. Log the email
        await supabase
            .from('email_logs')
            .insert({
                user_id: userId,
                candidate_id: candidateId,
                email_type: 'invite',
                gmail_message_id: sentMessage?.id,
                gmail_thread_id: sentMessage?.threadId,
                subject: emailContent.subject,
                body_preview: emailContent.body.substring(0, 200)
            });

        return res.status(200).json({
            success: true,
            message: 'Invitation sent successfully',
            threadId: sentMessage?.threadId,
            bookingUrl
        });

    } catch (error) {
        console.error('Error sending invite:', error);
        return res.status(500).json({ error: 'Failed to send invitation' });
    }
}

// Helper: Generate email content with Gemini AI
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
