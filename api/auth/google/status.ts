import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Check if user has Google integration set up
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase
            .from('user_integrations')
            .select('id, google_token_expiry, google_scopes')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return res.status(200).json({
                connected: false,
                message: 'Google not connected'
            });
        }

        // Check if token is expired
        const isExpired = new Date(data.google_token_expiry) < new Date();

        return res.status(200).json({
            connected: true,
            expired: isExpired,
            scopes: data.google_scopes
        });

    } catch (err) {
        console.error('Check status error:', err);
        return res.status(500).json({ error: 'Failed to check status' });
    }
}
