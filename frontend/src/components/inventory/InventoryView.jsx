import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Badge, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentTimestamp } from '../../utils/helpers';
import apiService from '../../services/apiService';
import InventoryTable from './InventoryTable';
import InventoryHeader from './InventoryHeader';
import UpdateModal from './UpdateModal';

const InventoryView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialLocation = queryParams.get('location') || 'all';

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [currentTime, setCurrentTime] = useState(getCurrentTimestamp());

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar el inventario
  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInventory();
      console.log('Datos recibidos:', data);
      setInventory(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar inventario al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Manejar actualización de inventario
  const handleUpdateSubmit = async (productId, adjustment, location, reason) => {
    try {
      setLoading(true);
      await apiService.updateInventory(productId, adjustment, location, reason);
      await loadInventory();
      setShowUpdateModal(false);
      return true;
    } catch (err) {
      console.error('Error al actualizar:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el badge de ubicación
  const getLocationBadge = (location) => {
    switch (location) {
      case 'manual':
        return <Badge bg="primary">Manual</Badge>;
      case 'automatic':
        return <Badge bg="success">Automático</Badge>;
      default:
        return <Badge bg="secondary">Desconocido</Badge>;
    }
  };

  // Función para cambiar de pestaña y actualizar URL
  const handleLocationChange = (location) => {
    setActiveLocation(location);
    if (location === 'all') {
      navigate('/inventory');
    } else {
      navigate(`/inventory?location=${location}`);
    }
  };

  // Filtrar inventario por ubicación
  const filteredInventory = activeLocation === 'all'
    ? inventory
    : inventory.filter(item => item.location === activeLocation);

  const locationTabs = [
    { key: 'all', title: 'Todo el Inventario' },
    { key: 'manual', title: 'Registro Manual' },
    { key: 'automatic', title: 'Registro Automático' }
  ];

  if (loading && inventory.length === 0) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p>Cargando inventario...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <InventoryHeader
            loading={loading}
            onRefresh={loadInventory}
            currentTime={currentTime}
          />
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeLocation}
            onSelect={(k) => handleLocationChange(k)}
            className="mb-3"
          >
            {locationTabs.map(({ key, title }) => (
              <Tab
                key={key}
                eventKey={key}
                title={title}
              >
                <InventoryTable
                  inventory={filteredInventory}
                  loading={loading}
                  onUpdate={(product) => {
                    setSelectedProduct(product);
                    setShowUpdateModal(true);
                  }}
                  getLocationBadge={getLocationBadge}
                />
              </Tab>
            ))}
          </Tabs>
        </Card.Body>
      </Card>

      <UpdateModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        product={selectedProduct}
        onSubmit={handleUpdateSubmit}
      />
    </Container>
  );
};

export default InventoryView;