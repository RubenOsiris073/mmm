// frontend/src/pages/POSMainPage.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import POSLayout from '../components/layout/POSLayout';
import POSView from '../components/pos/POSView';
import POSAccessSelector from '../components/pos/POSAccessSelector';
import { Spinner, Container } from 'react-bootstrap';

const POSMainPage = () => {
  const { loading, isAuthenticated } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)' 
      }}>
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Verificando autenticación...</span>
          </Spinner>
          <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
            Verificando autenticación...
          </p>
        </div>
      </Container>
    );
  }

  // Si no está autenticado, mostrar selector de acceso (que incluye el login)
  if (!isAuthenticated) {
    return <POSAccessSelector />;
  }

  // Si está autenticado, mostrar el POS
  return (
    <POSLayout>
      <div className="pos-main-page h-100">
        <POSView />
      </div>
    </POSLayout>
  );
};

export default POSMainPage;