import React from 'react';
import { Card, Badge, Table, Button, Spinner, Row, Col } from 'react-bootstrap';

const ShoppingCart = ({
  cartItems,
  lastAddedProduct,
  updateQuantity,
  removeFromCart,
  calculateTotal,
  loading,
  onCheckout
}) => {
  return (
    <Card className="h-100">
      <Card.Header>
        <h4 className="mb-0">
          Carrito de Compra
          <Badge bg="secondary" className="ms-2">
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
          </Badge>
        </h4>
      </Card.Header>

      <Card.Body className="d-flex flex-column">
        {/* Tabla de productos en carrito */}
        <div className="flex-grow-1 overflow-auto">
          {cartItems.length > 0 ? (
            <Table striped hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id} className={
                    lastAddedProduct && lastAddedProduct.id === item.id
                      ? 'last-scanned'
                      : ''
                  }>
                    <td>{item.nombre}</td>
                    <td>${item.precio}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>${item.total}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-5">
              <i className="bi bi-cart" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">El carrito está vacío</p>
              <p>Escanea productos o agrégalos manualmente</p>
            </div>
          )}
        </div>

        {/* Sección de total y pago */}
        <div className="mt-4 border-top pt-3">
          <Row>
            <Col md={6}>
              <h5>Total: ${calculateTotal().toFixed(2)}</h5>
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <Button
                variant="success"
                size="lg"
                disabled={cartItems.length === 0 || loading}
                onClick={onCheckout}
              >
                <i className="bi bi-cash me-2"></i>
                Procesar Pago
              </Button>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ShoppingCart;