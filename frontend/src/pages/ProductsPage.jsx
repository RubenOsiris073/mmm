import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';
import ProductGrid from '../components/products/ProductGrid';
import { getDetections, getProductsWithSafeDates } from '../services/storageService';
import '../App.css';
import '../styles/products-modern.css';

const ProductsPage = () => {
  const [detections, setDetections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
        const [detectionsData, productsData] = await Promise.all([
          getDetections(),
          getProductsWithSafeDates()
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
    <div className="product-page-wrapper">
      {/* Mensajes de alerta */}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="mb-3">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
          {error}
        </Alert>
      )}

      {/* Contenedor principal de productos */}
      <Card className="shadow-sm" style={{ margin: 0 }}>
        {/* Header del card con título y botón */}
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2 className="m-0" style={{ fontWeight: '600' }}>Productos</h2>
          <Button 
            as={Link} 
            to="/products/new" 
            variant="primary"
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" />
            Nuevo Producto
          </Button>
        </Card.Header>
        
        <Card.Body style={{ padding: '1rem' }}>
          <ProductGrid 
            products={allProducts} 
            loading={loading} 
            onProductDeleted={handleProductDeleted}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductsPage;