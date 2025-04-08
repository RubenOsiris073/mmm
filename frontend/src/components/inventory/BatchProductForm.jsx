import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import './inventory.css';

const BatchProductForm = ({ batchProducts, setBatchProducts }) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('almacen-principal');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

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
    <>
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Instrucciones para el Registro Manual de Inventario
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <ol>
                <li className="mb-2">Busque y seleccione un producto en el menú desplegable.</li>
                <li className="mb-2">Indique la cantidad de unidades a registrar.</li>
                <li className="mb-2">Seleccione la ubicación donde se registrará el producto.</li>
                <li className="mb-2">Haga clic en "Agregar a Lote" para incluir el producto en el lote actual.</li>
                <li className="mb-2">Repita los pasos anteriores para agregar más productos al lote si es necesario.</li>
                <li>Una vez completado el lote, haga clic en "Registrar Lote" para finalizar.</li>
              </ol>
            </Col>
            <Col md={4}>
              <Alert variant="info" className="h-100 mb-0 d-flex align-items-center">
                <div>
                  <i className="bi bi-lightbulb-fill me-2 fs-4"></i>
                  <strong>Consejos:</strong>
                  <p className="mb-0 mt-2">
                    El registro manual es ideal para ingresar múltiples productos a la vez. 
                    Utilice la búsqueda para encontrar rápidamente productos específicos en el catálogo.
                  </p>
                </div>
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
    </>
  );
};

export default BatchProductForm;