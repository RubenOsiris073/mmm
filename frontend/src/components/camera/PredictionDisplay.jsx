import React from 'react';
import { Card, Spinner, Badge } from 'react-bootstrap';

const PredictionDisplay = ({ loading, label, similarity }) => {
  // Determinar el color del badge según la precisión
  const getBadgeVariant = (sim) => {
    if (sim >= 90) return 'success';
    if (sim >= 70) return 'info';
    if (sim >= 50) return 'warning';
    return 'danger';
  };

  return (
    <Card className="prediction-display border-0 bg-light">
      <Card.Body className="text-center">
        {loading ? (
          <div>
            <Spinner animation="border" role="status" variant="primary" />
            <p className="mt-2 mb-0">Cargando modelo de detección...</p>
          </div>
        ) : label ? (
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="mb-0 text-capitalize">{label}</h2>
            <Badge 
              bg={getBadgeVariant(similarity)} 
              className="fs-6 p-2"
              style={{fontSize: '1rem'}}
            >
              Precisión: {similarity}%
            </Badge>
          </div>
        ) : (
          <p className="mb-0">Esperando detección...</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default PredictionDisplay;