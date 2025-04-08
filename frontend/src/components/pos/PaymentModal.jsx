import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

const PaymentModal = ({
  show,
  onHide,
  paymentMethod,
  setPaymentMethod,
  amountReceived,
  setAmountReceived,
  clientName,
  setClientName,
  total,
  handleProcessSale,
  loading
}) => {
  const [change, setChange] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  // Verificamos que todas las funciones sean realmente funciones
  const safeSetPaymentMethod = typeof setPaymentMethod === 'function' 
    ? setPaymentMethod 
    : () => console.error('setPaymentMethod no es una función');
    
  const safeSetAmountReceived = typeof setAmountReceived === 'function'
    ? setAmountReceived
    : () => console.error('setAmountReceived no es una función');
    
  const safeSetClientName = typeof setClientName === 'function'
    ? setClientName
    : () => console.error('setClientName no es una función');
    
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

  // Validación del formulario
  useEffect(() => {
    let valid = !!clientName;
    
    if (paymentMethod === 'efectivo') {
      valid = valid && parseFloat(amountReceived) >= total;
    }
    
    setIsFormValid(valid);
  }, [clientName, amountReceived, total, paymentMethod]);

  return (
    <Modal show={show} onHide={safeOnHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Procesar Pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Cliente</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese nombre del cliente"
              value={clientName}
              onChange={(e) => safeSetClientName(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Método de Pago</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => safeSetPaymentMethod(e.target.value)}
              disabled={loading}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
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
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h5>Total a Pagar: ${total.toFixed(2)}</h5>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={safeOnHide} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={safeHandleProcessSale}
          disabled={!isFormValid || loading}
        >
          {loading ? 'Procesando...' : 'Confirmar Pago'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;