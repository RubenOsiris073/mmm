import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { AnimatedMoneyIcon, AnimatedUserIcon } from './AnimatedIcons';
import './auth.css';

const AccessSelector = ({ onSelectAccess }) => {
  const accessOptions = [
    {
      id: 'pos',
      title: 'Punto de Venta',
      subtitle: 'Sistema de ventas y cobros',
      description: 'Acceso para operadores de caja y personal de ventas',
      icon: <AnimatedMoneyIcon size={24} />,
      btnClass: 'primary'
    },
    {
      id: 'admin',
      title: 'Administración',
      subtitle: 'Panel de control completo',
      description: 'Acceso completo para administradores del sistema',
      icon: <AnimatedUserIcon size={24} />,
      btnClass: 'danger'
    }
  ];

  return (
    <div className="auth-split-container">
      {/* Sección izquierda - Imagen */}
      <div className="auth-image-section">
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <h1>
            <span className="brand-text">
              FISGO<sup className="brand-registered">®</sup>
            </span>
          </h1>
          <p>Sistema de gestión automatizado</p>
        </div>
      </div>

      {/* Sección derecha - Selección de acceso */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-logo">
              <h1>Selecciona tu tipo de acceso</h1>
              <span className="auth-subtitle">Elige cómo deseas acceder al sistema</span>
            </div>
          </div>

          {/* Access Options */}
          <div className="access-options">
            {accessOptions.map((option) => (
              <div 
                key={option.id}
                className={`access-card ${option.btnClass}`}
                onClick={() => onSelectAccess(option.id)}
              >
                <div className="access-card-icon">
                  {option.icon}
                </div>
                <div className="access-card-content">
                  <h3>{option.title}</h3>
                  <p>{option.subtitle}</p>
                </div>
                <div className="access-card-arrow">
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