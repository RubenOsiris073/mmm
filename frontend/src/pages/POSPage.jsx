import React from 'react';
import { Row, Col } from 'react-bootstrap';
import POSView from '../components/pos/POSView';

const POSPage = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h1>Punto de Venta</h1>
          <p className="text-muted">
            Sistema de venta con detección automática de productos
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <POSView />
        </Col>
      </Row>
    </>
  );
};

export default POSPage;