-- Demo: Populate database with diverse candidates for semantic search testing
-- Run this in Supabase SQL Editor after creating a job search
-- First, let's create a demo job if it doesn't exist
INSERT INTO busquedas (
        id_busqueda_n8n,
        user_id,
        titulo,
        descripcion,
        habilidades_requeridas,
        experiencia_minima,
        experiencia_maxima,
        modalidad,
        ubicacion,
        estado
    )
VALUES (
        'demo-semantic-search-001',
        (
            SELECT id
            FROM auth.users
            LIMIT 1
        ), -- Use first user
        'Senior Full Stack Developer', 'Buscamos un desarrollador full stack con experiencia en React, Node.js y bases de datos. Debe tener capacidad de liderazgo y trabajo en equipo.', ARRAY ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'], 5, 10, 'remoto', 'Buenos Aires, Argentina', 'active'
    ) ON CONFLICT (id_busqueda_n8n) DO NOTHING;
-- Insert 20 diverse candidates with different profiles
INSERT INTO postulantes (
        id_busqueda_n8n,
        nombre,
        email,
        cv_text_or_url,
        resumen_ia,
        score_ia,
        estado_agenda
    )
VALUES -- Perfect matches (80-95 score)
    (
        'demo-semantic-search-001',
        'María González',
        'maria.gonzalez@email.com',
        'CV: 8 años de experiencia en desarrollo full stack. Experta en React, Node.js, TypeScript y PostgreSQL. Lideró equipos de 5 personas. Proyectos: E-commerce con 1M usuarios, Sistema bancario, App de salud. Certificaciones: AWS Solutions Architect, Scrum Master.',
        'Desarrolladora full stack senior con 8 años de experiencia. Dominio completo de React, Node.js y PostgreSQL. Experiencia liderando equipos.',
        92,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Carlos Rodríguez',
        'carlos.rodriguez@email.com',
        'CV: 7 años como Full Stack Developer. Stack principal: React, Node.js, Express, MongoDB, Docker. Arquitectura de microservicios. Liderazgo técnico en startup fintech. Inglés fluido. Contribuidor open source.',
        'Full stack developer con fuerte experiencia en React y Node.js. Arquitectura de microservicios y liderazgo técnico.',
        88,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Ana Martínez',
        'ana.martinez@email.com',
        'CV: 6 años de experiencia. Especialista en React y TypeScript. Backend con Node.js y GraphQL. Bases de datos PostgreSQL y Redis. Trabajo remoto desde hace 4 años. Excelente comunicación.',
        'Desarrolladora especializada en React y TypeScript con sólida experiencia en Node.js y PostgreSQL.',
        85,
        'pending'
    ),
    -- Good matches (65-79 score)
    (
        'demo-semantic-search-001',
        'Juan Pérez',
        'juan.perez@email.com',
        'CV: 5 años como Frontend Developer. Experto en React, Redux, Next.js. Conocimientos básicos de Node.js. Diseño UI/UX. Trabajó en agencia digital con clientes internacionales.',
        'Frontend developer con fuerte experiencia en React. Conocimientos básicos de backend.',
        72,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Laura Fernández',
        'laura.fernandez@email.com',
        'CV: 4 años de experiencia. Desarrollo full stack con Vue.js y Node.js. Migración a React en último proyecto. PostgreSQL y MongoDB. Metodologías ágiles.',
        'Desarrolladora full stack con experiencia en Vue y Node.js, actualmente migrando a React.',
        68,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Diego Silva',
        'diego.silva@email.com',
        'CV: 6 años como Backend Developer. Node.js, Express, NestJS. APIs RESTful y GraphQL. PostgreSQL, MySQL. Docker y Kubernetes. Aprendiendo React.',
        'Backend developer senior con Node.js. Conocimientos de infraestructura. Comenzando con React.',
        70,
        'pending'
    ),
    -- Moderate matches (50-64 score)
    (
        'demo-semantic-search-001',
        'Sofía López',
        'sofia.lopez@email.com',
        'CV: 3 años de experiencia. Desarrollo web con JavaScript vanilla y jQuery. Curso intensivo de React. Proyectos personales con Node.js. Muy motivada para aprender.',
        'Desarrolladora junior con fundamentos sólidos. Experiencia limitada pero gran potencial de aprendizaje.',
        58,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Martín Torres',
        'martin.torres@email.com',
        'CV: 5 años como Mobile Developer. React Native experto. Conocimientos de React web. Backend con Firebase. Interesado en transición a web full stack.',
        'Mobile developer con React Native. Experiencia limitada en desarrollo web tradicional.',
        55,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Valentina Ruiz',
        'valentina.ruiz@email.com',
        'CV: 4 años en QA Automation. Selenium, Cypress, Jest. Conocimientos de JavaScript y TypeScript. Curso de React. Busca transición a desarrollo.',
        'QA con sólidos conocimientos técnicos. Experiencia limitada en desarrollo pero buena base.',
        52,
        'pending'
    ),
    -- Lower matches (30-49 score)
    (
        'demo-semantic-search-001',
        'Roberto Gómez',
        'roberto.gomez@email.com',
        'CV: 2 años como desarrollador. Python y Django principalmente. HTML, CSS, JavaScript básico. Curso online de React. Sin experiencia profesional en React o Node.js.',
        'Desarrollador Python con conocimientos básicos de JavaScript. Sin experiencia en el stack requerido.',
        42,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Lucía Morales',
        'lucia.morales@email.com',
        'CV: 3 años como diseñadora UI/UX. HTML y CSS avanzado. JavaScript básico. Bootcamp de desarrollo web. Portfolio con proyectos personales en React.',
        'Diseñadora con conocimientos básicos de desarrollo. Proyectos personales pero sin experiencia profesional.',
        38,
        'pending'
    ),
    -- Edge cases and diverse profiles
    (
        'demo-semantic-search-001',
        'Fernando Castro',
        'fernando.castro@email.com',
        'CV: 10 años como Java Developer. Spring Boot, Hibernate. Microservicios. Reciente transición a JavaScript. 6 meses con Node.js y React en proyecto actual.',
        'Senior developer con amplia experiencia en Java. Nuevo en el ecosistema JavaScript/Node.',
        65,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Camila Herrera',
        'camila.herrera@email.com',
        'CV: 4 años como Data Scientist. Python, R, SQL. Dashboards con React. APIs con Flask. Interesada en desarrollo web full stack.',
        'Data scientist con experiencia en Python. Conocimientos de React para visualización de datos.',
        48,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Andrés Vargas',
        'andres.vargas@email.com',
        'CV: 7 años como DevOps Engineer. Docker, Kubernetes, CI/CD. Scripting con Node.js. Infraestructura como código. Conocimientos de desarrollo web.',
        'DevOps engineer con sólida experiencia en infraestructura. Conocimientos limitados de desarrollo frontend.',
        56,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Gabriela Sánchez',
        'gabriela.sanchez@email.com',
        'CV: 5 años como Product Manager. Background técnico en desarrollo. 2 años como developer (React, Node.js). Liderazgo de equipos técnicos.',
        'Product Manager con background técnico. Experiencia previa como desarrolladora.',
        62,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Pablo Ramírez',
        'pablo.ramirez@email.com',
        'CV: 6 años como Full Stack Developer. Angular, .NET Core, SQL Server. Proyecto reciente con React y Node.js (6 meses). Adaptabilidad a nuevas tecnologías.',
        'Full stack developer con experiencia en Angular y .NET. Reciente experiencia con React/Node.',
        67,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Carolina Díaz',
        'carolina.diaz@email.com',
        'CV: 8 años como desarrolladora. Especialista en accesibilidad web. React, TypeScript. Node.js para tooling. Conferencias internacionales. Open source contributor.',
        'Desarrolladora senior especializada en accesibilidad. Sólida experiencia en React y TypeScript.',
        82,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Javier Ortiz',
        'javier.ortiz@email.com',
        'CV: 3 años como freelancer. Proyectos variados con React, Vue, Svelte. Backend con Node.js y Supabase. E-commerce, landing pages, dashboards.',
        'Freelancer con experiencia diversa. Múltiples proyectos pequeños pero poca experiencia en equipos.',
        64,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Daniela Flores',
        'daniela.flores@email.com',
        'CV: 5 años en desarrollo. React Native y React Web. Redux, Context API. Backend con Firebase y Node.js. Apps publicadas en App Store y Play Store.',
        'Desarrolladora con experiencia en React Native y Web. Conocimientos de backend con Firebase.',
        74,
        'pending'
    ),
    (
        'demo-semantic-search-001',
        'Sebastián Méndez',
        'sebastian.mendez@email.com',
        'CV: 9 años como Tech Lead. Arquitectura de software. React, Node.js, microservicios. Mentoría de equipos. Migración de sistemas legacy. Inglés nativo.',
        'Tech Lead senior con amplia experiencia en React y Node.js. Fuerte capacidad de liderazgo.',
        90,
        'pending'
    );
-- Success message
SELECT 'Demo data inserted successfully! 20 candidates added to job: demo-semantic-search-001' as message;