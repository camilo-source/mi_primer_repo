/**
 * Centralized application configuration.
 * Using this file ensures we have a single source of truth for global constants
 * and environment variables.
 */

export const APP_CONFIG = {
    // Base URL for the application
    BASE_URL: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://mi-primer-repo-seven.vercel.app'),

    // API Endpoints
    API: {
        N8N: '/api/n8n',
        GRADING: '/api/grading'
    },

    // Feature Flags or Limits
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
};
