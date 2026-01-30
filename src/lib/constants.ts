/**
 * VIBE CODE ATS - Textos en Español Latino
 * Todos los textos de la aplicación centralizados
 */

export const APP_NAME = "VIBE CODE ATS";
export const APP_TAGLINE = "Sistema de Reclutamiento Inteligente";
export const APP_DESCRIPTION = "Revolucioná tu proceso de reclutamiento con IA";

// ========================================
// NAVEGACIÓN
// ========================================
export const NAV = {
    dashboard: "Panel",
    calendar: "Calendario",
    searches: "Búsquedas",
    candidates: "Candidatos",
    settings: "Configuración",
    logout: "Cerrar Sesión",
};

// ========================================
// DASHBOARD
// ========================================
export const DASHBOARD = {
    title: "Panel de Control",
    welcome: "¡Bienvenido de vuelta!",
    stats: {
        totalCandidates: "Total de Candidatos",
        activeSearches: "Búsquedas Activas",
        interviewsScheduled: "Entrevistas Agendadas",
        hiredThisMonth: "Contratados este Mes",
    },
    actions: {
        newSearch: "Nueva Búsqueda",
        viewAll: "Ver Todos",
        filter: "Filtrar",
        sort: "Ordenar",
        export: "Exportar",
    },
    empty: {
        title: "No hay búsquedas activas",
        description: "Comenzá creando tu primera búsqueda de candidatos",
        cta: "Crear Búsqueda",
    },
};

// ========================================
// BÚSQUEDAS
// ========================================
export const SEARCHES = {
    title: "Búsquedas de Candidatos",
    new: "Nueva Búsqueda",
    active: "Activas",
    completed: "Completadas",
    archived: "Archivadas",
    status: {
        active: "Activa",
        paused: "Pausada",
        completed: "Completada",
        archived: "Archivada",
    },
    fields: {
        title: "Título de la Búsqueda",
        position: "Posición",
        department: "Departamento",
        location: "Ubicación",
        salary: "Salario",
        description: "Descripción",
        requirements: "Requisitos",
    },
    actions: {
        edit: "Editar",
        pause: "Pausar",
        resume: "Reanudar",
        complete: "Completar",
        archive: "Archivar",
        delete: "Eliminar",
        duplicate: "Duplicar",
    },
};

// ========================================
// CANDIDATOS
// ========================================
export const CANDIDATES = {
    title: "Candidatos",
    total: "Total de Candidatos",
    new: "Nuevo Candidato",
    import: "Importar Candidatos",
    export: "Exportar Lista",
    status: {
        new: "Nuevo",
        screening: "En Revisión",
        interview: "Entrevista",
        offer: "Oferta",
        hired: "Contratado",
        rejected: "Rechazado",
    },
    fields: {
        name: "Nombre",
        email: "Email",
        phone: "Teléfono",
        position: "Posición",
        experience: "Experiencia",
        education: "Educación",
        skills: "Habilidades",
        resume: "CV",
        notes: "Notas",
        score: "Puntuación",
    },
    actions: {
        view: "Ver Perfil",
        edit: "Editar",
        schedule: "Agendar Entrevista",
        sendEmail: "Enviar Email",
        moveToStage: "Mover a Etapa",
        reject: "Rechazar",
        hire: "Contratar",
        addNote: "Agregar Nota",
        downloadCV: "Descargar CV",
    },
    filters: {
        all: "Todos",
        byStatus: "Por Estado",
        bySearch: "Por Búsqueda",
        byScore: "Por Puntuación",
        byDate: "Por Fecha",
    },
};

// ========================================
// CALENDARIO
// ========================================
export const CALENDAR = {
    title: "Calendario de Entrevistas",
    myAvailability: "Mi Disponibilidad",
    upcomingInterviews: "Próximas Entrevistas",
    today: "Hoy",
    week: "Semana",
    month: "Mes",
    schedule: {
        title: "Agendar Entrevista",
        selectDate: "Seleccioná una Fecha",
        selectTime: "Seleccioná un Horario",
        duration: "Duración",
        candidate: "Candidato",
        interviewer: "Entrevistador",
        type: "Tipo de Entrevista",
        notes: "Notas",
        sendInvite: "Enviar Invitación",
    },
    types: {
        phone: "Telefónica",
        video: "Video Llamada",
        inPerson: "Presencial",
        technical: "Técnica",
    },
    status: {
        scheduled: "Agendada",
        confirmed: "Confirmada",
        completed: "Completada",
        cancelled: "Cancelada",
        rescheduled: "Reagendada",
    },
};

// ========================================
// BOOKING (CANDIDATOS)
// ========================================
export const BOOKING = {
    title: "Agendar tu Entrevista",
    selectSlot: "Seleccioná un Horario",
    availableSlots: "Horarios Disponibles",
    noSlots: "No hay horarios disponibles",
    confirm: "Confirmar Entrevista",
    confirmed: {
        title: "¡Entrevista Confirmada!",
        message: "Tu entrevista ha sido agendada exitosamente",
        details: "Detalles de la Entrevista",
        addToCalendar: "Agregar a mi Calendario",
        joinMeet: "Unirse a Google Meet",
        reminder: "Recibirás un recordatorio 24 horas antes de la entrevista",
    },
    error: {
        title: "Error al Agendar",
        invalidLink: "El link de reserva no es válido",
        slotTaken: "Este horario ya fue reservado",
        tryAgain: "Intentá nuevamente",
    },
};

// ========================================
// EMAILS
// ========================================
export const EMAILS = {
    invitation: {
        subject: "Invitación a Entrevista - {position}",
        greeting: "¡Hola {name}!",
        body: "Nos gustaría agendar una entrevista con vos para la posición de {position}.",
        cta: "Agendar mi Entrevista",
        footer: "Este link es personal y único para vos.",
    },
    confirmation: {
        subject: "Entrevista Confirmada - {position}",
        title: "¡Entrevista Confirmada!",
        greeting: "Hola {name},",
        body: "Tu entrevista ha sido confirmada exitosamente. A continuación encontrarás todos los detalles:",
        details: "Detalles de la Entrevista",
        position: "Posición",
        date: "Fecha",
        time: "Hora",
        duration: "Duración",
        tips: "Consejos para la Entrevista",
        tip1: "Asegurate de tener una buena conexión a internet",
        tip2: "Probá tu cámara y micrófono antes de la entrevista",
        tip3: "Buscá un lugar tranquilo y bien iluminado",
        tip4: "Llegá 5 minutos antes",
        reminder: "Recibirás un recordatorio 24 horas antes de la entrevista.",
        goodLuck: "¡Mucha suerte! 🍀",
    },
    reminder: {
        subject: "Recordatorio: Entrevista Mañana - {position}",
        title: "Recordatorio de Entrevista",
        body: "Te recordamos que mañana tenés una entrevista agendada.",
    },
};

// ========================================
// FORMULARIOS
// ========================================
export const FORMS = {
    required: "Este campo es obligatorio",
    invalidEmail: "Email inválido",
    invalidPhone: "Teléfono inválido",
    minLength: "Mínimo {min} caracteres",
    maxLength: "Máximo {max} caracteres",
    save: "Guardar",
    cancel: "Cancelar",
    submit: "Enviar",
    reset: "Resetear",
    clear: "Limpiar",
    search: "Buscar",
    filter: "Filtrar",
    apply: "Aplicar",
    close: "Cerrar",
};

// ========================================
// MENSAJES
// ========================================
export const MESSAGES = {
    success: {
        saved: "Guardado exitosamente",
        updated: "Actualizado exitosamente",
        deleted: "Eliminado exitosamente",
        sent: "Enviado exitosamente",
        scheduled: "Agendado exitosamente",
    },
    error: {
        generic: "Ocurrió un error. Intentá nuevamente.",
        network: "Error de conexión. Verificá tu internet.",
        notFound: "No se encontró el recurso solicitado",
        unauthorized: "No tenés permisos para realizar esta acción",
        validation: "Por favor, verificá los datos ingresados",
    },
    confirm: {
        delete: "¿Estás seguro que querés eliminar esto?",
        cancel: "¿Estás seguro que querés cancelar?",
        leave: "¿Estás seguro que querés salir? Los cambios no guardados se perderán.",
    },
    loading: "Cargando...",
    noData: "No hay datos para mostrar",
    tryAgain: "Intentar nuevamente",
};

// ========================================
// ESTADOS
// ========================================
export const STATUS = {
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
    completed: "Completado",
    cancelled: "Cancelado",
    draft: "Borrador",
};

// ========================================
// TIEMPOS
// ========================================
export const TIME = {
    justNow: "Justo ahora",
    minutesAgo: "hace {minutes} minutos",
    hoursAgo: "hace {hours} horas",
    daysAgo: "hace {days} días",
    weeksAgo: "hace {weeks} semanas",
    monthsAgo: "hace {months} meses",
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    thisWeek: "Esta Semana",
    nextWeek: "Próxima Semana",
    thisMonth: "Este Mes",
    nextMonth: "Próximo Mes",
};

// ========================================
// LANDING PAGE
// ========================================
export const LANDING = {
    hero: {
        title: "Revolucioná tu Proceso de Reclutamiento",
        subtitle: "Sistema de Seguimiento de Candidatos potenciado con IA",
        description: "Encontrá, evaluá y contratá al mejor talento más rápido que nunca con VIBE CODE ATS",
        cta: "Comenzar Ahora",
        ctaSecondary: "Ver Demo",
    },
    features: {
        title: "Todo lo que Necesitás",
        subtitle: "Herramientas poderosas para optimizar tu reclutamiento",
        ai: {
            title: "IA Inteligente",
            description: "Análisis automático de CVs y matching de candidatos",
        },
        calendar: {
            title: "Calendario Integrado",
            description: "Agendá entrevistas sin esfuerzo con sincronización automática",
        },
        collaboration: {
            title: "Colaboración en Equipo",
            description: "Trabajá en conjunto con tu equipo en tiempo real",
        },
        analytics: {
            title: "Analytics Avanzados",
            description: "Tomá decisiones basadas en datos con reportes detallados",
        },
    },
    cta: {
        title: "¿Listo para Transformar tu Reclutamiento?",
        description: "Uníte a cientos de empresas que ya confían en VIBE CODE ATS",
        button: "Empezar Gratis",
    },
};

// ========================================
// FOOTER
// ========================================
export const FOOTER = {
    tagline: "Sistema de Reclutamiento Inteligente",
    copyright: "© 2026 VIBE CODE ATS. Todos los derechos reservados.",
    links: {
        about: "Acerca de",
        features: "Funcionalidades",
        pricing: "Precios",
        contact: "Contacto",
        privacy: "Privacidad",
        terms: "Términos",
    },
};
