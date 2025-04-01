import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { BiBox, BiBarcode, BiListCheck } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import UpdateModal from './UpdateModal';
import { formatTimestamp, getCurrentTimestamp } from '../../utils/helpers';

const InventoryView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialLocation = queryParams.get('location') || 'all';

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [currentTime, setCurrentTime] = useState(getCurrentTimestamp());

  // Efecto existente para cargar el inventario
  useEffect(() => {
    loadInventory();
  }, []);

  // Nuevo efecto para actualizar el tiempo actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.message);
      toast.error('Error al cargar el inventario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (productId, adjustment, location, reason) => {
    try {
      setLoading(true);
      await apiService.updateInventory(productId, adjustment, location, reason);
      await loadInventory();
      setShowUpdateModal(false);
      toast.success('Inventario actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar:', err);
      toast.error('Error al actualizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el manejador de tabs para modificar la URL
  const handleLocationChange = (location) => {
    setActiveLocation(location);
    if (location === 'all') {
      navigate('/inventory');
    } else {
      navigate(`/inventory?location=${location}`);
    }
  };

  const getLocationBadge = (location) => {
    switch (location) {
      case 'warehouse':
        return <Badge bg="primary">Almacén</Badge>;
      case 'bodega':
        return <Badge bg="success">Bodega</Badge>;
      default:
        return <Badge bg="secondary">Sin ubicación</Badge>;
    }
  };

  const filteredInventory = activeLocation === 'all'
    ? inventory
    : inventory.filter(item => item.location === activeLocation);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p>Cargando inventario...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar el inventario</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Inventario</h2>
          <p className="text-muted">
            Administre el inventario en todas las ubicaciones
          </p>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Inventario
            <small className="text-muted ms-2">
              {activeLocation === 'warehouse' ? '- Almacén Manual' :
                activeLocation === 'bodega' ? '- Bodega Automática' :
                  '- Todo'}
            </small>
          </h5>
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => loadInventory()}
            >
              Actualizar
            </Button>
            <small className="text-muted">
              Última actualización: {currentTime}
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeLocation}
            onSelect={(k) => handleLocationChange(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title="Todo el Inventario">
              <InventoryTable
                inventory={filteredInventory}
                onUpdate={handleUpdate}
                getLocationBadge={getLocationBadge}
              />
            </Tab>
            <Tab eventKey="warehouse" title="Almacén Manual">
              <InventoryTable
                inventory={filteredInventory}
                onUpdate={handleUpdate}
                getLocationBadge={getLocationBadge}
              />
            </Tab>
            <Tab eventKey="bodega" title="Bodega Automática">
              <InventoryTable
                inventory={filteredInventory}
                onUpdate={handleUpdate}
                getLocationBadge={getLocationBadge}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <UpdateModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        product={selectedProduct}
        onSubmit={handleUpdateSubmit}
        currentUser={currentUser}
      />
    </Container>
  );
};

// Componente de tabla separado para mejor organización
const InventoryTable = ({ inventory, onUpdate, getLocationBadge }) => (
  <Table responsive hover>
    <thead>
      <tr>
        <th>Código</th>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Ubicación</th>
        <th>Última Actualización</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {inventory.map(item => (
        <tr key={item.id}>
          <td>{item.productCode || 'N/A'}</td>
          <td>{item.productName}</td>
          <td>{item.quantity || 0}</td>
          <td>{getLocationBadge(item.location)}</td>
          <td>{formatTimestamp(item.updatedAt)}</td>
          <td>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onUpdate(item)}
            >
              Actualizar
            </Button>
          </td>
        </tr>
      ))}
      {inventory.length === 0 && (
        <tr>
          <td colSpan="6" className="text-center">
            No hay productos en el inventario
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default InventoryView;