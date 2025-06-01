import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';

const Camera = ({ videoRef, className = "" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;

    const setupCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error accediendo a la cámara:', err);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
        setIsLoading(false);
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" />
        <p className="mt-2">Inicializando cámara...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  return (
    <video
      ref={videoRef}
      className={`w-100 ${className}`}
      style={{ maxHeight: '400px', objectFit: 'cover' }}
      playsInline
      muted
    />
  );
};

export default Camera;