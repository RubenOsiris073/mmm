import React from 'react';
import { Card } from 'react-bootstrap';

const WalletStats = ({ wallet }) => {
  const stats = {
    total: wallet.length,
    outOfStock: wallet.filter(p => p.cantidad <= 0).length,
    lowStock: wallet.filter(p => p.cantidad > 0 && p.cantidad <= 5).length,
  };

  return (
    <Card className="mb-4">
      <Card.Header>Estadísticas</Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Total de Productos:</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Sin Existencias:</span>
          <strong className="text-danger">{stats.outOfStock}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <span>Stock Bajo:</span>
          <strong className="text-warning">{stats.lowStock}</strong>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WalletStats;