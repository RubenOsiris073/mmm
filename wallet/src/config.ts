// Configuración de la aplicación móvil

// URL base del API - debe ser accesible desde la red del dispositivo móvil
// Nota: En un dispositivo físico, usa la IP local del servidor backend en lugar de localhost
export const API_BASE_URL = 'http://localhost:5000/api';

// Constantes para Deep Links
export const DEEP_LINK_SCHEME = 'mmm-aguachile';
export const DEEP_LINK_HOST = 'wallet';
export const DEEP_LINK_PREFIX = `${DEEP_LINK_SCHEME}://${DEEP_LINK_HOST}`;