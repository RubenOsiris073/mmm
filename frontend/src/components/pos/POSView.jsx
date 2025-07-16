import React, { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { FaCamera, FaShoppingCart, FaChartBar } from 'react-icons/fa';

// Importaciones de componentes refactorizados
import ProductList from './ProductList';
import PaymentModal from './PaymentModal';
import POSCameraDetection from './POSCameraDetection';

// Importaciones de hooks
import useCart from './hooks/useCart';
import usePayment from './hooks/usePayment';
import { useProductVisibility } from '../../contexts/ProductVisibilityContext';
import apiService from '../../services/apiService';

const POSView = () => {
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showProductList } = useProductVisibility();

  // Load products using apiService directly
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      const productsData = response.data?.data || response.data || [];
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products with stock and search term
  const filteredProducts = useMemo(() => {
    const productsWithStock = products.filter(product => {
      const stock = product.cantidad || product.stock || 0;
      return stock > 0;
    });

    if (!searchTerm) return productsWithStock;

    const term = searchTerm.toLowerCase();
    return productsWithStock.filter(product =>
      (product.nombre && product.nombre.toLowerCase().includes(term)) ||
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.codigo && product.codigo.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

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
  const combinedLoading = loading || paymentLoading;

  // Handle product detection from camera
  const handleProductDetected = (product, detection) => {
    try {
      // Add detected product to cart with quantity 1
      addToCart(product);
      console.log('Producto detectado y agregado al carrito:', {
        product: product.nombre || product.name,
        detection: detection.label,
        confidence: detection.similarity
      });
    } catch (error) {
      console.error('Error agregando producto detectado al carrito:', error);
      setError('Error al agregar el producto detectado al carrito');
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

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
    <div className="pos-minimal-container">
      {error && (
        <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="pos-layout">
        {/* Left Side - Main Cart Area */}
        <div className="cart-main-area">
          <div className="cart-empty-state">
            {cartItems.length === 0 ? (
              <>
                <FaShoppingCart className="cart-icon" />
                <h2 className="cart-title">Sistema de Punto de Venta</h2>
                <div className="instructions">
                  <p className="instruction-item">• Usa el botón "Iniciar Detección" para activar la cámara</p>
                  <p className="instruction-item">• Coloca productos frente a la cámara para detectarlos automáticamente</p>
                  <p className="instruction-item">• Los productos detectados se agregarán al carrito automáticamente</p>
                  <p className="instruction-item">• Revisa el total en el panel derecho y procede al checkout</p>
                </div>
              </>
            ) : (
              <>
                <h2 className="cart-title">Productos en el Carrito</h2>
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <span className="item-name">{item.nombre || item.name}</span>
                        <span className="item-price">${item.precio?.toFixed(2)}</span>
                      </div>
                      <div className="item-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Panels */}
        <div className="right-panels">
          {/* Cart Total Panel */}
          <div className="panel cart-total-panel">
            <h3 className="panel-title">Cart Total</h3>
            <div className="total-lines">
              <div className="total-line">
                <span>Cart Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Shipping</span>
                <span>Free</span>
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

          {/* Camera Button Panel */}
          <div className="panel camera-panel">
            <POSCameraDetection
              onProductDetected={handleProductDetected}
              products={filteredProducts}
              loading={loading}
              panelMode={true}
            />
          </div>

          {/* Statistics Panel */}
          <div className="panel stats-panel">
            <h3 className="panel-title">
              <FaChartBar className="panel-icon" />
              Estadísticas
            </h3>
            <div className="stats-content">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{cartItems.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Productos Detectables:</span>
              </div>
              <ul className="detectable-products">
                <li>Barrita</li>
                <li>Botella</li>
                <li>Chicle</li>
              </ul>
            </div>
          </div>
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

      <style jsx>{`
        .pos-minimal-container {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 20px;
        }

        .pos-layout {
          display: flex;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .cart-main-area {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .cart-empty-state {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .cart-icon {
          font-size: 4rem;
          color: #e9ecef;
          margin-bottom: 20px;
        }

        .cart-title {
          font-size: 2.5rem;
          font-weight: 300;
          color: #333;
          margin-bottom: 10px;
        }

        .cart-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 5px;
        }

        .cart-description {
          color: #999;
          margin-bottom: 40px;
        }

        .instructions {
          text-align: left;
          max-width: 500px;
          margin: 30px auto 0;
        }

        .instruction-item {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 12px;
          padding-left: 10px;
        }

        .cart-items-list {
          margin-bottom: 40px;
          text-align: left;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .item-name {
          font-weight: 500;
          color: #333;
        }

        .item-price {
          color: #666;
          font-size: 0.9rem;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qty-btn, .remove-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }

        .qty-btn:hover, .remove-btn:hover {
          background: #e9ecef;
        }

        .qty {
          min-width: 30px;
          text-align: center;
          font-weight: 500;
        }

        .detection-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #eee;
        }

        .detection-icon {
          font-size: 2rem;
          color: #666;
          margin-bottom: 15px;
        }

        .detection-text {
          color: #666;
          margin-bottom: 20px;
          font-size: 1.1rem;
        }

        .right-panels {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .panel-title {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-icon {
          font-size: 1rem;
        }

        .cart-total-panel {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .total-lines {
          margin-bottom: 20px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #666;
        }

        .final-total {
          border-top: 1px solid #eee;
          margin-top: 10px;
          padding-top: 15px;
          font-weight: 600;
          color: #333;
        }

        .checkout-btn {
          width: 100%;
          background: #333;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }

        .checkout-btn:hover:not(:disabled) {
          background: #555;
        }

        .checkout-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .camera-panel {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          text-align: center;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-panel {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .stats-content {
          font-size: 0.9rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .stat-label {
          color: #666;
        }

        .stat-value {
          font-weight: 500;
          color: #333;
        }

        .detectable-products {
          list-style: none;
          padding: 0;
          margin: 10px 0 0 0;
        }

        .detectable-products li {
          padding: 4px 0;
          color: #666;
          font-size: 0.85rem;
        }

        .detectable-products li:before {
          content: "• ";
          color: #999;
          margin-right: 8px;
        }

        @media (max-width: 768px) {
          .pos-layout {
            flex-direction: column;
          }
          
          .right-panels {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
          }
          
          .panel {
            min-width: 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default POSView;