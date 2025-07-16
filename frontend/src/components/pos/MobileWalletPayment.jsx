import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaMobile, FaCheckCircle, FaTimesCircle, FaCreditCard, FaFlask } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './styles/MobileWalletPayment.css';

const MobileWalletPayment = ({ amount, items, onPaymentConfirmed }) => {
  // Estados para sincronización con wallet
  const [syncCode, setSyncCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, confirmed, failed
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Datos de tarjeta de prueba hardcodeados (del README)
  const TEST_CARD_DATA = {
    number: '4242424242424242', // Visa
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  };

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

  // Función para procesar pago de prueba usando el backend
  const handleTestPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      toast.info('Iniciando pago de prueba...', { autoClose: 2000 });
      
      // Llamar al backend para procesar el pago de prueba directamente
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
        toast.success('¡Pago de prueba exitoso!');
        
        // Llamar callback de éxito
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
      console.error('Error en pago de prueba:', err);
      setError(err.message);
      toast.error(`Error en pago de prueba: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setInitialized(false);
    setError('');
    setPaymentStatus('pending');
    setSyncCode('');
    setSessionId('');
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
                  {syncCode || '------'}
                </div>
              </div>
              
              <Badge bg="success" className="amount-badge">
                Monto: ${amount.toFixed(2)} MXN
              </Badge>
              
              <p className="sync-instructions">
                El cliente debe ingresar este código en su app móvil
              </p>

              {paymentStatus === 'pending' && syncCode && (
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
                <Alert variant="success" className="payment-success">
                  <FaCheckCircle className="me-2" />
                  ¡Pago confirmado exitosamente!
                </Alert>
              )}

              {paymentStatus === 'failed' && (
                <Alert variant="danger" className="payment-failed">
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
                  <strong>Ingresar el código:</strong> <code className="inline-code">{syncCode || '------'}</code>
                </li>
                <li className="instruction-item">
                  <strong>Revisar los productos</strong> y el total
                </li>
                <li className="instruction-item">
                  <strong>Confirmar el pago</strong> desde la app
                </li>
              </ol>

              <Alert variant="info" className="expiration-note">
                <small>
                  <strong>Nota:</strong> El código expira en 30 minutos. 
                  Si el cliente no puede pagar, puede usar el botón de prueba abajo.
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección de pago de prueba */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="test-payment-card">
            <Card.Header className="test-payment-header">
              <h5 className="test-payment-title">
                <FaFlask className="me-2" />
                Pago de Prueba (Para Testing)
              </h5>
            </Card.Header>
            <Card.Body className="test-payment-body">
              
              {error && (
                <Alert variant="danger" className="mb-3">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {/* Botón de pago de prueba */}
              <div className="test-payment-section">
                <div className="d-grid gap-2">
                  <Button
                    variant="warning"
                    size="lg"
                    onClick={handleTestPayment}
                    disabled={loading || paymentStatus === 'confirmed'}
                    className="test-pay-button"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Procesando pago de prueba...
                      </>
                    ) : paymentStatus === 'confirmed' ? (
                      <>
                        <FaCheckCircle className="me-2" />
                        Pago completado
                      </>
                    ) : (
                      <>
                        <FaFlask className="me-2" />
                        Test Pay - Pagar ${amount.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>

                {/* Información de la tarjeta de prueba */}
                <div className="test-card-info mt-3">
                  <Alert variant="info" className="mb-0">
                    <div className="d-flex align-items-center">
                      <FaCreditCard className="me-2" />
                      <div>
                        <strong>Tarjeta de prueba:</strong> Visa •••• 4242
                        <br />
                        <small>Este botón simula un pago real usando datos de prueba de Stripe (solo para testing)</small>
                      </div>
                    </div>
                  </Alert>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Alert variant="secondary" className="troubleshooting-section mt-4">
        <h6>¿No funciona?</h6>
        <p className="mb-2">Si el cliente tiene problemas con la app móvil:</p>
        <ul className="troubleshooting-list">
          <li>Verificar que tenga conexión a internet</li>
          <li>Reintentar con un código nuevo</li>
          <li>Usar el botón "Test Pay" para simular el pago</li>
        </ul>
      </Alert>
    </div>
  );
};

export default MobileWalletPayment;