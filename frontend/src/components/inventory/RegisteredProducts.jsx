import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import ProductGrid from '../products/ProductGrid';
import { getProducts } from '../../services/storageService';

const RegisteredProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegisteredProducts = async () => {
      try {
        setLoading(true);
        // Obtener productos registrados manualmente desde la colección "products"
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        console.error("Error al cargar productos registrados:", err);
        setError("No se pudieron cargar los productos registrados. Intente nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredProducts();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card>
      <Card.Header>
        <h4>Productos Registrados</h4>
        <p className="text-muted mb-0">
          Productos registrados manualmente en el sistema
        </p>
      </Card.Header>
      <Card.Body>
        <ProductGrid products={products} loading={loading} />
      </Card.Body>
    </Card>
  );
};

export default RegisteredProducts;