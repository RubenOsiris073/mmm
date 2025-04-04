import React, { useEffect } from 'react';

const Camera = ({ videoRef }) => {
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <video
      ref={videoRef}
      style={{
        width: '100%',
        maxHeight: '70vh',
        objectFit: 'contain',
        backgroundColor: '#000'
      }}
      autoPlay
      playsInline
      muted
    />
  );
};

export default Camera;