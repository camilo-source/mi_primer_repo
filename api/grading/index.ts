import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import pdf from 'pdf-parse';
import { GRADING_RUBRIC } from './rubric.js';

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
            .select('titulo, habilidades_requeridas, descripcion, empresa, requisitos_excluyentes, modalidad, ubicacion')
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

        // Truncate CV text to avoid token limits
        const truncatedCv = cvText.substring(0, 20000);

        // 3. Parallel Processing: Generate Embedding & Grade Candidate
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const gradingModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

        console.log('[Grading API] Starting Parallel AI Processing (Grading + Embedding)...');

        // A. Generate Prompt
        const prompt = `
            ROLE: Expert Technical Recruiter & Forensic CV Analyst.
            
            INPUT CONTEXT (THE RUBRIC):
            ${GRADING_RUBRIC}

            JOB DETAILS:
            - Title: ${job.titulo}
            - Description: ${job.descripcion || 'N/A'}
            - Hard Skills: ${job.habilidades_requeridas?.join(', ')}
            - Must Haves: ${job.requisitos_excluyentes?.join(', ') || 'None'}

            CANDIDATE CV:
            ${truncatedCv}

            INSTRUCTIONS:
            1. **Chain of Thought Analysis**: detection of key claims, verification of dates, and skill matching.
            2. **Evidence Extraction**: Find quotes that prove the candidate has the skills.
            3. **Anomaly Detection**: Look for logical inconsistencies (e.g., "Senior" with 1 year exp, overlapping dates that don't make sense).
            4. **Scoring**: Apply the rubric strictly.
            5. **Interview Prep**: Generate 3 hard technical/behavioral questions based on their WEAKNESSES.

            OUTPUT FORMAT (JSON ONLY):
            {
                "score": (0-100 integer),
                "reasoning": "Concise executive summary.",
                "analysis": {
                    "technical_score": (0-40),
                    "experience_score": (0-30),
                    "soft_skills_score": (0-15),
                    "relevance_score": (0-15)
                },
                "strengths": ["Strong point 1", "Strong point 2"],
                "gaps": ["Weakness 1", "Weakness 2"],
                "anomalies": ["Anomaly 1" or null],
                "interview_questions": ["Question 1", "Question 2", "Question 3"]
            }
        `;

        // B. Execute Parallel Calls
        const [gradingResult, embeddingResult] = await Promise.all([
            gradingModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            }),
            embeddingModel.embedContent(truncatedCv.substring(0, 9000)) // Limit for embedding model
        ]);

        // C. Process Grading Result
        const textOutput = gradingResult.response.text();
        console.log('[Grading API] AI Response:', textOutput);
        const aiData = JSON.parse(textOutput);

        // D. Process Embedding Result
        const embeddingValues = embeddingResult.embedding.values;
        console.log('[Grading API] Embedding Generated. Dimensions:', embeddingValues.length);

        // E. Format Rich Summary
        const richSummary = `
${aiData.reasoning}

✅ Strengths:
${aiData.strengths.map((s: string) => `• ${s}`).join('\n')}

⚠️ Gaps:
${aiData.gaps.map((s: string) => `• ${s}`).join('\n')}

${aiData.anomalies && aiData.anomalies.length > 0 ? `🚩 Anomalies Detected:\n${aiData.anomalies.map((s: string) => `• ${s}`).join('\n')}\n` : ''}
🎤 Suggested Interview Questions:
${aiData.interview_questions.map((q: string) => `• ${q}`).join('\n')}
        `.trim();

        // 4. Update Database
        const { error: updateError } = await supabase
            .from('postulantes')
            .update({
                score_ia: aiData.score,
                resumen_ia: richSummary,
                analisis_json: aiData, // Save raw JSON for Radar Chart
                estado: 'clasificado',
                embedding: embeddingValues
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
