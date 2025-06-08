import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles = [] }) => {
  const { user, loading } = useAuth(); // Cambiar currentUser por user
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
            Verificando acceso...
          </p>
        </div>
      </Container>
    );
  }

  // Si requiere autenticación pero no hay usuario, redirigir al login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no requiere autenticación pero hay usuario, permitir acceso
  if (!requireAuth) {
    return children;
  }

  // Si hay roles específicos requeridos, verificar
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role || 'user'; // rol por defecto
    
    if (!allowedRoles.includes(userRole)) {
      return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="mb-4">
              <i className="bi bi-shield-exclamation fs-1 text-warning"></i>
            </div>
            <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>
              Acceso Denegado
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              No tienes los permisos necesarios para acceder a esta sección.
            </p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => window.history.back()}
            >
              Volver
            </button>
          </div>
        </Container>
      );
    }
  }

  // Si todo está bien, mostrar el contenido
  return children;
};

export default ProtectedRoute;