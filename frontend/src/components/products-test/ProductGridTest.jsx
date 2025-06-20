import React, { useState } from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Hooks personalizados
import useProductSyncTest from './hooks/useProductSyncTest';
import useProductFiltersTest from './hooks/useProductFiltersTest';

// Componentes modulares de testing
import ProductCardTest from './components/ProductCardTest';
import ProductFiltersTest from './components/ProductFiltersTest';
import ProductManagementModalTest from './ProductManagementModalTest';

// Utilidades
import { getCategoryColor, getCategoryIcon, formatCategoryTitle } from './utils/categoryUtils';

const ProductGridTest = ({ products = [], loading, onProductDeleted }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
  // Estados para el modal de gestión
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Hook para sincronización de productos de testing
  const {
    products: syncedProducts,
    loading: syncLoading,
    updateProduct,
    removeProduct
  } = useProductSyncTest(products);

  // Hook para filtros de testing
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allCategories,
    groupedProducts,
    clearFilters
  } = useProductFiltersTest(syncedProducts);

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

  // Renderizar vista de lista con banner de testing
  const renderListView = () => {
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
            <Badge bg="info" className="ms-2 small">TESTING</Badge>
          </h4>
        </div>
        
        <div className="list-group">
          {categoryProducts.map(product => {
            const currentStock = product.cantidad || product.stock || 0;
            const stockMinimo = product.stockMinimo || 5;
            
            const getStockStatus = (stock, minimo) => {
              if (stock === 0) return 'stock-vacio';
              if (stock <= minimo) return 'stock-bajo';
              if (stock <= minimo * 2) return 'stock-medio';
              return 'stock-alto';
            };
            
            return (
              <div 
                key={product.id} 
                className="list-group-item-modern d-flex justify-content-between align-items-center"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-3 fs-4">
                      {getCategoryIcon(product.categoria || 'sin-categoria')}
                    </span>
                    <div>
                      <h5 className="mb-1 text-capitalize product-title">
                        {product.nombre || product.label || 'Producto sin nombre'}
                        <Badge bg="secondary" className="ms-2 small">TEST</Badge>
                      </h5>
                      <p className="mb-1 small text-muted">
                        {product.descripcion || product.notas || 
                          `Producto detectado automáticamente - Modo Testing`}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Badge className={`product-stock-badge ${getStockStatus(currentStock, stockMinimo)}`}>
                      Stock: {currentStock} {product.unidadMedida || 'unidades'}
                    </Badge>
                    {product.precio && (
                      <Badge className="product-price-badge ms-2">
                        ${parseFloat(product.precio).toFixed(2)}
                      </Badge>
                    )}
                    {product.codigo && (
                      <Badge className="product-code-badge ms-2">
                        {product.codigo}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="d-flex gap-2 ms-3">
                  <Link to={`/products-test/edit/${product.id}`} state={{ product }}>
                    <Button className="btn-edit-modern product-action-btn">
                      <i className="bi bi-pencil me-1"></i>
                      {product.nombre ? 'Editar' : 'Completar'}
                    </Button>
                  </Link>
                  <Button 
                    className="btn-manage-modern product-action-btn"
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

  // Renderizar vista de cuadrícula con indicadores de testing
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
            <Badge bg="info" className="ms-2 small">TESTING</Badge>
          </h4>
        </div>
        
        <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
          {categoryProducts.map(product => (
            <Col key={product.id}>
              <ProductCardTest 
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

  // Si no hay productos - con mensaje de testing
  if (!isLoading && (!syncedProducts || syncedProducts.length === 0)) {
    return (
      <div className="text-center p-5">
        <div className="mb-4">
          <i className="bi bi-flask display-1 text-info"></i>
        </div>
        <h4>No hay productos en el entorno de testing</h4>
        <p className="text-muted mb-4">
          Este es el entorno de testing. Aquí puedes experimentar con plantillas y nuevos diseños.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Link to="/products-test/new">
            <Button variant="info" size="lg">
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Producto de Prueba
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline-primary" size="lg">
              <i className="bi bi-arrow-left me-2"></i>
              Ir a Productos Reales
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      {/* Barra de filtros de testing */}
      <ProductFiltersTest
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
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Cargando productos de testing...</span>
          </div>
          <p className="mt-2 text-muted">Cargando entorno de testing...</p>
        </div>
      )}

      {/* Contenido principal */}
      {!isLoading && (
        <div>
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h4 className="mt-3">No se encontraron productos de testing</h4>
              <p className="text-muted">
                Intenta con otros términos de búsqueda o revisa los filtros aplicados
              </p>
              <Button variant="outline-info" onClick={clearFilters}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
        </div>
      )}
      
      {/* Modal de gestión de productos de testing */}
      <ProductManagementModalTest
        show={showManagementModal}
        onHide={() => setShowManagementModal(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};

export default ProductGridTest;