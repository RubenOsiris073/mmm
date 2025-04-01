import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AdjustmentModal = ({ show, product, onHide, onAdjust }) => {
  const [amount, setAmount] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdjust(product?.id, parseInt(amount));
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Ajustar Inventario</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {product && (
            <>
              <p>
                <strong>Producto:</strong> {product.nombre}
                <br />
                <strong>Cantidad Actual:</strong> {product.cantidad}
              </p>
              <Form.Group>
                <Form.Label>Ajuste</Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Use números negativos para reducir el inventario
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AdjustmentModal;