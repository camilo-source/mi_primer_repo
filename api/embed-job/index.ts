import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    try {
        const { titulo, descripcion, habilidades_requeridas } = req.body;

        if (!titulo) {
            return res.status(400).json({ error: 'titulo is required' });
        }

        // Build a comprehensive job description for embedding
        const jobContext = [
            `Título: ${titulo}`,
            descripcion ? `Descripción: ${descripcion}` : '',
            habilidades_requeridas?.length > 0
                ? `Habilidades requeridas: ${habilidades_requeridas.join(', ')}`
                : ''
        ].filter(Boolean).join('\n\n');

        console.log('[embed-job] Generating embedding for:', jobContext.substring(0, 100) + '...');

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const result = await model.embedContent(jobContext);
        const embedding = result.embedding.values;

        console.log('[embed-job] Embedding generated, dimension:', embedding.length);

        return res.status(200).json({ embedding });
    } catch (error) {
        console.error('[embed-job] Error:', error);
        return res.status(500).json({
            error: 'Failed to generate embedding',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
