import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import Webcam from 'react-webcam';

const ProductDetectionPanel = ({
  webcamRef,
  isWebcamReady,
  continuousDetection,
  setContinuousDetection,
  lastDetection,
  detectionLoading,
  captureFrame,
  detectFromImage,
  addDetectedProductToCart
}) => {
  const [timer, setTimer] = useState(null);
  
  // Manejar detección continua
  useEffect(() => {
    if (continuousDetection && isWebcamReady) {
      const interval = setInterval(async () => {
        const frame = await captureFrame();
        if (frame) {
          const detection = await detectFromImage(frame);
          
          if (detection && detection.productInfo) {
            addDetectedProductToCart(detection.label, detection.productInfo);
          }
        }
      }, 2000); // Cada 2 segundos
      
      setTimer(interval);
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [continuousDetection, isWebcamReady, captureFrame, detectFromImage, addDetectedProductToCart, timer]);
  
  // Manejar detección manual
  const handleDetect = useCallback(async () => {
    try {
      const frame = await captureFrame();
      if (frame) {
        const detection = await detectFromImage(frame);
        
        if (detection && detection.productInfo) {
          addDetectedProductToCart(detection.label, detection.productInfo);
        }
      }
    } catch (error) {
      console.error("Error en detección manual:", error);
    }
  }, [captureFrame, detectFromImage, addDetectedProductToCart]);
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Detección de Productos</h5>
      </Card.Header>
      <Card.Body>
        <div className="webcam-container mb-3">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "environment",
              width: 640,
              height: 480
            }}
            className="webcam"
            style={{ width: '100%', borderRadius: '4px' }}
            onUserMedia={() => console.log("Webcam conectada")}
            onUserMediaError={(err) => console.error("Error de webcam:", err)}
          />
          
          {!isWebcamReady && (
            <div className="webcam-overlay">
              <Spinner animation="border" />
              <p>Inicializando cámara...</p>
            </div>
          )}
        </div>
        
        <Row>
          <Col>
            <Button
              variant="primary"
              className="w-100 mb-3"
              onClick={handleDetect}
              disabled={!isWebcamReady || detectionLoading}
            >
              {detectionLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Detectando...
                </>
              ) : (
                'Detectar Producto'
              )}
            </Button>
          </Col>
          <Col>
            <Button
              variant={continuousDetection ? "danger" : "outline-primary"}
              className="w-100 mb-3"
              onClick={() => setContinuousDetection(!continuousDetection)}
              disabled={!isWebcamReady || detectionLoading}
            >
              {continuousDetection ? 'Detener Detección' : 'Detección Continua'}
            </Button>
          </Col>
        </Row>
        
        {lastDetection && (
          <Card className="mt-3 border-primary">
            <Card.Header>Última Detección</Card.Header>
            <Card.Body>
              <p><strong>Producto:</strong> {lastDetection.label}</p>
              <p><strong>Confianza:</strong> {lastDetection.similarity.toFixed(1)}%</p>
              
              {lastDetection.productInfo ? (
                <>
                  <p className="text-success">✅ Producto encontrado en inventario</p>
                  <Button
                    variant="success"
                    size="sm"
                    className="mt-2"
                    onClick={() => addDetectedProductToCart(
                      lastDetection.label,
                      lastDetection.productInfo
                    )}
                  >
                    Añadir al Carrito
                  </Button>
                </>
              ) : (
                <p className="text-danger">❌ Producto no encontrado en inventario</p>
              )}
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductDetectionPanel;