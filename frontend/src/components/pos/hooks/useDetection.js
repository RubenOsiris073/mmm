import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import DetectionService from '../services/DetectionService';

/**
 * Custom hook to manage product detection functionality
 */
const useDetection = ({ products, addToCart, setError }) => {
  const [lastDetection, setLastDetection] = useState(null);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const webcamRef = useRef(null);

  // Verificar si la webcam está lista
  const checkWebcamReady = useCallback(() => {
    if (!webcamRef.current) return false;
    
    const video = webcamRef.current.video;
    return video && 
           video.readyState === 4 && 
           video.videoWidth > 0 && 
           video.videoHeight > 0;
  }, []);

  // Capturar frame de la webcam
  const captureFrame = useCallback(async () => {
    try {
      if (!isWebcamReady || !webcamRef.current) {
        throw new Error("La webcam no está lista para capturar frames");
      }
      
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error("No se pudo obtener la imagen de la cámara");
      }
      
      return imageSrc;
    } catch (error) {
      setError(`Error al capturar imagen: ${error.message}`);
      setTimeout(() => setError(null), 3000);
      return null;
    }
  }, [isWebcamReady, setError]);

  // Detectar productos desde imagen
  const detectFromImage = useCallback(async (imageData) => {
    try {
      setDetectionLoading(true);
      
      const detection = await DetectionService.detectFromImage(imageData);
      const productInfo = DetectionService.findProductByLabel(detection.label, products);
      
      const formattedDetection = {
        ...detection,
        productInfo
      };
      
      setLastDetection(formattedDetection);
      return formattedDetection;
    } catch (error) {
      console.error("Error en la detección:", error);
      setError(`Error en el proceso de detección: ${error.message}`);
      setTimeout(() => setError(null), 3000);
      return null;
    } finally {
      setDetectionLoading(false);
    }
  }, [products, setError]);

  // Añadir producto detectado al carrito
  const addDetectedProductToCart = useCallback((label, productInfo = null) => {
    if (!label && !productInfo) {
      setError("No se pudo identificar el producto");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const labelToUse = label || productInfo?.nombre || "Producto desconocido";
    
    if (productInfo && productInfo.id) {
      const stockDisponible = productInfo.cantidad !== undefined 
        ? productInfo.cantidad 
        : (productInfo.stock || 0);
        
      if (stockDisponible <= 0) {
        setError(`${labelToUse}: Sin stock disponible`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      addToCart(productInfo);
      toast.success(`${productInfo.nombre || labelToUse} añadido al carrito`);
      return;
    }
    
    if (label) {
      const product = DetectionService.findProductByLabel(label, products);
      if (product) {
        addDetectedProductToCart(null, product);
        return;
      }
    }
    
    setError(`No se encontró el producto: ${labelToUse}`);
    setTimeout(() => setError(null), 3000);
  }, [products, addToCart, setError]);

  return {
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
  };
};

export default useDetection;