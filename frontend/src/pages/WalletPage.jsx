import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import WalletView from '../components/wallet/WalletView';

const WalletPage = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h1>Control de Inventario</h1>
          <p className="text-muted">
            Administra el inventario de productos y visualiza transacciones recientes
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body style={{ backgroundColor: 'white' }}>
              <WalletView />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default WalletPage;