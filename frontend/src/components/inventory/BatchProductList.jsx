import React from 'react';
import { Table, Button, Card } from 'react-bootstrap';
import { saveProductDetails } from '../../services/storageService';

const BatchProductList = ({ batchProducts, setBatchProducts, onBatchSaved }) => {
  const removeFromBatch = (productId) => {
    setBatchProducts(prev => prev.filter(product => product.id !== productId));
  };

  const saveBatch = async () => {
    if (batchProducts.length === 0) {
      alert('Agregue al menos un producto al lote');
      return;
    }

    try {
      // Guardar cada producto del lote
      for (const product of batchProducts) {
        await saveProductDetails({
          ...product,
          tipo: 'bruto',
          loteId: Date.now().toString()
        });
      }
      
      onBatchSaved();
      alert('Lote guardado exitosamente');
    } catch (error) {
      console.error("Error al guardar el lote:", error);
      alert('Error al guardar el lote');
    }
  };

  if (batchProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>Productos en el Lote Actual</h4>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
              <th>Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {batchProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.nombre}</td>
                <td>{product.cantidad}</td>
                <td>${product.precioUnitario}</td>
                <td>${(product.cantidad * product.precioUnitario).toFixed(2)}</td>
                <td>{product.proveedor || '-'}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => removeFromBatch(product.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-end mt-3">
          <Button 
            variant="success" 
            onClick={saveBatch}
          >
            Guardar Lote
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BatchProductList;