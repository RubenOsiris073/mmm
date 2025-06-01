import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logs detallados
api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} - ${response.config.url}`);
    console.log('📦 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const apiService = {
  // Función para obtener productos - SIN MOCKS
  getProducts: async () => {
    try {
      console.log('🔍 Intentando obtener productos de:', `${API_BASE_URL}/products`);
      
      const response = await api.get('/products');
      
      console.log('📋 Respuesta completa del servidor:', response);
      console.log('📊 Status:', response.status);
      console.log('🔢 Data type:', typeof response.data);
      console.log('📝 Data content:', response.data);
      
      // Retornar la respuesta tal como viene del servidor
      return response;
      
    } catch (error) {
      console.error('💥 Error detallado en getProducts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      throw error; // Re-lanzar el error sin usar mocks
    }
  },

  // Función para crear venta
  createSale: async (saleData) => {
    try {
      console.log('💰 Enviando venta:', saleData);
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('💥 Error creating sale:', error);
      throw error;
    }
  }
};

export default apiService;