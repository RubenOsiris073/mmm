import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

const usePayment = ({ cartItems, calculateTotal, setError }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para procesar la venta
  const processSale = useCallback(async () => {
    if (cartItems.length === 0) {
      setError('No hay productos en el carrito');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const total = calculateTotal();
    
    if (paymentMethod === 'efectivo' && 
        (isNaN(parseFloat(amountReceived)) || parseFloat(amountReceived) < total)) {
      setError('El monto recibido debe ser igual o mayor al total');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Preparar los datos de la venta
      const saleData = {
        client: clientName.trim() || 'Cliente general',
        paymentMethod: paymentMethod,
        total: total,
        amountReceived: paymentMethod === 'efectivo' ? parseFloat(amountReceived) : total,
        change: paymentMethod === 'efectivo' ? parseFloat(amountReceived) - total : 0,
        items: cartItems.map(item => ({
          productId: item.id,
          cantidad: item.quantity,
          precioUnitario: item.precio,
          total: item.total,
          nombre: item.nombre
        }))
      };
      
      console.log("Enviando datos de venta:", saleData);
      
      // Enviar la venta al servidor
      const response = await apiService.createSale(saleData);
      
      if (response && response.success) {
        toast.success('Venta procesada correctamente');
        setShowPaymentModal(false);
        
        // Limpiar el carrito, emitiendo un evento personalizado
        const event = new CustomEvent('sale-completed');
        window.dispatchEvent(event);
        
        // Restablecer estados
        setAmountReceived('');
        setClientName('');
        
        return true;
      } else {
        throw new Error(response?.message || 'Error al procesar la venta');
      }
    } catch (error) {
      console.log("Error al procesar la venta:", error);
      setError(`Error al procesar el pago: ${error.message}`);
      setTimeout(() => setError(null), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartItems, calculateTotal, paymentMethod, amountReceived, clientName, setError]);

  return {
    showPaymentModal,
    paymentMethod,
    amountReceived,
    clientName,
    loading,
    setShowPaymentModal,
    setPaymentMethod,
    setAmountReceived,
    setClientName,
    processSale
  };
};

export default usePayment;