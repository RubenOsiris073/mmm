import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button, Badge } from 'react-bootstrap';
import ProductGridTest from '../components/products-test/ProductGridTest';
import { testApiService } from '../services/testApiService';

const ProductsTestPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    categories: 0,
    lowStock: 0
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await testApiService.getAllProducts();
      
      if (response.success) {
        setProducts(response.data);
        calculateStats(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar productos');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productList) => {
    const categories = [...new Set(productList.map(p => p.categoria || 'sin-categoria'))];
    const lowStock = productList.filter(p => (p.cantidad || p.stock || 0) <= 5);
    
    setStats({
      total: productList.length,
      categories: categories.length,
      lowStock: lowStock.length
    });
  };

  const handleProductDeleted = (deletedProductId) => {
    setProducts(prev => prev.filter(p => p.id !== deletedProductId));
    calculateStats(products.filter(p => p.id !== deletedProductId));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando productos de testing...</span>
          </div>
          <p className="mt-3">Cargando productos de testing...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header de Testing */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 className="h2 mb-1">
              🧪 Productos - Testing
            </h1>
            <p className="text-muted mb-0">
              Plantilla de pruebas para desarrollo y testing
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={loadProducts}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Recargar
            </Button>
          </div>
        </div>

        {/* Estadísticas de Testing */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <div className="card h-100 border-0 bg-primary bg-opacity-10">
              <div className="card-body text-center">
                <div className="display-6 text-primary mb-2">
                  <i className="bi bi-box-seam"></i>
                </div>
                <h3 className="h4 mb-1 text-primary">{stats.total}</h3>
                <p className="text-muted mb-0 small">Productos Total</p>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="card h-100 border-0 bg-success bg-opacity-10">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-2">
                  <i className="bi bi-tags"></i>
                </div>
                <h3 className="h4 mb-1 text-success">{stats.categories}</h3>
                <p className="text-muted mb-0 small">Categorías</p>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="card h-100 border-0 bg-warning bg-opacity-10">
              <div className="card-body text-center">
                <div className="display-6 text-warning mb-2">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <h3 className="h4 mb-1 text-warning">{stats.lowStock}</h3>
                <p className="text-muted mb-0 small">Stock Bajo</p>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="card h-100 border-0 bg-info bg-opacity-10">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-2">
                  <i className="bi bi-flask"></i>
                </div>
                <Badge className="h4 mb-1 bg-info">TEST</Badge>
                <p className="text-muted mb-0 small">Modo Testing</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Banner de Testing */}
        <Alert variant="info" className="border-0 bg-info bg-opacity-10">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle-fill text-info me-3 fs-4"></i>
            <div>
              <h6 className="alert-heading mb-1">Entorno de Testing</h6>
              <p className="mb-0">
                Esta es una copia de la vista de productos para pruebas y desarrollo de plantillas. 
                Los cambios aquí no afectan la vista principal.
              </p>
            </div>
          </div>
        </Alert>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Products Grid */}
      <ProductGridTest 
        products={products}
        loading={loading}
        onProductDeleted={handleProductDeleted}
      />
    </Container>
  );
};

export default ProductsTestPage;