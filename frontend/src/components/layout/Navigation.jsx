import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BiStore, BiPackage, BiBarcode, BiBox, BiDollar } from 'react-icons/bi';

const Navigation = () => {
  const location = useLocation();

  // Función auxiliar para verificar si una ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Sistema F.I.S.G.O
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Punto de Venta */}
            <Nav.Link
              as={Link}
              to="/"
              active={isActive('/')}
              className="d-flex align-items-center"
            >
              <BiStore className="me-1" size={20} />
              <span>Punto de Venta</span>
            </Nav.Link>

            {/* Dropdown de Productos */}
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <BiPackage className="me-1" size={20} />
                  <span>Productos</span>
                </div>
              }
              id="productos-dropdown"
              active={['/products', '/product-form'].includes(location.pathname)}
            >
              <NavDropdown.Item as={Link} to="/products" active={isActive('/products')}>
                <BiBarcode className="me-1" size={18} />
                Lista de Productos
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/product-form" active={isActive('/product-form')}>
                <BiPackage className="me-1" size={18} />
                Nuevo Producto
              </NavDropdown.Item>
            </NavDropdown>

            {/* Dropdown de Inventario */}
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <BiBox className="me-1" size={20} />
                  <span>Inventario</span>
                </div>
              }
              id="inventario-dropdown"
              active={['/inventory'].includes(location.pathname)}
            >
              <NavDropdown.Item as={Link} to="/inventory?location=warehouse" active={isActive('/inventory') && location.search.includes('warehouse')}>
                <BiBox className="me-1" size={18} />
                Almacén Manual
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/inventory?location=bodega" active={isActive('/inventory') && location.search.includes('bodega')}>
                <BiBarcode className="me-1" size={18} />
                Bodega Automática
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/inventory" active={isActive('/inventory') && !location.search}>
                <BiListCheck className="me-1" size={18} />
                Ver Todo
              </NavDropdown.Item>
            </NavDropdown>
            
            {/* Ventas */}
            <Nav.Link
              as={Link}
              to="/sales"
              active={isActive('/sales')}
              className="d-flex align-items-center"
            >
              <BiDollar className="me-1" size={20} />
              <span>Ventas</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;