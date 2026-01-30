// 🎯 NODO CODE PARA N8N - FORMATEAR DATOS PARA VIBE CODE ATS
// Copiar y pegar este código en un nodo "Code" en n8n

// Este nodo toma los candidatos procesados por IA y los formatea
// para enviarlos al webhook de VIBE CODE ATS

const candidatos = [];

// Iterar sobre todos los items de entrada
for (const item of $input.all()) {
    const data = item.json;

    // Formatear cada candidato según el schema de VIBE CODE ATS
    candidatos.push({
        // CAMPOS REQUERIDOS
        nombre: data.nombre || data.name || data.full_name || "Sin nombre",
        email: data.email || data.correo || "sin-email@example.com",

        // CAMPOS OPCIONALES
        telefono: data.telefono || data.phone || data.celular || null,
        linkedin: data.linkedin || data.linkedin_url || null,
        cv_url: data.cv_url || data.resume_url || data.curriculum_url || null,

        // DATOS DE IA
        resumen_ia: data.resumen || data.summary || data.ai_summary || null,
        score_ia: parseInt(data.score) || parseInt(data.rating) || 0,

        // HABILIDADES (convertir a array si viene como string)
        habilidades: Array.isArray(data.habilidades)
            ? data.habilidades
            : (data.skills || data.tecnologias || "").split(',').map(s => s.trim()).filter(Boolean),

        // EXPERIENCIA
        experiencia_anos: parseInt(data.experiencia) || parseInt(data.years_experience) || 0,

        // UBICACIÓN
        ubicacion: data.ubicacion || data.location || data.ciudad || null
    });
}

// Obtener el ID de la búsqueda desde el trigger o desde un nodo anterior
// Ajustar según tu workflow
const searchId = $('Trigger').item.json.search_id
    || $('Webhook').item.json.id_busqueda_n8n
    || $node["Get Search"].json.id_busqueda_n8n;

// Retornar en el formato esperado por el webhook
return [{
    json: {
        id_busqueda_n8n: searchId,
        candidatos: candidatos
    }
}];
