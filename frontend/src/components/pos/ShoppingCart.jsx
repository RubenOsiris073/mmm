import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Badge, Row, Col, Alert, Form } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import PaymentModal from './PaymentModal';
import './styles/ShoppingCart.css';

const ShoppingCart = ({ items, onRemove, onUpdateQuantity }) => {
  // Protección contra props indefinidos
  const cartItems = items || [];
  
  // Verificar si está vacío primero
  if (!cartItems.length) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h5>Tu carrito está vacío</h5>
        <p className="text-muted">Agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="shopping-bag-container">
      {/* Header estilo Shopping Bag */}
      <div className="shopping-bag-header">
        <h4 className="bag-title">Shopping Bag</h4>
        <p className="bag-subtitle">{cartItems.length} items in your bag.</p>
      </div>
      
      {/* Tabla de productos */}
      <div className="products-table-container">
        <Table className="products-table" borderless>
          <thead>
            <tr className="table-header">
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="product-row">
                {/* Columna Product */}
                <td className="product-cell">
                  <div className="product-info-container">
                    <div className="product-image-wrapper">
                      <img 
                        src={item.imagen || '/no-image.jpg'} 
                        alt={item.nombre || 'Producto'}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = '/no-image.jpg';
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <h6 className="product-name">{item.nombre || 'Producto'}</h6>
                      <div className="product-meta">
                        <span className="product-brand">PRODUCTO</span>
                        <div className="product-specs">
                          <span>Size: • 42</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Columna Price */}
                <td className="price-cell">
                  <span className="unit-price">${(item.precio || 0).toFixed(2)}</span>
                </td>
                
                {/* Columna Quantity */}
                <td className="quantity-cell">
                  <div className="quantity-controls">
                    <Button
                      className="quantity-btn"
                      onClick={() => typeof onUpdateQuantity === 'function' && onUpdateQuantity(item.id, (item.quantity || 0) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </Button>
                    <span className="quantity-value">{item.quantity || 1}</span>
                    <Button
                      className="quantity-btn"
                      onClick={() => typeof onUpdateQuantity === 'function' && onUpdateQuantity(item.id, (item.quantity || 0) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>
                
                {/* Columna Total Price */}
                <td className="total-cell">
                  <div className="total-price-container">
                    <span className="item-total-price">
                      ${((item.precio || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                    <Button 
                      variant="link" 
                      className="remove-product-btn"
                      onClick={() => typeof onRemove === 'function' && onRemove(item.id)}
                      title="Remove item"
                    >
                      ×
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ShoppingCart;