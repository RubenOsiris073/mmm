import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Alert, Button, Form } from 'react-bootstrap';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaBarcode, FaBox } from 'react-icons/fa';
import './styles.css';

// Importar componentes
import ShoppingCart from './ShoppingCart';
import ProductList from './ProductList';
import PaymentModal from './PaymentModal';

// Importar hooks
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
  const [showWebcam, setShowWebcam] = useState(false);

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
    setLastAddedProduct,
    setCartItems
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
    if (!webcamRef.current) return false;
    
    const video = webcamRef.current.video;
    return video && 
           video.readyState === 4 && 
           video.videoWidth > 0 && 
           video.videoHeight > 0;
  }, []);

  // Inicialización de la webcam
  useEffect(() => {
    if (!showWebcam) return;
    
    const checkInterval = setInterval(() => {
      const ready = checkWebcamReady();
      if (ready && !isWebcamReady) {
        setIsWebcamReady(true);
        console.log("Webcam inicializada correctamente");
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [checkWebcamReady, isWebcamReady, showWebcam]);
  
  // Escuchar el evento personalizado para limpiar el carrito después de una venta exitosa
  useEffect(() => {
    const handleSaleCompleted = () => {
      setCartItems([]);
    };
    
    window.addEventListener('sale-completed', handleSaleCompleted);
    return () => window.removeEventListener('sale-completed', handleSaleCompleted);
  }, [setCartItems]);

  // Capturar frame de la webcam
  const captureFrame = useCallback(async () => {
    try {
      if (!isWebcamReady || !webcamRef.current) {
        console.log("La webcam no está lista para capturar frames");
        return null;
      }
      
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

  // Función findProductByLabel y otras funciones importantes
  const findProductByLabel = useCallback((label) => {
    if (!label) return null;
    
    console.log(`Buscando producto con label: "${label}"`);
    
    // Normalizar el texto para búsqueda más efectiva
    const normalizedLabel = label.toString().toLowerCase().trim();
    
    // Primero intentar búsqueda exacta
    let product = products.find(p => 
      (p.label && p.label.toLowerCase() === normalizedLabel) || 
      (p.nombre && p.nombre.toLowerCase() === normalizedLabel)
    );
    
    // Si no encuentra coincidencia exacta, buscar coincidencia parcial
    if (!product) {
      product = products.find(p => 
        (p.label && p.label.toLowerCase().includes(normalizedLabel)) || 
        (p.nombre && p.nombre.toLowerCase().includes(normalizedLabel))
      );
    }
    
    // Si aún no hay coincidencia, intentar con el normalizedLabel como subcadena
    if (!product && normalizedLabel.length > 3) {
      product = products.find(p => 
        (p.label && normalizedLabel.includes(p.label.toLowerCase())) || 
        (p.nombre && normalizedLabel.includes(p.nombre.toLowerCase()))
      );
    }
    
    // Registrar el resultado
    if (product) {
      console.log("Producto encontrado:", product);
    } else {
      console.log("No se encontró el producto con label:", label);
    }
    
    return product;
  }, [products]);

  // Añadir producto detectado al carrito
  const addDetectedProductToCart = useCallback((label, productInfo = null) => {
    // Validar entradas
    if (!label && !productInfo) {
      console.log("Error: No se proporcionó etiqueta ni información de producto");
      setError("No se pudo identificar el producto");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const labelToUse = label || productInfo?.nombre || productInfo?.label || "Producto desconocido";
    console.log(`Intentando añadir al carrito: "${labelToUse}"`);
    
    // CASO 1: Si tenemos información completa del producto validada
    if (productInfo && productInfo.id) {
      try {
        console.log("Usando información directa del producto:", productInfo);
        
        // Verificar stock disponible
        const stockDisponible = productInfo.cantidad !== undefined 
          ? productInfo.cantidad 
          : (productInfo.stock || 0);
          
        if (stockDisponible <= 0) {
          console.log(`Producto sin stock disponible (${stockDisponible}):`, productInfo);
          setError(`${labelToUse}: Sin stock disponible`);
          setTimeout(() => setError(null), 3000);
          return;
        }
        
        // Añadir al carrito
        addToCart(productInfo);
        toast.success(`${productInfo.nombre || labelToUse} añadido al carrito`);
        
        // Guardar referencia del último producto añadido
        if (typeof setLastAddedProduct === 'function') {
          setLastAddedProduct(productInfo);
          setTimeout(() => setLastAddedProduct(null), 2000);
        }
        return;
      } catch (err) {
        console.error("Error al procesar información del producto:", err);
      }
    }
    
    // CASO 2: Buscar el producto por etiqueta
    if (label) {
      const product = findProductByLabel(label);
      if (product) {
        addDetectedProductToCart(null, product);
        return;
      }
    }
    
    // Si llegamos aquí, no se pudo añadir el producto
    setError(`No se encontró el producto: ${labelToUse}`);
    setTimeout(() => setError(null), 3000);
  }, [findProductByLabel, addToCart, setLastAddedProduct, setError]);

  // Detector de imagen
  const detectFromImage = useCallback(async (imageData) => {
    if (!imageData) {
      console.log("Error: No hay datos de imagen para procesar");
      setError("No hay imagen para procesar");
      setTimeout(() => setError(null), 3000);
      return null;
    }
    
    try {
      setDetectionLoading(true);
      console.log("Iniciando detección de imagen...");
      
      const response = await apiService.triggerDetection(imageData);
      console.log("Respuesta del backend:", response);
      
      // Verificar que la respuesta sea válida
      if (!response) {
        throw new Error("La respuesta del servidor está vacía");
      }
      
      // Extraer la detección según el formato de respuesta
      let detection = null;
      let detectionSource = "";
      
      if (response.success && response.detection) {
        detection = response.detection;
        detectionSource = "formato-success";
      } else if (response.detections && response.detections.length > 0) {
        const sortedDetections = [...response.detections].sort(
          (a, b) => (b.confidence || b.score || 0) - (a.confidence || a.score || 0)
        );
        detection = sortedDetections[0];
        detectionSource = "formato-array";
      } else if (response.detection) {
        detection = response.detection;
        detectionSource = "formato-legacy";
      } else {
        console.log("No se encontró una estructura de detección válida en la respuesta:", response);
        setError("No se pudo interpretar la respuesta del servidor");
        setTimeout(() => setError(null), 3000);
        return null;
      }
      
      // Si tenemos una detección válida
      if (detection) {
        const detectionLabel = detection.label || detection.class || detection.name || "Desconocido";
        const confidenceValue = detection.confidence || detection.score || detection.similarity / 100 || 0.5;
        const similarityPercent = detection.similarity || Math.round(confidenceValue * 100);
        
        console.log(`Objeto detectado: "${detectionLabel}" (confianza: ${similarityPercent}%) [fuente: ${detectionSource}]`);
        
        let productInfo = findProductByLabel(detectionLabel);
        
        const formattedDetection = {
          ...detection,
          label: detectionLabel,
          confidence: confidenceValue,
          similarity: similarityPercent,
          timestamp: new Date().toISOString(),
          productInfo: productInfo,
          source: detectionSource
        };
        
        setLastDetection(formattedDetection);
        console.log("Detección procesada:", formattedDetection);
        
        if (similarityPercent >= 70) {
          return formattedDetection;
        } else {
          console.log(`Confianza insuficiente: ${similarityPercent}%`);
          setError(`Detección poco confiable (${similarityPercent}%). Intente nuevamente.`);
          setTimeout(() => setError(null), 3000);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Error en la detección:", error);
      setError(`Error en el proceso de detección: ${error.message || "Error desconocido"}`);
      setTimeout(() => setError(null), 3000);
      return null;
    } finally {
      setDetectionLoading(false);
    }
  }, [findProductByLabel, setError]);

  // Renderizar la animación del escáner
  const renderScannerAnimation = () => (
    <motion.div 
      className="text-center p-4 bg-light rounded scanner-animation"
      animate={{
        boxShadow: ["0 0 0 rgba(0,123,255,0)", "0 0 20px rgba(0,123,255,0.7)", "0 0 0 rgba(0,123,255,0)"]
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }}
    >
      <div className="scanner-icon-container mb-3">
        <motion.div
          className="scanner-line"
          animate={{
            top: ["0%", "90%", "0%"]
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
        <FaBarcode className="scanner-barcode-icon" />
        <motion.div 
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
        >
          <FaBox className="scanner-product-icon" />
        </motion.div>
      </div>
      <h3 className="text-primary">Escanear Producto</h3>
      <p className="text-muted mb-0">Coloque el producto frente a la cámara</p>
    </motion.div>
  );

  // Activar detección manual
  const handleScanProduct = useCallback(async () => {
    setShowWebcam(true);
    
    setTimeout(async () => {
      if (webcamRef.current) {
        const frame = await captureFrame();
        if (frame) {
          const detection = await detectFromImage(frame);
          
          if (detection && detection.productInfo) {
            addDetectedProductToCart(detection.label, detection.productInfo);
          }
          
          // Ocultar la webcam después de la detección
          setTimeout(() => setShowWebcam(false), 500);
        } else {
          setError("No se pudo capturar la imagen");
          setTimeout(() => setError(null), 3000);
          setShowWebcam(false);
        }
      }
    }, 1000);
  }, [captureFrame, detectFromImage, addDetectedProductToCart]);

  // Efecto para detección continua
  useEffect(() => {
    let detectionInterval;
    
    if (continuousDetection) {
      detectionInterval = setInterval(async () => {
        if (!detectionLoading) {
          setShowWebcam(true);
          
          setTimeout(async () => {
            const frame = await captureFrame();
            if (frame) {
              const detection = await detectFromImage(frame);
              
              if (detection && detection.productInfo) {
                addDetectedProductToCart(detection.label, detection.productInfo);
              }
              
              // Ocultar la webcam después de la detección
              setTimeout(() => setShowWebcam(false), 500);
            }
          }, 1000);
        }
      }, 3000); // Intentar detección cada 3 segundos
    }
    
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [continuousDetection, detectionLoading, captureFrame, detectFromImage, addDetectedProductToCart]);

  return (
    <Container fluid className="pos-container">
      {error && (
        <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={5}>
          <div className="detection-panel p-4 bg-white shadow-sm rounded">
            {/* Animación del escáner */}
            {renderScannerAnimation()}

            {/* Botón de escaneo */}
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                className="mb-3 mt-3"
                onClick={handleScanProduct}
                disabled={detectionLoading}
              >
                {detectionLoading ? 'Escaneando...' : 'Escanear Producto'}
              </Button>

              {/* Control de escaneo continuo como slider */}
              <div className="mb-3">
                <Form.Label className="d-flex justify-content-between">
                  <span>Detección continua</span>
                  <span className={continuousDetection ? "text-primary fw-bold" : "text-muted"}>
                    {continuousDetection ? "Activado" : "Desactivado"}
                  </span>
                </Form.Label>
                <Form.Range 
                  min={0}
                  max={1}
                  step={1}
                  value={continuousDetection ? 1 : 0}
                  onChange={e => setContinuousDetection(e.target.value === '1')}
                />
              </div>
            </div>

            {/* Mostrar última detección */}
            {lastDetection && (
              <div className="last-detection p-3 border rounded bg-light mt-3">
                <h5>Última detección: <span className="text-primary">{lastDetection.label}</span></h5>
                <p className="mb-2">
                  Confianza: <span className="badge bg-info">{lastDetection.similarity.toFixed(1)}%</span>
                </p>
                
                {lastDetection.productInfo ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => addDetectedProductToCart(lastDetection.label, lastDetection.productInfo)}
                  >
                    Añadir al Carrito
                  </Button>
                ) : (
                  <p className="text-danger small mb-0">Producto no encontrado en inventario</p>
                )}
              </div>
            )}
          </div>
        </Col>
        
        <Col md={7}>
          <div className="cart-panel h-100 p-4 bg-white shadow-sm rounded">
            <h3 className="mb-3 text-primary">Carrito de Compras</h3>
            
            <div className="cart-container" style={{maxHeight: '300px', overflowY: 'auto'}}>
              <ShoppingCart
                items={cartItems}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
              />
            </div>
            
            <div className="checkout-section border-top pt-3 mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Total:</h4>
                <h3 className="mb-0 text-primary">${calculateTotal().toFixed(2)}</h3>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={() => {
                  console.log("Abriendo modal de pago...");
                  setShowPaymentModal(true);
                }}
                disabled={cartItems.length === 0 || loading}
              >
                Procesar Pago
              </Button>
            </div>
          </div>
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

      {/* Webcam oculta (para capturar imágenes) */}
      {showWebcam && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "environment",
              width: 640,
              height: 480
            }}
          />
        </div>
      )}

      {/* Modal de pago */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountReceived={amountReceived}
        setAmountReceived={setAmountReceived}
        clientName={clientName}
        setClientName={setClientName}
        total={calculateTotal()}
        handleProcessSale={processSale}
        loading={paymentLoading}
      />
    </Container>
  );
};

export default POSView;