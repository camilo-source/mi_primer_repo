import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Initiates Google OAuth flow for Gmail and Calendar permissions
 * This is SEPARATE from Supabase login - it's for email functionality
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { userId, returnUrl } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events',
    ].join(' ');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://mi-primer-repo-seven.vercel.app/api/auth/google/callback';

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId!);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', JSON.stringify({ userId, returnUrl: returnUrl || '/' }));

    return res.redirect(302, authUrl.toString());
}
