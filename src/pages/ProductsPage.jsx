import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import { getDetections, getRegisteredProducts } from '../services/storageService';

const ProductsPage = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Capturar mensaje de éxito si viene de la página de formulario
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Limpiar el estado después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDetections();
        setDetections(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1>Lista de Productos Detectados</h1>
          <div>
            <Link to="/" className="me-2">
              <Button variant="outline-secondary">
                Volver a la Cámara
              </Button>
            </Link>
            <Link to="/product-form">
              <Button variant="primary">
                + Agregar Producto
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      {successMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
              {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <ProductList products={detections} loading={loading} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductsPage;