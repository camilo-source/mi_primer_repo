import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API Proxy para n8n webhook
 * 
 * Este endpoint actúa como proxy entre el frontend y n8n
 * para evitar problemas de CORS.
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ||
    'https://n8n.metanoian8n.com/webhook/68440768-004a-4aa8-9127-f3130b99d6ca';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[n8n Proxy] Forwarding request to n8n...');
        console.log('[n8n Proxy] Payload:', JSON.stringify(req.body, null, 2));

        // Hacer la petición a n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        console.log('[n8n Proxy] Response status:', response.status);

        // Si n8n responde OK
        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            return res.status(200).json({
                success: true,
                data
            });
        }

        // Si n8n responde con error
        const errorText = await response.text();
        console.error('[n8n Proxy] Error from n8n:', errorText);

        return res.status(response.status).json({
            success: false,
            error: errorText
        });

    } catch (error) {
        console.error('[n8n Proxy] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
