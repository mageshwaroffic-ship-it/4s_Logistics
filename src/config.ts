/**
 * Centralized Configuration for 4S Logistics Frontend
 * =====================================================
 * Change ENVIRONMENT to switch between 'development' and 'production'.
 * 
 * Single URL Setup:
 * - Development: API at http://localhost:8000/api
 * - Production: API at /api (same origin)
 */

// ============================================================
// ENVIRONMENT SETTING
// ============================================================
const ENVIRONMENT: 'development' | 'production' =
    (import.meta.env.VITE_APP_ENV as 'development' | 'production') || 'development';


// ============================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================

interface Config {
    API_URL: string;
    APP_NAME: string;
    DEBUG: boolean;
}

const CONFIGS: Record<string, Config> = {
    development: {
        // In dev, frontend is on (:8080) and backend is on (:8000)
        // Endpoints already include '/api' prefix, so just point to host
        API_URL: 'http://localhost:8000',

        APP_NAME: '4S Logistics (Dev)',
        DEBUG: true,
    },

    production: {
        // In production, both are on the same port.
        // Use empty string so requests become relative (e.g. '/api/jobs')
        API_URL: '',

        APP_NAME: '4S Logistics',
        DEBUG: false,
    }
};

const config = CONFIGS[ENVIRONMENT] || CONFIGS.development;

export const API_URL = config.API_URL;
export const APP_NAME = config.APP_NAME;
export const DEBUG = config.DEBUG;
export const ENV = ENVIRONMENT;

export default config;
