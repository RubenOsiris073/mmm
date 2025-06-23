import React from 'react';
import { FaMoneyBillWave, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import './auth.css';

const AccessSelector = ({ onSelectAccess }) => {
  const accessOptions = [
    {
      id: 'pos',
      title: 'Punto de Venta',
      subtitle: 'Sistema de ventas y cobros',
      description: 'Acceso para operadores de caja y personal de ventas',
      icon: <FaMoneyBillWave size={24} className="icon-color" />,
      btnClass: 'primary'
    },
    {
      id: 'admin',
      title: 'Administración',
      subtitle: 'Panel de control completo',
      description: 'Acceso completo para administradores del sistema',
      icon: <FaShieldAlt size={24} className="icon-color" />,
      btnClass: 'danger'
    }
  ];

  return (
    <div className="auth-split-container">
      {/* Left side - Image */}
      <div className="auth-image-side">
        <div className="auth-image-overlay">
          <div className="auth-welcome-text">
            <h2>MMM Aguachile</h2>
            <p>Sistema de gestión empresarial</p>
          </div>
        </div>
      </div>

      {/* Right side - Selection */}
      <div className="auth-form-side">
        <div className="auth-form-content">
          <div className="auth-header-section">
            <h2>Selecciona tu tipo de acceso</h2>
            <p>Elige cómo deseas acceder al sistema</p>
          </div>

          {/* Access Options */}
          <div className="auth-access-options">
            {accessOptions.map((option) => (
              <div 
                key={option.id}
                className="auth-access-card"
                onClick={() => onSelectAccess(option.id)}
              >
                <div className={`auth-icon-container ${option.btnClass}`}>
                  {option.icon}
                </div>
                <div className="auth-option-content">
                  <h3>{option.title}</h3>
                  <p>{option.subtitle}</p>
                </div>
                <div className="auth-option-arrow">
                  <FaArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessSelector;