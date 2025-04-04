import React from 'react';
import { Table, Card } from 'react-bootstrap';

const RegisteredProducts = ({ products }) => {
  return (
    <Card>
      <Card.Header>
        <h4>Productos Registrados</h4>
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
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.nombre}</td>
                <td>{product.cantidad}</td>
                <td>${product.precioUnitario}</td>
                <td>${(product.cantidad * product.precioUnitario).toFixed(2)}</td>
                <td>{product.proveedor || '-'}</td>
                <td>{new Date(product.fechaRegistro).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default RegisteredProducts;