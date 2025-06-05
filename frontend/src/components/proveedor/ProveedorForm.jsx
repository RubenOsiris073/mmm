import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaBuilding, FaSave, FaTimes } from 'react-icons/fa';

const ProveedorForm = ({ show, onHide, proveedor, editMode, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
    contactoPrincipal: '',
    estado: 'activo',
    productosProveidos: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proveedor && editMode) {
      setFormData({
        nombre: proveedor.nombre || '',
        nit: proveedor.nit || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || '',
        contactoPrincipal: proveedor.contactoPrincipal || '',
        estado: proveedor.estado || 'activo',
        productosProveidos: Array.isArray(proveedor.productosProveidos) 
          ? proveedor.productosProveidos.join(', ') 
          : proveedor.productosProveidos || '',
        notas: proveedor.notas || ''
      });
    } else {
      resetForm();
    }
  }, [proveedor, editMode, show]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      nit: '',
      telefono: '',
      email: '',
      direccion: '',
      contactoPrincipal: '',
      estado: 'activo',
      productosProveidos: '',
      notas: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es obligatorio';
    } else if (!/^\d{9,10}-\d$/.test(formData.nit)) {
      newErrors.nit = 'El NIT debe tener el formato 123456789-1';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+57\s\d{3}\s\d{3}\s\d{4}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener el formato +57 300 123 4567';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.contactoPrincipal.trim()) {
      newErrors.contactoPrincipal = 'El contacto principal es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataToSave = {
        ...formData,
        productosProveidos: formData.productosProveidos
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0)
      };
      
      onSave(dataToSave);
      resetForm();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBuilding className="me-2" />
          {editMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Empresa *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  isInvalid={!!errors.nombre}
                  placeholder="Ej: Distribuidora López"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>NIT *</Form.Label>
                <Form.Control
                  type="text"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  isInvalid={!!errors.nit}
                  placeholder="Ej: 900123456-1"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nit}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  isInvalid={!!errors.telefono}
                  placeholder="Ej: +57 300 123 4567"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.telefono}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="contacto@empresa.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Dirección *</Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              isInvalid={!!errors.direccion}
              placeholder="Ej: Calle 123 #45-67, Bogotá"
            />
            <Form.Control.Feedback type="invalid">
              {errors.direccion}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contacto Principal *</Form.Label>
                <Form.Control
                  type="text"
                  name="contactoPrincipal"
                  value={formData.contactoPrincipal}
                  onChange={handleChange}
                  isInvalid={!!errors.contactoPrincipal}
                  placeholder="Nombre del contacto"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactoPrincipal}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Productos que Provee</Form.Label>
            <Form.Control
              type="text"
              name="productosProveidos"
              value={formData.productosProveidos}
              onChange={handleChange}
              placeholder="Ej: Lacteos, Bebidas, Snacks (separados por comas)"
            />
            <Form.Text className="text-muted">
              Separe los productos con comas
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas Adicionales</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Información adicional sobre el proveedor..."
            />
          </Form.Group>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              <Alert.Heading>Por favor corrige los siguientes errores:</Alert.Heading>
              <ul className="mb-0">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            <FaTimes className="me-1" />
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            <FaSave className="me-1" />
            {loading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Guardar')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProveedorForm;