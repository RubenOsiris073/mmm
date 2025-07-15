import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaBoxOpen, FaCalendarAlt, FaHashtag } from 'react-icons/fa';
import { getSuggestedExpirationDate } from '../../utils/productMapping';

const ProductUpdateForm = ({ product, detectionResult, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    expirationDate: '',
    batchNumber: '',
    location: product?.ubicacion || '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-llenar fecha de caducidad cuando se detecta un producto
  useEffect(() => {
    if (detectionResult && product && product.perecedero && !formData.expirationDate) {
      const suggestedDate = getSuggestedExpirationDate(product.categoria, product.perecedero);
      setFormData(prev => ({
        ...prev,
        expirationDate: suggestedDate,
        notes: `Detectado automáticamente: ${detectionResult.label} (${detectionResult.similarity}% confianza) - ${new Date(detectionResult.timestamp).toLocaleString()}`
      }));
    }
  }, [detectionResult, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (product?.perecedero && !formData.expirationDate) {
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

    const updateData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      productId: product.id,
      detectionInfo: detectionResult ? {
        label: detectionResult.label,
        confidence: detectionResult.similarity,
        timestamp: detectionResult.timestamp
      } : null
    };

    onSubmit(updateData);
  };

  // Generate automatic batch number
  const generateBatchNumber = () => {
    const date = new Date();
    const batch = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setFormData(prev => ({ ...prev, batchNumber: batch }));
  };

  return (
    <div>
      {/* Product Information */}
      <Card className="mb-4">
        <Card.Header className="bg-success text-white">
          <h6 className="mb-0">
            <FaBoxOpen className="me-2" />
            Producto Detectado
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Nombre:</strong> {product.nombre}</p>
              <p><strong>Marca:</strong> {product.marca || 'N/A'}</p>
              <p><strong>Categoría:</strong> {product.categoria}</p>
              <p><strong>Stock Actual:</strong> {product.cantidad || 0} {product.unidadMedida}</p>
            </Col>
            <Col md={6}>
              <p><strong>Precio:</strong> ${product.precio}</p>
              <p><strong>Código:</strong> {product.codigo || 'N/A'}</p>
              <p><strong>Perecedero:</strong> {product.perecedero ? 'Sí' : 'No'}</p>
              {detectionResult && (
                <div>
                  <p><strong>Confianza de Detección:</strong> {detectionResult.similarity}%</p>
                  <p><strong>Detectado como:</strong> {detectionResult.label}</p>
                  <p><strong>Timestamp:</strong> {new Date(detectionResult.timestamp).toLocaleString()}</p>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Update Form */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">Actualizar Stock del Producto</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaHashtag className="me-2" />
                    Cantidad a Agregar *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    isInvalid={!!errors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.quantity}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Stock resultante: {(product.cantidad || 0) + parseInt(formData.quantity || 0)} {product.unidadMedida}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    Fecha de Caducidad {product.perecedero && '*'}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    required={product.perecedero}
                    isInvalid={!!errors.expirationDate}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.expirationDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
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
                  <Form.Text className="text-muted">
                    Opcional: Número de lote para trazabilidad
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ej: Estante A-1, Refrigerador"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notas Adicionales</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observaciones sobre el producto o lote..."
              />
            </Form.Group>

            {detectionResult && (
              <Alert variant="info">
                <small>
                  <strong>Detección automática:</strong> {detectionResult.label} 
                  (Confianza: {detectionResult.similarity}%)
                </small>
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button 
                type="submit" 
                variant="success"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Stock'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductUpdateForm;