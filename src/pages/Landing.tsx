import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);

        // Robust redirect logic
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
            alert('Error connecting to Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]" />

            <GlassCard className="max-w-md w-full relative z-10 border-white/30 shadow-2xl animate-fade-in text-center py-12 px-8">

                <div className="mb-8 flex justify-center">
                    <div className="p-4 bg-white/10 rounded-full border border-white/20 shadow-inner">
                        <Sparkles className="w-12 h-12 text-emerald-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-white mb-2 font-display">
                    Liquid Glass
                </h1>
                <p className="text-emerald-100/80 mb-8 text-lg font-light">
                    Advanced Candidate Tracking System
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-3 bg-white text-emerald-900 font-semibold py-3.5 px-6 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Connecting...' : 'Continue with Google'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <p className="text-xs text-white/40 mt-6">
                        Secure access via Supabase Authentication
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}
