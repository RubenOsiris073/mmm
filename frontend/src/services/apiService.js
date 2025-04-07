import axios from 'axios';

// Configuración de la API
// Para Docker, usa el nombre del servicio backend definido en docker-compose.yml
const API_URL = process.env.REACT_APP_API_URL || 
               (process.env.NODE_ENV === 'production' ? 
                'http://backend:5000/api' : 'http://localhost:5000/api');
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
        console.log('Petición saliente:', {
          url: config.url,
          method: config.method,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('Error en petición:', error.message);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log('Respuesta recibida:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('Error en respuesta:', {
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

  async triggerDetection(imageData, quality = 0.8) {
    try {
      // Validación inicial
      if (!imageData) {
        throw new Error('No se proporcionó imagen para la detección');
      }
  
      // Diagnóstico: Verificar tamaño de la imagen original
      const originalSize = Math.floor(imageData.length / 1024);
      console.log('Diagnóstico - Tamaño original:', originalSize, 'KB');
  
      // Optimización de imagen
      let optimizedImage = imageData;
      if (typeof window.optimizeImage === 'function') {
        console.log('Aplicando optimización de imagen...');
        optimizedImage = await window.optimizeImage(imageData, quality);
        const optimizedSize = Math.floor(optimizedImage.length / 1024);
        console.log('Diagnóstico - Tamaño optimizado:', optimizedSize, 'KB', 
                    `(${Math.floor((originalSize - optimizedSize) / originalSize * 100)}% reducción)`);
      }
  
      // Diagnóstico: Verificar URL y preparación
      console.log('URL de detección:', this.api.defaults.baseURL + '/detect');
      console.log('Iniciando detección...');
  
      // Realizar petición con medición de tiempo
      const startTime = Date.now();
      const response = await this.api.post('/detect', { image: optimizedImage }, {
        timeout: 30000, // 30 segundos para procesamiento
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Timestamp': new Date().toISOString()
        }
      });
      
      // Diagnóstico: Tiempo de respuesta
      const processingTime = Date.now() - startTime;
      console.log('Tiempo de procesamiento:', processingTime, 'ms');
  
      // Validación de respuesta
      if (!response.data || !response.data.detection) {
        throw new Error('Respuesta de detección inválida');
      }
  
      return response.data;
  
    } catch (error) {
      // Manejo de errores mejorado con diagnósticos específicos
      if (error.code === 'ECONNABORTED') {
        console.error('Error: Tiempo de espera agotado (30s). El procesamiento está tardando demasiado.');
      } else if (error.response?.status === 413) {
        console.error('Error: Imagen demasiado grande. Tamaño:', Math.floor(imageData.length / 1024), 'KB');
      } else if (!navigator.onLine) {
        console.error('Error: Sin conexión a internet. Verifica tu conectividad.');
      } else {
        console.error('Error en detección:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: this.api.defaults.baseURL + '/detect'
        });
      }
  
      // Agregar información de diagnóstico al error
      error.diagnostics = {
        timestamp: new Date().toISOString(),
        imageSize: Math.floor(imageData.length / 1024) + 'KB',
        url: this.api.defaults.baseURL + '/detect',
        online: navigator.onLine
      };
  
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