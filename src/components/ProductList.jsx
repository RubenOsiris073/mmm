import React from 'react';
import ProductItem from './ProductItem';

const ProductList = ({ products, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <h5>No hay productos disponibles</h5>
          <p>Agrega un nuevo producto para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3">Lista de Productos</h3>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {products.map(product => (
          <div className="col" key={product.id}>
            <ProductItem 
              product={product} 
              onEdit={() => onEdit(product)} 
              onDelete={() => onDelete(product.id, product.imageUrl)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;