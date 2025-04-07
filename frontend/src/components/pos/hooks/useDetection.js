import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

/**
 * Custom hook to manage product detection functionality
 */
const useDetection = ({ products, addToCart, setError }) => {
  const [lastDetection, setLastDetection] = useState(null);
  const [continuousDetection, setContinuousDetection] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const captureFrame = async () => {
    try {
      // Verificar que la referencia a webcam existe y está inicializada
      if (!webcamRef.current) {
        console.log("La referencia a la webcam no está disponible");
        return null;
      }
      
      // Verificar que el video está listo
      if (!webcamRef.current.video || 
          webcamRef.current.video.readyState !== 4) {
        console.log("El video de la webcam no está listo", 
                   webcamRef.current.video ? 
                   `(readyState: ${webcamRef.current.video.readyState})` : 
                   "(video no disponible)");
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
      return null;
    }
  };

  const handleManualDetection = async () => {
    try {
      const frame = await captureFrame();
      if (!frame) {
        console.log("Error en detección manual: No se pudo capturar el frame");
        return;
      }
      // Resto del código que procesa el frame
    } catch (error) {
      console.log("Error en detección manual:", error);
    }
  };
  
  // Define addDetectedProductToCart first to avoid 'h' reference error
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
            if (latestDetection.similarity > 70) {
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
    }, 2000);

    return () => clearInterval(interval);
  }, [continuousDetection, lastDetection, addDetectedProductToCart]);

  // Cambiar modo de detección continua
  const toggleContinuousDetection = useCallback(async () => {
    try {
      setLoading(true);
      const newStatus = !continuousDetection;

      const result = await apiService.setDetectionMode(newStatus);
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
  }, [continuousDetection, setError]);

  // Realizar detección manual
  const triggerManualDetection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Iniciando detección manual...");
      const frameData = await captureFrame();
      if (!frameData) {
        throw new Error("No se pudo capturar el frame");
      }

      const result = await apiService.triggerDetection(frameData);
      console.log("Resultado de detección:", result);

      if (result && result.detection) {
        setLastDetection(result.detection);

        if (result.detection.similarity > 70) {
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
    } catch (err) {
      console.error("Error en detección manual:", err);
      setError("Error al realizar detección. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [setError, addDetectedProductToCart]);

  return {
    lastDetection,
    continuousDetection,
    loading,
    toggleContinuousDetection,
    triggerManualDetection,
    addDetectedProductToCart
  };
};

export default useDetection;