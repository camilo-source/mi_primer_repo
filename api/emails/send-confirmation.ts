import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send confirmation email to candidate after booking
 * POST /api/emails/send-confirmation
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { candidateId } = req.body;

    if (!candidateId) {
        return res.status(400).json({ error: 'candidateId required' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get candidate info
        const { data: candidate, error: candidateError } = await supabase
            .from('postulantes')
            .select(`
                id,
                nombre,
                email,
                fecha_entrevista,
                selected_slot,
                google_meet_link,
                id_busqueda_n8n,
                busquedas!inner (
                    titulo
                )
            `)
            .eq('id', candidateId)
            .single();

        if (candidateError || !candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Type assertion for busquedas
        const searchTitle = (candidate.busquedas as any)?.titulo || 'N/A';

        const startTime = new Date(candidate.fecha_entrevista);
        const endTime = candidate.selected_slot?.end_time
            ? new Date(candidate.selected_slot.end_time)
            : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

        const formattedDate = format(startTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
        const formattedTime = format(startTime, 'HH:mm', { locale: es });
        const formattedEndTime = format(endTime, 'HH:mm', { locale: es });

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Entrevista</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">¡Entrevista Confirmada!</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hola <strong>${candidate.nombre}</strong>,
                </p>
                
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Tu entrevista ha sido confirmada exitosamente. A continuación encontrarás todos los detalles:
                </p>

                <!-- Interview Details Card -->
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                    <h2 style="color: #10b981; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">📋 Detalles de la Entrevista</h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                            <td style="color: rgba(255, 255, 255, 0.5); font-size: 14px; padding: 8px 0;">Posición:</td>
                            <td style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${searchTitle}</td>
                        </tr>
                        <tr>
                            <td style="color: rgba(255, 255, 255, 0.5); font-size: 14px; padding: 8px 0;">Fecha:</td>
                            <td style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <td style="color: rgba(255, 255, 255, 0.5); font-size: 14px; padding: 8px 0;">Hora:</td>
                            <td style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${formattedTime} - ${formattedEndTime}</td>
                        </tr>
                        <tr>
                            <td style="color: rgba(255, 255, 255, 0.5); font-size: 14px; padding: 8px 0;">Duración:</td>
                            <td style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">1 hora</td>
                        </tr>
                    </table>
                </div>

                ${candidate.google_meet_link ? `
                <!-- Meet Link -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${candidate.google_meet_link}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                        🎥 Unirse a Google Meet
                    </a>
                </div>
                ` : ''}

                <!-- Tips -->
                <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #3b82f6; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">💡 Consejos para la entrevista</h3>
                    <ul style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Asegúrate de tener una buena conexión a internet</li>
                        <li>Prueba tu cámara y micrófono antes de la entrevista</li>
                        <li>Busca un lugar tranquilo y bien iluminado</li>
                        <li>Llega 5 minutos antes</li>
                    </ul>
                </div>

                <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Recibirás un recordatorio 24 horas antes de la entrevista.
                </p>

                <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
                    ¡Mucha suerte! 🍀
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background: rgba(255, 255, 255, 0.02); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin: 0;">
                    Este email fue generado automáticamente por <strong>VIBE CODE ATS</strong>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        // Send email
        const { data, error } = await resend.emails.send({
            from: 'VIBE CODE ATS <noreply@vibecode.com>',
            to: [candidate.email],
            subject: `✅ Entrevista Confirmada - ${searchTitle}`,
            html: emailHtml,
        });

        if (error) {
            console.error('Email error:', error);
            return res.status(500).json({ error: 'Failed to send email' });
        }

        return res.status(200).json({
            success: true,
            messageId: data?.id,
        });

    } catch (error: any) {
        console.error('Confirmation email error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
