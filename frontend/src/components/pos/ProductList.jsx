import React from 'react';
import { Card, Form, ListGroup, Spinner, Badge, Button } from 'react-bootstrap';

const ProductList = ({
  loading,
  filteredProducts,
  searchTerm,
  setSearchTerm,
  products,
  addToCart
}) => {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Productos Disponibles</h5>
      </Card.Header>
      <Card.Body>
        <Form.Control
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        <div className="products-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ListGroup>
              {filteredProducts.map(product => (
                <ListGroup.Item
                  key={product.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{product.nombre}</strong>
                    <div className="text-muted small">
                      {product.label} - ${product.precio || 0}
                    </div>
                  </div>
                  <div>
                    <Badge bg={product.stock > 0 ? "success" : "danger"} className="me-2">
                      Stock: {product.stock || 0}
                    </Badge>
                    {product.stock > 0 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => addToCart(product)}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-center text-muted">
              {products.length === 0
                ? "No hay productos registrados"
                : "No se encontraron productos con ese término"}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductList;