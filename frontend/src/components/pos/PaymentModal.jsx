import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import MobileWalletPayment from './MobileWalletPayment';
import './styles/PaymentModal.css';

const PaymentModal = ({
  show,
  onHide,
  total,
  handleProcessSale,
  loading,
  cartItems
}) => {
  const [walletPaymentData, setWalletPaymentData] = useState(null);
  
  const handleClose = () => {
    if (loading) return;
    setWalletPaymentData(null);
    onHide();
  };
  
  const handleWalletPaymentConfirmed = (paymentData) => {
    console.log('Pago con wallet móvil confirmado:', paymentData);
    setWalletPaymentData(paymentData);
    handleProcessSale(paymentData);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      backdrop="static" 
      size="lg"
      className="payment-modal-custom"
    >
      <Modal.Header closeButton className="payment-modal-header">
        <Modal.Title className="payment-modal-title">App Móvil Wallet</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="payment-modal-body">
        <MobileWalletPayment
          amount={total}
          items={cartItems}
          onPaymentConfirmed={handleWalletPaymentConfirmed}
        />
      </Modal.Body>
      
      {walletPaymentData && (
        <Modal.Footer className="payment-modal-footer">
          <div className="payment-success-message">
            <i className="fas fa-check-circle me-2"></i>
            Pago procesado exitosamente
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default PaymentModal;