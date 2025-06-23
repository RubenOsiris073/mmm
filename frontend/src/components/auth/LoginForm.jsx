import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './auth.css';

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

      {/* Right side - Form */}
      <div className="auth-form-side">
        <div className="auth-form-content">
          {/* Back Button if needed */}
          {onBack && (
            <button className="auth-back-button" onClick={onBack}>
              <FaArrowLeft className="me-2" />
              Volver a selección
            </button>
          )}

          <div className="auth-header-section">
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="auth-error-message">
              <span>{error}</span>
              <button onClick={clearError} className="auth-error-close">×</button>
            </div>
          )}

          {/* Login Form */}
          <Form onSubmit={handleEmailLogin}>
            <div className="auth-form-group">
              <input
                type="email"
                className="auth-form-input"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
                required
                disabled={isSubmitting || loading}
              />
            </div>

            <div className="auth-form-group">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-form-input"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
                required
                disabled={isSubmitting || loading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="auth-form-row">
              <div className="auth-checkbox-group">
                <input 
                  className="auth-checkbox-input" 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label className="auth-checkbox-label" htmlFor="rememberMe">
                  Recordarme
                </label>
              </div>
              <button 
                type="button" 
                className={`auth-forgot-link ${accessType}-theme`}
                onClick={() => alert('Funcionalidad de recuperación de contraseña próximamente')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className={`auth-login-btn ${accessType}-theme`}
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
          <div className="auth-divider">
            <span>o inicia con</span>
          </div>

          {/* Google Button con estilos forzados */}
          <button 
            type="button"
            className={`auth-google-btn-custom ${accessType}-theme`}
            onClick={handleGoogleLogin}
            disabled={isSubmitting || loading}
          >
            <FcGoogle size={20} style={{ marginRight: '0.5rem' }} />
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;