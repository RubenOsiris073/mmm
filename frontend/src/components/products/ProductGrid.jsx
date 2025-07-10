import React, { useState } from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Hooks personalizados
import useProductSync from './hooks/useProductSync';
import useProductFilters from './hooks/useProductFilters';

// Componentes modulares
import ProductCard from './components/ProductCard';
import ProductCardModern from './components/ProductCardModern';
import ProductManagementModal from './ProductManagementModal';

// Utilidades
import { getCategoryIcon, formatCategoryTitle } from './utils/categoryUtils';

const ProductGrid = ({ products = [], loading, onProductDeleted }) => {
  const [viewMode, setViewMode] = useState('modern'); // 'modern' o 'grid'
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Estados para el modal de gestión
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Hook para sincronización de productos
  const {
    products: syncedProducts,
    loading: syncLoading,
    updateProduct,
    removeProduct
  } = useProductSync(products);

  // Hook para filtros
  const {
    searchTerm,
    setSearchTerm,
    groupedProducts,
    clearFilters
  } = useProductFilters(syncedProducts);

  // Función para manejar la gestión de un producto
  const handleManageProduct = (product) => {
    setSelectedProduct(product);
    setShowManagementModal(true);
  };

  // Función para manejar la actualización de un producto
  const handleProductUpdated = (updatedProduct) => {
    updateProduct(updatedProduct);
  };

  // Función para manejar la eliminación de un producto
  const handleProductDeleted = (deletedProductId) => {
    removeProduct(deletedProductId);
    
    // Llamar al callback del componente padre si existe
    if (onProductDeleted) {
      onProductDeleted(deletedProductId);
    }
  };

  // Renderizar vista moderna con pestañas de categorías
  const renderModernView = () => {
    if (Object.keys(groupedProducts).length === 0) {
      return (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted"></i>
          <h4 className="mt-3">No se encontraron productos</h4>
          <p className="text-muted">
            Intenta con otros términos de búsqueda o revisa los filtros aplicados
          </p>
          <Button variant="outline-primary" onClick={clearFilters}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Limpiar filtros
          </Button>
        </div>
      );
    }

    // Determinar qué categorías mostrar según el filtro activo
    const categoriesToRender = activeCategory === 'all' 
      ? Object.keys(groupedProducts)
      : [activeCategory].filter(cat => groupedProducts[cat]);

    // Calcular el total de productos
    const totalProducts = Object.values(groupedProducts).flat().length;

    return (
      <div className="products-page-container">
        {/* Menú de categorías en pestañas */}
        <div className="product-category-tabs">
          <div 
            className={`product-category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos <span className="ms-1 badge rounded-pill bg-light text-dark">{totalProducts}</span>
          </div>
          
          {Object.keys(groupedProducts).map(category => (
            <div 
              key={category}
              className={`product-category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {formatCategoryTitle(category)} <span className="ms-1 badge rounded-pill bg-light text-dark">{groupedProducts[category].length}</span>
            </div>
          ))}
        </div>
        
        {/* Barra de búsqueda */}
        <div className="input-group mb-4">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            className="form-control"
            placeholder="Buscar productos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
              <i className="bi bi-x"></i>
            </Button>
          )}
        </div>
        
        {/* Grid de productos */}
        {categoriesToRender.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-exclamation-circle display-4 text-warning"></i>
            <h4 className="mt-3">No hay productos en esta categoría</h4>
            <Button variant="outline-primary" onClick={() => setActiveCategory('all')}>
              Ver todas las categorías
            </Button>
          </div>
        ) : (
          categoriesToRender.map(category => (
            <div key={category} className="mb-4">
              {activeCategory === 'all' && (
                <h5 className="mb-3 border-bottom pb-2">{formatCategoryTitle(category)}</h5>
              )}
              <Row xs={2} sm={2} md={3} lg={4} xl={5} className="g-3">
                {groupedProducts[category].map(product => (
                  <Col key={product.id}>
                    <ProductCardModern 
                      product={product} 
                      onManage={handleManageProduct}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          ))
        )}
      </div>
    );
  };

  // Renderizar vista de lista (versión original)
  // La vista de lista ha sido eliminada

  // Renderizar vista de cuadrícula (versión original)
  const renderGridView = () => {
    return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} className="mb-5">
        <div className="category-header">
          <h4 className="d-flex align-items-center">
            <span className="me-3 fs-4">
              {getCategoryIcon(category)}
            </span>
            {formatCategoryTitle(category)}
            <Badge className="category-badge-modern">
              {categoryProducts.length}
            </Badge>
          </h4>
        </div>
        
        <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
          {categoryProducts.map(product => (
            <Col key={product.id}>
              <ProductCard 
                product={product} 
                onManage={handleManageProduct}
              />
            </Col>
          ))}
        </Row>
      </div>
    ));
  };

  // Estado de carga
  const isLoading = loading || syncLoading;

  // Si no hay productos
  if (!isLoading && (!syncedProducts || syncedProducts.length === 0)) {
    return (
      <div className="text-center p-5">
        <div className="mb-4">
          <i className="bi bi-box-seam display-1 text-muted"></i>
        </div>
        <h4>No hay productos en el inventario</h4>
        <p className="text-muted mb-4">
          Registra productos manualmente o detecta con la cámara para comenzar
        </p>
        <Link to="/products/new">
          <Button variant="primary" size="lg">
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Primer Producto
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      {/* Botones de cambio de vista */}
      <div className="d-flex justify-content-end mb-3">
        <div className="btn-group view-mode-buttons">
          <Button 
            variant={viewMode === 'modern' ? 'primary' : 'outline-secondary'}
            onClick={() => setViewMode('modern')}
            size="sm"
          >
            <i className="bi bi-grid-3x3-gap me-1"></i> Moderno
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
            onClick={() => setViewMode('grid')}
            size="sm"
          >
            <i className="bi bi-grid me-1"></i> Clásico
          </Button>
        </div>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando productos...</span>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!isLoading && (
        <div>
          {viewMode === 'modern' ? (
            renderModernView()
          ) : (
            renderGridView()
          )}
        </div>
      )}
      
      {/* Modal de gestión de productos */}
      <ProductManagementModal
        show={showManagementModal}
        onHide={() => setShowManagementModal(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};

export default ProductGrid;