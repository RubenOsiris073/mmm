import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBuilding, FaPhone, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import ProveedorForm from './ProveedorForm';
import ProveedorDetails from './ProveedorDetails';

const ProveedorView = () => {
  const { isDark } = useTheme();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    estado: 'all'
  });

  // Datos mock de proveedores para demostración
  const mockProveedores = useMemo(() => [
    {
      id: '1',
      nombre: 'Distribuidora López',
      nit: '900123456-1',
      telefono: '+57 300 123 4567',
      email: 'contacto@distribuidoralopez.com',
      direccion: 'Calle 123 #45-67, Bogotá',
      contactoPrincipal: 'María López',
      estado: 'activo',
      fechaRegistro: '2025-01-15',
      productosProveidos: ['Lacteos', 'Bebidas', 'Snacks'],
      calificacion: 4.5,
      ultimaCompra: '2025-05-30',
      totalCompras: 15,
      montoTotal: 2500000
    },
    {
      id: '2',
      nombre: 'Alimentos Frescos SA',
      nit: '900234567-2',
      telefono: '+57 301 234 5678',
      email: 'ventas@alimentosfrescos.com',
      direccion: 'Carrera 45 #12-34, Medellín',
      contactoPrincipal: 'Carlos Ramírez',
      estado: 'activo',
      fechaRegistro: '2025-02-10',
      productosProveidos: ['Frutas', 'Verduras', 'Carnes'],
      calificacion: 4.8,
      ultimaCompra: '2025-06-02',
      totalCompras: 23,
      montoTotal: 4200000
    },
    {
      id: '3',
      nombre: 'Productos del Valle',
      nit: '900345678-3',
      telefono: '+57 302 345 6789',
      email: 'info@productosdelvalle.com',
      direccion: 'Avenida 6 #78-90, Cali',
      contactoPrincipal: 'Ana Guerrero',
      estado: 'inactivo',
      fechaRegistro: '2024-12-05',
      productosProveidos: ['Granos', 'Cereales', 'Conservas'],
      calificacion: 4.2,
      ultimaCompra: '2025-04-15',
      totalCompras: 8,
      montoTotal: 1300000
    }
  ], []);

  const loadProveedores = useCallback(async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProveedores(mockProveedores);
    } catch (error) {
      toast.error('Error al cargar proveedores');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [mockProveedores]);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const handleCreate = () => {
    setSelectedProveedor(null);
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setEditMode(true);
    setShowForm(true);
  };

  const handleView = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetails(true);
  };

  const handleDelete = (proveedor) => {
    if (window.confirm(`¿Está seguro de eliminar el proveedor "${proveedor.nombre}"?`)) {
      setProveedores(prev => prev.filter(p => p.id !== proveedor.id));
      toast.success('Proveedor eliminado correctamente');
    }
  };

  const handleSave = (proveedorData) => {
    if (editMode) {
      setProveedores(prev => prev.map(p => 
        p.id === selectedProveedor.id ? { ...p, ...proveedorData } : p
      ));
      toast.success('Proveedor actualizado correctamente');
    } else {
      const newProveedor = {
        ...proveedorData,
        id: Date.now().toString(),
        fechaRegistro: new Date().toISOString().split('T')[0],
        totalCompras: 0,
        montoTotal: 0,
        calificacion: 5.0
      };
      setProveedores(prev => [...prev, newProveedor]);
      toast.success('Proveedor creado correctamente');
    }
    setShowForm(false);
  };

  const filteredProveedores = proveedores.filter(proveedor => {
    const matchesSearch = proveedor.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
                         proveedor.nit.includes(filters.search) ||
                         proveedor.contactoPrincipal.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesEstado = filters.estado === 'all' || proveedor.estado === filters.estado;
    
    return matchesSearch && matchesEstado;
  });

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
    const stars = '★'.repeat(Math.floor(calificacion)) + '☆'.repeat(5 - Math.floor(calificacion));
    return <span className="text-warning">{stars}</span>;
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className={isDark ? "bg-dark text-white" : "bg-primary text-white"}>
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <FaBuilding className="me-2" />
                    Gestión de Proveedores
                  </h4>
                  <small>Administra la información de tus proveedores</small>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant={isDark ? "outline-light" : "light"} 
                    onClick={handleCreate}
                    className={isDark ? "border-light" : ""}
                  >
                    <FaPlus className="me-1" />
                    Nuevo Proveedor
                  </Button>
                </Col>
              </Row>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, NIT o contacto..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={filters.estado}
            onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-primary">{proveedores.length}</h3>
              <p className="mb-0">Total Proveedores</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-success">{proveedores.filter(p => p.estado === 'activo').length}</h3>
              <p className="mb-0">Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-warning">{proveedores.reduce((sum, p) => sum + p.totalCompras, 0)}</h3>
              <p className="mb-0">Total Compras</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-info">{formatCurrency(proveedores.reduce((sum, p) => sum + p.montoTotal, 0))}</h3>
              <p className="mb-0">Valor Total</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de proveedores */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Cargando proveedores...</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Proveedor</th>
                      <th>Contacto</th>
                      <th>Productos</th>
                      <th>Estado</th>
                      <th>Calificación</th>
                      <th>Última Compra</th>
                      <th>Total Compras</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProveedores.map((proveedor) => (
                      <tr key={proveedor.id}>
                        <td>
                          <div>
                            <strong>{proveedor.nombre}</strong>
                            <br />
                            <small className="text-muted">NIT: {proveedor.nit}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div><FaPhone className="me-1" />{proveedor.telefono}</div>
                            <div><FaEnvelope className="me-1" />{proveedor.email}</div>
                            <small className="text-muted">{proveedor.contactoPrincipal}</small>
                          </div>
                        </td>
                        <td>
                          {proveedor.productosProveidos.slice(0, 2).map((producto, index) => (
                            <Badge key={index} bg="outline-primary" className="me-1 mb-1">
                              {producto}
                            </Badge>
                          ))}
                          {proveedor.productosProveidos.length > 2 && (
                            <Badge bg="outline-secondary">+{proveedor.productosProveidos.length - 2}</Badge>
                          )}
                        </td>
                        <td>{getEstadoBadge(proveedor.estado)}</td>
                        <td>
                          <div>
                            {getCalificacionStars(proveedor.calificacion)}
                            <br />
                            <small>{proveedor.calificacion}/5</small>
                          </div>
                        </td>
                        <td>{proveedor.ultimaCompra}</td>
                        <td>
                          <div>
                            <strong>{proveedor.totalCompras}</strong>
                            <br />
                            <small>{formatCurrency(proveedor.montoTotal)}</small>
                          </div>
                        </td>
                        <td>
                          <div className="btn-group-vertical btn-group-sm">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleView(proveedor)}
                              title="Ver detalles"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(proveedor)}
                              title="Editar"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(proveedor)}
                              title="Eliminar"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              {!loading && filteredProveedores.length === 0 && (
                <div className="text-center p-5">
                  <FaBuilding className="display-1 text-muted mb-3" />
                  <h5>No se encontraron proveedores</h5>
                  <p className="text-muted">
                    {filters.search || filters.estado !== 'all' 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Comienza agregando tu primer proveedor'
                    }
                  </p>
                  {(!filters.search && filters.estado === 'all') && (
                    <Button variant="primary" onClick={handleCreate}>
                      <FaPlus className="me-1" />
                      Agregar Proveedor
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de formulario */}
      <ProveedorForm
        show={showForm}
        onHide={() => setShowForm(false)}
        proveedor={selectedProveedor}
        editMode={editMode}
        onSave={handleSave}
      />

      {/* Modal de detalles */}
      <ProveedorDetails
        show={showDetails}
        onHide={() => setShowDetails(false)}
        proveedor={selectedProveedor}
        onEdit={handleEdit}
      />
    </Container>
  );
};

export default ProveedorView;