import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentar timeout a 30 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logs detallados
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} - ${response.config.url}`);
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const apiService = {
  // Función para obtener productos - SIN MOCKS
  getProducts: async () => {
    try {
      console.log('Intentando obtener productos de:', `${API_BASE_URL}/products`);
      
      const response = await api.get('/products');
      
      console.log('Respuesta completa del servidor:', response);
      console.log('Status:', response.status);
      console.log('Data type:', typeof response.data);
      console.log('Data content:', response.data);
      
      // Retornar la respuesta tal como viene del servidor
      return response;
      
    } catch (error) {
      console.error('Error detallado en getProducts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      throw error; // Re-lanzar el error sin usar mocks
    }
  },

  // Función para obtener ventas
  getSales: async () => {
    try {
      console.log('Intentando obtener ventas de:', `${API_BASE_URL}/sales`);
      
      const response = await api.get('/sales');
      
      console.log('Respuesta completa del servidor (sales):', response);
      console.log('Status:', response.status);
      console.log('Data content:', response.data);
      
      // El backend devuelve { sales: [...] }, extraemos el array
      return response.data.sales || [];
      
    } catch (error) {
      console.error('Error detallado en getSales:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      throw error;
    }
  },

  // Función para crear venta
  createSale: async (saleData) => {
    try {
      console.log('Enviando venta:', saleData);
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  // **FUNCIONES PARA GESTIÓN DE PRODUCTOS (COLECCIÓN PRODUCTS)**

  // Eliminar producto completo
  deleteProduct: async (productId) => {
    try {
      console.log(`Eliminando producto completo: ${productId}`);
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  },

  // Actualizar stock de un producto específico (DIRECTO EN FIREBASE PRODUCTS)
  updateProductStock: async (productId, adjustment, reason = 'Ajuste manual') => {
    try {
      console.log(`Actualizando stock - Producto: ${productId}, Ajuste: ${adjustment}`);
      const response = await api.put(`/products/${productId}/stock`, {
        adjustment,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  },

  // Obtener stock actual de un producto desde PRODUCTS
  getProductStock: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return {
        success: true,
        productId,
        stock: response.data.cantidad || response.data.stock || 0,
        stockMinimo: response.data.stockMinimo || 0
      };
    } catch (error) {
      console.error('Error obteniendo stock:', error);
      throw error;
    }
  },

  // Establecer stock específico (no ajuste, sino valor absoluto) en PRODUCTS
  setProductStock: async (productId, newQuantity, reason = 'Establecer stock') => {
    try {
      console.log(`Estableciendo stock - Producto: ${productId}, Nueva cantidad: ${newQuantity}`);
      const response = await api.put(`/products/${productId}/stock`, {
        adjustment: newQuantity, // Se enviará como ajuste absoluto
        reason,
        absolute: true // Flag para indicar que es valor absoluto
      });
      return response.data;
    } catch (error) {
      console.error('Error estableciendo stock:', error);
      throw error;
    }
  },

  // Obtener resumen de inventario desde PRODUCTS
  getInventorySummary: async () => {
    try {
      const response = await api.get('/products');
      const products = response.data.data || response.data;
      
      const summary = {
        totalProducts: products.length,
        totalStock: products.reduce((sum, p) => sum + (p.cantidad || p.stock || 0), 0),
        lowStockProducts: products.filter(p => 
          (p.cantidad || p.stock || 0) <= (p.stockMinimo || 5)
        ).length,
        outOfStockProducts: products.filter(p => 
          (p.cantidad || p.stock || 0) === 0
        ).length
      };
      
      return { success: true, data: summary };
    } catch (error) {
      console.error('Error obteniendo resumen de inventario:', error);
      throw error;
    }
  }
};

export default apiService;