import React from 'react';
import { Button, Table } from 'react-bootstrap';
import styles from './styles/ShoppingCart.module.css';

const ShoppingCart = ({ items, onRemove, onUpdateQuantity }) => {
  // Protección contra props indefinidos
  const cartItems = items || [];

  // Verificar si está vacío primero
  if (!cartItems.length) {
    return (
      <div className={styles['empty-cart']}>
        <div className={styles['empty-cart-icon']}>🛒</div>
        <h5>Tu carrito está vacío</h5>
        <p className="text-muted">Agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className={styles['shopping-bag-container']}>
      {/* Header estilo Shopping Bag */}
      <div className={styles['shopping-bag-header']}>
        <h4 className={styles['bag-title']}>Shopping Bag</h4>
        <p className={styles['bag-subtitle']}>{cartItems.length} items in your bag.</p>
      </div>

      {/* Tabla de productos */}
      <div className={styles['products-table-container']}>
        <Table className={styles['products-table']} borderless>
          <thead>
            <tr className={styles['table-header']}>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className={styles['product-row']}>
                {/* Columna Product */}
                <td className={styles['product-cell']}>
                  <div className={styles['product-info-container']}>
                    <div className={styles['product-image-wrapper']}>
                      <img
                        src={item.imagen || '/no-image.jpg'}
                        alt={item.nombre || 'Producto'}
                        className={styles['product-thumbnail']}
                        onError={(e) => {
                          e.target.src = '/no-image.jpg';
                        }}
                      />
                    </div>
                    <div className={styles['product-details']}>
                      <h6 className={styles['product-name']}>{item.nombre || 'Producto'}</h6>
                      <div className={styles['product-meta']}>
                        <span className={styles['product-brand']}>PRODUCTO</span>
                        <div className={styles['product-specs']}>
                          <span>Size: • 42</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Columna Price */}
                <td className={styles['price-cell']}>
                  <span className={styles['unit-price']}>${(item.precio || 0).toFixed(2)}</span>
                </td>

                {/* Columna Quantity */}
                <td className={styles['quantity-cell']}>
                  <div className={styles['quantity-controls']}>
                    <Button
                      className={styles['quantity-btn']}
                      onClick={() => typeof onUpdateQuantity === 'function' && onUpdateQuantity(item.id, (item.quantity || 0) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </Button>
                    <span className={styles['quantity-value']}>{item.quantity || 1}</span>
                    <Button
                      className={styles['quantity-btn']}
                      onClick={() => typeof onUpdateQuantity === 'function' && onUpdateQuantity(item.id, (item.quantity || 0) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>

                {/* Columna Total Price */}
                <td className={styles['total-cell']}>
                  <div className={styles['total-price-container']}>
                    <span className={styles['item-total-price']}>
                      ${((item.precio || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                    <Button
                      variant="link"
                      className={styles['remove-product-btn']}
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
