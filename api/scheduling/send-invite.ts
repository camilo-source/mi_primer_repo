import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

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

        // 3. Get user's availability
        const { data: availability } = await supabase
            .from('availability')
            .select('*')
            .eq('user_id', userId)
            .eq('is_booked', false)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(10);

        // 4. Set up Google OAuth with stored tokens
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

        // 5. Generate email with AI (using Gemini)
        const emailContent = await generateEmailWithAI(
            candidate.nombre,
            candidate.busquedas?.titulo || 'the position',
            availability || []
        );

        // 6. Send email via Gmail API
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

        // 7. Update candidate status and save thread ID
        await supabase
            .from('postulantes')
            .update({
                estado_agenda: 'sent',
                email_thread_id: sentMessage?.threadId,
                email_sent_at: new Date().toISOString()
            })
            .eq('id', candidateId);

        // 8. Log the email
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
            threadId: sentMessage?.threadId
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
    availableSlots: any[]
) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const slotsText = availableSlots.map(slot => {
        const date = new Date(slot.start_time);
        return `- ${date.toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric' })} a las ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    }).join('\n');

    const prompt = `
You are a professional HR assistant. Write a friendly and professional email in Spanish to invite a candidate for an interview.

Candidate Name: ${candidateName}
Position: ${positionTitle}
Available Time Slots:
${slotsText}

The email should:
1. Be warm and professional
2. Congratulate them for advancing in the process
3. List the available time slots clearly
4. Ask them to reply with their preferred time or suggest alternatives
5. Keep it concise (max 150 words)

Return JSON format:
{
  "subject": "email subject line",
  "body": "email body in plain text"
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

    // Fallback
    return {
        subject: `Invitación a entrevista - ${positionTitle}`,
        body: `Hola ${candidateName},\n\nNos gustaría invitarte a una entrevista...`
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
