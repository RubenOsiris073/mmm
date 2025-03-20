import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CameraView from '../components/camera/CameraView';

const CameraPage = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Detección de Objetos en Tiempo Real</h1>
          <p className="text-center text-muted">
            Muestra un objeto a la cámara para identificarlo automáticamente
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <CameraView />
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-center mb-5">
            <Link to="/products">
              <Button variant="primary" size="lg">
                Ver Lista de Productos Detectados
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CameraPage;