import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

// Importaciones de componentes refactorizados
import ProductList from './ProductList';
import PaymentModal from './PaymentModal';
import CartPanel from './components/CartPanel';

// Importaciones de hooks
import useCart from './hooks/useCart';
import usePayment from './hooks/usePayment';
import useProductData from './hooks/useProductData';
import { useProductVisibility } from '../../contexts/ProductVisibilityContext';

import './styles/styles.css';

const POSView = () => {
  const [error, setError] = useState(null);
  const { showProductList } = useProductVisibility();

  // Custom hooks para datos y lógica
  const { 
    products, 
    loading: productsLoading, 
    filteredProducts, 
    searchTerm, 
    setSearchTerm,
    loadProducts
  } = useProductData(setError);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    setCartItems
  } = useCart({ products, setError });

  const {
    showPaymentModal,
    paymentMethod,
    amountReceived,
    loading: paymentLoading,
    setShowPaymentModal,
    setPaymentMethod,
    setAmountReceived,
    processSale
  } = usePayment({ cartItems, calculateTotal, setError });
  
  // Estado de carga combinado
  const loading = productsLoading || paymentLoading;
  
  // Escuchar evento para limpiar carrito después de venta exitosa
  useEffect(() => {
    const handleSaleCompleted = () => {
      setCartItems([]);
      loadProducts();
    };
    window.addEventListener('sale-completed', handleSaleCompleted);
    return () => window.removeEventListener('sale-completed', handleSaleCompleted);
  }, [setCartItems, loadProducts]);

  return (
    <div className="pos-view-container">
      <div className="pos-container-fluid">
        {error && (
          <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {/* Layout principal - Carrito a la izquierda, Productos a la derecha */}
        <div className="pos-main-row g-0">
          {/* Panel izquierdo - Carrito y resumen (30%) */}
          <div className="cart-sidebar-panel">
            <CartPanel
              cartItems={cartItems}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
              calculateTotal={calculateTotal}
              onOpenPayment={() => setShowPaymentModal(true)}
              loading={loading}
              isMainView={false}
            />
            
            {/* Cart Total Section adicional en el sidebar */}
            <div className="cart-total-section">
              <h5 className="section-title">Cart Total</h5>
              
              <div className="total-breakdown">
                <div className="total-line">
                  <span>Cart Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="total-line">
                  <span>Discount</span>
                  <span>--</span>
                </div>
                <div className="total-line final-total">
                  <span>Cart Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                className="checkout-btn"
                onClick={() => setShowPaymentModal(true)}
                disabled={cartItems.length === 0 || loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>

          {/* Panel derecho - Productos (70%) */}
          <div className="products-panel">
            <ProductList
              products={filteredProducts}
              loading={productsLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              addToCart={addToCart}
            />
          </div>
        </div>

        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          amountReceived={amountReceived}
          setAmountReceived={setAmountReceived}
          total={calculateTotal()}
          handleProcessSale={processSale}
          loading={paymentLoading}
          cartItems={cartItems}
        />
      </div>
    </div>
  );
};

export default POSView;