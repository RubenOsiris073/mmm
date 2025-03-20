import React from 'react';

const ProductItem = ({ product, onEdit, onDelete }) => {
  const confirmDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      onDelete();
    }
  };

  return (
    <div className="card h-100">
      {product.imageUrl ? (
        <img 
          src={product.imageUrl} 
          className="card-img-top" 
          alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div 
          className="bg-light d-flex justify-content-center align-items-center"
          style={{ height: '200px' }}
        >
          <p className="text-muted">Sin imagen</p>
        </div>
      )}
      
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-truncate">{product.description || 'Sin descripción'}</p>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-primary">${product.price?.toFixed(2) || '0.00'}</span>
          {product.category && (
            <span className="badge bg-secondary">{product.category}</span>
          )}
        </div>
        
        {product.stock !== undefined && (
          <p className="mb-0">
            <small className={`${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
              Stock: {product.stock} unidades
            </small>
          </p>
        )}
      </div>
      
      <div className="card-footer d-flex justify-content-between">
        <button 
          className="btn btn-sm btn-primary" 
          onClick={onEdit}
        >
          <i className="bi bi-pencil"></i> Editar
        </button>
        <button 
          className="btn btn-sm btn-danger" 
          onClick={confirmDelete}
        >
          <i className="bi bi-trash"></i> Eliminar
        </button>
      </div>
    </div>
  );
};

export default ProductItem;