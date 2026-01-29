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

interface CheckRepliesRequest {
    candidateId: string;
    userId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { candidateId, userId } = req.body as CheckRepliesRequest;

        // 1. Get user's integration and candidate details
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

        // 2. Set up Gmail API
        oauth2Client.setCredentials({
            access_token: integration.google_access_token,
            refresh_token: integration.google_refresh_token,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // 3. Get thread messages
        const { data: thread } = await gmail.users.threads.get({
            userId: 'me',
            id: candidate.email_thread_id,
            format: 'full'
        });

        const messages = thread?.messages || [];

        // Find replies (messages not from user)
        const replies = messages.filter(msg => {
            const from = msg.payload?.headers?.find(h => h.name === 'From')?.value || '';
            return from.includes(candidate.email);
        });

        if (replies.length === 0) {
            return res.status(200).json({
                hasReply: false,
                message: 'No reply yet'
            });
        }

        // 4. Get the latest reply content
        const latestReply = replies[replies.length - 1];
        const replyBody = extractEmailBody(latestReply);

        // 5. Use AI to analyze candidate's availability
        const candidateAvailability = await analyzeReplyWithAI(replyBody, userAvailability);

        // 6. Find matching slots
        const matchedSlots = findMatchingSlots(userAvailability, candidateAvailability);

        // 7. Update candidate record
        await supabase
            .from('postulantes')
            .update({
                estado_agenda: 'replied',
                email_reply_received_at: new Date().toISOString(),
                candidate_availability: candidateAvailability,
                matched_slots: matchedSlots
            })
            .eq('id', candidateId);

        // 8. Log the incoming email
        await supabase
            .from('email_logs')
            .insert({
                user_id: userId,
                candidate_id: candidateId,
                email_type: 'reply',
                gmail_message_id: latestReply.id,
                gmail_thread_id: candidate.email_thread_id,
                subject: 'Re: ' + (latestReply.payload?.headers?.find(h => h.name === 'Subject')?.value || ''),
                body_preview: replyBody.substring(0, 200),
                direction: 'inbound'
            });

        return res.status(200).json({
            hasReply: true,
            matchedSlots,
            candidateAvailability,
            message: 'Reply analyzed successfully'
        });

    } catch (error) {
        console.error('Error checking replies:', error);
        return res.status(500).json({ error: 'Failed to check replies' });
    }
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
async function analyzeReplyWithAI(replyText: string, userSlots: any[]): Promise<any[]> {
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
