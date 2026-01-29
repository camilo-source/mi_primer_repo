import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Handles the OAuth callback from Google
 * Stores the tokens in user_integrations table
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { code, state, error } = req.query;

    if (error) {
        console.error('OAuth error:', error);
        return res.redirect('/?error=google_auth_failed');
    }

    if (!code || !state) {
        return res.redirect('/?error=missing_params');
    }

    try {
        const { userId, returnUrl } = JSON.parse(state as string);

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code as string,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://mi-primer-repo-seven.vercel.app/api/auth/google/callback',
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            console.error('Token error:', tokens);
            return res.redirect('/?error=token_exchange_failed');
        }

        // Save tokens to database
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const expiryDate = new Date(Date.now() + tokens.expires_in * 1000);

        // Upsert user integration
        const { error: dbError } = await supabase
            .from('user_integrations')
            .upsert({
                user_id: userId,
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token,
                google_token_expiry: expiryDate.toISOString(),
                google_scopes: ['gmail.send', 'gmail.readonly', 'calendar.events'],
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            });

        if (dbError) {
            console.error('DB error:', dbError);
            return res.redirect('/?error=save_failed');
        }

        // Redirect back to app with success
        const successUrl = returnUrl || '/dashboard';
        return res.redirect(`${successUrl}?google_connected=true`);

    } catch (err) {
        console.error('Callback error:', err);
        return res.redirect('/?error=callback_failed');
    }
}
