import React, { useState } from 'react';
import { Container, Tab, Nav, Card } from 'react-bootstrap';
import ManualEntry from './ManualEntry';
import AutomaticEntry from './AutomaticEntry';
import AIDetectionEntry from './AIDetectionEntry'; // Nueva importación
import './Inventory.css';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Gestión de Inventario</h2>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="manual">
                  <i className="bi bi-pencil-square me-2"></i>
                  Registro Manual
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="automatic">
                  <i className="bi bi-upc-scan me-2"></i>
                  Registro con Código
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="ai">
                  <i className="bi bi-camera me-2"></i>
                  Registro con IA
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content>
              <Tab.Pane eventKey="manual">
                <ManualEntry />
              </Tab.Pane>
              <Tab.Pane eventKey="automatic">
                <AutomaticEntry />
              </Tab.Pane>
              <Tab.Pane eventKey="ai">
                <AIDetectionEntry />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Inventory;