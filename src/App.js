import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CameraPage from './pages/CameraPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Container className="my-4 main-content">
          <Routes>
            <Route path="/" element={<CameraPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product-form" element={<ProductFormPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
}

export default App;