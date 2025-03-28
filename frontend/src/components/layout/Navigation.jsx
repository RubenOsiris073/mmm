import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Sistema F.I.S.G.O
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
            >
              Punto de Venta
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/product-form" 
              active={location.pathname === '/product-form'}
            >
              Nuevo Producto
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/products" 
              active={location.pathname === '/products'}
            >
              Productos
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/wallet" 
              active={location.pathname === '/wallet'}
            >
              Inventario
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/sales" 
              active={location.pathname === '/sales'}
            >
              Ventas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;