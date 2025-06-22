import React from 'react';
import { Button } from 'react-bootstrap';
import { FaMoneyBillWave, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

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
    <div className="login-split-container">
      {/* Left side - Image */}
      <div className="login-image">
        <div className="overlay">
          <div className="welcome-text">
            <h2>MMM Aguachile</h2>
            <p>Sistema de gestión empresarial</p>
          </div>
        </div>
      </div>

      {/* Right side - Selection */}
      <div className="login-form">
        <div className="login-content">
          <div className="header-section">
            <h2>Selecciona tu tipo de acceso</h2>
            <p>Elige cómo deseas acceder al sistema</p>
          </div>

          {/* Access Options */}
          <div className="access-options">
            {accessOptions.map((option) => (
              <div 
                key={option.id}
                className="access-card"
                onClick={() => onSelectAccess(option.id)}
              >
                <div className={`icon-container ${option.btnClass}`}>
                  {option.icon}
                </div>
                <div className="option-content">
                  <h3>{option.title}</h3>
                  <p>{option.subtitle}</p>
                </div>
                <div className="option-arrow">
                  <FaArrowRight />
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="divider my-4">
            <span>o inicia con</span>
          </div>

          {/* Google Button */}
          <Button className="google-btn">
            <FcGoogle size={20} className="me-2" />
            <span>Google</span>
          </Button>

          <div className="text-center mt-4">
            <p className="helper-text">
              ¿No tienes acceso? <button type="button" className="text-link" onClick={() => alert('Contacta al administrador del sistema')}>Contacta al administrador</button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-split-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .login-image {
          flex: 1;
          background-image: url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80');
          background-size: cover;
          background-position: center;
          display: none;
        }

        .overlay {
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7));
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }

        .welcome-text {
          color: white;
        }

        .welcome-text h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .welcome-text p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .login-form {
          flex: 1;
          background-color: #f1f3f6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-content {
          width: 100%;
          max-width: 420px;
        }

        .header-section {
          margin-bottom: 2rem;
          text-align: center;
        }

        .header-section h2 {
          font-weight: 700;
          font-size: 1.75rem;
          color: #212529;
          margin-bottom: 0.5rem;
        }

        .header-section p {
          color: #495057;
          margin-bottom: 0;
        }

        .access-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .access-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          background-color: white;
          border-radius: 0.5rem;
          border: 1px solid #dee2e6;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }

        .access-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-color: #ced4da;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 0.375rem;
          margin-right: 1rem;
        }

        .icon-container.primary {
          background-color: rgba(13, 110, 253, 0.1);
        }

        .icon-container.danger {
          background-color: rgba(220, 53, 69, 0.1);
        }

        .primary .icon-color {
          color: #0d6efd;
        }

        .danger .icon-color {
          color: #dc3545;
        }

        .option-content {
          flex: 1;
        }

        .option-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #212529;
        }

        .option-content p {
          font-size: 0.875rem;
          color: #495057;
          margin: 0;
        }

        .option-arrow {
          color: #6c757d;
          margin-left: 0.5rem;
          transition: transform 0.2s ease;
        }

        .access-card:hover .option-arrow {
          transform: translateX(3px);
          color: #495057;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #495057;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #dee2e6;
        }

        .divider::before {
          margin-right: 1rem;
        }

        .divider::after {
          margin-left: 1rem;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          background-color: #fff !important;
          color: #212529 !important;
          border: 1px solid #ced4da !important;
          border-radius: 0.375rem !important;
          padding: 0.6rem 2rem !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }

        .google-btn:hover {
          background-color: #f8f9fa !important;
          border-color: #ced4da !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
        }

        .helper-text {
          color: #495057;
          font-size: 0.875rem;
        }

        .text-link {
          color: #0d6efd;
          text-decoration: none;
          font-weight: 500;
        }

        .text-link:hover {
          text-decoration: underline;
        }

        @media (min-width: 992px) {
          .login-image {
            display: block;
          }
        }

        @media (max-width: 576px) {
          .login-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AccessSelector;