import axios from 'axios';
import { API_BASE_URL } from '../config';

// Definir tipos para el carrito sincronizado
export interface CartItem {
  id: string | number;
  nombre: string;
  precio: number;
  quantity: number;
  imageUrl?: string;
}

export interface SyncedCart {
  sessionId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updated: string;
}

export interface PaymentInfo {
  method: string;
  amount: number;
  currency: string;
  timestamp: string;
  provider: string;
  transactionId: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  paymentInfo: PaymentInfo;
  orderId?: string;
}

class CartService {
  // Obtener el carrito sincronizado por sessionId o código corto
  async getSyncedCart(sessionId: string): Promise<SyncedCart> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart/sync/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching synced cart:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'No se pudo obtener el carrito');
    }
  }

  // Procesar el pago para el carrito sincronizado
  async processPayment(sessionId: string, paymentInfo: PaymentInfo): Promise<PaymentResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cart/sync/${sessionId}/pay`, { paymentInfo });
      return response.data;
    } catch (error: any) {
      console.error('Error processing payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al procesar el pago');
    }
  }

  // Verificar el estado del pago
  async checkPaymentStatus(orderId: string): Promise<PaymentResult> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions/${orderId}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking payment status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al verificar el estado del pago');
    }
  }

  // Generar un nuevo código de sesión
  async generateSessionCode(): Promise<{sessionId: string, shortCode: string}> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cart/sync/generate`);
      return response.data;
    } catch (error: any) {
      console.error('Error generating session code:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al generar código de sesión');
    }
  }
}

export default new CartService();