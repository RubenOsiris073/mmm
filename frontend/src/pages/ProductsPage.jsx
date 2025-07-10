import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
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

      {/* Header con título y botón */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0" style={{ fontWeight: '600' }}>Productos</h2>
        <Button 
          as={Link} 
          to="/products/new" 
          variant="primary"
          size="sm"
          className="px-3 py-2 d-inline-flex align-items-center btn-new-product"
          title="Crear nuevo producto"
        >
          <FaPlus size={12} className="me-1" />
          <span>Nuevo</span>
        </Button>
      </div>

      {/* Contenedor principal de productos */}
      <div className="bg-white rounded shadow-sm">
        <ProductGrid 
          products={allProducts} 
          loading={loading} 
          onProductDeleted={handleProductDeleted}
        />
      </div>
    </div>
  );
};

export default ProductsPage;