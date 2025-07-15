import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaPlus, FaTag, FaDollarSign, FaBoxOpen } from 'react-icons/fa';

const ProductRegistrationForm = ({ detectionResult, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    nombre: detectionResult?.label || '',
    descripcion: '',
    marca: '',
    categoria: '',
    subcategoria: '',
    precio: '',
    codigo: '',
    unidadMedida: 'pieza',
    stockMinimo: 5,
    ubicacion: '',
    perecedero: false,
    notas: '',
    // Initial stock data
    initialQuantity: 1,
    expirationDate: '',
    batchNumber: ''
  });

  const [errors, setErrors] = useState({});

  const categorias = [
    'Bebidas',
    'Lácteos',
    'Carnes y Embutidos',
    'Frutas y Verduras',
    'Abarrotes Básicos',
    'Aceites y Condimentos',
    'Dulces y Chocolates',
    'Snacks y Botanas',
    'Productos de Limpieza',
    'Cuidado Personal',
    'Helados y Congelados',
    'Alimentos Instantáneos',
    'Varios'
  ];

  const unidadesMedida = [
    'pieza',
    'kilogramo',
    'gramo',
    'litro',
    'mililitro',
    'paquete',
    'caja',
    'lata',
    'botella'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    if (!formData.initialQuantity || parseInt(formData.initialQuantity) <= 0) {
      newErrors.initialQuantity = 'La cantidad inicial debe ser mayor a 0';
    }

    if (formData.perecedero && !formData.expirationDate) {
      newErrors.expirationDate = 'La fecha de caducidad es requerida para productos perecederos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      precio: parseFloat(formData.precio),
      stockMinimo: parseInt(formData.stockMinimo),
      initialQuantity: parseInt(formData.initialQuantity),
      detectionInfo: detectionResult ? {
        label: detectionResult.label,
        confidence: detectionResult.similarity,
        timestamp: detectionResult.timestamp
      } : null
    };

    onSubmit(productData);
  };

  // Generate automatic product code
  const generateProductCode = () => {
    const prefix = formData.categoria ? formData.categoria.substring(0, 3).toUpperCase() : 'PRD';
    const suffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    const code = `${prefix}${suffix}`;
    setFormData(prev => ({ ...prev, codigo: code }));
  };

  // Generate automatic batch number
  const generateBatchNumber = () => {
    const date = new Date();
    const batch = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setFormData(prev => ({ ...prev, batchNumber: batch }));
  };

  return (
    <div>
      {detectionResult && (
        <Alert variant="info" className="mb-4">
          <strong>Producto detectado:</strong> {detectionResult.label} 
          (Confianza: {detectionResult.similarity}%)
          <br />
          <small>Complete la información del producto para registrarlo en el sistema.</small>
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h6 className="mb-0">
            <FaPlus className="me-2" />
            Información del Producto
          </h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Basic Product Information */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaTag className="me-2" />
                    Nombre del Producto *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.nombre}
                    placeholder="Ej: Refresco de cola 355ml"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Ej: Coca-Cola"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.categoria}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.categoria}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategoría</Form.Label>
                  <Form.Control
                    type="text"
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleChange}
                    placeholder="Ej: Refrescos, Lácteos frescos"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada del producto..."
              />
            </Form.Group>

            {/* Pricing and Inventory */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaDollarSign className="me-2" />
                    Precio *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    isInvalid={!!errors.precio}
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.precio}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unidad de Medida</Form.Label>
                  <Form.Select
                    name="unidadMedida"
                    value={formData.unidadMedida}
                    onChange={handleChange}
                  >
                    {unidadesMedida.map(unidad => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Mínimo</Form.Label>
                  <Form.Control
                    type="number"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código del Producto</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleChange}
                      placeholder="Ej: BEB001"
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={generateProductCode}
                      className="ms-2"
                    >
                      Auto
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ej: Estante A-1, Refrigerador"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="perecedero"
                checked={formData.perecedero}
                onChange={handleChange}
                label="Producto perecedero (requiere fecha de caducidad)"
              />
            </Form.Group>

            {/* Initial Stock */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <FaBoxOpen className="me-2" />
                  Stock Inicial
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cantidad Inicial *</Form.Label>
                      <Form.Control
                        type="number"
                        name="initialQuantity"
                        value={formData.initialQuantity}
                        onChange={handleChange}
                        min="1"
                        required
                        isInvalid={!!errors.initialQuantity}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.initialQuantity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Fecha de Caducidad {formData.perecedero && '*'}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleChange}
                        required={formData.perecedero}
                        isInvalid={!!errors.expirationDate}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.expirationDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Lote</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          name="batchNumber"
                          value={formData.batchNumber}
                          onChange={handleChange}
                          placeholder="Ej: 20250715-AB12"
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={generateBatchNumber}
                          className="ms-2"
                        >
                          Auto
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Form.Group className="mb-3">
              <Form.Label>Notas Adicionales</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Observaciones especiales sobre el producto..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar Producto'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductRegistrationForm;