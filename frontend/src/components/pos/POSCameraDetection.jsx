import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaCamera, FaStop, FaSync, FaShoppingCart } from 'react-icons/fa';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import './styles/POSCameraDetection.css';

const POSCameraDetection = ({ onProductDetected, products, loading }) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const webcamRef = useRef(null);

  // Mapeo de clases detectadas a productos
  const classToProductMapping = {
    'Barrita': 'barrita',
    'Botella': 'botella', 
    'Chicle': 'chicle'
  };

  // Start webcam
  const startWebcam = useCallback(() => {
    try {
      setWebcamError(null);
      setIsWebcamActive(true);
      toast.info('Cámara activada. Coloca un producto frente a la cámara.');
    } catch (error) {
      console.error('Error starting webcam:', error);
      setWebcamError('No se pudo iniciar la cámara. Verifique los permisos.');
      toast.error('Error al iniciar la cámara');
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    setIsWebcamActive(false);
    setLastDetection(null);
    toast.info('Cámara desactivada');
  }, []);

  // Handle webcam error
  const handleWebcamError = useCallback((error) => {
    console.error('Webcam error:', error);
    setWebcamError('Error de cámara: ' + error.message);
    setIsWebcamActive(false);
    toast.error('Error de cámara');
  }, []);

  // Find product by detection class
  const findProductByDetection = useCallback((detectionLabel) => {
    const productCode = classToProductMapping[detectionLabel];
    if (!productCode) return null;

    // Buscar producto que contenga el código en el nombre o código
    return products.find(product => 
      product.codigo?.toLowerCase().includes(productCode) ||
      product.nombre?.toLowerCase().includes(productCode) ||
      product.name?.toLowerCase().includes(productCode)
    );
  }, [products]);

  // Capture frame and send for detection
  const captureAndDetect = useCallback(async () => {
    if (!webcamRef.current || !isWebcamActive) {
      setWebcamError('Cámara no está lista');
      return;
    }

    try {
      setIsDetecting(true);
      setWebcamError(null);

      // Capture screenshot from webcam
      const imageData = webcamRef.current.getScreenshot();
      
      if (!imageData) {
        throw new Error('No se pudo capturar la imagen');
      }
      
      console.log('Enviando imagen para detección...');
      
      // Send to backend for detection
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/detection/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Detection result:', result);

      if (result.success && result.detection) {
        const detection = {
          label: result.detection.label,
          similarity: result.detection.similarity,
          confidence: result.detection.confidence || result.detection.similarity,
          timestamp: new Date().toISOString()
        };

        setLastDetection(detection);

        // Check if detection confidence is high enough
        if (detection.similarity >= 70) {
          // Find matching product
          const matchedProduct = findProductByDetection(detection.label);
          
          if (matchedProduct) {
            // Check if product has stock
            const stock = matchedProduct.cantidad || matchedProduct.stock || 0;
            if (stock > 0) {
              toast.success(`¡${detection.label} detectado! Agregando al carrito...`);
              onProductDetected?.(matchedProduct, detection);
            } else {
              toast.warning(`${detection.label} detectado pero sin stock disponible`);
              setWebcamError(`Producto detectado: ${detection.label}, pero sin stock disponible`);
            }
          } else {
            toast.warning(`${detection.label} detectado pero no encontrado en inventario`);
            setWebcamError(`Producto detectado: ${detection.label}, pero no está registrado en el sistema`);
          }
        } else {
          setWebcamError(`Detección poco confiable (${detection.similarity}%). Intente de nuevo con mejor iluminación.`);
          toast.warning('Detección poco confiable. Intente de nuevo.');
        }
      } else {
        setWebcamError('No se pudo detectar ningún producto. Intente de nuevo.');
        toast.warning('No se detectó ningún producto');
      }
    } catch (error) {
      console.error('Detection error:', error);
      setWebcamError('Error en la detección: ' + error.message);
      toast.error('Error en la detección');
    } finally {
      setIsDetecting(false);
    }
  }, [isWebcamActive, onProductDetected, findProductByDetection]);

  return (
    <Card className="detection-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaCamera className="me-2" />
          Detección de Productos
        </h6>
        <Badge bg={isWebcamActive ? 'success' : 'secondary'}>
          {isWebcamActive ? 'Activa' : 'Inactiva'}
        </Badge>
      </Card.Header>
      
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="camera-container">
              {!isWebcamActive ? (
                <div className="text-center py-4 bg-light rounded">
                  <FaCamera size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-3">Activa la cámara para detectar productos automáticamente</p>
                  <Button 
                    variant="primary" 
                    onClick={startWebcam}
                    disabled={loading}
                  >
                    <FaCamera className="me-2" />
                    Activar Cámara
                  </Button>
                </div>
              ) : (
                <div className="position-relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    width={640}
                    height={360}
                    onUserMediaError={handleWebcamError}
                    className="w-100 rounded"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                    videoConstraints={{
                      width: 640,
                      height: 360,
                      facingMode: 'environment'
                    }}
                  />
                  <div className="position-absolute top-0 start-0 p-2">
                    <div className="bg-dark bg-opacity-75 text-white px-2 py-1 rounded small">
                      {isDetecting ? 'Detectando...' : 'Listo para detectar'}
                    </div>
                  </div>
                  {lastDetection && (
                    <div className="position-absolute top-0 end-0 p-2">
                      <div className="bg-success bg-opacity-90 text-white px-2 py-1 rounded small">
                        {lastDetection.label} ({lastDetection.similarity}%)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Col>
          
          <Col md={4}>
            <div className="controls-panel">
              {isWebcamActive && (
                <div className="d-grid gap-2 mb-3">
                  <Button
                    variant="success"
                    onClick={captureAndDetect}
                    disabled={isDetecting || loading}
                  >
                    {isDetecting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Detectando...
                      </>
                    ) : (
                      <>
                        <FaSync className="me-2" />
                        Detectar Producto
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-danger"
                    onClick={stopWebcam}
                    disabled={loading}
                  >
                    <FaStop className="me-2" />
                    Detener Cámara
                  </Button>
                </div>
              )}

              {lastDetection && (
                <Card className="mb-3" size="sm">
                  <Card.Header className="py-2">
                    <small>Última Detección</small>
                  </Card.Header>
                  <Card.Body className="py-2">
                    <p className="mb-1 small">
                      <strong>Producto:</strong> {lastDetection.label}
                    </p>
                    <p className="mb-1 small">
                      <strong>Confianza:</strong> {lastDetection.similarity}%
                    </p>
                    <p className="mb-0">
                      <small className="text-muted">
                        {new Date(lastDetection.timestamp).toLocaleTimeString()}
                      </small>
                    </p>
                  </Card.Body>
                </Card>
              )}

              <div className="instructions">
                <h6 className="small">Productos Detectables:</h6>
                <ul className="small text-muted mb-0">
                  <li>Barrita</li>
                  <li>Botella</li>
                  <li>Chicle</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>

        {webcamError && (
          <Alert variant="warning" className="mt-3 mb-0">
            <small>{webcamError}</small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default POSCameraDetection;