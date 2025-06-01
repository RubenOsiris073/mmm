// frontend/src/components/layout/POSLayout.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaHome } from 'react-icons/fa';

const POSLayout = ({ children }) => {
  return (
    <div className="pos-layout d-flex flex-column min-vh-100">
      <Navbar bg="primary" variant="dark" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            <FaMoneyBillWave className="me-2" />
            Sistema Punto de Venta
          </Navbar.Brand>
          
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="text-white">
              <FaHome className="me-1" />
              Sistema Principal
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <div className="pos-content flex-grow-1 bg-light">
        {children}
      </div>

      <footer className="bg-dark text-light py-2">
        <Container fluid>
          <div className="text-center">
            <small>POS - Punto de Venta © {new Date().getFullYear()}</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default POSLayout;