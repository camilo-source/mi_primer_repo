import { supabase } from '../lib/supabase';

// Demo Types
export type DemoType = 'empty' | 'engineers' | 'real_contacts';

interface DemoConfig {
    id: DemoType;
    title: string;
    description: string;
    searchTitle: string;
    candidates: Array<{
        nombre: string;
        email: string;
        resumen_ia: string;
        comentarios_admin: string;
        estado_agenda: string;
    }>;
}

// Demo Configurations
const DEMO_CONFIGS: DemoConfig[] = [
    {
        id: 'empty',
        title: 'Base Vacía',
        description: 'Una búsqueda sin candidatos para empezar de cero',
        searchTitle: 'Nueva Búsqueda (Vacía)',
        candidates: []
    },
    {
        id: 'engineers',
        title: 'Ingeniero Informático',
        description: '5 candidatos random para un puesto de ingeniería',
        searchTitle: 'Ingeniero Informático Senior',
        candidates: [
            {
                nombre: 'Martín Rodríguez',
                email: 'martin.rodriguez@tech.demo.com',
                resumen_ia: 'MATCH: 94%. Ingeniero en Sistemas con 7 años de experiencia. Especializado en arquitectura de microservicios y cloud AWS. Lideró migraciones complejas.',
                comentarios_admin: 'Excelente perfil técnico.',
                estado_agenda: 'pending'
            },
            {
                nombre: 'Lucía Fernández',
                email: 'lucia.fernandez@dev.demo.com',
                resumen_ia: 'MATCH: 88%. Ingeniera en Computación con foco en Machine Learning. 5 años de experiencia, últimos 2 en startups de AI.',
                comentarios_admin: '',
                estado_agenda: 'pending'
            },
            {
                nombre: 'Santiago Pérez',
                email: 'santiago.perez@code.demo.com',
                resumen_ia: 'MATCH: 82%. Fullstack developer con experiencia en fintech. Buen manejo de Python, Go y React. Busca rol más senior.',
                comentarios_admin: 'Evaluar expectativas salariales.',
                estado_agenda: 'sent'
            },
            {
                nombre: 'Carolina López',
                email: 'carolina.lopez@eng.demo.com',
                resumen_ia: 'MATCH: 75%. Ingeniera recién recibida con excelente promedio. Proyectos académicos destacados pero poca experiencia laboral.',
                comentarios_admin: 'Junior con potencial.',
                estado_agenda: 'pending'
            },
            {
                nombre: 'Nicolás García',
                email: 'nicolas.garcia@backend.demo.com',
                resumen_ia: 'MATCH: 70%. Backend developer sólido en Java y Spring. Menos experiencia en tecnologías modernas pero muy buenas referencias.',
                comentarios_admin: '',
                estado_agenda: 'pending'
            }
        ]
    },
    {
        id: 'real_contacts',
        title: 'Contactos Reales',
        description: 'Camilo y Juan Bautista para pruebas reales de email',
        searchTitle: 'Prueba de Scheduling Real',
        candidates: [
            {
                nombre: 'Camilo Molina',
                email: 'cami.moli.03@gmail.com',
                resumen_ia: 'MATCH: 100%. Candidato de prueba para validar el flujo completo de scheduling con emails reales.',
                comentarios_admin: 'TEST - Email real configurado.',
                estado_agenda: 'pending'
            },
            {
                nombre: 'Juan Bautista Gramaglia',
                email: 'juanbag25@gmail.com',
                resumen_ia: 'MATCH: 100%. Candidato de prueba para validar respuestas y confirmación de entrevistas.',
                comentarios_admin: 'TEST - Email real configurado.',
                estado_agenda: 'pending'
            }
        ]
    }
];

export const getDemoConfigs = () => DEMO_CONFIGS;

export const createDemoSearch = async (demoType: DemoType): Promise<string | null> => {
    console.log(`Creating ${demoType} demo search...`);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Debes iniciar sesión para crear una búsqueda demo.');
    }

    const config = DEMO_CONFIGS.find(c => c.id === demoType);
    if (!config) {
        throw new Error('Tipo de demo no válido.');
    }

    const userId = user.id;
    const searchId = `demo_${demoType}_${Date.now()}`;

    try {
        // 1. Create Search
        const { error: searchError } = await supabase
            .from('busquedas')
            .insert({
                id_busqueda_n8n: searchId,
                user_id: userId,
                titulo: config.searchTitle,
                estado: 'active'
            });

        if (searchError) throw searchError;

        // 2. Create Candidates (if any)
        if (config.candidates.length > 0) {
            const candidatesWithSearchId = config.candidates.map(c => ({
                ...c,
                id_busqueda_n8n: searchId
            }));

            const { error: candidatesError } = await supabase
                .from('postulantes')
                .insert(candidatesWithSearchId);

            if (candidatesError) throw candidatesError;
        }

        return searchId;

    } catch (error) {
        console.error('Demo creation failed:', error);
        throw error;
    }
};

// Legacy function for backward compatibility
export const createMockSearch = async () => {
    return createDemoSearch('engineers');
};

export const seedDatabase = async () => {
    console.log("Starting seed process...");
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("No user logged in. Cannot seed database.");
        alert("Error: Debes iniciar sesión para ejecutar el seed.");
        return;
    }

    try {
        // Create all demo types
        for (const config of DEMO_CONFIGS) {
            if (config.candidates.length > 0) {
                await createDemoSearch(config.id);
            }
        }
        console.log("Seed completed successfully!");
        alert("Base de datos poblada con éxito. Recarga la página.");
    } catch (error) {
        console.error("Seed failed:", error);
        alert("Error al poblar la base de datos. Revisa la consola.");
    }
};
