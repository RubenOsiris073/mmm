/**
 * Formatea un timestamp de Firestore a una cadena legible
 */
export const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';
  
      // Si es un timestamp de Firestore
      if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
  
      // Si es una fecha ISO string
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
  
      return 'Fecha inválida';
    } catch (error) {
      console.error('Error formateando timestamp:', error);
      return 'Error en fecha';
    }
  };
  
  /**
   * Obtiene la fecha y hora actual en formato UTC
   */
  export const getCurrentTimestamp = () => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  };
  
  /**
   * Formatea una cantidad a moneda MXN
   */
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };
  
  /**
   * Capitaliza un string
   */
  export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  const helpers = {
    formatTimestamp,
    getCurrentTimestamp,
    formatCurrency,
    capitalize
  };

export default helpers;