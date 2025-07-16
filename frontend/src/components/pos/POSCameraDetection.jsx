import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaCamera, FaStop, FaSync } from 'react-icons/fa';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import './styles/POSCameraDetection.css';

const POSCameraDetection = ({ onProductDetected, products, loading }) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const [detectionStats, setDetectionStats] = useState({ total: 0, successful: 0 });
  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);
  const detectionCacheRef = useRef(new Map());

  // Mapeo de clases detectadas a productos
  const classToProductMapping = {
    'Barrita': 'barrita',
    'Botella': 'botella', 
    'Chicle': 'chicle'
  };

  // Helper functions defined as regular functions to avoid hoisting issues
  const findProductByDetection = (detectionLabel) => {
    const productCode = classToProductMapping[detectionLabel];
    if (!productCode) return null;

    return products.find(product => 
      product.codigo?.toLowerCase().includes(productCode) ||
      product.nombre?.toLowerCase().includes(productCode) ||
      product.name?.toLowerCase().includes(productCode)
    );
  };

  const optimizeImage = (imageData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(img, 0, 0, 224, 224);
        const optimizedData = canvas.toDataURL('image/jpeg', 0.7);
        resolve(optimizedData);
      };
      
      img.src = imageData;
    });
  };

  // Fast detection with cache and throttling
  const performFastDetection = useCallback(async (isContinuous = false) => {
    if (!webcamRef.current || !isWebcamActive) {
      return null;
    }

    const now = Date.now();
    if (isContinuous && now - lastDetectionTimeRef.current < 1500) {
      return null;
    }
    lastDetectionTimeRef.current = now;

    try {
      if (!isContinuous) setIsDetecting(true);
      setWebcamError(null);

      const rawImageData = webcamRef.current.getScreenshot();
      if (!rawImageData) {
        throw new Error('No se pudo capturar la imagen');
      }

      // Check cache first
      const imageHash = btoa(rawImageData.slice(-100));
      if (isContinuous && detectionCacheRef.current.has(imageHash)) {
        const cachedResult = detectionCacheRef.current.get(imageHash);
        if (now - cachedResult.timestamp < 3000) {
          return cachedResult.detection;
        }
      }

      const optimizedImage = await optimizeImage(rawImageData);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/detection/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: optimizedImage,
          fast: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.status}`);
      }

      const result = await response.json();
      
      setDetectionStats(prev => ({
        total: prev.total + 1,
        successful: result.success ? prev.successful + 1 : prev.successful
      }));

      if (result.success && result.detection) {
        const detection = {
          label: result.detection.label,
          similarity: result.detection.similarity,
          confidence: result.detection.confidence || result.detection.similarity,
          timestamp: new Date().toISOString(),
          processingTime: result.detection.processingTime
        };

        if (isContinuous) {
          detectionCacheRef.current.set(imageHash, {
            detection,
            timestamp: now
          });
          
          if (detectionCacheRef.current.size > 10) {
            const oldestKey = detectionCacheRef.current.keys().next().value;
            detectionCacheRef.current.delete(oldestKey);
          }
        }

        setLastDetection(detection);

        if (detection.similarity >= 70) {
          const matchedProduct = findProductByDetection(detection.label);
          
          if (matchedProduct) {
            const stock = matchedProduct.cantidad || matchedProduct.stock || 0;
            if (stock > 0) {
              if (!isContinuous) {
                toast.success(`¡${detection.label} detectado! Agregando al carrito...`);
              }
              onProductDetected?.(matchedProduct, detection);
              return detection;
            } else {
              if (!isContinuous) {
                toast.warning(`${detection.label} detectado pero sin stock disponible`);
                setWebcamError(`Producto detectado: ${detection.label}, pero sin stock disponible`);
              }
            }
          } else {
            if (!isContinuous) {
              toast.warning(`${detection.label} detectado pero no encontrado en inventario`);
              setWebcamError(`Producto detectado: ${detection.label}, pero no está registrado en el sistema`);
            }
          }
        } else if (!isContinuous) {
          setWebcamError(`Detección poco confiable (${detection.similarity}%). Intente de nuevo con mejor iluminación.`);
        }
        
        return detection;
      } else if (!isContinuous) {
        setWebcamError('No se pudo detectar ningún producto. Intente de nuevo.');
      }
      
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Detection timeout');
        if (!isContinuous) setWebcamError('Detección cancelada por timeout');
      } else {
        console.error('Detection error:', error);
        if (!isContinuous) {
          setWebcamError('Error en la detección: ' + error.message);
          toast.error('Error en la detección');
        }
      }
      return null;
    } finally {
      if (!isContinuous) setIsDetecting(false);
    }
  }, [isWebcamActive, onProductDetected, products]);

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
    setIsContinuousMode(false);
    setLastDetection(null);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    detectionCacheRef.current.clear();
    toast.info('Cámara desactivada');
  }, []);

  // Handle webcam error
  const handleWebcamError = useCallback((error) => {
    console.error('Webcam error:', error);
    setWebcamError('Error de cámara: ' + error.message);
    setIsWebcamActive(false);
    toast.error('Error de cámara');
  }, []);

  // Toggle continuous detection mode
  const toggleContinuousMode = useCallback(() => {
    if (!isWebcamActive) {
      toast.warning('Primero activa la cámara');
      return;
    }

    const newContinuousMode = !isContinuousMode;
    setIsContinuousMode(newContinuousMode);

    if (newContinuousMode) {
      toast.info('Modo continuo activado - Detección automática cada 1.5s');
      detectionIntervalRef.current = setInterval(async () => {
        await performFastDetection(true);
      }, 1500);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      toast.info('Modo continuo desactivado');
    }
  }, [isWebcamActive, isContinuousMode, performFastDetection]);

  // Manual detection
  const captureAndDetect = useCallback(async () => {
    await performFastDetection(false);
  }, [performFastDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

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
                    <div className={`px-2 py-1 rounded small text-white ${
                      isContinuousMode ? 'bg-warning bg-opacity-90' : 
                      isDetecting ? 'bg-primary bg-opacity-90' : 
                      'bg-dark bg-opacity-75'
                    }`}>
                      {isContinuousMode ? '🔄 Continuo' : 
                       isDetecting ? 'Detectando...' : 
                       'Listo'}
                    </div>
                  </div>
                  {lastDetection && (
                    <div className="position-absolute top-0 end-0 p-2">
                      <div className={`text-white px-2 py-1 rounded small ${
                        lastDetection.similarity >= 80 ? 'bg-success bg-opacity-90' :
                        lastDetection.similarity >= 70 ? 'bg-warning bg-opacity-90' :
                        'bg-danger bg-opacity-90'
                      }`}>
                        {lastDetection.label} ({lastDetection.similarity}%)
                        {lastDetection.processingTime && (
                          <div className="small">{lastDetection.processingTime}ms</div>
                        )}
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
                    variant={isContinuousMode ? "warning" : "info"}
                    onClick={toggleContinuousMode}
                    disabled={loading}
                  >
                    {isContinuousMode ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Modo Continuo ON
                      </>
                    ) : (
                      <>
                        <FaSync className="me-2" />
                        Modo Continuo
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="success"
                    onClick={captureAndDetect}
                    disabled={isDetecting || loading || isContinuousMode}
                  >
                    {isDetecting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Detectando...
                      </>
                    ) : (
                      <>
                        <FaSync className="me-2" />
                        Detectar Una Vez
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

              {detectionStats.total > 0 && (
                <Card className="mb-3" size="sm">
                  <Card.Header className="py-2">
                    <small>Estadísticas</small>
                  </Card.Header>
                  <Card.Body className="py-2">
                    <p className="mb-1 small">
                      <strong>Total:</strong> {detectionStats.total}
                    </p>
                    <p className="mb-1 small">
                      <strong>Exitosas:</strong> {detectionStats.successful}
                    </p>
                    <p className="mb-0 small">
                      <strong>Precisión:</strong> {detectionStats.total > 0 ? Math.round((detectionStats.successful / detectionStats.total) * 100) : 0}%
                    </p>
                  </Card.Body>
                </Card>
              )}

              <div className="instructions">
                <h6 className="small">Productos Detectables:</h6>
                <ul className="small text-muted mb-2">
                  <li>Barrita</li>
                  <li>Botella</li>
                  <li>Chicle</li>
                </ul>
                
                <div className="performance-tips">
                  <h6 className="small">⚡ Modo Rápido:</h6>
                  <ul className="small text-muted mb-0">
                    <li>Detección continua cada 1.5s</li>
                    <li>Cache inteligente</li>
                    <li>Imágenes optimizadas</li>
                    <li>Timeout de 5s</li>
                  </ul>
                </div>
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