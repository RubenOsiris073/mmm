import React from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { formatTimestamp } from '../../utils/helpers';

const InventoryTable = ({ inventory, loading, onUpdate, getLocationBadge }) => {
  if (loading) {
    return (
      <div className="text-center p-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (!inventory.length) {
    return <Alert variant="info">No hay productos en el inventario</Alert>;
  }

  return (
    <Table responsive hover>
      <thead>
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Ubicación</th>
          <th>Última Actualización</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {inventory.map(item => (
          <tr key={item.id}>
            <td>{item.productCode || 'N/A'}</td>
            <td>{item.productName}</td>
            <td>{item.quantity || 0}</td>
            <td>{getLocationBadge(item.location)}</td>
            <td>{formatTimestamp(item.updatedAt)}</td>
            <td>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onUpdate(item)}
              >
                Actualizar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default InventoryTable;