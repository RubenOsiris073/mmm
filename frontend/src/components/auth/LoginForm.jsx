import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
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

  // Configuración según el tipo de acceso
  const accessConfig = {
    pos: {
      title: 'Punto de Venta',
      subtitle: 'Acceso al sistema de ventas',
      redirectPath: '/pos',
      variant: 'primary'
    },
    admin: {
      title: 'Panel de Administración',
      subtitle: 'Gestión completa del sistema',
      redirectPath: '/products',
      variant: 'danger'
    },
    general: {
      title: 'Iniciar Sesión',
      subtitle: 'Acceso al sistema',
      redirectPath: '/',
      variant: 'primary'
    }
  };

  const config = accessConfig[accessType] || accessConfig.general;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
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
      console.log('=== INICIANDO LOGIN CON EMAIL ===');
      console.log('AccessType:', accessType);
      console.log('onLoginSuccess existe:', !!onLoginSuccess);
      
      await signInWithEmail(formData.email, formData.password);
      
      console.log('Login exitoso para:', accessType);
      console.log('Llamando a onLoginSuccess en 100ms...');
      
      // Esperar un poco para que el AuthContext se actualice
      setTimeout(() => {
        console.log('Ejecutando callback onLoginSuccess');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          console.log('No hay onLoginSuccess, navegando directamente a:', config.redirectPath);
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
      
      console.log('Login con Google exitoso para:', accessType);
      
      // Esperar un poco para que el AuthContext se actualice
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
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)' 
    }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--border-color)' 
          }}>
            <Card.Body className="p-5">
              {/* Botón de volver */}
              {onBack && (
                <Button
                  variant="link"
                  className="p-0 mb-3 text-decoration-none"
                  onClick={onBack}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FaArrowLeft className="me-2" />
                  Volver
                </Button>
              )}

              {/* Header */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person-circle fs-1 text-primary"></i>
                  </div>
                </div>
                <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                  {config.title}
                </h3>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                  {config.subtitle}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" className="py-2" dismissible onClose={clearError}>
                  <small>{error}</small>
                </Alert>
              )}

              {/* Login Form */}
              <Form onSubmit={handleEmailLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                    <FaUser className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    size="lg"
                    required
                    disabled={isSubmitting || loading}
                    style={{ 
                      backgroundColor: 'var(--input-bg)', 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                    <FaLock className="me-2" />
                    Contraseña
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Tu contraseña"
                      size="lg"
                      required
                      disabled={isSubmitting || loading}
                      style={{ 
                        backgroundColor: 'var(--input-bg)', 
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 pe-3"
                      style={{ background: 'none', zIndex: 10, color: 'var(--text-secondary)' }}
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      disabled={isSubmitting || loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant={config.variant}
                  size="lg"
                  className="w-100 mb-3 fw-semibold"
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
              <div className="text-center my-3">
                <span className="small" style={{ color: 'var(--text-secondary)' }}>
                  o continúa con
                </span>
              </div>

              {/* Google Login Button */}
              <Button
                variant="outline-secondary"
                size="lg"
                className="w-100 fw-semibold"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || loading}
                style={{ 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                {isSubmitting ? (
                  <Spinner size="sm" className="me-2" />
                ) : (
                  <FcGoogle size={20} className="me-2" />
                )}
                {isSubmitting ? 'Conectando...' : 'Continuar con Google'}
              </Button>

              {/* Footer */}
              <div className="text-center mt-4">
                <small style={{ color: 'var(--text-secondary)' }}>
                  ¿Problemas para acceder?{' '}
                  <button 
                    type="button"
                    className="btn btn-link p-0 text-decoration-none" 
                    style={{ color: 'var(--accent-blue)', fontSize: 'inherit' }}
                    onClick={() => alert('Contacta al administrador del sistema')}
                  >
                    Contacta al administrador
                  </button>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;