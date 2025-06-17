// Servicio para sincronizar carritos entre el POS y la aplicación móvil
import apiService from './apiService';

/**
 * Servicio para sincronización de carritos entre POS y aplicación móvil
 */
class CartSyncService {
  /**
   * Crea un nuevo carrito compartido
   * @param {Array} items - Items en el carrito
   * @param {Number} total - Total del carrito
   * @returns {Promise<Object>} - Respuesta con sessionId
   */
  async createSharedCart(items, total) {
    try {
      const deviceInfo = {
        type: 'web',
        browser: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };

      const response = await apiService.post('/cart', {
        items,
        total,
        deviceInfo
      });

      return response;
    } catch (error) {
      console.error('Error al crear carrito compartido:', error);
      throw error;
    }
  }

  /**
   * Obtiene un carrito compartido por ID de sesión
   * @param {String} sessionId - ID de sesión del carrito
   * @returns {Promise<Object>} - Carrito
   */
  async getSharedCart(sessionId) {
    try {
      const response = await apiService.get(`/cart/${sessionId}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener carrito compartido (${sessionId}):`, error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un carrito
   * @param {String} sessionId - ID de sesión del carrito
   * @param {Object} statusData - Datos de estado
   * @returns {Promise<Object>} - Respuesta
   */
  async updateCartStatus(sessionId, statusData) {
    try {
      const response = await apiService.patch(`/cart/${sessionId}/status`, statusData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar estado del carrito (${sessionId}):`, error);
      throw error;
    }
  }

  /**
   * Procesa el pago de un carrito
   * @param {String} sessionId - ID de sesión del carrito
   * @param {Object} paymentInfo - Información del pago
   * @returns {Promise<Object>} - Respuesta
   */
  async processPayment(sessionId, paymentInfo) {
    try {
      const response = await apiService.post(`/cart/${sessionId}/payment`, paymentInfo);
      return response;
    } catch (error) {
      console.error(`Error al procesar pago del carrito (${sessionId}):`, error);
      throw error;
    }
  }

  /**
   * Verifica el estado de un pago
   * @param {String} sessionId - ID de sesión del carrito
   * @returns {Promise<Object>} - Estado actual del pago
   */
  async checkPaymentStatus(sessionId) {
    try {
      const cart = await this.getSharedCart(sessionId);
      return {
        status: cart?.data?.status || 'unknown',
        paymentInfo: cart?.data?.paymentInfo || null
      };
    } catch (error) {
      console.error(`Error al verificar estado de pago (${sessionId}):`, error);
      throw error;
    }
  }
}

export default new CartSyncService();