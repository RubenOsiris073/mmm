import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logs
api.interceptors.request.use(request => {
  console.log('Enviando petición:', request.method, request.url);
  return request;
});

const bodegaService = {
  // Obtener inventario
  getInventario: async () => {
    try {
      const response = await api.get('/bodega/inventario');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      throw new Error('No se pudo cargar el inventario');
    }
  },

  // Registrar movimiento (entrada/salida)
  registrarMovimiento: async (datos) => {
    try {
      const response = await api.post('/bodega/movimientos', datos);
      return response.data;
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      throw new Error('No se pudo registrar el movimiento');
    }
  },

  // Obtener movimientos
  getMovimientos: async (limit = 10) => {
    try {
      const response = await api.get(`/bodega/movimientos?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      return [];
    }
  },

  // Registrar producto detectado
  registrarProducto: async (productoData) => {
    try {
      const response = await api.post('/bodega/productos', productoData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar producto:', error);
      throw new Error('No se pudo registrar el producto');
    }
  }
};

export default bodegaService;