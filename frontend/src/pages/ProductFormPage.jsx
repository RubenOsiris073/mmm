import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProductDetailForm from '../components/products/ProductDetailForm';
import '../styles/pages/products.css';

const ProductFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Obtener el producto preseleccionado si viene desde otra página
  const preselectedProduct = location.state?.product || null;
  
  const handleSuccess = () => {
    // Navegar a la lista de productos después de guardar exitosamente
    navigate('/products', { 
      state: { 
        successMessage: 'Producto registrado correctamente'
      } 
    });
  };

  return (
    <div className="product-page-wrapper">
      <Row className="mb-4">
        <Col lg={10} className="mx-auto d-flex justify-content-between align-items-center">
          <h1 style={{ 
            marginTop: '0',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            {preselectedProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
          </h1>
          <div>
            <Link to="/products" className="me-2">
              <Button variant="outline-secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <ProductDetailForm 
                initialProduct={preselectedProduct}
                onSuccess={handleSuccess}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductFormPage;