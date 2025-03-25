import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/layout/Navigation';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import WalletPage from './pages/WalletPage';
import POSPage from './pages/POSPage';  
import SalesPage from './pages/SalesPage';  
import Footer from './components/layout/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navigation />
        <Container fluid className="main-content py-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<POSPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product-form" element={<ProductFormPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/sales" element={<SalesPage />} />
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