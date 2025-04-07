import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import ProductGrid from '../components/products/ProductGrid';
import { getDetections, getProductsWithSafeDates } from '../services/storageService';

const ProductsPage = () => {
  const [detections, setDetections] = useState([]);
  const [registeredProducts, setRegisteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('grid');
  const location = useLocation();

  useEffect(() => {
    // Capturar mensaje de éxito si viene de la página de formulario
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Limpiar el estado después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Usar getProductsWithSafeDates en lugar de getRegisteredProducts
        // para un mejor manejo de las fechas
        const [detectionsData, productsData] = await Promise.all([
          getDetections(),
          getProductsWithSafeDates() // Usa la función mejorada que maneja fechas de manera segura
        ]);
        
        // Validar que los datos sean arrays
        const safeDetections = Array.isArray(detectionsData) ? detectionsData : [];
        const safeProducts = Array.isArray(productsData) ? productsData : [];
        
        setDetections(safeDetections);
        setRegisteredProducts(safeProducts);
        
        // Combinar todos los productos para la vista de cuadrícula
        // Evitar duplicados usando Map con ID como clave
        const productMap = new Map();
        
        // Primero agregar productos registrados (completos)
        safeProducts.forEach(product => {
          productMap.set(product.id, product);
        });
        
        // Luego agregar detecciones que no tengan contraparte registrada
        safeDetections.forEach(detection => {
          if (!productMap.has(detection.id)) {
            productMap.set(detection.id, detection);
          }
        });
        
        setAllProducts(Array.from(productMap.values()));
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("No se pudieron cargar los productos. Por favor, intente nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1>Inventario de Productos</h1>
          <div>
            <Link to="/" className="me-2">
              <Button variant="outline-secondary">
                Volver a la Cámara
              </Button>
            </Link>
            <Link to="/product-form">
              <Button variant="primary">
                + Agregar Producto
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      {successMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}
      
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="grid" title="Vista por Categorías">
                  <ProductGrid 
                    products={allProducts} 
                    loading={loading} 
                  />
                </Tab>
                <Tab eventKey="list" title="Lista de Detecciones">
                  <ProductList 
                    products={detections} 
                    loading={loading} 
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductsPage;