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
    <Card className="product-card-modern">
      {/* Imagen del producto */}
      <div className="product-card-image-container">
        <Card.Img 
          variant="top" 
          src={getImageUrl()} 
          alt={product.nombre || 'Producto'} 
          className="product-card-image" 
          onError={(e) => {e.target.src = '/no-image.jpg'}}
        />
      </div>
      
      <Card.Body className="d-flex flex-column p-3">
        {/* Información básica del producto */}
        <div className="mb-2">
          <h5 className="product-card-title">{product.nombre || 'Producto sin nombre'}</h5>
          
          {/* Marca si existe */}
          {product.marca && (
            <p className="product-card-brand mb-1">
              <small className="text-muted">
                <i className="bi bi-tag me-1"></i>
                {product.marca}
              </small>
            </p>
          )}
          
          <p className="product-card-availability mb-1">
            <i className="bi bi-box me-1"></i>
            {product.cantidad || 0} disponible{(product.cantidad || 0) !== 1 ? 's' : ''}
          </p>
          <h4 className="product-card-price mb-2">
            <i className="bi bi-currency-dollar me-1"></i>
            ${parseFloat(product.precio || 0).toFixed(2)}
          </h4>
        </div>
        
        {/* Información adicional */}
        <div className="mb-2">
          {/* Código del producto */}
          {product.codigo && (
            <p className="product-card-code mb-1">
              <small>
                <i className="bi bi-upc-scan me-1"></i>
                <strong>Código:</strong> {product.codigo}
              </small>
            </p>
          )}
          
          {/* Peso o volumen si existe */}
          {(product.peso || product.volumen) && (
            <p className="product-card-weight mb-1">
              <small>
                <i className="bi bi-speedometer2 me-1"></i>
                <strong>
                  {product.peso ? 'Peso:' : 'Volumen:'}
                </strong> {product.peso || product.volumen}
              </small>
            </p>
          )}
          
          {/* Unidad de medida */}
          {product.unidadMedida && (
            <p className="product-card-unit mb-1">
              <small>
                <i className="bi bi-rulers me-1"></i>
                <strong>Unidad:</strong> {product.unidadMedida}
              </small>
            </p>
          )}
          
          {/* Categoría */}
          {product.categoria && (
            <p className="product-card-category mb-1">
              <small>
                <i className="bi bi-collection me-1"></i>
                <strong>Categoría:</strong> {product.categoria}
              </small>
            </p>
          )}
          
          {/* Descripción corta si existe */}
          {product.descripcion && (
            <p className="product-card-description small text-muted mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {product.descripcion.length > 60 
                ? `${product.descripcion.substring(0, 60)}...` 
                : product.descripcion}
            </p>
          )}
        </div>
        
        {/* Botones de acción para gestionar el producto */}
        <div className="mt-auto pt-2">
          <div className="d-flex flex-column gap-2">
            <Link to={`/products/edit/${product.id}`} state={{ product }} className="text-decoration-none">
              <Button 
                className="btn-edit-modern product-action-btn w-100"
                variant="primary"
                size="sm"
              >
                <i className="bi bi-pencil-square me-1"></i>
                {product.nombre ? 'Editar' : 'Completar'}
              </Button>
            </Link>
            
            <Button 
              className="btn-manage-modern product-action-btn w-100"
              variant="outline-secondary"
              size="sm"
              onClick={() => onManage(product)}
            >
              <i className="bi bi-eye-fill me-1"></i>
              Gestionar
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCardModern;