import React from 'react';
import { Row, Col } from 'react-bootstrap';
import SalesHistory from '../components/sales/SalesHistory';

const SalesPage = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h1>Historial de Ventas</h1>
          <p className="text-muted">
            Consulta y gestión de ventas realizadas
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <SalesHistory />
        </Col>
      </Row>
    </>
  );
};

export default SalesPage;