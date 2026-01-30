import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, Zap, Users, Calendar } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { BackgroundBeams } from '../components/ui/background-beams';
import { Spotlight } from '../components/ui/spotlight';
import { TextGenerateEffect } from '../components/ui/text-generate-effect';

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
            {/* Background Effects */}
            <BackgroundBeams />
            <Spotlight className="top-40 left-0 md:left-60" fill="emerald" />

            {/* Decorative Blurs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] animate-apple-float" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-apple-float" style={{ animationDelay: '1s' }} />

            <div className="max-w-4xl w-full relative z-10 space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-6 animate-apple-fade-in">
                    <div className="flex justify-center mb-6">
                        <div className="p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-inner animate-apple-glow-pulse">
                            <Sparkles className="w-16 h-16 text-emerald-500 animate-apple-float" />
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-4">
                        VIBE CODE ATS
                    </h1>

                    <TextGenerateEffect
                        words="Revolucioná tu proceso de reclutamiento con IA"
                        className="text-2xl md:text-3xl text-[var(--text-secondary)] font-light"
                    />

                    <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
                        Sistema de Reclutamiento Inteligente potenciado con IA para encontrar, evaluar y contratar al mejor talento más rápido que nunca
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
                    <GlassCard glow hover className="p-6 text-center apple-hover-lift">
                        <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/20 rounded-xl flex items-center justify-center animate-apple-spring">
                            <Zap className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">IA Inteligente</h3>
                        <p className="text-sm text-[var(--text-muted)]">
                            Análisis automático de CVs y matching de candidatos
                        </p>
                    </GlassCard>

                    <GlassCard glow hover className="p-6 text-center apple-hover-lift" style={{ animationDelay: '0.1s' }}>
                        <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center animate-apple-spring" style={{ animationDelay: '0.1s' }}>
                            <Calendar className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Calendario Integrado</h3>
                        <p className="text-sm text-[var(--text-muted)]">
                            Agendá entrevistas sin esfuerzo con Google Calendar
                        </p>
                    </GlassCard>

                    <GlassCard glow hover className="p-6 text-center apple-hover-lift" style={{ animationDelay: '0.2s' }}>
                        <div className="w-12 h-12 mx-auto mb-4 bg-amber-500/20 rounded-xl flex items-center justify-center animate-apple-spring" style={{ animationDelay: '0.2s' }}>
                            <Users className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Colaboración</h3>
                        <p className="text-sm text-[var(--text-muted)]">
                            Trabajá en equipo en tiempo real
                        </p>
                    </GlassCard>
                </div>

                {/* CTA Section */}
                <div className="text-center animate-apple-scale-in" style={{ animationDelay: '0.4s' }}>
                    <GlassCard className="max-w-md mx-auto p-8 glow-border">
                        <Button
                            onClick={handleLogin}
                            isLoading={loading}
                            className="w-full font-bold py-6 text-lg apple-press apple-hover-glow transition-all duration-300 ease-apple"
                            icon={!loading && <ArrowRight className="w-5 h-5 ml-1" />}
                        >
                            Continuar con Google
                        </Button>

                        <p className="text-xs text-[var(--text-muted)] mt-6 opacity-60">
                            Acceso seguro vía Supabase Authentication
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
