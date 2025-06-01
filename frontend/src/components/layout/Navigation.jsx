import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxes, FaStore, FaChartLine, FaPlus, FaCog, FaMoneyBillWave, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import './Navigation.css';

const Navigation = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <FaStore className="me-2" />
          Sistema de Productos
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/products">
              <FaBoxes className="me-1" />
              Productos
            </Nav.Link>
            
            <Nav.Link as={Link} to="/inventory">
              <FaCog className="me-1" />
              Inventario
            </Nav.Link>
            
            <Nav.Link as={Link} to="/sales">
              <FaChartLine className="me-1" />
              Ventas
            </Nav.Link>
          </Nav>
          
          <Nav>
            <button 
              className="theme-toggle me-3"
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDark ? <FaSun className="theme-toggle-icon" /> : <FaMoon className="theme-toggle-icon" />}
              <span className="d-none d-md-inline">
                {isDark ? 'Claro' : 'Oscuro'}
              </span>
            </button>

            <Nav.Link 
              as={Link} 
              to="/pos" 
              className="pos-button-modern"
            >
              <FaMoneyBillWave className="pos-icon" />
              <span className="pos-text">Punto de Venta</span>
            </Nav.Link>
            
            <NavDropdown title="Acciones" id="actions-dropdown">
              <NavDropdown.Item as={Link} to="/products/new">
                <FaPlus className="me-1" />
                Nuevo Producto
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;