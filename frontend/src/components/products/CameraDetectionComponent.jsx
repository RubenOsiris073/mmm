import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaCamera, FaStop, FaSync } from 'react-icons/fa';

const CameraDetectionComponent = ({ onDetectionResult, onError, loading }) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize webcam
  const startWebcam = useCallback(async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsWebcamActive(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setWebcamError('No se pudo acceder a la cámara. Verifique los permisos.');
      onError?.('Error accessing camera: ' + error.message);
    }
  }, [onError]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  }, []);

  // Capture frame and send for detection
  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !isWebcamActive) {
      onError?.('Camera not ready');
      return;
    }

    try {
      setIsDetecting(true);
      setWebcamError(null);

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('Sending image for detection...');
      
      // Send to backend for detection
      const response = await fetch('/api/detection/detect', {
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
          onDetectionResult?.(detection);
        } else {
          setWebcamError(`Detección poco confiable (${detection.similarity}%). Intente de nuevo con mejor iluminación.`);
        }
      } else {
        setWebcamError('No se pudo detectar ningún producto. Intente de nuevo.');
      }
    } catch (error) {
      console.error('Detection error:', error);
      setWebcamError('Error en la detección: ' + error.message);
      onError?.('Detection error: ' + error.message);
    } finally {
      setIsDetecting(false);
    }
  }, [isWebcamActive, onDetectionResult, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return (
    <Card>
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="camera-container">
              {!isWebcamActive ? (
                <div className="text-center py-5 bg-light rounded">
                  <FaCamera size={64} className="text-muted mb-3" />
                  <p className="text-muted">Presione "Activar Cámara" para detectar productos</p>
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
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 rounded"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 start-0 p-2">
                    <div className="bg-dark bg-opacity-75 text-white px-2 py-1 rounded">
                      {isDetecting ? 'Detectando...' : 'Listo para detectar'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>
          
          <Col md={4}>
            <div className="controls-panel">
              <h6>Controles</h6>
              
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
                <Card className="mb-3">
                  <Card.Header>
                    <small>Última Detección</small>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-1">
                      <strong>Producto:</strong> {lastDetection.label}
                    </p>
                    <p className="mb-1">
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
                <h6>Instrucciones:</h6>
                <ul className="small text-muted">
                  <li>Coloque el producto frente a la cámara</li>
                  <li>Asegúrese de tener buena iluminación</li>
                  <li>El producto debe estar centrado y visible</li>
                  <li>Presione "Detectar Producto" cuando esté listo</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>

        {webcamError && (
          <Alert variant="warning" className="mt-3">
            {webcamError}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default CameraDetectionComponent;