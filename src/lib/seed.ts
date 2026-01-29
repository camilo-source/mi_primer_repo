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
        const { data: profile, error: profileError } = await supabase
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
                nombre: 'Ana García',
                email: 'ana.garcia@example.com',
                resumen_ia: 'Alta coincidencia. Experiencia sólida en React y TypeScript. Buen perfil cultural.',
                comentarios_admin: 'Candidata prometedora.',
                estado_agenda: 'pending'
            },
            {
                id_busqueda_n8n: searchId,
                nombre: 'Carlos López',
                email: 'carlos.lopez@example.com',
                resumen_ia: 'Coincidencia media. Conoce React pero le falta experiencia en arquitecturas escalables.',
                comentarios_admin: 'Revisar portafolio.',
                estado_agenda: 'contacted'
            },
            {
                id_busqueda_n8n: searchId,
                nombre: 'María Rodríguez',
                email: 'maria.rod@example.com',
                resumen_ia: 'Baja coincidencia. Perfil más orientado a Backend.',
                comentarios_admin: 'Descartar por ahora.',
                estado_agenda: 'rejected'
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
