import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../utils/categoryUtils';

const ProductCard = ({ product, onManage }) => {
  const currentStock = product.cantidad || product.stock || 0;
  const stockMinimo = product.stockMinimo || 5; // Valor por defecto si no está definido
  
  // Determinar el color del badge según el stock y stockMinimo
  const getStockBadgeVariant = (stock, minimo) => {
    if (stock === 0) return 'secondary'; // Sin stock
    if (stock <= minimo) return 'danger'; // Stock crítico (menor o igual al mínimo)
    if (stock <= minimo * 2) return 'warning'; // Stock bajo (hasta el doble del mínimo)
    return 'success'; // Stock normal
  };

  const stockStatus = getStockBadgeVariant(currentStock, stockMinimo);

  return (
    <Card className="h-100 product-card shadow-sm">
      <Card.Body className="d-flex flex-column">
        <div className="product-icon mb-3 text-center fs-1">
          {getCategoryIcon(product.categoria || 'sin-categoria')}
        </div>
        
        <Card.Title className="text-capitalize text-center mb-2" title={product.nombre || product.label}>
          {(product.nombre || product.label || 'Producto sin nombre').length > 20 
            ? `${(product.nombre || product.label || 'Producto sin nombre').substring(0, 20)}...`
            : (product.nombre || product.label || 'Producto sin nombre')
          }
        </Card.Title>
        
        <Card.Text as="div" className="small text-muted flex-grow-1 text-center">
          {product.descripcion || product.notas || 
            `Producto detectado automáticamente`}
        </Card.Text>
        
        <div className="mt-3 text-center">
          <Badge 
            bg={stockStatus}
            className="me-2 mb-2"
          >
            Stock: {currentStock} {product.unidadMedida || 'unidades'}
          </Badge>
          
          {/* Mostrar alerta de stock mínimo si aplica */}
          {currentStock <= stockMinimo && currentStock > 0 && (
            <Badge bg="warning" className="me-2 mb-2">
              ⚠️ Mín: {stockMinimo}
            </Badge>
          )}
          
          {currentStock === 0 && (
            <Badge bg="danger" className="me-2 mb-2">
              🚫 Sin stock
            </Badge>
          )}
          
          {product.precio && (
            <Badge bg="info" className="me-2 mb-2">
              ${parseFloat(product.precio).toFixed(2)}
            </Badge>
          )}
          
          {product.categoria && (
            <Badge bg="outline-secondary" className="mb-2">
              {product.categoria}
            </Badge>
          )}
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-light border-top-0 d-flex gap-2">
        <Link 
          to={`/products/edit/${product.id}`}
          state={{ product }}
          className="flex-fill"
        >
          <Button variant="outline-primary" size="sm" className="w-100">
            <i className="bi bi-pencil me-1"></i>
            {product.nombre ? 'Editar' : 'Completar'}
          </Button>
        </Link>
        
        <Button 
          variant="outline-warning" 
          size="sm" 
          className="flex-fill"
          onClick={() => onManage(product)}
        >
          <i className="bi bi-gear me-1"></i>
          Gestionar
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;