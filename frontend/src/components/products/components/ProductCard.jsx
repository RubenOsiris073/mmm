import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../utils/categoryUtils';

const ProductCard = ({ product, onManage }) => {
  const currentStock = product.cantidad || product.stock || 0;
  const stockMinimo = product.stockMinimo || 5;
  
  // Determinar el color del badge según el stock y stockMinimo
  const getStockBadgeVariant = (stock, minimo) => {
    if (stock === 0) return 'danger';
    if (stock <= minimo) return 'warning';
    if (stock <= minimo * 2) return 'info';
    return 'success';
  };

  const stockStatus = getStockBadgeVariant(currentStock, stockMinimo);

  return (
    <Card className="h-100 product-card shadow-sm">
      <Card.Body className="d-flex flex-column">
        {/* Icono de categoría */}
        <div className="text-center mb-3">
          <span className="fs-1">
            {getCategoryIcon(product.categoria || product.category || 'sin-categoria')}
          </span>
        </div>

        {/* Nombre del producto */}
        <Card.Title className="h6 text-center mb-2 text-capitalize" style={{ minHeight: '2.5rem' }}>
          {product.nombre || product.name || product.label || 'Producto sin nombre'}
        </Card.Title>

        {/* Información del producto */}
        <div className="text-center mb-3">
          {product.precio && (
            <div className="mb-2">
              <Badge bg="success" className="fs-6">
                ${parseFloat(product.precio).toFixed(2)}
              </Badge>
            </div>
          )}
          
          <Badge bg={stockStatus} className="mb-2">
            Stock: {currentStock} {product.unidadMedida || 'unidades'}
          </Badge>
          
          {product.codigo && (
            <div>
              <Badge bg="outline-secondary" className="small">
                {product.codigo}
              </Badge>
            </div>
          )}
        </div>

        {/* Descripción si existe */}
        {(product.descripcion || product.notas) && (
          <p className="small text-muted text-center mb-3" style={{ fontSize: '0.8rem' }}>
            {product.descripcion || product.notas}
          </p>
        )}

        {/* Botones de acción */}
        <div className="mt-auto">
          <div className="d-grid gap-2">
            <Link to={`/products/edit/${product.id}`} state={{ product }}>
              <Button variant="outline-primary" size="sm" className="w-100">
                <i className="bi bi-pencil me-1"></i>
                {product.nombre ? 'Editar' : 'Completar'}
              </Button>
            </Link>
            
            <Button 
              variant="outline-warning" 
              size="sm"
              onClick={() => onManage(product)}
              className="w-100"
            >
              <i className="bi bi-gear me-1"></i>
              Gestionar
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;