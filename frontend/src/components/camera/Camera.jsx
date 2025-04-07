import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const Camera = React.forwardRef(({ onReady, ...props }, ref) => {
  const [isReady, setIsReady] = useState(false);
  const internalRef = useRef(null);
  
  // Combinar refs para compatibilidad
  const webcamRef = ref || internalRef;
  
  // Verificar si la cámara está lista
  useEffect(() => {
    const checkCameraReady = () => {
      const videoElement = webcamRef.current?.video;
      if (
        videoElement && 
        videoElement.readyState === 4 &&
        videoElement.videoWidth > 0 &&
        videoElement.videoHeight > 0
      ) {
        setIsReady(true);
        if (onReady) onReady(webcamRef.current);
        return true;
      }
      return false;
    };
    
    if (!isReady) {
      const intervalId = setInterval(() => {
        if (checkCameraReady()) {
          clearInterval(intervalId);
        }
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [webcamRef, onReady, isReady]);

  return (
    <div className="camera-container">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: props.facingMode || "environment",
        }}
        {...props}
      />
      {!isReady && (
        <div className="camera-loading-indicator">
          <p>Iniciando cámara...</p>
        </div>
      )}
    </div>
  );
});

Camera.displayName = 'Camera';

export default Camera;