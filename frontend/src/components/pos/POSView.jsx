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
    setLastAddedProduct,
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

  // Buscar producto por etiqueta con método simplificado y más depuración
  const findProductByLabel = useCallback((label) => {
    if (!label) return null;
    
    // Depuración - ver qué estamos buscando
    console.log(`Buscando producto con label: "${label}"`);
    
    // Depuración - verificar los productos disponibles
    console.log("Productos disponibles:", products.map(p => ({
      nombre: p.nombre,
      id: p.id,
      fields: Object.keys(p)
    })));
    
    // Búsqueda más flexible
    const product = products.find(p => {
      // Si el producto no tiene nombre, lo ignoramos
    });
  }, [products]);

  // Añadir producto detectado al carrito - versión final mejorada
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
    
    // CASO 1: Si tenemos información completa del producto validada, usarla directamente
    if (productInfo && productInfo.id) {
      try {
        console.log("Usando información directa del producto:", productInfo);
        
        // Verificar stock
        if (productInfo.stock !== undefined && productInfo.stock <= 0) {
          console.log("Producto sin stock disponible:", productInfo);
          setError(`${labelToUse}: Sin stock disponible`);
          setTimeout(() => setError(null), 3000);
          return;
        }
        
        // Asegurar que el producto tenga todos los campos necesarios
        const normalizedProduct = {
          id: productInfo.id,
          nombre: productInfo.nombre || productInfo.label || "Producto sin nombre",
          precio: typeof productInfo.precio === 'number' ? productInfo.precio : parseFloat(productInfo.precio || 0),
          imagen: productInfo.imagen || null,
          stock: productInfo.stock,
          categoria: productInfo.categoria || 'general'
        };
        
        addToCart(normalizedProduct);
        toast.success(`${normalizedProduct.nombre} añadido al carrito`);
        setLastAddedProduct(normalizedProduct);
        
        // Restablecimiento automático
        setTimeout(() => setLastAddedProduct(null), 3000);
        return;
      } catch (err) {
        console.error("Error al procesar información del producto:", err);
        // Continuar con el siguiente método si falla este
      }
    }
    
    // CASO 2: Buscar el producto utilizando la función especializada
    if (label) {
      try {
        console.log("Buscando producto por label:", label);
        const product = findProductByLabel(label);
        
        if (product) {
          // Verificar stock
          if (product.stock !== undefined && product.stock <= 0) {
            console.log("Producto sin stock disponible:", product);
            setError(`${product.nombre}: Sin stock disponible`);
            setTimeout(() => setError(null), 3000);
            return;
          }
          
          console.log("Producto encontrado, añadiendo al carrito:", product);
          addToCart(product);
          toast.success(`${product.nombre || label} añadido al carrito`);
          setLastAddedProduct(product);
          setTimeout(() => setLastAddedProduct(null), 3000);
          return;
        }
      } catch (err) {
        console.error("Error en búsqueda exacta:", err);
        // Continuar con método de recuperación
      }
    }
    
    // CASO 3: Método de recuperación avanzado - búsqueda por partes de palabras
    console.log("⚠️ Iniciando recuperación avanzada para:", label || labelToUse);
    
    try {
      // Normalizar y dividir en palabras
      const normalizeText = text => {
        if (!text) return '';
        return String(text).toLowerCase()
          .trim()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita acentos
      };
      
      const textToSearch = normalizeText(label || labelToUse);
      const wordParts = textToSearch.split(/[\s\-_.,]+/).filter(part => part.length >= 3);
      
      console.log("Buscando por partes de palabras:", wordParts);
      
      // Primera pasada: buscar coincidencias completas de palabras
      for (const part of wordParts) {
        // Ignorar palabras muy comunes o cortas
        if (['con', 'los', 'las', 'por', 'para', 'del', 'una', 'uno'].includes(part)) continue;
        
        const matchingProducts = products.filter(p => {
          const productName = normalizeText(p.nombre || '');
          const productLabel = normalizeText(p.label || '');
          
          // Buscar la palabra como token completo
          const nameTokens = productName.split(/[\s\-_.,]+/);
          const labelTokens = productLabel.split(/[\s\-_.,]+/);
          
          return nameTokens.includes(part) || labelTokens.includes(part);
        });
        
        if (matchingProducts.length > 0) {
          // Ordenar por relevancia (longitud similar al original)
          matchingProducts.sort((a, b) => {
            const aName = normalizeText(a.nombre || a.label || '');
            const bName = normalizeText(b.nombre || b.label || '');
            return Math.abs(aName.length - textToSearch.length) - Math.abs(bName.length - textToSearch.length);
          });
          
          const bestMatch = matchingProducts[0];
          
          // Verificar stock
          if (bestMatch.stock !== undefined && bestMatch.stock <= 0) {
            continue; // Probar con otra palabra
          }
          
          console.log(`Recuperación exitosa usando palabra "${part}":`, bestMatch);
          
          // Confirmar con el usuario si el producto es muy diferente
          const similarity = normalizeText(bestMatch.nombre || bestMatch.label || '').includes(textToSearch) ? 'alta' : 'posible';
          
          if (similarity === 'posible' && !window.confirm(`¿Desea añadir "${bestMatch.nombre}" al carrito?`)) {
            console.log("Usuario rechazó la coincidencia");
            continue;
          }
          
          addToCart(bestMatch);
          toast.success(`${bestMatch.nombre} añadido al carrito`);
          setLastAddedProduct(bestMatch);
          setTimeout(() => setLastAddedProduct(null), 3000);
          return;
        }
      }
      
      // Segunda pasada: buscar coincidencias parciales de palabras
      for (const part of wordParts) {
        if (part.length < 4) continue; // Para parciales exigimos mínimo 4 caracteres
        
        const matchingProducts = products.filter(p => {
          const productName = normalizeText(p.nombre || '');
          const productLabel = normalizeText(p.label || '');
          
          return productName.includes(part) || productLabel.includes(part);
        });
        
        if (matchingProducts.length > 0) {
          // Ordenar por relevancia 
          const bestMatch = matchingProducts[0];
          
          if (bestMatch.stock !== undefined && bestMatch.stock <= 0) {
            continue;
          }
          
          console.log(`Recuperación parcial usando fragmento "${part}":`, bestMatch);
          
          // Siempre confirmar para coincidencias parciales
          if (window.confirm(`¿Desea añadir "${bestMatch.nombre}" al carrito?`)) {
            addToCart(bestMatch);
            toast.success(`${bestMatch.nombre} añadido al carrito`);
            setLastAddedProduct(bestMatch);
            setTimeout(() => setLastAddedProduct(null), 3000);
            return;
          } else {
            console.log("Usuario rechazó la coincidencia parcial");
          }
        }
      }
      
      // No se encontró ninguna coincidencia
      console.log("No se encontró ningún producto similar");
      setError(`No se encontró ningún producto para: "${labelToUse}"`);
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      console.error("Error en recuperación avanzada:", err);
      setError("Error al buscar producto similar");
      setTimeout(() => setError(null), 3000);
    }
  }, [products, findProductByLabel, addToCart, setLastAddedProduct, setError, toast]);

  // Detector de imagen mejorado
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
      
      // Caso 1: el backend devuelve {success: true, detection: {...}}
      if (response.success && response.detection) {
        detection = response.detection;
        detectionSource = "formato-success";
      }
      // Caso 2: el backend devuelve {detections: [...]}
      else if (response.detections && response.detections.length > 0) {
        // Ordenar por confianza y tomar la mejor detección
        const sortedDetections = [...response.detections].sort(
          (a, b) => (b.confidence || b.score || 0) - (a.confidence || a.score || 0)
        );
        detection = sortedDetections[0];
        detectionSource = "formato-array";
      }
      // Caso 3: el backend devuelve directamente {detection: {...}} (formato antiguo)
      else if (response.detection) {
        detection = response.detection;
        detectionSource = "formato-legacy";
      }
      // Caso 4: No se pudo extraer una detección válida
      else {
        console.log("No se encontró una estructura de detección válida en la respuesta:", response);
        setError("No se pudo interpretar la respuesta del servidor");
        setTimeout(() => setError(null), 3000);
        return null;
      }
      
      // Si tenemos una detección válida
      if (detection) {
        // Extraer y normalizar datos importantes
        const detectionLabel = detection.label || detection.class || detection.name || "Desconocido";
        const confidenceValue = detection.confidence || detection.score || detection.similarity / 100 || 0.5;
        const similarityPercent = detection.similarity || Math.round(confidenceValue * 100);
        
        console.log(`Objeto detectado: "${detectionLabel}" (confianza: ${similarityPercent}%) [fuente: ${detectionSource}]`);
        
        // Buscar información del producto correspondiente
        const productInfo = findProductByLabel(detectionLabel);
        
        // Formatear la detección para mostrar en la UI y retornar al componente
        const formattedDetection = {
          ...detection,
          label: detectionLabel,
          confidence: confidenceValue,
          similarity: similarityPercent,
          timestamp: new Date().toISOString(),
          productInfo: productInfo,
          source: detectionSource
        };
        
        // Actualizar el estado con la última detección
        setLastDetection(formattedDetection);
        console.log("Detección procesada:", formattedDetection);
        
        // Verificar si la confianza es suficiente
        if (similarityPercent >= 70) { // Umbral configurable
          return formattedDetection;
        } else {
          console.log(`Confianza insuficiente: ${similarityPercent}%`);
          setError(`Detección poco confiable (${similarityPercent}%). Intente nuevamente.`);
          setTimeout(() => setError(null), 3000);
          return null;
        }
      } else {
        console.log("No se encontró ninguna detección en la respuesta");
        setError("No se detectaron productos en la imagen");
        setTimeout(() => setError(null), 3000);
        return null;
      }
    } catch (error) {
      console.error("Error en la detección:", error);
      setError(`Error en el proceso de detección: ${error.message || "Error desconocido"}`);
      setTimeout(() => setError(null), 3000);
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