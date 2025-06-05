import React from 'react';
import { Modal, Row, Col, Badge, Card, Button, Table } from 'react-bootstrap';
import { FaBuilding, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaShoppingCart } from 'react-icons/fa';

const ProveedorDetails = ({ show, onHide, proveedor, onEdit }) => {
  if (!proveedor) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEstadoBadge = (estado) => {
    return estado === 'activo' ? 
      <Badge bg="success">Activo</Badge> : 
      <Badge bg="secondary">Inactivo</Badge>;
  };

  const getCalificacionStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= calificacion ? 'text-warning' : 'text-muted'} 
        />
      );
    }
    return stars;
  };

  // Datos mock de compras recientes
  const comprasRecientes = [
    {
      id: '001',
      fecha: '2025-06-02',
      productos: ['Leche Entera 1L', 'Yogurt Natural', 'Queso Mozzarella'],
      cantidad: 50,
      total: 125000
    },
    {
      id: '002',
      fecha: '2025-05-28',
      productos: ['Bebidas Gaseosas', 'Agua Mineral', 'Jugos Naturales'],
      cantidad: 30,
      total: 89000
    },
    {
      id: '003',
      fecha: '2025-05-20',
      productos: ['Snacks Variados', 'Galletas', 'Chocolates'],
      cantidad: 25,
      total: 67000
    }
  ];

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBuilding className="me-2" />
          Detalles del Proveedor
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          {/* Información General */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Información General</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Nombre de la Empresa:</strong>
                      <div>{proveedor.nombre}</div>
                    </div>
                    <div className="mb-3">
                      <strong>NIT:</strong>
                      <div>{proveedor.nit}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Estado:</strong>
                      <div>{getEstadoBadge(proveedor.estado)}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Contacto Principal:</strong>
                      <div>{proveedor.contactoPrincipal}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Fecha de Registro:</strong>
                      <div>
                        <FaCalendarAlt className="me-1" />
                        {new Date(proveedor.fechaRegistro).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Calificación:</strong>
                      <div>
                        {getCalificacionStars(proveedor.calificacion)}
                        <span className="ms-2">{proveedor.calificacion}/5</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Información de Contacto */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Información de Contacto</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong><FaPhone className="me-1" />Teléfono:</strong>
                      <div>{proveedor.telefono}</div>
                    </div>
                    <div className="mb-3">
                      <strong><FaEnvelope className="me-1" />Email:</strong>
                      <div>
                        <a href={`mailto:${proveedor.email}`}>{proveedor.email}</a>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong><FaMapMarkerAlt className="me-1" />Dirección:</strong>
                      <div>{proveedor.direccion}</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Productos Proveídos */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Productos que Provee</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {proveedor.productosProveidos.map((producto, index) => (
                    <Badge key={index} bg="primary" className="p-2">
                      {producto}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Notas */}
            {proveedor.notas && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Notas Adicionales</h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0">{proveedor.notas}</p>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Estadísticas y Compras Recientes */}
          <Col lg={4}>
            {/* Estadísticas */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Estadísticas</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <h3 className="text-primary">{proveedor.totalCompras}</h3>
                  <small>Total de Compras</small>
                </div>
                <div className="text-center mb-3">
                  <h4 className="text-success">{formatCurrency(proveedor.montoTotal)}</h4>
                  <small>Monto Total</small>
                </div>
                <div className="text-center mb-3">
                  <h5 className="text-info">{formatCurrency(proveedor.montoTotal / (proveedor.totalCompras || 1))}</h5>
                  <small>Promedio por Compra</small>
                </div>
                <div className="text-center">
                  <small className="text-muted">
                    Última compra: {proveedor.ultimaCompra}
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* Compras Recientes */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FaShoppingCart className="me-1" />
                  Compras Recientes
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasRecientes.map((compra) => (
                      <tr key={compra.id}>
                        <td>
                          <small>{compra.fecha}</small>
                        </td>
                        <td>
                          <small>{compra.cantidad}</small>
                        </td>
                        <td>
                          <small>{formatCurrency(compra.total)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={() => onEdit(proveedor)}>
          <FaEdit className="me-1" />
          Editar Proveedor
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProveedorDetails;