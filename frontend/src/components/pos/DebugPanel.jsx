import React from 'react';
import { Button } from 'react-bootstrap';

/**
 * Debug panel component that displays only in development mode
 * Provides buttons to simulate product detection for testing
 * 
 * @param {Object} props
 * @param {Function} props.addDetectedProductToCart - Function to add detected product to cart
 */
const DebugPanel = ({ addDetectedProductToCart }) => {
  return (
    <div
      className="position-fixed bottom-0 start-0 m-2 p-2 bg-light rounded shadow-sm"
      style={{ zIndex: 1000, fontSize: '0.8rem' }}
    >
      <div className="d-flex justify-content-between mb-1">
        <span>Modo Debug</span>
      </div>
      <div>
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-1"
          onClick={() => addDetectedProductToCart('Botella')}
        >
          Detectar Botella
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-1"
          onClick={() => addDetectedProductToCart('Barrita')}
        >
          Detectar Barrita
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => addDetectedProductToCart('Chicle')}
        >
          Detectar Chicle
        </Button>
      </div>
    </div>
  );
};

export default DebugPanel;