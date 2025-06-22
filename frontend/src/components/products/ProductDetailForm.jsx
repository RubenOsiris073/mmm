import React, { useState } from 'react';
import { Form, Row, Col, Button, Alert, Spinner, Card, InputGroup, Badge } from 'react-bootstrap';
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

  // Función para generar código automático
  const generateCode = () => {
    const prefix = formData.categoria?.substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, codigo: code }));
  };

  return (
    <div className="modern-form-container">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="mb-4 modern-alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}

        {/* Sección: Información Básica */}
        <Card className="form-section-card mb-4">
          <Card.Header className="form-section-header">
            <h5 className="mb-0">
              <i className="bi bi-box-seam me-2 text-primary"></i>
              Información Básica del Producto
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-tag me-2"></i>
                    Nombre del Producto *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Botella de agua premium 1L"
                    className="form-control-modern"
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un nombre para el producto
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-upc-scan me-2"></i>
                    Código/SKU
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      placeholder="PRD-001"
                      className="form-control-modern"
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={generateCode}
                      type="button"
                      title="Generar código automático"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Código único para identificar el producto
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    Categoría *
                  </Form.Label>
                  <Form.Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="form-control-modern"
                  >
                    <option value="">🏷️ Seleccionar categoría</option>
                    <option value="alimentos">🍎 Alimentos</option>
                    <option value="bebidas">🥤 Bebidas</option>
                    <option value="limpieza">🧽 Productos de limpieza</option>
                    <option value="medicamentos">💊 Medicamentos</option>
                    <option value="panaderia">🍞 Panadería</option>
                    <option value="lacteos">🥛 Lácteos</option>
                    <option value="carnes">🥩 Carnes y embutidos</option>
                    <option value="otros">📦 Otros</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Selecciona una categoría para el producto
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Precio de Venta
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="input-addon-modern currency-symbol">$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="precio"
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="form-control-modern"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Precio al que se venderá el producto
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sección: Inventario y Stock */}
        <Card className="form-section-card mb-4">
          <Card.Header className="form-section-header">
            <h5 className="mb-0">
              <i className="bi bi-archive me-2 text-success"></i>
              Inventario y Stock
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-hash me-2"></i>
                    Cantidad Inicial *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad"
                    min="1"
                    step="1"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    required
                    className="form-control-modern"
                  />
                  <Form.Control.Feedback type="invalid">
                    La cantidad debe ser mayor a 0
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-rulers me-2"></i>
                    Unidad de Medida
                  </Form.Label>
                  <Form.Select
                    name="unidadMedida"
                    value={formData.unidadMedida}
                    onChange={handleInputChange}
                    className="form-control-modern"
                  >
                    <option value="unidad">📦 Unidad</option>
                    <option value="kg">⚖️ Kilogramo</option>
                    <option value="g">📏 Gramo</option>
                    <option value="l">🪣 Litro</option>
                    <option value="ml">🥤 Mililitro</option>
                    <option value="paquete">📦 Paquete</option>
                    <option value="caja">📦 Caja</option>
                    <option value="botella">🍾 Botella</option>
                    <option value="lata">🥫 Lata</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Stock Mínimo
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="stockMinimo"
                    min="0"
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    className="form-control-modern"
                  />
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Alerta cuando el stock sea menor a este valor
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-geo-alt me-2"></i>
                    Ubicación/Almacén
                  </Form.Label>
                  <Form.Select
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    className="form-control-modern"
                  >
                    <option value="Bodega principal">🏪 Bodega principal</option>
                    <option value="Refrigerado">❄️ Área refrigerada</option>
                    <option value="Congelado">🧊 Área congelada</option>
                    <option value="Exhibición">🛍️ Área de exhibición</option>
                    <option value="Almacén secundario">📦 Almacén secundario</option>
                    <option value="Farmacia">💊 Farmacia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-calendar-check me-2"></i>
                    Fecha de Caducidad
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaCaducidad"
                    value={formData.fechaCaducidad}
                    onChange={handleInputChange}
                    className="form-control-modern"
                  />
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Opcional - Solo para productos perecederos
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sección: Información Adicional */}
        <Card className="form-section-card mb-4">
          <Card.Header className="form-section-header">
            <h5 className="mb-0">
              <i className="bi bi-info-circle me-2 text-info"></i>
              Información Adicional
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    <i className="bi bi-truck me-2"></i>
                    Proveedor
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor (opcional)"
                    className="form-control-modern"
                  />
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Empresa o persona que suministra este producto
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                {initialProduct?.label && (
                  <div className="detection-info-card">
                    <Form.Label className="form-label-modern">
                      <i className="bi bi-eye me-2"></i>
                      Detección Automática
                    </Form.Label>
                    <div className="detection-badge-container">
                      <Badge bg="info" className="detection-badge">
                        <i className="bi bi-robot me-1"></i>
                        Detectado como: {initialProduct.label}
                      </Badge>
                      {initialProduct.similarity && (
                        <Badge bg="secondary" className="ms-2">
                          Precisión: {Math.round(initialProduct.similarity * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-modern">
                <i className="bi bi-chat-text me-2"></i>
                Observaciones y Notas
              </Form.Label>
              <Form.Control
                as="textarea"
                name="notas"
                rows={4}
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Información adicional sobre el producto: características especiales, instrucciones de manejo, etc..."
                className="form-control-modern"
              />
              <Form.Text className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Cualquier información relevante sobre el producto
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Botón de Envío Modernizado */}
        <div className="form-submit-container">
          <div className="d-grid gap-2">
            <Button 
              variant="success" 
              type="submit" 
              size="lg" 
              disabled={saving}
              className="submit-button-modern"
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
                  <span>Guardando producto...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <span>{initialProduct ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Información de ayuda */}
          <div className="form-help-text mt-3 text-center">
            <small className="text-muted">
              <i className="bi bi-lightbulb me-1"></i>
              Los campos marcados con * son obligatorios. La información se guardará de forma segura.
            </small>
          </div>
        </div>
      </Form>

      <style jsx>{`
        .modern-form-container {
          max-width: 100%;
          margin: 0 auto;
        }

        .form-section-card {
          border: none;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          background: var(--card-bg);
        }

        .form-section-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .form-section-header {
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
        }

        .form-section-header h5 {
          color: var(--text-primary);
          font-weight: 600;
          margin: 0;
        }

        .form-label-modern {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .form-control-modern {
          border-radius: 12px;
          border: 2px solid var(--border-color);
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .form-control-modern:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .input-addon-modern {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 600;
        }

        .currency-symbol {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 600;
          padding: 0.75rem 1rem;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
        }

        /* Específico para tema oscuro - Símbolo de moneda */
        [data-theme="dark"] .currency-symbol {
          background: var(--bg-secondary) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }

        /* También aplicar a todos los input-addon-modern en tema oscuro */
        [data-theme="dark"] .input-addon-modern {
          background: var(--bg-secondary) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }

        .detection-info-card {
          background: linear-gradient(135deg, rgba(13, 202, 240, 0.1), rgba(13, 202, 240, 0.05));
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(13, 202, 240, 0.2);
        }

        .detection-badge {
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }

        .submit-button-modern {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
          border-radius: 16px;
          padding: 1rem 2rem;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .submit-button-modern:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
          background: linear-gradient(135deg, #20c997 0%, #28a745 100%);
        }

        .submit-button-modern:disabled {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          box-shadow: none;
        }

        .form-submit-container {
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }

        .form-help-text {
          background: rgba(108, 117, 125, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(108, 117, 125, 0.2);
        }

        .modern-alert {
          border: none;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          font-weight: 500;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .form-section-card {
            margin-bottom: 1rem;
          }
          
          .form-section-header {
            padding: 0.75rem 1rem;
          }
          
          .form-section-card .card-body {
            padding: 1rem !important;
          }
          
          .submit-button-modern {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailForm;