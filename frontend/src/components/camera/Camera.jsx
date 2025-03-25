import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const Camera = ({ videoRef }) => {
  const [error, setError] = React.useState(null);

  useEffect(() => {
    let stream = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        setError("No se pudo acceder a la cámara. Verifica los permisos.");
      }
    }
    
    setupCamera();
    
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <div className="camera-container">
      {error && <Alert variant="danger">{error}</Alert>}
      <video 
        ref={videoRef}
        width="100%" 
        height="auto"
        autoPlay 
        playsInline 
        muted
        style={{ 
          borderRadius: '8px', 
          marginBottom: '15px',
          maxHeight: '60vh',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

export default Camera;