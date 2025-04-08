import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Importar componentes de página
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import POSView from './components/pos/POSView';
import ProductManagement from './components/ProductManagement/ProductManagement';
import SalesHistory from './components/SalesHistory/SalesHistory';
import Settings from './components/Settings/Settings';
import NotFound from './components/NotFound/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Ruta principal redirige al dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Rutas principales */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POSView />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;