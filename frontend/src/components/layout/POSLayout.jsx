// frontend/src/components/layout/POSLayout.jsx
import React, { Suspense } from 'react';

// Lazy load del FloatingActionButton para evitar problemas de dependencias
const FloatingActionButton = React.lazy(() => import('../pos/components/FloatingActionButton'));

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

      {/* Botón flotante con lazy loading para evitar problemas de dependencias */}
      <Suspense fallback={null}>
        <FloatingActionButton />
      </Suspense>
    </div>
  );
};

export default POSLayout;