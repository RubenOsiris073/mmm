import React from 'react';
import { Card, Form, InputGroup, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaSearch, FaBox, FaBoxOpen, FaUtensils, FaWineBottle, 
         FaShoppingBag, FaTshirt, FaMobile, FaLaptop } from 'react-icons/fa';
import { BsFillTagsFill } from 'react-icons/bs';
import { toast } from 'react-toastify';

const ProductList = ({ products, loading, searchTerm, setSearchTerm, addToCart }) => {
  // Determinar el icono basado en la categoría
  const getCategoryIcon = (category) => {
    const normalizedCategory = (category || "").toLowerCase();
    
    // Aumentando el tamaño de los iconos
    const iconSize = 24; // Tamaño en píxeles
    
    switch (normalizedCategory) {
      case 'alimentos':
        return <FaUtensils size={iconSize} className="text-success" />;
      case 'bebidas':
        return <FaWineBottle size={iconSize} className="text-primary" />;
      case 'ropa':
        return <FaTshirt size={iconSize} className="text-info" />;
      case 'electrónicos':
      case 'electronicos':
        return <FaLaptop size={iconSize} className="text-warning" />;
      case 'móviles':
      case 'moviles':
        return <FaMobile size={iconSize} className="text-danger" />;
      default:
        return <FaShoppingBag size={iconSize} className="text-secondary" />;
    }
  };
  
  // Determinar clase CSS para el stock
  const getStockClass = (stock) => {
    if (stock <= 0) return 'text-danger fw-bold';
    if (stock <= 5) return 'text-warning fw-bold';
    return 'text-success fw-bold';
  };
  
  // Manejar agregar al carrito - MODIFICADO con toast
  const handleAddToCart = (product) => {
    if (product && typeof addToCart === 'function') {
      // Verificar stock
      const stockDisponible = product.cantidad !== undefined ? 
        product.cantidad : (product.stock || 0);
        
      if (stockDisponible <= 0) {
        toast.error(`${product.nombre}: Sin stock disponible`);
        return;
      }
      
      // Añadir al carrito y mostrar toast
      addToCart(product);
      
      // Mostrar notificación
      toast.success(`${product.nombre} añadido al carrito`, {
        position: "bottom-right",
        autoClose: 2000
      });
    }
  };
  
  return (
    <Card className="product-catalog shadow-sm">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <h4 className="mb-0"><BsFillTagsFill className="me-2" /> Catálogo de Productos</h4>
      </Card.Header>
      <Card.Body className="p-3">
        <InputGroup className="mb-4">
          <InputGroup.Text className="bg-light">
            <FaSearch size={18} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Buscar productos..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input py-2 fs-5"
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm('')}
              className="px-3"
            >
              <span className="fw-bold">×</span>
            </Button>
          )}
        </InputGroup>
        
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 fs-5">Cargando productos...</p>
          </div>
        ) : (
          <>
            {products && products.length > 0 ? (
              <div className="product-grid" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                <Row xs={1} md={2} lg={3} className="g-4">
                  {products.map(product => {
                    // Determinar stock disponible
                    const stockDisponible = product.cantidad !== undefined ? 
                      product.cantidad : (product.stock || 0);
                    const stockClass = getStockClass(stockDisponible);
                    
                    return (
                      <Col key={product.id}>
                        <Card 
                          className="h-100 product-card border hover-effect" 
                          onClick={() => stockDisponible > 0 && handleAddToCart(product)}
                        >
                          <Card.Body className="d-flex flex-column p-3">
                            {/* Header de la tarjeta con icono y nombre */}
                            <div className="d-flex align-items-center mb-3">
                              <div className="category-icon me-3 p-2 rounded-circle">
                                {getCategoryIcon(product.categoria)}
                              </div>
                              <Card.Title className="mb-0 fs-5 text-truncate" style={{ maxWidth: '70%' }}>
                                {product.nombre}
                              </Card.Title>
                            </div>
                            
                            {/* Detalles centrales */}
                            <div className="product-details mt-auto mb-3">
                              <Card.Text className="mb-2 fs-4 fw-bold text-primary">
                                ${product.precio?.toFixed(2)}
                              </Card.Text>
                              <div className={`stock-info ${stockClass} fs-6 mb-2`}>
                                {stockDisponible > 0 ? (
                                  <>
                                    {stockDisponible > 5 ? 
                                      <FaBox size={16} className="me-2" /> : 
                                      <FaBoxOpen size={16} className="me-2" />
                                    }
                                    Stock: {stockDisponible}
                                  </>
                                ) : (
                                  <>
                                    <FaBoxOpen size={16} className="me-2" /> Sin stock
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Botón en la parte inferior */}
                            <Button 
                              variant={stockDisponible > 0 ? "primary" : "secondary"} 
                              className="w-100 mt-auto fs-5 py-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (stockDisponible > 0) handleAddToCart(product);
                              }}
                              disabled={stockDisponible <= 0}
                            >
                              {stockDisponible > 0 ? '+ Agregar al carrito' : 'Sin stock'}
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ) : (
              <div className="text-center p-5 bg-light rounded">
                <p className="fs-5">No hay productos disponibles{searchTerm ? ' para esta búsqueda' : ''}</p>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductList;