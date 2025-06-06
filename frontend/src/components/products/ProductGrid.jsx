import React, { useState } from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Hooks personalizados
import useProductSync from './hooks/useProductSync';
import useProductFilters from './hooks/useProductFilters';

// Componentes modulares
import ProductCard from './components/ProductCard';
import ProductFilters from './components/ProductFilters';
import ProductManagementModal from './ProductManagementModal';

// Utilidades
import { getCategoryColor, getCategoryIcon, formatCategoryTitle } from './utils/categoryUtils';

const ProductGrid = ({ products = [], loading, onProductDeleted }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
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
    selectedCategory,
    setSelectedCategory,
    allCategories,
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

  // Renderizar vista de lista
  const renderListView = () => {
    return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} className="mb-5">
        <h4 className="mb-3 d-flex align-items-center">
          <span className={`badge bg-${getCategoryColor(category)} me-2 fs-5`}>
            {getCategoryIcon(category)}
          </span>
          {formatCategoryTitle(category)}
          <Badge bg="secondary" className="ms-2">
            {categoryProducts.length}
          </Badge>
        </h4>
        
        <div className="list-group">
          {categoryProducts.map(product => {
            const currentStock = product.cantidad || product.stock || 0;
            
            return (
              <div 
                key={product.id} 
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-3 fs-4">
                      {getCategoryIcon(product.categoria || 'sin-categoria')}
                    </span>
                    <div>
                      <h5 className="mb-1 text-capitalize">
                        {product.nombre || product.label || 'Producto sin nombre'}
                      </h5>
                      <p className="mb-1 small text-muted">
                        {product.descripcion || product.notas || 
                          `Producto detectado automáticamente`}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Badge 
                      bg={currentStock > 10 ? "success" : currentStock > 5 ? "warning" : currentStock > 0 ? "danger" : "secondary"}
                      className="me-2"
                    >
                      Stock: {currentStock} {product.unidadMedida || 'unidades'}
                    </Badge>
                    {product.precio && (
                      <Badge bg="info" className="me-2">
                        ${parseFloat(product.precio).toFixed(2)}
                      </Badge>
                    )}
                    {product.codigo && (
                      <Badge bg="outline-secondary">
                        {product.codigo}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="d-flex gap-2 ms-3">
                  <Link to={`/products/edit/${product.id}`} state={{ product }}>
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-pencil me-1"></i>
                      {product.nombre ? 'Editar' : 'Completar'}
                    </Button>
                  </Link>
                  <Button 
                    variant="outline-warning" 
                    size="sm"
                    onClick={() => handleManageProduct(product)}
                  >
                    <i className="bi bi-gear me-1"></i>
                    Gestionar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  // Renderizar vista de cuadrícula
  const renderGridView = () => {
    return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} className="mb-5">
        <h4 className="mb-3 d-flex align-items-center">
          <span className={`badge bg-${getCategoryColor(category)} me-2 fs-5`}>
            {getCategoryIcon(category)}
          </span>
          {formatCategoryTitle(category)}
          <Badge bg="secondary" className="ms-2">
            {categoryProducts.length}
          </Badge>
        </h4>
        
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
        <Link to="/product-form">
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
      {/* Barra de filtros */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        allCategories={allCategories}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onClearFilters={clearFilters}
      />

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
          {Object.keys(groupedProducts).length === 0 ? (
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
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
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