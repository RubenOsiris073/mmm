import React from 'react';
import { Button } from 'react-bootstrap';
import ShoppingCart from '../ShoppingCart';
import '../styles/CartPanel.css';

const CartPanel = ({
  cartItems,
  onRemove,
  onUpdateQuantity,
  calculateTotal,
  onOpenPayment,
  loading,
  isMainView = false
}) => {
  const subtotal = calculateTotal();

  return (
    <div className="cart-panel-modern">
      {/* Shopping Bag Component */}
      <div className="cart-content">
        <ShoppingCart
          items={cartItems}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
        />
      </div>
      
      {/* Cart Total Panel - Solo mostrar si NO es la vista principal */}
      {!isMainView && cartItems.length > 0 && (
        <div className="cart-total-panel">
          <div className="cart-total-header">
            <h5 className="cart-total-title">Total del Carrito</h5>
          </div>
          
          <div className="cart-total-content">
            <div className="total-breakdown">
              <div className="total-line subtotal-line">
                <span className="total-label">Subtotal del Carrito</span>
                <span className="total-amount">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="total-line discount-line">
                <span className="total-label">Descuento</span>
                <span className="total-amount">--</span>
              </div>
              
              <div className="total-line final-total-line">
                <span className="final-total-label">Total del Carrito</span>
                <span className="final-total-amount">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="apply-btn w-100"
              onClick={onOpenPayment}
              disabled={cartItems.length === 0 || loading}
            >
              {loading ? 'Procesando...' : 'Aplicar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;