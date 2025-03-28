import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

/**
 * Component that displays an alert when a product is added to the cart
 * @param {Object} props
 * @param {Object} props.product - The product that was just added to the cart
 */
const LastAddedProductAlert = ({ product }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reset visibility whenever a new product is added
    setVisible(true);
    
    // Hide the alert after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [product]);

  if (!visible || !product) {
    return null;
  }

  return (
    <Alert
      variant="success"
      className="position-fixed bottom-0 end-0 m-3 d-flex align-items-center fade-out"
      style={{ 
        zIndex: 1050,
        animation: 'fadeOut 0.5s forwards',
        animationDelay: '1.5s'
      }}
    >
      <i className="bi bi-check-circle-fill me-2"></i>
      <span>
        <strong>{product.nombre}</strong> añadido al carrito
      </span>
    </Alert>
  );
};

export default LastAddedProductAlert;