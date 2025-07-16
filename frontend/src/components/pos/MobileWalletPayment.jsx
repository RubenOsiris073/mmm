import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaFlask, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MobileWalletPayment = ({ amount, items, onPaymentConfirmed }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const handleTestPayment = async () => {
    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/stripe/test-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'mxn',
          metadata: {
            source: 'pos-test-payment',
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error procesando pago de prueba');
      }

      const paymentData = data.data;
      
      if (paymentData.status === 'succeeded') {
        setPaymentStatus('confirmed');
        toast.success('¡Pago exitoso!');
        
        if (onPaymentConfirmed) {
          onPaymentConfirmed({
            paymentIntentId: paymentData.paymentIntentId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: paymentData.status,
            method: 'mobile-wallet-test'
          });
        }
      } else {
        throw new Error(`Pago no completado: ${paymentData.status}`);
      }
      
    } catch (err) {
      console.error('Error en pago:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Button
        variant="warning"
        size="lg"
        onClick={handleTestPayment}
        disabled={loading || paymentStatus === 'confirmed'}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : paymentStatus === 'confirmed' ? (
          <FaCheckCircle />
        ) : (
          <FaFlask />
        )}
      </Button>
    </div>
  );
};

export default MobileWalletPayment;