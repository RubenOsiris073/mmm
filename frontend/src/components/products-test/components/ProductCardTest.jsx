import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../utils/categoryUtils';

const ProductCardTest = ({ product, onManage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);
  
  const currentStock = product.cantidad || product.stock || 0;
  const stockMinimo = product.stockMinimo || 5;
  
  // Determinar el estado del stock con la nueva paleta empresarial
  const getStockStatus = (stock, minimo) => {
    if (stock === 0) return 'stock-vacio';
    if (stock <= minimo) return 'stock-bajo';
    if (stock <= minimo * 2) return 'stock-medio';
    return 'stock-alto';
  };

  // Obtener clase de categoría para los gradientes empresariales
  const getCategoryClass = (categoria) => {
    const categoryMap = {
      'Bebidas': 'category-bebidas',
      'Snacks y Botanas': 'category-snacks',
      'Dulces y Chocolates': 'category-dulces',
      'Panadería y Galletas': 'category-panaderia',
      'Enlatados y Conservas': 'category-enlatados',
      'Abarrotes Básicos': 'category-abarrotes',
      'Aceites y Condimentos': 'category-aceites',
      'Alimentos Instantáneos': 'category-instantaneos',
      'Bebidas Calientes': 'category-bebidas-calientes',
      'Productos de Limpieza': 'category-limpieza',
      'Cuidado Personal': 'category-cuidado-personal'
    };
    return categoryMap[categoria] || 'category-sin-categoria';
  };

  // Determinar si es producto destacado (stock bajo o alto valor)
  const isFeatured = () => {
    const precio = parseFloat(product.precio) || 0;
    return currentStock <= stockMinimo || precio > 50;
  };

  // Determinar si aplicar efectos premium
  const isPremium = () => {
    const precio = parseFloat(product.precio) || 0;
    return precio > 30 || product.nombre?.toLowerCase().includes('premium');
  };

  const stockStatus = getStockStatus(currentStock, stockMinimo);
  const categoryClass = getCategoryClass(product.categoria || product.category);
  
  // Generar clases dinámicas para efectos + indicador de testing
  const cardClasses = [
    'h-100',
    'product-card',
    'premium-effect',
    'testing-card', // Clase especial para testing
    categoryClass,
    isFeatured() ? 'featured' : '',
    isPremium() ? 'premium-particles glow' : ''
  ].filter(Boolean).join(' ');

  useEffect(() => {
    // Establecer delay de animación aleatorio para efecto escalonado
    setAnimationDelay(Math.random() * 0.5);
  }, []);

  return (
    <Card 
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        animationDelay: `${animationDelay}s`,
        // Borde especial para testing
        borderLeft: isHovered ? '4px solid #0dcaf0' : '4px solid transparent'
      }}
    >
      {/* Banner de testing flotante */}
      <div 
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 10,
          background: 'linear-gradient(135deg, #0dcaf0, #17a2b8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.65rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          opacity: isHovered ? 1 : 0.8,
          transition: 'all 0.3s ease'
        }}
      >
        🧪 Test
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Icono de categoría con gradiente empresarial */}
        <div className="text-center mb-3">
          <div className="product-category-icon">
            <span>
              {getCategoryIcon(product.categoria || product.category || 'sin-categoria')}
            </span>
          </div>
        </div>

        {/* Nombre del producto con tipografía empresarial */}
        <Card.Title className="product-title text-center text-capitalize">
          {product.nombre || product.name || product.label || 'Producto sin nombre'}
          {/* Badge de testing en el título */}
          <div className="mt-1">
            <Badge 
              bg="info" 
              className="small"
              style={{ fontSize: '0.6rem' }}
            >
              TESTING
            </Badge>
          </div>
        </Card.Title>

        {/* Información del producto con diseño premium */}
        <div className="text-center mb-3">
          {product.precio && (
            <div className="mb-3">
              <Badge className="product-price-badge">
                ${parseFloat(product.precio).toFixed(2)}
              </Badge>
            </div>
          )}
          
          <Badge className={`product-stock-badge ${stockStatus} d-block mb-2`}>
            Stock: {currentStock} {product.unidadMedida || 'unidades'}
          </Badge>
          
          {product.codigo && (
            <div className="mt-2">
              <Badge className="product-code-badge">
                {product.codigo}
              </Badge>
            </div>
          )}
        </div>

        {/* Descripción con estilo empresarial */}
        {(product.descripcion || product.notas) && (
          <p className="small text-muted text-center mb-3" style={{ 
            fontSize: '0.85rem',
            lineHeight: '1.4',
            color: 'var(--enterprise-neutral-600)' 
          }}>
            {(product.descripcion || product.notas).substring(0, 80)}
            {(product.descripcion || product.notas).length > 80 ? '...' : ''}
          </p>
        )}

        {/* Indicadores adicionales para productos premium */}
        {isFeatured() && (
          <div className="text-center mb-2">
            <Badge 
              style={{ 
                background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                color: 'white',
                fontSize: '0.7rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              {currentStock <= stockMinimo ? '⚠️ STOCK BAJO' : '⭐ PREMIUM'}
            </Badge>
          </div>
        )}

        {/* Botones de acción empresariales con microinteracciones */}
        <div className="mt-auto">
          <div className="d-grid gap-3">
            <Link to={`/products-test/edit/${product.id}`} state={{ product }}>
              <Button className="btn-edit-modern product-action-btn w-100">
                <i className="bi bi-pencil-square me-2"></i>
                {product.nombre ? 'EDITAR TEST' : 'COMPLETAR TEST'}
              </Button>
            </Link>
            
            <Button 
              className="btn-manage-modern product-action-btn w-100"
              onClick={() => onManage(product)}
            >
              <i className="bi bi-gear-fill me-2"></i>
              GESTIONAR TEST
            </Button>
          </div>
        </div>

        {/* Indicador de categoría flotante con efecto testing */}
        <div 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isHovered 
              ? 'linear-gradient(135deg, #0dcaf0, #17a2b8)' 
              : `var(--gradient-${product.categoria?.toLowerCase().replace(/\s+/g, '-').replace(/ñ/g, 'n') || 'sin-categoria'})`,
            opacity: isHovered ? 1 : 0.6,
            transition: 'var(--transition-smooth)',
            zIndex: 4,
            boxShadow: isHovered ? '0 0 10px rgba(13, 202, 240, 0.5)' : 'none'
          }}
        />

        {/* Efecto de testing: línea punteada en la parte inferior */}
        <div 
          style={{
            position: 'absolute',
            bottom: '0',
            left: '1rem',
            right: '1rem',
            height: '2px',
            background: 'repeating-linear-gradient(90deg, #0dcaf0 0, #0dcaf0 5px, transparent 5px, transparent 10px)',
            opacity: isHovered ? 0.8 : 0.4,
            transition: 'var(--transition-smooth)'
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default ProductCardTest;