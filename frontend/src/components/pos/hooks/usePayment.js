import { useState, useCallback } from 'react';
import apiService from '../../../services/apiService';
import { toast } from 'react-toastify';

const usePayment = ({ cartItems, calculateTotal, setError }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  // Procesar venta con validaciones
  const processSale = useCallback(async () => {
    try {
      // Validar que hay productos
      if (!cartItems || cartItems.length === 0) {
        toast.error('No hay productos en el carrito');
        return;
      }

      // Validar nombre de cliente
      if (!clientName.trim()) {
        toast.error('Ingrese el nombre del cliente');
        return;
      }

      // Validar monto recibido para pagos en efectivo
      if (paymentMethod === 'efectivo') {
        const receivedAmount = parseFloat(amountReceived) || 0;
        const total = calculateTotal();
        
        if (receivedAmount < total) {
          toast.error('El monto recibido no puede ser menor al total');
          return;
        }
      }

      // Iniciar proceso de venta
      setLoading(true);

      // Formato de venta para la API
      const saleData = {
        clientName: clientName.trim(),
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.nombre,
          price: item.precio,
          quantity: item.quantity,
          subtotal: item.precio * item.quantity
        })),
        total: calculateTotal(),
        paymentMethod,
        amountReceived: paymentMethod === 'efectivo' ? parseFloat(amountReceived) : calculateTotal(),
        change: paymentMethod === 'efectivo' ? parseFloat(amountReceived) - calculateTotal() : 0,
        date: new Date().toISOString()
      };

      console.log('Enviando datos de venta:', saleData);
      
      // Llamada a la API
      const result = await apiService.processSale(saleData);
      
      if (result && result.success) {
        toast.success('Venta procesada correctamente');
        setShowPaymentModal(false);
        
        // Limpiar el formulario
        setClientName('');
        setAmountReceived('');
        setPaymentMethod('efectivo');
        
        // Aquí deberíamos limpiar el carrito, pero como no tenemos acceso
        // a setCartItems en este hook, emitiremos un evento personalizado
        const event = new CustomEvent('sale-completed', { detail: result });
        window.dispatchEvent(event);

        return result;
      } else {
        throw new Error(result?.message || 'Error procesando la venta');
      }
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      if (typeof setError === 'function') {
        setError(`Error al procesar la venta: ${error.message}`);
        setTimeout(() => setError(null), 3000);
      }
      toast.error(`Error al procesar la venta: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cartItems, clientName, paymentMethod, amountReceived, calculateTotal, setError]);

  return {
    showPaymentModal,
    setShowPaymentModal,
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    clientName,
    setClientName,
    loading,
    processSale
  };
};

export default usePayment;