import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { addProduct } from '../services/predictionService';

const ProductForm = ({ detectedObject }) => {
  const initialFormState = {
    nombre: '',
    cantidad: 1,
    fechaCaducidad: '',
    ubicacion: '',
    precio: '',
    categoria: '',
    codigo: '',
    stockMinimo: 5,
    notas: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Actualizar nombre del producto cuando cambia la detección
  useEffect(() => {
    if (detectedObject && detectedObject !== 'Desconocido') {
      setFormData(prevData => ({
        ...prevData,
        nombre: detectedObject.charAt(0).toUpperCase() + detectedObject.slice(1),
        // Asignar categoría automáticamente según el objeto detectado
        categoria: detectedObject === 'botella' ? 'bebidas' : 
                   detectedObject === 'barrita' ? 'alimentos' : 'otros'
      }));
    }
  }, [detectedObject]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await addProduct({
        ...formData,
        fechaRegistro: new Date().toISOString(),
        tipoObjeto: detectedObject
      });
      
      // Mostrar mensaje de éxito
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Restablecer formulario pero mantener el objeto detectado
      const detectedName = detectedObject ? 
        detectedObject.charAt(0).toUpperCase() + detectedObject.slice(1) : '';
      
      setFormData({
        ...initialFormState,
        nombre: detectedName,
        categoria: detectedObject === 'botella' ? 'bebidas' : 
                   detectedObject === 'barrita' ? 'alimentos' : 'otros'
      });
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              name="cantidad"
              min="1"
              value={formData.cantidad}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de caducidad</Form.Label>
            <Form.Control
              type="date"
              name="fechaCaducidad"
              value={formData.fechaCaducidad}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

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

      <Row>
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
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
            >
              <option value="">Seleccionar categoría</option>
              <option value="alimentos">Alimentos</option>
              <option value="bebidas">Bebidas</option>
              <option value="limpieza">Productos de limpieza</option>
              <option value="otros">Otros</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Código/SKU</Form.Label>
            <Form.Control
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Stock mínimo</Form.Label>
            <Form.Control
              type="number"
              name="stockMinimo"
              min="0"
              value={formData.stockMinimo}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Observaciones</Form.Label>
        <Form.Control
          as="textarea"
          name="notas"
          rows={2}
          value={formData.notas}
          onChange={handleInputChange}
        />
      </Form.Group>

      <Button 
        variant="success" 
        type="submit" 
        className="w-100 py-2" 
        disabled={saving}
      >
        {saving ? 'Guardando...' : 'Guardar Producto'}
      </Button>
      
      {saveSuccess && (
        <div className="alert alert-success mt-3">
          Producto guardado correctamente
        </div>
      )}
    </Form>
  );
};

export default ProductForm;