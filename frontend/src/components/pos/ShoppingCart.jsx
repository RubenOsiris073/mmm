import React from 'react';
import { Table, Button } from 'react-bootstrap';

const ShoppingCart = ({ items, onRemove, onUpdateQuantity }) => {
  // Protección contra props indefinidos
  const cartItems = items || [];
  
  // Verificar si está vacío primero
  if (!cartItems.length) {
    return (
      <div className="text-center p-4 border rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
        <p>El carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <Table responsive>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre || 'Producto'}</td>
              <td>${(item.precio || 0).toFixed(2)}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => typeof onUpdateQuantity === 'function' && onUpdateQuantity(item.id, (item.quantity || 0) - 1)}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity || 1}</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => typeof onUpdateQuantity === 'function' && onUpdateQuantity(item.id, (item.quantity || 0) + 1)}
                  >
                    +
                  </Button>
                </div>
              </td>
              <td>${((item.precio || 0) * (item.quantity || 1)).toFixed(2)}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => typeof onRemove === 'function' && onRemove(item.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ShoppingCart;