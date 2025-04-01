import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import apiService from '../../services/apiService';
import WalletTable from './WalletTable';
import TransactionList from './TransactionList';
import WalletStats from './WalletStats';
import AdjustmentModal from './AdjustmentModal';
import Loading from './Loading';
import Error from './Error';

const WalletView = () => {
  const [wallet, setWallet] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Función para verificar la conexión
  const checkConnection = async () => {
    const isConnected = await apiService.testConnection();
    setConnectionStatus(isConnected);
    return isConnected;
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primero verificamos la conexión
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('No se pudo establecer conexión con el servidor');
      }

      // Si la conexión es exitosa, cargamos el wallet
      console.log('Cargando wallet...');
      const walletData = await apiService.getWallet();
      setWallet(walletData);

      // Solo si el wallet se cargó correctamente, cargamos las transacciones
      if (walletData) {
        console.log('Cargando transacciones...');
        const transactionsData = await apiService.getTransactions(10);
        setTransactions(transactionsData);
      }
    } catch (err) {
      console.error('Error en loadWalletData:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar los ajustes de inventario
  const handleAdjustment = async (productId, quantity) => {
    try {
      await apiService.updateWallet(productId, quantity);
      // Recargamos los datos después del ajuste
      loadWalletData();
      setShowModal(false);
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      setError('Error al ajustar inventario: ' + error.message);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Container>
        <Error 
          error={error}
          onRetry={loadWalletData}
          connectionStatus={connectionStatus}
        />
        {!connectionStatus && (
          <Alert variant="info" className="mt-3">
            <Alert.Heading>Información de Depuración</Alert.Heading>
            <p>No se pudo establecer conexión con el servidor. Verifica:</p>
            <ul>
              <li>Que el servidor backend esté corriendo en el puerto 5000</li>
              <li>Que no haya problemas de CORS</li>
              <li>La URL del API configurada: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</li>
            </ul>
          </Alert>
        )}
      </Container>
    );
  }
  
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Inventario</h2>
        </Col>
        <Col xs="auto">
          <Button onClick={() => loadWalletData()} variant="outline-primary">
            Actualizar
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <WalletTable 
            wallet={wallet}
            onAdjust={(product) => {
              setSelectedProduct(product);
              setShowModal(true);
            }}
          />
        </Col>
        <Col lg={4}>
          <WalletStats wallet={wallet} />
          <TransactionList transactions={transactions} />
        </Col>
      </Row>

      <AdjustmentModal 
        show={showModal}
        product={selectedProduct}
        onHide={() => setShowModal(false)}
        onAdjust={handleAdjustment}
      />
    </Container>
  );
};

export default WalletView;