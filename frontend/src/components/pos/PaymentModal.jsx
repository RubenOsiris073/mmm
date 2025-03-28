import React from 'react';
import { Modal, Form, Row, Col, Alert, Table, Button, Spinner } from 'react-bootstrap';

const PaymentModal = ({ 
  show, 
  onHide,
  cartItems, 
  calculateTotal, 
  clientName, 
  setClientName, 
  paymentMethod, 
  setPaymentMethod, 
  amountReceived, 
  setAmountReceived, 
  loading, 
  processSale 
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Procesar Pago</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre del cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Total a Pagar</Form.Label>
                <Form.Control
                  type="text"
                  value={`$${calculateTotal().toFixed(2)}`}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Método de Pago</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                  <option value="transferencia">Transferencia</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Monto Recibido</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese el monto"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  disabled={paymentMethod !== 'efectivo'}
                />
              </Form.Group>
            </Col>
          </Row>

          {paymentMethod === 'efectivo' && amountReceived && (
            <Alert variant="info">
              <strong>Cambio a devolver:</strong> ${Math.max(0, (parseFloat(amountReceived) - calculateTotal())).toFixed(2)}
            </Alert>
          )}

          <Table striped bordered>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>${item.precio}</td>
                  <td>{item.quantity}</td>
                  <td>${item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3} className="text-end">Total:</th>
                <th>${calculateTotal().toFixed(2)}</th>
              </tr>
            </tfoot>
          </Table>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={processSale}
          disabled={loading || (paymentMethod === 'efectivo' && (!amountReceived || parseFloat(amountReceived) < calculateTotal()))}
        >
          {loading ? (
            <><Spinner size="sm" animation="border" className="me-2" /> Procesando...</>
          ) : (
            'Completar Venta'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;