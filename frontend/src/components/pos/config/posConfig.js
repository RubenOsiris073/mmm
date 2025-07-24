/**
 * Configuración centralizada del POS
 */
export const POS_CONFIG = {
  // Configuración de detección de productos
  DETECTION: {
    CONFIDENCE_THRESHOLD: 70,
    DETECTION_INTERVAL: 1500, // ms
    CACHE_SIZE: 10,
    TIMEOUT: 5000, // ms
    DETECTABLE_PRODUCTS: ['Botella_Ciel_100ML', 'Cacahuates_Kiyakis_120G', 'Trident_13G', 'Del Valle_413ML', 'Pop_45G',
      'Dr.Peppe_335ML', 'Sabritas_150G', 'Takis_70G']
  },

  // Configuración de UI
  UI: {
    ANIMATION_DURATION: 200, // ms
    DEBOUNCE_DELAY: 300, // ms
    TOAST_DURATION: 3000, // ms
    LOADING_SPINNER_DELAY: 500 // ms
  },

  // Configuración de performance
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 100, // px
    VIRTUAL_SCROLL_ITEM_HEIGHT: 80, // px
    CACHE_EXPIRY: 300000, // 5 minutos en ms
    MAX_CART_ITEMS: 50
  },

  // Configuración de errores
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms
    ERROR_DISPLAY_DURATION: 5000, // ms
    LOG_ERRORS_IN_PRODUCTION: true
  },

  // Configuración de API
  API: {
    TIMEOUT: 10000, // ms
    MAX_CONCURRENT_REQUESTS: 5,
    RETRY_ATTEMPTS: 2
  },

  // Textos y mensajes
  MESSAGES: {
    CART_EMPTY: 'Tu carrito está vacío',
    CART_SUBTITLE: 'Agrega productos para comenzar',
    DETECTION_INSTRUCTIONS: [
      'Usa el botón "Iniciar Detección" para activar la cámara',
      'Coloca productos frente a la cámara para detectarlos automáticamente',
      'Los productos detectados se agregarán al carrito automáticamente',
      'Revisa el total en el panel derecho y procede al checkout'
    ],
    LOADING: 'Cargando...',
    PROCESSING: 'Procesando...',
    ERROR_GENERIC: 'Ha ocurrido un error inesperado',
    DETECTION_ACTIVE: 'Detección Activa',
    DETECTION_INACTIVE: 'Detección Inactiva'
  }
};

// Configuración específica por ambiente
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...POS_CONFIG,
    DEBUG: isDevelopment,
    LOGGING_ENABLED: isDevelopment || POS_CONFIG.ERROR_HANDLING.LOG_ERRORS_IN_PRODUCTION,
    API_BASE_URL: process.env.VITE_API_URL || 'http://localhost:5000/api'
  };
};

export default POS_CONFIG;