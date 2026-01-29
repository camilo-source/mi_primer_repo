import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

type SchedulingStatus = 'idle' | 'sending' | 'checking' | 'confirming';

interface MatchedSlot {
    id: string;
    start_time: string;
    end_time: string;
}

interface GoogleStatus {
    connected: boolean;
    expired?: boolean;
}

interface UseSchedulingReturn {
    status: SchedulingStatus;
    matchedSlots: MatchedSlot[];
    sendInvite: (candidateId: string) => Promise<boolean>;
    checkReplies: (candidateId: string) => Promise<boolean>;
    confirmSlot: (candidateId: string, slotId: string) => Promise<boolean>;
    googleStatus: GoogleStatus;
    checkGoogleConnection: () => Promise<void>;
    connectGoogle: () => void;
    isCheckingGoogle: boolean;
}

export function useScheduling(): UseSchedulingReturn {
    const [status, setStatus] = useState<SchedulingStatus>('idle');
    const [matchedSlots, setMatchedSlots] = useState<MatchedSlot[]>([]);
    const [googleStatus, setGoogleStatus] = useState<GoogleStatus>({ connected: false });
    const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);
    const { addToast } = useToast();

    // Get current user ID
    const getUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id;
    };

    // Check if Google is connected
    const checkGoogleConnection = useCallback(async () => {
        setIsCheckingGoogle(true);
        try {
            const userId = await getUserId();
            if (!userId) {
                setGoogleStatus({ connected: false });
                return;
            }

            const response = await fetch(`/api/auth/google/status?userId=${userId}`);
            const data = await response.json();

            setGoogleStatus({
                connected: data.connected,
                expired: data.expired
            });
        } catch (error) {
            console.error('Error checking Google status:', error);
            setGoogleStatus({ connected: false });
        } finally {
            setIsCheckingGoogle(false);
        }
    }, []);

    // Check Google connection on mount
    useEffect(() => {
        checkGoogleConnection();
    }, [checkGoogleConnection]);

    // Redirect to Google OAuth
    const connectGoogle = useCallback(async () => {
        const userId = await getUserId();
        if (!userId) {
            addToast('Debes iniciar sesión primero', 'error');
            return;
        }

        const returnUrl = window.location.pathname;
        window.location.href = `/api/auth/google?userId=${userId}&returnUrl=${encodeURIComponent(returnUrl)}`;
    }, [addToast]);

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

    return {
        status,
        matchedSlots,
        sendInvite,
        checkReplies,
        confirmSlot,
        googleStatus,
        checkGoogleConnection,
        connectGoogle,
        isCheckingGoogle
    };
}
