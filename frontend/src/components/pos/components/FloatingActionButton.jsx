import React, { useState } from 'react';
import { FaUser, FaSignOutAlt, FaSun, FaMoon, FaCog, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProductVisibility } from '../../../contexts/ProductVisibilityContext';
import '../styles/FloatingActionButton.css';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showProductList, toggleProductList } = useProductVisibility();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsOpen(false);
  };

  const handleVisibilityToggle = () => {
    toggleProductList();
    setIsOpen(false);
  };

  const handleUserInfo = () => {
    const userName = getUserDisplayName();
    toast.info(`Usuario actual: ${userName}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    setIsOpen(false);
  };

  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  return (
    <div className="floating-action-container">
      <input 
        type="checkbox" 
        id="fab-toggle" 
        checked={isOpen}
        onChange={(e) => setIsOpen(e.target.checked)}
      />
      
      <label htmlFor="fab-toggle" className="fab-main">
        <FaPlus className="fab-icon" />
      </label>

      <div className={`fab-menu ${isOpen ? 'fab-menu-open' : ''}`}>
        {/* Usuario Info */}
        <div 
          className="fab-item fab-user" 
          onClick={handleUserInfo}
          title={getUserDisplayName()}
        >
          <FaUser className="fab-item-icon" />
          <span className="fab-tooltip">{getUserDisplayName()}</span>
        </div>

        {/* Tema */}
        <div 
          className="fab-item fab-theme" 
          onClick={handleThemeToggle}
          title={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
        >
          {isDark ? <FaSun className="fab-item-icon" /> : <FaMoon className="fab-item-icon" />}
          <span className="fab-tooltip">{isDark ? 'Tema Claro' : 'Tema Oscuro'}</span>
        </div>

        {/* Visibilidad */}
        <div 
          className="fab-item fab-visibility" 
          onClick={handleVisibilityToggle}
          title={`Cambiar a ${showProductList ? 'oculto' : 'visible'}`}
        >
          {showProductList ? <FaEye className="fab-item-icon" /> : <FaEyeSlash className="fab-item-icon" />}
          <span className="fab-tooltip">{showProductList ? 'Ocultar' : 'Mostrar'}</span>
        </div>

        {/* Configuración */}
        <div className="fab-item fab-settings" title="Configuración">
          <FaCog className="fab-item-icon" />
          <span className="fab-tooltip">Configuración</span>
        </div>

        {/* Cerrar Sesión */}
        <div 
          className="fab-item fab-logout" 
          onClick={handleSignOut}
          title="Cerrar Sesión"
        >
          <FaSignOutAlt className="fab-item-icon" />
          <span className="fab-tooltip">Cerrar Sesión</span>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionButton;