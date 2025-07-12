import React, { useState, useEffect } from 'react';
import { Alert, Row, Col } from 'react-bootstrap';

// Importaciones de componentes refactorizados
import ProductList from './ProductList';
import PaymentModal from './PaymentModal';
import CartPanel from './components/CartPanel';

// Importaciones de hooks
import useCart from './hooks/useCart';
import usePayment from './hooks/usePayment';
import useProductData from './hooks/useProductData';
import { useProductVisibility } from '../../contexts/ProductVisibilityContext';
import styles from './styles/styles.module.css';

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
    <div className={styles['pos-view-container']}>
      <div className={styles['pos-container-fluid']}>
        {error && (
          <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Top Section: Shopping Bag and Cart Total */}
        <Row className={styles['pos-top-section']}>
          <Col md={9} className={styles['shopping-bag-col']}>
            <CartPanel
              cartItems={cartItems}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
              calculateTotal={calculateTotal}
              onOpenPayment={() => setShowPaymentModal(true)}
              loading={loading}
              isMainView={false}
            />
          </Col>
          <Col md={3} className={styles['cart-total-col']}>
            <div className={styles['cart-total-section-top']}>
              <h5 className={styles['section-title']}>Cart Total</h5>
              <div className={styles['total-breakdown']}>
                <div className={styles['total-line']}>
                  <span>Cart Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className={styles['total-line']}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className={styles['total-line']}>
                  <span>Discount</span>
                  <span>--</span>
                </div>
                <div className={styles['total-line'] + ' ' + styles['final-total']}>
                  <span>Cart Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                className={styles['checkout-btn']}
                onClick={() => setShowPaymentModal(true)}
                disabled={cartItems.length === 0 || loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </Col>
        </Row>

        {/* Middle Section: Empty Placeholder */}
        <div className={styles['pos-middle-section']}>
          {/* Add content or a placeholder here */}
        </div>

        {/* Bottom Section: Product List */}
        <div className={styles['pos-bottom-section']}>
          <ProductList
            products={filteredProducts}
            loading={productsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            addToCart={addToCart}
          />
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