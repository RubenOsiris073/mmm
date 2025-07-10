import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaBox, FaArchive, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import ProductGrid from '../components/products/ProductGrid';
import { getDetections, getProductsWithSafeDates } from '../services/storageService';
import '../styles/pages/products.css';

const ProductsPage = () => {
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
    // Actualizar la lista combinada de todos los productos
    setAllProducts(prev => prev.filter(product => product.id !== deletedProductId));
    
    // Mostrar mensaje de éxito
    setSuccessMessage("Producto eliminado correctamente");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="content-wrapper">
      <div className="content-body">
        {/* Header con diseño de Cards */}
        <div className="content-header">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="content-title">
                <FaBox className="me-3" />
                Gestión de Productos
              </h1>
              <p className="content-subtitle text-muted">
                Administre el inventario y registre nuevos productos en el sistema
              </p>
            </div>
            <Button 
              as={Link} 
              to="/products/new" 
              variant="link"
              className="products-action-button"
              title="Crear nuevo producto"
            >
              <FaPlus className="me-2" />
              <span>Nuevo Producto</span>
            </Button>
          </div>
          
          {/* Estadísticas de productos */}
          <div className="stats-grid">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon bg-primary">
                  <FaBox />
                </div>
                <div className="stat-details">
                  <h3 className="stat-title">Total de Productos</h3>
                  <p className="stat-value">{allProducts.length.toLocaleString('es-MX')}</p>
                  <small className="text-muted">Productos registrados</small>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon bg-success">
                  <FaCheckCircle />
                </div>
                <div className="stat-details">
                  <h3 className="stat-title">Productos Activos</h3>
                  <p className="stat-value">{allProducts.filter(p => p.isActive !== false).length}</p>
                  <small className="text-muted">Disponibles en inventario</small>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon bg-warning">
                  <FaExclamationTriangle />
                </div>
                <div className="stat-details">
                  <h3 className="stat-title">Próximos a Vencer</h3>
                  <p className="stat-value">
                    {allProducts.filter(p => {
                      if (!p.expiry_date) return false;
                      const expiryDate = new Date(p.expiry_date);
                      const today = new Date();
                      const diffTime = expiryDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7 && diffDays > 0;
                    }).length}
                  </p>
                  <small className="text-muted">En los próximos 7 días</small>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon bg-secondary">
                  <FaArchive />
                </div>
                <div className="stat-details">
                  <h3 className="stat-title">Solo Detectados</h3>
                  <p className="stat-value">{allProducts.filter(p => p.source === 'detection').length}</p>
                  <small className="text-muted">Sin registro completo</small>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

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
        <div className="content-container">
          <div className="content-inner">
            <ProductGrid 
              products={allProducts} 
              loading={loading} 
              onProductDeleted={handleProductDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;