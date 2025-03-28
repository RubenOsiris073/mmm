// Update the import of the hook in POSView.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ProductDetectionPanel from './ProductDetectionPanel';
import ShoppingCart from './ShoppingCart';
import PaymentModal from './PaymentModal';
import LastAddedProductAlert from './LastAddedProductAlert';
import DebugPanel from './DebugPanel';
import useProductData from './hooks/useProductData';
import useCart from './hooks/useCart';
import useDetection from './hooks/useDetection';
import usePayment from './hooks/usePayment';

const POSView = () => {
  // Create a local error state to pass down to hooks
  const [error, setError] = useState(null);

  // Custom hooks for data and logic
  const { 
    products, 
    wallet, 
    loading: productsLoading, 
    filteredProducts, 
    searchTerm, 
    setSearchTerm 
  } = useProductData(setError);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    lastAddedProduct,
  } = useCart({ wallet, products, setError });

  const {
    lastDetection,
    continuousDetection,
    loading: detectionLoading,
    toggleContinuousDetection,
    triggerManualDetection,
    addDetectedProductToCart
  } = useDetection({ 
    products, 
    wallet, 
    addToCart, 
    setError 
  });

  const {
    showPaymentModal,
    paymentMethod,
    amountReceived,
    clientName,
    loading: paymentLoading,
    setShowPaymentModal,
    setPaymentMethod,
    setAmountReceived,
    setClientName,
    processSale
  } = usePayment({ cartItems, calculateTotal, setError });
  
  // Combine loading states
  const loading = productsLoading || detectionLoading || paymentLoading;

  return (
    <Container fluid className="mt-3">
      {/* Error display */}
      {error && (
        <Row>
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Main content */}
      <Row>
        {/* Left panel - Product Detection */}
        <Col lg={6} className="mb-4">
          <ProductDetectionPanel
            loading={loading}
            continuousDetection={continuousDetection}
            toggleContinuousDetection={toggleContinuousDetection}
            triggerManualDetection={triggerManualDetection}
            lastDetection={lastDetection}
            addDetectedProductToCart={addDetectedProductToCart}
            lastAddedProduct={lastAddedProduct}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            addToCart={addToCart}
          />
        </Col>

        {/* Right panel - Shopping Cart */}
        <Col lg={6}>
          <ShoppingCart 
            cartItems={cartItems}
            lastAddedProduct={lastAddedProduct}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            loading={loading}
            setShowPaymentModal={setShowPaymentModal}
          />
        </Col>
      </Row>

      {/* Payment Modal */}
      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        clientName={clientName}
        setClientName={setClientName}
        calculateTotal={calculateTotal}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountReceived={amountReceived}
        setAmountReceived={setAmountReceived}
        cartItems={cartItems}
        processSale={processSale}
        loading={loading}
      />

      {/* Last added product alert */}
      {lastAddedProduct && (
        <LastAddedProductAlert product={lastAddedProduct} />
      )}

      {/* Debug panel in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel addDetectedProductToCart={addDetectedProductToCart} />
      )}
    </Container>
  );
};

export default POSView;