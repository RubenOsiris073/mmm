import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './services/firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/layout/Navigation';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import WalletPage from './pages/WalletPage';
import BodegaView from './components/bodega/BodegaView';
import POSPage from './pages/POSPage';
import SalesPage from './pages/SalesPage';
import Footer from './components/layout/Footer';
import { ToastContainer } from 'react-toastify';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupFirebase = async () => {
      try {
        await initializeFirebase();
        setIsLoading(false);
      } catch (err) {
        console.error('Error al inicializar Firebase:', err);
        setError('No se pudo conectar con el backend para obtener la configuración de Firebase');
        setIsLoading(false);
      }
    };

    setupFirebase();
  }, []);

  if (isLoading) {
    return <div className="loading">Cargando configuración de Firebase desde el backend...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navigation />
        <Container fluid className="main-content py-4 flex-grow-1">
          <Routes>
            {/* Ruta raíz */}
            <Route path="/" element={<POSPage />} />
            
            {/* Rutas de producto */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product-form" element={<ProductFormPage />} />
            
            {/* Rutas de inventario */}
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/bodega" element={<BodegaView />} />
            
            {/* Otras rutas */}
            <Route path="/sales" element={<SalesPage />} />
            
            {/* Ruta para URLs no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;