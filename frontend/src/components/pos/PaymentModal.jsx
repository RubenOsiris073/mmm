import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Alert, Form } from 'react-bootstrap';
import StripeCardPayment from './StripeCardPayment';
import SimpleQRPayment from './SimpleQRPayment';
import MobileWalletPayment from './MobileWalletPayment';
import './styles/PaymentModal.css';

const PaymentModal = ({
  show,
  onHide,
  paymentMethod,
  setPaymentMethod,
  amountReceived,
  setAmountReceived,
  total,
  handleProcessSale,
  loading,
  cartItems
}) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [qrPaymentConfirmed, setQrPaymentConfirmed] = useState(false);
  const [cardPaymentData, setCardPaymentData] = useState(null);
  const [walletPaymentData, setWalletPaymentData] = useState(null);

  // Verificamos que todas las funciones sean realmente funciones
  const safeSetPaymentMethod = typeof setPaymentMethod === 'function' 
    ? setPaymentMethod 
    : () => console.error('setPaymentMethod no es una función');

  const safeHandleProcessSale = typeof handleProcessSale === 'function'
    ? handleProcessSale
    : () => console.error('handleProcessSale no es una función');
  
  const safeOnHide = () => {
    if (loading) return;
    
    // Limpiar estados
    setQrPaymentConfirmed(false);
    setCardPaymentData(null);
    setWalletPaymentData(null);
    
    if (typeof onHide === 'function') {
      onHide();
    }
  };

  // Validar formulario según método de pago
  useEffect(() => {
    let valid = false;
    
    if (paymentMethod === 'efectivo') {
      valid = parseFloat(amountReceived || 0) >= total;
    } else if (paymentMethod === 'qr-spei') {
      valid = qrPaymentConfirmed;
    } else if (paymentMethod === 'tarjeta') {
      valid = cardPaymentData !== null;
    } else if (paymentMethod === 'mobile-wallet') {
      valid = walletPaymentData !== null;
    }
    
    setIsFormValid(valid);
  }, [amountReceived, total, paymentMethod, qrPaymentConfirmed, cardPaymentData, walletPaymentData]);

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
  
  // Manejar pago confirmado desde la wallet móvil
  const handleWalletPaymentConfirmed = (paymentData) => {
    console.log('Pago con wallet móvil confirmado:', paymentData);
    setWalletPaymentData(paymentData);
    
    // Procesar la venta automáticamente
    if (handleProcessSale) {
      handleProcessSale(paymentData);
    }
  };

  // Reiniciar estados cuando se cambia el método de pago
  useEffect(() => {
    setQrPaymentConfirmed(false);
    setCardPaymentData(null);
    setWalletPaymentData(null);
  }, [paymentMethod]);

  return (
    <Modal 
      show={show} 
      onHide={safeOnHide} 
      centered 
      backdrop="static" 
      size={paymentMethod === 'qr-spei' || paymentMethod === 'mobile-wallet' ? 'xl' : 'lg'}
      className="payment-modal-custom"
    >
      <Modal.Header closeButton className="payment-modal-header">
        <Modal.Title className="payment-modal-title">Procesar Pago</Modal.Title>
      </Modal.Header>
      <Modal.Body className="payment-modal-body">
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="payment-form-label">Método de Pago</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => safeSetPaymentMethod(e.target.value)}
              disabled={loading}
              className="payment-form-select"
            >
              <option value="tarjeta">Tarjeta de Crédito/Débito</option>
              <option value="qr-spei">Transferencia QR SPEI</option>
              <option value="mobile-wallet">App Móvil Wallet</option>
            </Form.Select>
          </Form.Group>

          {/* {paymentMethod === 'efectivo' && (
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
          )} */}

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
              concept={`POS Sale ${Date.now()}`}
              onPaymentConfirmed={handleQRPaymentConfirmed}
            />
          )}
          
          {paymentMethod === 'mobile-wallet' && (
            <MobileWalletPayment
              amount={total}
              items={cartItems}
              onPaymentConfirmed={handleWalletPaymentConfirmed}
            />
          )}
          
          {(paymentMethod !== 'qr-spei' && paymentMethod !== 'tarjeta' && paymentMethod !== 'mobile-wallet') && (
            <div className="payment-total-section">
              <h5>Total a Pagar: ${total.toFixed(2)}</h5>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="payment-modal-footer">
        <Button variant="outline-secondary" onClick={safeOnHide} disabled={loading} className="payment-btn-cancel">
          Cancelar
        </Button>
        {paymentMethod !== 'tarjeta' && paymentMethod !== 'mobile-wallet' && (
          <Button 
            variant="dark" 
            onClick={safeHandleProcessSale}
            disabled={!isFormValid || loading}
            className="payment-btn-confirm"
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        )}
        {(paymentMethod === 'tarjeta' && cardPaymentData) || (paymentMethod === 'mobile-wallet' && walletPaymentData) ? (
          <div className="payment-success-message">
            <i className="fas fa-check-circle me-2"></i>
            Pago procesado exitosamente
          </div>
        ) : null}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;