import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';
import ProductGrid from '../components/products/ProductGrid';
import { getDetections, getProductsWithSafeDates } from '../services/storageService';
import '../App.css';

const ProductsPage = () => {
  const [detections, setDetections] = useState([]);
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

  // Función para manejar la eliminación de productos
  const handleProductDeleted = (deletedProductId) => {
    // Actualizar la lista de detecciones
    setDetections(prev => prev.filter(detection => detection.id !== deletedProductId));
    
    // Actualizar la lista combinada de todos los productos
    setAllProducts(prev => prev.filter(product => product.id !== deletedProductId));
    
    // Mostrar mensaje de éxito
    setSuccessMessage("Producto eliminado correctamente");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <>
      {/* Banner de productos - Versión simplificada */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <h2>Inventario de Productos</h2>
              <p className="text-muted mb-0">
                Gestione su catálogo de productos, visualice las detecciones automáticas y mantenga su inventario actualizado.
                Este módulo le permite ver, editar y añadir productos para optimizar su gestión de inventario.
              </p>
            </Col>
            <Col md={4} className="text-end">
              <Button 
                as={Link} 
                to="/products/new" 
                variant="primary"
                size="lg"
              >
                <FaPlus className="me-1" />
                Nuevo Producto
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Instrucciones para gestión de productos */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Instrucciones para el Inventario de Productos
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <ol>
                <li className="mb-2">Use "Vista por Categorías" para visualizar todos los productos agrupados por categoría.</li>
                <li className="mb-2">Cambie a "Lista de Detecciones" para ver los productos detectados automáticamente.</li>
                <li className="mb-2">Haga clic en un producto para ver más detalles o editarlo.</li>
                <li className="mb-2">Use el botón "Añadir Producto" para registrar manualmente un nuevo producto.</li>
                <li className="mb-2">Los productos detectados automáticamente se muestran con un indicador especial.</li>
                <li>Mantenga su catálogo actualizado para facilitar las operaciones de venta e inventario.</li>
              </ol>
            </Col>
            <Col md={4}>
              <Alert variant="info" className="h-100 mb-0 d-flex align-items-center">
                <div>
                  <i className="bi bi-lightbulb-fill me-2 fs-4"></i>
                  <strong>Consejos:</strong>
                  <p className="mb-0 mt-2">
                    Para una mejor organización, asigne categorías claras a todos sus productos. 
                    Las imágenes de calidad mejoran la identificación visual. Revise regularmente las detecciones automáticas para validar su precisión.
                  </p>
                </div>
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
                    onProductDeleted={handleProductDeleted}
                  />
                </Tab>
                <Tab eventKey="list" title="Lista de Detecciones">
                  <ProductList 
                    products={detections} 
                    loading={loading} 
                    onProductDeleted={handleProductDeleted}
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