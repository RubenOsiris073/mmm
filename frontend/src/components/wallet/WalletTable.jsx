import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const WalletTable = ({ wallet, onAdjust }) => {
  if (!wallet.length) {
    return (
      <div className="text-center p-4">
        <p>No hay productos en el inventario</p>
      </div>
    );
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Categoría</th>
          <th>Última Actualización</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {wallet.map(product => (
          <tr key={product.id}>
            <td>{product.nombre}</td>
            <td>
              <Badge bg={product.cantidad > 0 ? 'success' : 'danger'}>
                {product.cantidad}
              </Badge>
            </td>
            <td>{product.categoria || 'Sin categoría'}</td>
            <td>
              {new Date(product.updatedAt).toLocaleString()}
            </td>
            <td>
              <Button 
                size="sm" 
                variant="outline-primary"
                onClick={() => onAdjust(product)}
              >
                Ajustar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default WalletTable;