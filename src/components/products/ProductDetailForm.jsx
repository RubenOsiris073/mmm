import React, { useState } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { saveProductDetails } from '../../services/storageService';

const ProductDetailForm = ({ initialProduct = null, onSuccess }) => {
  const defaultFormData = {
    nombre: '',
    cantidad: 1,
    fechaCaducidad: '',
    ubicacion: 'Bodega principal',
    precio: '',
    categoria: '',
    codigo: '',
    stockMinimo: 5,
    notas: '',
    proveedor: '',
    unidadMedida: 'unidad'
  };

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...initialProduct,
    nombre: initialProduct?.label || initialProduct?.nombre || ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convertir valores numéricos a números
    const processedValue = type === 'number' ? (value ? parseFloat(value) : '') : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Si viene de una detección, guardar el tipo detectado
      const productToSave = {
        ...formData,
        tipoDetectado: initialProduct?.label || null,
        precisionDeteccion: initialProduct?.similarity || null,
        detectionId: initialProduct?.id || null, // Añadir el ID de la detección original
        fechaRegistro: new Date().toISOString()
      };
      await saveProductDetails(productToSave);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError("Ocurrió un error al guardar el producto. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ej. Botella de agua 1L"
            />
            <Form.Control.Feedback type="invalid">
              Ingresa un nombre para el producto
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              name="cantidad"
              min="1"
              step="1"
              value={formData.cantidad}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Unidad de Medida</Form.Label>
            <Form.Select
              name="unidadMedida"
              value={formData.unidadMedida}
              onChange={handleInputChange}
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramo</option>
              <option value="g">Gramo</option>
              <option value="l">Litro</option>
              <option value="ml">Mililitro</option>
              <option value="paquete">Paquete</option>
              <option value="caja">Caja</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Caducidad</Form.Label>
            <Form.Control
              type="date"
              name="fechaCaducidad"
              value={formData.fechaCaducidad}
              onChange={handleInputChange}
            />
            <Form.Text className="text-muted">
              Dejar en blanco si no aplica
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Código/SKU</Form.Label>
            <Form.Control
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              placeholder="Ej. PRD-001"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="alimentos">Alimentos</option>
              <option value="bebidas">Bebidas</option>
              <option value="limpieza">Productos de limpieza</option>
              <option value="medicamentos">Medicamentos</option>
              <option value="otros">Otros</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Selecciona una categoría
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ubicación/Almacén</Form.Label>
            <Form.Control
              type="text"
              name="ubicacion"
              placeholder="Bodega principal"
              value={formData.ubicacion}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Stock Mínimo</Form.Label>
            <Form.Control
              type="number"
              name="stockMinimo"
              min="0"
              value={formData.stockMinimo}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Proveedor</Form.Label>
            <Form.Control
              type="text"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              placeholder="Opcional"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-4">
        <Form.Label>Observaciones</Form.Label>
        <Form.Control
          as="textarea"
          name="notas"
          rows={3}
          value={formData.notas}
          onChange={handleInputChange}
          placeholder="Información adicional sobre el producto..."
        />
      </Form.Group>
      
      <div className="d-grid">
        <Button 
          variant="success" 
          type="submit" 
          size="lg" 
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Guardando...
            </>
          ) : (
            'Guardar Producto'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ProductDetailForm;