import React from 'react';
import { Table, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductList = ({ products, loading }) => {
  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    
    const date = new Date(isoDate);
    return date.toLocaleString('es-MX', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getBadgeVariant = (similarity) => {
    if (similarity >= 90) return 'success';
    if (similarity >= 70) return 'info';
    if (similarity >= 50) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando productos...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center p-5">
        <h4>No hay productos detectados</h4>
        <p className="text-muted">
          Detecta y guarda productos con la cámara para que aparezcan aquí
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Precisión</th>
            <th>Fecha de Detección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id || index}>
              <td>{index + 1}</td>
              <td className="text-capitalize fw-bold">{product.label}</td>
              <td>
                <Badge bg={getBadgeVariant(product.similarity)}>
                  {product.similarity}%
                </Badge>
              </td>
              <td>{formatDate(product.timestamp)}</td>
              <td>
                <Link to="/product-form" state={{ product: product }}>
                  <Button variant="outline-primary" size="sm">
                    Registrar Detalles
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductList;