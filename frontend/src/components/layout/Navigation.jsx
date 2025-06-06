import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxes, FaStore, FaChartLine, FaPlus, FaCog, FaMoneyBillWave, FaSun, FaMoon, FaBuilding } from 'react-icons/fa';
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
            
            <Nav.Link as={Link} to="/proveedores">
              <FaBuilding className="me-1" />
              Proveedores
            </Nav.Link>
            
            <NavDropdown title={<><FaPlus className="me-1" />Agregar</>} id="add-dropdown">
              <NavDropdown.Item as={Link} to="/products/new">
                <FaPlus className="me-2" />
                Nuevo Producto
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/proveedores">
                <FaBuilding className="me-2" />
                Gestión de Proveedores
              </NavDropdown.Item>
            </NavDropdown>
            
            <Nav.Link as={Link} to="/pos">
              <FaMoneyBillWave className="me-1" />
              Punto de Venta
            </Nav.Link>
            
            <Nav.Link as={Link} to="/sales">
              <FaChartLine className="me-1" />
              Ventas
            </Nav.Link>
          </Nav>
          
          <Nav>
            <Nav.Link as={Link} to="/camera">
              <FaCog className="me-1" />
              Cámara
            </Nav.Link>
            
            {/* Botón de cambio de tema */}
            <button 
              className="theme-toggle ms-2" 
              onClick={toggleTheme}
              aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
            >
              {isDark ? <FaSun className="theme-toggle-icon" /> : <FaMoon className="theme-toggle-icon" />}
              {isDark ? 'Claro' : 'Oscuro'}
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;