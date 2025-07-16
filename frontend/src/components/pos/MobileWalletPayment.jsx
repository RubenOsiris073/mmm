import React, { useState } from 'react';
import { Card, Alert, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaMobile, FaCheckCircle, FaCreditCard, FaFlask } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import './styles/MobileWalletPayment.css';

const MobileWalletPayment = ({ amount, items, onPaymentConfirmed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, confirmed, failed

  // Datos de tarjeta de prueba hardcodeados (del README)
  const TEST_CARD_DATA = {
    number: '4242424242424242', // Visa
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  };

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

  return (
    <div className="mobile-wallet-payment">
      <Row>
        <Col md={12}>
          <Card className="test-payment-card">
            <Card.Header className="test-payment-header">
              <h5 className="test-payment-title">
                <FaMobile className="me-2" />
                Pago con Wallet Móvil
              </h5>
            </Card.Header>
            <Card.Body className="test-payment-body">
              
              {/* Resumen del pago */}
              <div className="payment-summary mb-4">
                <Row>
                  <Col>
                    <div className="mb-1 text-muted" style={{fontSize: '14px'}}>Total a pagar</div>
                    <div className="payment-amount" style={{fontSize: '24px', fontWeight: 'bold', color: '#28a745'}}>
                      ${amount.toFixed(2)} <span style={{fontSize: '16px', color: '#6c757d'}}>MXN</span>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <Badge bg="info" className="items-badge">
                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
                    </Badge>
                  </Col>
                </Row>
              </div>

              {/* Estado del pago */}
              {paymentStatus === 'confirmed' && (
                <Alert variant="success" className="mb-4">
                  <FaCheckCircle className="me-2" />
                  ¡Pago procesado exitosamente!
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {/* Botón de pago de prueba */}
              <div className="test-payment-section">
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
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
                        <small>Este botón simula un pago real usando datos de prueba de Stripe</small>
                      </div>
                    </div>
                  </Alert>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="instructions-section mt-4">
                <h6>Instrucciones:</h6>
                <ol className="instruction-list">
                  <li>Haz clic en "Test Pay" para simular un pago</li>
                  <li>El sistema procesará automáticamente el pago con datos de prueba</li>
                  <li>Una vez confirmado, la venta se registrará en el sistema</li>
                </ol>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MobileWalletPayment;