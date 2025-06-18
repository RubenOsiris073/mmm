import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxes, FaStore, FaChartLine, FaPlus, FaCog, FaMoneyBillWave, FaSun, FaMoon, FaBuilding, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login'); // Redirigir al login después del logout
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para obtener el nombre a mostrar del usuario
  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Usar la parte antes del @ del email
    }
    return 'Usuario';
  };

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
            {/* Menú de usuario - A la izquierda de Cámara */}
            {isAuthenticated && (
              <NavDropdown 
                title={
                  <span className="user-menu-title d-flex align-items-center">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        className="rounded-circle me-2" 
                        style={{ width: '24px', height: '24px' }}
                      />
                    ) : (
                      <FaUser className="me-1" />
                    )}
                    {getUserDisplayName()}
                  </span>
                } 
                id="user-dropdown"
              >
                <NavDropdown.Item>
                  <div className="user-info d-flex align-items-center">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        className="rounded-circle me-2" 
                        style={{ width: '32px', height: '32px' }}
                      />
                    ) : (
                      <FaUser className="me-2" style={{ fontSize: '32px' }} />
                    )}
                    <div>
                      <small className="text-muted">Conectado como:</small>
                      <div>{user?.email}</div>
                    </div>
                  </div>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            )}

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