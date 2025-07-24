import React, { memo } from 'react';
import { FaChartBar } from 'react-icons/fa';
import POSCameraDetection from '../POSCameraDetection';
import panelStyles from '../styles/POSPanels.module.css';

const POSSidePanels = memo(({ 
  cartItems, 
  calculateTotal, 
  loading, 
  onOpenPayment,
  handleProductDetected,
  filteredProducts 
}) => {
  return (
    <div className={panelStyles.rightPanels}>
      {/* Cart Total Panel */}
      <div className={`${panelStyles.panel} ${panelStyles.cartTotalPanel}`}>
        <h3 className={panelStyles.panelTitle}>Cart Total</h3>
        <div className={panelStyles.totalLines}>
          <div className={panelStyles.totalLine}>
            <span>Cart Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className={panelStyles.totalLine}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className={`${panelStyles.totalLine} ${panelStyles.finalTotal}`}>
            <span>Cart Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
        <button
          className={panelStyles.checkoutBtn}
          onClick={onOpenPayment}
          disabled={cartItems.length === 0 || loading}
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>

      {/* Camera Detection Panel */}
      <div className={`${panelStyles.panel} ${panelStyles.cameraPanel}`}>
        <POSCameraDetection
          onProductDetected={handleProductDetected}
          products={filteredProducts}
          loading={loading}
          panelMode={true}
        />
      </div>

      {/* Statistics Panel */}
      <div className={`${panelStyles.panel} ${panelStyles.statsPanel}`}>
        <h3 className={panelStyles.panelTitle}>
          <FaChartBar className={panelStyles.panelIcon} />
          Estadísticas
        </h3>
        <div className={panelStyles.statsContent}>
          <div className={panelStyles.statItem}>
            <span className={panelStyles.statLabel}>Total:</span>
            <span className={panelStyles.statValue}>{cartItems.length}</span>
          </div>
          <div className={panelStyles.statItem}>
            <span className={panelStyles.statLabel}>Productos Detectables:</span>
          </div>
          <ul className={panelStyles.detectableProducts}>
            <li>Cacahuates_Kiyakis</li>
            <li>Botella_Ciel</li>
            <li>Trident</li>
            <li>Dr.Peppe</li>
            <li>Takis</li>
            <li>Pop</li>
            <li>Sabritas</li>
            <li>pan</li>
            <li>yogurt</li>
            <li>Del Valle</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

POSSidePanels.displayName = 'POSSidePanels';

export default POSSidePanels;