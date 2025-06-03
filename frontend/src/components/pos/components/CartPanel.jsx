import React from 'react';
import { Button } from 'react-bootstrap';
import ShoppingCart from '../ShoppingCart';

const CartPanel = ({
  cartItems,
  onRemove,
  onUpdateQuantity,
  calculateTotal,
  onOpenPayment,
  loading
}) => {
  return (
    <div className="cart-panel h-100 p-4 shadow-sm rounded">
      <h3 className="mb-3 text-primary">Carrito de Compras</h3>
      
      <div className="cart-container" style={{maxHeight: '300px', overflowY: 'auto'}}>
        <ShoppingCart
          items={cartItems}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
        />
      </div>
      
      <div className="checkout-section border-top pt-3 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Total:</h4>
          <h3 className="mb-0 text-primary">${calculateTotal().toFixed(2)}</h3>
        </div>
        
        <Button 
          variant="primary" 
          size="lg" 
          className="w-100"
          onClick={onOpenPayment}
          disabled={cartItems.length === 0 || loading}
        >
          Procesar Pago
        </Button>
      </div>
    </div>
  );
};

export default CartPanel;