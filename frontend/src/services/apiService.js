import axios from 'axios';

// Configuración de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 15000; // 15 segundos

console.log('📡 Configuración API:', {
  environment: process.env.NODE_ENV,
  apiUrl: API_URL,
  timestamp: new Date().toISOString()
});

const apiService = {
  api: axios.create({
    baseURL: API_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    }
  }),

  // Inicializar interceptores
  initInterceptors() {
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

  // Productos
  async getProducts() {
    try {
      const response = await this.api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  async getProduct(id) {
    try {
      const response = await this.api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo producto ${id}:`, error);
      throw error;
    }
  },

  // Detección
  async triggerDetection(imageData) {
    try {
      const response = await this.api.post('/detect', { image: imageData });
      return response.data;
    } catch (error) {
      console.error('Error al realizar detección:', error);
      throw error;
    }
  },

  async getDetections() {
    try {
      const response = await this.api.get('/detections');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo detecciones:', error);
      throw error;
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
      console.error('Error al configurar modo de detección:', error);
      throw error;
    }
  },

  // Inventario
  async getInventory() {
    try {
      const response = await this.api.get('/inventory');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo inventario:', error);
      throw error;
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
      console.error('Error actualizando inventario:', error);
      throw error;
    }
  },

  // Ventas
  async createSale(saleData) {
    try {
      const response = await this.api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creando venta:', error);
      throw error;
    }
  },

  async getSales(limit = 50) {
    try {
      const response = await this.api.get(`/sales?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      throw error;
    }
  }
};

// Inicializar interceptores al importar el módulo
apiService.initInterceptors();

export default apiService;