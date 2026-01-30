import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BackgroundBeams } from '../components/ui/background-beams';
import { Spotlight } from '../components/ui/spotlight';
import { Upload, User, Mail, Phone, FileText, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';

interface JobInfo {
    titulo: string;
    empresa: string;
    nombre_del_puesto: string;
    modalidad: string;
    ubicacion: string;
    habilidades_requeridas: string[];
}

export default function Apply() {
    const { jobId } = useParams<{ jobId: string }>();
    const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        linkedin: '',
    });
    const [cvFile, setCvFile] = useState<File | null>(null);

    // Cargar información del puesto
    useEffect(() => {
        const fetchJobInfo = async () => {
            if (!jobId) {
                setError('ID de búsqueda no válido');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('busquedas')
                    .select('titulo, empresa, nombre_del_puesto, modalidad, ubicacion, habilidades_requeridas')
                    .eq('id_busqueda_n8n', jobId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Búsqueda no encontrada');

                setJobInfo(data);
            } catch (err) {
                console.error('Error fetching job:', err);
                setError('No se encontró la búsqueda solicitada');
            } finally {
                setLoading(false);
            }
        };

        fetchJobInfo();
    }, [jobId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Solo se permiten archivos PDF o Word');
                return;
            }
            // Validar tamaño (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('El archivo no puede superar 5MB');
                return;
            }
            setCvFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cvFile) {
            setError('Por favor, subí tu CV');
            return;
        }

        if (!formData.nombre || !formData.email) {
            setError('Nombre y email son obligatorios');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 1. Subir CV a Supabase Storage
            const fileExt = cvFile.name.split('.').pop();
            const fileName = `${jobId}/${Date.now()}_${formData.email.replace('@', '_at_')}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('cvs')
                .upload(fileName, cvFile);

            if (uploadError) throw uploadError;

            // 2. Obtener URL pública del CV
            const { data: urlData } = supabase.storage
                .from('cvs')
                .getPublicUrl(fileName);

            const cvUrl = urlData.publicUrl;

            // 3. Guardar postulante en la base de datos
            const { error: insertError } = await supabase
                .from('postulantes')
                .insert({
                    id_busqueda_n8n: jobId,
                    nombre: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono || null,
                    linkedin: formData.linkedin || null,
                    cv_url: cvUrl,
                    estado: 'nuevo',
                    score_ia: null,
                    resumen_ia: null,
                });

            if (insertError) throw insertError;

            // 4. Disparar webhook a n8n para análisis de IA (opcional)
            // Esto se puede hacer después si queremos que n8n analice el CV

            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting application:', err);
            setError('Hubo un error al enviar tu postulación. Por favor, intentá de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Error o búsqueda no encontrada
    if (error && !jobInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
                <GlassCard className="max-w-md w-full p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">Error</h1>
                    <p className="text-[var(--text-muted)]">{error}</p>
                </GlassCard>
            </div>
        );
    }

    // Postulación exitosa
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <BackgroundBeams />
                <GlassCard className="max-w-md w-full p-8 text-center relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">¡Postulación enviada!</h1>
                    <p className="text-[var(--text-muted)] mb-6">
                        Gracias por tu interés en <span className="text-emerald-500 font-semibold">{jobInfo?.nombre_del_puesto}</span>.
                        Revisaremos tu perfil y te contactaremos pronto.
                    </p>
                    <div className="text-sm text-[var(--text-muted)] opacity-60">
                        Powered by <span className="text-emerald-500">VIBE CODE</span> ATS
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundBeams />
            <Spotlight className="top-40 left-0 md:left-60" fill="emerald" />

            <div className="max-w-2xl w-full relative z-10 space-y-6">
                {/* Header con info del puesto */}
                <GlassCard className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <Briefcase className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-emerald-500 font-medium mb-1">
                                {jobInfo?.empresa || 'Empresa'}
                            </p>
                            <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
                                {jobInfo?.nombre_del_puesto || jobInfo?.titulo || 'Puesto'}
                            </h1>
                            <div className="flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
                                {jobInfo?.modalidad && (
                                    <span className="px-2 py-1 bg-[var(--card-bg)] rounded-lg">
                                        📍 {jobInfo.modalidad}
                                    </span>
                                )}
                                {jobInfo?.ubicacion && (
                                    <span className="px-2 py-1 bg-[var(--card-bg)] rounded-lg">
                                        🌍 {jobInfo.ubicacion}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skills requeridas */}
                    {jobInfo?.habilidades_requeridas && jobInfo.habilidades_requeridas.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                            <p className="text-sm text-[var(--text-muted)] mb-2">Habilidades requeridas:</p>
                            <div className="flex flex-wrap gap-2">
                                {jobInfo.habilidades_requeridas.slice(0, 6).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {jobInfo.habilidades_requeridas.length > 6 && (
                                    <span className="px-3 py-1 text-[var(--text-muted)] text-sm">
                                        +{jobInfo.habilidades_requeridas.length - 6} más
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Formulario de postulación */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-[var(--text-main)] mb-6">
                        Completá tu postulación
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                <User size={14} className="inline mr-2" />
                                Nombre completo *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                                placeholder="Tu nombre completo"
                                className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--card-border)] rounded-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                <Mail size={14} className="inline mr-2" />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--card-border)] rounded-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                <Phone size={14} className="inline mr-2" />
                                Teléfono (opcional)
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="+54 11 1234-5678"
                                className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--card-border)] rounded-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                🔗 LinkedIn (opcional)
                            </label>
                            <input
                                type="url"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleInputChange}
                                placeholder="https://linkedin.com/in/tu-perfil"
                                className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--card-border)] rounded-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {/* Upload CV */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                <FileText size={14} className="inline mr-2" />
                                Subí tu CV *
                            </label>
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-emerald-500/50 ${cvFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--card-border)]'
                                    }`}
                                onClick={() => document.getElementById('cv-upload')?.click()}
                            >
                                <input
                                    id="cv-upload"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {cvFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        <span className="text-emerald-500 font-medium">{cvFile.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
                                        <p className="text-[var(--text-muted)]">
                                            Hacé click para subir tu CV
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)] opacity-60 mt-1">
                                            PDF o Word, máx. 5MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            isLoading={submitting}
                            className="w-full py-4 text-lg font-bold"
                        >
                            {submitting ? 'Enviando...' : 'Enviar postulación'}
                        </Button>

                        <p className="text-xs text-center text-[var(--text-muted)] opacity-60">
                            Al enviar, aceptás que tus datos sean procesados para esta búsqueda laboral.
                        </p>
                    </form>
                </GlassCard>

                {/* Footer */}
                <div className="text-center text-sm text-[var(--text-muted)] opacity-60">
                    Powered by <span className="text-emerald-500 font-semibold">VIBE CODE</span> ATS
                </div>
            </div>
        </div>
    );
}
