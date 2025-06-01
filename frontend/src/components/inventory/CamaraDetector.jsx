import React, { useRef, useEffect, useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const DetectionCamera = ({ onDetection }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;

    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error accediendo a la cámara:', err);
        setError('No se pudo acceder a la cámara');
        setLoading(false);
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const detectObjects = async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    try {
      // Aquí irá la lógica de detección con TensorFlow
      // Por ahora simulamos una detección
      const detectedObject = {
        label: 'Producto de prueba',
        confidence: 0.95
      };

      onDetection(detectedObject);
    } catch (err) {
      console.error('Error en la detección:', err);
    }
  };

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(detectObjects, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Inicializando cámara...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center text-danger">
          <p>{error}</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="position-relative">
          <video
            ref={videoRef}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            playsInline
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </div>
        <div className="mt-3 text-center">
          <Button
            variant={isActive ? "danger" : "primary"}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Detener Detección' : 'Iniciar Detección'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DetectionCamera;