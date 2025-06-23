import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button, Alert, Spinner, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './styles/StripeCardPayment.css';

// Función para obtener la clave de Stripe de forma segura
const getStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error('REACT_APP_STRIPE_PUBLISHABLE_KEY no está definida');
    return null;
  }
  console.log('Stripe Key encontrada:', key.slice(0, 20) + '...');
  return key;
};

// Inicializar Stripe solo si tenemos la clave
let stripePromise = null;

const initializeStripe = () => {
  if (!stripePromise) {
    const key = getStripeKey();
    if (key) {
      console.log('Inicializando Stripe...');
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
};

// Opciones minimalistas para el CardElement con paleta consistente
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#212529',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#6c757d',
      },
      iconColor: '#495057',
    },
    invalid: {
      color: '#dc3545',
      iconColor: '#dc3545',
    },
    complete: {
      color: '#198754',
      iconColor: '#198754',
    },
  },
  hidePostalCode: true,
};

// Componente del formulario de tarjeta profesional
const CardPaymentForm = ({ amount, onPaymentSuccess, onPaymentError, loading: externalLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [cardFocused, setCardFocused] = useState(false);

  // Crear Payment Intent cuando se monta el componente
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: 'mxn',
            metadata: {
              source: 'pos-system',
              timestamp: new Date().toISOString()
            }
          }),
        });

        const data = await response.json();

        if (data.success) {
          setClientSecret(data.data.clientSecret);
          setPaymentIntentId(data.data.paymentIntentId);
          console.log('Payment Intent creado:', data.data.paymentIntentId);
        } else {
          throw new Error(data.error || 'Error creando Payment Intent');
        }
      } catch (err) {
        console.error('Error creando Payment Intent:', err);
        setError(`Error preparando el pago: ${err.message}`);
        onPaymentError && onPaymentError(err);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, onPaymentError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe no está listo. Intenta de nuevo.');
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirmar el pago
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Cliente POS',
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('Pago exitoso:', paymentIntent.id);
        toast.success('¡Pago procesado exitosamente!');
        
        // Llamar al callback de éxito
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            method: 'tarjeta'
          });
        }
      } else {
        throw new Error(`Pago no completado: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Error procesando pago:', err);
      const errorMessage = err.message || 'Error procesando el pago';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (onPaymentError) {
        onPaymentError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = loading || externalLoading;

  return (
    <div className="payment-body">
      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="error-alert mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Resumen del pago */}
        <div className="payment-summary">
          <Row>
            <Col>
              <div className="mb-1 text-muted" style={{fontSize: '14px'}}>Total a pagar</div>
              <div className="payment-amount">${amount.toFixed(2)} <span className="payment-currency">MXN</span></div>
            </Col>
            {paymentIntentId && (
              <Col xs="auto" className="text-end">
                <div className="payment-id">
                  <i className="bi bi-receipt me-1"></i>
                  ID: {paymentIntentId.slice(-8)}
                </div>
              </Col>
            )}
          </Row>
        </div>

        {/* Logos de tarjetas */}
        <div className="card-logos-section">
          <div className={`card-logo visa-logo ${cardBrand === 'visa' ? 'active' : ''}`} title="Visa"></div>
          <div className={`card-logo mastercard-logo ${cardBrand === 'mastercard' ? 'active' : ''}`} title="MasterCard"></div>
          <div className={`card-logo amex-logo ${cardBrand === 'amex' ? 'active' : ''}`} title="American Express"></div>
        </div>

        {/* Campo de tarjeta */}
        <div className="card-input-section">
          <div className="card-input-label">
            <i className="bi bi-credit-card"></i>
            Información de la Tarjeta
          </div>
          
          <div className={`card-input-container ${cardFocused ? 'focused' : ''}`}>
            <CardElement 
              options={cardElementOptions}
              onFocus={() => setCardFocused(true)}
              onBlur={() => setCardFocused(false)}
              onChange={(event) => {
                if (event.error) {
                  setError(event.error.message);
                } else {
                  setError(null);
                }
                
                // Detectar tipo de tarjeta
                if (event.brand) {
                  setCardBrand(event.brand);
                }
              }}
            />
          </div>
        </div>

        {/* Badge de seguridad */}
        <div className="security-badge">
          <i className="bi bi-shield-lock-fill"></i>
          Conexión segura SSL • Datos protegidos por Stripe
        </div>

        {/* Botón de pago */}
        <Button
          type="submit"
          className="payment-button"
          disabled={!stripe || !clientSecret || isProcessing}
        >
          {isProcessing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando pago...
            </>
          ) : (
            <>
              <i className="bi bi-lock-fill me-2"></i>
              Pagar ${amount.toFixed(2)}
            </>
          )}
        </Button>

        {/* Footer con información */}
        <div className="payment-footer">
          <i className="bi bi-info-circle me-1"></i>
          Tu pago será procesado de forma segura
        </div>
      </Form>
    </div>
  );
};

// Componente principal que envuelve el formulario con Elements
const StripeCardPayment = ({ amount, onPaymentSuccess, onPaymentError, loading }) => {
  const [stripeReady, setStripeReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        const key = getStripeKey();
        if (!key) {
          throw new Error('Clave pública de Stripe no configurada');
        }
        
        const stripe = await initializeStripe();
        if (stripe) {
          setStripeReady(true);
          console.log('Stripe inicializado correctamente');
        } else {
          throw new Error('Error inicializando Stripe');
        }
      } catch (error) {
        console.error('Error inicializando Stripe:', error);
        setInitError(error.message);
        if (onPaymentError) {
          onPaymentError(error);
        }
      }
    };

    checkStripe();
  }, [onPaymentError]);

  if (!amount || amount <= 0) {
    return (
      <Alert variant="warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Monto inválido para procesar el pago
      </Alert>
    );
  }

  if (initError) {
    return (
      <Alert variant="danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Error de configuración: {initError}
        <br />
        <small>Por favor, contacte al administrador del sistema.</small>
      </Alert>
    );
  }

  if (!stripeReady) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Inicializando sistema de pagos...</p>
      </div>
    );
  }

  return (
    <Elements stripe={initializeStripe()}>
      <div className="stripe-payment-container">
        {/* Header profesional */}
        <div className="payment-header">
          <h5>Pago con Tarjeta</h5>
          <p>Procesado de forma segura por Stripe</p>
        </div>

        <CardPaymentForm
          amount={amount}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          loading={loading}
        />
      </div>
    </Elements>
  );
};

export default StripeCardPayment;