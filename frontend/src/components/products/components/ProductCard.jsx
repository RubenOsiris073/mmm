import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../utils/categoryUtils';

const ProductCard = ({ product, onManage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);
  
  const currentStock = product.cantidad || product.stock || 0;
  const stockMinimo = product.stockMinimo || 5;
  
  // Función para obtener la URL de la imagen o usar la imagen por defecto
  const getImageUrl = () => {
    if (product.imageUrl || product.imagenURL) {
      return product.imageUrl || product.imagenURL;
    }
    return '/no-image.jpg';
  };
  
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
  
  // Generar clases dinámicas para efectos
  const cardClasses = [
    'h-100',
    'product-card',
    'premium-effect',
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
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <Card.Body className="d-flex flex-column">
        {/* Imagen del producto */}
        <div className="text-center mb-3">
          <Image 
            src={getImageUrl()}
            alt={product.nombre || 'Producto'}
            onError={(e) => {e.target.src = '/no-image.jpg'}}
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'cover', 
              borderRadius: '8px',
              marginBottom: '10px' 
            }}
          />
          <div className="product-category-icon">
            <span>
              {getCategoryIcon(product.categoria || product.category || 'sin-categoria')}
            </span>
          </div>
        </div>

        {/* Nombre del producto con tipografía empresarial */}
        <Card.Title className="product-title text-center text-capitalize">
          {product.nombre || product.name || product.label || 'Producto sin nombre'}
        </Card.Title>

        {/* Información del producto con diseño premium */}
        <div className="text-center mb-3">
          {product.precio && (
            <div className="mb-3">
              <Badge className="product-price-badge">
                <i className="bi bi-currency-dollar me-1"></i>
                ${parseFloat(product.precio).toFixed(2)}
              </Badge>
            </div>
          )}
          
          {/* Marca si existe */}
          {product.marca && (
            <div className="mb-2">
              <Badge className="product-brand-badge bg-secondary">
                <i className="bi bi-tag me-1"></i>
                {product.marca}
              </Badge>
            </div>
          )}
          
          <Badge className={`product-stock-badge ${stockStatus} d-block mb-2`}>
            <i className="bi bi-box me-1"></i>
            Stock: {currentStock} {product.unidadMedida || 'unidades'}
          </Badge>
          
          {/* Peso o volumen si existe */}
          {(product.peso || product.volumen) && (
            <div className="mb-2">
              <Badge className="product-weight-badge bg-info">
                <i className="bi bi-speedometer2 me-1"></i>
                {product.peso ? `Peso: ${product.peso}` : `Vol: ${product.volumen}`}
              </Badge>
            </div>
          )}
          
          {product.codigo && (
            <div className="mt-2">
              <Badge className="product-code-badge">
                <i className="bi bi-upc-scan me-1"></i>
                {product.codigo}
              </Badge>
            </div>
          )}
          
          {/* Categoría como badge pequeño */}
          {product.categoria && (
            <div className="mt-2">
              <Badge className="product-category-badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                <i className="bi bi-collection me-1"></i>
                {product.categoria}
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
            <Link to={`/products/edit/${product.id}`} state={{ product }}>
              <Button className="btn-edit-modern product-action-btn w-100">
                <i className="bi bi-pencil-square me-2"></i>
                {product.nombre ? 'EDITAR' : 'COMPLETAR'}
              </Button>
            </Link>
            
            <Button 
              className="btn-manage-modern product-action-btn w-100"
              onClick={() => onManage(product)}
            >
              <i className="bi bi-eye-fill me-2"></i>
              GESTIONAR
            </Button>
          </div>
        </div>

        {/* Indicador de categoría flotante */}
        <div 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: `var(--gradient-${product.categoria?.toLowerCase().replace(/\s+/g, '-').replace(/ñ/g, 'n') || 'sin-categoria'})`,
            opacity: isHovered ? 1 : 0.6,
            transition: 'var(--transition-smooth)',
            zIndex: 4
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default ProductCard;