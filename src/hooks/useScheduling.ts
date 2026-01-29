import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

type SchedulingStatus = 'idle' | 'sending' | 'checking' | 'confirming';

interface MatchedSlot {
    id: string;
    start_time: string;
    end_time: string;
}

interface UseSchedulingReturn {
    status: SchedulingStatus;
    matchedSlots: MatchedSlot[];
    sendInvite: (candidateId: string) => Promise<boolean>;
    checkReplies: (candidateId: string) => Promise<boolean>;
    confirmSlot: (candidateId: string, slotId: string) => Promise<boolean>;
    needsGoogleAuth: boolean;
    initiateGoogleAuth: () => void;
}

export function useScheduling(): UseSchedulingReturn {
    const [status, setStatus] = useState<SchedulingStatus>('idle');
    const [matchedSlots, setMatchedSlots] = useState<MatchedSlot[]>([]);
    const [needsGoogleAuth, setNeedsGoogleAuth] = useState(false);
    const { addToast } = useToast();

    // Get current user ID
    const getUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id;
    };

    // Send invitation email with AI-generated content
    const sendInvite = useCallback(async (candidateId: string): Promise<boolean> => {
        setStatus('sending');

        try {
            const userId = await getUserId();
            if (!userId) throw new Error('Not authenticated');

            const response = await fetch('/api/scheduling/send-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, userId })
            });

            const data = await response.json();

            if (data.needsAuth) {
                setNeedsGoogleAuth(true);
                addToast('Necesitas conectar tu cuenta de Google', 'warning');
                return false;
            }

            if (!response.ok) throw new Error(data.error);

            addToast('📧 Invitación enviada correctamente', 'success');
            return true;

        } catch (error) {
            console.error('Send invite error:', error);
            addToast('Error al enviar la invitación', 'error');
            return false;
        } finally {
            setStatus('idle');
        }
    }, [addToast]);

    // Check for candidate replies
    const checkReplies = useCallback(async (candidateId: string): Promise<boolean> => {
        setStatus('checking');

        try {
            const userId = await getUserId();
            if (!userId) throw new Error('Not authenticated');

            const response = await fetch('/api/scheduling/check-replies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, userId })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            if (data.hasReply && data.matchedSlots?.length > 0) {
                setMatchedSlots(data.matchedSlots);
                addToast(`✅ Respuesta recibida! ${data.matchedSlots.length} horarios compatibles`, 'success');
                return true;
            } else if (data.hasReply) {
                addToast('El candidato respondió pero no hay horarios compatibles', 'warning');
                return false;
            } else {
                addToast('Aún no hay respuesta del candidato', 'info');
                return false;
            }

        } catch (error) {
            console.error('Check replies error:', error);
            addToast('Error al verificar respuestas', 'error');
            return false;
        } finally {
            setStatus('idle');
        }
    }, [addToast]);

    // Confirm a specific slot
    const confirmSlot = useCallback(async (candidateId: string, slotId: string): Promise<boolean> => {
        setStatus('confirming');

        try {
            const userId = await getUserId();
            if (!userId) throw new Error('Not authenticated');

            const response = await fetch('/api/scheduling/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, userId, slotId })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            addToast('🎉 ¡Entrevista confirmada! Evento creado en Google Calendar', 'success');
            setMatchedSlots([]);
            return true;

        } catch (error) {
            console.error('Confirm slot error:', error);
            addToast('Error al confirmar la entrevista', 'error');
            return false;
        } finally {
            setStatus('idle');
        }
    }, [addToast]);

    // Initiate Google OAuth for additional permissions
    const initiateGoogleAuth = useCallback(() => {
        // Redirect to Google OAuth with required scopes
        const scopes = [
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/calendar.events'
        ].join(' ');

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/google/callback`;

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        window.location.href = authUrl.toString();
    }, []);

    return {
        status,
        matchedSlots,
        sendInvite,
        checkReplies,
        confirmSlot,
        needsGoogleAuth,
        initiateGoogleAuth
    };
}
