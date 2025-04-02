import axios from 'axios';

// Configuración de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 15000; // 15 segundos

console.log('📡 Configuración API:', {
  environment: process.env.NODE_ENV,
  apiUrl: API_URL,
  timestamp: new Date().toISOString()
});

// Mensajes de error comunes
const ERROR_MESSAGES = {
  CONNECTION: 'No se pudo conectar al servidor. Verifica que el backend esté funcionando.',
  TIMEOUT: 'La operación tardó demasiado. Intenta nuevamente.',
  NETWORK: 'Error de red. Verifica tu conexión.',
  SERVER: 'Error en el servidor.',
  NOT_FOUND: 'Recurso no encontrado.',
  INVENTORY: 'Error al obtener inventario.',
  INVENTORY_UPDATE: 'Error al actualizar inventario.'
};

const apiService = {
  api: (() => {
    console.log('Creando instancia de axios');
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  })(),
  // Inicializar interceptores
  initInterceptors() {
    // Interceptor de solicitudes
    this.api.interceptors.request.use(
      (config) => {
        console.log('📤 Petición saliente:', {
          url: config.url,
          method: config.method,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('❌ Error en petición:', error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor de respuestas
    this.api.interceptors.response.use(
      (response) => {
        console.log('📥 Respuesta recibida:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('❌ Error en respuesta:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  },
  
  // Helper para manejar errores
  handleError(error, customMessage) {
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
  },

  // Health Check
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      console.log('✅ Servidor conectado:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Error de conexión:', {
        message: error.message,
        code: error.code,
        url: API_URL
      });
      
      let errorMessage = 'Error de conexión. ';
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Tiempo de espera agotado. ';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage += 'No se puede conectar al servidor. ';
      }
      
      errorMessage += '\n\nVerifica:\n';
      errorMessage += '1. Que el servidor backend esté corriendo en el puerto 5000\n';
      errorMessage += '2. Que no haya problemas de CORS\n';
      errorMessage += `3. La URL del API configurada: ${API_URL}`;
      
      throw new Error(errorMessage);
    }
  },

  // Método de inicialización
  async initialize() {
    try {
      this.initInterceptors();
      await this.healthCheck();
      console.log('✅ API inicializada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar API:', error);
      throw error;
    }
  },

  // Métodos de inventario
  async getInventory() {
    try {
      const response = await this.api.get('/inventory');
      return response.data;
    } catch (error) {
      this.handleError(error, ERROR_MESSAGES.INVENTORY);
    }
  },

  async updateInventory(productId, adjustment, location, reason) {
    try {
      const response = await this.api.post('/inventory/update', {
        productId,
        adjustment,
        location,
        reason,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      this.handleError(error, ERROR_MESSAGES.INVENTORY_UPDATE);
    }
  },

  // Productos
  async getProducts() {
    try {
      const response = await this.api.get('/products');
      return response.data?.products || [];
    } catch (error) {
      this.handleError(error, 'Error al obtener productos');
    }
  },

  async getProduct(id) {
    try {
      const response = await this.api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Error al obtener producto ${id}`);
    }
  },

  // Warehouse
  async getWarehouse() {
    try {
      const response = await this.api.get('/warehouse');
      return response.data || [];
    } catch (error) {
      this.handleError(error, 'Error al cargar el inventario manual');
    }
  },

  // Actualizar inventario manual
  async updateWarehouse(productId, adjustment) {
    try {
      const response = await this.api.post('/warehouse/update', {
        productId,
        adjustment,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error al actualizar el inventario manual');
    }
  },

  // Bodega
  async getBodegaInventario() {
    try {
      const response = await this.api.get('/bodega/inventario');
      return response.data || [];
    } catch (error) {
      this.handleError(error, 'Error al obtener inventario de bodega');
    }
  },

  async registrarMovimientoBodega(datos) {
    try {
      const response = await this.api.post('/bodega/movimientos', datos);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error al registrar movimiento en bodega');
    }
  },

  async registrarProductoBodega(productoData) {
    try {
      const response = await this.api.post('/bodega/productos', productoData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error al registrar producto en bodega');
    }
  },

  // Detecciones
  async getDetections() {
    try {
      const response = await this.api.get('/detections');
      return response.data || { detections: [] };
    } catch (error) {
      this.handleError(error, 'Error al obtener detecciones');
    }
  },

  async setDetectionMode(active, intervalMs = 3000) {
    try {
      const response = await this.api.post('/detection/continuous', { 
        active, 
        intervalMs 
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error al configurar modo de detección');
    }
  },

  async triggerDetection() {
    try {
      const response = await this.api.post('/detect');
      return response.data || { success: false };
    } catch (error) {
      this.handleError(error, 'Error al realizar detección');
    }
  },

  // Ventas
  async createSale(saleData) {
    try {
      const response = await this.api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error al crear venta');
    }
  },

  async getSales(limit = 50) {
    try {
      const response = await this.api.get(`/sales?limit=${limit}`);
      return response.data?.sales || [];
    } catch (error) {
      this.handleError(error, 'Error al obtener ventas');
    }
  },

  async getSaleDetails(saleId) {
    try {
      const response = await this.api.get(`/sales/${saleId}`);
      return response.data?.sale;
    } catch (error) {
      this.handleError(error, `Error al obtener detalles de la venta ${saleId}`);
    }
  },

  // Método para prueba de conexión
  async testConnection() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }
};

// Inicializar interceptores al importar el módulo
apiService.initInterceptors();

export default apiService;