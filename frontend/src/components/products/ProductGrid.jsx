import React, { useState } from 'react';
import { Row, Col, Card, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsSearch, BsGrid3X3, BsList } from 'react-icons/bs';
import { deleteProduct } from '../../services/storageService';

const ProductGrid = ({ products = [], loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
  // Agregar estados para el modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Extraer categorías únicas de todos los productos
  const allCategories = [...new Set(products
    .filter(p => p.categoria)
    .map(p => p.categoria))];

  // Función para obtener productos filtrados
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filtro de búsqueda por término
      const searchMatch = searchTerm === '' || 
        (product.nombre || product.label || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      // Filtro por categoría
      const categoryMatch = selectedCategory === 'all' || 
        product.categoria === selectedCategory;

      return searchMatch && categoryMatch;
    });
  };

  // Agrupar productos por categoría
  const groupProductsByCategory = () => {
    const groupedProducts = {};
    
    // Inicializar con categorías conocidas
    allCategories.forEach(cat => {
      groupedProducts[cat] = [];
    });
    
    // Categoría para productos sin categoría asignada
    groupedProducts['sin-categoria'] = [];
    
    // Agrupar productos
    getFilteredProducts().forEach(product => {
      if (product.categoria) {
        groupedProducts[product.categoria].push(product);
      } else {
        groupedProducts['sin-categoria'].push(product);
      }
    });
    
    // Filtrar grupos vacíos si se está buscando
    if (searchTerm || selectedCategory !== 'all') {
      Object.keys(groupedProducts).forEach(key => {
        if (groupedProducts[key].length === 0) {
          delete groupedProducts[key];
        }
      });
    }
    
    return groupedProducts;
  };

  // Obtener color según la categoría
  const getCategoryColor = (category) => {
    const colors = {
      'alimentos': 'success',
      'bebidas': 'info',
      'limpieza': 'primary',
      'medicamentos': 'danger',
      'sin-categoria': 'secondary',
      'otros': 'warning'
    };
    return colors[category] || 'light';
  };

  // Obtener icono para la categoría
  const getCategoryIcon = (category) => {
    const icons = {
      'alimentos': '🍎',
      'bebidas': '🥤',
      'limpieza': '🧹',
      'medicamentos': '💊',
      'sin-categoria': '📦',
      'otros': '🔍'
    };
    return icons[category] || '📦';
  };

  // Formatear el título de categoría
  const formatCategoryTitle = (category) => {
    if (category === 'sin-categoria') return 'Sin Categoría';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Función para manejar la eliminación
  const handleDelete = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  // Modal de confirmación de eliminación
  const DeleteConfirmationModal = () => (
    <Modal
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {productToDelete && (
          <>
            <p>¿Estás seguro de que deseas eliminar este producto?</p>
            <div className="d-flex align-items-center p-3 bg-light rounded">
              <div className="product-icon me-3">
                {getCategoryIcon(productToDelete.categoria || 'sin-categoria')}
              </div>
              <div>
                <h5 className="mb-1 text-capitalize">
                  {productToDelete.nombre || productToDelete.label || 'Producto sin nombre'}
                </h5>
                {productToDelete.descripcion && (
                  <p className="text-muted mb-0 small">
                    {productToDelete.descripcion}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Contenido de la tarjeta de producto
  const renderProductCard = (product) => {
    return (
      <Card className="h-100 product-card">
        <Card.Body className="d-flex flex-column">
          <div className="product-icon mb-3">
            {getCategoryIcon(product.categoria || 'sin-categoria')}
          </div>
          <Card.Title className="text-capitalize">
            {product.nombre || product.label || 'Producto sin nombre'}
          </Card.Title>
          <Card.Text as="div" className="small text-muted flex-grow-1">
            {product.descripcion || product.notas || 
              `Producto ${product.tipoDetectado || product.label || ''} detectado automáticamente`}
          </Card.Text>
          <div className="mt-3">
            {product.cantidad && (
              <Badge bg="info" className="me-2">
                {product.cantidad} {product.unidadMedida || 'unidades'}
              </Badge>
            )}
            {product.precio && (
              <Badge bg="success" className="me-2">
                ${parseFloat(product.precio).toFixed(2)}
              </Badge>
            )}
            {(product.similarity || product.precisionDeteccion) && (
              <Badge bg="warning">
                Precisión: {product.similarity || product.precisionDeteccion}%
              </Badge>
            )}
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-top-0 d-flex gap-2">
          <Link 
            to="/product-form" 
            state={{ product }}
            className="w-50"
          >
            <Button variant="outline-primary" size="sm" className="w-100">
              {product.nombre ? 'Editar' : 'Registrar Detalles'}
            </Button>
          </Link>
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="w-50"
            onClick={() => {
              setProductToDelete(product);
              setShowDeleteModal(true);
            }}
          >
            Eliminar
          </Button>
        </Card.Footer>
      </Card>
    );
  };

  // Renderizar la vista de lista
  const renderListView = () => {
    const groupedProducts = groupProductsByCategory();
    
    return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} className="mb-5">
        <h4 className="mb-3 d-flex align-items-center">
          <span className={`category-icon bg-${getCategoryColor(category)} me-2`}>
            {getCategoryIcon(category)}
          </span>
          {formatCategoryTitle(category)}
          <Badge bg="secondary" className="ms-2">
            {categoryProducts.length}
          </Badge>
        </h4>
        
        <div className="list-group">
          {categoryProducts.map(product => (
            <div 
              key={product.id} 
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 className="mb-1 text-capitalize">
                  {product.nombre || product.label || 'Producto sin nombre'}
                </h5>
                <p className="mb-1 small text-muted">
                  {product.descripcion || product.notas || 
                    `Producto ${product.tipoDetectado || product.label || ''} detectado automáticamente`}
                </p>
                <div>
                  {product.cantidad && (
                    <Badge bg="info" className="me-1">
                      {product.cantidad} {product.unidadMedida || 'unidades'}
                    </Badge>
                  )}
                  {product.precio && (
                    <Badge bg="success" className="me-1">
                      ${parseFloat(product.precio).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2">
                <Link to="/product-form" state={{ product }}>
                  <Button variant="outline-primary" size="sm">
                    {product.nombre ? 'Editar' : 'Registrar'}
                  </Button>
                </Link>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => {
                    setProductToDelete(product);
                    setShowDeleteModal(true);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Renderizar la vista de cuadrícula
  const renderGridView = () => {
    const groupedProducts = groupProductsByCategory();
    
    return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} className="mb-5">
        <h4 className="mb-3 d-flex align-items-center">
          <span className={`category-icon bg-${getCategoryColor(category)} me-2`}>
            {getCategoryIcon(category)}
          </span>
          {formatCategoryTitle(category)}
          <Badge bg="secondary" className="ms-2">
            {categoryProducts.length}
          </Badge>
        </h4>
        
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {categoryProducts.map(product => (
            <Col key={product.id}>
              {renderProductCard(product)}
            </Col>
          ))}
        </Row>
      </div>
    ));
  };

  // Si no hay productos
  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="text-center p-5">
        <h4>No hay productos en el inventario</h4>
        <p className="text-muted">
          Registra productos manualmente o detecta con la cámara para comenzar
        </p>
        <Link to="/product-form">
          <Button variant="primary" className="mt-3">
            Agregar Producto
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      {/* Barra de filtros */}
      <div className="mb-4">
        <Row>
          <Col md={6} lg={4}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={4} lg={4}>
            <Form.Select 
              className="mb-3"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>
                  {formatCategoryTitle(cat)}
                </option>
              ))}
              <option value="sin-categoria">Sin categoría</option>
            </Form.Select>
          </Col>
          <Col md={2} lg={4} className="d-flex justify-content-end">
            <div className="btn-group mb-3">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('grid')}
              >
                <BsGrid3X3 />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('list')}
              >
                <BsList />
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Contenido principal */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}
      
      {/* Incluir el modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default ProductGrid;