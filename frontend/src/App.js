import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './services/firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Importar estilos de temas
import './styles/themes.css';

// Importar el contexto de tema
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importar componentes de autenticación
import { AuthenticationPage, ProtectedRoute } from './components/auth';

// Importar pantalla de carga y hook
import LoadingScreen from './components/shared/LoadingScreen';
import useRouteLoading from './hooks/useRouteLoading';

// Componentes del sistema principal
import Navigation from './components/layout/Navigation';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import ProveedorView from './components/proveedor/ProveedorView';
import SalesPage from './pages/SalesPage';
import CameraPage from './pages/CameraPage';
import Footer from './components/layout/Footer';

// Componentes del POS
import POSMainPage from './pages/POSMainPage';

import { ToastContainer } from 'react-toastify';

// Componente para manejar las rutas principales
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const isRouteLoading = useRouteLoading(1000); // Reducir tiempo de carga

  // Mostrar pantalla de carga durante verificación inicial
  if (loading || isRouteLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Ruta de autenticación - Solo si NO está autenticado */}
      <Route path="/login" element={
        user ? <Navigate to="/products" replace /> : <AuthenticationPage />
      } />
      
      {/* Ruta principal que redirige según estado de autenticación */}
      <Route path="/" element={
        user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Rutas POS - Protegidas */}
      <Route path="/pos" element={
        <ProtectedRoute requireAuth={true}>
          <POSMainPage />
        </ProtectedRoute>
      } />
      
      {/* Rutas del sistema principal - Protegidas y con navegación */}
      <Route path="/products" element={
        <ProtectedRoute requireAuth={true}>
          <div className="App d-flex flex-column min-vh-100">
            <Navigation />
            <Container fluid className="main-content py-4 flex-grow-1">
              <ProductsPage />
            </Container>
            <Footer />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/products/new" element={
        <ProtectedRoute requireAuth={true}>
          <div className="App d-flex flex-column min-vh-100">
            <Navigation />
            <Container fluid className="main-content py-4 flex-grow-1">
              <ProductFormPage />
            </Container>
            <Footer />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/products/edit/:id" element={
        <ProtectedRoute requireAuth={true}>
          <div className="App d-flex flex-column min-vh-100">
            <Navigation />
            <Container fluid className="main-content py-4 flex-grow-1">
              <ProductFormPage />
            </Container>
            <Footer />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/proveedores" element={
        <ProtectedRoute requireAuth={true}>
          <div className="App d-flex flex-column min-vh-100">
            <Navigation />
            <Container fluid className="main-content py-4 flex-grow-1">
              <ProveedorView />
            </Container>
            <Footer />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute requireAuth={true}>
          <div className="App d-flex flex-column min-vh-100">
            <Navigation />
            <Container fluid className="main-content py-4 flex-grow-1">
              <SalesPage />
            </Container>
            <Footer />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/camera" element={
        <ProtectedRoute requireAuth={true}>
          <div className="App d-flex flex-column min-vh-100">
            <Navigation />
            <Container fluid className="main-content py-4 flex-grow-1">
              <CameraPage />
            </Container>
            <Footer />
          </div>
        </ProtectedRoute>
      } />
      
      {/* Ruta de admin que redirige a products */}
      <Route path="/admin" element={<Navigate to="/products" replace />} />
      
      {/* Cualquier otra ruta redirige según estado de autenticación */}
      <Route path="*" element={
        user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupFirebase = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase conectado exitosamente');
        setIsLoading(false);
      } catch (err) {
        console.error('Error al inicializar Firebase:', err);
        setError(`Error de conexión a Firebase: ${err.message}`);
        setIsLoading(false);
      }
    };

    setupFirebase();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Conectando a Firebase...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-danger text-center">
          <h4>Error de Conexión</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;