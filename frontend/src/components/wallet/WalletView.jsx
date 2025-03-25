import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Button, Alert, Row, Col, Form, Modal } from 'react-bootstrap';
import apiService from '../../services/apiService';

const WalletView = () => {
  const [wallet, setWallet] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState(1);
  const [products, setProducts] = useState([]);

  // Función para cargar datos del wallet y transacciones
  const loadWalletData = async () => {
    try {
      setRefreshing(true);
      const [walletData, transactionsData, productsData, detectionStatus] = await Promise.all([
        apiService.getWallet(),
        apiService.getTransactions(10),
        apiService.getProducts(),
        apiService.getDetectionStatus()
      ]);
      
      setWallet(walletData);
      setTransactions(transactionsData);
      setProducts(productsData);
      setDetectionActive(detectionStatus.active);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar datos. Comprueba que el servicio backend esté en funcionamiento.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadWalletData();
    
    // Actualizar datos cada 15 segundos
    const interval = setInterval(() => {
      loadWalletData();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para activar/desactivar detección continua
  const toggleDetection = async () => {
    try {
      await apiService.setDetectionMode(!detectionActive);
      setDetectionActive(!detectionActive);
    } catch (err) {
      console.error("Error al cambiar modo de detección:", err);
      setError("Error al cambiar modo de detección");
    }
  };

  // Función para detección manual única
  const triggerSingleDetection = async () => {
    try {
      setRefreshing(true);
      const result = await apiService.triggerDetection();
      if (result.success) {
        // Actualizar datos después de la detección
        loadWalletData();
      }
    } catch (err) {
      console.error("Error en detección manual:", err);
      setError("Error al realizar detección manual");
    } finally {
      setRefreshing(false);
    }
  };

  // Función para actualizar wallet manualmente
  const handleUpdateWallet = async () => {
    if (!selectedProduct || adjustment === 0) return;
    
    try {
      await apiService.updateWallet(selectedProduct.id, parseInt(adjustment));
      setShowModal(false);
      loadWalletData();
    } catch (err) {
      console.error("Error al actualizar inventario:", err);
      setError("Error al actualizar inventario");
    }
  };

  // Obtener color según cantidad
  const getStockColor = (cantidad) => {
    if (cantidad <= 0) return 'danger';
    if (cantidad < 5) return 'warning';
    if (cantidad < 10) return 'info';
    return 'success';
  };

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading && !refreshing) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={6}>
          <h2>Inventario Actual (Wallet)</h2>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center">
          <Button 
            variant={detectionActive ? "danger" : "success"}
            className="me-2"
            onClick={toggleDetection}
          >
            {detectionActive ? "⏹️ Detener Detección Continua" : "▶️ Iniciar Detección Continua"}
          </Button>
          
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={triggerSingleDetection}
            disabled={refreshing}
          >
            {refreshing ? <Spinner animation="border" size="sm" /> : '📸 Detección Manual'}
          </Button>
          
          <Button 
            variant="outline-secondary" 
            onClick={loadWalletData}
            disabled={refreshing}
          >
            {refreshing ? <Spinner animation="border" size="sm" /> : '↻ Actualizar'}
          </Button>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Button 
            variant="primary" 
            onClick={() => {
              setSelectedProduct(null);
              setAdjustment(1);
              setShowModal(true);
            }}
          >
            + Ajustar Inventario Manualmente
          </Button>
        </Col>
      </Row>
      
      {wallet.length === 0 ? (
        <Alert variant="info">
          No hay productos en el inventario. Registra productos para comenzar a hacer seguimiento.
        </Alert>
      ) : (
        <Card className="mb-5">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-center">Cantidad</th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {wallet.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>
                      <Badge bg={item.categoria === 'sin-categoria' ? 'secondary' : 'primary'}>
                        {item.categoria === 'sin-categoria' ? 'Sin Categoría' : 
                          item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge 
                        bg={getStockColor(item.cantidad)}
                        style={{ fontSize: '1rem', width: '3rem' }}
                      >
                        {item.cantidad}
                      </Badge>
                    </td>
                    <td>{formatDate(item.updatedAt)}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          setSelectedProduct({id: item.id, nombre: item.nombre});
                          setAdjustment(1);
                          setShowModal(true);
                        }}
                      >
                        Ajustar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <h3 className="mb-3">Transacciones Recientes</h3>
      {transactions.length === 0 ? (
        <Alert variant="info">
          No hay transacciones recientes.
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.nombre}</td>
                    <td>
                      <Badge bg={transaction.tipo === 'entrada' ? 'success' : 'danger'}>
                        {transaction.tipo === 'entrada' ? '▲ Entrada' : '▼ Salida'}
                      </Badge>
                    </td>
                    <td>{Math.abs(transaction.cantidad)}</td>
                    <td>{formatDate(transaction.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal para ajuste de inventario */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajustar Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const product = products.find(p => p.id === selectedId);
                  setSelectedProduct(product ? {id: product.id, nombre: product.nombre || product.label} : null);
                }}
              >
                <option value="">Selecciona un producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.nombre || product.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ajuste</Form.Label>
              <div className="d-flex align-items-center">
                <Button 
                  variant="outline-danger"
                  onClick={() => setAdjustment(-1)}
                  className="me-2"
                >
                  - Salida
                </Button>
                <Form.Control
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
                <Button 
                  variant="outline-success"
                  onClick={() => setAdjustment(1)}
                  className="ms-2"
                >
                  + Entrada
                </Button>
              </div>
              <Form.Text className="text-muted">
                Valores positivos: entrada de inventario. Valores negativos: salida de inventario.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateWallet}
            disabled={!selectedProduct || adjustment === 0}
          >
            Guardar Ajuste
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WalletView;