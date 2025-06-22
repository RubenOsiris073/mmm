import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ accessType = 'general', onBack, onLoginSuccess }) => {
  const { signInWithEmail, signInWithGoogle, error, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Configuración según el tipo de acceso
  const accessConfig = {
    pos: {
      title: 'Punto de Venta',
      subtitle: 'Acceso al sistema de ventas',
      redirectPath: '/pos',
    },
    admin: {
      title: 'Panel de Administración',
      subtitle: 'Gestión completa del sistema',
      redirectPath: '/products',
    },
    general: {
      title: 'Iniciar Sesión',
      subtitle: 'Acceso al sistema',
      redirectPath: '/',
    }
  };

  const config = accessConfig[accessType] || accessConfig.general;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      clearError();
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmail(formData.email, formData.password);
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate(config.redirectPath, { replace: true });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate(config.redirectPath, { replace: true });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error en login con Google:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Right side - Form */}
      <div className="login-form">
        <div className="login-content">
          {/* Back Button if needed */}
          {onBack && (
            <button className="back-link" onClick={onBack}>
              <FaArrowLeft className="me-2" />
              Volver a selección
            </button>
          )}

          <div className="header-section">
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={clearError} className="close-btn">×</button>
            </div>
          )}

          {/* Login Form */}
          <Form onSubmit={handleEmailLogin} className="login-form-inputs">
            <div className="form-floating mb-4">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                required
                disabled={isSubmitting || loading}
              />
              <label htmlFor="floatingEmail">Correo electrónico</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="floatingPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                disabled={isSubmitting || loading}
              />
              <label htmlFor="floatingPassword">Contraseña</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="d-flex mb-4 justify-content-between">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Recordarme
                </label>
              </div>
              <button type="button" className="forgot-link" onClick={() => alert('Funcionalidad de recuperación de contraseña próximamente')}>¿Olvidaste tu contraseña?</button>
            </div>

            <Button
              type="submit"
              className="login-btn w-100"
              disabled={isSubmitting || loading || !formData.email || !formData.password}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Form>

          {/* Divider */}
          <div className="divider my-4">
            <span>o inicia con</span>
          </div>

          {/* Google Button */}
          <Button 
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || loading}
          >
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

        .back-link {
          display: inline-flex;
          align-items: center;
          color: #495057;
          text-decoration: none;
          margin-bottom: 1.5rem;
          border: none;
          background: none;
          padding: 0;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .back-link:hover {
          color: #000;
          transform: translateX(-5px);
        }

        .header-section {
          margin-bottom: 2rem;
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

        .error-message {
          background-color: #f8d7da;
          color: #842029;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: none;
          border: none;
          color: #842029;
          font-size: 1.25rem;
          line-height: 1;
          opacity: 0.75;
        }

        .form-floating {
          position: relative;
        }

        .form-floating > .form-control {
          padding: 1rem 0.75rem;
          height: calc(3.5rem + 2px);
          line-height: 1.25;
          color: #212529;
          background-color: #fff;
        }

        .form-floating > label {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          padding: 1rem 0.75rem;
          pointer-events: none;
          border: 1px solid transparent;
          transform-origin: 0 0;
          transition: opacity .1s ease-in-out,transform .1s ease-in-out;
          color: #495057;
        }

        .form-floating > .form-control:focus ~ label,
        .form-floating > .form-control:not(:placeholder-shown) ~ label {
          opacity: .65;
          transform: scale(.85) translateY(-.5rem) translateX(.15rem);
        }
        
        .form-control {
          border-radius: 0.375rem;
          border: 1px solid #ced4da;
        }
        
        .form-control:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          border-color: #86b7fe;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #495057;
          cursor: pointer;
          z-index: 5;
        }

        .password-toggle:hover {
          color: #212529;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .form-check-label {
          color: #495057;
          font-size: 0.9rem;
        }

        .forgot-link {
          color: #0d6efd;
          text-decoration: none;
          font-size: 0.875rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-btn {
          background-color: #0d6efd;
          border: none;
          border-radius: 0.375rem;
          padding: 0.75rem;
          font-weight: 600;
          transition: all 0.3s ease;
          color: white;
        }

        .login-btn:hover:not(:disabled) {
          background-color: #0b5ed7;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
          background-color: #fff;
          color: #212529;
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          padding: 0.6rem 2rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .google-btn:hover:not(:disabled) {
          background-color: #f8f9fa;
          border-color: #ced4da;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

export default LoginForm;