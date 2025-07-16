import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaMobile, FaCheckCircle, FaTimesCircle, FaFlask } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import './styles/MobileWalletPayment.css';

const MobileWalletPayment = ({ amount, items, onPaymentConfirmed }) => {
  const [syncCode, setSyncCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, confirmed, failed
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Generar código de sincronización - solo una vez al montar
  useEffect(() => {
    if (initialized) return;
    
    const generateSyncCode = async () => {
      setLoading(true);
      setError('');
      
      try {
        const cartData = {
          items: items.map(item => ({
            id: item.id,
            nombre: item.nombre,
            quantity: item.quantity,
            precio: item.precio
          })),
          total: amount
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl.replace('/api', '')}/api/cart/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartData),
        });

        const data = await response.json();

        if (data.success) {
          setSyncCode(data.data.shortCode);
          setSessionId(data.data.sessionId);
          setInitialized(true);
        } else {
          throw new Error(data.error || 'Error generando código de sincronización');
        }
      } catch (err) {
        console.error('Error generando código:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateSyncCode();
  }, [amount, items, initialized]);

  // Verificar estado del pago - solo cuando hay sessionId
  useEffect(() => {
    if (!sessionId || paymentStatus !== 'pending') return;

    const checkPaymentStatus = async () => {
      setCheckingPayment(true);
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl.replace('/api', '')}/api/cart/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (data.success && data.data.status === 'paid') {
          setPaymentStatus('confirmed');
          if (onPaymentConfirmed) {
            onPaymentConfirmed({
              method: 'mobile-wallet',
              amount: amount,
              sessionId: sessionId,
              transactionId: data.data.transactionId || sessionId
            });
          }
        }
      } catch (err) {
        console.error('Error verificando estado del pago:', err);
      } finally {
        setCheckingPayment(false);
      }
    };

    // Verificar inmediatamente y luego cada 3 segundos
    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, 3000);
    
    return () => clearInterval(interval);
  }, [sessionId, paymentStatus, onPaymentConfirmed, amount]);

  const handleRetry = () => {
    setInitialized(false);
    setError('');
    setPaymentStatus('pending');
    setSyncCode('');
    setSessionId('');
  };

  // Función minimalista para pago de prueba
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

  if (loading && !initialized) {
    return (
      <div className="mobile-wallet-loading">
        <Spinner animation="border" />
        <p className="mt-2">Generando código de sincronización...</p>
      </div>
    );
  }

  if (error && !syncCode) {
    return (
      <Alert variant="danger" className="mobile-wallet-error">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={handleRetry}>
          Intentar nuevamente
        </Button>
      </Alert>
    );
  }

  // Renderizar botón de testing en el título usando portal
  const testButtonContainer = document.getElementById('test-button-container');
  const testButton = testButtonContainer && createPortal(
    <Button
      variant="warning"
      size="sm"
      onClick={handleTestPayment}
      disabled={loading || paymentStatus === 'confirmed'}
      style={{ width: '50px', height: '35px' }}
    >
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : paymentStatus === 'confirmed' ? (
        <FaCheckCircle />
      ) : (
        <FaFlask />
      )}
    </Button>,
    testButtonContainer
  );

  return (
    <div className="mobile-wallet-payment">
      {testButton}
      
      <Row>
        {/* Columna Izquierda: Información y Total */}
        <Col md={8}>
          <div className="payment-info-section">
            <h5 className="mb-3">
              <FaMobile className="me-2" />
              Pago con App Móvil
            </h5>
            
            <div className="payment-details mb-4">
              <h6>Instrucciones:</h6>
              <ol className="instruction-list">
                <li>Abrir la aplicación móvil de la wallet</li>
                <li>Tocar "Sincronizar Ahora" en la pantalla principal</li>
                <li>Ingresar el código de sincronización</li>
                <li>Revisar los productos y el total</li>
                <li>Confirmar el pago desde la app</li>
              </ol>
            </div>

            {/* Estado del pago */}
            {paymentStatus === 'pending' && (
              <div className="payment-status mb-3">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Esperando confirmación desde la app móvil...</span>
                {checkingPayment && (
                  <div><small className="text-muted">Verificando estado...</small></div>
                )}
              </div>
            )}

            {paymentStatus === 'confirmed' && (
              <Alert variant="success" className="mb-3">
                <FaCheckCircle className="me-2" />
                ¡Pago confirmado exitosamente!
              </Alert>
            )}

            {paymentStatus === 'failed' && (
              <Alert variant="danger" className="mb-3">
                <FaTimesCircle className="me-2" />
                Error en el pago
              </Alert>
            )}

            {/* Total del pago */}
            <div className="payment-total-section">
              <div className="total-line">
                <span>Total a pagar:</span>
                <span className="total-amount">${amount.toFixed(2)} MXN</span>
              </div>
              <small className="text-muted">El código expira en 30 minutos</small>
            </div>
          </div>
        </Col>

        {/* Columna Derecha: Código de Sincronización */}
        <Col md={4}>
          <div className="sync-code-section text-center">
            <h6 className="mb-3">Código de Sincronización</h6>
            <div className="sync-code-display-clean">
              <div className="sync-code-number-large">
                {syncCode || '------'}
              </div>
            </div>
            <Badge bg="primary" className="mt-2">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </Badge>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MobileWalletPayment;