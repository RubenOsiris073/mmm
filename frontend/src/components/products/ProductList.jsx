import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Modal } from 'react-bootstrap';
import { FaPlus, FaShoppingCart, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { deleteProduct } from '../../services/storageService';

const ProductList = ({ products, onAddToCart, loading, onProductDeleted, showCartActions = false }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Función para eliminar duplicados basada en ID
  const getUniqueProducts = (productList) => {
    if (!Array.isArray(productList)) return [];
    
    const uniqueProducts = [];
    const seenIds = new Set();
    
    productList.forEach(product => {
      if (product && product.id && !seenIds.has(product.id)) {
        seenIds.add(product.id);
        uniqueProducts.push(product);
      }
    });
    
    return uniqueProducts;
  };

  const uniqueProducts = getUniqueProducts(products);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (!uniqueProducts.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No hay productos disponibles</p>
      </div>
    );
  }

  // Función para manejar la eliminación
  const handleDelete = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
      
      // Si hay una función callback para actualizar la lista, la usamos
      if (onProductDeleted) {
        onProductDeleted(productToDelete.id);
      } else {
        // Si no hay callback, recargamos la página
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto: " + error.message);
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
              <div className="me-3">
                {productToDelete.image ? (
                  <img
                    src={productToDelete.image}
                    alt={productToDelete.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    className="rounded"
                  />
                ) : (
                  <div 
                    className="d-flex align-items-center justify-content-center bg-secondary rounded text-white"
                    style={{ width: '50px', height: '50px' }}
                  >
                    <FaShoppingCart size={20} />
                  </div>
                )}
              </div>
              <div>
                <h5 className="mb-1">
                  {productToDelete.name || productToDelete.label || 'Producto sin nombre'}
                </h5>
                <p className="text-muted mb-0 small">
                  {formatPrice(productToDelete.price)}
                </p>
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

  return (
    <div className="product-list">
      <Row className="g-3">
        {uniqueProducts.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100 product-card">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-2">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Producto';
                      }}
                    />
                  ) : (
                    <div 
                      className="product-placeholder d-flex align-items-center justify-content-center bg-light rounded"
                      style={{ width: '80px', height: '80px', margin: '0 auto' }}
                    >
                      <FaShoppingCart className="text-muted" size={24} />
                    </div>
                  )}
                </div>
                
                <Card.Title className="h6 text-center mb-2" style={{ fontSize: '0.9rem' }}>
                  {product.name || product.label || 'Producto sin nombre'}
                </Card.Title>
                
                <div className="text-center mb-2">
                  <strong className="text-primary">{formatPrice(product.price)}</strong>
                </div>
                
                <div className="text-center mb-2">
                  <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                    Stock: {product.stock || 0}
                  </Badge>
                </div>
                
                <div className="mt-auto">
                  {showCartActions ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={() => onAddToCart(product)}
                      disabled={!product.stock || product.stock <= 0}
                    >
                      <FaPlus className="me-1" />
                      Agregar
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/products/edit/${product.id}`} 
                        state={{ product }}
                        className="flex-fill"
                      >
                        <Button variant="outline-primary" size="sm" className="w-100">
                          <FaEdit className="me-1" />
                          Editar
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
                        <FaTrash />
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Incluir el modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default ProductList;