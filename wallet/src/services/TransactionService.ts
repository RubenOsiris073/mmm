import axios from 'axios';
import { API_BASE_URL } from '../config';

// Definir interfaces para las transacciones
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  timestamp: string | Date;
  sessionId?: string;
}

class TransactionService {
  // Obtener transacciones del usuario actual
  async getUserTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions/user/${userId}?limit=${limit}`);
      if (response.data.success) {
        return response.data.transactions;
      }
      return [];
    } catch (error: any) {
      console.error('Error obteniendo transacciones:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'No se pudieron obtener las transacciones');
    }
  }

  // Obtener detalles de una transacción específica
  async getTransactionDetails(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions/${transactionId}`);
      if (response.data.success) {
        return response.data.transaction;
      }
      throw new Error('No se pudo obtener la transacción');
    } catch (error: any) {
      console.error('Error obteniendo detalles de transacción:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'No se pudieron obtener los detalles de la transacción');
    }
  }

  // Formatear fecha de transacción
  formatTransactionDate(timestamp: string | Date): string {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener icono según el tipo de transacción
  getTransactionIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'payment':
        return 'payment';
      case 'refund':
        return 'restore';
      case 'deposit':
        return 'add_circle';
      case 'withdrawal':
        return 'remove_circle';
      default:
        return 'receipt';
    }
  }
}

export default new TransactionService();