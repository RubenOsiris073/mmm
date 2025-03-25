import axios from 'axios';

// URL base de la API (definida en .env o por defecto)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios configurada
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Funciones para interactuar con la API
const apiService = {
  // Productos
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data.products || [];
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      return [];
    }
  },
  
  // Wallet (inventario)
  getWallet: async () => {
    try {
      const response = await api.get('/wallet');
      return response.data || { wallet: [] };
    } catch (error) {
      console.error("Error obteniendo wallet:", error);
      return { wallet: [] };
    }
  },
  // Transacciones
  getTransactions: async (limit = 50) => {
    const response = await api.get(`/transactions?limit=${limit}`);
    return response.data.transactions;
  },
  
  // Actualizar wallet manualmente
  updateWallet: async (productId, adjustment) => {
    const response = await api.post('/wallet/update', { productId, adjustment });
    return response.data;
  },
  
  // Detecciones
  getDetections: async () => {
    try {
      const response = await api.get('/detections');
      return response.data || { detections: [] };
    } catch (error) {
      console.error("Error obteniendo detecciones:", error);
      return { detections: [] };
    }
  },
  
  
  // Configuración de detección continua
  setDetectionMode: async (active, intervalMs = 3000) => {
    const response = await api.post('/detection/continuous', { active, intervalMs });
    return response.data;
  },
  
  // Consultar estado de detección continua
  getDetectionStatus: async () => {
    const response = await api.get('/detection/continuous/status');
    return response.data;
  },
  
  // Trigger manual de detección
  triggerDetection: async () => {
    try {
      const response = await api.post('/detect');
      return response.data || { success: false };
    } catch (error) {
      console.error("Error en detección manual:", error);
      throw error;
    }
  },
  
  // Ventas
  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
  
  getSales: async (limit = 50) => {
    const response = await api.get(`/sales?limit=${limit}`);
    return response.data.sales;
  },
  
  getSaleDetails: async (saleId) => {
    const response = await api.get(`/sales/${saleId}`);
    return response.data.sale;
  }
};

export default apiService;