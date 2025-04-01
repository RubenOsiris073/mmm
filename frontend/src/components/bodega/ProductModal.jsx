import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

const ProductoModal = ({ show, onHide, producto, onGuardar, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: 1,
    tipo: 'entrada',
    categoria: '',
    notas: ''
  });

  useEffect(() => {
    if (producto) {
      setFormData(prev => ({
        ...prev,
        nombre: producto.label || ''
      }));
    }
  }, [producto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...formData,
      cantidad: parseInt(formData.cantidad),
      deteccion: producto
    });
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Producto</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {producto && (
            <Alert variant="info">
              Producto detectado: {producto.label}
              <br />
              Confianza: {(producto.confidence * 100).toFixed(2)}%
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              value={formData.cantidad}
              onChange={e => setFormData({...formData, cantidad: e.target.value})}
              required
              min="1"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              type="text"
              value={formData.categoria}
              onChange={e => setFormData({...formData, categoria: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.notas}
              onChange={e => setFormData({...formData, notas: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductoModal;