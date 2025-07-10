import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Table, Spinner, Form } from 'react-bootstrap';
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaBoxOpen, 
  FaCalendarAlt, 
  FaSearch,
  FaSortAmountDown,
  FaBell,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import '../../styles/components/alerts/expiration.css';

const ExpirationAlerts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCritical, setFilterCritical] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('daysToExpire');

  // Mover mockProducts a useMemo para evitar recreación en cada render
  const mockProducts = useMemo(() => [
    {
      id: 1,
      name: 'Leche Lala Entera 1L',
      category: 'Lácteos',
      expirationDate: '2025-06-25',
      stock: 15,
      location: 'Refrigerador A-1',
      supplier: 'Lala',
      batch: 'LT001234',
      daysToExpire: 2
    },
    {
      id: 2,
      name: 'Pan Bimbo Integral',
      category: 'Panadería',
      expirationDate: '2025-06-24',
      stock: 8,
      location: 'Estante B-3',
      supplier: 'Bimbo',
      batch: 'PB567890',
      daysToExpire: 1
    },
    {
      id: 3,
      name: 'Yogurt Danone Fresa',
      category: 'Lácteos',
      expirationDate: '2025-06-26',
      stock: 24,
      location: 'Refrigerador A-2',
      supplier: 'Danone',
      batch: 'YD123456',
      daysToExpire: 3
    },
    {
      id: 4,
      name: 'Jamón San Rafael',
      category: 'Embutidos',
      expirationDate: '2025-06-28',
      stock: 5,
      location: 'Refrigerador C-1',
      supplier: 'San Rafael',
      batch: 'JR789012',
      daysToExpire: 5
    },
    {
      id: 5,
      name: 'Galletas Oreo',
      category: 'Dulces',
      expirationDate: '2025-07-15',
      stock: 32,
      location: 'Estante D-2',
      supplier: 'Nabisco',
      batch: 'OR345678',
      daysToExpire: 22
    }
  ], []); // Array vacío como dependencia ya que los datos son estáticos

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, [mockProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getAlertLevel = (daysToExpire) => {
    if (daysToExpire <= 1) return 'critical';
    if (daysToExpire <= 3) return 'warning';
    if (daysToExpire <= 7) return 'info';
    return 'normal';
  };

  const getAlertBadge = (daysToExpire) => {
    const level = getAlertLevel(daysToExpire);
    const configs = {
      critical: { variant: 'danger', text: 'CRÍTICO', icon: <FaExclamationTriangle /> },
      warning: { variant: 'warning', text: 'ADVERTENCIA', icon: <FaClock /> },
      info: { variant: 'info', text: 'PRÓXIMO', icon: <FaBell /> },
      normal: { variant: 'success', text: 'OK', icon: <FaBoxOpen /> }
    };
    
    return configs[level];
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = !filterCritical || getAlertLevel(product.daysToExpire) === 'critical';
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'daysToExpire') return a.daysToExpire - b.daysToExpire;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return a.stock - b.stock;
      return 0;
    });

  const criticalCount = products.filter(p => getAlertLevel(p.daysToExpire) === 'critical').length;
  const warningCount = products.filter(p => getAlertLevel(p.daysToExpire) === 'warning').length;
  const upcomingCount = products.filter(p => getAlertLevel(p.daysToExpire) === 'info').length;

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="expiration-alerts-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p>Cargando alertas de caducidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expiration-alerts-container">
      {/* Filters and Controls */}
      <Card className="mb-4">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaSearch className="me-2" />
                Filtros y Búsqueda
              </h5>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Buscar Producto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Ordenar por</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="daysToExpire">Días para caducar</option>
                  <option value="name">Nombre</option>
                  <option value="stock">Stock</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                label="Solo críticos"
                checked={filterCritical}
                onChange={(e) => setFilterCritical(e.target.checked)}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" className="w-100">
                <FaSortAmountDown className="me-1" />
                Filtrar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products List */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Productos por Caducar ({filteredProducts.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <FaBoxOpen className="text-muted mb-3" style={{ fontSize: '3rem' }} />
              <h5 className="text-muted">No hay productos que coincidan con los filtros</h5>
              <p className="text-muted">Intenta ajustar los criterios de búsqueda</p>
            </div>
          ) : (
            <div className="products-list">
              {filteredProducts.map((product) => {
                const alertConfig = getAlertBadge(product.daysToExpire);
                return (
                  <div key={product.id} className="product-item">
                    <Row className="align-items-center">
                      <Col md={1} className="text-center">
                        <Badge 
                          bg={alertConfig.variant} 
                          className="status-badge"
                          title={alertConfig.text}
                        >
                          {alertConfig.icon}
                        </Badge>
                      </Col>
                      <Col md={3}>
                        <div>
                          <h6 className="mb-1">{product.name}</h6>
                          <small className="text-muted">{product.category}</small>
                        </div>
                      </Col>
                      <Col md={2}>
                        <div className="text-center">
                          <div className="fw-bold text-danger">
                            {product.daysToExpire} día{product.daysToExpire !== 1 ? 's' : ''}
                          </div>
                          <small className="text-muted">para caducar</small>
                        </div>
                      </Col>
                      <Col md={2}>
                        <div className="text-center">
                          <div className="fw-bold">{product.stock}</div>
                          <small className="text-muted">unidades</small>
                        </div>
                      </Col>
                      <Col md={2}>
                        <small className="text-muted">
                          {new Date(product.expirationDate).toLocaleDateString('es-ES')}
                        </small>
                      </Col>
                      <Col md={2} className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(product)}
                        >
                          <FaEye className="me-1" />
                          Ver
                        </Button>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Product Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBoxOpen className="me-2" />
            Detalles del Producto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <Table striped bordered>
                  <tbody>
                    <tr>
                      <td><strong>Nombre:</strong></td>
                      <td>{selectedProduct.name}</td>
                    </tr>
                    <tr>
                      <td><strong>Categoría:</strong></td>
                      <td>{selectedProduct.category}</td>
                    </tr>
                    <tr>
                      <td><strong>Stock:</strong></td>
                      <td>{selectedProduct.stock} unidades</td>
                    </tr>
                    <tr>
                      <td><strong>Ubicación:</strong></td>
                      <td>{selectedProduct.location}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <Table striped bordered>
                  <tbody>
                    <tr>
                      <td><strong>Fecha de Caducidad:</strong></td>
                      <td className="text-danger">
                        {new Date(selectedProduct.expirationDate).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Días Restantes:</strong></td>
                      <td>
                        <Badge bg={getAlertBadge(selectedProduct.daysToExpire).variant}>
                          {selectedProduct.daysToExpire} día{selectedProduct.daysToExpire !== 1 ? 's' : ''}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Proveedor:</strong></td>
                      <td>{selectedProduct.supplier}</td>
                    </tr>
                    <tr>
                      <td><strong>Lote:</strong></td>
                      <td>{selectedProduct.batch}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-warning">
            <FaEdit className="me-1" />
            Editar
          </Button>
          <Button variant="outline-danger">
            <FaTrash className="me-1" />
            Eliminar
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpirationAlerts;