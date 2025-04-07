import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

/**
 * Custom hook to manage product detection functionality
 */
const useDetection = ({ products, addToCart, setError, options = {} }) => {
  // Opciones configurables
  const {
    autoStart = false,
    detectionInterval = 3000,
    confidenceThreshold = 0.7,
    maxConcurrentDetections = 1
  } = options;

  const [lastDetection, setLastDetection] = useState(null);
  const [continuousDetection, setContinuousDetection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const webcamRef = useRef(null);
  const activeDetections = useRef(0);

  // Función para verificar si la webcam está lista
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
  }, [isWebcamReady, setError]);

  // Función para detectar a partir de una imagen
  const detectFromImage = useCallback(async (imageData) => {
    if (activeDetections.current >= maxConcurrentDetections) {
      console.log("Máximo de detecciones concurrentes alcanzado. Esperando...");
      return;
    }
    
    try {
      activeDetections.current += 1;
      
      const result = await apiService.triggerDetection(imageData);
      console.log("Resultado de detección:", result);
      
      if (result && result.detection) {
        setLastDetection(result.detection);

        if (result.detection.similarity > confidenceThreshold * 100) {
          // Usar la información del producto si está disponible
          addDetectedProductToCart(
            result.detection.label,
            result.detection.productInfo
          );
        } else {
          setError(`Detección poco confiable (${result.detection.similarity}%). Intente nuevamente.`);
          setTimeout(() => setError(null), 3000);
        }
      } else {
        throw new Error("La respuesta de detección no tiene el formato esperado");
      }
      
      return result;
    } catch (error) {
      console.log("Error en la detección:", error.message);
      setError(`Error en la detección: ${error.message}`);
    } finally {
      activeDetections.current -= 1;
    }
  }, [addDetectedProductToCart, confidenceThreshold, setError]);
  
  // Define addDetectedProductToCart first to avoid reference error
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
    const normalizedLabel = productLabel.toString().toLowerCase().trim();
    
    // Buscar entre los productos cargados (que ya tienen stock)
    const matchingProducts = products.filter(p => 
      (p.label && p.label.toLowerCase() === normalizedLabel) ||
      (p.nombre && p.nombre.toLowerCase().includes(normalizedLabel))
    );
    
    if (matchingProducts.length === 0) {
      console.log(`No se encontró producto para: ${productLabel}`);
      setError(`No se encontró producto: ${productLabel}`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Usar el primer resultado
    const product = matchingProducts[0];
    console.log("Producto encontrado por etiqueta:", product);
    
    // Verificar stock y añadir
    if (product.stock && product.stock > 0) {
      addToCart(product);
    } else {
      setError(`${product.nombre}: Sin stock disponible`);
      setTimeout(() => setError(null), 3000);
    }
  }, [products, addToCart, setError]);

  // Verificar detecciones continuas
  useEffect(() => {
    if (!continuousDetection) return;

    console.log("Iniciando verificación de detecciones continuas");

    const interval = setInterval(async () => {
      try {
        console.log("Verificando nuevas detecciones...");
        const response = await apiService.getDetections();
        const detections = response?.detections || [];

        if (detections && detections.length > 0) {
          const latestDetection = detections[0]; // La más reciente

          // Solo procesar si es una detección nueva
          if (!lastDetection || lastDetection.id !== latestDetection.id) {
            console.log("Nueva detección encontrada:", latestDetection);
            setLastDetection(latestDetection);

            // Si la detección es confiable, añadir al carrito
            if (latestDetection.similarity > confidenceThreshold * 100) {
              addDetectedProductToCart(
                latestDetection.label,
                latestDetection.productInfo
              );
            }
          }
        }
      } catch (err) {
        console.error("Error verificando detecciones:", err);
        // No mostrar error en UI para no interrumpir la experiencia
      }
    }, detectionInterval);

    return () => clearInterval(interval);
  }, [continuousDetection, lastDetection, addDetectedProductToCart, confidenceThreshold, detectionInterval]);

  // Manejar detección automática
  useEffect(() => {
    let interval = null;
    
    if (continuousDetection && autoStart && isWebcamReady) {
      interval = setInterval(async () => {
        await triggerManualDetection();
      }, detectionInterval);
      
      console.log(`Detección automática iniciada (cada ${detectionInterval}ms)`);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("Detección automática detenida");
      }
    };
  }, [continuousDetection, autoStart, isWebcamReady, detectionInterval]);

  // Cambiar modo de detección continua
  const toggleContinuousDetection = useCallback(async () => {
    try {
      setLoading(true);
      const newStatus = !continuousDetection;

      const result = await apiService.setDetectionMode(newStatus, detectionInterval);
      console.log(`Modo detección continua ${newStatus ? 'activado' : 'desactivado'}:`, result);

      setContinuousDetection(newStatus);

      toast.info(
        newStatus
          ? "Modo de detección continua activado"
          : "Modo de detección continua desactivado"
      );
    } catch (err) {
      console.error("Error cambiando modo de detección:", err);
      setError("Error al cambiar modo de detección");
    } finally {
      setLoading(false);
    }
  }, [continuousDetection, detectionInterval, setError]);

  // Realizar detección manual
  const triggerManualDetection = useCallback(async () => {
    if (activeDetections.current >= maxConcurrentDetections) {
      console.log("Ya hay una detección en curso. Espere un momento.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      activeDetections.current += 1;

      console.log("Iniciando detección manual...");
      const frameData = await captureFrame();
      if (!frameData) {
        throw new Error("No se pudo capturar imagen de la cámara");
      }

      return await detectFromImage(frameData);
    } catch (err) {
      console.error("Error en detección manual:", err);
      setError("Error al realizar detección. Intenta nuevamente.");
      return null;
    } finally {
      activeDetections.current -= 1;
      setLoading(false);
    }
  }, [captureFrame, detectFromImage, maxConcurrentDetections, setError]);

  return {
    webcamRef,
    lastDetection,
    continuousDetection,
    loading,
    isWebcamReady,
    toggleContinuousDetection,
    triggerManualDetection,
    addDetectedProductToCart,
    startDetection: () => setContinuousDetection(true),
    stopDetection: () => setContinuousDetection(false),
    clearError: () => setError(null)
  };
};

export default useDetection;