import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, Zap, Users, Calendar, Shield, TrendingUp, CheckCircle, Bot, Search, Mail } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';

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
        <div className="min-h-screen flex flex-col overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[var(--bg-primary)]" />
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/20 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-transparent rounded-full blur-3xl"
                />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-xl bg-[var(--card-bg)]/80 border border-[var(--card-border)] rounded-2xl px-6 py-3 shadow-lg"
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                        >
                            <Sparkles className="w-5 h-5 text-white" />
                        </motion.div>
                        <span className="text-xl font-bold text-[var(--text-main)]">
                            VIBE<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">CODE</span>
                        </span>
                    </div>
                    <Button
                        onClick={handleLogin}
                        isLoading={loading}
                        size="sm"
                        className="shadow-lg shadow-emerald-500/20"
                    >
                        Iniciar Sesión
                    </Button>
                </motion.div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-16">
                <div className="max-w-5xl w-full text-center space-y-12">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium shadow-lg"
                    >
                        <Bot size={16} className="animate-pulse" />
                        <span>Sistema de Reclutamiento con IA</span>
                        <Sparkles size={14} />
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-6"
                    >
                        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                            <span className="text-[var(--text-main)]">Encontrá al </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-[length:200%_100%] animate-gradient">
                                mejor talento
                            </span>
                            <br />
                            <span className="text-[var(--text-main)]">más rápido que nunca</span>
                        </h1>
                        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Automatizá tu proceso de reclutamiento con Inteligencia Artificial.
                            <span className="block mt-2 font-medium text-[var(--text-secondary)]">
                                Publicá vacantes, evaluá candidatos y agendá entrevistas en minutos.
                            </span>
                        </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button
                            onClick={handleLogin}
                            isLoading={loading}
                            className="px-10 py-5 text-lg font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                            icon={!loading && <ArrowRight className="w-5 h-5" />}
                        >
                            Comenzar Gratis
                        </Button>
                        <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            Sin tarjeta de crédito • Acceso inmediato
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="grid grid-cols-3 gap-6 max-w-lg mx-auto pt-8"
                    >
                        {[
                            { value: '90%', label: 'Menos tiempo', color: 'emerald' },
                            { value: '3x', label: 'Más candidatos', color: 'purple' },
                            { value: '100%', label: 'IA Powered', color: 'amber' },
                        ].map((stat) => (
                            <motion.div
                                key={stat.label}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="text-center p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg"
                            >
                                <p className={`text-3xl font-black text-${stat.color}-500`}>{stat.value}</p>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>

            {/* Features Section */}
            <section className="px-6 py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--card-bg)]/50 to-transparent" />
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            Todo lo que necesitás para reclutar
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-xl mx-auto text-lg">
                            Una plataforma completa que automatiza cada paso del proceso de selección
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Search,
                                title: 'Búsqueda Inteligente',
                                description: 'Definí requisitos y la IA encuentra candidatos que mejor se ajustan al perfil buscado.',
                                color: 'emerald',
                                gradient: 'from-emerald-500/20 to-teal-500/10'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Evaluación con IA',
                                description: 'Análisis automático de CVs con puntuación inteligente basada en los requisitos del puesto.',
                                color: 'purple',
                                gradient: 'from-purple-500/20 to-pink-500/10'
                            },
                            {
                                icon: Calendar,
                                title: 'Agenda Integrada',
                                description: 'Candidatos eligen horarios disponibles. Entrevistas confirmadas automáticamente.',
                                color: 'amber',
                                gradient: 'from-amber-500/20 to-orange-500/10'
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`
                                    p-8 rounded-3xl 
                                    bg-gradient-to-br ${feature.gradient}
                                    border border-[var(--card-border)]
                                    shadow-xl hover:shadow-2xl
                                    transition-all duration-300
                                    group
                                `}
                            >
                                <div className={`
                                    w-16 h-16 rounded-2xl 
                                    bg-${feature.color}-500/10 
                                    flex items-center justify-center 
                                    mb-6 
                                    group-hover:bg-${feature.color}-500/20 
                                    group-hover:scale-110
                                    transition-all duration-300
                                    shadow-lg
                                `}>
                                    <feature.icon className={`w-8 h-8 text-${feature.color}-500`} />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-3">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="px-6 py-24">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            ¿Cómo funciona?
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-xl mx-auto text-lg">
                            En 3 simples pasos comenzás a recibir candidatos calificados
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-amber-500 opacity-30" />

                        {[
                            { step: '01', title: 'Creá tu búsqueda', desc: 'Definí el perfil, requisitos y skills necesarias', icon: Zap },
                            { step: '02', title: 'La IA trabaja', desc: 'Analizamos candidatos y los puntuamos automáticamente', icon: Bot },
                            { step: '03', title: 'Agendá entrevistas', desc: 'Los mejores candidatos reservan en tu calendario', icon: Mail },
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="relative text-center"
                            >
                                <div className="relative inline-flex mb-6">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                                        <item.icon className="w-10 h-10 text-white" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--card-bg)] border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-500 shadow-lg">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                                <p className="text-[var(--text-muted)]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="px-6 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex flex-wrap justify-center gap-8 items-center">
                        {[
                            { icon: Shield, text: 'Datos seguros', color: 'emerald' },
                            { icon: Users, text: '+500 empresas', color: 'purple' },
                            { icon: CheckCircle, text: 'Soporte 24/7', color: 'amber' },
                        ].map((item) => (
                            <motion.div
                                key={item.text}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md"
                            >
                                <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                                <span className="text-sm font-medium text-[var(--text-secondary)]">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-emerald-500/10 border border-[var(--card-border)] shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4">
                            ¿Listo para transformar tu reclutamiento?
                        </h2>
                        <p className="text-[var(--text-muted)] mb-8 text-lg">
                            Unite a cientos de empresas que ya automatizaron su proceso de selección
                        </p>
                        <Button
                            onClick={handleLogin}
                            isLoading={loading}
                            className="px-10 py-5 text-lg font-bold shadow-2xl shadow-emerald-500/30"
                            icon={!loading && <Sparkles className="w-5 h-5" />}
                        >
                            Comenzar Ahora
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-muted)]">VIBE CODE © 2026</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        Powered by Supabase, n8n & OpenAI
                    </p>
                </div>
            </footer>
        </div>
    );
}
