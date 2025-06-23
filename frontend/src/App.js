import React, { useEffect, useState, Suspense, lazy } from 'react';
import { initializeFirebase } from './services/firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Importar estilos de temas
import './styles/themes.css';
// Importar estilos modernos para productos
import './styles/products-modern.css';

// Importar el contexto de tema
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductVisibilityProvider } from './contexts/ProductVisibilityContext';

// Importar componentes de autenticación (críticos - no lazy)
import { AuthenticationPage, ProtectedRoute } from './components/auth';

// Importar pantalla de carga y hook (críticos - no lazy)
import LoadingScreen from './components/shared/LoadingScreen';
import useRouteLoading from './hooks/useRouteLoading';

// Lazy loading para componentes no críticos
const Navigation = lazy(() => import('./components/layout/Navigation'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/ProductFormPage'));
const ProveedorView = lazy(() => import('./components/proveedor/ProveedorView'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const CameraPage = lazy(() => import('./pages/CameraPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const Footer = lazy(() => import('./components/layout/Footer'));
const POSMainPage = lazy(() => import('./pages/POSMainPage'));

// Componente para envolver el layout compartido (sidebar + contenido)
const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <>
      <Navigation onSidebarToggle={handleSidebarToggle} />
      <div className={`main-content-with-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
        <Footer />
      </div>
    </>
  );
};

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
          <MainLayout>
            <ProductsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/products/new" element={
        <ProtectedRoute requireAuth={true}>
          <MainLayout>
            <ProductFormPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/products/edit/:id" element={
        <ProtectedRoute requireAuth={true}>
          <MainLayout>
            <ProductFormPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/proveedores" element={
        <ProtectedRoute requireAuth={true}>
          <MainLayout>
            <ProveedorView />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/sales" element={
        <ProtectedRoute requireAuth={true}>
          <MainLayout>
            <SalesPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/camera" element={
        <ProtectedRoute requireAuth={true}>
          <MainLayout>
            <CameraPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute requireAuth={true}>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
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
        <ProductVisibilityProvider>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
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
        </ProductVisibilityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;