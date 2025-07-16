import React, { useEffect, lazy, Suspense } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FaShoppingCart, FaChartBar } from 'react-icons/fa';
import POSCameraDetection from './POSCameraDetection';

// Importaciones de componentes
const ProductList = lazy(() => import('./ProductList'));
import PaymentModal from './PaymentModal';
import POSCartArea from './components/POSCartArea';
import POSSidePanels from './components/POSSidePanels';
import POSErrorBoundary from './components/POSErrorBoundary';

// Importaciones de hooks
import useCart from './hooks/useCart';
import usePayment from './hooks/usePayment';
import usePOSProducts from './hooks/usePOSProducts';
import usePOSCallbacks from './hooks/usePOSCallbacks';
import { useProductVisibility } from '../../contexts/ProductVisibilityContext';

// Importaciones de estilos
import styles from './styles/POSLayout.module.css';
import panelStyles from './styles/POSPanels.module.css';

const POSView = () => {
  const { showProductList } = useProductVisibility();

  // Usar el hook personalizado para productos
  const {
    filteredProducts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    setError
  } = usePOSProducts();

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    setCartItems
  } = useCart({ products: filteredProducts, setError });

  const {
    showPaymentModal,
    loading: paymentLoading,
    setShowPaymentModal,
    processSale
  } = usePayment({ cartItems, calculateTotal, setError });

  // Usar callbacks optimizados
  const {
    handleProductDetected,
    handleOpenPayment,
    handleUpdateQuantity,
    handleRemoveFromCart
  } = usePOSCallbacks({
    addToCart,
    updateQuantity,
    removeFromCart,
    setShowPaymentModal,
    setError
  });

  // Escuchar evento para limpiar carrito después de venta exitosa
  useEffect(() => {
    const handleSaleCompleted = () => {
      setCartItems([]);
    };
    window.addEventListener('sale-completed', handleSaleCompleted);
    return () => window.removeEventListener('sale-completed', handleSaleCompleted);
  }, [setCartItems]);

  return (
    <div className={styles.posContainer}>
      {error && (
        <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className={`${styles.posLayout} ${!showProductList ? styles.posLayoutFixed : ''}`}>
        {/* Left Side - Main Cart Area */}
        <POSErrorBoundary>
          <POSCartArea
            cartItems={cartItems}
            updateQuantity={handleUpdateQuantity}
            removeFromCart={handleRemoveFromCart}
          />
        </POSErrorBoundary>

        {/* Right Side - Panels */}
        <POSErrorBoundary>
          <POSSidePanels
            cartItems={cartItems}
            calculateTotal={calculateTotal}
            loading={loading}
            onOpenPayment={handleOpenPayment}
            handleProductDetected={handleProductDetected}
            filteredProducts={filteredProducts}
          />
        </POSErrorBoundary>
      </div>

      {/* Bottom Section: Product List */}
      {showProductList && (
        <div className={styles.productListSection}>
          <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando productos...</span>
              </Spinner>
            </div>
          }>
            <ProductList
              products={filteredProducts}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              addToCart={addToCart}
            />
          </Suspense>
        </div>
      )}

      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        total={calculateTotal()}
        handleProcessSale={processSale}
        loading={paymentLoading}
        cartItems={cartItems}
      />
    </div>
  );
};

export default POSView;