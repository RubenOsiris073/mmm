import axios from 'axios';

// Configuración de la API
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  
  : 'http://localhost:5000/api';

const TIMEOUT = 15000; // 15 segundos

// Mensajes de error comunes
const ERROR_MESSAGES = {
  CONNECTION: 'No se pudo conectar al servidor. Verifica que el backend esté funcionando.',
  TIMEOUT: 'La operación tardó demasiado. Intenta nuevamente.',
  NETWORK: 'Error de red. Verifica tu conexión.',
  SERVER: 'Error en el servidor.',
  NOT_FOUND: 'Recurso no encontrado.',
};

// Crear instancia de axios configurada
const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Función helper para manejar errores
const handleError = (error, customMessage) => {
  if (error.code === 'ECONNABORTED') {
    console.error('Timeout excedido:', API_URL);
    throw new Error(ERROR_MESSAGES.TIMEOUT);
  }
  
  if (!error.response) {
    console.error('Error de red:', error);
    throw new Error(ERROR_MESSAGES.NETWORK);
  }

  const message = error.response?.data?.message || customMessage || ERROR_MESSAGES.SERVER;
  console.error('Error en petición:', message);
  throw new Error(message);
};

// Interceptores
api.interceptors.request.use(
  request => {
    console.log('🚀 Petición saliente:', {
      url: request.url,
      method: request.method,
      data: request.data
    });
    return request;
  },
  error => {
    console.error('❌ Error en petición:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('✅ Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

const apiService = {
  // Sistema y diagnóstico
  testConnection: async () => {
    try {
      const response = await api.get('/health');
      return response.data?.status === 'ok';
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  },

  // Productos
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data?.products || [];
    } catch (error) {
      handleError(error, 'Error al obtener productos');
    }
  },

  // Inventario (Wallet)
  getWallet: async () => {
    try {
      const response = await api.get('/wallet');
      return response.data || [];
    } catch (error) {
      handleError(error, 'Error al cargar el inventario');
    }
  },

  updateWallet: async (productId, adjustment) => {
    try {
      const response = await api.post('/wallet/update', {
        productId,
        adjustment,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      handleError(error, 'Error al actualizar el inventario');
    }
  },

  // Bodega
  getBodegaInventario: async () => {
    try {
      const response = await api.get('/bodega/inventario');
      return response.data || [];
    } catch (error) {
      handleError(error, 'Error al obtener inventario de bodega');
    }
  },

  registrarMovimientoBodega: async (datos) => {
    try {
      const response = await api.post('/bodega/movimientos', datos);
      return response.data;
    } catch (error) {
      handleError(error, 'Error al registrar movimiento en bodega');
    }
  },

  registrarProductoBodega: async (productoData) => {
    try {
      const response = await api.post('/bodega/productos', productoData);
      return response.data;
    } catch (error) {
      handleError(error, 'Error al registrar producto en bodega');
    }
  },

  // Detecciones
  getDetections: async () => {
    try {
      const response = await api.get('/detections');
      return response.data || { detections: [] };
    } catch (error) {
      handleError(error, 'Error al obtener detecciones');
    }
  },

  setDetectionMode: async (active, intervalMs = 3000) => {
    try {
      const response = await api.post('/detection/continuous', { 
        active, 
        intervalMs 
      });
      return response.data;
    } catch (error) {
      handleError(error, 'Error al configurar modo de detección');
    }
  },

  triggerDetection: async () => {
    try {
      const response = await api.post('/detect');
      return response.data || { success: false };
    } catch (error) {
      handleError(error, 'Error al realizar detección');
    }
  },

  // Ventas
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      handleError(error, 'Error al crear venta');
    }
  },

  getSales: async (limit = 50) => {
    try {
      const response = await api.get(`/sales?limit=${limit}`);
      return response.data?.sales || [];
    } catch (error) {
      handleError(error, 'Error al obtener ventas');
    }
  },

  getSaleDetails: async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}`);
      return response.data?.sale;
    } catch (error) {
      handleError(error, `Error al obtener detalles de la venta ${saleId}`);
    }
  }
};

export default apiService;