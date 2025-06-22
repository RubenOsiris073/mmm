import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBoxes, 
  FaStore, 
  FaChartLine, 
  FaCog, 
  FaMoneyBillWave, 
  FaSun, 
  FaMoon, 
  FaBuilding, 
  FaUser, 
  FaSignOutAlt,
  FaReceipt,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';

const Navigation = ({ onSidebarToggle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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

  // Verificar si un enlace está activo
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Función para manejar el toggle del sidebar
  const handleSidebarToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onSidebarToggle) {
      onSidebarToggle(newCollapsed);
    }
  };

  return (
    <div className={`sidebar-navigation ${collapsed ? 'collapsed' : ''}`}>
      {/* Header del Sidebar con Logo y Usuario */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {!collapsed ? (
            <>
              <FaStore className="sidebar-logo-icon" />
              <span className="sidebar-brand-text">Administracion</span>
            </>
          ) : (
            <FaStore className="sidebar-logo-icon-collapsed" />
          )}
        </div>
        
        {/* Perfil de usuario */}
        <div className="sidebar-user-profile">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Avatar" 
              className="sidebar-avatar"
            />
          ) : (
            <div className="sidebar-avatar-placeholder">
              <FaUser />
            </div>
          )}
          {!collapsed && (
            <div className="sidebar-user-info">
              <h6 className="sidebar-user-name">{getUserDisplayName()}</h6>
              <span className="sidebar-user-role">
                {user?.role || 'Usuario'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Menú Principal */}
      <Nav className="sidebar-menu">
        {/* Sección de navegación principal */}
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Principal</div>}
          
          <Nav.Link 
            as={Link} 
            to="/products" 
            className={`sidebar-menu-item ${isActive('/products') && !isActive('/products/new') ? 'active' : ''}`}
          >
            <FaBoxes className="sidebar-icon" />
            {!collapsed && <span>Productos</span>}
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/pos" 
            className={`sidebar-menu-item ${isActive('/pos') ? 'active' : ''}`}
          >
            <FaMoneyBillWave className="sidebar-icon" />
            {!collapsed && <span>Punto de Venta</span>}
          </Nav.Link>
        </div>
        
        {/* Sección de Order Process (según imagen POSLINE) */}
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Order Process</div>}
          
          <Nav.Link 
            as={Link} 
            to="/sales" 
            className={`sidebar-menu-item ${isActive('/sales') ? 'active' : ''}`}
          >
            <FaChartLine className="sidebar-icon" />
            {!collapsed && <span>Ventas</span>}
          </Nav.Link>
        </div>
        
        {/* Sección de Analytics (según imagen POSLINE) */}
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Analytics</div>}
          
          <Nav.Link 
            as={Link} 
            to="/proveedores" 
            className={`sidebar-menu-item ${isActive('/proveedores') ? 'active' : ''}`}
          >
            <FaBuilding className="sidebar-icon" />
            {!collapsed && <span>Proveedores</span>}
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/camera" 
            className={`sidebar-menu-item ${isActive('/camera') ? 'active' : ''}`}
          >
            <FaCog className="sidebar-icon" />
            {!collapsed && <span>Cámara</span>}
          </Nav.Link>
        </div>

        {/* Sección Manage Dish (según imagen POSLINE) */}
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Manage Dish</div>}
          
          <Nav.Link 
            as={Link} 
            to="/products/new" 
            className={`sidebar-menu-item ${isActive('/products/new') ? 'active' : ''}`}
          >
            <FaReceipt className="sidebar-icon" />
            {!collapsed && <span>Nuevo Producto</span>}
          </Nav.Link>
        </div>
      </Nav>
      
      {/* Footer del Sidebar */}
      <div className="sidebar-footer">
        <button 
          className="sidebar-theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
        >
          {isDark ? <FaSun className="sidebar-icon" /> : <FaMoon className="sidebar-icon" />}
          {!collapsed && <span>{isDark ? 'Tema Claro' : 'Tema Oscuro'}</span>}
        </button>
        
        <button 
          className="sidebar-logout" 
          onClick={handleLogout}
        >
          <FaSignOutAlt className="sidebar-icon" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
        
        {/* Botón para colapsar/expandir sidebar */}
        <button 
          className="sidebar-collapse-btn"
          onClick={handleSidebarToggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <FaArrowRight />
          ) : (
            <>
              <FaArrowLeft className="me-2" />
              <span>Contraer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navigation;