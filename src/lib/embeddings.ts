import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateJobEmbedding(
    titulo: string,
    descripcion?: string,
    habilidades_requeridas?: string[]
): Promise<number[] | null> {
    if (!GEMINI_API_KEY) {
        console.error('[generateJobEmbedding] VITE_GEMINI_API_KEY not configured');
        return null;
    }

    try {
        // Build a comprehensive job description for embedding
        const jobContext = [
            `Título: ${titulo}`,
            descripcion ? `Descripción: ${descripcion}` : '',
            habilidades_requeridas?.length
                ? `Habilidades requeridas: ${habilidades_requeridas.join(', ')}`
                : ''
        ].filter(Boolean).join('\n\n');

        console.log('[generateJobEmbedding] Generating embedding for:', jobContext.substring(0, 100) + '...');

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const result = await model.embedContent(jobContext);
        const embedding = result.embedding.values;

        console.log('[generateJobEmbedding] Embedding generated, dimension:', embedding.length);

        return embedding;
    } catch (error) {
        console.error('[generateJobEmbedding] Error:', error);
        return null;
    }
}
