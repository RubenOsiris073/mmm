import React, { memo } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import styles from '../styles/POSLayout.module.css';

const POSCartArea = memo(({ cartItems, updateQuantity, removeFromCart }) => {
  return (
    <div className={styles.cartMainArea}>
      <div className={styles.cartEmptyState}>
        {cartItems.length === 0 ? (
          <>
            <FaShoppingCart className={styles.cartIcon} />
            <h2 className={styles.cartTitle}>Tu carrito está vacío</h2>
            <p className={styles.cartSubtitle}>Agrega productos para comenzar</p>
            <div className={styles.instructions}>
              <h3 className={styles.instructionsTitle}>Cómo usar el sistema:</h3>
              <p className={styles.instructionItem}>• Usa el botón "Iniciar Detección" para activar la cámara</p>
              <p className={styles.instructionItem}>• Coloca productos frente a la cámara para detectarlos automáticamente</p>
              <p className={styles.instructionItem}>• Los productos detectados se agregarán al carrito automáticamente</p>
              <p className={styles.instructionItem}>• Revisa el total en el panel derecho y procede al checkout</p>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.cartTitle}>Productos en el Carrito</h2>
            <div className={styles.cartItemsList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.nombre || item.name}</span>
                    <span className={styles.itemPrice}>${item.precio?.toFixed(2)}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

POSCartArea.displayName = 'POSCartArea';

export default POSCartArea;