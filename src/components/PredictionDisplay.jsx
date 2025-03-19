import React from 'react';
import { Spinner, Badge } from 'react-bootstrap';

const PredictionDisplay = ({ loading, label, similarity }) => {
  // Determinar el color del badge según la precisión
  const getBadgeVariant = (similarity) => {
    if (similarity >= 90) return 'success';
    if (similarity >= 70) return 'info';
    if (similarity >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="prediction-display p-2 rounded">
      <h4>Predicción:</h4>
      
      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando modelo...</span>
          </Spinner>
          <p className="mt-2">Cargando modelo de detección...</p>
        </div>
      ) : label ? (
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="mb-0 text-capitalize">{label}</h3>
          <Badge bg={getBadgeVariant(similarity)} className="fs-6">
            Precisión: {similarity}%
          </Badge>
        </div>
      ) : (
        <p>Esperando detección...</p>
      )}
    </div>
  );
};

export default PredictionDisplay;