import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCardModern = ({ product, onManage }) => {
  // Función para obtener la URL de la imagen o usar la imagen por defecto
  const getImageUrl = () => {
    if (product.imageUrl || product.imagenURL) {
      return product.imageUrl || product.imagenURL;
    }
    // Usar la imagen por defecto del directorio public
    return '/no-image.jpg';
  };
  
  return (
    <Card className="product-card-modern h-100">
      {/* Imagen del producto */}
      <div className="product-card-image-container">
        <Card.Img 
          variant="top" 
          src={getImageUrl()} 
          alt={product.nombre} 
          className="product-card-image" 
          onError={(e) => {e.target.src = '/no-image.jpg'}}  // Fallback si la imagen falla
        />
      </div>
      
      <Card.Body className="d-flex flex-column">
        {/* Información básica del producto */}
        <div className="mb-3">
          <h5 className="product-card-title mb-1">{product.nombre || 'Producto sin nombre'}</h5>
          <p className="product-card-availability mb-1">
            {product.cantidad || 0} disponible{(product.cantidad || 0) !== 1 ? 's' : ''}
          </p>
          <h4 className="product-card-price">${parseFloat(product.precio || 0).toFixed(2)}</h4>
        </div>
        
        {/* Código o descripción corta si existe */}
        {(product.codigo || product.descripcion) && (
          <div className="mb-3">
            {product.codigo && (
              <p className="product-card-code mb-1">
                <small>Código: {product.codigo}</small>
              </p>
            )}
            {product.descripcion && (
              <p className="product-card-description small text-muted">
                {product.descripcion.length > 60 
                  ? `${product.descripcion.substring(0, 60)}...` 
                  : product.descripcion}
              </p>
            )}
          </div>
        )}
        
        {/* Botones de acción para gestionar el producto */}
        <div className="mt-auto">
          <div className="d-grid gap-2">
            <Link to={`/products/edit/${product.id}`} state={{ product }}>
              <Button 
                className="btn-edit-modern product-action-btn w-100"
                variant="primary"
              >
                <i className="bi bi-pencil-square me-2"></i>
                {product.nombre ? 'Editar' : 'Completar'}
              </Button>
            </Link>
            
            <Button 
              className="btn-manage-modern product-action-btn w-100"
              variant="outline-secondary"
              onClick={() => onManage(product)}
            >
              <i className="bi bi-gear-fill me-2"></i>
              Gestionar
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCardModern;