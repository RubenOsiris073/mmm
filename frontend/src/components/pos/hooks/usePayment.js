import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

const usePayment = ({ cartItems, calculateTotal, setError }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile-wallet');
  const [amountReceived, setAmountReceived] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para procesar la venta - SIN campo clientName
  const processSale = useCallback(async (paymentData = null) => {
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
      
      // Preparar los datos de la venta - Cliente general por defecto
      const saleData = {
        client: 'Cliente general',
        paymentMethod: paymentData ? paymentData.method : paymentMethod,
        total: total,
        amountReceived: paymentMethod === 'efectivo' ? parseFloat(amountReceived) : total,
        change: paymentMethod === 'efectivo' ? parseFloat(amountReceived) - total : 0,
        // Agregar datos de pago de Stripe si están disponibles
        ...(paymentData && {
          paymentIntentId: paymentData.paymentIntentId,
          stripePaymentStatus: paymentData.status,
          stripeCurrency: paymentData.currency
        }),
        items: cartItems.map(item => {
          console.log("Procesando item del carrito:", item);
          return {
            productId: item.id,
            id: item.id, // Agregar también como 'id' por si acaso
            cantidad: item.quantity,
            precioUnitario: item.precio,
            total: item.total,
            nombre: item.nombre
          };
        })
      };
      
      console.log("=== DATOS ENVIADOS AL BACKEND ===");
      console.log("SaleData completo:", JSON.stringify(saleData, null, 2));
      console.log("Items mapeados:", saleData.items);
      
      // Enviar la venta al servidor
      const response = await apiService.createSale(saleData);
      
      // El API devuelve directamente el objeto de la venta, no un wrapper con success
      if (response && response.id) {
        toast.success('Venta procesada correctamente');
        setShowPaymentModal(false);
        
        // Limpiar el carrito, emitiendo un evento personalizado
        const event = new CustomEvent('sale-completed');
        window.dispatchEvent(event);
        
        // Restablecer estados
        setAmountReceived('');
        
        return true;
      } else {
        throw new Error('Error al procesar la venta');
      }
    } catch (error) {
      console.log("Error al procesar la venta:", error);
      setError(`Error al procesar el pago: ${error.message}`);
      setTimeout(() => setError(null), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartItems, calculateTotal, paymentMethod, amountReceived, setError]);

  return {
    showPaymentModal,
    paymentMethod,
    amountReceived,
    loading,
    setShowPaymentModal,
    setPaymentMethod,
    setAmountReceived,
    processSale
  };
};

export default usePayment;