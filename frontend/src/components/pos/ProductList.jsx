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
      ...Object.entries(categoryCounts).map(([name, count]) => ({
        key: name,
        name,
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
  }, [products, selectedCategory, searchTerm]);

  const getCategoryIcon = (category) => {
    const icons = {
      'comida': FaUtensils,
      'bebidas': FaWineBottle,
      'ropa': FaTshirt,
      'electrónicos': FaLaptop,
      'móviles': FaMobile,
      'accesorios': FaShoppingBag,
      'otros': FaBox
    };
    const IconComponent = icons[category.toLowerCase()] || FaBoxOpen;
    return <IconComponent />;
  };

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
      toast.success(`${product.nombre} agregado al carrito`);
    } else {
      toast.error('Producto sin stock');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Filtros de categoría */}
      <div className="mb-4">
        <Row className="g-2">
          {categories.map((category) => (
            <Col key={category.key} xs={6} sm={4} md={3} lg={2}>
              <Button
                variant={selectedCategory === category.key ? 'primary' : 'outline-primary'}
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ minHeight: '50px' }}
                onClick={() => setSelectedCategory(category.key)}
              >
                <div className="text-center">
                  <div className="mb-1">
                    {getCategoryIcon(category.name)}
                  </div>
                  <small>
                    {category.name} ({category.count})
                  </small>
                </div>
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* Lista de productos */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card-modern">
              <div className="product-image-placeholder">
                 {/* You might want to replace this with an actual image */}
                 {/* <img src={product.imagen || '/no-image.jpg'} alt={product.nombre} className="product-image" />*/}
                 <FaBoxOpen /> {/* Placeholder icon */}
              </div>

              <div className="product-info">
                <div className="product-name" title={product.nombre}>
                  {product.nombre.length > 30
                    ? `${product.nombre.substring(0, 30)}...`
                    : product.nombre
                  }
                </div>

                <div className="product-stock text-muted">
                  Stock: {product.stock || 0}
                </div>

                <div className="product-price">
                  ${parseFloat(product.precio || 0).toFixed(2)}
                </div>


                    <Button
                      variant={product.stock > 0 ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-100"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                    </Button>
                  </div>
                </div>
              ))
        ) : (
          <div className="col-span-full text-center p-5">
            <FaBoxOpen size={64} className="text-muted mb-3" />
            <p className="text-muted">
              No hay productos disponibles{searchTerm ? ' para esta búsqueda' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;