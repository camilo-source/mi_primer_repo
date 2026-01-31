import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import pdf from 'pdf-parse';

// Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Clients
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!GEMINI_API_KEY) {
        console.error('❌ Missing GEMINI_API_KEY');
        return res.status(500).json({ error: 'Server configuration error (Missing AI Key)' });
    }

    try {
        const { jobId, candidate } = req.body;

        if (!jobId || !candidate) {
            return res.status(400).json({ error: 'Missing jobId or candidate data' });
        }

        console.log(`[Grading API] Processing candidate: ${candidate.email} for Job: ${jobId}`);

        // 1. Fetch Job Description
        const { data: job, error: jobError } = await supabase
            .from('busquedas')
            .select('titulo, habilidades_requeridas, descripcion, empresa')
            .eq('id_busqueda_n8n', jobId)
            .single();

        if (jobError || !job) {
            throw new Error(`Job not found: ${jobId}`);
        }

        // 2. Fetch CV Text (PDF/Doc)
        let cvText = '';
        if (candidate.cv_text_or_url.startsWith('http')) {
            console.log('[Grading API] Fetching CV from URL:', candidate.cv_text_or_url);
            const response = await fetch(candidate.cv_text_or_url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            try {
                const pdfData = await pdf(buffer);
                cvText = pdfData.text; // Extract text from PDF
                console.log('[Grading API] PDF Parsed. Length:', cvText.length);
            } catch (pdfError) {
                console.warn('[Grading API] PDF Parse failed, using raw buffer as failover?', pdfError);
                cvText = "CV Content: (Could not parse PDF file). Please review manually.";
            }
        } else {
            cvText = candidate.cv_text_or_url; // Assume it's text
        }

        // Truncate CV text to avoid token limits (approx 10k chars should be enough)
        const truncatedCv = cvText.substring(0, 15000);

        // 3. Prompt Gemini
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            ROLE: Expert Technical Recruiter & Talent Analyst.
            TASK: Analyze the candidate's CV against the Job Description.

            JOB DETAILS:
            - Title: ${job.titulo}
            - Company: ${job.empresa}
            - Required Skills: ${job.habilidades_requeridas?.join(', ')}
            - Description: ${job.descripcion || 'N/A'}

            CANDIDATE CV:
            ${truncatedCv}

            OUTPUT FORMAT (JSON ONLY):
            {
                "score": (0-100 integer),
                "reasoning": "Concise executive summary explaining the score (max 2 sentences).",
                "strengths": ["List", "of", "3", "key", "strengths"],
                "gaps": ["List", "of", "weaknesses" or "missing skills"],
                "interview_questions": ["3 strategic questions to verify skills"]
            }
        `;

        console.log('[Grading API] Sending prompt to Gemini...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const textOutput = result.response.text();
        console.log('[Grading API] AI Response:', textOutput);

        const aiData = JSON.parse(textOutput);

        // 4. Update Database
        const { error: updateError } = await supabase
            .from('postulantes')
            .update({
                score_ia: aiData.score,
                resumen_ia: aiData.reasoning,
                estado: 'clasificado'
            })
            .eq('id_busqueda_n8n', jobId)
            .eq('email', candidate.email);

        if (updateError) {
            console.error('[Grading API] DB Update Error:', updateError);
            throw updateError;
        }

        return res.status(200).json({
            success: true,
            data: aiData
        });

    } catch (error: any) {
        console.error('[Grading API] Critical Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
