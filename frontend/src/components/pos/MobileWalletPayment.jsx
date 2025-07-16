import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaMobile, FaCheckCircle, FaTimesCircle, FaFlask } from 'react-icons/fa';
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

  return (
    <div className="mobile-wallet-payment">
      <Row>
        <Col md={6}>
          <Card className="sync-code-card">
            <Card.Header className="sync-code-header">
              <h5 className="sync-code-title">
                <FaMobile className="me-2" />
                Código de Sincronización
              </h5>
            </Card.Header>
            <Card.Body className="sync-code-body">
              <div className="sync-code-display">
                <div className="sync-code-number">
                  {syncCode}
                </div>
              </div>
              
              <Badge className="amount-badge">
                Monto: ${amount.toFixed(2)} MXN
              </Badge>
              
              <p className="sync-instructions">
                El cliente debe ingresar este código en su app móvil
              </p>

              {paymentStatus === 'pending' && (
                <div className="payment-status-pending">
                  <div className="status-content">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Esperando pago desde la app móvil...</span>
                  </div>
                  {checkingPayment && (
                    <small className="checking-text">Verificando estado...</small>
                  )}
                </div>
              )}

              {paymentStatus === 'confirmed' && (
                <Alert className="payment-success">
                  <FaCheckCircle className="me-2" />
                  ¡Pago confirmado exitosamente!
                </Alert>
              )}

              {paymentStatus === 'failed' && (
                <Alert className="payment-failed">
                  <FaTimesCircle className="me-2" />
                  Error en el pago
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="instructions-card">
            <Card.Header className="instructions-header">
              <h5 className="instructions-title">Instrucciones para el Cliente</h5>
            </Card.Header>
            <Card.Body className="instructions-body">
              <ol className="instruction-list">
                <li className="instruction-item">
                  <strong>Abrir la aplicación móvil</strong> de la wallet
                </li>
                <li className="instruction-item">
                  <strong>Tocar "Sincronizar Ahora"</strong> en la pantalla principal
                </li>
                <li className="instruction-item">
                  <strong>Ingresar el código:</strong> <code className="inline-code">{syncCode}</code>
                </li>
                <li className="instruction-item">
                  <strong>Revisar los productos</strong> y el total
                </li>
                <li className="instruction-item">
                  <strong>Confirmar el pago</strong> desde la app
                </li>
              </ol>

              <Alert className="expiration-note">
                <small>
                  <strong>Nota:</strong> El código expira en 30 minutos. 
                  Si el cliente no puede pagar, puede usar otro método.
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Botón minimalista de testing */}
      <Row className="mt-3">
        <Col md={12} className="text-center">
          <Button
            variant="warning"
            size="sm"
            onClick={handleTestPayment}
            disabled={loading || paymentStatus === 'confirmed'}
            style={{ width: '60px', height: '40px' }}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : paymentStatus === 'confirmed' ? (
              <FaCheckCircle />
            ) : (
              <FaFlask />
            )}
          </Button>
        </Col>
      </Row>

      <Alert className="troubleshooting-section">
        <h6>¿No funciona?</h6>
        <p className="mb-2">Si el cliente tiene problemas con la app móvil:</p>
        <ul className="troubleshooting-list">
          <li>Verificar que tenga conexión a internet</li>
          <li>Reintentar con un código nuevo</li>
          <li>Usar otro método de pago (tarjeta, QR SPEI, etc.)</li>
        </ul>
      </Alert>
    </div>
  );
};

export default MobileWalletPayment;