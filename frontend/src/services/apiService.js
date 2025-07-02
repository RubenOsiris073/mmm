import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Sistema de caché simple para optimizar rendimiento
const cache = new Map();
const CACHE_DURATION = 30000; // 30 segundos para datos que cambian poco

// Función para manejar caché
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache HIT para: ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`Datos cached para: ${key}`);
};

// Crear instancia de axios optimizada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Reducir timeout para fallos más rápidos
  headers: {
    'Content-Type': 'application/json',
  },
  // Optimizaciones de axios
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    try {
      // Intentar obtener el token de Firebase de manera más robusta
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true); // forzar refresh del token
        config.headers.Authorization = `Bearer ${token}`;
        
        if (import.meta.env.DEV) {
          console.log('Token de autenticación agregado correctamente');
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('No hay usuario autenticado - sin token');
        }
      }
    } catch (error) {
      console.error('Error obteniendo token de autenticación:', error.message);
    }
    
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor optimizado para logs solo en desarrollo
if (import.meta.env.DEV) {
  api.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} - ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('API Error:', error.response?.status, error.message);
      return Promise.reject(error);
    }
  );
}

const apiService = {
  // Función para obtener productos con caché inteligente
  getProducts: async (useCache = true) => {
    try {
      const cacheKey = 'products';
      
      // Intentar obtener de caché primero
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      console.log('Obteniendo productos del servidor...');
      const response = await api.get('/products');
      
      // Cachear la respuesta completa
      setCachedData(cacheKey, response);
      
      return response;
      
    } catch (error) {
      console.error('Error en getProducts:', error.message);
      
      // Si hay error, intentar devolver datos del caché aunque estén expirados
      const cachedData = cache.get('products');
      if (cachedData) {
        console.log('Usando datos en caché debido a error de red');
        return cachedData.data;
      }
      
      throw error;
    }
  },

  // Función para obtener ventas con caché
  getSales: async (useCache = true) => {
    try {
      const cacheKey = 'sales';
      
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      console.log('Obteniendo ventas del servidor...');
      const response = await api.get('/sales');
      const salesData = response.data.sales || [];
      
      setCachedData(cacheKey, salesData);
      return salesData;
      
    } catch (error) {
      console.error('Error en getSales:', error.message);
      
      // Fallback a caché si existe
      const cachedData = cache.get('sales');
      if (cachedData) {
        console.log('Usando ventas en caché debido a error de red');
        return cachedData.data;
      }
      
      throw error;
    }
  },

  // Función para crear venta (invalida caché de ventas)
  createSale: async (saleData) => {
    try {
      console.log('Enviando venta...');
      const response = await api.post('/sales', saleData);
      
      // Invalidar caché de ventas después de crear una nueva
      cache.delete('sales');
      console.log('Cache de ventas invalidado');
      
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  // Eliminar producto (invalida caché de productos)
  deleteProduct: async (productId) => {
    try {
      console.log(`Eliminando producto: ${productId}`);
      const response = await api.delete(`/products/${productId}`);
      
      // Invalidar caché de productos
      cache.delete('products');
      console.log('Cache de productos invalidado');
      
      return response.data;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  },

  // Actualizar stock (invalida caché de productos)
  updateProductStock: async (productId, adjustment, reason = 'Ajuste manual') => {
    try {
      console.log(`Actualizando stock - Producto: ${productId}, Ajuste: ${adjustment}`);
      const response = await api.put(`/products/${productId}/stock`, {
        adjustment,
        reason
      });
      
      // Invalidar caché de productos
      cache.delete('products');
      
      return response.data;
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  },

  // Obtener stock con caché individual por producto
  getProductStock: async (productId, useCache = true) => {
    try {
      const cacheKey = `product_${productId}`;
      
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      const response = await api.get(`/products/${productId}`);
      const result = {
        success: true,
        productId,
        stock: response.data.cantidad || response.data.stock || 0,
        stockMinimo: response.data.stockMinimo || 0
      };
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo stock:', error);
      throw error;
    }
  },

  // Establecer stock específico (invalida cachés)
  setProductStock: async (productId, newQuantity, reason = 'Establecer stock') => {
    try {
      console.log(`Estableciendo stock - Producto: ${productId}, Nueva cantidad: ${newQuantity}`);
      const response = await api.put(`/products/${productId}/stock`, {
        adjustment: newQuantity,
        reason,
        absolute: true
      });
      
      // Invalidar cachés relacionados
      cache.delete('products');
      cache.delete(`product_${productId}`);
      
      return response.data;
    } catch (error) {
      console.error('Error estableciendo stock:', error);
      throw error;
    }
  },

  // Obtener resumen de inventario con caché
  getInventorySummary: async (useCache = true) => {
    try {
      const cacheKey = 'inventory_summary';
      
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
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
      
      const result = { success: true, data: summary };
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo resumen de inventario:', error);
      throw error;
    }
  },

  // Función para limpiar caché manualmente
  clearCache: () => {
    cache.clear();
    console.log('Cache completamente limpiado');
  },

  // Función para obtener estadísticas del caché
  getCacheStats: () => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      totalMemory: JSON.stringify(Array.from(cache.entries())).length
    };
  },

  // Funciones para Dashboard con Google Sheets
  getDashboardMetrics: async (useCache = true) => {
    try {
      const cacheKey = 'dashboard_metrics';
      
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      console.log('Obteniendo métricas del dashboard desde Google Sheets...');
      const response = await api.get('/dashboard/metrics');
      
      setCachedData(cacheKey, response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error obteniendo métricas del dashboard:', error.message);
      
      // Fallback a caché si existe
      const cachedData = cache.get('dashboard_metrics');
      if (cachedData) {
        console.log('Usando métricas en caché debido a error de red');
        return cachedData.data;
      }
      
      throw error;
    }
  },

  getSalesDataFromSheets: async (range = null, useCache = true) => {
    try {
      const cacheKey = `sheets_sales_${range || 'default'}`;
      
      if (useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      console.log('Obteniendo datos de ventas desde Google Sheets...');
      const url = range ? `/dashboard/sales-data?range=${encodeURIComponent(range)}` : '/dashboard/sales-data';
      const response = await api.get(url);
      
      setCachedData(cacheKey, response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error obteniendo datos de Google Sheets:', error.message);
      
      // Fallback a caché si existe
      const cachedData = cache.get(`sheets_sales_${range || 'default'}`);
      if (cachedData) {
        console.log('Usando datos de Sheets en caché debido a error de red');
        return cachedData.data;
      }
      
      throw error;
    }
  },

  // Funciones para Logs del Backend
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo logs:', error.message);
      throw error;
    }
  },

  clearLogs: async () => {
    try {
      const response = await api.post('/logs/clear');
      return response.data;
    } catch (error) {
      console.error('Error limpiando logs:', error.message);
      throw error;
    }
  },

  downloadLogs: async (format = 'json') => {
    try {
      const response = await api.get(`/logs/download`, {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error descargando logs:', error.message);
      throw error;
    }
  }
};

export default apiService;