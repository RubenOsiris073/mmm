import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import Camera from '../shared/Camera';
import PredictionDisplay from './PredictionDisplay';
import { logPrediction } from '../../services/detectionService';
import { processFrame } from '../../services/apiService';

const ObjectDetection = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState({ label: '', similarity: 0 });
  const [isDetecting, setIsDetecting] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const isRunning = useRef(true);

  const captureFrame = async () => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const detectFrame = async () => {
    if (!isRunning.current || !isDetecting) {
      return;
    }

    try {
      // Capturar frame
      const frameData = await captureFrame();
      if (!frameData) return;

      // Enviar al backend para procesamiento
      const result = await processFrame(frameData);

      if (result.success && result.prediction) {
        const { label, similarity } = result.prediction;
        
        // Actualizar solo si hay cambios significativos
        if (prediction.label !== label || 
            Math.abs(prediction.similarity - parseFloat(similarity)) > 5) {
          console.log(`🎯 Detectado: ${label} (${similarity}%)`);
          setPrediction({ 
            label, 
            similarity: parseFloat(similarity) 
          });

          if (parseFloat(similarity) > 60) {
            await logPrediction(label, similarity);
          }
        }
      }
    } catch (err) {
      console.error("Error en detección:", err);
      setError("Error en la detección. Reintentando...");
    } finally {
      if (isRunning.current && isDetecting) {
        rafRef.current = requestAnimationFrame(detectFrame);
      }
    }
  };

  useEffect(() => {
    if (isDetecting && !rafRef.current) {
      console.log("▶️ Iniciando detección");
      isRunning.current = true;
      detectFrame();
    } else if (!isDetecting && rafRef.current) {
      console.log("⏸️ Pausando detección");
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [isDetecting]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isRunning.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div className="object-detection">
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <div className="position-relative">
                <Camera videoRef={videoRef} />
                {loading && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                )}
              </div>
              <PredictionDisplay 
                loading={loading} 
                label={prediction.label} 
                similarity={prediction.similarity} 
              />
              <div className="mt-3">
                <Button 
                  variant={isDetecting ? "danger" : "success"} 
                  onClick={() => setIsDetecting(prev => !prev)}
                  className="w-100"
                >
                  {isDetecting ? "⏸️ Pausar Detección" : "▶️ Reanudar Detección"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Detalles de la Detección</h4>
            </Card.Header>
            <Card.Body>
              {prediction.label && (
                <div>
                  <strong>Última detección:</strong>{' '}
                  {prediction.label} ({prediction.similarity}% de confianza)
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ObjectDetection;