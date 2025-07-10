import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaBoxOpen, FaTag, FaExclamationTriangle } from 'react-icons/fa';
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
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
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
        
        const safeDetections = Array.isArray(detectionsData) ? detectionsData : [];
        const safeProducts = Array.isArray(productsData) ? productsData : [];
        
        const productMap = new Map();
        
        safeProducts.forEach(product => {
          productMap.set(product.id, { ...product, isRegistered: true });
        });
        
        safeDetections.forEach(detection => {
          if (!productMap.has(detection.id)) {
            productMap.set(detection.id, { ...detection, isRegistered: false });
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

  const handleProductDeleted = (deletedProductId) => {
    setAllProducts(prev => prev.filter(product => product.id !== deletedProductId));
    setSuccessMessage("Producto eliminado correctamente");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const registeredProductsCount = allProducts.filter(p => p.isRegistered).length;
  const detectedProductsCount = allProducts.filter(p => !p.isRegistered).length;

  return (
    <div className="products-main-container">
      <div className="products-content-wrapper">
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

        <div className="products-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="products-title">
                <FaBoxOpen className="me-3" />
                Gestión de Inventario
              </h1>
              <p className="products-subtitle">
                Visualice, analice y administre el inventario de productos
              </p>
            </div>
            <Button 
              as={Link} 
              to="/products/new" 
              variant="light"
              className="products-action-button"
              title="Crear nuevo producto"
            >
              <FaPlus className="me-2" />
              <span>Nuevo Producto</span>
            </Button>
          </div>
          
          <div className="products-stats-grid">
            <div className="products-stat-card">
              <div className="products-stat-icon">
                <FaTag />
              </div>
              <div className="products-stat-value">
                {registeredProductsCount.toLocaleString('es-MX')}
              </div>
              <div className="products-stat-label">Productos Registrados</div>
              <small className="text-muted">Con datos completos</small>
            </div>
            
            <div className="products-stat-card">
              <div className="products-stat-icon" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: 'var(--bs-warning)' }}>
                <FaExclamationTriangle />
              </div>
              <div className="products-stat-value">
                {detectedProductsCount.toLocaleString('es-MX')}
              </div>
              <div className="products-stat-label">Productos Detectados</div>
              <small className="text-muted">Pendientes de registro</small>
            </div>
            
            <div className="products-stat-card">
              <div className="products-stat-icon" style={{ backgroundColor: 'rgba(13, 202, 240, 0.15)', color: 'var(--bs-info)' }}>
                <FaBoxOpen />
              </div>
              <div className="products-stat-value">
                {allProducts.length.toLocaleString('es-MX')}
              </div>
              <div className="products-stat-label">Total en Inventario</div>
              <small className="text-muted">Suma de registrados y detectados</small>
            </div>
          </div>
        </div>
        
        <div className="products-content-container">
          <div className="products-content-inner">
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