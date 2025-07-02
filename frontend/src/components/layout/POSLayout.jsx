// frontend/src/components/layout/POSLayout.jsx
import React from 'react';
import { Container } from 'react-bootstrap';
import FloatingActionButton from '../pos/components/FloatingActionButton';

const POSLayout = ({ children }) => {
  return (
    <div className="pos-layout d-flex flex-column" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* CONTENIDO CON FONDO QUE RESPETA EL TEMA - SIN PADDING Y SIN NAVBAR */}
      <div className="pos-content flex-grow-1" style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        {children}
      </div>

      {/* Botón flotante para opciones de usuario y tema */}
      <FloatingActionButton />
    </div>
  );
};

export default POSLayout;