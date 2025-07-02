import React, { useState, useMemo } from 'react';
import { Row, Col, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { 
  FaSearch, 
  FaUtensils, 
  FaWineBottle, 
  FaTshirt, 
  FaLaptop, 
  FaMobile, 
  FaShoppingBag,
  FaBox,
  FaBoxOpen
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductList = ({ products, loading, searchTerm, setSearchTerm, addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Calcular categorías con conteos
  const categories = useMemo(() => {
    const categoryCounts = products.reduce((acc, product) => {
      const category = product.categoria || 'otros';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryList = [
      { key: 'todos', name: 'Todos', count: products.length },
      ...Object.entries(categoryCounts).map(([key, count]) => ({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        count
      }))
    ];

    return categoryList;
  }, [products]);

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => 
        (product.categoria || 'otros') === selectedCategory
      );
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);{ useState, useMemo } from 'react';
import { Row, Col, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { 
  FaSearch, 
  FaUtensils, 
  FaWineBottle, 
  FaTshirt, 
  FaLaptop, 
  FaMobile, 
  FaShoppingBag,
  FaBox,
  FaBoxOpen
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductList = ({ products, loading, searchTerm, setSearchTerm, addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Obtener categorías únicas de los productos
  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    const categoryCount = products.reduce((acc, product) => {
      const category = product.categoria || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    const allCategories = [
      { key: 'all', name: 'Todos', count: products.length },
      ...Object.entries(categoryCount).map(([name, count]) => ({
        key: name.toLowerCase(),
        name,
        count
      }))
    ];
    
    return allCategories;
  }, [products]);
  
  // Filtrar productos por categoría seleccionada
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    let filtered = products;
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        (product.categoria || 'Sin categoría').toLowerCase() === selectedCategory
      );
    }
    
    // Filtrar por búsqueda
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.nombre?.toLowerCase().includes(searchLower) ||
        product.categoria?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // Determinar el icono basado en la categoría
  const getCategoryIcon = (category) => {
    const normalizedCategory = (category || "").toLowerCase();
    
    const iconSize = 24;
    
    switch (normalizedCategory) {
      case 'alimentos':
      case 'alimentos instantáneos':
        return <FaUtensils size={iconSize} className="text-success" />;
      case 'bebidas':
        return <FaWineBottle size={iconSize} className="text-primary" />;
      case 'ropa':
        return <FaTshirt size={iconSize} className="text-info" />;
      case 'electrónicos':
      case 'electronicos':
        return <FaLaptop size={iconSize} className="text-warning" />;
      case 'móviles':
      case 'moviles':
        return <FaMobile size={iconSize} className="text-danger" />;
      default:
        return <FaShoppingBag size={iconSize} className="text-secondary" />;
    }
  };
  
  // Determinar clase CSS para el stock
  const getStockClass = (stock) => {
    if (stock <= 0) return 'text-danger fw-bold';
    if (stock <= 5) return 'text-warning fw-bold';
    return 'text-success fw-bold';
  };
  
  // Manejar agregar al carrito
  const handleAddToCart = (product) => {
    if (product && typeof addToCart === 'function') {
      // Verificar stock
      const stockDisponible = product.cantidad !== undefined ? 
        product.cantidad : (product.stock || 0);
        
      if (stockDisponible <= 0) {
        toast.error(`${product.nombre}: Sin stock disponible`);
        return;
      }
      
      // Añadir al carrito y mostrar toast
      addToCart(product);
      
      // Mostrar notificación
      toast.success(`${product.nombre} añadido al carrito`, {
        position: "bottom-right",
        autoClose: 2000
      });
    }
  };
  
  return (
    <div className="products-grid-container">
      {/* Barra de búsqueda */}
      <InputGroup className="mb-3">
        <InputGroup.Text>
          <FaSearch size={16} />
        </InputGroup.Text>
        <Form.Control
          placeholder="Buscar productos..."
          value={searchTerm || ''}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <Button 
            variant="outline-secondary" 
            onClick={() => setSearchTerm('')}
          >
            ×
          </Button>
        )}
      </InputGroup>
      
      {/* Pestañas de categorías */}
      <div className="category-tabs mb-4">
        {categories.map(category => (
          <div
            key={category.key}
            className={`category-tab ${selectedCategory === category.key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.key)}
          >
            {category.name}
            <span className="category-count">{category.count}</span>
          </div>
        ))}
      </div>
      
      {/* Grid de productos */}
      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Cargando productos...</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const stockDisponible = product.cantidad !== undefined ? 
                product.cantidad : (product.stock || 0);
              const stockClass = getStockClass(stockDisponible);
              
              return (
                <div 
                  key={product.id}
                  className="product-card-modern"
                  onClick={() => stockDisponible > 0 && handleAddToCart(product)}
                >
                  <div className="product-image-placeholder">
                    {product.imagen ? (
                      <img 
                        src={product.imagen} 
                        alt={product.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ display: product.imagen ? 'none' : 'flex' }}>
                      {getCategoryIcon(product.categoria)}
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <div className="product-name">{product.nombre}</div>
                    <div className={`product-stock ${stockClass}`}>
                      {stockDisponible > 0 ? `${stockDisponible} disponibles` : 'Sin stock'}
                    </div>
                    <div className="product-price">${product.precio?.toFixed(2)}</div>
                    
                    <button 
                      className="add-product-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stockDisponible > 0) handleAddToCart(product);
                      }}
                      disabled={stockDisponible <= 0}
                    >
                      {stockDisponible > 0 ? 'Agregar al carrito' : 'Sin stock'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-5 col-span-full">
              <p>No hay productos disponibles{searchTerm ? ' para esta búsqueda' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;