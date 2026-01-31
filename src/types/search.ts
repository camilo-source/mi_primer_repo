/**
 * Types for Search/Job functionality
 */

export interface SearchFormData {
    // Datos de la empresa
    empresa: string;
    rubro: string;
    descripcion_empresa: string;

    // Datos del puesto
    titulo: string;
    descripcion: string;
    habilidades_requeridas: string[];
    habilidades_blandas: string[];
    experiencia_minima: number;
    experiencia_maxima: number;
    nivel_formacion: string;

    // Condiciones
    modalidad: 'remoto' | 'presencial' | 'hibrido';
    disponibilidad: string;
    ubicacion: string;
    salario_min: string;
    salario_max: string;
    moneda: string;
    idiomas: IdiomaEntry[];

    // Requisitos
    requisitos_excluyentes: string[];
    requisitos_deseables: string[];
    extras: string;

    // Canales de difusión
    channels: ChannelConfig;
}

export interface ChannelConfig {
    linkedin: boolean;
    instagram: boolean;
    slack: boolean;
    email_marketing: boolean;
    whatsapp: boolean;
    job_portals: boolean;
}

export interface IdiomaEntry {
    idioma: string;
    nivel: string;
}

export interface CreatedSearch {
    id: string;
    n8nUrl: string;
}

export const initialSearchFormData: SearchFormData = {
    // Datos de empresa
    empresa: '',
    rubro: '',
    descripcion_empresa: '',

    // Datos del puesto
    titulo: '',
    descripcion: '',
    habilidades_requeridas: [],
    habilidades_blandas: [],
    experiencia_minima: 0,
    experiencia_maxima: 5,
    nivel_formacion: 'Cualquiera',

    // Condiciones
    modalidad: 'remoto',
    disponibilidad: 'Full Time',
    ubicacion: '',
    salario_min: '',
    salario_max: '',
    moneda: 'USD',
    idiomas: [],

    // Requisitos
    requisitos_excluyentes: [],
    requisitos_deseables: [],
    extras: '',

    // Canales por defecto (Todos activos para máxima difusión)
    channels: {
        linkedin: true,
        instagram: true,
        slack: true,
        email_marketing: true,
        whatsapp: true,
        job_portals: true
    }
};
