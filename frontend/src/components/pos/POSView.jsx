import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

// Importaciones de componentes refactorizados
import ProductList from './ProductList';
import PaymentModal from './PaymentModal';
import ScannerPanel from './components/ScannerPanel';
import CartPanel from './components/CartPanel';
import WebcamCapture from './components/WebcamCapture';

// Importaciones de hooks
import useCart from './hooks/useCart';
import usePayment from './hooks/usePayment';
import useProductData from './hooks/useProductData';
import useDetection from './hooks/useDetection';

import './styles.css';

const POSView = () => {
  const [error, setError] = useState(null);
  const [continuousDetection, setContinuousDetection] = useState(false);

  // Custom hooks para datos y lógica
  const { 
    products, 
    loading: productsLoading, 
    filteredProducts, 
    searchTerm, 
    setSearchTerm,
    loadProducts  // Agregar esta función para poder refrescar productos
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

  const {
    lastDetection,
    detectionLoading,
    showWebcam,
    setShowWebcam,
    isWebcamReady,
    setIsWebcamReady,
    webcamRef,
    checkWebcamReady,
    captureFrame,
    detectFromImage,
    addDetectedProductToCart
  } = useDetection({ products, addToCart, setError });
  
  // Estado de carga combinado
  const loading = productsLoading || detectionLoading || paymentLoading;

  // Inicialización de la webcam
  useEffect(() => {
    if (!showWebcam) return;
    
    const checkInterval = setInterval(() => {
      const ready = checkWebcamReady();
      if (ready && !isWebcamReady) {
        setIsWebcamReady(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [checkWebcamReady, isWebcamReady, showWebcam, setIsWebcamReady]);
  
  // Escuchar evento para limpiar carrito después de venta exitosa
  useEffect(() => {
    const handleSaleCompleted = () => {
      setCartItems([]);
      // Refrescar productos para mostrar stock actualizado
      loadProducts();
    };
    window.addEventListener('sale-completed', handleSaleCompleted);
    return () => window.removeEventListener('sale-completed', handleSaleCompleted);
  }, [setCartItems, loadProducts]);

  // Activar detección manual
  const handleScanProduct = useCallback(async () => {
    setShowWebcam(true);
    
    setTimeout(async () => {
      if (webcamRef.current) {
        const frame = await captureFrame();
        if (frame) {
          console.log("Imagen capturada, iniciando detección...");
          const detection = await detectFromImage(frame);
          
          if (detection && detection.label) {
            addDetectedProductToCart(detection.label, detection.productInfo);
          }
          
          setTimeout(() => setShowWebcam(false), 500);
        }
      }
    }, 1000);
  }, [addDetectedProductToCart, detectFromImage, captureFrame, setShowWebcam, webcamRef]);

  // Detección continua cuando está activada
  useEffect(() => {
    let detectionInterval = null;
    
    if (continuousDetection && showWebcam && !detectionLoading) {
      console.log("Iniciando detección continua...");
      
      detectionInterval = setInterval(async () => {
        // Solo proceder si la webcam está lista
        if (webcamRef.current && isWebcamReady) {
          const frame = await captureFrame();
          if (frame) {
            console.log("Detección continua: imagen capturada");
            const detection = await detectFromImage(frame);
            
            if (detection && detection.label) {
              console.log("Detección continua: producto detectado", detection.label);
              addDetectedProductToCart(detection.label, detection.productInfo);
              
              setTimeout(() => setShowWebcam(false), 500);
            }
          }
        }
      }, 3000);
    }
    
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [continuousDetection, showWebcam, detectionLoading, captureFrame, detectFromImage, addDetectedProductToCart, setShowWebcam, webcamRef, isWebcamReady]);

  return (
    <div className="pos-view">
      <Container fluid className="pos-container">
      
      {/* Instrucciones */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Instrucciones para el Punto de Venta
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <ol>
                <li className="mb-2">Busque productos por nombre o código de barras en la barra de búsqueda.</li>
                <li className="mb-2">Escanee códigos de barras o seleccione productos de la lista para agregarlos al carrito.</li>
                <li className="mb-2">Ajuste las cantidades según sea necesario utilizando los botones + y -.</li>
                <li className="mb-2">Revise el resumen de la venta y el total a pagar.</li>
                <li className="mb-2">Seleccione el método de pago (efectivo, tarjeta, etc.).</li>
                <li>Finalice la venta haciendo clic en "Completar Venta" e imprima el recibo si es necesario.</li>
              </ol>
            </Col>
            <Col md={4}>
              <Alert variant="info" className="h-100 mb-0 d-flex align-items-center">
                <div>
                  <i className="bi bi-lightbulb-fill me-2 fs-4"></i>
                  <strong>Consejos:</strong>
                  <p className="mb-0 mt-2">
                    Para transacciones rápidas, utilice un lector de códigos de barras y mantenga la lista de productos frecuentes visible. Presione F1 para acceder a accesos directos del teclado.
                  </p>
                </div>
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={5}>
          <ScannerPanel
            onScanProduct={handleScanProduct}
            continuousDetection={continuousDetection}
            setContinuousDetection={setContinuousDetection}
            detectionLoading={detectionLoading}
            lastDetection={lastDetection}
            onAddDetectedProduct={addDetectedProductToCart}
          />
        </Col>
        
        <Col md={7}>
          <CartPanel
            cartItems={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            calculateTotal={calculateTotal}
            onOpenPayment={() => setShowPaymentModal(true)}
            loading={loading}
          />
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <ProductList
            products={filteredProducts}
            loading={productsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            addToCart={addToCart}
          />
        </Col>
      </Row>

      <WebcamCapture webcamRef={webcamRef} showWebcam={showWebcam} />

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
        cartItems={cartItems} // Pasamos los items del carrito
      />
    </Container>
    </div>
  );
};

export default POSView;