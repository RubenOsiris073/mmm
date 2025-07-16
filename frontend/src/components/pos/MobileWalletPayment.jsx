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

  // Renderizar botón de testing en el header usando portal
  const testButtonContainer = document.getElementById('test-button-container-header');
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
    <div className="wallet-payment-container">
      {testButton}
      
      <div className="wallet-payment-content">
        {/* Columna Izquierda: Información del servicio */}
        <div className="payment-left-section">
          <div className="service-info">
            <div className="service-icon">
              <FaMobile />
            </div>
            <h4 className="service-title">App Móvil Wallet</h4>
            <p className="service-description">
              Paga de forma segura usando tu aplicación móvil. 
              Escanea el código y confirma el pago desde tu dispositivo.
            </p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">
                <strong>Pago Seguro</strong>
                <span>Protección avanzada con encriptación de extremo a extremo</span>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">
                <strong>Sincronización Rápida</strong>
                <span>Conecta tu dispositivo en segundos con el código único</span>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">
                <strong>Confirmación Instantánea</strong>
                <span>Recibe confirmación inmediata una vez completado el pago</span>
              </div>
            </div>
          </div>

          <div className="pricing-section">
            <div className="price-label">Total a pagar</div>
            <div className="price-amount">${amount.toFixed(2)}<span className="currency">MXN</span></div>
          </div>
        </div>

        {/* Columna Derecha: Código y formulario */}
        <div className="payment-right-section">
          <div className="sync-code-container">
            <h5 className="sync-title">Código de Sincronización</h5>
            <div className="sync-code-display">
              {syncCode || '------'}
            </div>
            <p className="sync-instruction">
              Ingresa este código en tu aplicación móvil
            </p>
          </div>

          {/* Estado del pago */}
          {paymentStatus === 'pending' && (
            <div className="payment-status-display">
              <div className="status-indicator">
                <Spinner animation="border" size="sm" />
              </div>
              <div className="status-text">
                <strong>Esperando confirmación</strong>
                <span>Completa el pago desde tu aplicación móvil</span>
                {checkingPayment && <small>Verificando estado...</small>}
              </div>
            </div>
          )}

          {paymentStatus === 'confirmed' && (
            <div className="payment-status-display success">
              <div className="status-indicator">
                <FaCheckCircle />
              </div>
              <div className="status-text">
                <strong>¡Pago Confirmado!</strong>
                <span>Tu transacción se ha procesado exitosamente</span>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="payment-status-display error">
              <div className="status-indicator">
                <FaTimesCircle />
              </div>
              <div className="status-text">
                <strong>Error en el Pago</strong>
                <span>Por favor, intenta nuevamente</span>
              </div>
            </div>
          )}

          <div className="payment-info">
            <small>
              <strong>Nota:</strong> El código expira en 30 minutos. 
              Asegúrate de completar el pago antes de que expire.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletPayment;