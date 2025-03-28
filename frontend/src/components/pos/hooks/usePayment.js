import { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

const usePayment = ({ cartItems, calculateTotal, setError, loading: parentLoading }) => {
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  // Process the sale
  const processSale = async () => {
    try {
      setLoading(true);

      if (cartItems.length === 0) {
        setError("El carrito está vacío");
        return;
      }

      const total = calculateTotal();
      const change = amountReceived ? parseFloat(amountReceived) - total : 0;

      const saleData = {
        items: cartItems.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          quantity: item.quantity,
          total: item.total
        })),
        total: total,
        paymentMethod: paymentMethod,
        amountReceived: parseFloat(amountReceived) || total,
        change: change,
        clientName: clientName || "Cliente General",
        timestamp: new Date().toISOString()
      };

      const result = await apiService.createSale(saleData);

      if (result && result.success) {
        toast.success("Venta realizada con éxito");
        resetPaymentForm();
        
        // Reload wallet to update stock - this would normally be handled in the parent component
        try {
          await apiService.getWallet();
        } catch (err) {
          console.error("Error recargando wallet después de la venta:", err);
        }
      } else {
        throw new Error(result?.error || "Error al procesar venta");
      }
    } catch (err) {
      console.error("Error procesando venta:", err);
      setError("Error al procesar la venta. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Reset the payment form
  const resetPaymentForm = () => {
    // This would trigger a reset of the cart in the parent component
    setPaymentMethod('efectivo');
    setAmountReceived('');
    setClientName('');
    setShowPaymentModal(false);
  };

  return {
    showPaymentModal,
    paymentMethod,
    amountReceived,
    clientName,
    setShowPaymentModal,
    setPaymentMethod,
    setAmountReceived,
    setClientName,
    processSale,
    loading: loading || parentLoading
  };
};

export default usePayment;