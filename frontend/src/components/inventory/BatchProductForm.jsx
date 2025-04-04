import React, { useState } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';

const BatchProductForm = ({ batchProducts, setBatchProducts }) => {
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    cantidad: '',
    precioUnitario: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    proveedor: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProductToBatch = () => {
    if (!newProduct.nombre || !newProduct.cantidad || !newProduct.precioUnitario) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    setBatchProducts(prev => [...prev, { ...newProduct, id: Date.now() }]);
    setNewProduct({
      nombre: '',
      cantidad: '',
      precioUnitario: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      proveedor: ''
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>Registro Manual de Productos en Bruto</h4>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Producto *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={newProduct.nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Cantidad *</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad"
                  value={newProduct.cantidad}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Precio Unitario *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="precioUnitario"
                  value={newProduct.precioUnitario}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Proveedor</Form.Label>
                <Form.Control
                  type="text"
                  name="proveedor"
                  value={newProduct.proveedor}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                className="mb-3 w-100"
                onClick={addProductToBatch}
              >
                Agregar al Lote
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BatchProductForm;