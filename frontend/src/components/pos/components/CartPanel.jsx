import React from 'react';
import ShoppingCart from '../ShoppingCart';
import styles from '../styles/CartPanel.module.css';

const CartPanel = ({
  cartItems,
  onRemove,
  onUpdateQuantity,
  calculateTotal,
  onOpenPayment,
  loading,
  isMainView = false
}) => {
  return (
    <div className={styles['cart-panel-modern']}>
      {/* Shopping Bag Component */}
      <div className={styles['cart-content']}>
        <ShoppingCart
          items={cartItems}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
        />
      </div>
    </div>
  );
};

export default CartPanel;