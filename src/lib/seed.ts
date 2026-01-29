import { supabase } from '../lib/supabase';

export const seedDatabase = async () => {
    console.log("Starting seed process...");

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("No user logged in. Cannot seed database.");
        alert("Error: Debes iniciar sesión para ejecutar el seed.");
        return;
    }

    const userId = user.id;
    console.log("Seeding data for user:", userId);

    try {
        // 2. Ensure Profile Exists
        const { data: profile } = await supabase
            .from('clientes')
            .select('id')
            .eq('id', userId)
            .single();

        if (!profile) {
            console.log("Creating profile for user...");
            const { error: insertProfileError } = await supabase
                .from('clientes')
                .insert({
                    id: userId, // Must match auth.users.id
                    email: user.email,
                    full_name: 'Test User',
                    google_id: 'test_google_id_' + Math.random(),
                });

            if (insertProfileError && insertProfileError.code !== '23505') { // Ignore unique violation
                console.error("Error creating profile:", insertProfileError);
                throw insertProfileError;
            }
        }

        // 3. Create Search (Busqueda)
        const searchId = `search_${Math.floor(Math.random() * 10000)}`;
        console.log("Creating search:", searchId);

        const { error: searchError } = await supabase
            .from('busquedas')
            .insert({
                id_busqueda_n8n: searchId,
                user_id: userId,
                titulo: 'Desarrollador React Senior',
                estado: 'active'
            });

        if (searchError) throw searchError;

        // 4. Create Candidates (Postulantes)
        console.log("Creating candidates...");
        const candidates = [
            {
                id_busqueda_n8n: searchId,
                nombre: 'Sofia Martinez',
                email: 'sofia.martinez@tech.example.com',
                resumen_ia: 'MATCH: 95%. Perfil excepcional. 6 años de experiencia en React, Node.js y arquitecturas cloud. Lideró equipos en su rol anterior.',
                comentarios_admin: 'Entrevistar ASAP.',
                estado_agenda: 'pending'
            },
            {
                id_busqueda_n8n: searchId,
                nombre: 'Lucas Vidal',
                email: 'lucas.vidal@dev.example.com',
                resumen_ia: 'MATCH: 88%. Muy sólido en Frontend (React/Next.js) pero con menos experiencia en Backend de la requerida. Buen fit cultural.',
                comentarios_admin: '',
                estado_agenda: 'pending'
            },
            {
                id_busqueda_n8n: searchId,
                nombre: 'Ana García',
                email: 'ana.garcia@example.com',
                resumen_ia: 'MATCH: 75%. Junior avanzando a Mid-level. Tiene buenos proyectos personales pero le falta experiencia en equipos grandes.',
                comentarios_admin: 'Mantener en cartera.',
                estado_agenda: 'contacted'
            },
            {
                id_busqueda_n8n: searchId,
                nombre: 'Marcos Rivas',
                email: 'marcos.rivas@legacy.example.com',
                resumen_ia: 'MATCH: 40%. Perfil orientado a .NET/C#. Poca experiencia verificable en stack moderno de JS.',
                comentarios_admin: 'Descartado por stack.',
                estado_agenda: 'rejected'
            },
            {
                id_busqueda_n8n: searchId,
                nombre: 'Elena Torres',
                email: 'elena.torres@ux.example.com',
                resumen_ia: 'MATCH: 92%. Frontend Engineer con fuerte foco en UX/UI. Portfolio impresionante. Ideal para el rol de UI Lead.',
                comentarios_admin: '',
                estado_agenda: 'pending'
            }
        ];

        const { error: candidatesError } = await supabase
            .from('postulantes')
            .insert(candidates);

        if (candidatesError) throw candidatesError;

        console.log("Seed completed successfully!");
        alert("Base de datos poblada con éxito. Recarga la página.");

    } catch (error) {
        console.error("Seed failed:", error);
        alert("Error al poblar la base de datos. Revisa la consola.");
    }
};
