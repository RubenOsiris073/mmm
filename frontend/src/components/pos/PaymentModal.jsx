import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
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
    setWalletPaymentData(null);
    
    if (typeof onHide === 'function') {
      onHide();
    }
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
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <div className="payment-form-label mb-1">Método de Pago</div>
              <div className="payment-method-title">App Móvil Wallet</div>
            </div>
            <div id="test-button-container">
              {/* El botón de testing se renderizará aquí */}
            </div>
          </div>

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

          <MobileWalletPayment
            amount={total}
            items={cartItems}
            onPaymentConfirmed={handleWalletPaymentConfirmed}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer className="payment-modal-footer">
        <Button variant="outline-secondary" onClick={safeOnHide} disabled={loading} className="payment-btn-cancel">
          Cancelar
        </Button>
        {walletPaymentData && (
          <div className="payment-success-message">
            <i className="fas fa-check-circle me-2"></i>
            Pago procesado exitosamente
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;