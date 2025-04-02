import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

const InventoryHeader = ({ loading, onRefresh, currentTime }) => (
  <div className="d-flex justify-content-between align-items-center">
    <h5 className="mb-0">Inventario</h5>
    <div>
      <Button 
        variant="outline-primary" 
        size="sm"
        className="me-2"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Cargando...
          </>
        ) : (
          'Actualizar'
        )}
      </Button>
      <small className="text-muted">
        Última actualización: {currentTime}
      </small>
    </div>
  </div>
);

export default InventoryHeader;