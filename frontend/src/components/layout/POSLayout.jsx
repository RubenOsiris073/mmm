// frontend/src/components/layout/POSLayout.jsx
import React from 'react';
import { Container } from 'react-bootstrap';
import FloatingActionButton from '../pos/components/FloatingActionButton';

const POSLayout = ({ children }) => {
  return (
    <div className="pos-layout d-flex flex-column min-vh-100" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)' 
    }}>
      {/* CONTENIDO CON FONDO QUE RESPETA EL TEMA - SIN PADDING Y SIN NAVBAR */}
      <div className="pos-content flex-grow-1 px-0" style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)',
        minHeight: '100vh'
      }}>
        {children}
      </div>

      {/* Botón flotante para opciones de usuario y tema */}
      <FloatingActionButton />

      <footer className="bg-dark text-light py-2">
        <Container fluid>
          <div className="text-center">
            <small>© {new Date().getFullYear()} Monkey Technologies. Todos los derechos reservados.</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default POSLayout;