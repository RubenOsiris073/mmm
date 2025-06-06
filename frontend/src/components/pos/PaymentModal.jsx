import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import SimpleQRPayment from './SimpleQRPayment';
import StripeCardPayment from './StripeCardPayment';

const PaymentModal = ({
  show,
  onHide,
  paymentMethod,
  setPaymentMethod,
  amountReceived,
  setAmountReceived,
  total,
  handleProcessSale,
  loading
}) => {
  const [change, setChange] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [qrPaymentConfirmed, setQrPaymentConfirmed] = useState(false);
  const [cardPaymentData, setCardPaymentData] = useState(null);

  // Verificamos que todas las funciones sean realmente funciones
  const safeSetPaymentMethod = typeof setPaymentMethod === 'function' 
    ? setPaymentMethod 
    : () => console.error('setPaymentMethod no es una función');
    
  const safeSetAmountReceived = typeof setAmountReceived === 'function'
    ? setAmountReceived
    : () => console.error('setAmountReceived no es una función');
    
  const safeHandleProcessSale = typeof handleProcessSale === 'function'
    ? handleProcessSale
    : () => console.error('handleProcessSale no es una función');
  
  const safeOnHide = typeof onHide === 'function'
    ? onHide
    : () => console.error('onHide no es una función');

  // Calcular cambio cuando cambia el monto recibido
  useEffect(() => {
    if (paymentMethod === 'efectivo') {
      const receivedAmount = parseFloat(amountReceived) || 0;
      setChange(Math.max(0, receivedAmount - total));
    } else {
      setChange(0);
    }
  }, [amountReceived, total, paymentMethod]);

  // Validación del formulario - incluir tarjeta
  useEffect(() => {
    let valid = true;
    
    if (paymentMethod === 'efectivo') {
      valid = parseFloat(amountReceived) >= total;
    } else if (paymentMethod === 'qr-spei') {
      valid = qrPaymentConfirmed;
    } else if (paymentMethod === 'tarjeta') {
      valid = cardPaymentData !== null;
    }
    
    setIsFormValid(valid);
  }, [amountReceived, total, paymentMethod, qrPaymentConfirmed, cardPaymentData]);

  // Manejar confirmación de pago QR
  const handleQRPaymentConfirmed = (paymentData) => {
    setQrPaymentConfirmed(true);
    console.log('Pago QR confirmado:', paymentData);
  };

  // Manejar éxito del pago con tarjeta
  const handleCardPaymentSuccess = (paymentData) => {
    console.log('Pago con tarjeta exitoso:', paymentData);
    setCardPaymentData(paymentData);
    
    // Procesar la venta automáticamente después del pago exitoso
    if (handleProcessSale) {
      handleProcessSale(paymentData);
    }
  };

  // Manejar error del pago con tarjeta
  const handleCardPaymentError = (error) => {
    console.error('Error en pago con tarjeta:', error);
    setCardPaymentData(null);
  };

  // Reiniciar estados cuando se cambia el método de pago
  useEffect(() => {
    setQrPaymentConfirmed(false);
    setCardPaymentData(null);
  }, [paymentMethod]);

  return (
    <Modal show={show} onHide={safeOnHide} centered backdrop="static" size={paymentMethod === 'qr-spei' ? 'xl' : 'lg'}>
      <Modal.Header closeButton>
        <Modal.Title>Procesar Pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Método de Pago</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => safeSetPaymentMethod(e.target.value)}
              disabled={loading}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="qr-spei">QR mediante SPEI</option>
            </Form.Select>
          </Form.Group>
          
          {paymentMethod === 'efectivo' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Monto Recibido</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min={total}
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={(e) => safeSetAmountReceived(e.target.value)}
                    disabled={loading}
                    required
                  />
                </InputGroup>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Cambio</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={change.toFixed(2)}
                    readOnly
                  />
                </InputGroup>
              </Form.Group>
            </>
          )}

          {paymentMethod === 'tarjeta' && (
            <StripeCardPayment
              amount={total}
              onPaymentSuccess={handleCardPaymentSuccess}
              onPaymentError={handleCardPaymentError}
              loading={loading}
            />
          )}

          {paymentMethod === 'qr-spei' && (
            <SimpleQRPayment 
              amount={total}
              concept={`Venta POS ${Date.now()}`}
              onPaymentConfirmed={handleQRPaymentConfirmed}
            />
          )}
          
          {(paymentMethod !== 'qr-spei' && paymentMethod !== 'tarjeta') && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <h5>Total a Pagar: ${total.toFixed(2)}</h5>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={safeOnHide} disabled={loading}>
          Cancelar
        </Button>
        {paymentMethod !== 'tarjeta' && (
          <Button 
            variant="primary" 
            onClick={safeHandleProcessSale}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        )}
        {paymentMethod === 'tarjeta' && cardPaymentData && (
          <div className="text-success">
            <i className="bi bi-check-circle me-2"></i>
            Pago procesado exitosamente
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;