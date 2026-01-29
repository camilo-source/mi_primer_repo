import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Landing() {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleLogin = async () => {
        setLoading(true);

        let redirectBase = window.location.origin;
        if (!redirectBase.includes('localhost')) {
            redirectBase = 'https://mi-primer-repo-seven.vercel.app';
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${redirectBase}/dashboard`
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error);
            addToast('Error al conectar con Google', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

            <GlassCard className="max-w-md w-full relative z-10 shadow-2xl animate-fade-in text-center py-12 px-8">

                <div className="mb-8 flex justify-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-inner">
                        <Sparkles className="w-12 h-12 text-emerald-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-300 dark:to-white mb-2 font-display">
                    GreenGlass ATS
                </h1>
                <p className="text-[var(--text-muted)] mb-8 text-lg font-light">
                    Sistema de Seguimiento de Candidatos
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={handleLogin}
                        isLoading={loading}
                        className="w-full font-bold py-6 text-lg"
                        icon={!loading && <ArrowRight className="w-5 h-5 ml-1" />}
                    >
                        Continuar con Google
                    </Button>

                    <p className="text-xs text-[var(--text-muted)] mt-6 opacity-60">
                        Acceso seguro via Supabase Authentication
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}
