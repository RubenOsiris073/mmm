// frontend/src/components/layout/POSLayout.jsx
import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { FaMoneyBillWave, FaUser, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const POSLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="pos-layout d-flex flex-column min-vh-100" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)' 
    }}>
      <Navbar bg="primary" variant="dark" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            <FaMoneyBillWave className="me-2" />
            Sistema Punto de Venta
          </Navbar.Brand>
          
          <Nav className="ms-auto d-flex align-items-center">
            {/* Información del usuario */}
            {user && (
              <div className="d-flex align-items-center me-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="rounded-circle me-2" 
                    style={{ width: '32px', height: '32px' }}
                  />
                ) : (
                  <FaUser className="me-2 text-white" />
                )}
                <div className="text-white">
                  <small className="d-block fw-semibold">
                    {user.displayName || user.email}
                  </small>
                  <small className="text-light opacity-75">
                    Operador
                  </small>
                </div>
              </div>
            )}

            {/* Botón de cambio de tema - MISMO ESTILO QUE NAVIGATION */}
            <button 
              className="theme-toggle me-3" 
              onClick={toggleTheme}
              aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
            >
              {isDark ? <FaSun className="theme-toggle-icon" /> : <FaMoon className="theme-toggle-icon" />}
              {isDark ? 'Claro' : 'Oscuro'}
            </button>

            {/* Dropdown de usuario */}
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-light" 
                id="user-dropdown"
                className="border-0"
              >
                <FaUser className="me-1" />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={handleSignOut} className="text-danger">
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* CONTENIDO CON FONDO QUE RESPETA EL TEMA - SIN PADDING */}
      <div className="pos-content flex-grow-1 px-0" style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)',
        minHeight: 'calc(100vh - 120px)' 
      }}>
        {children}
      </div>

      <footer className="bg-dark text-light py-2">
        <Container fluid>
          <div className="text-center">
            <small>© {new Date().getFullYear()} Monkey Technologies. Todos los derechos reservados.</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default POSLayout;