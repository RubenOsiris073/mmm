import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import ProductDetectionPanel from './ProductDetectionPanel';
import ShoppingCart from './ShoppingCart';
import PaymentModal from './PaymentModal';
import LastAddedProductAlert from './LastAddedProductAlert';
import DebugPanel from './DebugPanel';
import useProductData from './hooks/useProductData';
import useCart from './hooks/useCart';
import usePayment from './hooks/usePayment';
import apiService from '../../services/apiService';

const POSView = () => {
  // Estados para manejo de error y webcam
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [continuousDetection, setContinuousDetection] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [detectionLoading, setDetectionLoading] = useState(false);

  // Custom hooks para datos y lógica
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
  
  // Estado de carga combinado
  const loading = productsLoading || detectionLoading || paymentLoading;

  // Verificar si la webcam está lista
  const checkWebcamReady = useCallback(() => {
    if (!webcamRef.current) {
      return false;
    }
    
    const video = webcamRef.current.video;
    return video && 
           video.readyState === 4 && 
           video.videoWidth > 0 && 
           video.videoHeight > 0;
  }, []);

  // Inicialización de la webcam
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const ready = checkWebcamReady();
      if (ready && !isWebcamReady) {
        setIsWebcamReady(true);
        console.log("Webcam inicializada correctamente");
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [checkWebcamReady, isWebcamReady]);

  // Capturar frame de la webcam
  const captureFrame = useCallback(async () => {
    try {
      // Verificar que la referencia a webcam existe y está inicializada
      if (!isWebcamReady || !webcamRef.current) {
        console.log("La webcam no está lista para capturar frames");
        return null;
      }
      
      // Intentar obtener screenshot
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.log("No se pudo obtener la imagen de la cámara");
        return null;
      }
      
      return imageSrc;
    } catch (error) {
      console.log("Error al capturar frame:", error.message);
      setError(`Error al capturar imagen: ${error.message}`);
      return null;
    }
  }, [isWebcamReady]);

  // Buscar producto por etiqueta
  const findProductByLabel = useCallback((label) => {
    if (!label) return null;
    
    const normalizedLabel = label.toString().toLowerCase().trim();
    return products.find(product => 
      (product.label && product.label.toLowerCase() === normalizedLabel) ||
      (product.nombre && product.nombre.toLowerCase().includes(normalizedLabel))
    );
  }, [products]);

  // Añadir producto detectado al carrito
  const addDetectedProductToCart = useCallback((productLabel, productInfo = null) => {
    console.log("Intentando añadir al carrito por detección:", productLabel, "Info adicional:", productInfo);
    
    if (!productLabel) {
      console.log("Etiqueta de producto vacía");
      return;
    }
    
    // Si tenemos información completa del producto, la usamos directamente
    if (productInfo && productInfo.id) {
      console.log("Usando información directa del producto detectado:", productInfo);
      
      // Verificar que tenga stock
      if (productInfo.stock && productInfo.stock > 0) {
        addToCart({
          id: productInfo.id,
          nombre: productInfo.nombre || productInfo.label,
          precio: productInfo.precio || 0,
          label: productInfo.label,
          stock: productInfo.stock
        });
      } else {
        setError(`${productInfo.nombre || productInfo.label}: Sin stock disponible`);
        setTimeout(() => setError(null), 3000);
      }
      return;
    }
    
    // Buscar por etiqueta
    const product = findProductByLabel(productLabel);
    
    if (!product) {
      console.log(`No se encontró producto para: ${productLabel}`);
      setError(`No se encontró producto: ${productLabel}`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Verificar stock y añadir
    if (product.stock && product.stock > 0) {
      addToCart(product);
    } else {
      setError(`${product.nombre}: Sin stock disponible`);
      setTimeout(() => setError(null), 3000);
    }
  }, [addToCart, findProductByLabel, setError]);

  // Detector de imagen
  const detectFromImage = useCallback(async (imageData) => {
    if (!imageData) return null;
    
    try {
      setDetectionLoading(true);
      
      const result = await apiService.triggerDetection(imageData);
      console.log("Resultado de detección:", result);
      
      if (result && result.detection) {
        setLastDetection(result.detection);

        if (result.detection.similarity > 70) { // Umbral de confianza
          // Usar la información del producto si está disponible
          const productInfo = findProductByLabel(result.detection.label);
          result.detection.productInfo = productInfo;
          return result.detection;
        } else {
          setError(`Detección poco confiable (${result.detection.similarity}%). Intente nuevamente.`);
          setTimeout(() => setError(null), 3000);
        }
      } else {
        throw new Error("La respuesta de detección no tiene el formato esperado");
      }
    } catch (error) {
      console.log("Error en la detección:", error.message);
      setError(`Error en la detección: ${error.message}`);
      return null;
    } finally {
      setDetectionLoading(false);
    }
  }, [findProductByLabel, setError]);

  // Realizar detección manual
  const triggerManualDetection = useCallback(async () => {
    try {
      setDetectionLoading(true);
      setError(null);

      console.log("Iniciando detección manual...");
      const frameData = await captureFrame();
      if (!frameData) {
        throw new Error("No se pudo capturar imagen de la cámara");
      }

      const detection = await detectFromImage(frameData);
      if (detection) {
        // Añadir automáticamente al carrito si la confianza es alta
        addDetectedProductToCart(
          detection.label,
          detection.productInfo
        );
      }
    } catch (err) {
      console.error("Error en detección manual:", err);
      setError("Error al realizar detección. Intenta nuevamente.");
    } finally {
      setDetectionLoading(false);
    }
  }, [captureFrame, detectFromImage, addDetectedProductToCart]);

  // Alternar detección continua
  const toggleContinuousDetection = useCallback(() => {
    const newStatus = !continuousDetection;
    setContinuousDetection(newStatus);
    
    if (newStatus) {
      toast.info("Detección continua activada");
    } else {
      toast.info("Detección continua desactivada");
    }
  }, [continuousDetection]);

  // Gestionar la detección continua
  useEffect(() => {
    let interval = null;
    
    if (continuousDetection && isWebcamReady) {
      interval = setInterval(async () => {
        await triggerManualDetection();
      }, 3000); // Cada 3 segundos
      
      console.log("Detección automática iniciada");
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("Detección automática detenida");
      }
    };
  }, [continuousDetection, isWebcamReady, triggerManualDetection]);

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

      {/* Webcam oculta para la detección */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "environment"
          }}
        />
      </div>

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
            isWebcamReady={isWebcamReady}
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