import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatTimestamp, getCurrentTimestamp } from '../../utils/helpers';
const UpdateModal = ({ show, onHide, product, onSubmit, currentUser }) => {
  const [adjustment, setAdjustment] = useState('');
  const [location, setLocation] = useState(product?.location || 'warehouse');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const adjustmentNum = parseInt(adjustment);
    if (!adjustmentNum || !reason) {
      return;
    }
    onSubmit(product.id, adjustmentNum, location, reason);
    setAdjustment('');
    setReason('');
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Actualizar Inventario</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Control
              type="text"
              value={product?.productName || ''}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cantidad Actual</Form.Label>
            <Form.Control
              type="text"
              value={product?.quantity || 0}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ajuste</Form.Label>
            <Form.Control
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="Ingrese el ajuste (+/-)"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ubicación</Form.Label>
            <Form.Select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="manual">Registro Manual</option>
              <option value="automatic">Registro Automático</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Razón del ajuste</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique la razón del ajuste"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <small className="text-muted">
              Usuario: {currentUser}
            </small>
            <small className="text-muted">
              Fecha: {getCurrentTimestamp()}
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!adjustment || !reason}
          >
            Actualizar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateModal;